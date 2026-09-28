#!/usr/bin/env python3
from pathlib import Path
import re, sys
p = Path('worker.ts')
t = p.read_text()
if 'buildPluginAnswerPrompt' in t and 'pluginDecls' in t:
    print('Already agentic'); sys.exit(0)
if 'oauth-plugins.js' not in t: sys.exit('need oauth wire first')

old_imp = '''import {
  getPluginToolsForUser,
  formatPluginsForThinking,
  matchPluginFromMessage,
  buildPluginThinkingSteps,
  thinkingStepsToText,
  executePluginLayer,
  reauthPayload,
  runPluginApi
} from "./oauth-plugins.js";'''
new_imp = '''import {
  getPluginToolsForUser,
  formatPluginsForThinking,
  matchPluginFromMessage,
  buildPluginThinkingSteps,
  thinkingStepsToText,
  executePluginLayer,
  reauthPayload,
  runPluginApi,
  pluginToolsToGeminiDeclarations,
  pluginToolsToOpenAITools,
  parsePluginFunctionName,
  buildPluginAnswerPrompt
} from "./oauth-plugins.js";'''
if old_imp in t: t = t.replace(old_imp, new_imp, 1)

t = t.replace(
    'async function resolveViaGemini(userMessage, context, hasLastImage, lastImageDesc) {',
    'async function resolveViaGemini(userMessage, context, hasLastImage, lastImageDesc, pluginDecls) {', 1)
t = t.replace(
    'tools: [{ functionDeclarations: getToolDeclarations() }],',
    'tools: [{ functionDeclarations: getToolDeclarations().concat(pluginDecls || []) }],', 1)

old_ret = 'return { action: TOOL_NAME_TO_ACTION[toolName] || "general_chat", args, reasoning: "Called tool: " + toolName, confidence: 0.95, resolvedBy: "gemini" };'
new_ret = (
    'if (String(toolName).startsWith("plugin_") && typeof parsePluginFunctionName === "function") {\n'
    '        const parsed = parsePluginFunctionName(toolName);\n'
    '        if (parsed) {\n'
    '          return { action: "execute_plugin", args: { app: parsed.app, action: parsed.action, ...args }, reasoning: "Called plugin: " + toolName, confidence: 0.95, resolvedBy: "gemini", pluginTool: toolName };\n'
    '        }\n'
    '      }\n'
    '      return { action: TOOL_NAME_TO_ACTION[toolName] || "general_chat", args, reasoning: "Called tool: " + toolName, confidence: 0.95, resolvedBy: "gemini" };'
)
if old_ret in t: t = t.replace(old_ret, new_ret, 1)

t = t.replace(
    'async function resolveViaOpenAICompatible(providerName, endpoint, model, userMessage, context, hasLastImage, lastImageDesc) {',
    'async function resolveViaOpenAICompatible(providerName, endpoint, model, userMessage, context, hasLastImage, lastImageDesc, pluginOpenAITools) {', 1)
t = t.replace('tools: getOpenAIStyleTools(),', 'tools: getOpenAIStyleTools().concat(pluginOpenAITools || []),', 1)

old_oai = 'return { action: TOOL_NAME_TO_ACTION[toolName] || "general_chat", args, reasoning: "Called tool: " + toolName, confidence: 0.9, resolvedBy: providerName };'
new_oai = (
    'if (String(toolName).startsWith("plugin_") && typeof parsePluginFunctionName === "function") {\n'
    '        const parsed = parsePluginFunctionName(toolName);\n'
    '        if (parsed) {\n'
    '          return { action: "execute_plugin", args: { app: parsed.app, action: parsed.action, ...args }, reasoning: "Called plugin: " + toolName, confidence: 0.9, resolvedBy: providerName, pluginTool: toolName };\n'
    '        }\n'
    '      }\n'
    '      return { action: TOOL_NAME_TO_ACTION[toolName] || "general_chat", args, reasoning: "Called tool: " + toolName, confidence: 0.9, resolvedBy: providerName };'
)
if old_oai in t: t = t.replace(old_oai, new_oai, 1)

t = re.sub(
    r'async function resolveToolIntent\(userMessage, context, hasLastImage, lastImageDesc\) \{[\s\S]*?resolvedBy: "none" \};\n\}',
    '''async function resolveToolIntent(userMessage, context, hasLastImage, lastImageDesc, connected_tools) {
  const pluginDecls = typeof pluginToolsToGeminiDeclarations === "function" ? pluginToolsToGeminiDeclarations(connected_tools || []) : [];
  const pluginOpenAI = typeof pluginToolsToOpenAITools === "function" ? pluginToolsToOpenAITools(connected_tools || []) : [];
  const geminiResult = await resolveViaGemini(userMessage, context, hasLastImage, lastImageDesc, pluginDecls);
  if (geminiResult)
    return geminiResult;
  const groqResult = await resolveViaOpenAICompatible("groq", "https://api.groq.com/openai/v1/chat/completions", "openai/gpt-oss-120b", userMessage, context, hasLastImage, lastImageDesc, pluginOpenAI);
  if (groqResult)
    return groqResult;
  const cerebrasResult = await resolveViaOpenAICompatible("cerebras", "https://api.cerebras.ai/v1/chat/completions", "gpt-oss-120b", userMessage, context, hasLastImage, lastImageDesc, pluginOpenAI);
  if (cerebrasResult)
    return cerebrasResult;
  const openDeepResult = await resolveViaOpenAICompatible("openrouter", "https://openrouter.ai/api/v1/chat/completions", "deepseek/deepseek-v4.1-flash", userMessage, context, hasLastImage, lastImageDesc, pluginOpenAI);
  if (openDeepResult)
    return openDeepResult;
  return { action: "general_chat", args: {}, reasoning: "All tool resolvers unavailable", confidence: 0.3, resolvedBy: "none" };
}''',
    t, count=1)

meta_pat = re.compile(r'async function metaThinking2026\(env2, userMessage, sessionContext, hasLastImage, lastImageDesc, isPremium, userId\) \{[\s\S]*?\n\}')
m = meta_pat.search(t)
if not m: sys.exit('meta missing')
new_meta = '''async function metaThinking2026(env2, userMessage, sessionContext, hasLastImage, lastImageDesc, isPremium, userId) {
  if (!CONFIG.THINKING_MODE) {
    return { action: "general_chat", prompt: userMessage, reasoning: "Thinking disabled", confidence: 0.5, args: {}, connected_tools: [], thinking_steps: [] };
  }
  let connected_tools = [];
  try {
    if (userId && typeof getPluginToolsForUser === "function") {
      connected_tools = await getPluginToolsForUser(env2, userId, listIntegrations);
    }
  } catch (e) {
    console.error("plugin tools load", e && e.message);
  }
  const resolved = await resolveToolIntent(userMessage, sessionContext, hasLastImage, lastImageDesc, connected_tools);
  const pluginBlock = typeof formatPluginsForThinking === "function" ? formatPluginsForThinking(connected_tools) : "";
  const reasoning = [resolved.reasoning, pluginBlock].filter(Boolean).join("\\n\\n");
  let matched = null;
  if (resolved.action === "execute_plugin" && resolved.args) {
    matched = { app: resolved.args.app, tool: resolved.args.action, action: resolved.args.action, description: resolved.reasoning };
  }
  const thinking_steps = typeof buildPluginThinkingSteps === "function"
    ? buildPluginThinkingSteps({ message: userMessage, tools: connected_tools, matched, result: null, phase: "model_decide" })
    : [];
  return {
    action: resolved.action,
    prompt: userMessage,
    reasoning,
    confidence: resolved.confidence,
    args: resolved.args,
    connected_tools,
    thinking_steps,
    pluginTool: resolved.pluginTool || null
  };
}'''
t = t[:m.start()] + new_meta + t[m.end():]

m2 = re.search(r'\n  // Claude/Grok-style auto plugin tool call\n  try \{[\s\S]*?console\.error\("auto plugin".*?\);\n  \}', t)
if m2: t = t[:m2.start()] + t[m2.end():]

marker = '  if (thinking.action === "real_photo")'
if 'thinking.action === "execute_plugin"' not in t[t.find('handleChatAction'):t.find('handleChatAction')+6000]:
    handler = '''  if (thinking.action === "execute_plugin") {
    const app = thinking.args?.app;
    const pluginAction = thinking.args?.action || thinking.args?.tool;
    const pluginParams = { ...(thinking.args || {}) };
    delete pluginParams.app; delete pluginParams.action; delete pluginParams.tool;
    const pluginResult = await executePluginNew(env2, auth, { app, action: pluginAction, params: pluginParams });
    const steps = typeof buildPluginThinkingSteps === "function" ? buildPluginThinkingSteps({ message, tools: thinking.connected_tools || [], matched: { app, tool: pluginAction, action: pluginAction, description: thinking.reasoning }, result: pluginResult, phase: "model_decide" }) : [];
    if (pluginResult && pluginResult.error === "reauth_required") {
      const msg = (pluginResult.message || "Please reconnect") + (pluginResult.reauth_url ? "\\n" + pluginResult.reauth_url : "");
      await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);
      return new Response(JSON.stringify({ response: msg, thinking: typeof thinkingStepsToText === "function" ? thinkingStepsToText(steps) : thinking.reasoning, thinking_steps: steps, intent: "execute_plugin", plugin: { app, tool: pluginAction, result: pluginResult }, connected_tools: thinking.connected_tools, model: "plugin" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    const rawData = pluginResult?.data !== undefined ? pluginResult.data : pluginResult;
    const answerPrompt = typeof buildPluginAnswerPrompt === "function" ? buildPluginAnswerPrompt(message, app, pluginAction, rawData) : ("User: " + message + "\\nData: " + JSON.stringify(rawData).substring(0, 8000));
    let natural = null;
    try {
      const aiOut = await callGeminiOrGroq(answerPrompt, [{ role: "user", content: answerPrompt }], { temperature: 0.4, maxTokens: 1200, useWebSearch: false });
      natural = aiOut?.result || aiOut?.text || null;
    } catch (e) { console.error("plugin answer synth", e && e.message); }
    if (!natural) natural = typeof rawData === "string" ? rawData : JSON.stringify(rawData, null, 2).substring(0, 4000);
    await addMessage(env2, ip, auth.userId, sessionId, message, natural, true);
    return new Response(JSON.stringify({ response: natural, thinking: typeof thinkingStepsToText === "function" ? thinkingStepsToText(steps) : thinking.reasoning, thinking_steps: steps, intent: "execute_plugin", plugin: { app, tool: pluginAction, result: pluginResult }, connected_tools: thinking.connected_tools, model: "plugin+llm" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
'''
    if marker in t: t = t.replace(marker, handler + marker, 1)

assert 'buildPluginAnswerPrompt' in t
assert 'pluginDecls' in t
p.write_text(t)
print('AGENTIC OK', len(t))
