# Complete Setup Guide - Epic-Inspired EHR Demo

## ✅ What's Included

This is a **complete, production-ready** Epic-inspired EHR demo application with:

### Backend (Spring Boot 3 + Java 21)
- ✅ All REST APIs for Prelude, Cadence, Ambulatory, Admin
- ✅ JPA entities with proper relationships
- ✅ Flyway migrations with seed data
- ✅ DTOs, mappers, services, controllers
- ✅ Swagger/OpenAPI documentation

### Frontend (Angular 17+)
- ✅ All Epic-style UI components
- ✅ Reactive forms (no template-driven)
- ✅ Mock data fallback for offline development
- ✅ Loading and error states
- ✅ Shared reusable components (table, badge, alert, split-pane, tabs)
- ✅ Complete workflow demo

### Database (PostgreSQL)
- ✅ Schema migrations (V1-V5)
- ✅ Seed data (patients, providers, appointments, etc.)

## 🚀 Quick Start (5 Minutes)

### Step 1: Database
```bash
# Create database
createdb staff_db

# Or using psql:
psql -U postgres
CREATE DATABASE staff_db;
\q
```

### Step 2: Backend
```bash
# From project root
mvn clean install
mvn spring-boot:run
```

Backend runs on: **http://localhost:8087**
- Swagger UI: http://localhost:8087/swagger-ui.html

### Step 3: Frontend
```bash
cd frontend
npm install
ng serve
```

Frontend runs on: **http://localhost:4200**

### Step 4: Test
1. Navigate to http://localhost:4200/demo
2. Follow the step-by-step workflow
3. Or use individual features via sidebar

## 📋 Features Checklist

### ✅ Prelude (Patient Access)
- [x] Patient search (name, MRN, phone, DOB)
- [x] Demographics capture/update
- [x] Insurance coverage management
- [x] Eligibility verification
- [x] Check-in workflow with validation
- [x] Patient alerts/flags

**Routes:**
- `/admin/prelude/search` - Patient Search
- `/admin/prelude/patient/:id` - Demographics
- `/admin/prelude/patient/:id/insurance` - Insurance

**APIs:**
- `GET /api/patients?query=` - Search
- `GET /api/patients/{id}` - Get patient
- `GET /api/patients/{id}/coverage` - Get coverage
- `PUT /api/checkin/appointment/{id}/checkin` - Check-in

### ✅ Cadence (Scheduling)
- [x] Provider schedule grid (time slots, color-coded)
- [x] Appointment booking with conflict detection
- [x] Visit type configuration
- [x] Overbooking rules
- [x] Insurance snapshot validation

**Routes:**
- `/scheduling/appointments` - Appointment Scheduler (3-zone)
- `/admin/appointments/scheduler` - Epic Scheduler
- `/admin/appointments/cadence` - Schedule Grid

**APIs:**
- `GET /api/providers` - List providers
- `GET /api/appointments?date=` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}/cancel` - Cancel

### ✅ Ambulatory (Clinical Encounters)
- [x] Encounter creation from appointment
- [x] Nurse rooming (vitals, med reconciliation, allergies)
- [x] Provider chart review
- [x] Order entry (labs, imaging, prescriptions)
- [x] Diagnosis coding (ICD-10)
- [x] SOAP note documentation
- [x] Checkout workflow

**Routes:**
- `/admin/ambulatory/encounter/:encounterId` - Encounter workflow
- `/demo` - Complete workflow demo

**APIs:**
- `POST /api/encounters/from-appointment/{appointmentId}` - Create encounter
- `POST /api/rooming` - Save rooming
- `POST /api/provider-encounters` - Save provider encounter
- `POST /api/checkouts` - Complete checkout

### ✅ Admin Configuration
- [x] Visit type management
- [x] Provider schedule templates
- [x] Registration rules
- [x] Alert/warning configuration

**Routes:**
- `/admin/provider-templates` - Provider templates
- `/admin/schedules` - Schedule templates
- `/admin/registration-rules` - Registration rules
- `/admin/alerts-warnings` - Alerts

**APIs:**
- `GET /api/visit-types` - List visit types
- `GET /api/schedule-templates?providerId=` - Get templates

## 🔄 Complete Workflow

### End-to-End Patient Journey

1. **Patient Search (Prelude)**
   ```
   /admin/prelude/search
   → Search by name/MRN/phone/DOB
   → Select patient or create new
   ```

2. **Demographics & Insurance (Prelude)**
   ```
   /admin/prelude/patient/:id
   → Capture/update patient information
   → Add insurance coverage
   → Verify eligibility
   ```

3. **Schedule Appointment (Cadence)**
   ```
   /scheduling/appointments
   → View provider schedule grid
   → Select time slot
   → Book appointment with validation
   ```

4. **Check-in (Prelude)**
   ```
   /demo (Step 3)
   → Mark patient as arrived
   → Validate registration rules
   → Complete check-in
   ```

5. **Create Encounter (Ambulatory)**
   ```
   /demo (Step 4)
   → System creates encounter from appointment
   → Status: ROOMING
   ```

6. **Nurse Rooming (Ambulatory)**
   ```
   /demo (Step 5)
   → Record vital signs
   → Medication reconciliation
   → Document allergies
   → Chief complaint
   ```

7. **Provider Encounter (Ambulatory)**
   ```
   /demo (Step 6)
   → Chart review
   → Add diagnoses (ICD-10)
   → Enter orders (labs/imaging/prescriptions)
   → Document SOAP note
   → Sign and complete
   ```

8. **Checkout (Ambulatory)**
   ```
   → Schedule follow-up
   → Print instructions
   → Capture billing
   ```

## 🎯 Mock Data Mode

All services automatically fall back to mock data if:
1. `environment.useMock = true` (default)
2. Backend API call fails

**To use real API:**
```typescript
// frontend/src/environments/environment.ts
export const environment = {
  useMock: false  // Use real backend
};
```

## 📊 Database Schema

### Core Tables

**Patient Access (Prelude):**
- `patients` - Patient demographics
- `patient_alerts` - Patient alerts/flags
- `coverages` - Insurance coverage

**Scheduling (Cadence):**
- `providers` - Healthcare providers
- `departments` - Departments/clinics
- `visit_types` - Visit type configurations
- `schedule_templates` - Provider schedule templates
- `appointments` - Appointments

**Ambulatory:**
- `encounters` - Clinical encounters
- `rooming` - Nurse rooming data
- `provider_encounters` - Provider documentation
- `checkouts` - Checkout data

**Admin:**
- `visit_types` - Visit type management
- `schedule_templates` - Schedule templates
- `registration_rules` - Registration rules
- `alert_rules` - Alert configurations

## 🧪 Testing

### Backend
```bash
mvn test
```

### Frontend
```bash
cd frontend
ng test
```

### Manual Testing
1. Start backend: `mvn spring-boot:run`
2. Start frontend: `cd frontend && ng serve`
3. Navigate to http://localhost:4200/demo
4. Follow workflow steps

## 🐛 Troubleshooting

### Backend Issues

**Port 8087 already in use:**
```bash
# Windows
netstat -ano | findstr :8087
taskkill /F /PID <PID>
```

**Database connection error:**
- Verify PostgreSQL is running
- Check credentials in `application.yml`
- Ensure database `staff_db` exists

**Flyway migration errors:**
- Drop and recreate database
- Or set `flyway.baseline-on-migrate: true`

### Frontend Issues

**API calls failing:**
- Verify backend is running on port 8087
- Check `proxy.conf.json` configuration
- Enable mock data: `environment.useMock = true`

**Compilation errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
ng serve
```

## 📚 Documentation

- **README.md** - Main documentation
- **docs/EPIC_WALKTHROUGH.md** - Complete workflow guide
- **docs/REFACTORING_REQUIREMENTS.md** - Code quality requirements
- **docs/FOLDER_RESTRUCTURE_PLAN.md** - Folder structure plan

## ✅ Code Quality

- ✅ No placeholder code ("TODO: implement")
- ✅ All forms are reactive (FormBuilder/FormGroup)
- ✅ All services have mock fallback
- ✅ Strongly typed (TypeScript/Java)
- ✅ Loading and error states
- ✅ No Angular Material (custom SCSS)
- ✅ Production-grade error handling

## 🎉 You're Ready!

The application is **fully functional** and ready to run. All features are implemented end-to-end with proper error handling, mock data fallback, and documentation.

**Next Steps:**
1. Run the setup commands above
2. Test the workflow at `/demo`
3. Explore individual features via sidebar
4. Review Swagger UI for API documentation

---

**Built with ❤️ for Epic-inspired EHR demonstration**

