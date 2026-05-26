# Deploy Admin + MyChart + API (combined)

This repository already **combines** the staff admin portal and MyChart patient portal on **one Spring Boot API** and one PostgreSQL database. Production-style routing serves both SPAs from a single host (see root `nginx.conf`).

## Quick start (Docker — recommended)

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker Engine on Linux.

```powershell
# From repository root (Windows)
.\deploy.ps1
```

```bash
# Linux / macOS
cp .env.example .env
docker compose up --build -d
```

| URL | App |
|-----|-----|
| `http://localhost:8080/` | Admin / staff portal |
| `http://localhost:8080/mychart/` | MyChart patient portal |
| `http://localhost:8080/api/health` | API health |

Change the host port with `APP_PORT` in `.env`.

First startup runs Flyway migrations automatically (may take 1–2 minutes).

## Deploy online (VPS / cloud VM)

1. Provision a Linux VM (Azure VM, DigitalOcean Droplet, AWS EC2, etc.) with Docker installed.
2. Clone this repo on the server.
3. Copy `.env.example` → `.env` and set:
   - Strong `POSTGRES_PASSWORD`
   - `APP_COOKIE_SECURE=true` and `EPIC_SMART_COOKIE_SECURE=true` when using HTTPS
   - `EPIC_SMART_REDIRECT_URI` and `EPIC_SMART_FRONTEND_BASE_URL` to your public domain
4. Run `docker compose up --build -d`.
5. Put **HTTPS** in front of port 80:
   - **Caddy** or **nginx** on the host with Let’s Encrypt, proxying to `127.0.0.1:8080`, or
   - Map `web` to port `80:80` in `docker-compose.yml` and use the sample `nginx.conf` at the repo root with real certificates.

### Azure (optional)

- **Azure Container Apps** or **App Service multi-container**: use the same three services (`db`, `api`, `web`) from `docker-compose.yml`; store secrets in Key Vault / app settings.
- **Azure Database for PostgreSQL** with `pgvector`: point `SPRING_DATASOURCE_URL` at the managed instance and run only `api` + `web` containers.

## Local development (without Docker)

1. PostgreSQL 16+ with `pgvector` extension.
2. Backend: `./mvnw spring-boot:run` (port **8087**).
3. Admin: `cd frontend && npm start` → http://localhost:4200
4. MyChart: `cd mychart/mychart-ui && npm start` → http://localhost:4300

Both frontends proxy `/api/*` to the backend.

## Architecture

```
Browser
   │
   ▼
NGINX (web) ── /api/* ──► Spring Boot (api:8087)
   │                           │
   ├── /              admin SPA │
   └── /mychart/      MyChart   └──► PostgreSQL (db)
```

Cookies (`APP_SESSION`, `SMART_SESSION`) work on one domain when both portals are served behind the same host — that is why combined deployment uses one URL.
