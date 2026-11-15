#!/usr/bin/env python3
"""Phase B Day 43: extract sources/citations from MCP tool results (docs URLs)."""
from pathlib import Path

EXTRACT_SOURCES = r'''
/** PHASE_B_DAY43 - pull http(s) sources from MCP tool result content */
export function extractMcpSourcesFromResult(mcpResult, limit = 8) {
  const out = [];
  const seen = new Set();
  const push = (url, title) => {
    const u = String(url || "").trim();
    if (!u || !/^https?:\/\//i.test(u) || seen.has(u)) return;
    seen.add(u);
    out.push({ title: String(title || u).slice(0, 200), url: u });
  };
  try {
    const data = mcpResult && (mcpResult.data || mcpResult.result || mcpResult);
    const blobs = [];
    if (!data) return out;
    if (typeof data === "string") blobs.push(data);
    else {
      blobs.push(JSON.stringify(data));
      const content = data.content || data.contents || [];
      if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c === "string") blobs.push(c);
          else if (c && typeof c.text === "string") blobs.push(c.text);
          else if (c && c.type === "resource" && c.resource && c.resource.uri) push(c.resource.uri, c.resource.name || c.resource.uri);
        }
      }
      if (Array.isArray(data.results)) {
        for (const r of data.results) {
          if (r && r.url) push(r.url, r.title || r.name);
        }
      }
    }
    for (const blob of blobs) {
      const pairRe = /<url>\s*([^<]+?)\s*<\/url>\s*(?:<title>\s*([^<]*?)\s*<\/title>)?/gi;
      let m;
      while ((m = pairRe.exec(blob)) && out.length < limit) {
        push(m[1], m[2] || m[1]);
      }
      const urlRe = /https?:\/\/[^\s<>"')\]]+/gi;
      let u;
      while ((u = urlRe.exec(blob)) && out.length < limit) {
        let href = u[0].replace(/[.,;:]+$/, "");
        push(href, href);
      }
    }
  } catch (_) {}
  return out.slice(0, limit);
}
'''


def patch_mcp_client(t: str) -> str:
    if "PHASE_B_DAY43" in t and "extractMcpSourcesFromResult" in t:
        return t
    anchor = "export function matchMcpFromMessage(message, mcpTools = []) {"
    if anchor not in t:
        raise SystemExit("matchMcpFromMessage not found")
    t = t.replace(anchor, EXTRACT_SOURCES.strip() + "\n\n" + anchor, 1)
    if "PLACEHOLDER_WILL_FAIL" in t:
        raise SystemExit("placeholder in mcp-client")
    return t


def patch_worker(t: str) -> str:
    if "PHASE_B_DAY43" in t and "extractMcpSourcesFromResult" in t:
        return t

    old = (
        '      return new Response(JSON.stringify({\n'
        '        response: natural,\n'
        '        thinking_steps: steps,\n'
        '        intent: "execute_mcp",\n'
        '        mcp: { connector, tool: toolName, result: mcpResult },\n'
        '        model: "mcp+llm",\n'
        '        presentation: { version: 1, kind: "prose", features: { hasCode: false, hasTable: false, hasLinks: false, hasNumberedSteps: false, hasCitations: false, hasSources: false, hasArtifact: false, hasRelatedQuestions: false } },\n'
        '        sources: [],\n'
        '        relatedQuestions: [],\n'
        '        searchPerformed: false,\n'
        '        latency: Date.now() - startTime,\n'
        '        streamingAvailable: true,\n'
        '        conversationId: typeof conversationId !== "undefined" ? conversationId : null,\n'
        '        ...buildSchemaV2Meta(auth, _snap.usage)\n'
        '      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'
    )
    new = (
        '      // PHASE_B_DAY43 - sources from MCP docs/tool payloads\n'
        '      const mcpSources = (typeof extractMcpSourcesFromResult === "function")\n'
        '        ? extractMcpSourcesFromResult(mcpResult, 8)\n'
        '        : [];\n'
        '      const hasMcpSources = Array.isArray(mcpSources) && mcpSources.length > 0;\n'
        '      return new Response(JSON.stringify({\n'
        '        response: natural,\n'
        '        thinking_steps: steps,\n'
        '        intent: "execute_mcp",\n'
        '        mcp: { connector, tool: toolName, result: mcpResult },\n'
        '        model: "mcp+llm",\n'
        '        presentation: { version: 1, kind: "prose", features: { hasCode: /```/.test(String(natural||"")), hasTable: false, hasLinks: hasMcpSources, hasNumberedSteps: false, hasCitations: hasMcpSources, hasSources: hasMcpSources, hasArtifact: false, hasRelatedQuestions: false } },\n'
        '        sources: mcpSources,\n'
        '        relatedQuestions: [],\n'
        '        searchPerformed: false,\n'
        '        latency: Date.now() - startTime,\n'
        '        streamingAvailable: true,\n'
        '        conversationId: typeof conversationId !== "undefined" ? conversationId : null,\n'
        '        ...buildSchemaV2Meta(auth, _snap.usage)\n'
        '      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'
    )
    if old not in t:
        raise SystemExit("non-stream execute_mcp success envelope not found")
    t = t.replace(old, new, 1)

    old_s = (
        '            ultra.done(natural, {\n'
        '              intent: "execute_mcp",\n'
        '              thinking_steps: steps,\n'
        '              mcp: { connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult },\n'
        '              model: "mcp+llm"\n'
        '            });'
    )
    new_s = (
        '            // PHASE_B_DAY43 - stream sources from MCP result\n'
        '            const streamMcpSources = (typeof extractMcpSourcesFromResult === "function")\n'
        '              ? extractMcpSourcesFromResult(mcpResult, 8)\n'
        '              : [];\n'
        '            ultra.done(natural, {\n'
        '              intent: "execute_mcp",\n'
        '              thinking_steps: steps,\n'
        '              mcp: { connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult },\n'
        '              model: "mcp+llm",\n'
        '              sources: streamMcpSources,\n'
        '              presentation: { version: 1, kind: "prose", features: { hasCode: /```/.test(String(natural||"")), hasTable: false, hasLinks: streamMcpSources.length > 0, hasNumberedSteps: false, hasCitations: streamMcpSources.length > 0, hasSources: streamMcpSources.length > 0, hasArtifact: false, hasRelatedQuestions: false } }\n'
        '            });'
    )
    if old_s not in t:
        raise SystemExit("stream execute_mcp done block not found")
    t = t.replace(old_s, new_s, 1)

    parts = t.split('from "./mcp-client.js"')
    out = []
    for part in parts[:-1]:
        tail = part[-700:]
        if "extractMcpSourcesFromResult" not in tail:
            if "extractMcpToolArgs," in part:
                idx = part.rfind("extractMcpToolArgs,")
                part = part[:idx] + "extractMcpToolArgs,\n  extractMcpSourcesFromResult," + part[idx + len("extractMcpToolArgs,"):]
            elif "extractMcpToolArgs" in part:
                idx = part.rfind("extractMcpToolArgs")
                part = part[:idx] + "extractMcpToolArgs,\n  extractMcpSourcesFromResult" + part[idx + len("extractMcpToolArgs"):]
            elif "callMcpTool," in part:
                idx = part.rfind("callMcpTool,")
                part = part[:idx] + "callMcpTool,\n  extractMcpSourcesFromResult," + part[idx + len("callMcpTool,"):]
        out.append(part)
    t = 'from "./mcp-client.js"'.join(out + [parts[-1]])

    if t.count("{") != t.count("}"):
        raise SystemExit("brace mismatch")
    if "PLACEHOLDER_WILL_FAIL" in t or len(t) < 10000:
        raise SystemExit("refusing bad worker")
    if "PHASE_B_DAY43" not in t:
        raise SystemExit("DAY43 marker missing")
    return t


def main():
    mp = Path("mcp-client.js")
    if mp.exists():
        mt = mp.read_text()
        mt2 = patch_mcp_client(mt)
        if mt2 != mt:
            mp.write_text(mt2)
            print("mcp-client.js patched DAY43 sources")
        else:
            print("mcp-client.js already DAY43")

    wp = Path("worker.ts")
    if not wp.exists():
        raise SystemExit("worker.ts missing")
    wt = wp.read_text()
    if "PLACEHOLDER_WILL_FAIL" in wt or len(wt) < 10000:
        raise SystemExit("worker invalid - abort")
    wt2 = patch_worker(wt)
    if wt2 != wt:
        wp.write_text(wt2)
        print("worker.ts patched DAY43")
    else:
        print("worker.ts already DAY43")


if __name__ == "__main__":
    main()
