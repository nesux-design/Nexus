#!/usr/bin/env python3
from pathlib import Path
import sys
p = Path("worker.ts")
t = p.read_text()
if 'get_me", "me", "get_user"' in t and "runPluginApi(\"figma\"" in t:
    print("Already fixed")
    sys.exit(0)

old = '''      case "figma": {
        let fileId = params?.fileId;
        if (!fileId && integration?.config?.cachedFileId) {
          fileId = integration.config.cachedFileId;
        }
        if (!fileId) {
          return { success: false, error: "No Figma file connected yet. Share a Figma file URL or ID once and NEXUS will remember it." };
        }
        result = await figmaFullControl(token, fileId, action, params);
        if (params?.fileId && params.fileId !== integration?.config?.cachedFileId) {
          await storeIntegration(env2, auth.userId, "figma", {
            access_token: token,
            refresh_token: integration.refresh_token,
            expires_at: integration.expires_at,
            config: { ...integration.config || {}, cachedFileId: params.fileId }
          });
        }
        break;
      }'''

new = '''      case "figma": {
        // Profile / me never needs a file ID (Claude-style)
        if (["get_me", "me", "get_user"].includes(String(action))) {
          result = await runPluginApi("figma", "get_me", token, params || {}, {});
          if (result && (result.status === 401 || result.httpStatus === 401)) {
            return reauthPayload("figma", auth.userId, CONFIG.WORKER_URL);
          }
          break;
        }
        let fileId = params?.fileId;
        if (!fileId && integration?.config?.cachedFileId) {
          fileId = integration.config.cachedFileId;
        }
        if (!fileId) {
          return { success: false, error: "No Figma file connected yet. Share a Figma file URL or ID once and NEXUS will remember it." };
        }
        result = await figmaFullControl(token, fileId, action, params);
        if (params?.fileId && params.fileId !== integration?.config?.cachedFileId) {
          await storeIntegration(env2, auth.userId, "figma", {
            access_token: token,
            refresh_token: integration.refresh_token,
            expires_at: integration.expires_at,
            config: { ...integration.config || {}, cachedFileId: params.fileId }
          });
        }
        break;
      }'''

if old not in t:
    sys.exit("figma block missing")
t = t.replace(old, new, 1)

old2 = '''      case "figma":
        result = await figmaFullControl(integration.access_token, params.fileId, action, params);
        break;'''
new2 = '''      case "figma":
        if (["get_me", "me", "get_user"].includes(String(action))) {
          result = await runPluginApi("figma", "get_me", integration.access_token, params || {}, {});
        } else {
          result = await figmaFullControl(integration.access_token, params?.fileId, action, params);
        }
        break;'''
if old2 in t:
    t = t.replace(old2, new2, 1)

old_h = '  const headers = { "X-Figma-Token": token };'
new_h = '  const headers = { "Authorization": `Bearer ${token}`, "X-Figma-Token": token };'
if old_h in t:
    t = t.replace(old_h, new_h, 1)

assert 'get_me", "me", "get_user"' in t
p.write_text(t)
print("OK", len(t))
