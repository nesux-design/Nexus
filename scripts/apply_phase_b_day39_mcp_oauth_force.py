#!/usr/bin/env python3
"""Phase B Day 39: when MCP oauth missing for a named connector, force execute_mcp (reauth URL) instead of CLI tutorial."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "PHASE_B_DAY39" in t:
        print("already applied")
        return

    old = '''  // PHASE_B_DAY36 — ensure MCP tools for named connectors even if catalog was empty
  if (thinking.action === "general_chat" && typeof ensureMcpToolsForMessage === "function") {
    try {
      thinking.mcp_tools = await ensureMcpToolsForMessage(env2, auth.userId, message, thinking.mcp_tools || []);
    } catch (e) {
      console.error("ensureMcpToolsForMessage", e && e.message);
    }
  }
  if (thinking.action === "general_chat" && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === "function") {
    const forcedMcp = matchMcpFromMessage(message, thinking.mcp_tools);
    if (forcedMcp) {
      thinking.action = "execute_mcp";
      thinking.args = { connector: forcedMcp.connector, tool: forcedMcp.name };'''

    new = '''  // PHASE_B_DAY36 — ensure MCP tools for named connectors even if catalog was empty
  if (thinking.action === "general_chat" && typeof ensureMcpToolsForMessage === "function") {
    try {
      thinking.mcp_tools = await ensureMcpToolsForMessage(env2, auth.userId, message, thinking.mcp_tools || []);
    } catch (e) {
      console.error("ensureMcpToolsForMessage", e && e.message);
    }
  }
  // PHASE_B_DAY39 — named MCP connector + no tools => force execute_mcp so user gets reauth URL, not CLI tutorial
  if (thinking.action === "general_chat" && (!thinking.mcp_tools || !thinking.mcp_tools.length) && typeof listMcpTools === "function") {
    try {
      const m = String(message || "").toLowerCase();
      const named = [];
      if (m.includes("cloudflare")) named.push("cloudflare");
      if (m.includes("github")) named.push("github");
      if (m.includes("vercel")) named.push("vercel");
      if (m.includes("netlify")) named.push("netlify");
      if (m.includes("supabase")) named.push("supabase");
      if (m.includes("linear")) named.push("linear");
      if (m.includes("notion")) named.push("notion");
      if (m.includes("stripe")) named.push("stripe");
      if (m.includes("sentry")) named.push("sentry");
      for (const id of named) {
        const res = await listMcpTools(env2, auth.userId, id);
        if (res && res.success && res.tools && res.tools.length) {
          thinking.mcp_tools = (thinking.mcp_tools || []).concat(
            res.tools.map((tool) => ({
              connector: id,
              name: tool.name,
              description: tool.description || tool.name,
              inputSchema: tool.inputSchema || tool.input_schema
            }))
          );
          break;
        }
        if (res && (res.oauth_required || res.status === 401)) {
          const wantsIdentity = /\\b(whoami|identity|profile|connected)\\b/i.test(m);
          thinking.action = "execute_mcp";
          thinking.args = { connector: id, tool: wantsIdentity ? "whoami" : "whoami" };
          thinking.reasoning = (thinking.reasoning || "") + " | MCP oauth required: " + id;
          thinking.confidence = Math.max(thinking.confidence || 0, 0.95);
          break;
        }
      }
    } catch (e) {
      console.error("PHASE_B_DAY39 mcp oauth probe", e && e.message);
    }
  }
  if (thinking.action === "general_chat" && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === "function") {
    const forcedMcp = matchMcpFromMessage(message, thinking.mcp_tools);
    if (forcedMcp) {
      thinking.action = "execute_mcp";
      thinking.args = { connector: forcedMcp.connector, tool: forcedMcp.name };'''

    if old not in t:
        raise SystemExit("anchor missing")
    p.write_text(t.replace(old, new, 1))
    assert "PHASE_B_DAY39" in p.read_text()
    print("ok")

if __name__ == "__main__":
    main()
