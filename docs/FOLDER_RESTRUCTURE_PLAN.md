# Folder Restructure Plan

## Target Structure

```
src/app/
  core/                    # Core functionality
    guards/                # Auth guards
    interceptors/          # HTTP interceptors
    layout/                # Layout components (header, sidebar)
    models/                # TypeScript models/interfaces
    services/              # Core services (auth, http, etc.)
  
  shared/                  # Reusable UI components
    components/
      table/               # ✅ Created
      badge/               # ✅ Created
      alert-banner/        # ✅ Created
      split-pane/          # ✅ Created
      tabs/                # ✅ Created
  
  features/                # Feature modules
    patient-access/        # Prelude (Patient Search, Demographics, Insurance)
    scheduling/            # Cadence (Appointment Scheduler)
    ambulatory/            # Nurse/Provider workflows
    admin/                 # Admin configuration
    demo/                  # Workflow demo
```

## Migration Steps

### Phase 1: Create Shared Components ✅
- [x] Table component
- [x] Badge component
- [x] Alert Banner component
- [x] Split Pane component
- [x] Tabs component

### Phase 2: Move Prelude Components → patient-access/
**Current Location**: `features/prelude/`
**Target Location**: `features/patient-access/`

Components to move:
- `patient-search/` → `patient-access/patient-search/`
- `patient-demographics/` → `patient-access/patient-demographics/`
- `insurance-eligibility/` → `patient-access/insurance-eligibility/`

### Phase 3: Move Scheduling Components → scheduling/
**Current Location**: `features/scheduling/` (already exists)
**Also move from**: `features/appointment/`
**Target Location**: `features/scheduling/`

Components to move:
- `appointment-scheduler/` (already in scheduling/)
- `epic-scheduler/` → `scheduling/epic-scheduler/`
- `cadence-schedule-grid/` → `scheduling/cadence-schedule-grid/`
- `appointments/` → `scheduling/appointments/`
- `appointment-calendar/` → `scheduling/appointment-calendar/`
- `new-appointment/` → `scheduling/new-appointment/`

### Phase 4: Move Ambulatory Components → ambulatory/
**Current Location**: `features/ambulatory/` (already exists)
**Target Location**: `features/ambulatory/` (no change needed)

Components already in place:
- `ambulatory-encounter/`
- `rooming-form/`
- `provider-encounter-form/`
- `checkout-form/`

### Phase 5: Move Admin Components → admin/
**Current Location**: `features/admin/` (already exists)
**Target Location**: `features/admin/` (no change needed)

Components already in place:
- `provider-templates/`
- `schedules/`
- `registration-rules/`
- `alerts-warnings/`

### Phase 6: Move Demo → demo/
**Current Location**: `features/demo/` (already exists)
**Target Location**: `features/demo/` (no change needed)

### Phase 7: Update Imports
After moving components, update all import paths:
- `features/prelude/` → `features/patient-access/`
- `features/appointment/` → `features/scheduling/`
- Update route paths in `app.routes.ts`

### Phase 8: Update Routes
Update `app.routes.ts` to reflect new paths:
- `/prelude/*` → `/patient-access/*`
- `/appointment/*` → `/scheduling/*`

## Import Path Examples

### Before:
```typescript
import { PatientSearchComponent } from './features/prelude/patient-search/patient-search.component';
import { AppointmentSchedulerComponent } from './features/appointment/epic-scheduler/epic-scheduler.component';
```

### After:
```typescript
import { PatientSearchComponent } from './features/patient-access/patient-search/patient-search.component';
import { AppointmentSchedulerComponent } from './features/scheduling/epic-scheduler/epic-scheduler.component';
```

## Route Path Examples

### Before:
```typescript
{ path: 'prelude/search', ... }
{ path: 'appointment/scheduler', ... }
```

### After:
```typescript
{ path: 'patient-access/search', ... }
{ path: 'scheduling/appointments', ... }
```

## Notes
- Keep existing `features/ambulatory/`, `features/admin/`, and `features/demo/` as-is
- Main changes: `prelude/` → `patient-access/` and `appointment/` → `scheduling/`
- All shared components are now available via `shared/components/index.ts`

