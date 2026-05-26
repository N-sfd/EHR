package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.AppointmentDto;
import com.ehr.staffservice.dto.AppointmentStatusUpdateRequest;
import com.ehr.staffservice.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.ehr.staffservice.config.TestSecurityConfig;
import com.ehr.staffservice.config.SecurityConfig;
import com.ehr.staffservice.config.AppSessionFilter;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = AppointmentController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
    },
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class),
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = AppSessionFilter.class)
    }
)
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @Autowired
    private ObjectMapper objectMapper;

    private AppointmentDto mockAppointmentDto;

    @BeforeEach
    void setUp() {
        mockAppointmentDto = new AppointmentDto();
        mockAppointmentDto.setId(1L);
        mockAppointmentDto.setPatientId(101L);
        mockAppointmentDto.setDoctorId(1L);
        mockAppointmentDto.setStartDateTime(LocalDateTime.of(2026, 1, 25, 9, 0));
        mockAppointmentDto.setEndDateTime(LocalDateTime.of(2026, 1, 25, 9, 30));
        mockAppointmentDto.setDurationMinutes(30);
        mockAppointmentDto.setStatus("CONFIRMED");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_ValidStatus_Returns200() throws Exception {
        // Arrange
        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest();
        request.setStatus("CONFIRMED");
        request.setReason(null);

        mockAppointmentDto.setStatus("CONFIRMED");
        when(appointmentService.updateAppointmentStatus(eq(1L), eq("CONFIRMED"), isNull()))
                .thenReturn(mockAppointmentDto);

        // Act & Assert
        mockMvc.perform(patch("/api/appointments/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_CancelledWithReason_Returns200() throws Exception {
        // Arrange
        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest();
        request.setStatus("CANCELLED");
        request.setReason("Patient requested cancellation");

        mockAppointmentDto.setStatus("CANCELLED");
        when(appointmentService.updateAppointmentStatus(eq(1L), eq("CANCELLED"), eq("Patient requested cancellation")))
                .thenReturn(mockAppointmentDto);

        // Act & Assert
        mockMvc.perform(patch("/api/appointments/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_InvalidStatus_Returns400() throws Exception {
        // Arrange
        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest();
        request.setStatus("INVALID_STATUS");
        request.setReason(null);

        when(appointmentService.updateAppointmentStatus(anyLong(), eq("INVALID_STATUS"), isNull()))
                .thenThrow(new IllegalArgumentException("Invalid status: INVALID_STATUS"));

        // Act & Assert
        mockMvc.perform(patch("/api/appointments/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_AppointmentNotFound_Returns404() throws Exception {
        // Arrange
        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest();
        request.setStatus("CONFIRMED");
        request.setReason(null);

        when(appointmentService.updateAppointmentStatus(eq(999L), eq("CONFIRMED"), isNull()))
                .thenThrow(new com.ehr.staffservice.exception.ResourceNotFoundException("Appointment not found: 999"));

        // Act & Assert
        mockMvc.perform(patch("/api/appointments/999/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_OptimisticLockConflict_Returns409() throws Exception {
        // Arrange
        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest();
        request.setStatus("CONFIRMED");
        request.setReason(null);

        when(appointmentService.updateAppointmentStatus(eq(1L), eq("CONFIRMED"), isNull()))
                .thenThrow(new IllegalStateException("Appointment was modified by another user"));

        // Act & Assert
        mockMvc.perform(patch("/api/appointments/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(header().exists("X-Conflict-Reason"))
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_NoShowWithReason_Returns200() throws Exception {
        // Arrange
        AppointmentStatusUpdateRequest request = new AppointmentStatusUpdateRequest();
        request.setStatus("NO_SHOW");
        request.setReason("Patient did not arrive");

        mockAppointmentDto.setStatus("NO_SHOW");
        when(appointmentService.updateAppointmentStatus(eq(1L), eq("NO_SHOW"), eq("Patient did not arrive")))
                .thenReturn(mockAppointmentDto);

        // Act & Assert
        mockMvc.perform(patch("/api/appointments/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NO_SHOW"));
    }
}

