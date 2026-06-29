package com.ehr.staffservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound from {@code ehr.ai.*} (Ollama vs cloud OpenAI, master AI switch).
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "ehr.ai")
public class EhrAiProperties {

    private boolean enabled = false;

    /** When true, Spring AI OpenAI client targets local Ollama ({@code /v1} compatibility). */
    private boolean ollama = false;

    /** When false with Ollama, embeddings / pgvector stay off (no 1536-dim model required). */
    private boolean ollamaEmbedding = false;
}
