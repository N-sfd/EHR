package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class OrderDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long orderId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String orderNumber;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Ordered by staff ID is required")
    private Long orderedByStaffId;

    @NotBlank(message = "Order type is required")
    private String orderType; // MEDICATION, LAB, IMAGING, PROCEDURE, DIET, ACTIVITY

    private String orderCategory; // Routine, Stat, Now, PRN

    @NotBlank(message = "Order description is required")
    private String orderDescription;

    private String orderDetails;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    @NotBlank(message = "Status is required")
    private String status; // PENDING, ACTIVE, COMPLETED, CANCELLED, ON_HOLD

    private String priority; // Routine, Stat, Urgent
    private Long departmentId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long verifiedByStaffId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime verifiedDateTime;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long discontinuedByStaffId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime discontinuedDateTime;

    private String discontinuationReason;
    private String notes;
}

