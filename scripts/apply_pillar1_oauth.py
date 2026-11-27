#!/usr/bin/env python3
from pathlib import Path
import sys, re
changes = 0
mcp = Path("mcp-client.js")
c = mcp.read_text(encoding="utf-8")
if "PILLAR1_OAUTH_BRIDGE" not in c and "export async function getMcpOAuthStart" in c:
    pat = re.compile(r"export async function getMcpOAuthStart\(env, userId, connectorId\) \{.*?\n\}", re.S)
    new_fn = r'''export async function getMcpOAuthStart(env, userId, connectorId) {
  // PILLAR1_OAUTH_BRIDGE
  const connector = String(connectorId || "").trim();
  if (!connector) return { success: false, error: "connector required" };
  if (!Object.prototype.hasOwnProperty.call(MCP_GATEWAY_CONNECTORS, connector)) {
    return { success: false, error: "Unknown MCP connector: " + connector };
  }
  const secret = env?.NEXUS_INTERNAL_AUTH_SECRET || env?.NEXUS_AUTH_SECRET || env?.MCP_AUTH_SECRET || env?.NEXUS_HMAC_SECRET;
  const signature = await signNexusUser(userId, secret);
  if (!userId || !signature) {
    return { success: false, connector, error: "Missing NEXUS_INTERNAL_AUTH_SECRET or userId" };
  }
  const base = String(mcpBase(env)).replace(/\/$/, "");
  const path = mcpOAuthStartPath(connector);
  let result = { ok: false, status: 0, error: null, data: null, location: null, headers: {} };
  try {
    const res = await fetch(base + path, {
      method: "GET",
      headers: { Accept: "application/json", "X-Nexus-User-Id": String(userId), "X-Nexus-Signature": signature },
      redirect: "manual"
    });
    const location = res.headers.get("location") || null;
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text ? { raw: text } : null; }
    const isRedirect = res.status >= 300 && res.status < 400 && !!location;
    result = { ok: res.ok || isRedirect, status: res.status, error: (res.ok || isRedirect) ? null : (data?.error || data?.message || ("HTTP " + res.status)), data, location, headers: { location } };
  } catch (e) {
    result = await mcpGatewayFetch(env, userId, path, { method: "GET", redirect: "manual" });
  }
  let location = result.location || result.headers?.location || result.data?.authorize_url || result.data?.url || result.data?.location || null;
  if (location && location.startsWith("/")) location = base + location;
  if (location && /^https?:\/\//i.test(location)) {
    return { success: true, connector, authorize_url: location, status: result.status };
  }
  return { success: false, connector, error: result.error || result.data?.message || "oauth_start_failed", status: result.status, data: result.data, start_path: base + path, authorize_url: null };
}'''
    m = pat.search(c)
    if not m:
        print("mcp fn miss"); sys.exit(1)
    c = c[:m.start()] + new_fn + c[m.end():]
    mcp.write_text(c)
    changes += 1
    print("mcp ok")
else:
    print("mcp skip")

w = Path("worker.ts").read_text(encoding="utf-8")
if "PILLAR1_OAUTH_BRIDGE" in w:
    print("worker skip"); print("DONE", changes); sys.exit(0)

helper = '''// PILLAR1_OAUTH_BRIDGE
async function signMcpOAuthBridge(userId, connector, secret, expSec) {
  const exp = expSec || (Math.floor(Date.now() / 1000) + 900);
  const payload = String(userId) + "|" + String(connector) + "|" + String(exp);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sig = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { exp, sig };
}
async function buildMcpOAuthBridgeUrl(env2, userId, connector) {
  const secret = env2?.NEXUS_INTERNAL_AUTH_SECRET || env2?.NEXUS_AUTH_SECRET || env2?.MCP_AUTH_SECRET || env2?.NEXUS_HMAC_SECRET;
  if (!secret || !userId || !connector) return null;
  try {
    const { exp, sig } = await signMcpOAuthBridge(userId, connector, secret);
    const u = new URL(CONFIG.WORKER_URL + "/oauth/mcp/" + encodeURIComponent(connector));
    u.searchParams.set("u", String(userId));
    u.searchParams.set("e", String(exp));
    u.searchParams.set("s", sig);
    return u.toString();
  } catch (_) { return null; }
}
async function resolveMcpAuthorizeUrl(env2, userId, connector, mcpResult) {
  let url = (mcpResult && (mcpResult.authorize_url || mcpResult.reauth_url)) || null;
  if (url && /^https?:\\/\\//i.test(url)) return url;
  try {
    if (typeof getMcpOAuthStart === "function") {
      const start = await getMcpOAuthStart(env2, userId, connector);
      if (start && start.authorize_url && /^https?:\\/\\//i.test(start.authorize_url)) return start.authorize_url;
    }
  } catch (_) {}
  return await buildMcpOAuthBridgeUrl(env2, userId, connector);
}
__name(signMcpOAuthBridge, "signMcpOAuthBridge");
__name(buildMcpOAuthBridgeUrl, "buildMcpOAuthBridgeUrl");
__name(resolveMcpAuthorizeUrl, "resolveMcpAuthorizeUrl");
var CORS_HEADERS = {'''
if "var CORS_HEADERS = {" not in w:
    print("CORS miss"); sys.exit(1)
w = w.replace("var CORS_HEADERS = {", helper, 1)
changes += 1

route_old = '''    if (pathname === "/oauth/google/login") {
      return await handleOAuthLogin(env2, "google");
    }'''
route_new = '''    {
      const mcpBridge = pathname.match(/^\\/oauth\\/mcp\\/([^/]+)$/);
      if (mcpBridge && request.method === "GET") {
        const connector = decodeURIComponent(mcpBridge[1] || "").trim();
        const userId = url.searchParams.get("u") || "";
        const exp = parseInt(url.searchParams.get("e") || "0", 10);
        const sig = url.searchParams.get("s") || "";
        const secret = env2?.NEXUS_INTERNAL_AUTH_SECRET || env2?.NEXUS_AUTH_SECRET || env2?.MCP_AUTH_SECRET || env2?.NEXUS_HMAC_SECRET;
        const now = Math.floor(Date.now() / 1000);
        let ok = false;
        if (secret && userId && connector && sig && exp >= now) {
          try {
            const payload = String(userId) + "|" + String(connector) + "|" + String(exp);
            const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
            const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
            const expect = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
            ok = expect === sig;
          } catch (_) { ok = false; }
        }
        if (!ok) {
          return new Response("<!doctype html><meta charset=utf-8><title>Link expired</title><body style='font-family:system-ui;padding:2rem'><h1>Authorize link invalid or expired</h1><p>Ask Nexus again for a fresh connect link.</p></body>", { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } });
        }
        try {
          const started = typeof getMcpOAuthStart === "function" ? await getMcpOAuthStart(env2, userId, connector) : null;
          if (started && started.authorize_url && /^https?:\\/\\//i.test(started.authorize_url)) {
            return Response.redirect(started.authorize_url, 302);
          }
          const errMsg = (started && (started.error || (started.data && started.data.message))) || "OAuth start failed";
          return new Response("<!doctype html><meta charset=utf-8><title>Connect</title><body style='font-family:system-ui;padding:2rem'><h1>Could not start OAuth</h1><p>" + String(errMsg).replace(/</g, "<") + "</p></body>", { status: 502, headers: { "Content-Type": "text/html; charset=utf-8" } });
        } catch (e) {
          return new Response("OAuth bridge error", { status: 500 });
        }
      }
    }
    if (pathname === "/oauth/google/login") {
      return await handleOAuthLogin(env2, "google");
    }'''
if route_old not in w:
    print("route miss"); sys.exit(1)
w = w.replace(route_old, route_new, 1)
changes += 1

old_ns = '''    if (mcpResult && mcpResult.oauth_required) {
      // PHASE_B_DAY45 - prefer authorize_url already embedded by callMcpTool
      let authStart = null;
      let authUrl = mcpResult.authorize_url || mcpResult.reauth_url || null;
      if (!authUrl) {
        try { authStart = await getMcpOAuthStart(env2, auth.userId, connector); } catch (_) {}
        authUrl = (authStart && (authStart.authorize_url || authStart.url)) || null;
      }
      // PHASE_B_DAY40 - Claude-style reauth
      const msg = authUrl
        ? ("Please authorize MCP **" + connector + "** first, then ask the same question again.\\n\\n" + authUrl)
        : ("Please authorize MCP **" + connector + "** first. Use action `mcp_oauth_start`.");'''
new_ns = '''    if (mcpResult && mcpResult.oauth_required) {
      const authUrl = await resolveMcpAuthorizeUrl(env2, auth.userId, connector, mcpResult);
      const msg = authUrl
        ? ("Please authorize **MCP " + connector + "** to continue.\\n\\nOpen this link (valid ~15 min):\\n\\n" + authUrl + "\\n\\nAfter you finish, ask the same question again.")
        : ("Please authorize **MCP " + connector + "** first. OAuth bridge could not be built — check NEXUS_INTERNAL_AUTH_SECRET.");'''
if old_ns not in w:
    print("ns miss"); sys.exit(1)
w = w.replace(old_ns, new_ns, 1)
changes += 1

w2, n = re.subn(
    r"let authUrl = mcpResult\.authorize_url \|\| mcpResult\.reauth_url \|\| null;\n\s*if \(!authUrl\) \{\n\s*try \{\n\s*if \(typeof getMcpOAuthStart === \"function\"\) authStart = await getMcpOAuthStart\(env2, userId, forcedMcp\.connector\);\n\s*\} catch \(_\) \{\}\n\s*authUrl = \(authStart && \(authStart\.authorize_url \|\| authStart\.url\)\) \|\| null;\n\s*\}",
    "let authUrl = await resolveMcpAuthorizeUrl(env2, userId, forcedMcp.connector, mcpResult);",
    w,
    count=1,
)
if n:
    w = w2
    changes += 1
    print("stream ok")

Path("worker.ts").write_text(w)
print("DONE", changes)
if changes < 3:
    sys.exit(1)
