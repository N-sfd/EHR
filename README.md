## EHR Staff Service — Project Summary

This repository implements a **full-stack Electronic Health Record (EHR) prototype** focused on staff, scheduling, and patient access workflows.
It includes a Spring Boot backend, Angular-based admin and patient portals, and a PostgreSQL database managed via Flyway migrations.

---

## High-Level Architecture

- **Backend (`backend/`)**: Spring Boot REST API (Java 21)
  - Authentication and session management (APP_SESSION + SMART on FHIR)
  - Optional **AI assistant** (`/api/ai/*`): off by default; enable with one env flag (see below)
  - Patient, staff, doctor, and appointment management
  - Schedule grid operations (query, move, resize) with conflict detection
  - Global error handling and PHI-safe logging
  - Flyway database migrations under `src/main/resources/db/migration`
- **Admin Portal (`frontend/`)**: Angular SPA for clinic staff
  - Manage patients, doctors, staff, and appointments
  - Schedule grid UI backed by `/api/appointments` endpoints
  - Uses a dev proxy to call the backend at `/api/...`
  - Loads **`GET /api/features`** at startup; AI Assistant nav and `/admin/ai-assistant` are shown only when `aiEnabled` is true
- **MyChart Patient Portal (`mychart/mychart-ui/`)**: Angular SPA for patients
  - Patient-facing views for appointments, medications, billing, questionnaires, and results
  - Supports SMART on FHIR login in addition to username/password
- **Database**: PostgreSQL 16+
  - Canonical **`appointment`** table for all scheduling data
  - Normalized tables for `patients`, `providers`, `staff`, departments, visit types, etc.

---

## Core Domains & Data Flow

- **Patients**
  - REST endpoints under `/api/patients`
  - Frontend services call these endpoints for create, read, update, and delete operations.
  - Data stored in the `patients` table (demographics, contact info, address, `photo_url`, timestamps).
- **Staff & Doctors**
  - Staff CRUD via `/api/staff`, doctors via `/api/doctors`.
  - Doctors are staff members with additional clinical fields and foreign keys to departments, designations, and specializations.
  - Data persisted across `staff` and `doctors` tables with proper FK relationships.
- **Appointments & Schedule Grid**
  - Canonical endpoints under `/api/appointments`:
    - Query appointments for a time range and providers (grid view).
    - Create and update appointments.
    - Move (drag/drop) and resize operations with conflict checks.
  - All new scheduling logic uses the normalized `appointment` table; older appointment tables are considered legacy.
  - Strong FK relationships from `appointment` to `patients`, `providers`, `departments`, and `visit_types`.

---

## Authentication & Security

- **Phase A (APP_SESSION)**
  - Username/password login via `/api/auth/login`.
  - Issues an `APP_SESSION` HttpOnly cookie with role-based access (ADMIN, PROVIDER, PATIENT).
- **SMART on FHIR (SMART_SESSION)**
  - OAuth-based login path for the MyChart portal.
  - Uses `SMART_SESSION` cookie for patient sessions.
- **Security & Logging**
  - Centralized Spring Security configuration for API protection.
  - Global exception handler with consistent JSON error responses (404, 400, 409, etc.).
  - Logging utilities that mask PHI fields (emails, phone numbers, SSNs, addresses, DOB, photo URLs) in logs.

---

## AI assistant toggle (single env flag)

- **Default**: AI is **disabled**. The app starts without `OPENAI_API_KEY` (Spring AI auto-config is excluded automatically).
- **Enable**: set **`EHR_AI_ENABLED=true`** and provide **`OPENAI_API_KEY`** (and ensure PostgreSQL has the pgvector extension if you use embeddings / vector store).
- **Legacy**: **`APP_AI_ENABLED=true`** is still honored if `EHR_AI_ENABLED` is unset (same behavior).

Optional: **`EHR_AI_AUDIT_ENABLED`** — defaults to the same value as the AI switch when unset; set explicitly to turn AI audit logging on or off.

Optional: **`EHR_AI_STREAMING`** — when `true`, enables **`POST /api/ai/chat/stream`** (SSE). **`GET /api/features`** exposes this as **`aiStreamingEnabled`**. Admin and MyChart chat UIs call the stream endpoint only when both **`aiEnabled`** and **`aiStreamingEnabled`** are true; otherwise they use **`POST /api/ai/chat`** only. If streaming fails (network, 404, parse error), the client **falls back** to the non-streaming chat API.

Stream **`data:`** lines are JSON objects (`AiStreamChunk`): `type` = `token` (field `content`), optional `note` (field `message`, e.g. grounding warning), then final `citations`, then `done`, or `error`.

### Patient-context RAG (chat)

- **`AiPatientChartAggregator`** loads **structured** chart rows for the authorized `patientId`: recent **labs** (with line items), **active medications**, **appointments**, **encounters** (chief complaint, visit reason, notes), and merges **vector** hits from **`ai_document_chunk`** when an embedding model is available (cosine search over stored embeddings; empty if the table has no rows).
- Citations in API responses and the **final** SSE `citations` chunk reflect those real sources (lab / medication / appointment / encounter / vector chunk).
- **Session memory**: up to the last **12** prior `USER`/`ASSISTANT` turns in the same `sessionId` are sent to the model (blocked turns skipped).
- **Safety**: **`app.ai.symptom-review-keywords`** (comma-separated) sets **`needsClinicalReview`** + extra system guidance; emergency keywords unchanged. **`AiHallucinationHeuristic`** flags answers with several multi-digit numbers not present in approved context (`chartGroundingWarning` + optional stream `note`).
- **Audit / observability** (`ai_audit_log`, Flyway **`V1005`**): **`latency_ms`** (existing), **`prompt_tokens`**, **`completion_tokens`**, **`total_tokens`** (populated on **non-streaming** `/api/ai/chat` and when streaming **falls back** to sync), **`success`**, **`error_message`**. Example: `SELECT success, COUNT(*) FROM ai_audit_log WHERE request_type LIKE 'CHAT%' GROUP BY success;`
- **Knowledge ingest** (Flyway **`V1006`** adds `audience`, `portal`, `department_id`, `effective_date`, `status`, `content_version` on **`ai_document_chunk`**): **`POST /api/admin/ai/knowledge/ingest`** (**`ADMIN`** only, requires **`app.ai.enabled`** + embedding model). JSON body: `sourceType`, `sourceRef`, `title`, `body`, optional `patientId`, `audience` (`PATIENT` \| `STAFF` \| `BOTH`), `portal` (`MYCHART` \| `ADMIN` \| `BOTH`), `departmentId`, `effectiveDate`, `status`, `contentVersion`, `replaceExisting`. Text is chunked (~1800 chars), embedded, and stored; `sourceRef` becomes `sourceRef:0`, `:1`, … for each chunk. Vector retrieval **filters** `ACTIVE`, effective date, portal/audience, and **`patient_id IS NULL OR patient_id = ?`** so global FAQs and per-patient chunks coexist.

### Feature flag for Angular (and other clients)

- **`GET /api/features`** — **permit-all**; stable JSON contract from `FeatureFlagsResponse`:
  - `aiEnabled` — mirrors `app.ai.enabled` (same as env / profile switches above).
  - `aiAuditEnabled` — mirrors `app.ai.audit-enabled` (room for future audit indicators or admin-only diagnostics).
  - `aiStreamingEnabled` — mirrors `app.ai.allow-streaming` / **`EHR_AI_STREAMING`** (SSE chat endpoint).
- **`FeatureController` is always registered** (not behind `@ConditionalOnProperty`) so SPAs can decide pre-login.
- The **admin** SPA loads flags during **`APP_INITIALIZER`** so the sidebar and route guard match the backend without probing `/api/ai/*`.
- **MyChart** (`mychart/mychart-ui/`): production-style feature flags
  - `src/app/core/services/feature-flags.models.ts` — `FeatureFlags` (`aiAuditEnabled` optional).
  - `src/app/core/services/feature-flags.service.ts` — `async load()` + signals; `GET /api/features` with `withCredentials: true`.
  - `src/app/app.config.ts` — `APP_INITIALIZER` runs `flags.load()` before bootstrap (with `provideRouter` + `provideHttpClient`).
  - `src/app/features/ai-assistant/pages/mychart-ai-home.component.ts` — gates all AI widgets with `*ngIf="flags.aiEnabled()"` and shows **“AI assistant is currently unavailable.”** when off.
  - Widgets live under `features/ai-assistant/ui/` (chat, lab explainer, medication help, visit prep).
  - Optional `src/app/core/guards/ai-feature.guard.ts` on route `ai` (redirects to `home` when AI is disabled).

### Recommended manual test checklist

**Backend**

- `EHR_AI_ENABLED=false` → `GET /api/features` → `aiEnabled: false` (and `aiAuditEnabled` per `app.ai.audit-enabled`).
- `EHR_AI_ENABLED=true` (and valid config) → `GET /api/features` → `aiEnabled: true`.

**Admin Angular**

- `aiEnabled: false` → `/admin/ai-assistant` redirects (guard); Assistive / AI sidebar link hidden.
- `aiEnabled: true` → route loads; sidebar link visible.

**MyChart**

- **AI OFF** (`EHR_AI_ENABLED=false`): `/api/features` → `aiEnabled: false`; home shows unavailable message; no widgets; navigating to `/ai` (if routed) is blocked by `aiFeatureGuard` → redirect to `home`.
- **AI ON** (`EHR_AI_ENABLED=true` + `OPENAI_API_KEY`): `/api/features` → `aiEnabled: true`; home shows chat + lab explainer + stubs; `/ai` route allowed.
- **Streaming** (`EHR_AI_STREAMING=true` and AI on): chat widgets use **fetch + SSE** for `POST /api/ai/chat/stream` with **Stop generating** (abort) and fallback to **`/api/ai/chat`** on error.

### Optional Spring profile (explicit AI in prod)

- File **`backend/src/main/resources/application-ai.yml`** turns **`ehr.ai.enabled: true`** and expects **`OPENAI_API_KEY`**.
- Activate with e.g. **`--spring.profiles.active=dev,ai`** or **`SPRING_PROFILES_ACTIVE=prod,ai`** so dev/test stay stable and production opts in explicitly.

---

## Development Workflow (Overview)

- **Backend**
  - Java 21 + Spring Boot.
  - Start locally on port `8087` (via Maven or helper PowerShell scripts on Windows).
  - Flyway automatically applies database migrations on startup.
- **Frontend Admin Portal**
  - Angular app under `frontend/`, runs on `http://localhost:4200` in development.
  - Uses a proxy configuration so all `/api/*` calls are forwarded to the backend.
- **MyChart Patient Portal**
  - Angular app under `mychart/mychart-ui/`, typically at `http://localhost:4300` in development.
  - Also configured to call the backend via relative `/api/...` URLs with a dev proxy.

At a high level, the project is designed so both SPAs talk to the same Spring Boot API using relative paths, making it easy to deploy behind a single reverse proxy (for example, NGINX) without CORS issues.

### Combined deployment (Docker)

Admin + MyChart + API + PostgreSQL run together via Docker Compose:

```powershell
.\deploy.ps1
```

- Admin: `http://localhost:8080/`
- MyChart: `http://localhost:8080/mychart/`

See **[DEPLOY.md](DEPLOY.md)** for VPS/cloud HTTPS steps and environment variables.

---

## Clearing patient data and linking MyChart

- **Delete all patient data**: Run `.\delete-all-patients.ps1` from the repo root (requires PostgreSQL and `psql`). This runs `DELETE_ALL_PATIENTS.sql`, which clears the `patients` table and related data (appointments, coverages, insurances, etc.).
- **MyChart ↔ staff-service**: MyChart is already linked to the same backend. In development, start **staff-service** first (`mvn spring-boot:run`), then start MyChart (`cd mychart/mychart-ui && npm start`). The MyChart proxy sends `/api/*` to `http://localhost:8087`.

