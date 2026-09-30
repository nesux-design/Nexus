#!/usr/bin/env python3
from pathlib import Path
import sys
p = Path("worker.ts")
t = p.read_text()
if "pluginAction || body.tool" in t and "user-top-read" in t and "premium subscription required" in t:
    print("Already fixed")
    sys.exit(0)

old_s = (
"  spotify: {\n"
"    clientId: env.SPOTIFY_CLIENT_ID || \"ADD_YOUR_SPOTIFY_CLIENT_ID\",\n"
"    clientSecret: env.SPOTIFY_CLIENT_SECRET || \"ADD_YOUR_SPOTIFY_CLIENT_SECRET\",\n"
"    redirectUri: \"https://nexus-a1.apikeyakhilka.workers.dev/oauth/spotify/callback\",\n"
"    authUrl: \"https://accounts.spotify.com/authorize\",\n"
"    tokenUrl: \"https://accounts.spotify.com/api/token\",\n"
"    scopes: \"user-read-email user-read-private playlist-read-private playlist-modify-public\"\n"
"  }"
)
new_s = (
"  spotify: {\n"
"    clientId: env.SPOTIFY_CLIENT_ID || \"ADD_YOUR_SPOTIFY_CLIENT_ID\",\n"
"    clientSecret: env.SPOTIFY_CLIENT_SECRET || \"ADD_YOUR_SPOTIFY_CLIENT_SECRET\",\n"
"    redirectUri: \"https://nexus-a1.apikeyakhilka.workers.dev/oauth/spotify/callback\",\n"
"    authUrl: \"https://accounts.spotify.com/authorize\",\n"
"    tokenUrl: \"https://accounts.spotify.com/api/token\",\n"
"    scopes: \"user-read-email user-read-private user-read-playback-state user-top-read playlist-read-private playlist-modify-public\"\n"
"  }"
)
if old_s in t:
    t = t.replace(old_s, new_s, 1)
    print("scopes ok")
else:
    print("scopes skip")

old_a = (
"  const { app, action, params } = body;\n"
"  if (!app || !action) {\n"
"    console.log(`\\u{1F534} executePluginNew: app or action missing`);\n"
"    return { success: false, error: \"app and action are required\" };\n"
"  }\n"
"  console.log(`\\u{1F535} executePluginNew: app=${app}, action=${action}`);"
)
new_a = (
"  const app = body.app;\n"
"  let action = body.pluginAction || body.tool || body.action;\n"
"  if (action === \"execute_plugin\" || action === \"chat\") {\n"
"    action = body.pluginAction || body.tool || (body.params && (body.params.action || body.params._action)) || null;\n"
"  }\n"
"  const params = body.params || body.pluginParams || {};\n"
"  if (!app || !action) {\n"
"    console.log(`\\u{1F534} executePluginNew: app or action missing`);\n"
"    return { success: false, error: \"app and action are required (use pluginAction for tool name)\" };\n"
"  }\n"
"  console.log(`\\u{1F535} executePluginNew: app=${app}, action=${action}`);"
)
if old_a in t:
    t = t.replace(old_a, new_a, 1)
    print("action ok")
else:
    print("action skip")

old_e = (
"  console.log(`\\u2705 executePluginNew: SUCCESS - app=${app}, action=${action}`);\n"
"  return { success: true, data: result };\n"
"}\n"
"__name(executePluginNew, \"executePluginNew\");"
)
new_e = (
"  if (result && typeof result === \"object\") {\n"
"    if (result.httpStatus && result.httpStatus >= 400) {\n"
"      return { success: false, error: result.error || (\"HTTP \" + result.httpStatus), status: result.httpStatus, data: result };\n"
"    }\n"
"    if (result.status && Number(result.status) >= 400) {\n"
"      return { success: false, error: result.error || (\"HTTP \" + result.status), status: result.status, data: result };\n"
"    }\n"
"    if (result.error && !result.id && !result.items && !result.display_name && !result.email) {\n"
"      return { success: false, error: typeof result.error === \"string\" ? result.error : (result.error.message || JSON.stringify(result.error)), data: result };\n"
"    }\n"
"  }\n"
"  if (typeof result === \"string\" && /premium subscription required|not registered|invalid|expired|rate limit/i.test(result)) {\n"
"    return { success: false, error: result, data: result };\n"
"  }\n"
"  console.log(`\\u2705 executePluginNew: SUCCESS - app=${app}, action=${action}`);\n"
"  return { success: true, data: result };\n"
"}\n"
"__name(executePluginNew, \"executePluginNew\");"
)
if old_e in t:
    t = t.replace(old_e, new_e, 1)
    print("error detect ok")
else:
    print("error detect skip")

assert "user-top-read" in t
assert "pluginAction || body.tool" in t
assert "premium subscription required" in t
p.write_text(t)
print("WORKER FIXED", len(t))
