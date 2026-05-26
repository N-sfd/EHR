package com.ehr.staffservice.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeIngestResponse {
    private int priorChunksDeleted;
    private int chunksWritten;
    private String sourceType;
    private String sourceRef;
}
