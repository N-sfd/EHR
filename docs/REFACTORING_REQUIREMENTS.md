# Code Quality Requirements & Refactoring Status

## Requirements
1. ✅ No placeholder text like "TODO: implement" - All functionality must be working
2. ✅ No Angular Material - Use custom SCSS and reusable components
3. ✅ All forms must be reactive forms (FormBuilder, FormGroup, FormControl)
4. ✅ All services must be strongly typed
5. ✅ Add loading + error states for each API call
6. ✅ Add mock fallback data for offline dev

## Current Status

### ✅ Completed
- Auth service created (`core/services/auth.service.ts`) - Replaces all TODO auth comments
- Most admin components use reactive forms
- Scheduling components use reactive forms
- Most services have error handling

### 🔄 In Progress
- Converting template-driven forms to reactive forms
- Removing Angular Material dependencies
- Adding mock fallback to all services

### ⚠️ Needs Fixing

#### Components Using Template-Driven Forms (ngModel)
1. `workflow-demo.component.ts` - Rooming and Provider forms
2. `rooming-form.component.ts` - All vitals fields
3. `provider-encounter-form.component.ts` - All fields
4. `checkout-form.component.ts` - All fields
5. `patient-demographics.component.ts` - All fields
6. `epic-scheduler.component.ts` - Appointment form
7. `cadence-schedule-grid.component.ts` - Search/filter inputs
8. `patient-search.component.ts` - Search input
9. `insurance-eligibility.component.ts` - Filter inputs
10. `appointments.component.ts` - Filter inputs
11. `patients.component.ts` - Search/filter inputs
12. `add-edit-patient.component.ts` - Large form with many fields

#### Components Using Angular Material
1. `new-appointment.component.ts` - MatDialog
2. `add-doctor.component.ts` - Multiple Material modules
3. `add-patient-dialog.component.ts` - Multiple Material modules
4. `compliance.component.ts` - Multiple Material modules

#### Services Needing Mock Fallback
- Most services have error handling but need explicit mock data fallback
- Services should check `environment.useMock` and return mock data

#### TODO Comments to Fix
1. `rooming-form.component.ts:24` - `roomedByStaffId: 1, // TODO: Get from auth`
2. `provider-encounter-form.component.ts:24` - `providerId: 1, // TODO: Get from auth`
3. `checkout-form.component.ts:24` - `checkedOutByStaffId: 1, // TODO: Get from auth`

## Implementation Plan

### Phase 1: Fix Auth TODOs
- ✅ Created `AuthService`
- Replace all `// TODO: Get from auth` with `authService.getCurrentStaffId()`

### Phase 2: Convert Forms to Reactive
- Convert workflow-demo rooming form
- Convert workflow-demo provider form
- Convert rooming-form component
- Convert provider-encounter-form component
- Convert checkout-form component
- Convert patient-demographics component
- Convert epic-scheduler component
- Convert remaining components

### Phase 3: Remove Angular Material
- Replace MatDialog with custom modal component
- Replace Material form fields with custom inputs
- Replace Material buttons with custom buttons
- Replace Material icons with FontAwesome

### Phase 4: Add Mock Fallback
- Update all services to check `environment.useMock`
- Add mock data methods to each service
- Ensure components handle mock data gracefully

### Phase 5: Add Loading/Error States
- Ensure all API calls have loading indicators
- Ensure all API calls have error messages
- Add retry mechanisms where appropriate

## Notes
- All placeholder text should be removed or implemented
- All forms should use FormBuilder and FormGroup
- All services should return Observable<T> with proper typing
- Mock data should be comprehensive and realistic

