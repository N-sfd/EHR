interface Env {
  // Full base URL of the deployed Spring Boot backend, e.g. https://ehr-api.onrender.com
  // Configure this in the Cloudflare Pages project: Settings -> Environment variables.
  BACKEND_URL: string;
}

/**
 * Reverse-proxies every /api/* request from the Cloudflare Pages domain to the backend.
 *
 * Why: the app authenticates with a SameSite=Lax, HttpOnly session cookie (APP_SESSION).
 * SameSite=Lax cookies are NOT sent on cross-site fetch/XHR, so the browser must talk to a
 * single origin. By proxying here, the browser only ever sees the Pages origin (same-origin),
 * cookies flow normally, and no CORS configuration is needed on the backend.
 */
export const onRequest = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;

  const backend = (env.BACKEND_URL || '').replace(/\/+$/, '');
  if (!backend) {
    return new Response('BACKEND_URL is not configured for this Cloudflare Pages project.', {
      status: 500,
    });
  }

  const incoming = new URL(request.url);
  const target = `${backend}${incoming.pathname}${incoming.search}`;

  const headers = new Headers(request.headers);
  // Strip Origin/Referer so the backend treats this as a same-origin call. The backend's CORS
  // whitelist only covers local dev origins; the browser already speaks to the Pages origin.
  headers.delete('origin');
  headers.delete('referer');

  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
    init.duplex = 'half';
  }

  return fetch(target, init);
};
