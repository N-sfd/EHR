package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.service.QuestionnaireService;
import com.ehr.staffservice.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for patient questionnaires.
 * All endpoints require PATIENT role and use patientId from session.
 */
@RestController
@RequestMapping("/api/questionnaires")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientQuestionnaireController {

    private final QuestionnaireService questionnaireService;

    /**
     * Get all questionnaire assignments for the current patient.
     * GET /api/questionnaires/assigned
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<QuestionnaireAssignmentDto>> getAssignedQuestionnaires(
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<QuestionnaireAssignmentDto> assignments = questionnaireService.getAssignmentsForPatient(patientId);
        return ResponseEntity.ok(assignments);
    }

    /**
     * Get questionnaire detail with questions and existing answers.
     * GET /api/questionnaires/assigned/{assignmentId}
     */
    @GetMapping("/assigned/{assignmentId}")
    public ResponseEntity<QuestionnaireDetailDto> getQuestionnaireDetail(
            @PathVariable Long assignmentId,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            QuestionnaireDetailDto detail = questionnaireService.getQuestionnaireDetail(assignmentId, patientId);
            return ResponseEntity.ok(detail);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Submit questionnaire answers.
     * POST /api/questionnaires/assigned/{assignmentId}/submit
     */
    @PostMapping("/assigned/{assignmentId}/submit")
    public ResponseEntity<Void> submitQuestionnaire(
            @PathVariable Long assignmentId,
            @Valid @RequestBody SubmitQuestionnaireDto submitDto,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            questionnaireService.submitQuestionnaire(assignmentId, patientId, submitDto);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get questionnaire detail by assignment ID (simplified endpoint).
     * GET /api/questionnaires/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuestionnaireDetailDto> getQuestionnaire(
            @PathVariable Long id,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            QuestionnaireDetailDto detail = questionnaireService.getQuestionnaireDetail(id, patientId);
            return ResponseEntity.ok(detail);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Submit questionnaire answers (simplified endpoint).
     * POST /api/questionnaires/{id}/submit
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, Object>> submitQuestionnaireById(
            @PathVariable Long id,
            @Valid @RequestBody SubmitQuestionnaireDto submitDto,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            questionnaireService.submitQuestionnaire(id, patientId, submitDto);
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("submittedAt", java.time.Instant.now().toString());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

