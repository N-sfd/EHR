package com.ehr.staffservice.dto;

import com.ehr.staffservice.ai.dto.AiDtos;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * JSON payload for {@code text/event-stream} {@code data:} lines on {@code POST /api/ai/chat/stream}.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiStreamChunk(
        String type,
        String content,
        List<AiDtos.AiCitationDto> citations,
        String message
) {
    public static AiStreamChunk token(String content) {
        return new AiStreamChunk("token", content, null, null);
    }

    public static AiStreamChunk citations(List<AiDtos.AiCitationDto> citations) {
        return new AiStreamChunk("citations", null, citations, null);
    }

    public static AiStreamChunk done() {
        return new AiStreamChunk("done", null, null, null);
    }

    public static AiStreamChunk error(String message) {
        return new AiStreamChunk("error", null, null, message);
    }

    /** Optional UI copy (e.g. grounding warning) emitted before {@link #citations}. */
    public static AiStreamChunk note(String message) {
        return new AiStreamChunk("note", null, null, message);
    }
}
