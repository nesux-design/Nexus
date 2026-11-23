#!/usr/bin/env python3
"""PHASE_B_DAY46: MCP force-route must override web_search (cloudflare whoami bug)."""
from pathlib import Path
import sys
wpath = Path("worker.ts")
w = wpath.read_text(encoding="utf-8")
if "PLACEHOLDER" in w[:300]:
    print("BAD"); sys.exit(1)
if "PHASE_B_DAY46" in w:
    print("already day46"); sys.exit(0)
changes = 0
old1 = '''  // PHASE_B_DAY36 — ensure MCP tools for named connectors even if catalog was empty
  if (thinking.action === "general_chat" && typeof ensureMcpToolsForMessage === "function") {'''
new1 = '''  // PHASE_B_DAY36 — ensure MCP tools for named connectors even if catalog was empty
  // PHASE_B_DAY46 — also when planner wrongly chose web_search (e.g. "cloudflare whoami")
  if ((thinking.action === "general_chat" || thinking.action === "web_search") && typeof ensureMcpToolsForMessage === "function") {'''
if old1 in w:
    w = w.replace(old1, new1, 1); changes += 1
old2 = '''  // PHASE_B_DAY39 — named MCP connector => force execute_mcp so user gets reauth URL, not CLI tutorial
  // PHASE_B_DAY41 — probe even if OTHER connectors already filled mcp_tools (was skipping cloudflare oauth)
  if (thinking.action === "general_chat" && typeof listMcpTools === "function") {'''
new2 = '''  // PHASE_B_DAY39 — named MCP connector => force execute_mcp so user gets reauth URL, not CLI tutorial
  // PHASE_B_DAY41 — probe even if OTHER connectors already filled mcp_tools (was skipping cloudflare oauth)
  // PHASE_B_DAY46 — override web_search when user named an MCP connector
  if ((thinking.action === "general_chat" || thinking.action === "web_search") && typeof listMcpTools === "function") {'''
if old2 in w:
    w = w.replace(old2, new2, 1); changes += 1
old3 = '''  if (thinking.action === "general_chat" && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === "function") {
    const forcedMcp = matchMcpFromMessage(message, thinking.mcp_tools);'''
new3 = '''  if ((thinking.action === "general_chat" || thinking.action === "web_search") && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === "function") {
    const forcedMcp = matchMcpFromMessage(message, thinking.mcp_tools);'''
if old3 in w:
    w = w.replace(old3, new3, 1); changes += 1
old_after = '''    } catch (e) {
      console.error("PHASE_B_DAY39 mcp oauth probe", e && e.message);
    }
  }
  if ((thinking.action === "general_chat" || thinking.action === "web_search") && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === "function") {'''
new_after = '''    } catch (e) {
      console.error("PHASE_B_DAY39 mcp oauth probe", e && e.message);
    }
  }
  // PHASE_B_DAY46 — hard force: "cloudflare whoami" style must never stay on web_search
  if ((thinking.action === "general_chat" || thinking.action === "web_search") && /\\b(cloudflare|github|vercel|netlify|supabase|linear|notion)\\b/i.test(String(message||"")) && /\\b(whoami|identity|profile|connected)\\b/i.test(String(message||""))) {
    const m = String(message || "").toLowerCase();
    let id = "cloudflare";
    if (m.includes("github")) id = "github";
    else if (m.includes("vercel")) id = "vercel";
    else if (m.includes("netlify")) id = "netlify";
    else if (m.includes("supabase")) id = "supabase";
    else if (m.includes("linear")) id = "linear";
    else if (m.includes("notion")) id = "notion";
    else if (m.includes("cloudflare")) id = "cloudflare";
    thinking.action = "execute_mcp";
    thinking.args = { connector: id, tool: "whoami" };
    thinking.reasoning = (thinking.reasoning || "") + " | DAY46 hard force MCP whoami: " + id;
    thinking.confidence = Math.max(thinking.confidence || 0, 0.96);
  }
  if ((thinking.action === "general_chat" || thinking.action === "web_search") && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === "function") {'''
if old_after in w:
    w = w.replace(old_after, new_after, 1); changes += 1
wpath.write_text(w)
print("DONE", changes)
if changes < 3:
    sys.exit(1)
if "PHASE_B_DAY46" not in w:
    sys.exit(1)
