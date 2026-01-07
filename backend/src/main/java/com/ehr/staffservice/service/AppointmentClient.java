// com/ehr/staffservice/service/AppointmentClient.java
package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.AppointmentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;

import java.net.URI;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AppointmentClient {

    private final RestTemplate restTemplate;

    @Value("${appointment-service.base-url}")
    private String appointmentBaseUrl;

    public List<AppointmentDto> getAppointmentsForDoctor(Long doctorId) {
        String url = appointmentBaseUrl + "/appointments/doctors/" + doctorId;

        RequestEntity<Void> request = RequestEntity
                .method(HttpMethod.GET, URI.create(url))
                .build();

        ResponseEntity<List<AppointmentDto>> response = restTemplate.exchange(
                request,
                new ParameterizedTypeReference<>() {}
        );

        return response.getBody();
    }
}
