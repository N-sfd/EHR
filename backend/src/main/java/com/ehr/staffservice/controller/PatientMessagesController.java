package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.service.MessageService;
import com.ehr.staffservice.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for patient messages (inbox).
 * All endpoints require PATIENT role and use patientId from session.
 * Endpoints:
 * - GET /api/patient/messages/threads - List all threads
 * - GET /api/patient/messages/threads/{id} - Get thread with messages
 * - POST /api/patient/messages/threads - Create new thread
 * - POST /api/patient/messages/threads/{id}/messages - Send message
 * - POST /api/patient/messages/threads/{id}/read - Mark as read
 */
@RestController
@RequestMapping("/api/patient/messages")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientMessagesController {

    private final MessageService messageService;

    /**
     * Get all message threads for the current patient.
     * GET /api/patient/messages/threads
     */
    @GetMapping("/threads")
    public ResponseEntity<List<MessageThreadDto>> getThreads(
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<MessageThreadDto> threads = messageService.getThreadsForPatient(patientId);
        return ResponseEntity.ok(threads);
    }

    /**
     * Get a specific thread with all messages.
     * GET /api/patient/messages/threads/{id}
     */
    @GetMapping("/threads/{id}")
    public ResponseEntity<MessageThreadDto> getThread(
            @PathVariable Long id,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            MessageThreadDto thread = messageService.getThreadById(id, patientId);
            return ResponseEntity.ok(thread);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new message thread.
     * POST /api/patient/messages/threads
     */
    @PostMapping("/threads")
    public ResponseEntity<MessageThreadDto> createThread(
            @Valid @RequestBody CreateThreadRequest request,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            MessageThreadDto thread = messageService.createThread(request, patientId);
            return ResponseEntity.status(HttpStatus.CREATED).body(thread);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Send a message in an existing thread.
     * POST /api/patient/messages/threads/{id}/messages
     */
    @PostMapping("/threads/{id}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            MessageDto message = messageService.sendMessage(id, request, patientId);
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Reply to a thread (alias for sendMessage).
     * POST /api/patient/messages/threads/{id}/reply
     */
    @PostMapping("/threads/{id}/reply")
    public ResponseEntity<MessageDto> replyToThread(
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        // Delegate to sendMessage
        return sendMessage(id, request, session);
    }

    /**
     * Mark all messages in a thread as read.
     * POST /api/patient/messages/threads/{id}/read
     */
    @PostMapping("/threads/{id}/read")
    public ResponseEntity<Void> markThreadAsRead(
            @PathVariable Long id,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            messageService.markThreadAsRead(id, patientId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

