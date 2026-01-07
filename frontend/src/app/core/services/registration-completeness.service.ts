import { Injectable } from '@angular/core';
import { Patient } from '../models/patient.model';
import { Coverage } from '../models/coverage.model';
import { PatientConsent } from '../models/coverage.model';
import { RegistrationCompleteness, MissingField, RegistrationRequirement } from '../models/registration-completeness.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationCompletenessService {
  private registrationRequirements: RegistrationRequirement = {
    demographicsRequired: [
      'legalName', // firstName + lastName
      'dateOfBirth',
      'birthSex', // sex field
      'phone', // phoneNumber
      'address1', // addressLine1
      'city',
      'state',
      'zip' // pincode or zipCode
    ],
    coverageRequired: [
      'primaryInsurancePayer', // payer from primary coverage
      'memberId' // memberId from primary coverage
    ],
    consentRequired: true
  };

  checkCompleteness(
    patient: Patient,
    coverage?: Coverage | null,
    consent?: PatientConsent | null
  ): RegistrationCompleteness {
    const missing: MissingField[] = [];
    
    // Check Demographics
    const legalName = this.getLegalName(patient);
    if (!legalName) {
      missing.push({
        key: 'legalName',
        field: 'legalName',
        label: 'Legal Name (First & Last)',
        severity: 'CRITICAL',
        section: 'Demographics'
      });
    }

    if (!patient.dateOfBirth) {
      missing.push({
        key: 'dateOfBirth',
        field: 'dateOfBirth',
        label: 'Date of Birth',
        severity: 'CRITICAL',
        section: 'Demographics'
      });
    }

    if (!patient.sex && !patient.gender) {
      missing.push({
        key: 'birthSex',
        field: 'birthSex',
        label: 'Birth Sex',
        severity: 'CRITICAL',
        section: 'Demographics'
      });
    }

    if (!patient.phoneNumber && !patient.phone) {
      missing.push({
        key: 'phone',
        field: 'phone',
        label: 'Phone Number',
        severity: 'CRITICAL',
        section: 'Demographics'
      });
    }

    if (!patient.addressLine1 && !patient.address) {
      missing.push({
        key: 'address1',
        field: 'address1',
        label: 'Address Line 1',
        severity: 'CRITICAL',
        section: 'Demographics'
      });
    }

    if (!patient.city) {
      missing.push({
        key: 'city',
        field: 'city',
        label: 'City',
        severity: 'CRITICAL',
        section: 'Demographics'
      });
    }

    if (!patient.state) {
      missing.push({
        key: 'state',
        field: 'state',
        label: 'State',
        severity: 'CRITICAL',
        section: 'Demographics'
      });
    }

    if (!patient.pincode && !patient.zipCode) {
      missing.push({
        key: 'zip',
        field: 'zip',
        label: 'ZIP Code',
        severity: 'CRITICAL',
        section: 'Demographics'
      });
    }

    // Check email (WARN)
    if (!patient.emailAddress && !patient.email) {
      missing.push({
        key: 'email',
        field: 'email',
        label: 'Email Address',
        severity: 'WARN',
        section: 'Demographics'
      });
    }

    // Check Coverage
    if (!coverage || !coverage.payer) {
      missing.push({
        key: 'primaryInsurancePayer',
        field: 'primaryInsurancePayer',
        label: 'Primary Insurance Payer',
        severity: 'WARN', // Can be configured to CRITICAL
        section: 'Coverage'
      });
    }

    if (!coverage || !coverage.memberId) {
      missing.push({
        key: 'memberId',
        field: 'memberId',
        label: 'Insurance Member ID',
        severity: 'WARN', // Can be configured to CRITICAL
        section: 'Coverage'
      });
    }

    if (coverage) {
      if (coverage.eligibilityStatus === 'NOT_VERIFIED') {
        missing.push({
          key: 'eligibilityStatus',
          field: 'eligibilityStatus',
          label: 'Insurance Eligibility (Not Verified)',
          severity: 'WARN',
          section: 'Coverage'
        });
      } else if (coverage.eligibilityStatus === 'EXPIRED' || coverage.eligibilityStatus === 'INACTIVE') {
        missing.push({
          key: 'eligibilityStatus',
          field: 'eligibilityStatus',
          label: `Insurance Eligibility (${coverage.eligibilityStatus})`,
          severity: 'CRITICAL',
          section: 'Coverage'
        });
      }
    }

    // Check Consent
    if (this.registrationRequirements.consentRequired) {
      if (!consent || !consent.consentSigned) {
        missing.push({
          key: 'consentSigned',
          field: 'consentSigned',
          label: 'Consent Not Signed',
          severity: 'CRITICAL',
          section: 'Consent'
        });
      }
    }

    const blockers = missing.filter(m => m.severity === 'CRITICAL');
    const warnings = missing.filter(m => m.severity === 'WARN');

    // Calculate completeness percentage
    const totalFields = 
      this.registrationRequirements.demographicsRequired.length +
      this.registrationRequirements.coverageRequired.length +
      (this.registrationRequirements.consentRequired ? 1 : 0);
    
    const completedFields = totalFields - missing.length;
    const completenessPct = totalFields > 0 
      ? Math.round((completedFields / totalFields) * 100) 
      : 100;

    return {
      completenessPct,
      missing,
      blockers,
      warnings
    };
  }

  private getLegalName(patient: Patient): string {
    if (patient.firstName && patient.lastName) {
      return `${patient.firstName} ${patient.lastName}`.trim();
    }
    return '';
  }

  getRequirements(): RegistrationRequirement {
    return { ...this.registrationRequirements };
  }

  updateRequirements(requirements: Partial<RegistrationRequirement>): void {
    this.registrationRequirements = {
      ...this.registrationRequirements,
      ...requirements
    };
  }
}

