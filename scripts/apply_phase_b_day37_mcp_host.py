#!/usr/bin/env python3
"""Phase B Day 37: fix MCP service-binding host so OAuth redirect_uri is public."""
from pathlib import Path

def main():
    p = Path("mcp-client.js")
    t = p.read_text()
    if "PHASE_B_DAY37" in t:
        print("already applied")
        return
    old = (
        '    if (env?.NEXUS_MCP_SERVER && typeof env.NEXUS_MCP_SERVER.fetch === "function") {\n'
        '      res = await env.NEXUS_MCP_SERVER.fetch(`https://mcp-internal${pathClean}`, {\n'
        '        method,\n'
        '        headers: h,\n'
        '        body: method === "GET" || method === "HEAD" ? undefined : payload,\n'
        '        redirect: redirectMode\n'
        '      });\n'
    )
    new = (
        '    if (env?.NEXUS_MCP_SERVER && typeof env.NEXUS_MCP_SERVER.fetch === "function") {\n'
        '      // PHASE_B_DAY37 — use public MCP host (not mcp-internal) so OAuth redirect_uri is valid\n'
        '      const base = String(mcpBase(env)).replace(/\\/$/, "");\n'
        '      res = await env.NEXUS_MCP_SERVER.fetch(`${base}${pathClean}`, {\n'
        '        method,\n'
        '        headers: h,\n'
        '        body: method === "GET" || method === "HEAD" ? undefined : payload,\n'
        '        redirect: redirectMode\n'
        '      });\n'
    )
    if old not in t:
        raise SystemExit("anchor not found")
    p.write_text(t.replace(old, new, 1))
    assert "PHASE_B_DAY37" in p.read_text()
    print("ok")

if __name__ == "__main__":
    main()
