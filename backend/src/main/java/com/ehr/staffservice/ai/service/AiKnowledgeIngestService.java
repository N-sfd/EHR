package com.ehr.staffservice.ai.service;

import com.ehr.staffservice.ai.chunk.AiTextChunker;
import com.ehr.staffservice.ai.dto.KnowledgeIngestRequest;
import com.ehr.staffservice.ai.dto.KnowledgeIngestResponse;
import com.ehr.staffservice.ai.repository.AiDocumentChunkStore;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiKnowledgeIngestService {

    private final AiTextChunker textChunker;
    private final AiDocumentChunkStore chunkStore;
    private final ObjectProvider<EmbeddingModel> embeddingModel;

    public AiKnowledgeIngestService(AiTextChunker textChunker,
                                    AiDocumentChunkStore chunkStore,
                                    ObjectProvider<EmbeddingModel> embeddingModel) {
        this.textChunker = textChunker;
        this.chunkStore = chunkStore;
        this.embeddingModel = embeddingModel;
    }

    @Transactional
    public KnowledgeIngestResponse ingest(KnowledgeIngestRequest request) {
        if (request.getBody() == null || request.getBody().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "body is required and cannot be blank");
        }
        EmbeddingModel model = embeddingModel.getIfAvailable();
        if (model == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Embedding model is not available (AI / OpenAI not configured).");
        }
        String audience = request.getAudience() != null ? request.getAudience().name() : "BOTH";
        String portal = request.getPortal() != null ? request.getPortal().name() : "BOTH";
        int deleted = 0;
        if (request.isReplaceExisting()) {
            deleted = chunkStore.deleteBySource(request.getSourceType(), request.getSourceRef());
        }
        List<String> pieces = textChunker.chunk(request.getBody());
        if (pieces.isEmpty()) {
            return new KnowledgeIngestResponse(deleted, 0, request.getSourceType(), request.getSourceRef());
        }
        List<String> tags = request.getTags() != null ? request.getTags() : List.of();
        String baseRef = request.getSourceRef();
        try {
            for (int i = 0; i < pieces.size(); i++) {
                String text = pieces.get(i);
                float[] vector = model.embed(text);
                String chunkRef = baseRef + ":" + i;
                chunkStore.insertChunk(
                        UUID.randomUUID(),
                        request.getSourceType(),
                        chunkRef,
                        request.getPatientId(),
                        request.getTitle(),
                        text,
                        vector,
                        audience,
                        portal,
                        request.getDepartmentId(),
                        request.getEffectiveDate(),
                        request.getStatus(),
                        request.getContentVersion(),
                        i,
                        baseRef,
                        tags
                );
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to persist chunks: " + e.getMessage(), e);
        }
        return new KnowledgeIngestResponse(deleted, pieces.size(), request.getSourceType(), baseRef);
    }
}
