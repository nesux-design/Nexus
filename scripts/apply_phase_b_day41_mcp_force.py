#!/usr/bin/env python3
"""Phase B Day 41: named MCP oauth probe must run even when other tools are loaded."""
from pathlib import Path

def patch_worker(t: str) -> str:
    if "PHASE_B_DAY41 — probe even if OTHER connectors" in t and "PHASE_B_DAY41 — probe even if other MCP tools" in t:
        return t

    if "PHASE_B_DAY41 — probe even if OTHER connectors" not in t:
        old = """  // PHASE_B_DAY39 — named MCP connector + no tools => force execute_mcp so user gets reauth URL, not CLI tutorial
  if (thinking.action === \"general_chat\" && (!thinking.mcp_tools || !thinking.mcp_tools.length) && typeof listMcpTools === \"function\") {"""
        new = """  // PHASE_B_DAY39 — named MCP connector => force execute_mcp so user gets reauth URL, not CLI tutorial
  // PHASE_B_DAY41 — probe even if OTHER connectors already filled mcp_tools (was skipping cloudflare oauth)
  if (thinking.action === \"general_chat\" && typeof listMcpTools === \"function\") {"""
        if old not in t:
            # after day40 comment may differ slightly — match code only
            old2 = """  if (thinking.action === \"general_chat\" && (!thinking.mcp_tools || !thinking.mcp_tools.length) && typeof listMcpTools === \"function\") {
    try {
      const m = String(message || \"\").toLowerCase();
      const named = [];
      if (m.includes(\"cloudflare\")) named.push(\"cloudflare\");"""
            new2 = """  // PHASE_B_DAY41 — probe even if OTHER connectors already filled mcp_tools (was skipping cloudflare oauth)
  if (thinking.action === \"general_chat\" && typeof listMcpTools === \"function\") {
    try {
      const m = String(message || \"\").toLowerCase();
      const named = [];
      if (m.includes(\"cloudflare\")) named.push(\"cloudflare\");"""
            if old2 not in t:
                raise SystemExit("worker day39 empty-tools condition not found")
            t = t.replace(old2, new2, 1)
        else:
            t = t.replace(old, new, 1)

    if "PHASE_B_DAY41 — probe even if other MCP tools" not in t:
        old_s = """          // PHASE_B_DAY40 — stream parity: named connector + empty tools => oauth probe
          let streamForcedConnector = null;
          let streamForcedTool = null;
          if ((!mcpTools || !mcpTools.length) && typeof listMcpTools === \"function\") {"""
        new_s = """          // PHASE_B_DAY40 — stream parity: named connector oauth probe
          // PHASE_B_DAY41 — probe even if other MCP tools already loaded
          let streamForcedConnector = null;
          let streamForcedTool = null;
          if (typeof listMcpTools === \"function\") {"""
        if old_s not in t:
            raise SystemExit("stream day40 empty-tools condition not found")
        t = t.replace(old_s, new_s, 1)

    if t.count("{") != t.count("}"):
        raise SystemExit("brace mismatch")
    if "PLACEHOLDER_WILL_FAIL" in t or len(t) < 10000:
        raise SystemExit("refusing bad worker content")
    return t

def patch_mcp_client(t: str) -> str:
    if t.count("oauthNeeded") >= 2:
        return t
    old = """  if (!r.ok) {
    return {
      success: false,
      status: r.status,
      error: r.error,
      oauth_required: r.status === 401,
      wwwAuthenticate: r.wwwAuthenticate,
      tools: []
    };
  }"""
    new = """  if (!r.ok) {
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
      tools: []
    };
  }"""
    if old in t:
        t = t.replace(old, new)
    old2 = """  if (!r.ok) {
    return {
      success: false,
      status: r.status,
      error: r.error,
      oauth_required: r.status === 401,
      wwwAuthenticate: r.wwwAuthenticate,
      data: r.data
    };
  }"""
    new2 = """  if (!r.ok) {
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
  }"""
    if old2 in t:
        t = t.replace(old2, new2)
    if "PLACEHOLDER_WILL_FAIL" in t:
        raise SystemExit("refusing placeholder")
    return t

def main():
    wp = Path("worker.ts")
    if not wp.exists():
        raise SystemExit("worker.ts missing")
    wt = wp.read_text()
    if "PLACEHOLDER_WILL_FAIL" in wt or "PHASE_B_DAY39" not in wt or len(wt) < 10000:
        raise SystemExit("worker.ts invalid — abort (will not write PLACEHOLDER)")
    wt2 = patch_worker(wt)
    if wt2 != wt:
        wp.write_text(wt2)
        print("worker.ts patched DAY41")
    else:
        print("worker.ts already DAY41")

    mp = Path("mcp-client.js")
    if mp.exists():
        mt = mp.read_text()
        mt2 = patch_mcp_client(mt)
        if mt2 != mt:
            mp.write_text(mt2)
            print("mcp-client.js patched oauthNeeded")
        else:
            print("mcp-client.js already patched")

if __name__ == "__main__":
    main()
