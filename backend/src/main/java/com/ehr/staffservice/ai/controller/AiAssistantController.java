package com.ehr.staffservice.ai.controller;

import com.ehr.staffservice.ai.dto.AiDtos;
import com.ehr.staffservice.ai.service.AiAssistantService;
import com.ehr.staffservice.config.AiProperties;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/ai")
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiAssistantController {
    private final AiAssistantService aiAssistantService;
    private final AiProperties aiProperties;

    public AiAssistantController(AiAssistantService aiAssistantService, AiProperties aiProperties) {
        this.aiAssistantService = aiAssistantService;
        this.aiProperties = aiProperties;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiDtos.AiChatResponse> chat(Authentication authentication,
                                                      @Valid @RequestBody AiDtos.AiChatRequest request) {
        return ResponseEntity.ok(aiAssistantService.chat(authentication, request));
    }

    /**
     * Server-Sent Events: each {@code data:} line is JSON {@link com.ehr.staffservice.dto.AiStreamChunk}
     * ({@code token} | {@code note} | {@code citations} final sources | {@code done} | {@code error}).
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(Authentication authentication,
                                 @Valid @RequestBody AiDtos.AiChatRequest request) {
        if (!aiProperties.isAllowStreaming()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "AI streaming is disabled");
        }
        SseEmitter emitter = new SseEmitter(TimeUnit.MINUTES.toMillis(15));
        aiAssistantService.streamChat(authentication, request, emitter);
        return emitter;
    }

    @PostMapping("/explain/lab-result")
    public ResponseEntity<AiDtos.ExplainLabResultResponse> explainLabResult(Authentication authentication,
                                                                            @Valid @RequestBody AiDtos.ExplainLabResultRequest request) {
        return ResponseEntity.ok(aiAssistantService.explainLabResult(authentication, request));
    }

    @PostMapping("/summarize/patient")
    public ResponseEntity<AiDtos.SummarizePatientResponse> summarizePatient(Authentication authentication,
                                                                            @Valid @RequestBody AiDtos.SummarizePatientRequest request) {
        return ResponseEntity.ok(aiAssistantService.summarizePatient(authentication, request));
    }

    @PostMapping("/feedback")
    public ResponseEntity<AiDtos.FeedbackResponse> feedback(Authentication authentication,
                                                            @Valid @RequestBody AiDtos.FeedbackRequest request) {
        return ResponseEntity.ok(aiAssistantService.saveFeedback(authentication, request));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<AiDtos.SessionHistoryResponse> getSession(Authentication authentication,
                                                                    @PathVariable String sessionId) {
        return ResponseEntity.ok(aiAssistantService.getSession(authentication, sessionId));
    }
}
