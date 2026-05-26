package com.ehr.staffservice.ai.service;

import com.ehr.staffservice.ai.dto.AiDtos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Cosine search over {@code ai_document_chunk.embedding} when an {@link org.springframework.ai.embedding.EmbeddingModel} is available.
 * Filters by status, portal, audience, and patient scope (global chunks have {@code patient_id IS NULL}).
 */
@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiVectorChunkSearchService {

    /**
     * Row predicates for vector retrieval (portal/audience params are JDBC ? placeholders in order:
     * portal filter value, audience filter value, patient id). Kept in one place for tests and runtime.
     */
    public static final String VECTOR_CHUNK_FILTER_SQL = ""
            + "embedding IS NOT NULL "
            + "AND status = 'ACTIVE' "
            + "AND (effective_date IS NULL OR effective_date <= CURRENT_DATE) "
            + "AND (portal = 'BOTH' OR portal = ?) "
            + "AND (audience = 'BOTH' OR audience = ?) "
            + "AND (patient_id IS NULL OR patient_id = ?) ";

    public record VectorSearchHits(List<String> snippets, List<AiDtos.AiCitationDto> citations) {
    }

    private static final Logger log = LoggerFactory.getLogger(AiVectorChunkSearchService.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectProvider<org.springframework.ai.embedding.EmbeddingModel> embeddingModel;

    public AiVectorChunkSearchService(JdbcTemplate jdbcTemplate,
                                      ObjectProvider<org.springframework.ai.embedding.EmbeddingModel> embeddingModel) {
        this.jdbcTemplate = jdbcTemplate;
        this.embeddingModel = embeddingModel;
    }

    /**
     * One embedding + one DB round-trip for snippets and citations.
     */
    public VectorSearchHits searchHits(Long patientId, String queryText, int limit, String chatPortal) {
        var model = embeddingModel.getIfAvailable();
        if (model == null || queryText == null || queryText.isBlank() || patientId == null) {
            return new VectorSearchHits(List.of(), List.of());
        }
        try {
            float[] vector = model.embed(queryText);
            String literal = toPgVectorLiteral(vector);
            String portalFilter = portalFilterValue(chatPortal);
            String audienceFilter = audienceFilterValue(chatPortal);
            String sql = "SELECT source_type, source_ref, COALESCE(title, '') AS title, chunk_text "
                    + "FROM ai_document_chunk "
                    + "WHERE " + VECTOR_CHUNK_FILTER_SQL
                    + "ORDER BY embedding <=> ?::vector "
                    + "LIMIT ?";
            List<String> snippets = new ArrayList<>();
            List<AiDtos.AiCitationDto> citations = new ArrayList<>();
            jdbcTemplate.query(sql, rs -> {
                String type = rs.getString("source_type");
                String ref = rs.getString("source_ref");
                String title = rs.getString("title");
                String chunk = rs.getString("chunk_text");
                snippets.add("[vector:" + type + "/" + ref + (title.isBlank() ? "" : " " + title) + "] " + chunk);
                String label = (title != null && !title.isBlank()) ? title : (type + " " + ref);
                citations.add(new AiDtos.AiCitationDto(type, ref, label + " — " + truncate(chunk, 120)));
            }, portalFilter, audienceFilter, patientId, literal, limit);
            return new VectorSearchHits(snippets, citations);
        } catch (Exception e) {
            log.debug("Vector chunk search skipped: {}", e.toString());
            return new VectorSearchHits(List.of(), List.of());
        }
    }

    /** Chat portal {@code MYCHART} vs {@code STAFF} maps to stored {@code MYCHART} / {@code ADMIN} rows. */
    static String portalFilterValue(String chatPortal) {
        if (chatPortal != null && chatPortal.toUpperCase().contains("MYCHART")) {
            return "MYCHART";
        }
        return "ADMIN";
    }

    static String audienceFilterValue(String chatPortal) {
        if (chatPortal != null && chatPortal.toUpperCase().contains("MYCHART")) {
            return "PATIENT";
        }
        return "STAFF";
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        String t = s.replace('\n', ' ').trim();
        return t.length() <= max ? t : t.substring(0, max) + "…";
    }

    private static String toPgVectorLiteral(float[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(v[i]);
        }
        sb.append(']');
        return sb.toString();
    }
}
