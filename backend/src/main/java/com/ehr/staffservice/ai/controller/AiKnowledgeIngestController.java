package com.ehr.staffservice.ai.controller;

import com.ehr.staffservice.ai.dto.KnowledgeIngestRequest;
import com.ehr.staffservice.ai.dto.KnowledgeIngestResponse;
import com.ehr.staffservice.ai.service.AiKnowledgeIngestService;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only ingestion for vector RAG ({@code ai_document_chunk}).
 */
@RestController
@RequestMapping("/api/admin/ai/knowledge")
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiKnowledgeIngestController {

    private final AiKnowledgeIngestService ingestService;

    public AiKnowledgeIngestController(AiKnowledgeIngestService ingestService) {
        this.ingestService = ingestService;
    }

    @PostMapping("/ingest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KnowledgeIngestResponse> ingest(@Valid @RequestBody KnowledgeIngestRequest request) {
        return ResponseEntity.ok(ingestService.ingest(request));
    }
}
