# EHR (Full Stack) — Angular + Spring Boot + PostgreSQL + Flyway

This repository contains a full-stack EHR prototype:
- **Frontend:** Angular (under `/frontend`)
- **Backend:** Spring Boot (under `/backend`)
- **Database:** PostgreSQL
- **Migrations:** Flyway (`backend/src/main/resources/db/migration`)

---

## Prerequisites

### Required
- **Java 21** (installed ✅)
- **Node.js 18+** and **npm**
- **PostgreSQL 16+** (or 17)
- **Git**

### Recommended (Windows)
- PowerShell 5+ (or PowerShell 7)

---

## Repository Structure

```txt
EHR/
  backend/                         # Spring Boot API
  frontend/                        # Angular UI
  create-database.sql              # DB creation helper
  create-staff-db.ps1              # PowerShell helper to create DB
  start-backend.ps1                # PowerShell helper to start backend
  check-backend.ps1                # PowerShell helper to check backend health
  docs/                            # Project docs & walkthroughs
