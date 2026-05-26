package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.entity.*;
import com.ehr.staffservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service to aggregate dashboard data for patient portal (Epic-style).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MessageService messageService;
    private final LabResultService labResultService;
    private final QuestionnaireService questionnaireService;
    private final AppointmentService appointmentService;
    private final BillingService billingService;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final StaffRepository staffRepository;
    private final com.ehr.staffservice.repository.PatientAddressRepository addressRepository;
    private final com.ehr.staffservice.service.EnhancedRegistrationCompletenessService completenessService;

    /**
     * Get Epic-style dashboard data for a patient.
     */
    @Transactional(readOnly = true)
    public PatientDashboardDto getPatientDashboard(Long patientId) {
        try {
            log.info("=== Starting dashboard build for patientId: {} ===", patientId);
            
            if (patientId == null) {
                log.error("Patient ID is null");
                throw new IllegalArgumentException("Patient ID cannot be null");
            }
            
            // Validate all services are injected
            if (patientRepository == null) {
                log.error("PatientRepository is null");
                throw new IllegalStateException("PatientRepository is not injected");
            }
            
            log.debug("Fetching patient from repository...");
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new com.ehr.staffservice.exception.ResourceNotFoundException("Patient not found with ID: " + patientId));
            log.debug("Patient found: {} {}", patient.getFirstName(), patient.getLastName());

            // Build patient summary
            log.debug("Building patient summary...");
            String firstName = patient.getFirstName() != null ? patient.getFirstName() : "";
            String lastName = patient.getLastName() != null ? patient.getLastName() : "";
            String displayName = (firstName + " " + lastName).trim();
            String mrn = patient.getPatientCode() != null ? patient.getPatientCode() : "";
            
            Long patientIdValue = patient.getPatientId();
            if (patientIdValue == null) {
                log.error("Patient ID is null for patient object");
                throw new IllegalStateException("Patient ID cannot be null");
            }
            
            PatientDashboardDto.PatientSummaryDto patientSummary = new PatientDashboardDto.PatientSummaryDto(
                    patientIdValue,
                    firstName != null ? firstName : "",
                    lastName != null ? lastName : "",
                    displayName.isEmpty() ? "Patient" : displayName, // Fallback if both names are null
                    mrn != null ? mrn : ""
            );
            log.debug("Patient summary created successfully");

            // Build counts for tiles - wrap each service call in try-catch for resilience
            log.debug("Loading messages...");
            List<MessageThreadDto> threads = new ArrayList<>();
            int unreadMessages = 0;
            try {
                if (messageService == null) {
                    log.warn("MessageService is null, skipping messages");
                } else {
                    threads = messageService.getThreadsForPatient(patientId);
                    if (threads == null) {
                        threads = new ArrayList<>();
                    }
                    unreadMessages = (int) threads.stream()
                            .filter(t -> t != null)
                            .mapToLong(t -> t.getUnreadCount() != null ? t.getUnreadCount() : 0)
                            .sum();
                    log.debug("Loaded {} message threads, {} unread", threads.size(), unreadMessages);
                }
            } catch (Exception e) {
                log.warn("Error loading messages for dashboard: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            }

            List<LabResultDto> recentLabs = new ArrayList<>();
            int newResults = 0;
            try {
                recentLabs = labResultService.getLabResultsForPatient(
                        patientId, LocalDate.now().minusMonths(12), LocalDate.now());
                if (recentLabs == null) {
                    recentLabs = new ArrayList<>();
                }
                newResults = (int) recentLabs.stream()
                        .filter(lab -> lab != null && lab.getAbnormalCount() != null && lab.getAbnormalCount() > 0)
                        .count();
            } catch (Exception e) {
                log.warn("Error loading lab results for dashboard: {}", e.getMessage());
            }

            BillingSummaryDto billingSummary = null;
            int openBills = 0;
            try {
                billingSummary = billingService.getBillingSummary(patientId);
                openBills = (billingSummary != null && billingSummary.getPendingStatements() != null) 
                        ? billingSummary.getPendingStatements() : 0;
            } catch (Exception e) {
                log.warn("Error loading billing summary for dashboard: {}", e.getMessage());
            }

            List<QuestionnaireAssignmentDto> assignments = new ArrayList<>();
            int openQuestionnaires = 0;
            try {
                assignments = questionnaireService.getAssignmentsForPatient(patientId);
                if (assignments == null) {
                    assignments = new ArrayList<>();
                }
                openQuestionnaires = (int) assignments.stream()
                        .filter(a -> a != null && ("ASSIGNED".equals(a.getStatus()) || "IN_PROGRESS".equals(a.getStatus())))
                        .count();
            } catch (Exception e) {
                log.warn("Error loading questionnaires for dashboard: {}", e.getMessage());
            }

            // Get upcoming appointments count
            LocalDate today = LocalDate.now();
            List<AppointmentDto> allAppts = new ArrayList<>();
            try {
                allAppts = appointmentService.getByPatient(patientId);
                if (allAppts == null) {
                    allAppts = new ArrayList<>();
                }
            } catch (Exception e) {
                log.warn("Error loading appointments for dashboard: {}", e.getMessage());
            }
            long upcomingAppts = allAppts.stream()
                    .filter(apt -> apt != null && apt.getStartDateTime() != null)
                    .filter(apt -> {
                        try {
                            return apt.getStartDateTime().toLocalDate().isAfter(today.minusDays(1));
                        } catch (Exception e) {
                            log.warn("Error processing appointment date for upcoming count: {}", e.getMessage());
                            return false;
                        }
                    })
                    .count();

            // Build tiles array
            List<PatientDashboardDto.DashboardTileDto> tiles = new ArrayList<>();
            tiles.add(new PatientDashboardDto.DashboardTileDto(
                    "schedule",
                    "Schedule an Appointment",
                    "📅",
                    "/appointments/schedule",
                    upcomingAppts > 0 ? (int) upcomingAppts : null,
                    true
            ));
            tiles.add(new PatientDashboardDto.DashboardTileDto(
                    "messages",
                    "Messages",
                    "✉️",
                    "/messages",
                    unreadMessages > 0 ? unreadMessages : null,
                    true
            ));
            tiles.add(new PatientDashboardDto.DashboardTileDto(
                    "results",
                    "Test Results",
                    "🧪",
                    "/results",
                    newResults > 0 ? newResults : null,
                    true
            ));
            tiles.add(new PatientDashboardDto.DashboardTileDto(
                    "meds",
                    "Medications",
                    "💊",
                    "/meds",
                    null,
                    true
            ));
            tiles.add(new PatientDashboardDto.DashboardTileDto(
                    "billing",
                    "Billing",
                    "💳",
                    "/billing",
                    openBills > 0 ? openBills : null,
                    true
            ));
            tiles.add(new PatientDashboardDto.DashboardTileDto(
                    "questionnaires",
                    "Questionnaires",
                    "📝",
                    "/questionnaires",
                    openQuestionnaires > 0 ? openQuestionnaires : null,
                    true
            ));

            // Build alerts
            List<PatientDashboardDto.DashboardAlertDto> alerts = new ArrayList<>();

            // Billing alerts
            if (billingSummary != null && billingSummary.getTotalDue() != null && billingSummary.getTotalDue().doubleValue() > 0) {
                try {
                    List<BillingStatementDto> statements = billingService.getStatementsForPatient(patientId);
                    if (statements == null) {
                        statements = new ArrayList<>();
                    }
                    BillingStatementDto firstUnpaid = statements.stream()
                            .filter(s -> s != null && !"PAID".equals(s.getStatus()))
                            .findFirst()
                            .orElse(null);

                    if (firstUnpaid != null) {
                        PatientDashboardDto.DashboardActionDto primaryAction = new PatientDashboardDto.DashboardActionDto(
                                "Make a payment",
                                "/billing/" + firstUnpaid.getStatementId() + "/pay",
                                null
                        );
                        PatientDashboardDto.DashboardActionDto secondaryAction = new PatientDashboardDto.DashboardActionDto(
                                "View details",
                                "/billing/" + firstUnpaid.getStatementId(),
                                null
                        );

                        alerts.add(new PatientDashboardDto.DashboardAlertDto(
                                "bill-" + firstUnpaid.getStatementId(),
                                PatientDashboardDto.AlertSeverity.WARNING,
                                "Action needed: account has a balance due",
                                String.format("Amount due $%.2f. Please review your statement.", 
                                        billingSummary.getTotalDue().doubleValue()),
                                String.format("Due: $%.2f", billingSummary.getTotalDue().doubleValue()),
                                billingSummary.getTotalDue().doubleValue(),
                                primaryAction,
                                secondaryAction,
                                Instant.now()
                        ));
                    }
                } catch (Exception e) {
                    log.warn("Error loading billing statements for dashboard alerts: {}", e.getMessage());
                    // Continue without billing alerts
                }
            }

            // Message alerts
            if (unreadMessages > 0) {
                alerts.add(new PatientDashboardDto.DashboardAlertDto(
                        "msg-unread",
                        PatientDashboardDto.AlertSeverity.INFO,
                        "You have " + unreadMessages + " unread message(s)",
                        "New messages from your care team",
                        null,
                        null,
                        new PatientDashboardDto.DashboardActionDto("View Messages", "/messages", null),
                        null,
                        Instant.now()
                ));
            }

            // Results alerts
            if (newResults > 0) {
                alerts.add(new PatientDashboardDto.DashboardAlertDto(
                        "results-new",
                        PatientDashboardDto.AlertSeverity.INFO,
                        "New test results available",
                        newResults + " result(s) with abnormal values",
                        null,
                        null,
                        new PatientDashboardDto.DashboardActionDto("View Results", "/results", null),
                        null,
                        Instant.now()
                ));
            }

            // Questionnaire alerts
            if (openQuestionnaires > 0) {
                alerts.add(new PatientDashboardDto.DashboardAlertDto(
                        "q-open",
                        PatientDashboardDto.AlertSeverity.WARNING,
                        "Questionnaires to complete",
                        "You have " + openQuestionnaires + " questionnaire(s) to complete",
                        null,
                        null,
                        new PatientDashboardDto.DashboardActionDto("View Questionnaires", "/questionnaires", null),
                        null,
                        Instant.now()
                ));
            }

            // Build care team - use primary_doctor_id (primary_provider_id not available until migration V33 runs)
            PatientDashboardDto.ProviderSummaryDto pcp = null;
            try {
                // TODO: Use primaryProviderId once migration V33 runs: patient.getPrimaryProviderId() != null ? patient.getPrimaryProviderId() : patient.getPrimaryDoctorId()
                Long providerId = patient.getPrimaryDoctorId();
                
                if (providerId != null) {
                    // Try to get as Doctor first (for specialization)
                    Optional<Doctor> pcpDoctor = doctorRepository.findById(providerId);
                    if (pcpDoctor.isPresent()) {
                        Doctor doc = pcpDoctor.get();
                        if (doc.getStaff() != null) {
                            Staff staff = doc.getStaff();
                            Long staffId = staff.getStaffId();
                            if (staffId != null) {
                                String pcpName = (staff.getFirstName() != null ? staff.getFirstName() : "") + " " + 
                                                (staff.getLastName() != null ? staff.getLastName() : "");
                                pcp = new PatientDashboardDto.ProviderSummaryDto(
                                        staffId,
                                        pcpName.trim(),
                                        "MD",
                                        doc.getSpecialization() != null ? doc.getSpecialization() : "Family Medicine",
                                        "/api/doctors/" + staffId + "/image",
                                        null // lastVisitDate - not applicable for PCP
                                );
                            }
                        }
                    } else {
                        // If not a doctor, try to get as Staff directly
                        Optional<Staff> staffOpt = staffRepository.findById(providerId);
                        if (staffOpt.isPresent()) {
                            Staff staff = staffOpt.get();
                            Long staffId = staff.getStaffId();
                            if (staffId != null) {
                                String pcpName = (staff.getFirstName() != null ? staff.getFirstName() : "") + " " + 
                                                (staff.getLastName() != null ? staff.getLastName() : "");
                                pcp = new PatientDashboardDto.ProviderSummaryDto(
                                        staffId,
                                        pcpName.trim(),
                                        "MD", // Default
                                        "Primary Care Provider",
                                        "/api/doctors/" + staffId + "/image",
                                        null // lastVisitDate - not applicable for PCP
                                );
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error loading primary care provider for dashboard: {}", e.getMessage());
                // Continue without PCP - dashboard can still work
            }

            // Recent providers from appointments (last 6 months)
            List<PatientDashboardDto.ProviderSummaryDto> recentProviders = new ArrayList<>();
            try {
                LocalDate sixMonthsAgo = today.minusMonths(6);
                Set<Long> addedProviderIds = new HashSet<>();
                if (pcp != null) {
                    addedProviderIds.add(pcp.getProviderId());
                }

                // Build recent providers with last visit date
                Map<Long, LocalDate> providerLastVisit = allAppts.stream()
                        .filter(apt -> apt != null && 
                                      apt.getStartDateTime() != null && 
                                      apt.getDoctorId() != null &&
                                      !addedProviderIds.contains(apt.getDoctorId()))
                        .filter(apt -> {
                            try {
                                return apt.getStartDateTime().toLocalDate().isAfter(sixMonthsAgo);
                            } catch (Exception e) {
                                log.warn("Error processing appointment date for provider: {}", e.getMessage());
                                return false;
                            }
                        })
                        .collect(Collectors.groupingBy(
                                (AppointmentDto apt) -> apt.getDoctorId(),
                                Collectors.mapping(
                                        (AppointmentDto apt) -> {
                                            try {
                                                return apt.getStartDateTime() != null ? apt.getStartDateTime().toLocalDate() : null;
                                            } catch (Exception e) {
                                                log.warn("Error converting appointment date: {}", e.getMessage());
                                                return null;
                                            }
                                        },
                                        Collectors.maxBy(Comparator.naturalOrder())
                                )
                        ))
                        .entrySet().stream()
                        .filter(e -> e.getKey() != null && e.getValue() != null && e.getValue().isPresent())
                        .collect(Collectors.toMap(
                                (Map.Entry<Long, Optional<LocalDate>> e) -> e.getKey(),
                                (Map.Entry<Long, Optional<LocalDate>> e) -> e.getValue().get(), // Safe because we filtered for isPresent()
                                (v1, v2) -> v1,
                                HashMap::new
                        ));

                recentProviders = providerLastVisit.entrySet().stream()
                        .sorted(Map.Entry.<Long, LocalDate>comparingByValue().reversed())
                        .limit(4)
                        .map(entry -> {
                            try {
                                if (entry == null || entry.getKey() == null || entry.getValue() == null) {
                                    return null;
                                }
                                Long doctorId = entry.getKey();
                                LocalDate lastVisit = entry.getValue();
                                Optional<Doctor> docOpt = doctorRepository.findById(doctorId);
                                if (docOpt.isPresent()) {
                                    Doctor doc = docOpt.get();
                                    if (doc.getStaff() != null) {
                                        Staff staff = doc.getStaff();
                                        Long staffId = staff.getStaffId();
                                        if (staffId == null) {
                                            return null;
                                        }
                                        addedProviderIds.add(doctorId);
                                        String providerName = (staff.getFirstName() != null ? staff.getFirstName() : "") + " " + 
                                                             (staff.getLastName() != null ? staff.getLastName() : "");
                                        return new PatientDashboardDto.ProviderSummaryDto(
                                                staffId,
                                                providerName.trim(),
                                                "MD",
                                                doc.getSpecialization() != null ? doc.getSpecialization() : "General",
                                                "/api/doctors/" + staffId + "/image",
                                                lastVisit.format(DateTimeFormatter.ISO_DATE)
                                        );
                                    }
                                }
                                return null;
                            } catch (Exception e) {
                                log.warn("Error processing provider entry: {}", e.getMessage());
                                return null;
                            }
                        })
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
            } catch (Exception e) {
                log.warn("Error loading recent providers for dashboard: {}", e.getMessage());
                // Continue with empty recent providers list
            }

            // Ensure recentProviders is never null
            if (recentProviders == null) {
                recentProviders = new ArrayList<>();
            }
            
            // Ensure all lists are initialized
            if (tiles == null) {
                tiles = new ArrayList<>();
            }
            if (alerts == null) {
                alerts = new ArrayList<>();
            }
            
            PatientDashboardDto.CareTeamDto careTeam = new PatientDashboardDto.CareTeamDto(
                    pcp,
                    recentProviders != null ? recentProviders : new ArrayList<>(),
                    "/messages" // manageRoute for care team management
            );

            // Build completeness summary (optional - skip if service fails)
            // Run in a separate transaction to avoid rollback issues
            log.debug("Computing registration completeness...");
            PatientDashboardDto.CompletenessSummaryDto completenessSummary = null;
            try {
                if (completenessService != null) {
                    // Call completeness service in a way that won't affect main transaction
                    com.ehr.staffservice.dto.RegistrationCompletenessDto completeness = 
                            computeCompletenessSafely(patient);
                
                    if (completeness != null) {
                        // Get top 5 missing fields (prioritize CRITICAL)
                        List<PatientDashboardDto.MissingFieldSummaryDto> topMissing = new ArrayList<>();
                        if (completeness.getMissingFields() != null && !completeness.getMissingFields().isEmpty()) {
                            topMissing = completeness.getMissingFields().stream()
                                    .filter(mf -> mf != null && mf.getField() != null)
                                    .sorted((a, b) -> {
                                        // Sort by severity (CRITICAL first), then by section
                                        String severityA = a.getSeverity() != null ? a.getSeverity() : "";
                                        String severityB = b.getSeverity() != null ? b.getSeverity() : "";
                                        int severityCompare = severityB.compareTo(severityA);
                                        if (severityCompare != 0) return severityCompare;
                                        String sectionA = a.getSection() != null ? a.getSection() : "";
                                        String sectionB = b.getSection() != null ? b.getSection() : "";
                                        return sectionA.compareTo(sectionB);
                                    })
                                    .limit(5)
                                    .map(mf -> {
                                        // Format field name as label (e.g., "addressLine1" -> "Address Line 1")
                                        String label = formatFieldLabel(mf.getField());
                                        return new PatientDashboardDto.MissingFieldSummaryDto(
                                                mf.getSection() != null ? mf.getSection() : "UNKNOWN",
                                                mf.getField() != null ? mf.getField() : "",
                                                label != null ? label : "",
                                                mf.getSeverity() != null ? mf.getSeverity() : "WARNING",
                                                mf.getDeepLinkRoute()
                                        );
                                    })
                                    .collect(Collectors.toList());
                        }
                        
                        completenessSummary = new PatientDashboardDto.CompletenessSummaryDto(
                                completeness.getOverallPercent() != null ? completeness.getOverallPercent() : 0,
                                completeness.getStatus() != null ? completeness.getStatus().name() : "INCOMPLETE",
                                completeness.getBlockingFlags() != null ? completeness.getBlockingFlags() : new ArrayList<>(),
                                topMissing
                        );
                        log.debug("Completeness computed: {}% - Status: {}", 
                                completeness.getOverallPercent(), completeness.getStatus());
                    }
                }
            } catch (Throwable e) {
                // Catch ALL exceptions including Errors to ensure dashboard never fails
                log.warn("Error computing completeness for dashboard - patientId: {} - Error: {} - Message: {} - Continuing without completeness data", 
                        patientId, e.getClass().getSimpleName(), e.getMessage());
                if (log.isDebugEnabled()) {
                    try {
                        Exception ex = e instanceof Exception ? (Exception)e : new Exception(e);
                        log.debug("Completeness error stack trace: {}", getStackTrace(ex));
                    } catch (Exception logEx) {
                        log.debug("Could not log completeness error stack trace: {}", logEx.getMessage());
                    }
                }
                // Don't fail the entire dashboard if completeness fails - just leave it null
                completenessSummary = null;
            }

            // Build next appointment
            log.debug("Finding next appointment...");
            PatientDashboardDto.NextAppointmentDto nextAppointment = null;
            try {
                if (allAppts != null && !allAppts.isEmpty()) {
                    // Find next upcoming appointment
                    AppointmentDto next = allAppts.stream()
                            .filter(apt -> apt != null && apt.getStartDateTime() != null)
                            .filter(apt -> {
                                try {
                                    return apt.getStartDateTime().toLocalDate().isAfter(today.minusDays(1));
                                } catch (Exception e) {
                                    return false;
                                }
                            })
                            .sorted((a, b) -> {
                                try {
                                    return a.getStartDateTime().compareTo(b.getStartDateTime());
                                } catch (Exception e) {
                                    return 0;
                                }
                            })
                            .findFirst()
                            .orElse(null);
                    
                    if (next != null) {
                        nextAppointment = new PatientDashboardDto.NextAppointmentDto(
                                next.getId(),
                                next.getStartDateTime() != null ? 
                                        next.getStartDateTime().format(java.time.format.DateTimeFormatter.ISO_DATE_TIME) : null,
                                next.getDoctorName(),
                                next.getDepartmentName(), // Use departmentName as location
                                next.getVisitType(), // Use visitType instead of appointmentType
                                next.getStatus(),
                                false, // eCheckInAvailable - would check appointment status
                                "/appointments/" + next.getId() + "/checkin"
                        );
                    }
                }
            } catch (Exception e) {
                log.warn("Error building next appointment for dashboard: {}", e.getMessage());
            }

            // Build profile snapshot
            log.debug("Building profile snapshot...");
            PatientDashboardDto.ProfileSnapshotDto profileSnapshot = buildProfileSnapshot(patient);

            log.debug("Successfully built dashboard components for patientId: {} - tiles: {}, alerts: {}, careTeam: {}", 
                    patientId, tiles.size(), alerts.size(), careTeam != null);
            
            log.debug("Creating PatientDashboardDto object...");
            
            // Ensure all required fields are non-null
            if (patientSummary == null) {
                log.error("PatientSummary is null - cannot create dashboard");
                throw new IllegalStateException("Patient summary cannot be null");
            }
            if (tiles == null) {
                tiles = new ArrayList<>();
            }
            if (alerts == null) {
                alerts = new ArrayList<>();
            }
            if (careTeam == null) {
                log.warn("CareTeam is null - creating empty care team");
                careTeam = new PatientDashboardDto.CareTeamDto(null, new ArrayList<>(), "/messages");
            }
            
            PatientDashboardDto dashboard = new PatientDashboardDto(
                    patientSummary,
                    tiles,
                    alerts,
                    careTeam,
                    completenessSummary, // Can be null
                    nextAppointment, // Can be null
                    profileSnapshot, // Can be null
                    Instant.now()
            );
            
            log.info("=== Dashboard built successfully for patientId: {} ===", patientId);
            log.info("Dashboard summary - Tiles: {}, Alerts: {}, Completeness: {}, NextAppt: {}, ProfileSnapshot: {}",
                    tiles.size(), alerts.size(), 
                    completenessSummary != null ? completenessSummary.getPercentComplete() + "%" : "null",
                    nextAppointment != null ? "present" : "null",
                    profileSnapshot != null ? "present" : "null");
            
            return dashboard;
        } catch (Exception e) {
            log.error("Fatal error building dashboard for patientId: {}", patientId, e);
            throw new RuntimeException("Failed to build dashboard: " + e.getMessage(), e);
        }
    }

    /**
     * Get dashboard tiles independently (never throws - returns empty array on error).
     * Always returns safe defaults, never null.
     */
    @Transactional(readOnly = true)
    public PatientDashboardDto.DashboardTileDto[] getDashboardTiles(Long patientId) {
        if (patientId == null) {
            log.warn("getDashboardTiles called with null patientId, returning empty array");
            return new PatientDashboardDto.DashboardTileDto[0];
        }
        
        try {
            PatientDashboardDto dashboard = getPatientDashboard(patientId);
            if (dashboard == null || dashboard.getTiles() == null) {
                log.debug("Dashboard or tiles is null for patientId: {}, returning empty array", patientId);
                return new PatientDashboardDto.DashboardTileDto[0];
            }
            List<PatientDashboardDto.DashboardTileDto> tilesList = dashboard.getTiles();
            if (tilesList.isEmpty()) {
                return new PatientDashboardDto.DashboardTileDto[0];
            }
            return tilesList.toArray(new PatientDashboardDto.DashboardTileDto[0]);
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            log.warn("Patient not found for tiles - patientId: {}", patientId);
            return new PatientDashboardDto.DashboardTileDto[0];
        } catch (Exception e) {
            log.error("Error loading tiles for patientId: {} - Exception: {} - Message: {}", 
                    patientId, e.getClass().getSimpleName(), e.getMessage(), e);
            return new PatientDashboardDto.DashboardTileDto[0];
        }
    }

    /**
     * Get action center data independently (never throws - returns safe defaults on error).
     * Action center is represented by completeness summary.
     * Always returns ok=true with safe defaults.
     */
    @Transactional(readOnly = true)
    public PatientDashboardDto.CompletenessSummaryDto getActionCenter(Long patientId) {
        if (patientId == null) {
            log.warn("getActionCenter called with null patientId, returning default completeness");
            return new PatientDashboardDto.CompletenessSummaryDto(
                    100, "COMPLETE", new ArrayList<>(), new ArrayList<>()
            );
        }
        
        try {
            PatientDashboardDto dashboard = getPatientDashboard(patientId);
            if (dashboard == null || dashboard.getCompletenessSummary() == null) {
                log.debug("Dashboard or completeness summary is null for patientId: {}, returning default", patientId);
                // Return default "COMPLETE" status (not CRITICAL) when data is missing
                return new PatientDashboardDto.CompletenessSummaryDto(
                        100, "COMPLETE", new ArrayList<>(), new ArrayList<>()
                );
            }
            PatientDashboardDto.CompletenessSummaryDto summary = dashboard.getCompletenessSummary();
            // Ensure all fields are non-null
            if (summary.getTopMissingFields() == null) {
                summary.setTopMissingFields(new ArrayList<>());
            }
            if (summary.getBlockingFlags() == null) {
                summary.setBlockingFlags(new ArrayList<>());
            }
            return summary;
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            log.warn("Patient not found for action center - patientId: {}", patientId);
            // Return default "COMPLETE" status (not CRITICAL) when patient not found
            return new PatientDashboardDto.CompletenessSummaryDto(
                    100, "COMPLETE", new ArrayList<>(), new ArrayList<>()
            );
        } catch (Exception e) {
            log.error("Error loading action center for patientId: {} - Exception: {} - Message: {}", 
                    patientId, e.getClass().getSimpleName(), e.getMessage(), e);
            // Return default "COMPLETE" status (not CRITICAL) on error
            return new PatientDashboardDto.CompletenessSummaryDto(
                    100, "COMPLETE", new ArrayList<>(), new ArrayList<>()
            );
        }
    }

    /**
     * Get care team independently (never throws - returns safe defaults on error).
     * Always returns ok=true with safe defaults.
     */
    @Transactional(readOnly = true)
    public PatientDashboardDto.CareTeamDto getCareTeam(Long patientId) {
        if (patientId == null) {
            log.warn("getCareTeam called with null patientId, returning empty care team");
            return new PatientDashboardDto.CareTeamDto(null, new ArrayList<>(), "/messages");
        }
        
        try {
            PatientDashboardDto dashboard = getPatientDashboard(patientId);
            if (dashboard == null || dashboard.getCareTeam() == null) {
                log.debug("Dashboard or care team is null for patientId: {}, returning empty care team", patientId);
                return new PatientDashboardDto.CareTeamDto(null, new ArrayList<>(), "/messages");
            }
            PatientDashboardDto.CareTeamDto careTeam = dashboard.getCareTeam();
            // Ensure recentProviders is never null
            if (careTeam.getRecentProviders() == null) {
                careTeam.setRecentProviders(new ArrayList<>());
            }
            // Ensure manageRoute is never null
            if (careTeam.getManageRoute() == null || careTeam.getManageRoute().isEmpty()) {
                careTeam.setManageRoute("/messages");
            }
            return careTeam;
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            log.warn("Patient not found for care team - patientId: {}", patientId);
            return new PatientDashboardDto.CareTeamDto(null, new ArrayList<>(), "/messages");
        } catch (Exception e) {
            log.error("Error loading care team for patientId: {} - Exception: {} - Message: {}", 
                    patientId, e.getClass().getSimpleName(), e.getMessage(), e);
            return new PatientDashboardDto.CareTeamDto(null, new ArrayList<>(), "/messages");
        }
    }
    
    private String getStackTrace(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }

    /**
     * Build profile snapshot for dashboard.
     */
    private PatientDashboardDto.ProfileSnapshotDto buildProfileSnapshot(Patient patient) {
        // Build address snapshot
        PatientDashboardDto.AddressSnapshotDto address = null;
        try {
            List<PatientAddress> addresses = addressRepository.findByPatientIdAndIsPrimary(patient.getPatientId(), true);
            PatientAddress primaryAddress = addresses.isEmpty() ? null : addresses.get(0);
            
            String addressLine1 = primaryAddress != null ? primaryAddress.getAddressLine1() : patient.getAddressLine1();
            String city = primaryAddress != null ? primaryAddress.getCity() : patient.getCity();
            String state = primaryAddress != null ? primaryAddress.getStateProvince() : patient.getState();
            String zip = primaryAddress != null ? primaryAddress.getPostalCode() : patient.getZipCode();
            
            if (addressLine1 != null || city != null || state != null || zip != null) {
                // Mask address line 1 for privacy (show first few chars)
                String line1Masked = addressLine1 != null && addressLine1.length() > 5 
                        ? addressLine1.substring(0, 3) + "*** " + addressLine1.substring(Math.min(8, addressLine1.length()))
                        : addressLine1;
                
                boolean isComplete = addressLine1 != null && city != null && state != null && zip != null;
                
                address = new PatientDashboardDto.AddressSnapshotDto(
                        line1Masked,
                        city,
                        state,
                        zip,
                        isComplete
                );
            }
        } catch (Exception e) {
            log.warn("Error building address snapshot: {}", e.getMessage());
        }

        // Build insurance snapshot
        PatientDashboardDto.InsuranceSnapshotDto insurance = null;
        try {
            if (patient.getInsuranceProvider() != null && !patient.getInsuranceProvider().trim().isEmpty()) {
                String memberId = patient.getInsurancePolicyNumber();
                String memberIdMasked = null;
                if (memberId != null && memberId.length() > 4) {
                    memberIdMasked = "****" + memberId.substring(memberId.length() - 4);
                } else if (memberId != null) {
                    memberIdMasked = "****" + memberId;
                }
                
                insurance = new PatientDashboardDto.InsuranceSnapshotDto(
                        patient.getInsuranceProvider(),
                        memberIdMasked,
                        patient.getUpdatedAt() != null ? 
                                patient.getUpdatedAt().toLocalDateTime().format(java.time.format.DateTimeFormatter.ISO_DATE) : null,
                        true, // Assume active if present
                        false // isExpiringSoon - would check effective dates
                );
            }
        } catch (Exception e) {
            log.warn("Error building insurance snapshot: {}", e.getMessage());
        }

        // Build pharmacy snapshot (placeholder - would come from pharmacy table)
        PatientDashboardDto.PharmacySnapshotDto pharmacy = null;

        return new PatientDashboardDto.ProfileSnapshotDto(address, insurance, pharmacy);
    }

    /**
     * Format field name as display label.
     * Example: "addressLine1" -> "Address Line 1"
     */
    private String formatFieldLabel(String field) {
        if (field == null || field.isEmpty()) return field;
        
        // Handle common field names
        switch (field) {
            case "legalName": return "Legal Name";
            case "dateOfBirth": return "Date of Birth";
            case "birthSex": return "Birth Sex";
            case "phoneNumber": return "Phone Number";
            case "addressLine1": return "Address Line 1";
            case "primaryInsurancePayer": return "Primary Insurance Payer";
            case "memberId": return "Insurance Member ID";
            case "emergencyContact": return "Emergency Contact";
            case "hipaaConsent": return "HIPAA Consent";
            default:
                // Convert camelCase to Title Case
                if (field == null || field.isEmpty()) {
                    return field;
                }
                String spaced = field.replaceAll("([A-Z])", " $1");
                if (!spaced.isEmpty()) {
                    spaced = Character.toUpperCase(spaced.charAt(0)) + 
                            (spaced.length() > 1 ? spaced.substring(1) : "");
                }
                return spaced.trim();
        }
    }

    /**
     * Safely compute completeness without affecting the main transaction.
     * This method runs the completeness service in a separate transaction that won't cause rollback.
     */
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW,
            readOnly = true,
            noRollbackFor = {Exception.class, RuntimeException.class}
    )
    private com.ehr.staffservice.dto.RegistrationCompletenessDto computeCompletenessSafely(Patient patient) {
        try {
            return completenessService.computeCompleteness(patient);
        } catch (Exception e) {
            log.warn("Completeness computation failed in safe transaction: {}", e.getMessage());
            // Return null instead of throwing - this won't mark transaction for rollback
            return null;
        }
    }

    /**
     * Convert backend status enum to display-friendly Title Case string.
     */
    private String toDisplayStatus(String status) {
        if (status == null || status.isEmpty()) return "";
        if (status.equals("SCHEDULED")) return "Confirmed";
        String[] words = status.toLowerCase().replace("_", " ").split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (result.length() > 0) result.append(" ");
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)));
                if (word.length() > 1) result.append(word.substring(1));
            }
        }
        return result.toString();
    }
}
