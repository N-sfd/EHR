package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientOverviewServiceImpl implements PatientOverviewService {

    private final PatientService patientService;
    private final VitalSignService vitalSignService;
    private final WorkListTaskService workListTaskService;
    private final TreatmentTeamService treatmentTeamService;
    private final CarePlanService carePlanService;
    private final AllergyService allergyService;
    private final ClinicalNoteService clinicalNoteService;
    private final AppointmentService appointmentService;

    @Override
    public PatientOverviewDto getPatientOverview(Long patientId) {
        PatientDto patient = patientService.get(patientId);
        
        VitalSignDto latestVitalSigns = null;
        try {
            latestVitalSigns = vitalSignService.getLatestByPatientId(patientId);
        } catch (Exception e) {
            // No vital signs yet
        }
        
        List<VitalSignDto> vitalSignsHistory = vitalSignService.getByPatientId(patientId);
        List<WorkListTaskDto> workListTasks = workListTaskService.getByPatientId(patientId);
        List<TreatmentTeamDto> treatmentTeam = treatmentTeamService.getByPatientIdAndStatus(patientId, "ACTIVE");
        List<CarePlanDto> carePlans = carePlanService.getByPatientIdAndStatus(patientId, "ACTIVE");
        List<AllergyDto> allergies = allergyService.getByPatientIdAndStatus(patientId, "ACTIVE");
        List<ClinicalNoteDto> recentNotes = clinicalNoteService.getByPatientId(patientId)
                .stream()
                .limit(10) // Get 10 most recent
                .toList();
        
        // Get upcoming appointments for this patient
        List<AppointmentDto> allAppointments = appointmentService.getByPatient(patientId);
        List<AppointmentDto> upcomingAppointments = allAppointments.stream()
                .filter(apt -> apt.getAppointmentDate() != null && 
                              (apt.getAppointmentDate().isAfter(LocalDate.now()) || 
                               apt.getAppointmentDate().equals(LocalDate.now())))
                .filter(apt -> !"CANCELLED".equals(apt.getStatus()))
                .limit(10)
                .collect(Collectors.toList());
        
        return PatientOverviewDto.builder()
                .patient(patient)
                .latestVitalSigns(latestVitalSigns)
                .vitalSignsHistory(vitalSignsHistory)
                .workListTasks(workListTasks)
                .treatmentTeam(treatmentTeam)
                .carePlans(carePlans)
                .allergies(allergies)
                .recentNotes(recentNotes)
                .upcomingAppointments(upcomingAppointments)
                .build();
    }

    @Override
    public PatientOverviewDto getPatientOverviewWithDateRange(Long patientId, String startDate, String endDate) {
        // For now, return the same as getPatientOverview
        // Can be enhanced to filter by date range
        return getPatientOverview(patientId);
    }
}

