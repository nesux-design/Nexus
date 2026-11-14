#!/usr/bin/env python3
"""Phase B Day 40: MCP reauth authorize_url + stream oauth probe parity. Idempotent."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "PHASE_B_DAY40" in t:
        print("already applied")
        return

    old_stream = """          // PHASE_B_DAY36 — fill tools if catalog empty but user named a connector
          if (typeof ensureMcpToolsForMessage === \"function\") {
            mcpTools = await ensureMcpToolsForMessage(env2, userId, message, mcpTools);
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
              const msg = (mcpResult.message || \"Please reconnect MCP\") + (mcpResult.reauth_url ? \"\\n\" + mcpResult.reauth_url : \"\");
              ultra.chunk(msg);
              if (userId !== \"anonymous\") await addMessage(env2, ip, userId, sessionId, message, msg);
              ultra.done(msg, { intent: \"execute_mcp\", thinking_steps: steps, mcp: { connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult }, model: \"mcp\" });
              return;
            }"""

    new_stream = r'''          // PHASE_B_DAY36 — fill tools if catalog empty but user named a connector
          if (typeof ensureMcpToolsForMessage === "function") {
            mcpTools = await ensureMcpToolsForMessage(env2, userId, message, mcpTools);
          }
          // PHASE_B_DAY40 — stream parity: named connector + empty tools => oauth probe (same as non-stream day39)
          let streamForcedConnector = null;
          let streamForcedTool = null;
          if ((!mcpTools || !mcpTools.length) && typeof listMcpTools === "function") {
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
              if (m.includes("atlassian") || m.includes("jira") || m.includes("confluence")) named.push("atlassian");
              if (m.includes("asana")) named.push("asana");
              if (m.includes("canva")) named.push("canva");
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
                  streamForcedTool = /\\b(whoami|identity|profile|connected)\\b/i.test(m) ? "whoami" : "whoami";
                  break;
                }
              }
            } catch (e) {
              console.error("PHASE_B_DAY40 stream mcp oauth probe", e && e.message);
            }
          }
          if (streamForcedConnector && typeof callMcpTool === "function") {
            ultra.thinking("MCP needs authorization: " + streamForcedConnector);
            let authStart = null;
            try {
              if (typeof getMcpOAuthStart === "function") authStart = await getMcpOAuthStart(env2, userId, streamForcedConnector);
            } catch (_) {}
            const authUrl = (authStart && (authStart.authorize_url || authStart.url)) || null;
            const msg = authUrl
              ? ("**" + streamForcedConnector + "** MCP connect karo, phir same sawaal poochho.\n\nAuthorize: " + authUrl)
              : ("**" + streamForcedConnector + "** MCP authorize karna hoga. Action `mcp_oauth_start` with connector `" + streamForcedConnector + "` use karo.");
            ultra.chunk(msg);
            if (userId !== "anonymous") await addMessage(env2, ip, userId, sessionId, message, msg);
            ultra.done(msg, {
              intent: "execute_mcp",
              thinking_steps: [
                { title: "Understanding request", detail: String(message).substring(0, 120), status: "done" },
                { title: "MCP oauth required", detail: streamForcedConnector, status: "blocked" },
                { title: "Authorize URL", detail: authUrl || "mcp_oauth_start", status: "done" }
              ],
              mcp: { connector: streamForcedConnector, tool: streamForcedTool, oauth_required: true, authorize_url: authUrl },
              model: "mcp"
            });
            return;
          }
          const forcedMcp = matchMcpFromMessage(message, mcpTools);
          if (forcedMcp && forcedMcp.connector && forcedMcp.name) {
            ultra.thinking("Using connected MCP: " + forcedMcp.connector + "." + forcedMcp.name);
            let mcpResult = { success: false, error: "call failed" };
            try {
              mcpResult = await callMcpTool(env2, userId, forcedMcp.connector, forcedMcp.name, {});
            } catch (e) {
              mcpResult = { success: false, error: e && e.message ? e.message : String(e) };
            }
            const steps = typeof buildMcpThinkingSteps === "function"
              ? buildMcpThinkingSteps({ message, connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult })
              : [];
            if (mcpResult && mcpResult.oauth_required) {
              // PHASE_B_DAY40 — real authorize_url (not bare "Please reconnect")
              let authStart = null;
              try {
                if (typeof getMcpOAuthStart === "function") authStart = await getMcpOAuthStart(env2, userId, forcedMcp.connector);
              } catch (_) {}
              const authUrl = (authStart && (authStart.authorize_url || authStart.url)) || mcpResult.reauth_url || null;
              const msg = authUrl
                ? ("Please authorize MCP **" + forcedMcp.connector + "** first, then ask again.\n\n" + authUrl)
                : ((mcpResult.message || "Please reconnect MCP **" + forcedMcp.connector + "**") + (mcpResult.reauth_url ? "\n" + mcpResult.reauth_url : ""));
              ultra.chunk(msg);
              if (userId !== "anonymous") await addMessage(env2, ip, userId, sessionId, message, msg);
              ultra.done(msg, { intent: "execute_mcp", thinking_steps: steps, mcp: { connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult, authorize_url: authUrl }, model: "mcp" });
              return;
            }'''

    if old_stream not in t:
        raise SystemExit("stream block not found")
    t = t.replace(old_stream, new_stream, 1)

    old_ns = """    if (mcpResult && mcpResult.oauth_required) {
      let authStart = null;
      try { authStart = await getMcpOAuthStart(env2, auth.userId, connector); } catch (_) {}
      const msg = \"Please authorize MCP **\" + connector + \"** first.\" + (authStart && authStart.authorize_url ? (\"\\n\" + authStart.authorize_url) : \"\");
      await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);
      // PHASE_B_DAY38 — schema v2 envelope
      {
        const _snap = await getUsageSnapshot2026(env2, auth.userId);
        return new Response(JSON.stringify({
          response: msg,
          thinking_steps: steps,
          intent: \"execute_mcp\",
          mcp: { connector, tool: toolName, result: mcpResult },
          model: \"mcp\","""

    new_ns = """    if (mcpResult && mcpResult.oauth_required) {
      // PHASE_B_DAY40 — Claude-style reauth: always surface authorize_url when available
      let authStart = null;
      try { authStart = await getMcpOAuthStart(env2, auth.userId, connector); } catch (_) {}
      const authUrl = (authStart && (authStart.authorize_url || authStart.url)) || null;
      const msg = authUrl
        ? (\"Please authorize MCP **\" + connector + \"** first, then ask the same question again.\\n\\n\" + authUrl)
        : (\"Please authorize MCP **\" + connector + \"** first. Use action `mcp_oauth_start` with connector `\" + connector + \"`.\");
      await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);
      // PHASE_B_DAY38 — schema v2 envelope
      {
        const _snap = await getUsageSnapshot2026(env2, auth.userId);
        return new Response(JSON.stringify({
          response: msg,
          thinking_steps: steps,
          intent: \"execute_mcp\",
          mcp: { connector, tool: toolName, result: mcpResult, oauth_required: true, authorize_url: authUrl },
          model: \"mcp\","""

    if old_ns not in t:
        raise SystemExit("nonstream oauth block not found")
    t = t.replace(old_ns, new_ns, 1)

    old39 = """      if (m.includes(\"sentry\")) named.push(\"sentry\");
      for (const id of named) {"""
    new39 = """      if (m.includes(\"sentry\")) named.push(\"sentry\");
      if (m.includes(\"atlassian\") || m.includes(\"jira\") || m.includes(\"confluence\")) named.push(\"atlassian\");
      if (m.includes(\"asana\")) named.push(\"asana\");
      if (m.includes(\"canva\")) named.push(\"canva\");
      // PHASE_B_DAY40 — extra native MCP names (parity with stream probe)
      for (const id of named) {"""
    if old39 in t:
        t = t.replace(old39, new39, 1)

    p.write_text(t)
    print("applied PHASE_B_DAY40", t.count("PHASE_B_DAY40"))

if __name__ == "__main__":
    main()
