package com.ehr.staffservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Staff Service API",
        version = "1.0",
        description = "API documentation for Staff Service including Staff, Doctors, Patients, Appointments, and related resources"
    )
)
public class OpenApiConfig {
}
