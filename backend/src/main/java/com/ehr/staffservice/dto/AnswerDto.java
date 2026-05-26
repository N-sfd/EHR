package com.ehr.staffservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class AnswerDto {
    private String answerText;
    private BigDecimal answerNumber;
    private Map<String, Object> answerJson;
}

