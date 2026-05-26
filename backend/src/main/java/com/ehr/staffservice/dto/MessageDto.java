package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDto {
    private Long messageId;
    private Long threadId;
    private Long senderId;
    private String senderType;
    private String senderName; // Computed: patient name or provider name
    private String body;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private Boolean isRead; // Computed: readAt != null
}

