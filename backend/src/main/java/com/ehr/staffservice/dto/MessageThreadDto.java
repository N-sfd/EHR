package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MessageThreadDto {
    private Long threadId;
    private String subject;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private String createdByType;
    private List<MessageDto> messages;
    private List<ParticipantDto> participants;
    private Long unreadCount; // Count of unread messages for current patient
    private String lastMessagePreview; // Preview of last message
    private LocalDateTime lastMessageAt; // When last message was sent
}

