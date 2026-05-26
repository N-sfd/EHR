package com.ehr.staffservice.ai.it;

import com.ehr.staffservice.ai.chunk.AiTextChunker;
import com.ehr.staffservice.ai.dto.KnowledgeIngestRequest;
import com.ehr.staffservice.ai.repository.AiDocumentChunkStore;
import com.ehr.staffservice.ai.service.AiKnowledgeIngestService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.web.server.ResponseStatusException;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@Testcontainers(disabledWithoutDocker = true)
class AiKnowledgeIngestIntegrationTest {

    private static final DockerImageName PGVECTOR = DockerImageName.parse("pgvector/pgvector:pg16")
            .asCompatibleSubstituteFor("postgres");

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(PGVECTOR);

    private JdbcTemplate jdbc;
    private AiKnowledgeIngestService ingestService;

    @BeforeEach
    void setUp() {
        DriverManagerDataSource ds = new DriverManagerDataSource(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        jdbc = new JdbcTemplate(ds);
        jdbc.execute("CREATE EXTENSION IF NOT EXISTS vector");
        jdbc.execute("DROP TABLE IF EXISTS ai_document_chunk");
        jdbc.execute("""
                CREATE TABLE ai_document_chunk (
                    id UUID PRIMARY KEY,
                    source_type VARCHAR(64) NOT NULL,
                    source_ref VARCHAR(128) NOT NULL,
                    patient_id BIGINT NULL,
                    title VARCHAR(255),
                    chunk_text TEXT NOT NULL,
                    metadata_json JSONB,
                    embedding VECTOR(1536),
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    audience VARCHAR(16) NOT NULL DEFAULT 'BOTH',
                    portal VARCHAR(16) NOT NULL DEFAULT 'BOTH',
                    department_id BIGINT NULL,
                    effective_date DATE NULL,
                    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
                    content_version INT NOT NULL DEFAULT 1
                )
                """);

        float[] z = new float[1536];
        EmbeddingModel model = mock(EmbeddingModel.class);
        when(model.embed(anyString())).thenReturn(z);
        @SuppressWarnings("unchecked")
        ObjectProvider<EmbeddingModel> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(model);

        ObjectMapper objectMapper = new ObjectMapper();
        AiDocumentChunkStore store = new AiDocumentChunkStore(jdbc, objectMapper);
        ingestService = new AiKnowledgeIngestService(new AiTextChunker(), store, provider);
    }

    @Test
    void replaceExistingRemovesPriorChunksForSource() {
        KnowledgeIngestRequest first = baseRequest();
        first.setSourceRef("copay-basics");
        first.setBody(longRepeatedParagraph("First version.", 120));
        first.setReplaceExisting(true);
        ingestService.ingest(first);
        int countFirst = countChunks("FAQ", "copay-basics");
        assertTrue(countFirst >= 1);

        KnowledgeIngestRequest second = baseRequest();
        second.setSourceRef("copay-basics");
        second.setBody(longRepeatedParagraph("Second version only.", 120));
        second.setReplaceExisting(true);
        ingestService.ingest(second);

        long distinctBodies = jdbc.queryForObject(
                """
                        SELECT COUNT(DISTINCT chunk_text) FROM ai_document_chunk
                        WHERE source_type = 'FAQ' AND source_ref LIKE 'copay-basics:%'
                        """, Long.class);
        assertEquals(1L, distinctBodies);
    }

    @Test
    void chunkCountStableForSameBody() {
        KnowledgeIngestRequest a = baseRequest();
        a.setSourceRef("stable-a");
        a.setBody(longRepeatedParagraph("Same body.", 200));
        a.setReplaceExisting(true);
        int n1 = ingestService.ingest(a).getChunksWritten();

        KnowledgeIngestRequest b = baseRequest();
        b.setSourceRef("stable-b");
        b.setBody(longRepeatedParagraph("Same body.", 200));
        b.setReplaceExisting(true);
        int n2 = ingestService.ingest(b).getChunksWritten();
        assertEquals(n1, n2);
    }

    @Test
    void tagsPersistInMetadataJson() throws Exception {
        KnowledgeIngestRequest req = baseRequest();
        req.setSourceRef("tagged-doc");
        req.setBody(longRepeatedParagraph("Tagged content.", 120));
        req.setTags(List.of("billing", "copay"));
        req.setReplaceExisting(true);
        ingestService.ingest(req);

        String json = jdbc.queryForObject(
                "SELECT metadata_json::text FROM ai_document_chunk WHERE source_ref LIKE 'tagged-doc:%' LIMIT 1",
                String.class);
        JsonNode node = new ObjectMapper().readTree(json);
        assertTrue(node.has("tags"));
        assertEquals("billing", node.get("tags").get(0).asText());
    }

    @Test
    void blankBodyRejected() {
        KnowledgeIngestRequest req = baseRequest();
        req.setBody("   ");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> ingestService.ingest(req));
        assertEquals(400, ex.getStatusCode().value());
    }

    private static KnowledgeIngestRequest baseRequest() {
        KnowledgeIngestRequest r = new KnowledgeIngestRequest();
        r.setSourceType("FAQ");
        r.setSourceRef("default-ref");
        r.setTitle("t");
        r.setAudience(KnowledgeIngestRequest.Audience.PATIENT);
        r.setPortal(KnowledgeIngestRequest.Portal.MYCHART);
        r.setStatus("ACTIVE");
        r.setReplaceExisting(true);
        return r;
    }

    private static String longRepeatedParagraph(String line, int minChars) {
        StringBuilder sb = new StringBuilder();
        while (sb.length() < minChars) {
            sb.append(line).append("\n\n");
        }
        return sb.toString();
    }

    private int countChunks(String sourceType, String baseRef) {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM ai_document_chunk WHERE source_type = ? AND (source_ref = ? OR source_ref LIKE ?)",
                Integer.class,
                sourceType,
                baseRef,
                baseRef + ":%"
        );
    }
}
