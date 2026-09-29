#!/usr/bin/env python3
"""Fix OAuth userId binding + Claude-style forced plugin tools."""
from pathlib import Path
import re, sys

p = Path("worker.ts")
t = p.read_text()
if 'JSON.stringify({ provider: "discord", userId })' in t and "FORCE_PLUGIN_FALLBACK" in t:
    print("Already fixed")
    sys.exit(0)

old_discord = '''async function handleDiscordOAuth(env2) {
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, "discord", { expirationTtl: 300 });
  return redirect(generateOAuthUrl("discord", state));
}'''
new_discord = '''async function handleDiscordOAuth(env2, request) {
  const url = new URL(request.url);
  const userId = request.headers.get("X-User-ID") || url.searchParams.get("userId") || "test_user";
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, JSON.stringify({ provider: "discord", userId }), { expirationTtl: 300 });
  return redirect(generateOAuthUrl("discord", state));
}'''
if old_discord not in t:
    sys.exit("discord oauth block missing")
t = t.replace(old_discord, new_discord, 1)

m = re.search(r'async function handleFigmaOAuth\(env2\) \{[\s\S]*?return redirect\(generateOAuthUrl\("figma", state\)\);\n\}', t)
if not m:
    sys.exit("figma oauth missing")
t = t[:m.start()] + '''async function handleFigmaOAuth(env2, request) {
  const url = new URL(request.url);
  const userId = request.headers.get("X-User-ID") || url.searchParams.get("userId") || "test_user";
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, JSON.stringify({ provider: "figma", userId }), { expirationTtl: 300 });
  return redirect(generateOAuthUrl("figma", state));
}''' + t[m.end():]

old_canva = '''async function handleCanvaOAuth(env2) {
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, "canva", { expirationTtl: 300 });
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  await env2.KV.put("oauth_code_verifier:" + state, codeVerifier, { expirationTtl: 300 });
  const config = OAUTH_CONFIG.canva;
  const authUrl = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent("https://nexus-a1.apikeyakhilka.workers.dev/oauth/canva/callback")}&response_type=code&scope=${encodeURIComponent(config.scopes)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  return redirect(authUrl);
}'''
new_canva = '''async function handleCanvaOAuth(env2, request) {
  const url = new URL(request.url);
  const userId = request.headers.get("X-User-ID") || url.searchParams.get("userId") || "test_user";
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, JSON.stringify({ provider: "canva", userId }), { expirationTtl: 300 });
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  await env2.KV.put("oauth_code_verifier:" + state, codeVerifier, { expirationTtl: 300 });
  const config = OAUTH_CONFIG.canva;
  const authUrl = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent("https://nexus-a1.apikeyakhilka.workers.dev/oauth/canva/callback")}&response_type=code&scope=${encodeURIComponent(config.scopes)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  return redirect(authUrl);
}'''
if old_canva not in t:
    sys.exit("canva oauth missing")
t = t.replace(old_canva, new_canva, 1)

old_std = '''  const stored = await env2.KV.get("oauth_state:" + state);
  if (!stored || stored !== provider) {
    return jsonResponse({ error: "Invalid state" }, 400);
  }
  let tokenData;
  switch (provider) {
    case "figma":
      tokenData = await exchangeFigmaCode(code);
      break;
    case "discord":
      tokenData = await exchangeDiscordCode(code);
      break;
    case "canva":
      const codeVerifier = await env2.KV.get("oauth_code_verifier:" + state);
      tokenData = await exchangeCanvaCode(code, codeVerifier);
      break;
    default:
      return jsonResponse({ error: "Unknown provider" }, 400);
  }
  if (tokenData && tokenData.error) {
    return jsonResponse({
      error: `Token exchange failed: ${tokenData.error}`,
      details: tokenData.details
    }, 400);
  }
  if (!tokenData.access_token) {
    return jsonResponse({ error: "Failed to get token" }, 400);
  }
  const userId = request.headers.get("X-User-ID") || "test_user";
  const configData = {};
  await storeIntegration(env2, userId, provider, {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in || 3600) * 1e3,
    config: configData
  });'''

new_std = '''  const stored = await env2.KV.get("oauth_state:" + state);
  let storedProvider = provider;
  let userId = request.headers.get("X-User-ID") || "test_user";
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.provider) {
        storedProvider = parsed.provider;
        if (parsed.userId) userId = parsed.userId;
      } else if (stored !== provider) {
        return jsonResponse({ error: "Invalid state" }, 400);
      }
    } catch {
      if (stored !== provider) {
        return jsonResponse({ error: "Invalid state" }, 400);
      }
    }
  } else {
    return jsonResponse({ error: "Invalid state" }, 400);
  }
  if (storedProvider !== provider) {
    return jsonResponse({ error: "Invalid state" }, 400);
  }
  let tokenData;
  switch (provider) {
    case "figma":
      tokenData = await exchangeFigmaCode(code);
      break;
    case "discord":
      tokenData = await exchangeDiscordCode(code);
      break;
    case "canva":
      const codeVerifier = await env2.KV.get("oauth_code_verifier:" + state);
      tokenData = await exchangeCanvaCode(code, codeVerifier);
      break;
    default:
      return jsonResponse({ error: "Unknown provider" }, 400);
  }
  if (tokenData && tokenData.error) {
    return jsonResponse({
      error: `Token exchange failed: ${tokenData.error}`,
      details: tokenData.details
    }, 400);
  }
  if (!tokenData.access_token) {
    return jsonResponse({ error: "Failed to get token" }, 400);
  }
  const configData = {};
  await storeIntegration(env2, userId, provider, {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in || 3600) * 1e3,
    scope: tokenData.scope || (OAUTH_CONFIG[provider] && OAUTH_CONFIG[provider].scopes) || "",
    config: configData
  });'''
if old_std not in t:
    sys.exit("standard callback missing")
t = t.replace(old_std, new_std, 1)

old_canva_cb = '''  const stored = await env2.KV.get("oauth_state:" + state);
  if (!stored || stored !== "canva") {
    return jsonResponse({ error: "Invalid state" }, 400);
  }
  const codeVerifier = await env2.KV.get("oauth_code_verifier:" + state);
  const tokenData = await exchangeCanvaCode(code, codeVerifier);
  if (!tokenData.access_token) {
    return jsonResponse({ error: "Failed to get token" }, 400);
  }
  const userId = request.headers.get("X-User-ID") || "test_user";'''
new_canva_cb = '''  const stored = await env2.KV.get("oauth_state:" + state);
  let userId = request.headers.get("X-User-ID") || "test_user";
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.userId) userId = parsed.userId;
      if (parsed && parsed.provider && parsed.provider !== "canva") {
        return jsonResponse({ error: "Invalid state" }, 400);
      }
    } catch {
      if (stored !== "canva") return jsonResponse({ error: "Invalid state" }, 400);
    }
  } else {
    return jsonResponse({ error: "Invalid state" }, 400);
  }
  const codeVerifier = await env2.KV.get("oauth_code_verifier:" + state);
  const tokenData = await exchangeCanvaCode(code, codeVerifier);
  if (!tokenData.access_token) {
    return jsonResponse({ error: "Failed to get token" }, 400);
  }'''
if old_canva_cb not in t:
    sys.exit("canva callback missing")
t = t.replace(old_canva_cb, new_canva_cb, 1)

t = t.replace('return await handleFigmaOAuth(env2);', 'return await handleFigmaOAuth(env2, request);', 1)
t = t.replace('return await handleDiscordOAuth(env2);', 'return await handleDiscordOAuth(env2, request);', 1)
t = t.replace('return await handleCanvaOAuth(env2);', 'return await handleCanvaOAuth(env2, request);', 1)

m = re.search(r'function buildToolResolverUserText\(userMessage, context, hasLastImage, lastImageDesc\) \{[\s\S]*?\n\}', t)
if not m:
    sys.exit("buildToolResolverUserText missing")
new_brt = '''function buildToolResolverUserText(userMessage, context, hasLastImage, lastImageDesc, pluginHint) {
  const contextLine = context ? `

Recent conversation context: ${context.substring(0, 300)}` : "";
  const imageLine = hasLastImage ? `

The user recently shared an image described as: "${lastImageDesc || ""}"` : "";
  const pluginsLine = pluginHint ? `

CONNECTED USER PLUGINS (Claude/ChatGPT style — you MUST call the matching plugin_* function for live account data; never invent Discord/Spotify/Slack/etc data; never say you cannot access their account if a plugin tool exists):
${pluginHint}` : "";
  return `User message: "${userMessage}"${contextLine}${imageLine}${pluginsLine}

Rules:
1. If the user asks about their Discord/Spotify/Slack/Notion/GitHub/etc account data and a matching plugin_* tool is available, you MUST call that plugin_* function.
2. If this needs a built-in tool (image, reminder, search, etc.), call it.
3. Only skip tools for pure chitchat with no data/action need.`;
}'''
t = t[:m.start()] + new_brt + t[m.end():]

old_call = 'contents: [{ role: "user", parts: [{ text: buildToolResolverUserText(userMessage, context, hasLastImage, lastImageDesc) }] }],'
new_call = 'contents: [{ role: "user", parts: [{ text: buildToolResolverUserText(userMessage, context, hasLastImage, lastImageDesc, (pluginDecls || []).map(d => d.name + ": " + d.description).join("\\n")) }] }],'
if old_call not in t:
    sys.exit("gemini buildTool call missing")
t = t.replace(old_call, new_call, 1)

old_oai_call = 'messages: [{ role: "user", content: buildToolResolverUserText(userMessage, context, hasLastImage, lastImageDesc) }],'
new_oai_call = 'messages: [{ role: "user", content: buildToolResolverUserText(userMessage, context, hasLastImage, lastImageDesc, (pluginOpenAITools || []).map(d => (d.function && d.function.name) + ": " + (d.function && d.function.description)).join("\\n")) }],'
if old_oai_call not in t:
    sys.exit("openai buildTool call missing")
t = t.replace(old_oai_call, new_oai_call, 1)

marker = '  const thinking = await metaThinking2026(env2, message, sessionContext, !!session.lastImage, session.lastImageDesc, auth.isPremium, auth.userId);'
if marker not in t:
    sys.exit("metaThinking call site missing")
if "FORCE_PLUGIN_FALLBACK" not in t:
    inject = marker + '''
  // FORCE_PLUGIN_FALLBACK: Claude-style — if model skipped tools but user clearly needs a connected plugin, force it
  if (thinking.action === "general_chat" && thinking.connected_tools && thinking.connected_tools.length && typeof matchPluginFromMessage === "function") {
    const forced = matchPluginFromMessage(message, thinking.connected_tools);
    if (forced && forced.scopes_ok) {
      thinking.action = "execute_plugin";
      thinking.args = { app: forced.app, action: forced.action || forced.tool };
      thinking.reasoning = (thinking.reasoning || "") + " | Forced plugin: " + forced.app + "." + (forced.action || forced.tool);
      thinking.confidence = Math.max(thinking.confidence || 0, 0.92);
    }
  }
  // If user asks about an app but not connected, nudge reauth instead of fake "I cannot access"
  if (thinking.action === "general_chat" && typeof reauthPayload === "function") {
    const lower = String(message || "").toLowerCase();
    const appHints = ["discord", "spotify", "slack", "notion", "github", "twitter", "figma", "canva", "dropbox", "asana", "linear", "twitch", "linkedin"];
    const asked = appHints.find(a => lower.includes(a));
    const hasApp = (thinking.connected_tools || []).some(t => t.app === asked);
    if (asked && !hasApp) {
      const re = reauthPayload(asked, auth.userId);
      const msg = `Is app ke liye pehle connect karo: ${re.reauth_url}\\n\\nAuthorize ke baad same sawaal dubara poochho — main live data nikaalunga.`;
      await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);
      return new Response(JSON.stringify({
        response: msg,
        intent: "connect_plugin",
        reauth_url: re.reauth_url,
        app: asked,
        thinking_steps: [{ title: "Plugin not connected", detail: asked, status: "blocked" }, { title: "Ask user to authorize", detail: re.reauth_url, status: "done" }],
        model: "plugin-gate"
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }
'''
    t = t.replace(marker, inject, 1)

assert 'JSON.stringify({ provider: "discord", userId })' in t
assert "FORCE_PLUGIN_FALLBACK" in t
assert "pluginHint" in t
p.write_text(t)
print("FIXED OK", len(t))
