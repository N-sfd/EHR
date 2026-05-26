package com.ehr.staffservice.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Admin ingest payload for {@code ai_document_chunk} (education, FAQ, policies, etc.).
 */
@Data
public class KnowledgeIngestRequest {

    @NotBlank
    @Size(max = 64)
    private String sourceType;

    @NotBlank
    @Size(max = 120)
    private String sourceRef;

    @Size(max = 255)
    private String title;

    @NotBlank
    private String body;

    private Long patientId;

    /** PATIENT, STAFF, or BOTH (defaults to BOTH if omitted). */
    private Audience audience;

    /** MYCHART, ADMIN, or BOTH (defaults to BOTH if omitted). */
    private Portal portal;

    private Long departmentId;
    private LocalDate effectiveDate;

    /** ACTIVE or ARCHIVED */
    @NotBlank
    @Size(max = 32)
    private String status = "ACTIVE";

    private int contentVersion = 1;

    /** When true, delete existing rows for the same sourceType + sourceRef before inserting. */
    private boolean replaceExisting = true;

    /** Optional labels stored in chunk metadata for filtering and reporting. */
    private List<String> tags = new ArrayList<>();

    public enum Audience {
        PATIENT, STAFF, BOTH
    }

    public enum Portal {
        MYCHART, ADMIN, BOTH
    }
}
