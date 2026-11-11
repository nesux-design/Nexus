#!/usr/bin/env python3
"""Phase B Day 36: MCP force-route reliability (secret fallbacks, whoami match, ensure tools)."""
from pathlib import Path

def main():
    p = Path("mcp-client.js")
    t = p.read_text()
    if "PHASE_B_DAY36" in t and "ensureMcpToolsForMessage" in t:
        print("mcp-client already applied")
    else:
        t = t.replace(
            "const secret = env?.NEXUS_INTERNAL_AUTH_SECRET;",
            "const secret = env?.NEXUS_INTERNAL_AUTH_SECRET || env?.NEXUS_AUTH_SECRET || env?.MCP_AUTH_SECRET || env?.NEXUS_HMAC_SECRET;",
        )
        t = t.replace(
            'if (!env?.NEXUS_INTERNAL_AUTH_SECRET || !userId) {\n    return { tools: [], nameMap: {}, connectors: [], notes: ["MCP secret or userId missing"] };',
            'if (!(env?.NEXUS_INTERNAL_AUTH_SECRET || env?.NEXUS_AUTH_SECRET || env?.MCP_AUTH_SECRET || env?.NEXUS_HMAC_SECRET) || !userId) {\n    return { tools: [], nameMap: {}, connectors: [], notes: ["MCP secret or userId missing"] };',
        )

        i = t.find("export function matchMcpFromMessage")
        if i < 0:
            i = t.find("function matchMcpFromMessage")
        j = t.find("export function formatMcpForThinking", i)
        if i < 0 or j < 0:
            raise SystemExit("matchMcpFromMessage not found")

        new_match = r'''export function matchMcpFromMessage(message, mcpTools = []) {
  const query = String(message || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!query || !Array.isArray(mcpTools) || !mcpTools.length) return null;
  const hasActionVerb = /\b(list|show|get|fetch|search|find|create|update|delete|send|read|write|open|deploy|check|retrieve|add|remove|edit|comment|run|execute|view|look up|whoami|identity|profile|batao|dikhao)\b/i.test(query);
  const wantsIdentity = /\b(whoami|identity|connected identity|profile|mera account|my account)\b/i.test(query);
  const candidates = [];
  for (const tool of mcpTools) {
    if (!tool || !tool.connector || !tool.name) continue;
    const connector = String(tool.connector);
    const name = String(tool.name);
    const nameL = name.toLowerCase();
    const normalizedName = nameL.replace(/[_-]+/g, " ").replace(/[^a-z0-9 ]/g, " ").trim();
    const normalizedConnector = connector.toLowerCase().replace(/[_-]+/g, " ").replace(/[^a-z0-9 ]/g, " ").trim();
    const description = String(tool.description || "").toLowerCase();
    let score = 0;
    if (normalizedName && (" " + query + " ").includes(" " + normalizedName + " ")) score += 6;
    if (nameL.replace(/[_-]+/g, "") && query.replace(/\s+/g, "").includes(nameL.replace(/[_-]+/g, ""))) score += 5;
    if (normalizedConnector && (" " + query + " ").includes(" " + normalizedConnector + " ")) score += 3;
    // PHASE_B_DAY36 — explicit identity / whoami requests
    if (wantsIdentity && (nameL === "whoami" || nameL === "get_me" || nameL === "getme" || nameL === "me")) score += 10;
    if (wantsIdentity && normalizedConnector && query.includes(normalizedConnector) && (nameL === "whoami" || nameL.includes("whoami"))) score += 5;
    const terms = description.split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !["with", "from", "that", "this", "your", "into", "user", "list", "data"].includes(w));
    for (const term of terms) if ((" " + query + " ").includes(" " + term + " ")) score += 0.2;
    if (score >= 5 || (score >= 2.5 && hasActionVerb) || (wantsIdentity && score >= 4)) candidates.push({ connector, name, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  if (!candidates.length) return null;
  if (candidates.length > 1 && candidates[0].score === candidates[1].score) {
    const prefer = candidates.find(c => /^(whoami|get_me)$/i.test(c.name));
    if (prefer) return { connector: prefer.connector, name: prefer.name };
    return null;
  }
  return { connector: candidates[0].connector, name: candidates[0].name };
}

'''
        helper = r'''// PHASE_B_DAY36 — if catalog empty, still try connectors named in the user message
export async function ensureMcpToolsForMessage(env, userId, message, existing = []) {
  let tools = Array.isArray(existing) ? existing.slice() : [];
  if (tools.length) return tools;
  const m = String(message || "").toLowerCase();
  const tryIds = [];
  if (m.includes("cloudflare")) tryIds.push("cloudflare");
  if (m.includes("github")) tryIds.push("github");
  if (m.includes("vercel")) tryIds.push("vercel");
  if (m.includes("netlify")) tryIds.push("netlify");
  if (m.includes("supabase")) tryIds.push("supabase");
  if (m.includes("linear")) tryIds.push("linear");
  if (m.includes("notion")) tryIds.push("notion");
  if (m.includes("stripe")) tryIds.push("stripe");
  if (m.includes("sentry")) tryIds.push("sentry");
  for (const id of tryIds) {
    try {
      const res = await listMcpTools(env, userId, id);
      if (res && res.oauth_required) continue;
      if (!res || !res.success) continue;
      for (const tool of res.tools || []) {
        tools.push({
          connector: id,
          name: tool.name,
          description: tool.description || tool.name,
          inputSchema: tool.inputSchema || tool.input_schema
        });
      }
    } catch (e) {
      console.error("ensureMcpToolsForMessage", id, e && e.message);
    }
  }
  return tools;
}

'''
        t = t[:i] + helper + new_match + t[j:]
        p.write_text(t)
        print("mcp-client ok")

    w = Path("worker.ts")
    wt = w.read_text()
    if "PHASE_B_DAY36" in wt and "ensureMcpToolsForMessage" in wt:
        print("worker already applied")
        return

    old_imp = """import {
  loadMcpToolsForUser,
  matchMcpFromMessage,
  mcpToolsToGeminiDeclarations,
  mcpToolsToOpenAITools,
  buildMcpThinkingSteps,
  formatMcpForThinking,
  mcpFunctionName,
  parseMcpFunctionName,
  listMcpConnectors,
  listMcpTools,
  callMcpTool,
  getMcpOAuthStart
} from \"./mcp-client.js\";"""
    new_imp = """import {
  loadMcpToolsForUser,
  matchMcpFromMessage,
  ensureMcpToolsForMessage,
  mcpToolsToGeminiDeclarations,
  mcpToolsToOpenAITools,
  buildMcpThinkingSteps,
  formatMcpForThinking,
  mcpFunctionName,
  parseMcpFunctionName,
  listMcpConnectors,
  listMcpTools,
  callMcpTool,
  getMcpOAuthStart
} from \"./mcp-client.js\";"""
    if old_imp not in wt:
        raise SystemExit("worker import block missing")
    wt = wt.replace(old_imp, new_imp, 1)

    old_f = """  if (thinking.action === \"general_chat\" && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === \"function\") {
    const forcedMcp = matchMcpFromMessage(message, thinking.mcp_tools);
    if (forcedMcp) {"""
    new_f = """  // PHASE_B_DAY36 — ensure MCP tools for named connectors even if catalog was empty
  if (thinking.action === \"general_chat\" && typeof ensureMcpToolsForMessage === \"function\") {
    try {
      thinking.mcp_tools = await ensureMcpToolsForMessage(env2, auth.userId, message, thinking.mcp_tools || []);
    } catch (e) {
      console.error(\"ensureMcpToolsForMessage\", e && e.message);
    }
  }
  if (thinking.action === \"general_chat\" && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === \"function\") {
    const forcedMcp = matchMcpFromMessage(message, thinking.mcp_tools);
    if (forcedMcp) {"""
    if old_f not in wt:
        raise SystemExit("force mcp block missing")
    wt = wt.replace(old_f, new_f, 1)

    old_s = """          const mcpPack = await loadMcpToolsForUser(env2, userId, { limit: 12 });
          const mcpTools = (mcpPack && mcpPack.tools) || [];
          const forcedMcp = matchMcpFromMessage(message, mcpTools);"""
    new_s = """          const mcpPack = await loadMcpToolsForUser(env2, userId, { limit: 12 });
          let mcpTools = (mcpPack && mcpPack.tools) || [];
          // PHASE_B_DAY36 — fill tools if catalog empty but user named a connector
          if (typeof ensureMcpToolsForMessage === \"function\") {
            mcpTools = await ensureMcpToolsForMessage(env2, userId, message, mcpTools);
          }
          const forcedMcp = matchMcpFromMessage(message, mcpTools);"""
    if old_s not in wt:
        raise SystemExit("stream mcp block missing")
    wt = wt.replace(old_s, new_s, 1)

    w.write_text(wt)
    assert "PHASE_B_DAY36" in w.read_text()
    print("worker ok")

if __name__ == "__main__":
    main()
