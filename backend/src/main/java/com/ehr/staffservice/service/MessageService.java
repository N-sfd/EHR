package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.entity.*;
import com.ehr.staffservice.repository.DoctorRepository;
import com.ehr.staffservice.repository.MessageRepository;
import com.ehr.staffservice.repository.MessageThreadRepository;
import com.ehr.staffservice.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageThreadRepository threadRepository;
    private final MessageRepository messageRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    /**
     * Get all threads for a patient.
     */
    @Transactional(readOnly = true)
    public List<MessageThreadDto> getThreadsForPatient(Long patientId) {
        List<MessageThread> threads = threadRepository.findByPatientId(patientId);
        return threads.stream()
                .map(thread -> mapToThreadDto(thread, patientId))
                .collect(Collectors.toList());
    }

    /**
     * Get a specific thread with all messages.
     */
    @Transactional(readOnly = true)
    public MessageThreadDto getThreadById(Long threadId, Long patientId) {
        MessageThread thread = threadRepository.findByIdAndPatientId(threadId, patientId)
                .orElseThrow(() -> new RuntimeException("Thread not found or access denied"));
        
        MessageThreadDto dto = mapToThreadDto(thread, patientId);
        // Load all messages
        List<Message> messages = messageRepository.findByThread_ThreadIdOrderBySentAtAsc(threadId);
        dto.setMessages(messages.stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList()));
        
        return dto;
    }

    /**
     * Create a new thread with initial message.
     */
    @Transactional
    public MessageThreadDto createThread(CreateThreadRequest request, Long patientId) {
        // Verify provider exists
        doctorRepository.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Create thread
        MessageThread thread = new MessageThread();
        thread.setSubject(request.getSubject());
        thread.setCreatedBy(patientId);
        thread.setCreatedByType(MessageThread.ParticipantType.PATIENT);
        thread = threadRepository.save(thread);

        // Add patient as participant
        MessageParticipant patientParticipant = new MessageParticipant();
        patientParticipant.setThread(thread);
        patientParticipant.setParticipantIdRef(patientId);
        patientParticipant.setParticipantType(MessageThread.ParticipantType.PATIENT);
        thread.getParticipants().add(patientParticipant);

        // Add provider as participant
        MessageParticipant providerParticipant = new MessageParticipant();
        providerParticipant.setThread(thread);
        providerParticipant.setParticipantIdRef(request.getProviderId());
        providerParticipant.setParticipantType(MessageThread.ParticipantType.PROVIDER);
        thread.getParticipants().add(providerParticipant);

        thread = threadRepository.save(thread);

        // Create initial message
        Message initialMessage = new Message();
        initialMessage.setThread(thread);
        initialMessage.setSenderId(patientId);
        initialMessage.setSenderType(MessageThread.ParticipantType.PATIENT);
        initialMessage.setBody(request.getBody());
        messageRepository.save(initialMessage);

        return getThreadById(thread.getThreadId(), patientId);
    }

    /**
     * Send a message in an existing thread.
     */
    @Transactional
    public MessageDto sendMessage(Long threadId, SendMessageRequest request, Long patientId) {
        MessageThread thread = threadRepository.findByIdAndPatientId(threadId, patientId)
                .orElseThrow(() -> new RuntimeException("Thread not found or access denied"));

        Message message = new Message();
        message.setThread(thread);
        message.setSenderId(patientId);
        message.setSenderType(MessageThread.ParticipantType.PATIENT);
        message.setBody(request.getBody());
        message = messageRepository.save(message);

        return mapToMessageDto(message);
    }

    /**
     * Mark all messages in a thread as read for the patient.
     */
    @Transactional
    public void markThreadAsRead(Long threadId, Long patientId) {
        // Verify patient has access to thread
        threadRepository.findByIdAndPatientId(threadId, patientId)
                .orElseThrow(() -> new RuntimeException("Thread not found or access denied"));

        messageRepository.markThreadMessagesAsRead(threadId, LocalDateTime.now());
    }

    /**
     * Map MessageThread to DTO (list view - without full messages).
     */
    private MessageThreadDto mapToThreadDto(MessageThread thread, Long patientId) {
        MessageThreadDto dto = new MessageThreadDto();
        dto.setThreadId(thread.getThreadId());
        dto.setSubject(thread.getSubject());
        dto.setCreatedAt(thread.getCreatedAt());
        dto.setUpdatedAt(thread.getUpdatedAt());
        dto.setCreatedBy(thread.getCreatedBy());
        dto.setCreatedByType(thread.getCreatedByType().name());

        // Get last message for preview
        List<Message> messages = thread.getMessages();
        if (!messages.isEmpty()) {
            Message lastMessage = messages.get(messages.size() - 1);
            dto.setLastMessageAt(lastMessage.getSentAt());
            String preview = lastMessage.getBody();
            if (preview.length() > 100) {
                preview = preview.substring(0, 100) + "...";
            }
            dto.setLastMessagePreview(preview);
        }

        // Count unread messages (messages from providers that patient hasn't read)
        long unreadCount = messages.stream()
                .filter(m -> m.getSenderType() != MessageThread.ParticipantType.PATIENT && m.getReadAt() == null)
                .count();
        dto.setUnreadCount(unreadCount);

        // Map participants
        dto.setParticipants(thread.getParticipants().stream()
                .map(this::mapToParticipantDto)
                .collect(Collectors.toList()));

        return dto;
    }

    /**
     * Map Message to DTO.
     */
    private MessageDto mapToMessageDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setMessageId(message.getMessageId());
        dto.setThreadId(message.getThread().getThreadId());
        dto.setSenderId(message.getSenderId());
        dto.setSenderType(message.getSenderType().name());
        dto.setBody(message.getBody());
        dto.setSentAt(message.getSentAt());
        dto.setReadAt(message.getReadAt());
        dto.setIsRead(message.getReadAt() != null);

        // Set sender name
        if (message.getSenderType() == MessageThread.ParticipantType.PATIENT) {
            patientRepository.findById(message.getSenderId())
                    .ifPresent(p -> dto.setSenderName(p.getFirstName() + " " + p.getLastName()));
        } else if (message.getSenderType() == MessageThread.ParticipantType.PROVIDER) {
            doctorRepository.findById(message.getSenderId())
                    .ifPresent(d -> {
                        if (d.getStaff() != null) {
                            dto.setSenderName(d.getStaff().getFirstName() + " " + d.getStaff().getLastName());
                        }
                    });
        }

        return dto;
    }

    /**
     * Map MessageParticipant to DTO.
     */
    private ParticipantDto mapToParticipantDto(MessageParticipant participant) {
        ParticipantDto dto = new ParticipantDto();
        dto.setParticipantIdRef(participant.getParticipantIdRef());
        dto.setParticipantType(participant.getParticipantType().name());

        // Set participant name
        if (participant.getParticipantType() == MessageThread.ParticipantType.PATIENT) {
            patientRepository.findById(participant.getParticipantIdRef())
                    .ifPresent(p -> dto.setParticipantName(p.getFirstName() + " " + p.getLastName()));
        } else if (participant.getParticipantType() == MessageThread.ParticipantType.PROVIDER) {
            doctorRepository.findById(participant.getParticipantIdRef())
                    .ifPresent(d -> {
                        if (d.getStaff() != null) {
                            dto.setParticipantName(d.getStaff().getFirstName() + " " + d.getStaff().getLastName());
                        }
                    });
        }

        return dto;
    }
}

