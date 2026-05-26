package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.EcheckinSubmissionDto;
import com.ehr.staffservice.dto.EcheckinDataDto;
import com.ehr.staffservice.dto.fhir.FhirPatientDto;
import com.ehr.staffservice.dto.fhir.FhirCoverageDto;
import com.ehr.staffservice.dto.fhir.FhirConsentDto;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.entity.PatientAddress;
import com.ehr.staffservice.entity.PatientConsent;
import com.ehr.staffservice.entity.PatientContact;
import com.ehr.staffservice.entity.Appointment;
import com.ehr.staffservice.entity.patientaccess.Coverage;
import com.ehr.staffservice.repository.PatientRepository;
import com.ehr.staffservice.repository.PatientAddressRepository;
import com.ehr.staffservice.repository.PatientContactRepository;
import com.ehr.staffservice.repository.PatientConsentRepository;
import com.ehr.staffservice.repository.AppointmentRepository;
import com.ehr.staffservice.repository.patientaccess.CoverageRepository;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for handling eCheck-in submissions.
 * Updates patient demographics, contact, insurance, and consents based on eCheck-in data.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EcheckinService {

    private final PatientRepository patientRepository;
    private final PatientAddressRepository addressRepository;
    private final PatientContactRepository contactRepository;
    private final PatientConsentRepository consentRepository;
    private final AppointmentRepository appointmentRepository;
    private final CoverageRepository coverageRepository;
    private final FhirMappingService fhirMappingService;
    private final EnhancedRegistrationCompletenessService completenessService;

    /**
     * Submit eCheck-in data and update patient records.
     * Also marks the appointment as PRECHECKIN_COMPLETE.
     */
    @Transactional
    public EcheckinSubmissionDto submitEcheckin(Long patientId, EcheckinSubmissionDto submission) {
        log.info("Processing eCheck-in submission for patientId: {}, appointmentId: {}", 
                patientId, submission.getAppointmentId());

        // Verify patient exists
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        // Verify appointment exists and belongs to patient
        appointmentRepository.findById(submission.getAppointmentId())
                .filter(apt -> apt.getPatientId() != null && apt.getPatientId().equals(patientId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found or does not belong to patient"));

        // Update demographics (address)
        if (submission.getDemographics() != null) {
            updateDemographics(patient, submission.getDemographics());
        }

        // Update contact preferences
        if (submission.getContact() != null) {
            updateContact(patient, submission.getContact());
        }

        // Update insurance (if provided)
        if (submission.getInsurance() != null) {
            updateInsurance(patient, submission.getInsurance());
        }

        // Update consents
        if (submission.getConsents() != null) {
            updateConsents(patient, submission.getConsents());
        }

        // Mark appointment as PRECHECKIN_COMPLETE
        // TODO: Update appointment status when Appointment entity supports it
        // appointment.setStatus("PRECHECKIN_COMPLETE");

        submission.setSubmittedAt(Instant.now());
        log.info("eCheck-in submission completed successfully for patientId: {}, appointmentId: {}", 
                patientId, submission.getAppointmentId());

        return submission;
    }

    /**
     * Get eCheck-in wizard initialization data.
     * Returns appointment summary, Patient resource, Coverage list, Consents list, completeness snapshot.
     */
    @Transactional(readOnly = true)
    public EcheckinDataDto getEcheckinData(Long patientId, Long appointmentId) {
        log.info("Getting eCheck-in data for patientId: {}, appointmentId: {}", patientId, appointmentId);

        // Verify appointment exists and belongs to patient
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .filter(apt -> apt.getPatientId() != null && apt.getPatientId().equals(patientId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found or does not belong to patient"));

        // Get patient
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        // Get primary address
        List<PatientAddress> addresses = addressRepository.findByPatientIdAndIsPrimary(patientId, true);
        PatientAddress primaryAddress = addresses.isEmpty() ? null : addresses.get(0);

        // Get emergency contacts
        List<PatientContact> emergencyContacts = contactRepository.findByPatientIdAndIsEmergencyContact(patientId, true);

        // Convert to FHIR Patient
        FhirPatientDto fhirPatient = fhirMappingService.toFhirPatient(patient, primaryAddress, emergencyContacts);

        // Get coverages
        List<Coverage> coverages = coverageRepository.findByPatientId(patientId);
        List<FhirCoverageDto> fhirCoverages = coverages.stream()
                .map(fhirMappingService::toFhirCoverage)
                .collect(Collectors.toList());

        // Get required consents (HIPAA, Treatment, Financial)
        List<PatientConsent> consents = consentRepository.findByPatientId(patientId);
        List<FhirConsentDto> requiredConsents = consents.stream()
                .filter(c -> PatientConsent.TYPE_HIPAA.equals(c.getConsentType()) ||
                           PatientConsent.TYPE_TREATMENT.equals(c.getConsentType()) ||
                           PatientConsent.TYPE_FINANCIAL.equals(c.getConsentType()))
                .map(fhirMappingService::toFhirConsent)
                .collect(Collectors.toList());

        // Get completeness snapshot
        com.ehr.staffservice.dto.RegistrationCompletenessDto completeness = 
                completenessService.computeCompleteness(patient);

        // Build appointment summary
        EcheckinDataDto.AppointmentSummaryDto appointmentSummary = new EcheckinDataDto.AppointmentSummaryDto();
        appointmentSummary.setAppointmentId(appointment.getId());
        if (appointment.getStartAt() != null) {
            appointmentSummary.setAppointmentDate(appointment.getStartAt().toLocalDate().toString());
            appointmentSummary.setAppointmentTime(appointment.getStartAt().toLocalTime().toString());
        }
        appointmentSummary.setStatus(appointment.getStatus() != null ? appointment.getStatus() : "PENDING");
        // TODO: Get provider name and department name from appointment
        appointmentSummary.setProviderName("Provider"); // Placeholder
        appointmentSummary.setDepartmentName("Department"); // Placeholder
        appointmentSummary.setVisitType(appointment.getVisitType() != null ? appointment.getVisitType() : "General");

        // Build response
        EcheckinDataDto data = new EcheckinDataDto();
        data.setAppointment(appointmentSummary);
        data.setPatient(fhirPatient);
        data.setCoverages(fhirCoverages);
        data.setRequiredConsents(requiredConsents);
        data.setCompleteness(completeness);

        return data;
    }

    /**
     * Final submit eCheck-in: validates completeness and sets appointment status to PRECHECKIN_COMPLETE.
     */
    @Transactional
    public Map<String, Object> finalSubmitEcheckin(Long patientId, Long appointmentId) {
        log.info("Final eCheck-in submit for patientId: {}, appointmentId: {}", patientId, appointmentId);

        // Verify appointment exists and belongs to patient
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .filter(apt -> apt.getPatientId() != null && apt.getPatientId().equals(patientId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found or does not belong to patient"));

        // Get patient
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        // Validate completeness
        com.ehr.staffservice.dto.RegistrationCompletenessDto completeness = 
                completenessService.computeCompleteness(patient);

        // Check if complete (or at least not CRITICAL)
        if (completeness.getStatus() == com.ehr.staffservice.dto.RegistrationCompletenessDto.CompletenessStatus.CRITICAL) {
            throw new RuntimeException("Cannot complete eCheck-in: Registration is incomplete. " +
                    "Please complete all required fields.");
        }

        // Update appointment status to PRECHECKIN_COMPLETE
        appointment.setStatus("PRECHECKIN_COMPLETE");
        appointmentRepository.save(appointment);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "eCheck-in submitted successfully");
        response.put("appointmentId", appointmentId);
        response.put("status", "PRECHECKIN_COMPLETE");
        response.put("submittedAt", Instant.now());
        response.put("completeness", completeness);

        log.info("eCheck-in final submit completed for patientId: {}, appointmentId: {}", patientId, appointmentId);
        return response;
    }

    /**
     * Get eCheck-in status for an appointment.
     * Returns: PENDING, PRECHECKIN_COMPLETE, or COMPLETE
     */
    public String getEcheckinStatus(Long patientId, Long appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .filter(apt -> apt.getPatientId() != null && apt.getPatientId().equals(patientId))
                .map(apt -> apt.getStatus() != null ? apt.getStatus() : "PENDING")
                .orElse("PENDING");
    }

    private void updateDemographics(Patient patient, EcheckinSubmissionDto.DemographicsData data) {
        // Update primary address
        List<PatientAddress> existingAddresses = addressRepository.findByPatientIdAndIsPrimary(
                patient.getPatientId(), true);

        PatientAddress address;
        if (!existingAddresses.isEmpty()) {
            address = existingAddresses.get(0);
            address.setAddressLine1(data.getAddressLine1());
            address.setAddressLine2(data.getAddressLine2());
            address.setCity(data.getCity());
            address.setStateProvince(data.getState());
            address.setPostalCode(data.getZip());
        } else {
            // Create new primary address
            address = new PatientAddress();
            address.setPatientId(patient.getPatientId());
            address.setAddressLine1(data.getAddressLine1());
            address.setAddressLine2(data.getAddressLine2());
            address.setCity(data.getCity());
            address.setStateProvince(data.getState());
            address.setPostalCode(data.getZip());
            address.setIsPrimary(true);
        }
        addressRepository.save(address);

        log.debug("Updated demographics for patientId: {}", patient.getPatientId());
    }

    private void updateContact(Patient patient, EcheckinSubmissionDto.ContactData data) {
        // Update patient phone and email
        if (data.getPhoneNumber() != null) {
            patient.setPhoneNumber(data.getPhoneNumber());
        }
        if (data.getEmail() != null) {
            patient.setEmail(data.getEmail());
        }
        patientRepository.save(patient);

        // Update or create contact preferences
        // Note: PatientContact is for emergency/guardian contacts, not patient's own contact info
        // For eCheck-in, we store preferences in the Patient entity itself
        // If needed, we could create a separate PatientPreferences entity
        log.debug("Updated contact preferences for patientId: {} (stored in Patient entity)", 
                patient.getPatientId());
    }

    private void updateInsurance(Patient patient, EcheckinSubmissionDto.InsuranceData data) {
        // TODO: Update insurance information
        // This would typically update the Insurance entity or Coverage entity
        log.debug("Insurance update requested for patientId: {} - Implementation pending", 
                patient.getPatientId());
    }

    private void updateConsents(Patient patient, EcheckinSubmissionDto.ConsentsData data) {
        LocalDate today = LocalDate.now();

        // HIPAA Consent
        if (data.getHipaaConsent() != null && data.getHipaaConsent()) {
            saveOrUpdateConsent(patient.getPatientId(), PatientConsent.TYPE_HIPAA, today);
        }

        // Treatment Consent
        if (data.getTreatmentConsent() != null && data.getTreatmentConsent()) {
            saveOrUpdateConsent(patient.getPatientId(), PatientConsent.TYPE_TREATMENT, today);
        }

        // Financial/Billing Consent
        if (data.getFinancialConsent() != null && data.getFinancialConsent()) {
            saveOrUpdateConsent(patient.getPatientId(), PatientConsent.TYPE_FINANCIAL, today);
        }

        log.debug("Updated consents for patientId: {}", patient.getPatientId());
    }

    private void saveOrUpdateConsent(Long patientId, String consentType, LocalDate consentDate) {
        Optional<PatientConsent> existing = consentRepository.findByPatientIdAndConsentType(
                patientId, consentType);

        PatientConsent consent;
        if (existing.isPresent()) {
            consent = existing.get();
        } else {
            consent = new PatientConsent();
            consent.setPatientId(patientId);
            consent.setConsentType(consentType);
        }

        consent.setConsentSigned(true);
        consent.setStatus(PatientConsent.ConsentStatus.ACTIVE);
        consent.setAcceptedAt(consentDate.atStartOfDay());
        consent.setAcceptedBy(PatientConsent.AcceptedBy.PATIENT);
        consent.setVersion("1.0");
        consent.setSignedBy("Patient (eCheck-in)");

        consentRepository.save(consent);
    }
}

