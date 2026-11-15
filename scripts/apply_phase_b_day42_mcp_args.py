#!/usr/bin/env python3
"""Phase B Day 42: extract simple MCP tool args from natural language (not always {})."""
from pathlib import Path

EXTRACT_FN = r'''
/** PHASE_B_DAY42 - build minimal tool args from user message + optional inputSchema */
export function extractMcpToolArgs(message, connector, toolName, inputSchema = null) {
  const args = {};
  const raw = String(message || "").trim();
  if (!raw) return args;
  const nameL = String(toolName || "").toLowerCase();
  if (/^(whoami|get_me|me|getme)$/i.test(nameL)) return args;

  const schema = inputSchema && typeof inputSchema === "object" ? inputSchema : null;
  const props = (schema && schema.properties) || {};
  const required = Array.isArray(schema && schema.required) ? schema.required : [];

  let q = raw
    .replace(/\b(cloudflare|github|vercel|netlify|supabase|linear|notion|stripe|sentry|atlassian|asana|canva|discord|spotify|slack)\b/gi, " ")
    .replace(/\b(whoami|identity|profile|connected|mera|meri|mujhe|batao|dikhao|show|list|get|fetch|please|kya|hai|my|the|a|an)\b/gi, " ")
    .replace(/[\u2014\u2013\-:|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const queryKeys = ["query", "q", "search", "text", "prompt", "question"];
  for (const key of queryKeys) {
    if (props[key] || required.includes(key)) {
      if (q) args[key] = q;
      return args;
    }
  }
  if (/docs|search|find|query/i.test(nameL) && q) {
    args.query = q;
  }
  return args;
}
'''


def patch_mcp_client(t: str) -> str:
    if "PHASE_B_DAY42" in t and "extractMcpToolArgs" in t:
        return t
    anchor = "export function matchMcpFromMessage(message, mcpTools = []) {"
    if anchor not in t:
        raise SystemExit("matchMcpFromMessage not found")
    t = t.replace(anchor, EXTRACT_FN.strip() + "\n\n" + anchor, 1)
    if "PLACEHOLDER_WILL_FAIL" in t:
        raise SystemExit("placeholder in mcp-client")
    return t


def patch_worker(t: str) -> str:
    if "PHASE_B_DAY42" in t and t.count("extractMcpToolArgs") >= 2:
        return t

    old_stream = "mcpResult = await callMcpTool(env2, userId, forcedMcp.connector, forcedMcp.name, {});"
    new_stream = (
        'mcpResult = await callMcpTool(env2, userId, forcedMcp.connector, forcedMcp.name, '
        '(typeof extractMcpToolArgs === "function" ? extractMcpToolArgs(message, forcedMcp.connector, forcedMcp.name, forcedMcp.inputSchema) : {})); // PHASE_B_DAY42'
    )
    if old_stream not in t:
        raise SystemExit("stream empty-args callMcpTool not found")
    t = t.replace(old_stream, new_stream, 1)

    old_ns = (
        '    delete toolArgs.connector; delete toolArgs.app; delete toolArgs.tool; delete toolArgs.action; delete toolArgs.name;\n'
        '    let mcpResult = { success: false, error: "callMcpTool unavailable" };\n'
        '    try {\n'
        '      mcpResult = await callMcpTool(env2, auth.userId, connector, toolName, toolArgs);'
    )
    new_ns = (
        '    delete toolArgs.connector; delete toolArgs.app; delete toolArgs.tool; delete toolArgs.action; delete toolArgs.name;\n'
        '    // PHASE_B_DAY42 - fill simple args from message when force-route left them empty\n'
        '    if (typeof extractMcpToolArgs === "function" && Object.keys(toolArgs || {}).length === 0) {\n'
        '      const inferred = extractMcpToolArgs(message, connector, toolName, null);\n'
        '      if (inferred && typeof inferred === "object") Object.assign(toolArgs, inferred);\n'
        '    }\n'
        '    let mcpResult = { success: false, error: "callMcpTool unavailable" };\n'
        '    try {\n'
        '      mcpResult = await callMcpTool(env2, auth.userId, connector, toolName, toolArgs);'
    )
    if old_ns not in t:
        raise SystemExit("non-stream toolArgs block not found")
    t = t.replace(old_ns, new_ns, 1)

    parts = t.split('from "./mcp-client.js"')
    out = []
    for i, part in enumerate(parts[:-1]):
        tail = part[-600:]
        if "extractMcpToolArgs" not in tail and "callMcpTool" in tail:
            if "callMcpTool," in part:
                idx = part.rfind("callMcpTool,")
                part = part[:idx] + "callMcpTool,\n  extractMcpToolArgs," + part[idx + len("callMcpTool,"):]
            else:
                idx = part.rfind("callMcpTool")
                part = part[:idx] + "callMcpTool,\n  extractMcpToolArgs" + part[idx + len("callMcpTool"):]
        out.append(part)
    t = 'from "./mcp-client.js"'.join(out + [parts[-1]])

    if t.count("{") != t.count("}"):
        raise SystemExit("brace mismatch")
    if "PLACEHOLDER_WILL_FAIL" in t or len(t) < 10000:
        raise SystemExit("refusing bad worker")
    if "PHASE_B_DAY42" not in t:
        raise SystemExit("DAY42 marker missing")
    if "extractMcpToolArgs" not in t:
        raise SystemExit("extractMcpToolArgs not wired")
    return t


def main():
    mp = Path("mcp-client.js")
    if mp.exists():
        mt = mp.read_text()
        mt2 = patch_mcp_client(mt)
        if mt2 != mt:
            mp.write_text(mt2)
            print("mcp-client.js patched DAY42 extractMcpToolArgs")
        else:
            print("mcp-client.js already DAY42")

    wp = Path("worker.ts")
    if not wp.exists():
        raise SystemExit("worker.ts missing")
    wt = wp.read_text()
    if "PLACEHOLDER_WILL_FAIL" in wt or len(wt) < 10000:
        raise SystemExit("worker invalid - abort")
    wt2 = patch_worker(wt)
    if wt2 != wt:
        wp.write_text(wt2)
        print("worker.ts patched DAY42")
    else:
        print("worker.ts already DAY42")


if __name__ == "__main__":
    main()
