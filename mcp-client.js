/**
 * NEXUS A1 → nexus-mcp-server client (Claude / Grok style MCP)
 * Uses service binding NEXUS_MCP_SERVER when available, else MCP_SERVER_URL.
 * Auth: X-Nexus-User-Id + X-Nexus-Signature (HMAC-SHA256 of userId).
 */
const DEFAULT_MCP_URL = "https://nexus-mcp-server.apikeyakhilka.workers.dev";

import { MCP_GATEWAY_CONNECTORS, listMcpGatewayCatalog, mcpOAuthStartPath } from "./mcp-gateway-connectors.js";

function encoder() {
  return new TextEncoder();
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder().encode(value));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signNexusUser(userId, secret) {
  if (!userId || !secret) return null;
  return hmacHex(secret, String(userId));
}

function mcpBase(env) {
  return (env && env.MCP_SERVER_URL) || DEFAULT_MCP_URL;
}

export async function mcpGatewayFetch(env, userId, path, options = {}) {
  const { method = "GET", body = null, headers = {} } = options;
  const secret = env?.NEXUS_INTERNAL_AUTH_SECRET || env?.NEXUS_AUTH_SECRET || env?.MCP_AUTH_SECRET || env?.NEXUS_HMAC_SECRET;
  const signature = await signNexusUser(userId, secret);
  if (!userId || !signature) {
    return { ok: false, status: 401, error: "Missing NEXUS_INTERNAL_AUTH_SECRET or userId", data: null };
  }
  const h = {
    ...headers,
    Accept: "application/json, text/event-stream",
    "X-Nexus-User-Id": String(userId),
    "X-Nexus-Signature": signature
  };
  let payload = body;
  if (body != null && typeof body === "object" && !(body instanceof ArrayBuffer)) {
    h["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const pathClean = path.startsWith("/") ? path : `/${path}`;
  const redirectMode = options.redirect || "follow";
  let res;
  try {
    if (env?.NEXUS_MCP_SERVER && typeof env.NEXUS_MCP_SERVER.fetch === "function") {
      // PHASE_B_DAY37 — use public MCP host (not mcp-internal) so OAuth redirect_uri is valid
      const base = String(mcpBase(env)).replace(/\/$/, "");
      res = await env.NEXUS_MCP_SERVER.fetch(`${base}${pathClean}`, {
        method,
        headers: h,
        body: method === "GET" || method === "HEAD" ? undefined : payload,
        redirect: redirectMode
      });
    } else {
      res = await fetch(`${mcpBase(env)}${pathClean}`, {
        method,
        headers: h,
        body: method === "GET" || method === "HEAD" ? undefined : payload,
        redirect: redirectMode
      });
    }
  } catch (e) {
    return { ok: false, status: 0, error: e?.message || String(e), data: null };
  }
  const location = res.headers.get("location") || null;
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text ? { raw: text } : null;
  }
  const isRedirect = res.status >= 300 && res.status < 400 && !!location;
  return {
    ok: res.ok || isRedirect,
    status: res.status,
    error: (res.ok || isRedirect) ? null : data?.error || data?.message || `HTTP ${res.status}`,
    data,
    headers: Object.fromEntries(res.headers.entries()),
    wwwAuthenticate: res.headers.get("www-authenticate") || null,
    location: res.headers.get("location") || null
  };
}
