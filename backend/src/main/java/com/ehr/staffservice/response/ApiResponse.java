package com.ehr.staffservice.response;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class ApiResponse {
    private boolean success;
    private String message;
    private Object data;
    private Instant timestamp;

    public static ApiResponse ok(Object data, String message) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static ApiResponse fail(String message) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}
