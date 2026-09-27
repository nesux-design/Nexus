#!/usr/bin/env python3
from pathlib import Path
import re, sys
p = Path("worker.ts")
t = p.read_text()
if 'from "./oauth-plugins.js"' in t and "matchPluginFromMessage" in t:
    print("Already wired"); sys.exit(0)
old_imp = 'import { env } from "cloudflare:workers";'
new_imp = '''import { env } from "cloudflare:workers";
import {
  getPluginToolsForUser,
  formatPluginsForThinking,
  matchPluginFromMessage,
  buildPluginThinkingSteps,
  thinkingStepsToText,
  executePluginLayer,
  reauthPayload,
  runPluginApi
} from "./oauth-plugins.js";'''
if old_imp not in t: sys.exit("import anchor missing")
t = t.replace(old_imp, new_imp, 1)
t = t.replace("`Bot ${token}`", "`Bearer ${token}`")
t = t.replace("Bot ${token}", "Bearer ${token}")
meta_pat = re.compile(r'async function metaThinking2026\(env2, userMessage, sessionContext, hasLastImage, lastImageDesc, isPremium, userId\) \{[\s\S]*?\n\}')
m = meta_pat.search(t)
if not m: sys.exit("metaThinking missing")
new_meta = '''async function metaThinking2026(env2, userMessage, sessionContext, hasLastImage, lastImageDesc, isPremium, userId) {
  if (!CONFIG.THINKING_MODE) {
    return { action: "general_chat", prompt: userMessage, reasoning: "Thinking disabled", confidence: 0.5, args: {}, connected_tools: [], thinking_steps: [] };
  }
  const resolved = await resolveToolIntent(userMessage, sessionContext, hasLastImage, lastImageDesc);
  let connected_tools = [];
  try {
    if (userId && typeof getPluginToolsForUser === "function") {
      connected_tools = await getPluginToolsForUser(env2, userId, listIntegrations);
    }
  } catch (e) {
    console.error("plugin tools load", e && e.message);
  }
  const pluginBlock = typeof formatPluginsForThinking === "function" ? formatPluginsForThinking(connected_tools) : "";
  const reasoning = [resolved.reasoning, pluginBlock].filter(Boolean).join("\\n\\n");
  const thinking_steps = typeof buildPluginThinkingSteps === "function"
    ? buildPluginThinkingSteps({ message: userMessage, tools: connected_tools, matched: null, result: null })
    : [];
  return {
    action: resolved.action,
    prompt: userMessage,
    reasoning,
    confidence: resolved.confidence,
    args: resolved.args,
    connected_tools,
    thinking_steps
  };
}'''
t = t[:m.start()] + new_meta + t[m.end():]
anchor = "  const thinking = await metaThinking2026(env2, message, sessionContext, !!session.lastImage, session.lastImageDesc, auth.isPremium, auth.userId);"
if anchor not in t: sys.exit("chat anchor missing")
inject = anchor + '''
  // Claude/Grok-style auto plugin tool call
  try {
    const matchedPluginTool = typeof matchPluginFromMessage === "function"
      ? matchPluginFromMessage(message, thinking.connected_tools || [])
      : null;
    if (matchedPluginTool && matchedPluginTool.scopes_ok) {
      const pluginResult = await executePluginNew(env2, auth, {
        app: matchedPluginTool.app,
        action: matchedPluginTool.action || matchedPluginTool.tool,
        params: body.pluginParams || {}
      });
      const steps = typeof buildPluginThinkingSteps === "function"
        ? buildPluginThinkingSteps({ message, tools: thinking.connected_tools || [], matched: matchedPluginTool, result: pluginResult })
        : [];
      const thinkText = typeof thinkingStepsToText === "function" ? thinkingStepsToText(steps) : (thinking.reasoning || "");
      const pluginText = pluginResult && pluginResult.error === "reauth_required"
        ? (pluginResult.message + (pluginResult.reauth_url ? "\\nReconnect: " + pluginResult.reauth_url : ""))
        : (pluginResult && pluginResult.success
          ? JSON.stringify(pluginResult.data || pluginResult).substring(0, 4000)
          : JSON.stringify(pluginResult).substring(0, 4000));
      await addMessage(env2, ip, auth.userId, sessionId, message, pluginText, true);
      return new Response(JSON.stringify({
        response: pluginText,
        thinking: thinkText,
        thinking_steps: steps,
        intent: "execute_plugin",
        plugin: { app: matchedPluginTool.app, tool: matchedPluginTool.tool, result: pluginResult },
        connected_tools: thinking.connected_tools,
        model: "plugin"
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  } catch (e) {
    console.error("auto plugin", e && e.message);
  }'''
t = t.replace(anchor, inject, 1)
idx = t.find('case "integration_status":')
idx2 = t.find('case "integration_connect":', idx)
if idx < 0 or idx2 < 0: sys.exit("integration cases missing")
new_status = '''case "integration_status": {
      console.log(`\\u{1F535} integration_status: User ${auth.userId}`);
      const integrations = await listIntegrations(env2, auth.userId);
      let mcp_tools = [];
      try {
        if (typeof getPluginToolsForUser === "function") {
          mcp_tools = await getPluginToolsForUser(env2, auth.userId, listIntegrations);
        }
      } catch (e) {
        console.error("integration_status tools", e && e.message);
      }
      const connected_apps = {};
      for (const tool of mcp_tools) {
        if (!connected_apps[tool.app]) connected_apps[tool.app] = [];
        connected_apps[tool.app].push({
          tool: tool.tool,
          action: tool.action,
          description: tool.description,
          scopes_ok: tool.scopes_ok,
          required_scopes: tool.required_scopes
        });
      }
      return new Response(JSON.stringify({
        success: true,
        integrations,
        mcp_tools,
        connected_apps,
        availableApps: Object.keys(connected_apps).length ? Object.keys(connected_apps) : ["figma", "telegram", "discord", "canva", "wolfram", "zapier", ...GENERIC_OAUTH_PROVIDERS]
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
    '''
t = t[:idx] + new_status + t[idx2:]
old_nc = "return { success: false, error: `${app} not connected. Please connect first.` };"
if old_nc in t:
    t = t.replace(old_nc, 'return typeof reauthPayload === "function" ? reauthPayload(app, auth.userId, CONFIG.WORKER_URL) : { success: false, error: `${app} not connected. Please connect first.` };', 1)
old = "      case \"discord\":\n        result = await discordFullControl(token, action, params);"
new = """      case \"discord\":
        if ([\"get_user\",\"list_guilds\",\"list_channels\",\"list_guild_channels\",\"get_guild\"].includes(String(action))) {
          result = await runPluginApi(\"discord\", action, token, params || {}, {});
          if (result && (result.status === 401 || result.httpStatus === 401)) {
            return reauthPayload(\"discord\", auth.userId, CONFIG.WORKER_URL);
          }
          break;
        }
        result = await discordFullControl(token, action, params);"""
if old in t:
    t = t.replace(old, new, 1)
old2 = "        result = await discordFullControl(integration.access_token, action, params);"
if old2 in t:
    t = t.replace(old2, """        if ([\"get_user\",\"list_guilds\",\"list_channels\",\"list_guild_channels\",\"get_guild\"].includes(String(action))) {
          result = await runPluginApi(\"discord\", action, integration.access_token, params || {}, {});
        } else {
          result = await discordFullControl(integration.access_token, action, params);
        }""", 1)
m = re.search(r'console\.log\(`.*?executePluginNew: Unknown app \$\{app\}`\);\s*return \{ success: false, error: `Unknown app: \$\{app\}` \};', t)
if m:
    rep = """if (typeof runPluginApi === \"function\") {
          result = await runPluginApi(String(app).toLowerCase(), action, token, params || {}, { clientId: env2.TWITCH_CLIENT_ID });
          if (result && (result.status === 401 || result.httpStatus === 401)) {
            return reauthPayload(app, auth.userId, CONFIG.WORKER_URL);
          }
          break;
        }
        console.log(`Unknown app ${app}`);
        return { success: false, error: `Unknown app: ${app}` };"""
    t = t[:m.start()] + rep + t[m.end():]
assert 'from "./oauth-plugins.js"' in t
assert "matchPluginFromMessage" in t
assert "mcp_tools" in t
assert "Bot ${token}" not in t
p.write_text(t)
print("WIRED OK", len(t))
