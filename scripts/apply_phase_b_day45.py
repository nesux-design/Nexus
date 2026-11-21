#!/usr/bin/env python3
from pathlib import Path
import sys

mcp = Path("mcp-client.js")
c = mcp.read_text(encoding="utf-8")
if "PLACEHOLDER" in c[:200]:
    print("BAD PLACEHOLDER"); sys.exit(1)
if "PHASE_B_DAY45" in c:
    print("already day45 mcp")
else:
    old = """export async function callMcpTool(env, userId, connector, name, args = {}) {
  const rpc = {
    jsonrpc: \"2.0\",
    id: crypto.randomUUID(),
    method: \"tools/call\",
    params: { name, arguments: args && typeof args === \"object\" ? args : {} }
  };
  const r = await mcpGatewayFetch(env, userId, `/mcp/${encodeURIComponent(connector)}`, {
    method: \"POST\",
    body: rpc
  });
  if (!r.ok) {
    const errStr = String(r.error || (r.data && (r.data.error || r.data.message)) || \"\");
    const oauthNeeded =
      r.status === 401 ||
      /provider_authorization_required|oauth_required|authorization required|unauthorized/i.test(errStr);
    return {
      success: false,
      status: r.status,
      error: r.error,
      oauth_required: oauthNeeded,
      wwwAuthenticate: r.wwwAuthenticate,
      data: r.data
    };
  }
  return { success: true, data: r.data?.result || r.data, raw: r.data };
}"""
    new = """export async function callMcpTool(env, userId, connector, name, args = {}) {
  // PHASE_B_DAY45 - on oauth_required, embed authorize_url here (single source for stream + non-stream)
  const rpc = {
    jsonrpc: \"2.0\",
    id: crypto.randomUUID(),
    method: \"tools/call\",
    params: { name, arguments: args && typeof args === \"object\" ? args : {} }
  };
  const r = await mcpGatewayFetch(env, userId, `/mcp/${encodeURIComponent(connector)}`, {
    method: \"POST\",
    body: rpc
  });
  if (!r.ok) {
    const errStr = String(r.error || (r.data && (r.data.error || r.data.message)) || \"\");
    const oauthNeeded =
      r.status === 401 ||
      /provider_authorization_required|oauth_required|authorization required|unauthorized/i.test(errStr);
    let authorize_url = null;
    if (oauthNeeded) {
      try {
        const start = await getMcpOAuthStart(env, userId, connector);
        if (start && start.success && start.authorize_url) authorize_url = start.authorize_url;
      } catch (_) {}
    }
    return {
      success: false,
      status: r.status,
      error: r.error,
      oauth_required: oauthNeeded,
      authorize_url,
      wwwAuthenticate: r.wwwAuthenticate,
      data: r.data
    };
  }
  return { success: true, data: r.data?.result || r.data, raw: r.data };
}"""
    if old not in c:
        print("callMcpTool block missing"); sys.exit(1)
    c = c.replace(old, new, 1)
    old2 = """    return {
      success: false,
      status: r.status,
      error: r.error,
      oauth_required: oauthNeeded,
      wwwAuthenticate: r.wwwAuthenticate,
      tools: []
    };
  }
  const tools =
    r.data?.result?.tools ||"""
    new2 = """    // PHASE_B_DAY45 - list path also surfaces authorize_url when provider needs consent
    let authorize_url = null;
    if (oauthNeeded) {
      try {
        const start = await getMcpOAuthStart(env, userId, connector);
        if (start && start.success && start.authorize_url) authorize_url = start.authorize_url;
      } catch (_) {}
    }
    return {
      success: false,
      status: r.status,
      error: r.error,
      oauth_required: oauthNeeded,
      authorize_url,
      wwwAuthenticate: r.wwwAuthenticate,
      tools: []
    };
  }
  const tools =
    r.data?.result?.tools ||"""
    if old2 in c:
        c = c.replace(old2, new2, 1)
    mcp.write_text(c, encoding="utf-8")
    print("mcp day45 applied", len(c))

wpath = Path("worker.ts")
if wpath.exists():
    w = wpath.read_text(encoding="utf-8")
    if "PHASE_B_DAY45 - prefer authorize_url already embedded" not in w and "PHASE_B_DAY45" not in w:
        old = """    if (mcpResult && mcpResult.oauth_required) {
      let authStart = null;
      try { authStart = await getMcpOAuthStart(env2, auth.userId, connector); } catch (_) {}
      // PHASE_B_DAY40 — Claude-style reauth
      const authUrl = (authStart && (authStart.authorize_url || authStart.url)) || null;"""
        new = """    if (mcpResult && mcpResult.oauth_required) {
      // PHASE_B_DAY45 - prefer authorize_url already embedded by callMcpTool
      let authStart = null;
      let authUrl = mcpResult.authorize_url || mcpResult.reauth_url || null;
      if (!authUrl) {
        try { authStart = await getMcpOAuthStart(env2, auth.userId, connector); } catch (_) {}
        authUrl = (authStart && (authStart.authorize_url || authStart.url)) || null;
      }
      // PHASE_B_DAY40 - Claude-style reauth"""
        if old in w:
            w = w.replace(old, new, 1)
            print("worker non-stream")
        old2 = """            if (mcpResult && mcpResult.oauth_required) {
              // PHASE_B_DAY40 — real authorize_url on stream path
              let authStart = null;
              try {
                if (typeof getMcpOAuthStart === \"function\") authStart = await getMcpOAuthStart(env2, userId, forcedMcp.connector);
              } catch (_) {}
              const authUrl = (authStart && (authStart.authorize_url || authStart.url)) || mcpResult.reauth_url || null;"""
        new2 = """            if (mcpResult && mcpResult.oauth_required) {
              // PHASE_B_DAY45 - prefer authorize_url from callMcpTool; fallback probe
              let authStart = null;
              let authUrl = mcpResult.authorize_url || mcpResult.reauth_url || null;
              if (!authUrl) {
                try {
                  if (typeof getMcpOAuthStart === \"function\") authStart = await getMcpOAuthStart(env2, userId, forcedMcp.connector);
                } catch (_) {}
                authUrl = (authStart && (authStart.authorize_url || authStart.url)) || null;
              }"""
        if old2 in w:
            w = w.replace(old2, new2, 1)
            print("worker stream")
        wpath.write_text(w, encoding="utf-8")
    else:
        print("worker already day45 or skip")
print("OK")
