package com.ehr.staffservice.ai.rag;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class RagContextAssembler {
    // TODO: Wire pgvector retrieval + context packing.
}
