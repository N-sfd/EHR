# Epic EHR Walkthrough Documentation

## Table of Contents
1. [Module Overview](#module-overview)
2. [Workflow Diagram](#workflow-diagram)
3. [Screen-by-Screen Walkthrough](#screen-by-screen-walkthrough)
4. [Interview Talking Points](#interview-talking-points)

---

## Module Overview

### Prelude (Patient Access)
**Purpose**: Patient registration, demographics, insurance verification, and check-in.

**Key Features**:
- Patient search and identity management
- Demographics capture and validation
- Insurance coverage management
- Eligibility verification
- Check-in workflow with rule-based validation
- Alerts and flags management

**Users**: Front desk staff, registration clerks

---

### Cadence (Scheduling)
**Purpose**: Provider schedule management and appointment booking.

**Key Features**:
- Provider schedule templates
- Time slot management (15/30/45/60 min)
- Appointment booking with conflict detection
- Visit type configuration
- Overbooking rules
- Calendar views (day/week/month)

**Users**: Schedulers, front desk staff

---

### Ambulatory (Clinical Encounters)
**Purpose**: Clinical documentation, orders, and encounter management.

**Key Features**:
- Encounter creation from appointments
- Nurse rooming (vitals, med reconciliation)
- Provider chart review
- Order entry (labs, imaging, prescriptions)
- Diagnosis coding (ICD-10)
- SOAP note documentation
- Checkout workflow

**Users**: Nurses, providers, clinical staff

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    EPIC EHR WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   PRELUDE    │
│              │
│ 1. Patient   │
│    Search    │──────┐
│              │      │
│ 2. Register  │      │
│    Patient   │      │
│              │      │
│ 3. Demographics│    │
│              │      │
│ 4. Insurance │      │
│    Coverage  │      │
│              │      │
│ 5. Eligibility│    │
│    Verify    │      │
└──────────────┘      │
                      │
                      ▼
              ┌──────────────┐
              │   CADENCE    │
              │              │
              │ 6. Schedule  │
              │    Grid      │
              │              │
              │ 7. Select    │
              │    Time Slot │
              │              │
              │ 8. Book      │
              │    Appointment│
              └──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   PRELUDE    │
              │              │
              │ 9. Check-in  │
              │    Rules     │
              │    Validation│
              │              │
              │ 10. Mark     │
              │     Arrived  │
              │              │
              │ 11. Check-in │
              │     Complete │
              └──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │  AMBULATORY  │
              │              │
              │ 12. Create   │
              │     Encounter│
              │              │
              │ 13. Nurse    │
              │     Rooming  │
              │     - Vitals │
              │     - Med Rec│
              │     - Allergies│
              │              │
              │ 14. Provider │
              │     Encounter│
              │     - Review │
              │     - Orders │
              │     - Diagnoses│
              │     - SOAP   │
              │              │
              │ 15. Checkout │
              └──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   COMPLETE   │
              │              │
              │ Encounter    │
              │ Status:      │
              │ COMPLETED    │
              └──────────────┘
```

---

## Screen-by-Screen Walkthrough

### 1. Patient Search (Prelude)

**Route**: `/prelude/search` or `/demo` (Step 1)

**Purpose**: Locate existing patient or initiate new registration.

**UI Components**:
- Search bar (name, MRN, phone, DOB)
- Search results list with patient cards
- "Create New Patient" button
- Recently accessed patients

**Fields Displayed**:
- Patient Name
- MRN (Medical Record Number)
- DOB / Age
- Phone Number
- Last Visit Date

**Actions**:
- Click patient → Navigate to patient chart
- Click "Create New" → Registration form

**Epic Behaviors**:
- Smart partial matching (fuzzy search)
- Duplicate detection warnings
- Recently accessed list (last 10 patients)

---

### 2. Patient Registration / Demographics (Prelude)

**Route**: `/prelude/patient/:id` or `/admin/prelude/patient/:id`

**Purpose**: Capture and maintain patient identity and contact information.

**Sections**:

#### Identity
- Legal Name (First, Middle, Last)
- Preferred Name
- MRN (auto-generated, read-only)
- SSN (masked display: XXX-XX-1234)

#### Demographics
- Date of Birth
- Birth Sex (Male/Female/Other)
- Gender Identity
- Race/Ethnicity (optional)

#### Contact
- Primary Phone
- Secondary Phone
- Email Address
- Preferred Contact Method

#### Address
- Street Address (Line 1, Line 2)
- City, State, ZIP
- Country
- Address Type (Home/Business/Mailing)

#### Language
- Preferred Language
- Interpreter Required (Y/N)

**Validation Rules**:
- Required: Name, DOB, Sex, Phone
- Email format validation
- ZIP code format
- Age calculation from DOB

**Epic Behaviors**:
- Inline validation (red/yellow warnings)
- Duplicate detection on save
- Audit trail (who changed what, when)

---

### 3. Insurance & Eligibility (Prelude)

**Route**: `/prelude/patient/:id/insurance` or `/admin/prelude/patient/:id/insurance`

**Purpose**: Manage insurance coverage and verify eligibility.

**Coverage Panel**:
- Insurance Plan Name
- Payer Name
- Member ID
- Group Number
- Policy Holder Name
- Relationship to Patient
- Coverage Dates (Start/End)
- Copay Amount
- Deductible Amount

**Eligibility Panel**:
- Eligibility Status:
  - 🟢 **ACTIVE** - Verified and active
  - 🟡 **NOT_VERIFIED** - Needs verification
  - 🔴 **EXPIRED** - Coverage expired
- Last Verified Date
- Verification Method (Manual/EDI/Portal)
- Next Verification Due Date

**Actions**:
- Add Coverage
- Edit Coverage
- Verify Eligibility (triggers EDI check)
- Set as Primary

**Epic Behaviors**:
- Real-time eligibility check (if EDI configured)
- Color-coded status indicators
- Block scheduling if eligibility = EXPIRED (configurable rule)
- Warning banner if NOT_VERIFIED

---

### 4. Scheduling Grid (Cadence)

**Route**: `/scheduling/appointments` or `/admin/appointments/scheduler`

**Purpose**: View provider availability and book appointments.

**Layout**: 3-Zone Split Pane

#### Zone 1: Patient Header (Top Strip)
- Patient Name | MRN | DOB | Age | Sex
- Alerts Badges (Insurance, Allergy, Special Needs)
- Status: Scheduled / Arrived / Checked-In

#### Zone 2: Provider Schedule Grid (Left 65%)
- **Rows**: Time slots (15/30 min intervals)
- **Columns**: Providers or Locations
- **Cells**: Color-coded slots
  - 🟦 **Available** - Open slot
  - 🟥 **Booked** - Appointment scheduled
  - 🟨 **Overbook** - Overbooked slot
  - ⚫ **Blocked** - Provider unavailable

**Interactions**:
- Hover → Show slot details tooltip
- Click → Prefill appointment form
- Drag (admin) → Move appointment

#### Zone 3: Appointment Details Panel (Right 35%)

**Section A: Patient Information (Read-only)**
- Patient Name, MRN, DOB
- Contact Phone
- *Note: Demographics edited in Prelude only*

**Section B: Appointment Basics**
- Appointment Date ✅ (required)
- Start Time ✅ (required)
- Duration ✅ (15/30/45/60 min)
- Visit Type ✅ (drives duration)
- Status (auto: SCHEDULED)

**Section C: Provider & Location**
- Provider ✅ (from template)
- Department ✅
- Location (Physical/Virtual)
- Resource (Room/Equipment)

**Section D: Reason for Visit**
- Visit Reason
- Chief Complaint
- Scheduling Notes

**Section E: Insurance Snapshot (Read-only)**
- Primary Insurance
- Eligibility Status
- Copay Amount
- *Pulled from Prelude*

**Section F: Actions**
- Schedule (saves appointment)
- Reschedule (opens new slot)
- Cancel (requires reason)

**Validation Rules**:
- Slot unavailable → Block selection
- Visit type mismatch → Block
- Provider unavailable → Block
- Insurance expired → Warning/Block (configurable)
- Duplicate appointment → Alert

---

### 5. Check-in (Prelude)

**Route**: `/demo` (Step 3) or integrated in appointment view

**Purpose**: Mark patient arrival and validate registration rules.

**Workflow**:

#### Step 1: Mark as Arrived
- Button: "Mark as Arrived"
- Updates appointment status: `SCHEDULED` → `ARRIVED`
- Records arrival timestamp

#### Step 2: Check-in Validation
- Button: "Check In"
- Validates registration rules:
  - ✅ Insurance eligibility verified
  - ✅ Required demographics complete
  - ✅ Consent forms signed (if required)
  - ✅ No financial holds
  - ✅ No infection alerts

**Validation Errors Display**:
- Red banner with error list
- Each error is actionable (link to fix)
- Cannot proceed until resolved

**Success**:
- Updates appointment status: `ARRIVED` → `CHECKED_IN`
- Records check-in timestamp
- Enables encounter creation

**Epic Behaviors**:
- Rule-based validation (configurable in Admin)
- Inline error display
- Cannot skip validation
- Audit trail

---

### 6. Encounter Creation (Ambulatory)

**Route**: `/demo` (Step 4) or `/ambulatory/encounter`

**Purpose**: Create clinical encounter from checked-in appointment.

**Trigger**: Patient must be `CHECKED_IN`

**Process**:
1. System creates encounter record
2. Links encounter to appointment
3. Sets encounter status: `ROOMING`
4. Assigns encounter number

**Encounter Fields**:
- Encounter ID (auto-generated)
- Patient ID
- Appointment ID (linked)
- Encounter Type (Office Visit/Urgent Care/etc.)
- Status (ROOMING → IN_PROGRESS → COMPLETED)
- Check-in DateTime
- Primary Provider ID

**Next Step**: Navigate to Rooming screen

---

### 7. Nurse Rooming (Ambulatory)

**Route**: `/demo` (Step 5) or `/ambulatory/encounter/:id/rooming`

**Purpose**: Intake documentation before provider sees patient.

**Sections**:

#### Vital Signs
- Blood Pressure (Systolic/Diastolic)
- Temperature (°F, Oral/Temporal)
- Pulse (bpm)
- Respiratory Rate
- Oxygen Saturation (%)
- Height (cm)
- Weight (kg)
- BMI (auto-calculated)

**Epic Behaviors**:
- Trend view available (previous vitals)
- Normal range indicators
- Alert if vitals out of range

#### Chief Complaint
- Free text field
- Used in provider encounter

#### Medication Reconciliation
- Home Medications list
- Discontinued medications
- Add/Remove medications
- Flag drug interactions

#### Allergies
- Known allergies list
- Reactions documented
- Severity (Mild/Moderate/Severe)

**Actions**:
- Save Rooming → Updates encounter status
- Mark as Reviewed
- Flag for Provider Attention

---

### 8. Provider Encounter (Ambulatory)

**Route**: `/demo` (Step 6) or `/ambulatory/encounter/:id/provider`

**Purpose**: Clinical documentation, orders, and diagnoses.

**Sections**:

#### Chart Review (Read-only Snapshot)
- Problems (Active/Resolved)
- Allergies
- Current Medications
- Recent Visits
- Recent Labs
- Vitals Trends

**Epic Pattern**: Everything visible without excessive scrolling, collapsible sections

#### Diagnoses
- Add Diagnosis:
  - ICD-10 code search
  - Description search
  - Problem list update
- Primary vs Secondary diagnosis
- Diagnosis Date
- Status (Active/Resolved)

#### Orders
- **Labs**: CBC, CMP, Lipid Panel, etc.
- **Imaging**: X-Ray, CT, MRI, etc.
- **Referrals**: Specialist referrals
- **Prescriptions**: Medications

**Features**:
- Order sets (pre-configured groups)
- Favorites (frequently used)
- Clinical decision alerts
- Drug-drug interaction checks

#### SOAP Note
- **Subjective**: Patient's description of symptoms
- **Objective**: Clinical findings, vitals, exam
- **Assessment**: Diagnoses, clinical impression
- **Plan**: Treatment plan, follow-ups, orders

**Smart Features**:
- Smart phrases (templates)
- Auto-populate from rooming data
- Voice dictation support (if configured)

**Actions**:
- Save Draft
- Sign Note (finalizes encounter)
- Complete Encounter → Status: `COMPLETED`

---

### 9. Checkout (Ambulatory)

**Route**: `/ambulatory/encounter/:id/checkout`

**Purpose**: Finalize visit, schedule follow-ups, capture billing.

**Sections**:

#### Follow-up Appointment
- Schedule next visit
- Provider selection
- Visit type
- Date/Time selection

#### Referrals
- Specialist referrals
- Referral reason
- Priority (Routine/Urgent)

#### Patient Instructions
- Discharge instructions
- Medication instructions
- Activity restrictions
- Follow-up requirements

#### Billing Capture
- Visit charges
- Copay collection status
- Insurance claim generation

**Actions**:
- Complete Checkout → Finalizes encounter
- Print Instructions
- Send Summary (email/SMS)

---

## Interview Talking Points

### 1. **How does Prelude integrate with Cadence for appointment scheduling?**

**Answer**: Prelude manages patient identity and insurance, which are prerequisites for scheduling. When a scheduler books an appointment in Cadence, the system pulls patient demographics and insurance eligibility from Prelude. If eligibility is expired or not verified, Cadence can block scheduling based on configured rules. The integration ensures data consistency and prevents booking appointments for patients with incomplete registration.

**Key Points**:
- Prelude = Patient data source
- Cadence = Scheduling engine
- Real-time eligibility checks
- Rule-based blocking

---

### 2. **Explain the appointment status lifecycle and when each status is set.**

**Answer**: The appointment lifecycle follows this flow:
1. **REQUESTED** - Patient requests appointment (if request workflow exists)
2. **SCHEDULED** - Appointment booked in Cadence
3. **ARRIVED** - Patient marked as arrived in Prelude
4. **CHECKED_IN** - Check-in validation passed, registration complete
5. **IN_PROGRESS** - Encounter created, provider seeing patient
6. **COMPLETED** - Provider encounter finished, checkout complete
7. **CANCELED** - Appointment canceled (can occur at any point before IN_PROGRESS)

Status transitions are controlled by business rules and cannot be skipped. For example, you cannot create an encounter until status is CHECKED_IN.

---

### 3. **How do registration rules work in Prelude check-in?**

**Answer**: Registration rules are configurable in the Admin module. They define conditions that must be met before a patient can check in. Examples:
- Require insurance eligibility verification
- Require phone number and email
- Block if consent forms missing
- Require guarantor for minors
- Block if financial hold exists

When a patient attempts to check in, the system validates all active rules. If any fail, errors are displayed with actionable links to fix them. The check-in cannot proceed until all rules pass.

**Implementation**: Rules are evaluated in sequence, and results are aggregated. Each rule can be configured with severity (Warning/Block) and visible roles (Front Desk/Nurse/Provider).

---

### 4. **What is the difference between Visit Type and Appointment Type?**

**Answer**: 
- **Visit Type** (Cadence): Clinical classification that drives scheduling behavior
  - Examples: New Patient, Follow-up, Consultation, Procedure, Annual Physical
  - Defines: Duration, allowed departments, required resources, overbook rules
  - Used for: Schedule template configuration, slot allocation

- **Appointment Type** (General): Physical vs Virtual classification
  - Examples: In Person, Online/Telehealth
  - Used for: Location assignment, resource requirements

Visit Type is more granular and clinical, while Appointment Type is logistical. A "New Patient" visit can be either "In Person" or "Online."

---

### 5. **How does the scheduling grid handle conflicts and overbooking?**

**Answer**: The grid uses color coding to indicate slot status:
- **Blue (Available)**: Open slot, can be booked
- **Red (Booked)**: Appointment scheduled, cannot double-book
- **Yellow (Overbook)**: Overbooked slot (allowed if visit type permits)
- **Black (Blocked)**: Provider unavailable, template blocked time

**Conflict Detection**:
- When booking, system checks for overlapping appointments
- Validates provider availability against schedule template
- Checks visit type restrictions (e.g., pediatric provider can't see adults)
- If conflict detected, booking is blocked with error message

**Overbooking**:
- Controlled by visit type configuration (`allowOverbook` flag)
- Only certain visit types (e.g., "Urgent Care") allow overbooking
- Overbooked slots show in yellow and require admin override

---

### 6. **Describe the medication reconciliation process in rooming.**

**Answer**: Medication reconciliation ensures the patient's current medication list is accurate. The nurse:
1. Reviews home medications list (from previous visits)
2. Asks patient: "Are you still taking these medications?"
3. Marks medications as:
   - **Active** - Still taking
   - **Discontinued** - Stopped taking (with reason/date)
   - **Changed** - Dosage/frequency changed
4. Adds new medications patient started elsewhere
5. Flags potential drug interactions (system alerts)

The reconciled list is then available to the provider during encounter. This prevents medication errors and ensures accurate documentation.

**Epic Best Practice**: Always reconcile at every visit, even if "no changes."

---

### 7. **How are orders entered and what validation occurs?**

**Answer**: Orders are entered in the Provider Encounter screen. Types:
- **Labs**: Blood tests, cultures, etc.
- **Imaging**: X-rays, CT, MRI, ultrasound
- **Referrals**: Specialist consultations
- **Prescriptions**: Medications with dosing, frequency, duration

**Validation**:
- **Clinical Decision Support**: Alerts for drug-drug interactions, allergies, duplicate orders
- **Insurance Coverage**: Checks if order is covered by patient's insurance
- **Provider Authorization**: Some orders require prior authorization
- **Required Fields**: Order type, patient, provider, date

**Order Sets**: Pre-configured groups of orders (e.g., "Annual Physical Order Set" includes CBC, CMP, Lipid Panel). Providers can select order sets to speed entry.

**Epic Feature**: Orders can be saved as "Pending" and signed later, or signed immediately to send to lab/imaging/pharmacy.

---

### 8. **What is the purpose of SOAP notes and how are they structured?**

**Answer**: SOAP notes provide structured clinical documentation:
- **S (Subjective)**: Patient's description of symptoms, chief complaint, history
- **O (Objective)**: Clinical findings, vitals, physical exam, lab results
- **A (Assessment)**: Diagnoses, clinical impression, differential diagnosis
- **P (Plan)**: Treatment plan, medications prescribed, follow-ups, patient instructions

**Epic Features**:
- **Smart Phrases**: Templates (e.g., `@physicalexam` expands to full exam template)
- **Auto-population**: Vitals and rooming data auto-fill Objective section
- **Voice Dictation**: Providers can dictate notes (if configured)
- **Copy Forward**: Copy previous visit's note as starting point

**Best Practice**: SOAP notes should be complete, accurate, and signed before encounter completion. They serve as legal documentation and support billing.

---

### 9. **How does the system handle patient alerts and flags?**

**Answer**: Patient alerts are configured in Admin → Alerts & Warnings. Types:
- **Clinical Alerts**: Allergies, drug interactions, infection precautions
- **Administrative Alerts**: Financial holds, missing documents, insurance issues
- **Special Needs**: Language interpreter, mobility assistance, etc.

**Display**:
- Alerts appear in Patient Header (top strip) on all screens
- Color-coded: Red (Critical), Yellow (Warning), Blue (Info)
- Badge format: Icon + text (e.g., "⚠️ Allergy: Penicillin")

**Visibility**:
- Alerts can be role-based (visible to Front Desk/Nurse/Provider)
- Some alerts are "sticky" (always visible), others are context-specific

**Epic Behavior**: Alerts cannot be dismissed by users; only admins can deactivate them. This ensures critical information is always visible.

---

### 10. **Explain the end-to-end workflow from patient search to encounter completion.**

**Answer**: The complete workflow:

1. **Prelude - Patient Search**: Front desk searches for patient by name/MRN/phone. If not found, creates new patient record.

2. **Prelude - Demographics**: Capture/update patient identity, contact, address, language preferences. Validate required fields.

3. **Prelude - Insurance**: Add insurance coverage, verify eligibility. Set primary coverage.

4. **Cadence - Scheduling**: Scheduler views provider grid, selects available slot, books appointment. System validates eligibility and slot availability.

5. **Prelude - Check-in**: Patient arrives, front desk marks as "Arrived." Then validates registration rules (insurance, demographics, consents). If all pass, marks as "Checked In."

6. **Ambulatory - Encounter Creation**: System creates encounter from checked-in appointment. Status: ROOMING.

7. **Ambulatory - Nurse Rooming**: Nurse records vitals, chief complaint, medication reconciliation, allergies. Saves rooming data.

8. **Ambulatory - Provider Encounter**: Provider reviews chart, adds diagnoses (ICD-10), enters orders (labs/imaging/prescriptions), documents SOAP note. Signs note and completes encounter.

9. **Ambulatory - Checkout**: Schedule follow-up, print instructions, capture billing. Finalize encounter.

**Key Integration Points**:
- Prelude → Cadence: Patient data for scheduling
- Cadence → Prelude: Appointment for check-in
- Prelude → Ambulatory: Check-in status enables encounter
- Ambulatory: Rooming → Provider → Checkout

**Data Flow**: Each module reads/writes to shared database, ensuring real-time consistency. Status transitions are enforced by business logic.

---

## Summary

This Epic EHR system demonstrates a complete patient journey from registration through clinical encounter. The three modules (Prelude, Cadence, Ambulatory) work together seamlessly, with data flowing between them and status transitions controlling the workflow. The system enforces business rules, validates data, and provides a comprehensive audit trail.

**Key Strengths**:
- Modular architecture (clear separation of concerns)
- Rule-based validation (configurable, flexible)
- Status-driven workflow (prevents errors, ensures completeness)
- Real-time integration (data consistency)
- User-friendly UI (Epic-like patterns, keyboard-friendly)

**Best Practices**:
- Always verify insurance eligibility before scheduling
- Complete registration rules before check-in
- Reconcile medications at every visit
- Document SOAP notes completely and accurately
- Use order sets for efficiency
- Follow status lifecycle (don't skip steps)

---

*Document Version: 1.0*  
*Last Updated: 2026-01-05*

