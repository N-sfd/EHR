package com.ehr.staffservice.ai.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Patient-scoped RAG: structured chart rows (labs, meds, appointments, encounters) plus optional vector hits.
 */
@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiRetrievalService {

    private final AiPatientChartAggregator patientChartAggregator;

    public AiRetrievalService(AiPatientChartAggregator patientChartAggregator) {
        this.patientChartAggregator = patientChartAggregator;
    }

    public AiRetrievalBundle retrieve(Long patientId, String contextType, String contextRefId,
                                      String userMessage, String chatPortal) {
        return patientChartAggregator.aggregate(patientId, contextType, contextRefId, userMessage, chatPortal);
    }
}
