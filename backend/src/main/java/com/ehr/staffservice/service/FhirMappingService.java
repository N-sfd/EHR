package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.fhir.FhirPatientDto;
import com.ehr.staffservice.dto.fhir.FhirCoverageDto;
import com.ehr.staffservice.dto.fhir.FhirConsentDto;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.entity.PatientAddress;
import com.ehr.staffservice.entity.PatientContact;
import com.ehr.staffservice.entity.PatientConsent;
import com.ehr.staffservice.entity.patientaccess.Coverage;
import com.ehr.staffservice.repository.PatientContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for mapping between internal entities and FHIR R4 resources.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FhirMappingService {

    private final PatientContactRepository contactRepository;

    /**
     * Get emergency contacts for a patient.
     */
    public List<PatientContact> getEmergencyContacts(Long patientId) {
        return contactRepository.findByPatientIdAndIsEmergencyContact(patientId, true);
    }

    /**
     * Convert Patient entity to FHIR Patient resource.
     */
    public FhirPatientDto toFhirPatient(Patient patient, PatientAddress primaryAddress, 
                                       List<PatientContact> emergencyContacts) {
        FhirPatientDto fhir = new FhirPatientDto();
        fhir.setId("patient" + patient.getPatientId());
        fhir.setResourceType("Patient");

        // Identifier (MRN - using patientCode)
        if (patient.getPatientCode() != null) {
            FhirPatientDto.Identifier identifier = new FhirPatientDto.Identifier();
            identifier.setSystem("http://meritus.org/mrn");
            identifier.setValue(patient.getPatientCode());
            fhir.getIdentifier().add(identifier);
        }

        // Name
        FhirPatientDto.HumanName name = new FhirPatientDto.HumanName();
        name.setUse("official");
        if (patient.getFirstName() != null) {
            name.getGiven().add(patient.getFirstName());
        }
        name.setFamily(patient.getLastName());
        if (patient.getFirstName() != null && patient.getLastName() != null) {
            name.setText(patient.getFirstName() + " " + patient.getLastName());
        }
        fhir.getName().add(name);

        // Gender
        if (patient.getGender() != null) {
            String gender = patient.getGender().toLowerCase();
            if (gender.startsWith("m")) {
                fhir.setGender("male");
            } else if (gender.startsWith("f")) {
                fhir.setGender("female");
            } else {
                fhir.setGender("other");
            }
        }

        // Birth Date
        if (patient.getDateOfBirth() != null) {
            fhir.setBirthDate(patient.getDateOfBirth());
        }

        // Address
        if (primaryAddress != null) {
            FhirPatientDto.Address address = new FhirPatientDto.Address();
            address.setUse("home");
            if (primaryAddress.getAddressLine1() != null) {
                address.getLine().add(primaryAddress.getAddressLine1());
            }
            if (primaryAddress.getAddressLine2() != null) {
                address.getLine().add(primaryAddress.getAddressLine2());
            }
            address.setCity(primaryAddress.getCity());
            address.setState(primaryAddress.getStateProvince());
            address.setPostalCode(primaryAddress.getPostalCode());
            address.setCountry(primaryAddress.getCountry() != null ? primaryAddress.getCountry() : "US");
            fhir.getAddress().add(address);
        }

        // Telecom (phone and email)
        if (patient.getPhoneNumber() != null) {
            FhirPatientDto.ContactPoint phone = new FhirPatientDto.ContactPoint();
            phone.setSystem("phone");
            phone.setValue(patient.getPhoneNumber());
            phone.setUse("mobile");
            fhir.getTelecom().add(phone);
        }
        if (patient.getEmail() != null) {
            FhirPatientDto.ContactPoint email = new FhirPatientDto.ContactPoint();
            email.setSystem("email");
            email.setValue(patient.getEmail());
            email.setUse("home");
            fhir.getTelecom().add(email);
        }

        // Emergency Contact
        if (emergencyContacts != null && !emergencyContacts.isEmpty()) {
            for (PatientContact contact : emergencyContacts) {
                FhirPatientDto.Contact fhirContact = new FhirPatientDto.Contact();
                
                // Relationship
                FhirPatientDto.CodeableConcept relationship = new FhirPatientDto.CodeableConcept();
                relationship.setText(contact.getRelationship() != null ? contact.getRelationship() : "Emergency Contact");
                fhirContact.getRelationship().add(relationship);

                // Name
                FhirPatientDto.HumanName contactName = new FhirPatientDto.HumanName();
                if (contact.getFirstName() != null) {
                    contactName.getGiven().add(contact.getFirstName());
                }
                contactName.setFamily(contact.getLastName());
                if (contact.getFirstName() != null && contact.getLastName() != null) {
                    contactName.setText(contact.getFirstName() + " " + contact.getLastName());
                }
                fhirContact.setName(contactName);

                // Phone
                String phone = contact.getMobilePhone() != null ? contact.getMobilePhone() : 
                              contact.getHomePhone() != null ? contact.getHomePhone() : 
                              contact.getWorkPhone();
                if (phone != null) {
                    FhirPatientDto.ContactPoint contactPhone = new FhirPatientDto.ContactPoint();
                    contactPhone.setSystem("phone");
                    contactPhone.setValue(phone);
                    fhirContact.getTelecom().add(contactPhone);
                }

                fhir.getContact().add(fhirContact);
            }
        }

        return fhir;
    }

    /**
     * Convert Coverage entity to FHIR Coverage resource.
     */
    public FhirCoverageDto toFhirCoverage(Coverage coverage) {
        FhirCoverageDto fhir = new FhirCoverageDto();
        fhir.setId("cov" + coverage.getId());
        fhir.setResourceType("Coverage");
        fhir.setStatus("active");

        // Beneficiary (Patient reference)
        FhirCoverageDto.Reference beneficiary = new FhirCoverageDto.Reference();
        beneficiary.setReference("Patient/patient" + coverage.getPatientId());
        fhir.setBeneficiary(beneficiary);

        // Subscriber ID (Member ID)
        fhir.setSubscriberId(coverage.getMemberId());

        // Payor
        FhirCoverageDto.Reference payor = new FhirCoverageDto.Reference();
        payor.setDisplay(coverage.getPayer());
        fhir.getPayor().add(payor);

        // Period
        if (coverage.getStartDate() != null || coverage.getEndDate() != null) {
            FhirCoverageDto.Period period = new FhirCoverageDto.Period();
            period.setStart(coverage.getStartDate());
            period.setEnd(coverage.getEndDate());
            fhir.setPeriod(period);
        }

        // Order (primary = 1, secondary = 2)
        fhir.setOrder(coverage.getIsPrimary() != null && coverage.getIsPrimary() ? 1 : 2);

        // Class (group number, plan)
        if (coverage.getGroupNumber() != null) {
            FhirCoverageDto.Class groupClass = new FhirCoverageDto.Class();
            FhirCoverageDto.CodeableConcept groupType = new FhirCoverageDto.CodeableConcept();
            groupType.setText("group");
            groupClass.setType(groupType);
            groupClass.setValue(coverage.getGroupNumber());
            fhir.getClassList().add(groupClass);
        }

        return fhir;
    }

    /**
     * Convert PatientConsent entity to FHIR Consent resource.
     */
    public FhirConsentDto toFhirConsent(PatientConsent consent) {
        FhirConsentDto fhir = new FhirConsentDto();
        fhir.setId("consent-" + consent.getId());
        fhir.setResourceType("Consent");
        
        // Use new status field if available, otherwise fallback to consentSigned
        if (consent.getStatus() != null) {
            fhir.setStatus(consent.getStatus() == PatientConsent.ConsentStatus.ACTIVE ? "active" : "inactive");
        } else {
            fhir.setStatus(consent.getConsentSigned() != null && consent.getConsentSigned() ? "active" : "draft");
        }

        // Category
        FhirConsentDto.CodeableConcept category = new FhirConsentDto.CodeableConcept();
        category.setText(consent.getConsentType());
        fhir.getCategory().add(category);

        // Patient reference
        FhirConsentDto.Reference patient = new FhirConsentDto.Reference();
        patient.setReference("Patient/patient" + consent.getPatientId());
        fhir.setPatient(patient);

        // DateTime (use acceptedAt if available)
        if (consent.getAcceptedAt() != null) {
            fhir.setDateTime(consent.getAcceptedAt().atZone(java.time.ZoneId.systemDefault()).toInstant());
        }

        // Policy rule (version)
        FhirConsentDto.CodeableConcept policyRule = new FhirConsentDto.CodeableConcept();
        String version = consent.getVersion() != null ? consent.getVersion() : "1.0";
        policyRule.setText(consent.getConsentType() + "-v" + version);
        fhir.setPolicyRule(policyRule);
        fhir.setVersion(version);

        return fhir;
    }

    /**
     * Update Patient entity from FHIR Patient resource (partial update).
     */
    public void updatePatientFromFhir(Patient patient, FhirPatientDto fhir) {
        // Note: Address updates are handled separately via PatientAddress entity
        // This method is for Patient entity fields only

        // Update telecom (phone/email)
        if (fhir.getTelecom() != null) {
            for (FhirPatientDto.ContactPoint telecom : fhir.getTelecom()) {
                if ("phone".equals(telecom.getSystem()) && telecom.getValue() != null) {
                    patient.setPhoneNumber(telecom.getValue());
                } else if ("email".equals(telecom.getSystem()) && telecom.getValue() != null) {
                    patient.setEmail(telecom.getValue());
                }
            }
        }
    }
}

