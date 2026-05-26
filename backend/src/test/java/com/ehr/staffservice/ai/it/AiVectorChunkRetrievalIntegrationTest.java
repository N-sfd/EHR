package com.ehr.staffservice.ai.it;

import com.ehr.staffservice.ai.service.AiVectorChunkSearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Retrieval layer: same predicates as {@link AiVectorChunkSearchService#VECTOR_CHUNK_FILTER_SQL} against real pgvector.
 */
@Testcontainers(disabledWithoutDocker = true)
class AiVectorChunkRetrievalIntegrationTest {

    private static final DockerImageName PGVECTOR = DockerImageName.parse("pgvector/pgvector:pg16")
            .asCompatibleSubstituteFor("postgres");

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(PGVECTOR);

    private JdbcTemplate jdbc;

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
    }

    @Test
    void filterExcludesWrongPortalAudienceInactiveFutureAndOtherPatient() {
        float[] z = zeroVector(1536);
        String vec = toPgVectorLiteral(z);
        insert("ok_global", "BOTH", "BOTH", null, "ACTIVE", null, vec);
        insert("ok_mychart_patient", "MYCHART", "PATIENT", null, "ACTIVE", null, vec);
        insert("wrong_portal", "ADMIN", "PATIENT", null, "ACTIVE", null, vec);
        insert("wrong_audience", "MYCHART", "STAFF", null, "ACTIVE", null, vec);
        insert("inactive", "MYCHART", "PATIENT", null, "ARCHIVED", null, vec);
        insert("future_eff", "MYCHART", "PATIENT", null, "ACTIVE", Date.valueOf(LocalDate.now().plusDays(30)), vec);
        insert("other_patient", "MYCHART", "PATIENT", 999L, "ACTIVE", null, vec);
        insert("this_patient", "MYCHART", "PATIENT", 100L, "ACTIVE", null, vec);

        String sql = "SELECT source_ref FROM ai_document_chunk WHERE "
                + AiVectorChunkSearchService.VECTOR_CHUNK_FILTER_SQL
                + "ORDER BY source_ref";
        List<String> refs = jdbc.query(sql, (rs, i) -> rs.getString(1),
                "MYCHART", "PATIENT", 100L);

        Set<String> expected = Set.of("ok_global", "ok_mychart_patient", "this_patient");
        assertEquals(expected, new HashSet<>(refs));
    }

    @Test
    void searchHitsReturnsSnippetAndCitationWhenRowMatches() {
        float[] z = zeroVector(1536);
        insert("faq_hit", "MYCHART", "PATIENT", null, "ACTIVE", null, toPgVectorLiteral(z));

        EmbeddingModel model = mock(EmbeddingModel.class);
        when(model.embed(anyString())).thenReturn(z);
        @SuppressWarnings("unchecked")
        ObjectProvider<EmbeddingModel> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(model);

        AiVectorChunkSearchService svc = new AiVectorChunkSearchService(jdbc, provider);
        var hits = svc.searchHits(100L, "copay question", 5, "MYCHART");
        assertFalse(hits.snippets().isEmpty());
        assertTrue(hits.snippets().getFirst().contains("faq_hit") || hits.snippets().getFirst().contains("FAQ"));
        assertFalse(hits.citations().isEmpty());
        assertEquals("FAQ", hits.citations().getFirst().getType());
    }

    private void insert(String sourceRef, String portal, String audience, Long patientId,
                        String status, Date effectiveDate, String vectorLiteral) {
        jdbc.update(
                """
                        INSERT INTO ai_document_chunk (
                          id, source_type, source_ref, patient_id, title, chunk_text, metadata_json,
                          embedding, audience, portal, department_id, effective_date, status, content_version
                        ) VALUES (?, 'FAQ', ?, ?, 't', 'body', '{}'::jsonb, ?::vector, ?, ?, NULL, ?, ?, 1)
                        """,
                UUID.randomUUID().toString(),
                sourceRef,
                patientId,
                vectorLiteral,
                audience,
                portal,
                effectiveDate,
                status
        );
    }

    private static float[] zeroVector(int dim) {
        float[] v = new float[dim];
        Arrays.fill(v, 0f);
        return v;
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
