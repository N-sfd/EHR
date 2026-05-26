package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.entity.*;
import com.ehr.staffservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionnaireService {

    private final QuestionnaireAssignmentRepository assignmentRepository;
    private final QuestionnaireResponseRepository responseRepository;

    /**
     * Get all questionnaire assignments for a patient.
     */
    @Transactional(readOnly = true)
    public List<QuestionnaireAssignmentDto> getAssignmentsForPatient(Long patientId) {
        List<QuestionnaireAssignment> assignments = assignmentRepository.findByPatient_PatientIdOrderByDueDateAsc(patientId);
        return assignments.stream()
                .map(this::mapToAssignmentDto)
                .collect(Collectors.toList());
    }

    /**
     * Get questionnaire detail with questions and existing answers.
     */
    @Transactional(readOnly = true)
    public QuestionnaireDetailDto getQuestionnaireDetail(Long assignmentId, Long patientId) {
        QuestionnaireAssignment assignment = assignmentRepository.findByIdAndPatientId(assignmentId, patientId)
                .orElseThrow(() -> new RuntimeException("Assignment not found or access denied"));

        QuestionnaireDetailDto dto = new QuestionnaireDetailDto();
        dto.setAssignmentId(assignment.getAssignmentId());
        dto.setQuestionnaireId(assignment.getQuestionnaire().getQuestionnaireId());
        dto.setQuestionnaireTitle(assignment.getQuestionnaire().getTitle());
        dto.setQuestionnaireDescription(assignment.getQuestionnaire().getDescription());
        dto.setDueDate(assignment.getDueDate());
        dto.setStatus(assignment.getStatus().name());

        // Map questions
        List<QuestionDto> questions = assignment.getQuestionnaire().getQuestions().stream()
                .map(this::mapToQuestionDto)
                .collect(Collectors.toList());
        dto.setQuestions(questions);

        // Load existing responses
        List<QuestionnaireResponse> responses = responseRepository.findByAssignment_AssignmentId(assignmentId);
        Map<Long, AnswerDto> existingAnswers = responses.stream()
                .collect(Collectors.toMap(
                        r -> r.getQuestion().getQuestionId(),
                        this::mapToAnswerDto
                ));
        dto.setExistingAnswers(existingAnswers);

        return dto;
    }

    /**
     * Submit questionnaire answers.
     */
    @Transactional
    public void submitQuestionnaire(Long assignmentId, Long patientId, SubmitQuestionnaireDto submitDto) {
        QuestionnaireAssignment assignment = assignmentRepository.findByIdAndPatientId(assignmentId, patientId)
                .orElseThrow(() -> new RuntimeException("Assignment not found or access denied"));

        if (assignment.getStatus() == QuestionnaireAssignment.AssignmentStatus.COMPLETED) {
            throw new RuntimeException("Questionnaire already completed");
        }

        // Delete existing responses
        List<QuestionnaireResponse> existingResponses = responseRepository.findByAssignment_AssignmentId(assignmentId);
        responseRepository.deleteAll(existingResponses);

        // Create new responses
        for (Map.Entry<Long, AnswerDto> entry : submitDto.getAnswers().entrySet()) {
            Long questionId = entry.getKey();
            AnswerDto answer = entry.getValue();

            // Find question
            QuestionnaireQuestion question = assignment.getQuestionnaire().getQuestions().stream()
                    .filter(q -> q.getQuestionId().equals(questionId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));

            // Validate required
            if (question.getIsRequired() && isEmptyAnswer(answer)) {
                throw new RuntimeException("Required question not answered: " + question.getQuestionText());
            }

            QuestionnaireResponse response = new QuestionnaireResponse();
            response.setAssignment(assignment);
            response.setQuestion(question);
            response.setAnswerText(answer.getAnswerText());
            response.setAnswerNumber(answer.getAnswerNumber());
            response.setAnswerJson(answer.getAnswerJson());

            responseRepository.save(response);
        }

        // Update assignment status
        assignment.setStatus(QuestionnaireAssignment.AssignmentStatus.COMPLETED);
        assignment.setCompletedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
    }

    /**
     * Map QuestionnaireAssignment to DTO.
     */
    private QuestionnaireAssignmentDto mapToAssignmentDto(QuestionnaireAssignment assignment) {
        QuestionnaireAssignmentDto dto = new QuestionnaireAssignmentDto();
        dto.setAssignmentId(assignment.getAssignmentId());
        dto.setQuestionnaireId(assignment.getQuestionnaire().getQuestionnaireId());
        dto.setQuestionnaireTitle(assignment.getQuestionnaire().getTitle());
        dto.setQuestionnaireDescription(assignment.getQuestionnaire().getDescription());
        dto.setPatientId(assignment.getPatient().getPatientId());
        dto.setAssignedDate(assignment.getAssignedDate());
        dto.setDueDate(assignment.getDueDate());
        dto.setStatus(assignment.getStatus().name());
        dto.setIsOverdue(assignment.getDueDate().isBefore(LocalDate.now()) && 
                        assignment.getStatus() != QuestionnaireAssignment.AssignmentStatus.COMPLETED);
        return dto;
    }

    /**
     * Map QuestionnaireQuestion to DTO.
     */
    private QuestionDto mapToQuestionDto(QuestionnaireQuestion question) {
        QuestionDto dto = new QuestionDto();
        dto.setQuestionId(question.getQuestionId());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType().name());
        dto.setOptions(question.getOptions());
        dto.setIsRequired(question.getIsRequired());
        dto.setDisplayOrder(question.getDisplayOrder());
        return dto;
    }

    /**
     * Map QuestionnaireResponse to AnswerDto.
     */
    private AnswerDto mapToAnswerDto(QuestionnaireResponse response) {
        AnswerDto dto = new AnswerDto();
        dto.setAnswerText(response.getAnswerText());
        dto.setAnswerNumber(response.getAnswerNumber());
        dto.setAnswerJson(response.getAnswerJson());
        return dto;
    }

    /**
     * Check if answer is empty.
     */
    private boolean isEmptyAnswer(AnswerDto answer) {
        return (answer.getAnswerText() == null || answer.getAnswerText().trim().isEmpty()) &&
               answer.getAnswerNumber() == null &&
               (answer.getAnswerJson() == null || answer.getAnswerJson().isEmpty());
    }
}

