const PROXY_CONFIG = {
  "/api/staff": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/departments": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/designations": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/roles": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/specializations": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/clinic-settings": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/jobs": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/rbac": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/doctors": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/locations": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "silent"
  },
  "/api/appointments": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/services": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/positions": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/auth": {
    target: "http://localhost:8088",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/patients": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn",
    timeout: 30000,
    proxyTimeout: 30000
  },
  "/api/vital-signs": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/work-list-tasks": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/treatment-teams": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/care-plans": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/allergies": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/clinical-notes": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/medications": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/medication-administrations": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/orders": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/lab-results": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/imaging-studies": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/patient-overview": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/problem-lists": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/immunizations": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/procedures": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/flowsheets": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/clinical-alerts": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/patient-demographics": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/patient-addresses": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/patient-contacts": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/insurances": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/eligibility-verifications": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/encounters": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/schedule-grid": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/rooming": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/provider-encounters": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/checkouts": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  },
  "/api/checkin": {
    target: "http://localhost:8087",
    secure: false,
    changeOrigin: true,
    logLevel: "warn"
  }
};

module.exports = PROXY_CONFIG;
