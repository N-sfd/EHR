package com.ehr.staffservice.ai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiDocumentChunkStore {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public AiDocumentChunkStore(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public int deleteBySource(String sourceType, String baseSourceRef) {
        String likePattern = escapeLike(baseSourceRef) + ":%";
        String sql = "DELETE FROM ai_document_chunk WHERE source_type = ? "
                + "AND (source_ref = ? OR source_ref LIKE ? ESCAPE '\\')";
        return jdbcTemplate.update(sql, sourceType, baseSourceRef, likePattern);
    }

    private static String escapeLike(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    public void insertChunk(
            UUID id,
            String sourceType,
            String sourceRef,
            Long patientId,
            String title,
            String chunkText,
            float[] embedding,
            String audience,
            String portal,
            Long departmentId,
            LocalDate effectiveDate,
            String status,
            int contentVersion,
            int chunkIndex,
            String baseSourceRef,
            List<String> tags
    ) throws Exception {
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("chunkIndex", chunkIndex);
        meta.put("baseSourceRef", baseSourceRef);
        if (tags != null && !tags.isEmpty()) {
            meta.put("tags", tags);
        }
        String metaJson = objectMapper.writeValueAsString(meta);
        String vectorLiteral = toPgVectorLiteral(embedding);
        String sql = "INSERT INTO ai_document_chunk ("
                + "id, source_type, source_ref, patient_id, title, chunk_text, metadata_json, "
                + "embedding, audience, portal, department_id, effective_date, status, content_version, created_at"
                + ") VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?::vector, ?, ?, ?, ?, ?, ?, NOW())";
        jdbcTemplate.update(sql,
                id.toString(),
                sourceType,
                sourceRef,
                patientId,
                title,
                chunkText,
                metaJson,
                vectorLiteral,
                audience,
                portal,
                departmentId,
                effectiveDate != null ? Date.valueOf(effectiveDate) : null,
                status,
                contentVersion
        );
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
