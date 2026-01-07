package com.ehr.staffservice.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    // Future beans can be added here (RestTemplate, ModelMapper, etc.)
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return new RestTemplate();
    }
}