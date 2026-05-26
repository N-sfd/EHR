package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.MedicationDto;
import com.ehr.staffservice.dto.RefillRequestDto;
import com.ehr.staffservice.dto.CreateRefillRequestDto;
import com.ehr.staffservice.entity.PatientMedication;
import com.ehr.staffservice.entity.RefillRequest;
import com.ehr.staffservice.repository.PatientMedicationRepository;
import com.ehr.staffservice.repository.RefillRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final PatientMedicationRepository medicationRepository;
    private final RefillRequestRepository refillRequestRepository;

    /**
     * Get all medications for a patient (active and inactive).
     */
    @Transactional(readOnly = true)
    public List<MedicationDto> getMedicationsForPatient(Long patientId) {
        List<PatientMedication> medications = medicationRepository.findByPatient_PatientIdOrderByPrescribedDateDesc(patientId);
        return medications.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a refill request for a medication.
     */
    @Transactional
    public RefillRequestDto createRefillRequest(Long patientId, CreateRefillRequestDto request) {
        PatientMedication medication = medicationRepository.findById(request.getMedicationId())
                .orElseThrow(() -> new RuntimeException("Medication not found"));

        // Verify medication belongs to patient
        if (!medication.getPatient().getPatientId().equals(patientId)) {
            throw new RuntimeException("Medication does not belong to patient");
        }

        RefillRequest refillRequest = new RefillRequest();
        refillRequest.setMedication(medication);
        refillRequest.setPatient(medication.getPatient());
        refillRequest.setNotes(request.getNotes());
        refillRequest.setStatus(RefillRequest.RequestStatus.PENDING);

        RefillRequest saved = refillRequestRepository.save(refillRequest);
        return mapRefillRequestToDto(saved);
    }

    /**
     * Create a refill request for a medication by medication ID.
     */
    @Transactional
    public RefillRequestDto createRefillRequestByMedId(Long patientId, Long medicationId, String notes) {
        PatientMedication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new RuntimeException("Medication not found"));

        // Verify medication belongs to patient
        if (!medication.getPatient().getPatientId().equals(patientId)) {
            throw new RuntimeException("Medication does not belong to patient");
        }

        RefillRequest refillRequest = new RefillRequest();
        refillRequest.setMedication(medication);
        refillRequest.setPatient(medication.getPatient());
        refillRequest.setNotes(notes);
        refillRequest.setStatus(RefillRequest.RequestStatus.PENDING);

        RefillRequest saved = refillRequestRepository.save(refillRequest);
        return mapRefillRequestToDto(saved);
    }

    /**
     * Get all refill requests for a patient.
     */
    @Transactional(readOnly = true)
    public List<RefillRequestDto> getRefillRequestsForPatient(Long patientId) {
        List<RefillRequest> requests = refillRequestRepository.findByPatient_PatientIdOrderByRequestedAtDesc(patientId);
        return requests.stream()
                .map(this::mapRefillRequestToDto)
                .collect(Collectors.toList());
    }

    /**
     * Map PatientMedication entity to DTO.
     */
    private MedicationDto mapToDto(PatientMedication medication) {
        MedicationDto dto = new MedicationDto();
        dto.setMedicationId(medication.getMedicationId());
        dto.setPatientId(medication.getPatient().getPatientId());
        dto.setMedicationName(medication.getMedicationName());
        dto.setCommonName(medication.getCommonName());
        dto.setDosage(medication.getDosage());
        dto.setFrequency(medication.getFrequency());
        dto.setInstructions(medication.getInstructions());
        dto.setPrescribedDate(medication.getPrescribedDate());
        dto.setPrescriptionNumber(medication.getPrescriptionNumber());
        dto.setQuantity(medication.getQuantity());
        dto.setDaySupply(medication.getDaySupply());
        dto.setPharmacyName(medication.getPharmacyName());
        dto.setPharmacyAddress(medication.getPharmacyAddress());
        dto.setPharmacyCity(medication.getPharmacyCity());
        dto.setPharmacyState(medication.getPharmacyState());
        dto.setPharmacyZip(medication.getPharmacyZip());
        dto.setPharmacyPhone(medication.getPharmacyPhone());
        dto.setRefillsRemaining(medication.getRefillsRemaining());
        dto.setIsActive(medication.getIsActive());
        dto.setIsExternal(medication.getIsExternal());

        if (medication.getPrescriber() != null) {
            dto.setPrescriberId(medication.getPrescriber().getStaffId());
            dto.setPrescriberName(
                    medication.getPrescriber().getFirstName() + " " + medication.getPrescriber().getLastName()
            );
        }

        return dto;
    }

    /**
     * Map RefillRequest entity to DTO.
     */
    private RefillRequestDto mapRefillRequestToDto(RefillRequest request) {
        RefillRequestDto dto = new RefillRequestDto();
        dto.setRequestId(request.getRequestId());
        dto.setMedicationId(request.getMedication().getMedicationId());
        dto.setMedicationName(request.getMedication().getMedicationName());
        dto.setPatientId(request.getPatient().getPatientId());
        dto.setNotes(request.getNotes());
        dto.setStatus(request.getStatus().name());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setProcessedAt(request.getProcessedAt());
        return dto;
    }
}
