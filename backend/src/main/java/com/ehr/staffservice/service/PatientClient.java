package com.ehr.staffservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;

@Component
@RequiredArgsConstructor
public class PatientClient {

    private final RestTemplate restTemplate;

    @Value("${patient-service.base-url:http://localhost:8089}")
    private String patientBaseUrl;

    /**
     * Fetch patient details from Patient API
     * @param patientId Patient ID
     * @return Patient data as Object (can be mapped to PatientDto if needed)
     */
    public Object getPatient(Long patientId) {
        String url = patientBaseUrl + "/api/patients/" + patientId;

        try {
            RequestEntity<Void> request = RequestEntity
                    .method(HttpMethod.GET, URI.create(url))
                    .build();

            ResponseEntity<Object> response = restTemplate.exchange(
                    request,
                    org.springframework.core.ParameterizedTypeReference.forType(Object.class)
            );

            return response.getBody();
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch patient from Patient API: " + e.getMessage(), e);
        }
    }

    /**
     * Fetch patient by patient code
     * @param patientCode Patient code (e.g., P-0001)
     * @return Patient data as Object
     */
    public Object getPatientByCode(String patientCode) {
        String url = patientBaseUrl + "/api/patients/code/" + patientCode;

        try {
            RequestEntity<Void> request = RequestEntity
                    .method(HttpMethod.GET, URI.create(url))
                    .build();

            ResponseEntity<Object> response = restTemplate.exchange(
                    request,
                    org.springframework.core.ParameterizedTypeReference.forType(Object.class)
            );

            return response.getBody();
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch patient from Patient API: " + e.getMessage(), e);
        }
    }
}



