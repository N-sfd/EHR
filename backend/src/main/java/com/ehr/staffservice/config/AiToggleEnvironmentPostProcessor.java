package com.ehr.staffservice.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Single-switch AI toggle: when {@code ehr.ai.enabled} is false, excludes Spring AI auto-configurations
 * so the app starts without credentials.
 * <p>
 * When {@code ehr.ai.enabled} is true but OpenAI is not configured, the same exclusions apply and
 * {@code ehr.ai.enabled} / {@code app.ai.enabled} are forced false — except when {@code ehr.ai.ollama}
 * is true (or {@code spring.ai.openai.base-url} points at an Ollama OpenAI-compatible endpoint): then a
 * dummy {@code spring.ai.openai.api-key} is supplied and the base URL is set to {@code …/v1} so the
 * existing Spring AI OpenAI client talks to Ollama (no cloud API key).
 * <p>
 * Turn AI on with {@code EHR_AI_ENABLED=true} (or legacy {@code APP_AI_ENABLED=true}) and either
 * {@code OPENAI_API_KEY} for OpenAI, or {@code EHR_AI_OLLAMA=true} for local Ollama.
 * <p>
 * Registered in {@code META-INF/spring.factories} under {@code org.springframework.boot.env.EnvironmentPostProcessor}.
 */
public class AiToggleEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(AiToggleEnvironmentPostProcessor.class);

    public static final String PROPERTY_EHR_AI_ENABLED = "ehr.ai.enabled";

    public static final String PROPERTY_EHR_AI_OLLAMA = "ehr.ai.ollama";

    public static final String PROPERTY_EHR_AI_OLLAMA_EMBEDDING = "ehr.ai.ollama-embedding";

    public static final String PROPERTY_SOURCE_NAME = "ehrAiAutoconfigureExclusions";

    private static final String PROPERTY_SOURCE_OLLAMA_COMPAT = "ehrAiOllamaOpenAiCompat";

    private static final List<String> AI_AUTOCONFIGURE_EXCLUDES = List.of(
            "org.springframework.ai.model.openai.autoconfigure.OpenAiChatAutoConfiguration",
            "org.springframework.ai.model.openai.autoconfigure.OpenAiEmbeddingAutoConfiguration",
            "org.springframework.ai.model.openai.autoconfigure.OpenAiImageAutoConfiguration",
            "org.springframework.ai.model.openai.autoconfigure.OpenAiModerationAutoConfiguration",
            "org.springframework.ai.model.openai.autoconfigure.OpenAiAudioSpeechAutoConfiguration",
            "org.springframework.ai.model.openai.autoconfigure.OpenAiAudioTranscriptionAutoConfiguration",
            "org.springframework.ai.vectorstore.pgvector.autoconfigure.PgVectorStoreAutoConfiguration"
    );

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        boolean wantsAi = isAiEnabled(environment);
        if (wantsAi) {
            applyOllamaOpenAiCompatIfNeeded(environment);
        }
        if (!wantsAi) {
            log.debug("ehr.ai.enabled is false; excluding Spring AI auto-configuration.");
            applyAiAutoconfigureExclusions(environment, false);
            return;
        }
        if (!hasOpenAiApiKey(environment)) {
            log.warn("{} is true but neither OPENAI_API_KEY nor Ollama compatibility (EHR_AI_OLLAMA / base-url) is configured; "
                            + "disabling Spring AI auto-configuration so the application can start.",
                    PROPERTY_EHR_AI_ENABLED);
            applyAiAutoconfigureExclusions(environment, true);
        }
    }

    /**
     * When using Ollama’s OpenAI-compatible HTTP API, Spring AI still requires a non-blank api-key property;
     * Ollama ignores the value. Optionally disable embeddings (dimension mismatch vs VECTOR(1536) in DB).
     */
    private static void applyOllamaOpenAiCompatIfNeeded(ConfigurableEnvironment env) {
        boolean ollamaFlag = Boolean.TRUE.equals(env.getProperty(PROPERTY_EHR_AI_OLLAMA, Boolean.class, false));
        boolean looksLikeOllamaEndpoint = looksLikeOllamaOpenAiEndpoint(env);
        if (!ollamaFlag && !looksLikeOllamaEndpoint) {
            return;
        }

        Map<String, Object> map = new LinkedHashMap<>();
        if (ollamaFlag) {
            // Spring AI's OpenAI client appends "/v1/chat/completions" and "/v1/embeddings" to the base URL
            // itself, so the base URL must be the server ROOT (no trailing /v1) — otherwise requests go to
            // ".../v1/v1/chat/completions" and Ollama returns 404.
            map.put("spring.ai.openai.base-url", normalizeOllamaBaseUrl(env.getProperty("OLLAMA_BASE_URL", "http://localhost:11434")));
        }
        if (!hasNonEmptyResolvedKey(env.getProperty("spring.ai.openai.api-key"))) {
            map.put("spring.ai.openai.api-key", env.getProperty("OLLAMA_OPENAI_API_KEY_PLACEHOLDER", "ollama"));
        }
        if (ollamaFlag && !Boolean.TRUE.equals(env.getProperty(PROPERTY_EHR_AI_OLLAMA_EMBEDDING, Boolean.class, false))) {
            // Ollama does not serve OpenAI's "text-embedding-3-small", so embeddings are turned off by
            // excluding the embedding auto-config. The pgvector store auto-config must be excluded too,
            // because it requires an EmbeddingModel bean and would otherwise fail startup. RAG vector search
            // then degrades gracefully (AiVectorChunkSearchService skips when no EmbeddingModel is present).
            String existing = env.getProperty("spring.autoconfigure.exclude");
            String excludes = String.join(",",
                    "org.springframework.ai.model.openai.autoconfigure.OpenAiEmbeddingAutoConfiguration",
                    "org.springframework.ai.vectorstore.pgvector.autoconfigure.PgVectorStoreAutoConfiguration");
            map.put("spring.autoconfigure.exclude",
                    StringUtils.hasText(existing) ? existing + "," + excludes : excludes);
        }
        if (ollamaFlag) {
            map.put("spring.ai.openai.chat.options.model", env.getProperty("OLLAMA_CHAT_MODEL", "llama3"));
        }

        if (!map.isEmpty()) {
            env.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_OLLAMA_COMPAT, map));
            log.info("Ollama OpenAI-compatible client: {} (dummy api-key; embeddings {}).",
                    ollamaFlag ? "EHR_AI_OLLAMA=true — base-url from OLLAMA_BASE_URL" : "dummy api-key for Ollama-like base-url",
                    Boolean.TRUE.equals(env.getProperty(PROPERTY_EHR_AI_OLLAMA_EMBEDDING, Boolean.class, false))
                            ? "enabled — model dims must match VECTOR(1536)"
                            : "disabled for pgvector safety (1536)");
        }
    }

    /**
     * Returns the Ollama server root (scheme://host:port) with any trailing slash or {@code /v1} removed,
     * because Spring AI's OpenAI client appends the {@code /v1/...} path segment itself.
     */
    static String normalizeOllamaBaseUrl(String hostOrUrl) {
        String b = hostOrUrl.trim();
        while (b.endsWith("/")) {
            b = b.substring(0, b.length() - 1);
        }
        if (b.endsWith("/v1")) {
            b = b.substring(0, b.length() - "/v1".length());
        }
        while (b.endsWith("/")) {
            b = b.substring(0, b.length() - 1);
        }
        return b;
    }

    private static boolean looksLikeOllamaOpenAiEndpoint(ConfigurableEnvironment env) {
        String u = env.getProperty("spring.ai.openai.base-url");
        if (!hasNonEmptyResolvedKey(u)) {
            return false;
        }
        // Redundant explicit guard to satisfy nullability analysis.
        if (u == null) {
            return false;
        }
        String lower = u.toLowerCase();
        return lower.contains(":11434") || lower.contains("ollama");
    }

    private static void applyAiAutoconfigureExclusions(ConfigurableEnvironment environment, boolean forceAiFlagsOff) {
        String joined = String.join(",", AI_AUTOCONFIGURE_EXCLUDES);
        String existing = environment.getProperty("spring.autoconfigure.exclude");
        if (StringUtils.hasText(existing)) {
            joined = existing + "," + joined;
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("spring.autoconfigure.exclude", joined);
        if (forceAiFlagsOff) {
            map.put(PROPERTY_EHR_AI_ENABLED, false);
            map.put("app.ai.enabled", false);
        }
        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, map));
    }

    static boolean isAiEnabled(ConfigurableEnvironment environment) {
        return Boolean.TRUE.equals(environment.getProperty(PROPERTY_EHR_AI_ENABLED, Boolean.class));
    }

    /**
     * True if a usable OpenAI client can be built (real key, or Ollama compat dummy key injected above).
     */
    static boolean hasOpenAiApiKey(ConfigurableEnvironment environment) {
        if (hasNonEmptyResolvedKey(environment.getProperty("spring.ai.openai.api-key"))) {
            return true;
        }
        if (hasNonEmptyResolvedKey(environment.getProperty("spring.ai.openai.chat.api-key"))) {
            return true;
        }
        return hasNonEmptyResolvedKey(environment.getProperty("OPENAI_API_KEY"));
    }

    static boolean hasNonEmptyResolvedKey(String value) {
        return StringUtils.hasText(value) && !value.contains("${");
    }
}
