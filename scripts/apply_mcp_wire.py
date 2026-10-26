#!/usr/bin/env python3
"""Apply MCP gateway wire to Nexus worker.ts (phone/Termux safe)."""
from pathlib import Path

def main():
    root = Path.cwd()
    if (root / "worker.ts").exists():
        worker = root / "worker.ts"
    elif (root.parent / "worker.ts").exists():
        worker = root.parent / "worker.ts"
    else:
        print("Run from Nexus repo root (where worker.ts is)")
        raise SystemExit(1)
    text = worker.read_text(encoding="utf-8")
    if "mcp_connectors" in text and "loadMcpToolsForUser" in text:
        print("Already patched.")
        return

    def must(old, new, label):
        nonlocal text
        if old not in text:
            raise SystemExit("MISSING block: " + label)
        text = text.replace(old, new, 1)
        print("OK", label)

    must(
        "  ENCRYPTION_KEY: string;",
        "  ENCRYPTION_KEY: string;\n  NEXUS_INTERNAL_AUTH_SECRET?: string;\n  MCP_SERVER_URL?: string;",
        "env",
    )

    old_imp = (
        '  buildPluginAnswerPrompt\n'
        '} from "./oauth-plugins.js";'
    )
    new_imp = (
        '  buildPluginAnswerPrompt\n'
        '} from "./oauth-plugins.js";\n'
        'import {\n'
        '  loadMcpToolsForUser,\n'
        '  listMcpConnectors,\n'
        '  callMcpTool,\n'
        '  getMcpOAuthStart,\n'
        '  listMcpTools,\n'
        '  mcpToolsToGeminiDeclarations,\n'
        '  mcpToolsToOpenAITools,\n'
        '  parseMcpFunctionName,\n'
        '  matchMcpFromMessage,\n'
        '  formatMcpForThinking,\n'
        '  buildMcpThinkingSteps,\n'
        '  buildMcpAnswerPrompt,\n'
        '  listMcpGatewayCatalog,\n'
        '  MCP_GATEWAY_CONNECTORS\n'
        '} from "./mcp-client.js";'
    )
    must(old_imp, new_imp, "import")

    old_g = (
        '      if (String(toolName).startsWith("plugin_") && typeof parsePluginFunctionName === "function") {\n'
        '        const parsed = parsePluginFunctionName(toolName);\n'
        '        if (parsed) {\n'
        '          return { action: "execute_plugin", args: { app: parsed.app, action: parsed.action, ...args }, reasoning: "Called plugin: " + toolName, confidence: 0.95, resolvedBy: "gemini", pluginTool: toolName };\n'
        '        }\n'
        '      }\n'
        '      return { action: TOOL_NAME_TO_ACTION[toolName] || "general_chat", args, reasoning: "Called tool: " + toolName, confidence: 0.95, resolvedBy: "gemini" };'
    )
    new_g = (
        '      if (String(toolName).startsWith("plugin_") && typeof parsePluginFunctionName === "function") {\n'
        '        const parsed = parsePluginFunctionName(toolName);\n'
        '        if (parsed) {\n'
        '          return { action: "execute_plugin", args: { app: parsed.app, action: parsed.action, ...args }, reasoning: "Called plugin: " + toolName, confidence: 0.95, resolvedBy: "gemini", pluginTool: toolName };\n'
        '        }\n'
        '      }\n'
        '      if (String(toolName).startsWith("mcp_") && typeof parseMcpFunctionName === "function") {\n'
        '        const parsed = parseMcpFunctionName(toolName);\n'
        '        if (parsed) {\n'
        '          return { action: "execute_mcp", args: { connector: parsed.connector, tool: parsed.tool, ...args }, reasoning: "Called MCP: " + toolName, confidence: 0.95, resolvedBy: "gemini", mcpTool: toolName };\n'
        '        }\n'
        '      }\n'
        '      return { action: TOOL_NAME_TO_ACTION[toolName] || "general_chat", args, reasoning: "Called tool: " + toolName, confidence: 0.95, resolvedBy: "gemini" };'
    )
    must(old_g, new_g, "gemini")

    old_o = (
        '      if (String(toolName).startsWith("plugin_") && typeof parsePluginFunctionName === "function") {\n'
        '        const parsed = parsePluginFunctionName(toolName);\n'
        '        if (parsed) {\n'
        '          return { action: "execute_plugin", args: { app: parsed.app, action: parsed.action, ...args }, reasoning: "Called plugin: " + toolName, confidence: 0.9, resolvedBy: providerName, pluginTool: toolName };\n'
        '        }\n'
        '      }\n'
        '      return { action: TOOL_NAME_TO_ACTION[toolName] || "general_chat", args, reasoning: "Called tool: " + toolName, confidence: 0.9, resolvedBy: providerName };'
    )
    new_o = (
        '      if (String(toolName).startsWith("plugin_") && typeof parsePluginFunctionName === "function") {\n'
        '        const parsed = parsePluginFunctionName(toolName);\n'
        '        if (parsed) {\n'
        '          return { action: "execute_plugin", args: { app: parsed.app, action: parsed.action, ...args }, reasoning: "Called plugin: " + toolName, confidence: 0.9, resolvedBy: providerName, pluginTool: toolName };\n'
        '        }\n'
        '      }\n'
        '      if (String(toolName).startsWith("mcp_") && typeof parseMcpFunctionName === "function") {\n'
        '        const parsed = parseMcpFunctionName(toolName);\n'
        '        if (parsed) {\n'
        '          return { action: "execute_mcp", args: { connector: parsed.connector, tool: parsed.tool, ...args }, reasoning: "Called MCP: " + toolName, confidence: 0.9, resolvedBy: providerName, mcpTool: toolName };\n'
        '        }\n'
        '      }\n'
        '      return { action: TOOL_NAME_TO_ACTION[toolName] || "general_chat", args, reasoning: "Called tool: " + toolName, confidence: 0.9, resolvedBy: providerName };'
    )
    must(old_o, new_o, "openai")

    old_rti = (
        'async function resolveToolIntent(userMessage, context, hasLastImage, lastImageDesc, connected_tools) {\n'
        '  const pluginDecls = typeof pluginToolsToGeminiDeclarations === "function" ? pluginToolsToGeminiDeclarations(connected_tools || []) : [];\n'
        '  const pluginOpenAI = typeof pluginToolsToOpenAITools === "function" ? pluginToolsToOpenAITools(connected_tools || []) : [];\n'
        '  const geminiResult = await resolveViaGemini(userMessage, context, hasLastImage, lastImageDesc, pluginDecls);\n'
        '  if (geminiResult)\n'
        '    return geminiResult;\n'
        '  const groqResult = await resolveViaOpenAICompatible("groq", "https://api.groq.com/openai/v1/chat/completions", "openai/gpt-oss-120b", userMessage, context, hasLastImage, lastImageDesc, pluginOpenAI);\n'
        '  if (groqResult)\n'
        '    return groqResult;\n'
        '  const cerebrasResult = await resolveViaOpenAICompatible("cerebras", "https://api.cerebras.ai/v1/chat/completions", "gpt-oss-120b", userMessage, context, hasLastImage, lastImageDesc, pluginOpenAI);\n'
        '  if (cerebrasResult)\n'
        '    return cerebrasResult;\n'
        '  const openDeepResult = await resolveViaOpenAICompatible("openrouter", "https://openrouter.ai/api/v1/chat/completions", "deepseek/deepseek-v4.1-flash", userMessage, context, hasLastImage, lastImageDesc, pluginOpenAI);\n'
        '  if (openDeepResult)\n'
        '    return openDeepResult;\n'
        '  return { action: "general_chat", args: {}, reasoning: "All tool resolvers unavailable", confidence: 0.3, resolvedBy: "none" };\n'
        '}'
    )
    new_rti = (
        'async function resolveToolIntent(userMessage, context, hasLastImage, lastImageDesc, connected_tools, mcpDecls, mcpOpenAI) {\n'
        '  const pluginDecls = typeof pluginToolsToGeminiDeclarations === "function" ? pluginToolsToGeminiDeclarations(connected_tools || []) : [];\n'
        '  const pluginOpenAI = typeof pluginToolsToOpenAITools === "function" ? pluginToolsToOpenAITools(connected_tools || []) : [];\n'
        '  const allGemini = (pluginDecls || []).concat(mcpDecls || []);\n'
        '  const allOpenAI = (pluginOpenAI || []).concat(mcpOpenAI || []);\n'
        '  const geminiResult = await resolveViaGemini(userMessage, context, hasLastImage, lastImageDesc, allGemini);\n'
        '  if (geminiResult)\n'
        '    return geminiResult;\n'
        '  const groqResult = await resolveViaOpenAICompatible("groq", "https://api.groq.com/openai/v1/chat/completions", "openai/gpt-oss-120b", userMessage, context, hasLastImage, lastImageDesc, allOpenAI);\n'
        '  if (groqResult)\n'
        '    return groqResult;\n'
        '  const cerebrasResult = await resolveViaOpenAICompatible("cerebras", "https://api.cerebras.ai/v1/chat/completions", "gpt-oss-120b", userMessage, context, hasLastImage, lastImageDesc, allOpenAI);\n'
        '  if (cerebrasResult)\n'
        '    return cerebrasResult;\n'
        '  const openDeepResult = await resolveViaOpenAICompatible("openrouter", "https://openrouter.ai/api/v1/chat/completions", "deepseek/deepseek-v4.1-flash", userMessage, context, hasLastImage, lastImageDesc, allOpenAI);\n'
        '  if (openDeepResult)\n'
        '    return openDeepResult;\n'
        '  return { action: "general_chat", args: {}, reasoning: "All tool resolvers unavailable", confidence: 0.3, resolvedBy: "none" };\n'
        '}'
    )
    must(old_rti, new_rti, "rti")

    old_call = "  const resolved = await resolveToolIntent(userMessage, sessionContext, hasLastImage, lastImageDesc, connected_tools);"
    if old_call in text:
        repl = """  let mcpPack = { tools: [], decls: [], notes: [], oauthNeeded: [] };
  try {
    if (userId && typeof loadMcpToolsForUser === "function") {
      mcpPack = await loadMcpToolsForUser(env2, userId, { limit: 10 });
    }
  } catch (e) {
    console.error("mcp tools load", e && e.message);
  }
  const mcpDecls = mcpPack.decls || [];
  const mcpOpenAI = typeof mcpToolsToOpenAITools === "function" ? mcpToolsToOpenAITools(mcpPack.tools || []) : [];
  const resolved = await resolveToolIntent(userMessage, sessionContext, hasLastImage, lastImageDesc, connected_tools, mcpDecls, mcpOpenAI);"""
        text = text.replace(old_call, repl, 1)
        print("OK meta load")
    old_ret = """    connected_tools,
    thinking_steps,
    pluginTool: resolved.pluginTool || null
  };"""
    new_ret = """    connected_tools,
    mcp_tools: (typeof mcpPack !== "undefined" && mcpPack.tools) ? mcpPack.tools : [],
    thinking_steps,
    pluginTool: resolved.pluginTool || null,
    mcpTool: resolved.mcpTool || null
  };"""
    if old_ret in text:
        text = text.replace(old_ret, new_ret, 1)
        print("OK return fields")

    end_pat = "thinking.confidence = Math.max(thinking.confidence || 0, 0.92);\n    }\n  }"
    idx = text.find("Forced plugin:")
    if idx >= 0 and "Forced MCP" not in text:
        pos = text.find(end_pat, idx)
        if pos >= 0:
            insert_at = pos + len(end_pat)
            mcp_force = (
                '\n  if (thinking.action === "general_chat" && thinking.mcp_tools && thinking.mcp_tools.length && typeof matchMcpFromMessage === "function") {\n'
                '    const forcedMcp = matchMcpFromMessage(message, thinking.mcp_tools);\n'
                '    if (forcedMcp) {\n'
                '      thinking.action = "execute_mcp";\n'
                '      thinking.args = { connector: forcedMcp.connector, tool: forcedMcp.name };\n'
                '      thinking.reasoning = (thinking.reasoning || "") + " | Forced MCP: " + forcedMcp.connector + "." + forcedMcp.name;\n'
                '      thinking.confidence = Math.max(thinking.confidence || 0, 0.9);\n'
                '    }\n'
                '  }'
            )
            text = text[:insert_at] + mcp_force + text[insert_at:]
            print("OK mcp force")

    marker2 = '  if (thinking.action === "real_photo") {'
    if 'thinking.action === "execute_mcp"' not in text:
        if marker2 not in text:
            raise SystemExit("real_photo missing")
        mcp_exec = (
            '  if (thinking.action === "execute_mcp") {\n'
            '    const connector = thinking.args?.connector || thinking.args?.app;\n'
            '    const toolName = thinking.args?.tool || thinking.args?.action || thinking.args?.name;\n'
            '    const toolArgs = { ...(thinking.args || {}) };\n'
            '    delete toolArgs.connector; delete toolArgs.app; delete toolArgs.tool; delete toolArgs.action; delete toolArgs.name;\n'
            '    let mcpResult = { success: false, error: "callMcpTool unavailable" };\n'
            '    try {\n'
            '      mcpResult = await callMcpTool(env2, auth.userId, connector, toolName, toolArgs);\n'
            '    } catch (e) {\n'
            '      mcpResult = { success: false, error: e && e.message ? e.message : String(e) };\n'
            '    }\n'
            '    const steps = typeof buildMcpThinkingSteps === "function"\n'
            '      ? buildMcpThinkingSteps({ message, connector, tool: toolName, result: mcpResult })\n'
            '      : (thinking.thinking_steps || []);\n'
            '    if (mcpResult && mcpResult.oauth_required) {\n'
            '      let authStart = null;\n'
            '      try { authStart = await getMcpOAuthStart(env2, auth.userId, connector); } catch (_) {}\n'
            '      const msg = "Please authorize MCP **" + connector + "** first." + (authStart && authStart.authorize_url ? ("\\n" + authStart.authorize_url) : "");\n'
            '      await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);\n'
            '      return new Response(JSON.stringify({ response: msg, thinking_steps: steps, intent: "execute_mcp", mcp: { connector, tool: toolName, result: mcpResult }, model: "mcp" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });\n'
            '    }\n'
            '    if (!mcpResult || mcpResult.success === false) {\n'
            '      const msg = "MCP **" + connector + "." + toolName + "** failed: " + (mcpResult && mcpResult.error ? mcpResult.error : "unknown");\n'
            '      await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);\n'
            '      return new Response(JSON.stringify({ response: msg, thinking_steps: steps, intent: "execute_mcp", mcp: { connector, tool: toolName, result: mcpResult }, model: "mcp" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });\n'
            '    }\n'
            '    const rawData = mcpResult.data !== undefined ? mcpResult.data : mcpResult;\n'
            '    const answerPrompt = typeof buildMcpAnswerPrompt === "function" ? buildMcpAnswerPrompt(message, connector, toolName, rawData) : ("User: " + message + "\\nMCP: " + JSON.stringify(rawData).substring(0, 8000));\n'
            '    let natural = null;\n'
            '    try {\n'
            '      const aiOut = await callGeminiOrGroq(answerPrompt, [{ role: "user", content: answerPrompt }], { temperature: 0.4, maxTokens: 1200, useWebSearch: false });\n'
            '      natural = aiOut?.result || aiOut?.text || null;\n'
            '    } catch (e) { console.error("mcp answer synth", e && e.message); }\n'
            '    if (!natural) natural = typeof rawData === "string" ? rawData : JSON.stringify(rawData, null, 2).substring(0, 4000);\n'
            '    await addMessage(env2, ip, auth.userId, sessionId, message, natural, true);\n'
            '    return new Response(JSON.stringify({ response: natural, thinking_steps: steps, intent: "execute_mcp", mcp: { connector, tool: toolName, result: mcpResult }, model: "mcp+llm" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });\n'
            '  }\n'
        )
        text = text.replace(marker2, mcp_exec + marker2, 1)
        print("OK execute_mcp")

    if 'case "mcp_connectors"' not in text:
        ist = text.find('case "integration_status":')
        if ist < 0:
            raise SystemExit("integration_status missing")
        api = (
            '    case "mcp_connectors": {\n'
            '      let remote = [];\n'
            '      try { remote = await listMcpConnectors(env2, auth.userId); } catch (_) {}\n'
            '      const catalog = typeof listMcpGatewayCatalog === "function" ? listMcpGatewayCatalog() : Object.values(MCP_GATEWAY_CONNECTORS || {});\n'
            '      return new Response(JSON.stringify({ success: true, connectors: remote && remote.length ? remote : catalog, catalog }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });\n'
            '    }\n'
            '    case "mcp_oauth_start": {\n'
            '      const connector = body.connector || body.app || body.provider;\n'
            '      const started = await getMcpOAuthStart(env2, auth.userId, connector);\n'
            '      return new Response(JSON.stringify(started), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" }, status: started && started.success ? 200 : 400 });\n'
            '    }\n'
            '    case "mcp_tools_list": {\n'
            '      const connector = body.connector || body.app;\n'
            '      const res = await listMcpTools(env2, auth.userId, connector);\n'
            '      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });\n'
            '    }\n'
            '    case "mcp_tools_call": {\n'
            '      const connector = body.connector || body.app;\n'
            '      const name = body.name || body.tool;\n'
            '      const args = body.arguments || body.params || {};\n'
            '      const res = await callMcpTool(env2, auth.userId, connector, name, args);\n'
            '      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });\n'
            '    }\n'
        )
        text = text[:ist] + api + text[ist:]
        print("OK api")

    worker.write_text(text, encoding="utf-8")
    print("Wrote", worker, "size", len(text))
    print("Next: npx wrangler deploy")

if __name__ == "__main__":
    main()
