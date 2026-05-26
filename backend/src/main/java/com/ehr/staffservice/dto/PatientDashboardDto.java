package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.List;

/**
 * Epic-style patient dashboard DTO.
 * Matches the exact structure expected by the frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDashboardDto {
    private PatientSummaryDto patient;
    private List<DashboardTileDto> tiles;
    private List<DashboardAlertDto> alerts;
    private CareTeamDto careTeam;
    private CompletenessSummaryDto completenessSummary;
    private NextAppointmentDto nextAppointment;
    private ProfileSnapshotDto profileSnapshot;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant generatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientSummaryDto {
        private Long id;
        private String firstName;
        private String lastName;
        private String displayName;
        private String mrn;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardTileDto {
        private String key;
        private String label;
        private String icon;
        private String route;
        private Integer badgeCount;
        private boolean enabled;
    }

    @Data
    @NoArgsConstructor
    public static class ProviderSummaryDto {
        private Long providerId;
        private String name;
        private String credentials; // "MD", "NP"
        private String specialty;
        private String photoUrl;
        private String lastVisitDate; // ISO date string, optional
        
        // Explicit constructor to ensure correct parameter order (matches field declaration order)
        public ProviderSummaryDto(Long providerId, String name, String credentials, String specialty, String photoUrl, String lastVisitDate) {
            this.providerId = providerId;
            this.name = name;
            this.credentials = credentials;
            this.specialty = specialty;
            this.photoUrl = photoUrl;
            this.lastVisitDate = lastVisitDate;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareTeamDto {
        private ProviderSummaryDto primaryCareProvider;
        private List<ProviderSummaryDto> recentProviders;
        private String manageRoute;
        
        /**
         * Factory method for safe default (null PCP, empty providers list, default route).
         * Used when dashboard data cannot be loaded.
         */
        public static CareTeamDto safeDefault() {
            return new CareTeamDto(null, new java.util.ArrayList<>(), "/messages");
        }
    }

    public enum AlertType {
        BILLING, APPOINTMENT, RESULTS, MESSAGE, QUESTIONNAIRE, PROFILE, GENERAL
    }

    public enum AlertSeverity {
        INFO, WARNING, CRITICAL
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardAlertDto {
        private String id;
        private AlertSeverity severity;
        private String title;
        private String message;
        private String pill; // Optional pill text (e.g., "Due: $150.00")
        private Double amountDue; // Optional amount due for billing alerts
        private DashboardActionDto primaryAction;
        private DashboardActionDto secondaryAction;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardActionDto {
        private String label;
        private String route; // SPA route like "/billing/123" or "/appointments/schedule"
        private String url; // optional external link
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletenessSummaryDto {
        private Integer percentComplete; // 0-100
        private String status; // COMPLETE, INCOMPLETE, CRITICAL
        private List<String> blockingFlags; // BILLING_BLOCK, ECHECKIN_BLOCK, etc.
        private List<MissingFieldSummaryDto> topMissingFields; // Top 3-5 missing fields
        
        /**
         * Factory method for safe default (0% complete, CRITICAL status, empty lists).
         * Used when dashboard data cannot be loaded.
         */
        public static CompletenessSummaryDto safeDefault() {
            return new CompletenessSummaryDto(0, "CRITICAL", new java.util.ArrayList<>(), new java.util.ArrayList<>());
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MissingFieldSummaryDto {
        private String section;
        private String field;
        private String label;
        private String severity;
        private String deepLinkRoute;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NextAppointmentDto {
        private Long appointmentId;
        private String dateTime; // ISO datetime
        private String providerName;
        private String location;
        private String type;
        private String status;
        private Boolean eCheckInAvailable;
        private String eCheckInRoute; // "/appointments/{id}/checkin"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileSnapshotDto {
        private AddressSnapshotDto address;
        private InsuranceSnapshotDto insurance;
        private PharmacySnapshotDto pharmacy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressSnapshotDto {
        private String line1Masked; // "123 Main St" or "*** Main St"
        private String city;
        private String state;
        private String zip;
        private Boolean isComplete;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsuranceSnapshotDto {
        private String payerName;
        private String memberIdMasked; // "****1234"
        private String lastUpdated; // ISO date
        private Boolean isActive;
        private Boolean isExpiringSoon; // Within 30 days
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PharmacySnapshotDto {
        private String name;
        private String address;
        private String phone;
        private Boolean isPreferred;
    }
}
