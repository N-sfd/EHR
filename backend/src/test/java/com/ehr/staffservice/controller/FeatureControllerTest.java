package com.ehr.staffservice.controller;

import com.ehr.staffservice.config.AiProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class FeatureControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AiProperties aiProperties;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new FeatureController(aiProperties)).build();
    }

    @Test
    void returnsAiEnabledFalse() throws Exception {
        when(aiProperties.isEnabled()).thenReturn(false);
        when(aiProperties.isAuditEnabled()).thenReturn(false);
        when(aiProperties.isAllowStreaming()).thenReturn(false);
        mockMvc.perform(get("/api/features").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.aiEnabled").value(false))
                .andExpect(jsonPath("$.aiAuditEnabled").value(false))
                .andExpect(jsonPath("$.aiStreamingEnabled").value(false));
    }

    @Test
    void returnsAiEnabledTrue() throws Exception {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(aiProperties.isAuditEnabled()).thenReturn(true);
        when(aiProperties.isAllowStreaming()).thenReturn(true);
        mockMvc.perform(get("/api/features").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aiEnabled").value(true))
                .andExpect(jsonPath("$.aiAuditEnabled").value(true))
                .andExpect(jsonPath("$.aiStreamingEnabled").value(true));
    }
}
