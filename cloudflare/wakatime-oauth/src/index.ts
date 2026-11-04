interface Env {
  WAKATIME_CLIENT_ID: string;
  WAKATIME_CLIENT_SECRET: string;
  WAKATIME_REDIRECT_URIS: string;
  ALLOWED_ORIGINS?: string;
}

const TOKEN_URL = "https://wakatime.com/oauth/token";
const REVOKE_URL = "https://wakatime.com/oauth/revoke";

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function corsHeaders(request: Request, env: Env): HeadersInit | null {
  const origin = request.headers.get("Origin");
  if (!origin) return {};
  const allowed = (env.ALLOWED_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  if (!allowed.includes(origin)) return null;
  return { "Access-Control-Allow-Origin": origin, "Vary": "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
}

function allowedRedirect(uri: string, env: Env) {
  return (env.WAKATIME_REDIRECT_URIS ?? "").split(",").map((value) => value.trim()).filter(Boolean).includes(uri);
}

async function handleToken(request: Request, env: Env) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.grant_type !== "string") return json({ error: "invalid_request" }, 400);
  const form = new URLSearchParams({
    client_id: env.WAKATIME_CLIENT_ID,
    client_secret: env.WAKATIME_CLIENT_SECRET,
    grant_type: body.grant_type,
  });
  if (typeof body.redirect_uri !== "string" || !allowedRedirect(body.redirect_uri, env)) {
    return json({ error: "invalid_request", error_description: "Unrecognized redirect URI" }, 400);
  }
  form.set("redirect_uri", body.redirect_uri);
  if (body.grant_type === "authorization_code") {
    if (typeof body.code !== "string") return json({ error: "invalid_request", error_description: "Missing authorization code" }, 400);
    form.set("code", body.code);
  } else if (body.grant_type === "refresh_token") {
    if (typeof body.refresh_token !== "string") return json({ error: "invalid_request" }, 400);
    form.set("refresh_token", body.refresh_token);
  } else {
    return json({ error: "unsupported_grant_type" }, 400);
  }

  const upstream = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: form,
  });
  const result = await upstream.json().catch(() => ({ error: "upstream_error" }));
  return json(result, upstream.status);
}

async function handleRevoke(request: Request, env: Env) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.token !== "string") return json({ error: "invalid_request" }, 400);
  const form = new URLSearchParams({
    client_id: env.WAKATIME_CLIENT_ID,
    client_secret: env.WAKATIME_CLIENT_SECRET,
    token: body.token,
  });
  const upstream = await fetch(REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: form,
  });
  const result = await upstream.text();
  return new Response(result || null, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);
    if (!cors) return json({ error: "origin_not_allowed" }, 403);
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);
    try {
      const response = url.pathname === "/oauth/token"
        ? await handleToken(request, env)
        : url.pathname === "/oauth/revoke"
          ? await handleRevoke(request, env)
          : json({ error: "not_found" }, 404);
      const headers = new Headers(response.headers);
      new Headers(cors).forEach((value, key) => headers.set(key, value));
      return new Response(response.body, { status: response.status, headers });
    } catch {
      return json({ error: "server_error" }, 502, cors);
    }
  },
};
