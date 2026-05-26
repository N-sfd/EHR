export const environment = {
  production: true,
  // Production API URL options:
  // Option A: Empty string for relative URLs (recommended if using reverse proxy)
  //   - Frontend and backend served from same domain via nginx/Apache
  //   - API calls use relative /api/... URLs
  // Option B: Full HTTPS URL for separate API domain
  //   - Example: apiUrl: 'https://api.yourdomain.com'
  //   - Requires CORS configuration on backend
  apiUrl: '', // Empty = use relative URLs /api/... (recommended for reverse proxy)
  useMock: false // Use real API to save to database
};

