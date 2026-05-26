package com.ehr.staffservice.ai.service;

import com.ehr.staffservice.ai.dto.AiDtos;

import java.util.List;

/**
 * Structured + vector snippets for the system prompt, canonical citations, and a single blob for grounding checks.
 */
public record AiRetrievalBundle(
        List<String> contextSnippets,
        List<AiDtos.AiCitationDto> citations,
        String groundingText
) {
}
