package com.ehr.staffservice.ai.eval;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiEvalCase(
        String name,
        String role,
        String portal,
        long patientId,
        EvalRequest request,
        List<String> expectedRetrievalTypes,
        EvalExpected expected,
        String goldenAnswer
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EvalRequest(
            String message,
            String contextType,
            String contextRefId
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EvalExpected(
            List<String> mustContain,
            List<String> forbidden,
            boolean needsEscalation,
            boolean needsClinicalReview,
            boolean chartGroundingWarning
    ) {
    }
}
