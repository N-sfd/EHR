package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class QuestionnaireDetailDto {
    private Long assignmentId;
    private Long questionnaireId;
    private String questionnaireTitle;
    private String questionnaireDescription;
    private LocalDate dueDate;
    private String status;
    private List<QuestionDto> questions;
    private java.util.Map<Long, AnswerDto> existingAnswers; // questionId -> answer
}

