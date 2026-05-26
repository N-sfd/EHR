package com.ehr.staffservice.dto;

import lombok.Data;
import java.util.Map;

@Data
public class QuestionDto {
    private Long questionId;
    private String questionText;
    private String questionType; // TEXT, NUMBER, YES_NO, MULTIPLE_CHOICE, SCALE
    private Map<String, Object> options; // For MULTIPLE_CHOICE or SCALE
    private Boolean isRequired;
    private Integer displayOrder;
}

