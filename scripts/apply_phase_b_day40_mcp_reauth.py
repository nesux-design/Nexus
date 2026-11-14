#!/usr/bin/env python3
"""Phase B Day 40 — anchor-based MCP reauth + stream oauth probe.
Never writes PLACEHOLDER. Restores day39 if corrupt. Aborts on safety checks.
"""
from pathlib import Path
import urllib.request

DAY39_URL = "https://raw.githubusercontent.com/nesux-design/Nexus/6d523c8c6c23715e5a959b4aa35afdf3c1311596/worker.ts"

INSERT = """// PHASE_B_DAY36 — fill tools if catalog empty but user named a connector
          if (typeof ensureMcpToolsForMessage === \"function\") {
            mcpTools = await ensureMcpToolsForMessage(env2, userId, message, mcpTools);
          }
          // PHASE_B_DAY40 — stream parity: named connector + empty tools => oauth probe
          let streamForcedConnector = null;
          let streamForcedTool = null;
          if ((!mcpTools || !mcpTools.length) && typeof listMcpTools === \"function\") {
            try {
              const m = String(message || \"\").toLowerCase();
              const named = [];
              if (m.includes(\"cloudflare\")) named.push(\"cloudflare\");
              if (m.includes(\"github\")) named.push(\"github\");
              if (m.includes(\"vercel\")) named.push(\"vercel\");
              if (m.includes(\"netlify\")) named.push(\"netlify\");
              if (m.includes(\"supabase\")) named.push(\"supabase\");
              if (m.includes(\"linear\")) named.push(\"linear\");
              if (m.includes(\"notion\")) named.push(\"notion\");
              if (m.includes(\"stripe\")) named.push(\"stripe\");
              if (m.includes(\"sentry\")) named.push(\"sentry\");
              if (m.includes(\"atlassian\") || m.includes(\"jira\") || m.includes(\"confluence\")) named.push(\"atlassian\");
              if (m.includes(\"asana\")) named.push(\"asana\");
              if (m.includes(\"canva\")) named.push(\"canva\");
              for (const id of named) {
                const res = await listMcpTools(env2, userId, id);
                if (res && res.success && res.tools && res.tools.length) {
                  mcpTools = (mcpTools || []).concat(
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
                  streamForcedConnector = id;
                  streamForcedTool = \"whoami\";
                  break;
                }
              }
            } catch (e) {
              console.error(\"PHASE_B_DAY40 stream mcp oauth probe\", e && e.message);
            }
          }
          if (streamForcedConnector) {
            ultra.thinking(\"MCP needs authorization: \" + streamForcedConnector);
            let authStart = null;
            try {
              if (typeof getMcpOAuthStart === \"function\") authStart = await getMcpOAuthStart(env2, userId, streamForcedConnector);
            } catch (_) {}
            const authUrl = (authStart && (authStart.authorize_url || authStart.url)) || null;
            const msg = authUrl
              ? (\"**\" + streamForcedConnector + \"** MCP connect karo, phir same sawaal poochho.\\n\\nAuthorize: \" + authUrl)
              : (\"**\" + streamForcedConnector + \"** MCP authorize karna hoga. Action `mcp_oauth_start` use karo.");
            ultra.chunk(msg);
            if (userId !== \"anonymous\") await addMessage(env2, ip, userId, sessionId, message, msg);
            ultra.done(msg, {
              intent: \"execute_mcp\",
              thinking_steps: [
                { title: \"MCP oauth required\", detail: streamForcedConnector, status: \"blocked\" },
                { title: \"Authorize URL\", detail: authUrl || \"mcp_oauth_start\", status: \"done\" }
              ],
              mcp: { connector: streamForcedConnector, tool: streamForcedTool, oauth_required: true, authorize_url: authUrl },
              model: \"mcp\"
            });
            return;
          }
          const forcedMcp = matchMcpFromMessage(message, mcpTools);
          if (forcedMcp && forcedMcp.connector && forcedMcp.name) {
            ultra.thinking(\"Using connected MCP: \" + forcedMcp.connector + \".\" + forcedMcp.name);
            let mcpResult = { success: false, error: \"call failed\" };
            try {
              mcpResult = await callMcpTool(env2, userId, forcedMcp.connector, forcedMcp.name, {});
            } catch (e) {
              mcpResult = { success: false, error: e && e.message ? e.message : String(e) };
            }
            const steps = typeof buildMcpThinkingSteps === \"function\"
              ? buildMcpThinkingSteps({ message, connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult })
              : [];
            if (mcpResult && mcpResult.oauth_required) {
              // PHASE_B_DAY40 — real authorize_url on stream path
              let authStart = null;
              try {
                if (typeof getMcpOAuthStart === \"function\") authStart = await getMcpOAuthStart(env2, userId, forcedMcp.connector);
              } catch (_) {}
              const authUrl = (authStart && (authStart.authorize_url || authStart.url)) || mcpResult.reauth_url || null;
              const msg = authUrl
                ? (\"Please authorize MCP **\" + forcedMcp.connector + \"** first, then ask again.\\n\\n\" + authUrl)
                : ((mcpResult.message || \"Please reconnect MCP\") + (mcpResult.reauth_url ? \"\\n\" + mcpResult.reauth_url : \"\"));
              ultra.chunk(msg);
              if (userId !== \"anonymous\") await addMessage(env2, ip, userId, sessionId, message, msg);
              ultra.done(msg, { intent: \"execute_mcp\", thinking_steps: steps, mcp: { connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult, authorize_url: authUrl }, model: \"mcp\" });
              return;
            }
"""

def load_worker():
    p = Path("worker.ts")
    t = p.read_text() if p.exists() else ""
    bad = (
        "PLACEHOLDER_WILL_FAIL" in t
        or t.strip() in ("PLACEHOLDER", "PLACEHOLDER_WILL_FAIL", "")
        or len(t) < 10000
        or "PHASE_B_DAY39" not in t
    )
    if bad:
        print("restoring worker.ts from day39 baseline")
        t = urllib.request.urlopen(DAY39_URL, timeout=90).read().decode()
        if "PLACEHOLDER" in t[:100] or "PHASE_B_DAY39" not in t or len(t) < 10000:
            raise SystemExit("baseline download invalid — abort")
        p.write_text(t)
    return p, t

def main():
    p, t = load_worker()
    if "PHASE_B_DAY40" in t:
        print("already applied")
        return

    d35 = t.find("PHASE_B_DAY35")
    if d35 < 0:
        raise SystemExit("PHASE_B_DAY35 not found")
    cmt = t.find("// PHASE_B_DAY36", d35)
    ans = t.find("const answerPrompt = typeof buildMcpAnswerPrompt", cmt)
    if cmt < 0 or ans < 0:
        raise SystemExit("stream anchors missing: cmt=%s ans=%s" % (cmt, ans))

    t2 = t[:cmt] + INSERT + t[ans:]

    marker = "try { authStart = await getMcpOAuthStart(env2, auth.userId, connector); } catch (_) {}"
    if marker not in t2:
        raise SystemExit("nonstream getMcpOAuthStart marker missing")
    if "PHASE_B_DAY40 — Claude-style reauth" not in t2:
        t2 = t2.replace(
            marker,
            marker
            + "\n      // PHASE_B_DAY40 — Claude-style reauth\n"
            + "      const authUrl = (authStart && (authStart.authorize_url || authStart.url)) || null;",
            1,
        )
        old_msg = (
            'const msg = "Please authorize MCP **" + connector + "** first."'
            ' + (authStart && authStart.authorize_url ? ("\\n" + authStart.authorize_url) : "");'
        )
        new_msg = (
            "const msg = authUrl\n"
            '        ? ("Please authorize MCP **" + connector + "** first, then ask the same question again.\\n\\n" + authUrl)\n'
            '        : ("Please authorize MCP **" + connector + "** first. Use action `mcp_oauth_start`.");'
        )
        if old_msg not in t2:
            raise SystemExit("nonstream msg line not found")
        t2 = t2.replace(old_msg, new_msg, 1)
        t2 = t2.replace(
            "mcp: { connector, tool: toolName, result: mcpResult },",
            "mcp: { connector, tool: toolName, result: mcpResult, oauth_required: true, authorize_url: authUrl },",
            1,
        )

    old39 = 'if (m.includes("sentry")) named.push("sentry");\n      for (const id of named) {'
    new39 = (
        'if (m.includes("sentry")) named.push("sentry");\n'
        '      if (m.includes("atlassian") || m.includes("jira") || m.includes("confluence")) named.push("atlassian");\n'
        '      if (m.includes("asana")) named.push("asana");\n'
        '      if (m.includes("canva")) named.push("canva");\n'
        "      // PHASE_B_DAY40 — extra native MCP names\n"
        "      for (const id of named) {"
    )
    if old39 in t2:
        t2 = t2.replace(old39, new39, 1)

    if "PLACEHOLDER_WILL_FAIL" in t2 or t2.strip() in ("PLACEHOLDER", "PLACEHOLDER_WILL_FAIL"):
        raise SystemExit("refusing to write PLACEHOLDER content")
    if "PHASE_B_DAY39" not in t2 or "PHASE_B_DAY40" not in t2:
        raise SystemExit("DAY39/DAY40 markers missing after patch")
    if t2.count("{") != t2.count("}"):
        raise SystemExit("brace mismatch %s vs %s" % (t2.count("{"), t2.count("}")))
    if len(t2) < 10000:
        raise SystemExit("patched file too small — abort")

    p.write_text(t2)
    print("applied PHASE_B_DAY40 count=%s len=%s" % (t2.count("PHASE_B_DAY40"), len(t2)))

if __name__ == "__main__":
    main()
