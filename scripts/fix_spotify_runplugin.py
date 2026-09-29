#!/usr/bin/env python3
from pathlib import Path
import sys
p = Path("worker.ts")
t = p.read_text()
if "known plugin APIs first" in t:
    print("Already fixed")
    sys.exit(0)

old1 = '''      default:
        if (GENERIC_OAUTH_PROVIDERS.includes(app)) {
          if (!params?.endpoint) {
            return { success: false, error: `Provide params.endpoint (full API URL) for ${app}. NEXUS should know this API's shape.` };
          }
          result = await genericAuthenticatedApiCall(token, params.method || "GET", params.endpoint, params.body, params.headers);
          break;
        }
        if (typeof runPluginApi === "function") {
          result = await runPluginApi(String(app).toLowerCase(), action, token, params || {}, { clientId: env2.TWITCH_CLIENT_ID });
          if (result && (result.status === 401 || result.httpStatus === 401)) {
            return reauthPayload(app, auth.userId, CONFIG.WORKER_URL);
          }
          break;
        }
        console.log(`Unknown app ${app}`);
        return { success: false, error: `Unknown app: ${app}` };'''

new1 = '''      default:
        // Claude-style: known plugin APIs first (spotify/slack/notion/...), raw endpoint only as fallback
        if (typeof runPluginApi === "function") {
          const pluginResult = await runPluginApi(String(app).toLowerCase(), action, token, params || {}, { clientId: env2.TWITCH_CLIENT_ID });
          const unsupported = pluginResult && typeof pluginResult.error === "string" && String(pluginResult.error).startsWith("Unsupported");
          if (!unsupported) {
            if (pluginResult && (pluginResult.status === 401 || pluginResult.httpStatus === 401)) {
              return reauthPayload(app, auth.userId, CONFIG.WORKER_URL);
            }
            result = pluginResult;
            break;
          }
        }
        if (GENERIC_OAUTH_PROVIDERS.includes(app)) {
          if (!params?.endpoint) {
            return { success: false, error: `No built-in API for ${app}.${action}. Provide params.endpoint or add it to oauth-plugins runPluginApi.` };
          }
          result = await genericAuthenticatedApiCall(token, params.method || "GET", params.endpoint, params.body, params.headers);
          break;
        }
        console.log(`Unknown app ${app}`);
        return { success: false, error: `Unknown app: ${app}` };'''

if old1 not in t:
    sys.exit("executePluginNew block missing")
t = t.replace(old1, new1, 1)

old2 = '''      default:
        if (GENERIC_OAUTH_PROVIDERS.includes(app) || ["google", "gmail", "github"].includes(app)) {
          if (!params || !params.endpoint) {
            return { error: `To use ${app}, provide 'endpoint' (full API URL) and optionally 'method' (GET/POST/etc), 'body', and 'headers' in params.` };
          }
          const apiResult = await genericAuthenticatedApiCall(
            integration.access_token,
            params.method || "GET",
            params.endpoint,
            params.body,
            params.headers
          );
          if (apiResult.success === false) {
            return { error: apiResult.error || `${app} API call failed`, status: apiResult.status };
          }
          result = apiResult.data;
          break;
        }
        return { error: "Unknown app" };'''

new2 = '''      default:
        if (typeof runPluginApi === "function") {
          const pluginResult = await runPluginApi(String(app).toLowerCase(), action, integration.access_token, params || {}, {});
          const unsupported = pluginResult && typeof pluginResult.error === "string" && String(pluginResult.error).startsWith("Unsupported");
          if (!unsupported) {
            if (pluginResult && (pluginResult.status === 401 || pluginResult.httpStatus === 401)) {
              return { error: "reauth_required", app };
            }
            result = pluginResult;
            break;
          }
        }
        if (GENERIC_OAUTH_PROVIDERS.includes(app) || ["google", "gmail", "github"].includes(app)) {
          if (!params || !params.endpoint) {
            return { error: `No built-in API for ${app}.${action}. Provide endpoint or extend runPluginApi.` };
          }
          const apiResult = await genericAuthenticatedApiCall(
            integration.access_token,
            params.method || "GET",
            params.endpoint,
            params.body,
            params.headers
          );
          if (apiResult.success === false) {
            return { error: apiResult.error || `${app} API call failed`, status: apiResult.status };
          }
          result = apiResult.data;
          break;
        }
        return { error: "Unknown app" };'''

if old2 in t:
    t = t.replace(old2, new2, 1)

assert "known plugin APIs first" in t
p.write_text(t)
print("OK", len(t))
