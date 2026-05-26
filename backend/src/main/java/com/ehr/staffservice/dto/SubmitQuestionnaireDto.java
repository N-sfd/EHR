package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Map;

@Data
public class SubmitQuestionnaireDto {
    @NotNull(message = "Answers are required")
    private Map<Long, AnswerDto> answers; // questionId -> answer
}

