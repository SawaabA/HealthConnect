# HealthConnect Monorepo Starter

HealthConnect is a patient-controlled healthcare consent and access layer for the Canadian healthcare ecosystem.  
It does not replace hospital EHRs; it governs scoped, time-bound access to fragmented records with strong auditability.

## Project Overview

Core workflow:

1. Doctor authenticates with Auth0 and requests access.
2. Request includes categories, reason, and duration.
3. Patient or guardian approves/denies.
4. If approved, scoped access grant is issued.
5. Doctor can view only approved categories.
6. Access auto-expires and all events are audited.

Supported roles:

- `patient`
- `guardian`
- `doctor`
- `admin`

Supported record categories:

- `allergies`
- `medications`
- `labs`
- `imaging_reports`
- `referral_notes`
- `emergency_summary`

## Architecture Diagram

```mermaid
flowchart LR
  subgraph Frontend["apps/web (Vite React + Tailwind + Auth0)"]
    UI[Dashboards + Record Viewer]
  end

  subgraph Backend["apps/api (FastAPI + Service Layer)"]
    Routes[Routes]
    Services[Services]
    Repos[Repositories]
    Models[SQLAlchemy Models]
  end

  subgraph Data["PostgreSQL"]
    DB[(users, patients, requests, grants, records, audits, summaries)]
  end

  subgraph Providers["External Providers"]
    Auth0[Auth0 + RBAC]
    Backboard[Backboard.ai Agents]
    ElevenLabs[ElevenLabs TTS]
    VultrObj[Vultr Object Storage]
  end

  UI --> Routes
  Routes --> Services --> Repos --> Models --> DB
  Services --> Backboard
  Services --> ElevenLabs
  Services --> VultrObj
  UI --> Auth0
  Routes --> Auth0
```

## Technology Stack

- Frontend: Vite + React (JSX), TailwindCSS, Auth0 React SDK
- Backend: FastAPI, Pydantic, SQLAlchemy, PostgreSQL
- Infra: Docker, Docker Compose, Vultr deployment placeholders, Vultr Object Storage integration points
- Networking: Tailscale private-network model with optional Tailscale Funnel demo exposure
- Auth: Auth0 + RBAC role model (`patient`, `guardian`, `doctor`, `admin`)
- AI: Backboard provider abstraction (`BackboardProvider`, `MockProvider`)
- Accessibility: ElevenLabs TTS abstraction (`ElevenLabsProvider`, `MockTTSProvider`)

## Demo Backend Decision

Pick one backend contract as your demo source of truth before final QA:

1. `fastapi` mode (default)
   - Web calls `apps/api` endpoints under `/api/v1`.
   - Uses seeded integer IDs (`patient=1`, `guardian=2`, `doctor=3`, `admin=4`).
   - Best when your FastAPI stack is what you are pitching.
2. `legacy` mode (partner Node/Express server)
   - Web calls partner endpoints under `/api/...` on the Vultr host.
   - Supports partner AI agent endpoints (`/api/ai/*`, `/api/reports/generate`).
   - Best when partner backend is what you are pitching.

Switching mode is env-only:

- `VITE_BACKEND_MODE=fastapi` or `VITE_BACKEND_MODE=legacy`
- `VITE_API_URL` / `VITE_FASTAPI_URL` for FastAPI
- `VITE_LEGACY_API_URL` for partner backend

## Monorepo Structure

```text
apps/
  web/                  # Vite React app (partner UX + FastAPI integration)
  api/                  # FastAPI app (routes/services/repositories/providers)

packages/
  ui/                   # Shared UI primitives
  types/                # Shared TypeScript domain types
  config/               # Shared env validation helpers

infra/
  docker-compose.yml
  env/*.env.example
  deployment/README.md  # Vultr + Tailscale deployment placeholders
```

## Backend Service Architecture

`apps/api/app` includes:

- `routes/`: HTTP boundaries and RBAC checks
- `services/`: consent logic, scope enforcement, summary generation, audit writes
- `repositories/`: DB persistence layer
- `schemas/`: Pydantic request/response models
- `models/`: SQLAlchemy tables
- `providers/`: Backboard, ElevenLabs, and storage abstractions

Implemented tables:

- `users`
- `roles`
- `patients`
- `guardians`
- `health_records`
- `record_metadata`
- `access_requests`
- `access_grants`
- `audit_logs`
- `summaries`

## Local Setup

### Option A: Docker Compose (recommended)

```bash
docker compose -f infra/docker-compose.yml up --build
```

Services:

- Web: `http://localhost:3000`
- API: `http://localhost:8000/api/v1`
- PostgreSQL: `localhost:5432`

### Option B: Run manually

1. Install root Node dependencies (shared package resolution):

```bash
npm install
```

2. Install web app dependencies:

```bash
npm install --prefix apps/web
```

3. Install Python dependencies:

```bash
pip install -r apps/api/requirements.txt
```

4. Seed demo data:

```bash
python -m app.scripts.seed
# run from apps/api
```

5. Start API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# run from apps/api
```

6. Start web:

```bash
npm --prefix apps/web run dev
```

## Seed Data Included

Script: `apps/api/app/scripts/seed.py`

Users:

- 1 patient
- 1 guardian
- 1 doctor
- 1 admin

Records:

- allergy record
- medication list
- blood test
- referral note

## Testing

Backend tests in `apps/api/tests` include:

- access request creation
- consent approval
- scope enforcement
- access expiration logic

Run:

```bash
pytest apps/api/tests
```

## Environment Variables

Templates:

- `infra/env/api.env.example`
- `infra/env/web.env.example`
- `infra/env/db.env.example`
- `.env.example`

Key groups:

- Auth0 (web): `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_AUTH0_ROLE_NAMESPACE`
- Web backend routing: `VITE_BACKEND_MODE`, `VITE_API_URL`, `VITE_FASTAPI_URL`, `VITE_LEGACY_API_URL`
- Optional admin UI toggle: `VITE_ENABLE_ADMIN` (`false` by default for demo teams without admin flow)
- Legacy partner mapping (optional): `VITE_LEGACY_PATIENT_ID`, `VITE_LEGACY_DOCTOR_ID`
- FastAPI demo mapping: `VITE_DEMO_PATIENT_ID`, `VITE_DEV_PATIENT_USER_ID`, `VITE_DEV_GUARDIAN_USER_ID`, `VITE_DEV_DOCTOR_USER_ID`, `VITE_DEV_ADMIN_USER_ID`
- Backboard: `AI_PROVIDER`, `BACKBOARD_BASE_URL`, `BACKBOARD_API_KEY`
- ElevenLabs: `TTS_PROVIDER`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
- Vultr Storage: `STORAGE_PROVIDER`, `VULTR_OBJECT_STORAGE_*`, `VULTR_BUCKET_NAME`, credentials
- DB: `DATABASE_URL`
- Tailscale: `TAILSCALE_AUTH_KEY` (deployment-level usage)

## Auth + Network Checklist

Before demo day, verify all of these once:

1. Auth0 app URLs
   - Allowed Callback URLs includes exact frontend URL(s): `http://localhost:3000`, `http://127.0.0.1:3000`, and any Tailscale/Vultr demo URL.
   - Allowed Logout URLs includes the same origins.
   - Allowed Web Origins includes the same origins.
2. Frontend URL consistency
   - Dev server runs on one fixed port (`3000`) using `vite --strictPort`.
   - Do not use mixed ports (`3000` vs `3001`) for the same Auth0 app.
3. API CORS
   - FastAPI `CORS_ORIGINS` includes your frontend origin(s).
   - Partner Node backend allows CORS from your frontend origin(s).
4. Private networking
   - Tailscale is connected on your laptop and server.
   - Database host is reachable over tailnet before starting API.

## Integration Points

### Auth0 + RBAC

- API auth dependency placeholder: `apps/api/app/api/deps.py`
- Replace header-based dev identity with JWT verification middleware.
- Enforce role claims for `patient`, `guardian`, `doctor`, `admin`.

### Vultr Object Storage

- Storage abstraction: `apps/api/app/providers/storage_provider.py`
- Use `VultrObjectStorageProvider` in production.
- Encryption calls are currently placeholders (`_encrypt_placeholder`, `_decrypt_placeholder`).

### Tailscale Networking

- Model documented in `infra/deployment/README.md`.
- Keep API and internal services on private tailnet.
- Optionally expose one demo endpoint via Tailscale Funnel.

### Backboard API

- Provider: `apps/api/app/providers/backboard_provider.py`
- Service usage: `apps/api/app/services/summary_service.py`
- Switch provider by setting `AI_PROVIDER=backboard`.
- Trigger endpoints (FastAPI mode):
  - `POST /api/v1/summaries/patients/{patient_id}/patient-friendly`
  - `POST /api/v1/summaries/requests/{request_id}/doctor-brief`
  - `POST /api/v1/summaries/patients/{patient_id}/audit-digest`

### ElevenLabs API

- Provider: `apps/api/app/providers/elevenlabs_provider.py`
- Service usage: `apps/api/app/services/summary_service.py`
- Switch provider by setting `TTS_PROVIDER=elevenlabs`.

## Roadmap

1. Replace startup `create_all` with Alembic migrations.
2. Add Auth0 JWT verification and claim-based authorization policies.
3. Add async job workers for Backboard and ElevenLabs processing.
4. Add signed URL streaming and secure encryption key management.
5. Implement full emergency break-glass policy and mandatory post-incident review.
6. Add accessibility enhancements, localization, and patient consent history diffing.
# HealthConnect
test
test 2 
