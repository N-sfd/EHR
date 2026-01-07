package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServiceDto {

    private Long serviceId;

    @NotBlank(message = "Service name is required")
    private String serviceName;

    @NotNull(message = "Department is required")
    private Long departmentId;

    private String departmentName; // Populated from department join

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotBlank(message = "Status is required")
    private String status; // Active / Inactive

    private String description;

    private java.sql.Timestamp createdAt;
    private java.sql.Timestamp updatedAt;
}

