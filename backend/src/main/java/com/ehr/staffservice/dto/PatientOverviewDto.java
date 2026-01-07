package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientOverviewDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private PatientDto patient;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private VitalSignDto latestVitalSigns;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<VitalSignDto> vitalSignsHistory;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<WorkListTaskDto> workListTasks;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<TreatmentTeamDto> treatmentTeam;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<CarePlanDto> carePlans;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<AllergyDto> allergies;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<ClinicalNoteDto> recentNotes;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<AppointmentDto> upcomingAppointments;
}

