package com.ehr.staffservice.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.lang.NonNull;
import org.springframework.util.StringUtils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * One-time, opt-in database reset. When {@code EHR_DB_RESET_SCHEMA=true} (or
 * {@code ehr.db.reset-schema=true}), drops and recreates the {@code public} schema BEFORE
 * Hibernate generates the schema, so {@code ddl-auto=update} produces a clean, consistent
 * schema.
 * <p>
 * Use this once to recover a database left inconsistent by earlier, partially-applied
 * migrations (e.g. a legacy {@code patients.mrn NOT NULL} column that blocks inserts), then
 * set the flag back to {@code false} and redeploy.
 * <p>
 * <b>DANGER:</b> this deletes ALL data in the target database. Never enable it against a
 * database whose data you need to keep.
 * <p>
 * Runs as an {@link ApplicationContextInitializer} (registered in {@code META-INF/spring.factories})
 * so it executes after the environment is prepared but before any beans — including the
 * Hibernate {@code EntityManagerFactory} — are created.
 */
public class SchemaResetApplicationContextInitializer
        implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger log = LoggerFactory.getLogger(SchemaResetApplicationContextInitializer.class);

    @Override
    public void initialize(@NonNull ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment env = applicationContext.getEnvironment();

        boolean reset = env.getProperty("ehr.db.reset-schema", Boolean.class,
                Boolean.parseBoolean(env.getProperty("EHR_DB_RESET_SCHEMA", "false")));
        if (!reset) {
            return;
        }

        String url = env.getProperty("spring.datasource.url");
        String user = env.getProperty("spring.datasource.username");
        String pass = env.getProperty("spring.datasource.password");
        if (!StringUtils.hasText(url)) {
            log.warn("EHR_DB_RESET_SCHEMA=true but spring.datasource.url is not set; skipping schema reset.");
            return;
        }

        log.warn("=== EHR_DB_RESET_SCHEMA=true: dropping and recreating schema 'public'. ALL DATA WILL BE LOST. ===");
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement st = conn.createStatement()) {
            st.execute("DROP SCHEMA IF EXISTS public CASCADE");
            st.execute("CREATE SCHEMA public");
            // pgvector lives per-database; recreate so Spring AI's PgVectorStore works after reset.
            try {
                st.execute("CREATE EXTENSION IF NOT EXISTS vector");
            } catch (Exception ex) {
                log.warn("Could not create 'vector' extension (safe to ignore unless using AI embeddings): {}", ex.getMessage());
            }
            log.warn("=== Schema reset complete. Hibernate will now generate a fresh schema. "
                    + "Set EHR_DB_RESET_SCHEMA=false and redeploy so data is not wiped on the next restart. ===");
        } catch (Exception e) {
            throw new IllegalStateException("Schema reset (EHR_DB_RESET_SCHEMA) failed: " + e.getMessage(), e);
        }
    }
}
