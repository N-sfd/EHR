package com.ehr.staffservice.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class AiDtos {
    private AiDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiCitationDto {
        private String type;
        private String refId;
        private String label;
    }

    @Data
    public static class AiChatRequest {
        private String sessionId;
        @NotBlank
        private String message;
        @NotNull
        private Long patientId;
        @NotBlank
        private String contextType;
        private String contextRefId;
        @NotBlank
        private String portal;
    }

    @Data
    public static class AiChatResponse {
        private String sessionId;
        private String messageId;
        private String answer;
        private List<AiCitationDto> citations = new ArrayList<>();
        private String disclaimer;
        private boolean needsEscalation;
        /** Symptom triage: encourage timely clinician follow-up (non-emergency). */
        private boolean needsClinicalReview;
        /** Heuristic: numeric detail in the answer may not appear in approved chart context. */
        private boolean chartGroundingWarning;
        private boolean blocked;
        private String blockedReason;
        private Instant timestamp;
    }

    @Data
    public static class ExplainLabResultRequest {
        @NotNull
        private Long patientId;
        @NotBlank
        private String labResultId;
        @NotBlank
        private String audience;
    }

    @Data
    public static class ExplainLabResultResponse {
        private String summary;
        private String plainLanguageExplanation;
        private List<String> nextSteps = new ArrayList<>();
        private List<AiCitationDto> citations = new ArrayList<>();
        private boolean needsEscalation;
    }

    @Data
    public static class SummarizePatientRequest {
        @NotNull
        private Long patientId;
        @NotBlank
        private String summaryType;
        @NotBlank
        private String portal;
    }

    @Data
    public static class SummarizePatientResponse {
        private Long patientId;
        private String summaryType;
        private String summary;
        private List<AiCitationDto> citations = new ArrayList<>();
        private boolean blocked;
    }

    @Data
    public static class FeedbackRequest {
        @NotBlank
        private String messageId;
        @NotBlank
        private String rating;
        private String comment;
    }

    @Data
    @AllArgsConstructor
    public static class FeedbackResponse {
        private boolean saved;
    }

    @Data
    @AllArgsConstructor
    public static class SessionMessageDto {
        private String id;
        private String sender;
        private String content;
        private Instant createdAt;
        private Boolean blocked;
    }

    @Data
    public static class SessionHistoryResponse {
        private String sessionId;
        private Long patientId;
        private String portal;
        private List<SessionMessageDto> messages = new ArrayList<>();
    }
}
