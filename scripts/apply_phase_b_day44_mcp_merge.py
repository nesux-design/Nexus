#!/usr/bin/env python3
"""Phase B Day 44: merge named MCP connectors into existing tools; pass inputSchema on match."""
from pathlib import Path

ENSURE_FN = r'''// PHASE_B_DAY36 — if catalog empty, still try connectors named in the user message
// PHASE_B_DAY44 — MERGE named connectors even when other MCP tools already loaded (no early-return)
export async function ensureMcpToolsForMessage(env, userId, message, existing = []) {
  let tools = Array.isArray(existing) ? existing.slice() : [];
  const m = String(message || "").toLowerCase();
  const tryIds = [];
  const pushId = (id) => {
    if (id && !tryIds.includes(id)) tryIds.push(id);
  };
  // aliases + full names (Claude/Grok style natural mentions)
  if (/\bcloudflare\b|\bcf\b|\bworkers\s+kv\b/i.test(m) || m.includes("cloudflare")) pushId("cloudflare");
  if (/\bgithub\b|\bgh\b/i.test(m) || m.includes("github")) pushId("github");
  if (m.includes("vercel")) pushId("vercel");
  if (m.includes("netlify")) pushId("netlify");
  if (m.includes("supabase")) pushId("supabase");
  if (m.includes("linear")) pushId("linear");
  if (m.includes("notion")) pushId("notion");
  if (m.includes("stripe")) pushId("stripe");
  if (m.includes("sentry")) pushId("sentry");
  if (/\batlassian\b|\bjira\b|\bconfluence\b/i.test(m)) pushId("atlassian");
  if (m.includes("asana")) pushId("asana");
  if (m.includes("canva")) pushId("canva");
  if (m.includes("zoom")) pushId("zoom");
  if (m.includes("hubspot")) pushId("hubspot");
  if (m.includes("salesforce")) pushId("salesforce");
  if (m.includes("airtable")) pushId("airtable");
  if (m.includes("telegram")) pushId("telegram");
  for (const id of tryIds) {
    // Skip fetch if this connector already contributed tools
    if (tools.some((t) => t && t.connector === id)) continue;
    try {
      const res = await listMcpTools(env, userId, id);
      if (res && res.oauth_required) continue;
      if (!res || !res.success) continue;
      for (const tool of res.tools || []) {
        if (tools.some((t) => t && t.connector === id && t.name === tool.name)) continue;
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


def patch_mcp_client(t: str) -> str:
    if "PHASE_B_DAY44" in t and "no early-return" in t:
        return t
    start = t.find("// PHASE_B_DAY36 — if catalog empty")
    if start < 0:
        start = t.find("export async function ensureMcpToolsForMessage")
    if start < 0:
        raise SystemExit("ensureMcpToolsForMessage not found")
    end = t.find("/** PHASE_B_DAY42", start)
    if end < 0:
        end = t.find("export function extractMcpToolArgs", start)
    if end < 0:
        raise SystemExit("DAY42 anchor not found after ensureMcp")
    t = t[:start] + ENSURE_FN.strip() + "\n\n" + t[end:]

    old_push = (
        '    if (score >= 5 || (score >= 2.5 && hasActionVerb) || (wantsIdentity && score >= 4)) candidates.push({ connector, name, score });\n'
        '  }\n'
        '  candidates.sort((a, b) => b.score - a.score);\n'
        '  if (!candidates.length) return null;\n'
        '  if (candidates.length > 1 && candidates[0].score === candidates[1].score) {\n'
        '    const prefer = candidates.find(c => /^(whoami|get_me)$/i.test(c.name));\n'
        '    if (prefer) return { connector: prefer.connector, name: prefer.name };\n'
        '    return null;\n'
        '  }\n'
        '  return { connector: candidates[0].connector, name: candidates[0].name };\n'
        '}'
    )
    new_push = (
        '    // PHASE_B_DAY44 — docs/search boost when user asks docs\n'
        '    if (/\\b(docs|documentation|search)\\b/i.test(query) && /docs|search/i.test(nameL)) score += 4;\n'
        '    if (score >= 5 || (score >= 2.5 && hasActionVerb) || (wantsIdentity && score >= 4)) {\n'
        '      candidates.push({\n'
        '        connector,\n'
        '        name,\n'
        '        score,\n'
        '        inputSchema: tool.inputSchema || tool.input_schema || null\n'
        '      });\n'
        '    }\n'
        '  }\n'
        '  candidates.sort((a, b) => b.score - a.score);\n'
        '  if (!candidates.length) return null;\n'
        '  if (candidates.length > 1 && candidates[0].score === candidates[1].score) {\n'
        '    const prefer = candidates.find(c => /^(whoami|get_me)$/i.test(c.name));\n'
        '    if (prefer) return { connector: prefer.connector, name: prefer.name, inputSchema: prefer.inputSchema || null };\n'
        '    return null;\n'
        '  }\n'
        '  // PHASE_B_DAY44 — pass inputSchema so force-route can extract tool args\n'
        '  return {\n'
        '    connector: candidates[0].connector,\n'
        '    name: candidates[0].name,\n'
        '    inputSchema: candidates[0].inputSchema || null\n'
        '  };\n'
        '}'
    )
    if old_push not in t:
        if "PHASE_B_DAY44 — pass inputSchema" in t:
            return t
        raise SystemExit("matchMcpFromMessage return block not found")
    t = t.replace(old_push, new_push, 1)
    if "PLACEHOLDER_WILL_FAIL" in t:
        raise SystemExit("placeholder in mcp-client")
    if "PHASE_B_DAY44" not in t:
        raise SystemExit("DAY44 marker missing")
    return t


def main():
    mp = Path("mcp-client.js")
    if not mp.exists():
        raise SystemExit("mcp-client.js missing")
    mt = mp.read_text()
    if "PLACEHOLDER_WILL_FAIL" in mt or len(mt) < 5000:
        raise SystemExit("mcp-client invalid")
    mt2 = patch_mcp_client(mt)
    if mt2 != mt:
        mp.write_text(mt2)
        print("mcp-client.js patched DAY44 merge+schema")
    else:
        print("mcp-client.js already DAY44")


if __name__ == "__main__":
    main()
