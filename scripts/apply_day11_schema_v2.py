#!/usr/bin/env python3
"""Phase A Day 11: unified API schema v2 meta on chat + core errors."""
from pathlib import Path

HELPERS = '''
function newRequestId() {
  try { return crypto.randomUUID(); } catch (_) { return "req_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10); }
}
function buildSchemaV2Meta(auth, usageToday) {
  const userId = auth && auth.userId ? auth.userId : null;
  const isPremium = !!(auth && auth.isPremium);
  const plan = (auth && auth.plan) || "free";
  const role = userId && isAdmin(userId) ? "admin" : (isPremium ? "premium" : "free");
  const meta = {
    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    role,
    plan,
    isPremium
  };
  if (usageToday) meta.usageToday = usageToday;
  return meta;
}
function apiError(code, message, status = 400, extra = {}) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    code,
    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString(),
    ...extra
  }), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "function buildSchemaV2Meta" not in t:
        anchor = "function jsonResponse(data, status = 200)"
        if anchor not in t:
            raise SystemExit("jsonResponse not found")
        t = t.replace(anchor, HELPERS + "\n" + anchor, 1)
        changes.append("helpers")

    # FEATURE_DISABLED path
    old_feat = '''    return new Response(JSON.stringify({
      error: "Feature disabled: " + flagKey,
      code: "FEATURE_DISABLED",
      flag: flagKey,
      action
    }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    new_feat = '''    return apiError("FEATURE_DISABLED", "Feature disabled: " + flagKey, 403, { flag: flagKey, action });'''
    if old_feat in t:
        t = t.replace(old_feat, new_feat, 1)
        changes.append("feature-disabled")

    # Empty message in chat
    old_empty = '''  if (!message && !image)
    return new Response(JSON.stringify({ error: "Message or image is required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    new_empty = '''  if (!message && !image)
    return apiError("EMPTY_MESSAGE", "Message or image is required", 400);'''
    if old_empty in t:
        t = t.replace(old_empty, new_empty, 1)
        changes.append("empty-message")

    # Usage limit in chat (first occurrence pattern)
    old_usage = '''  if (!usageCheck.allowed)
    return new Response(JSON.stringify({ error: usageCheck.upgradeMessage }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    new_usage = '''  if (!usageCheck.allowed)
    return apiError("USAGE_LIMIT", usageCheck.upgradeMessage || "Daily limit reached", 403, { limitType: "messages" });'''
    if old_usage in t:
        t = t.replace(old_usage, new_usage, 1)
        changes.append("usage-limit-chat")

    # Chat success main return: inject schema fields before isPremium line that already exists
    # Prefer adding schemaVersion block once on main success payload
    old_main = '''    isPremium: auth.isPremium,
    plan: auth.plan || "free",
    role: isAdmin(auth.userId) ? "admin" : (auth.isPremium ? "premium" : "free"),
    usageToday: (await getUsageSnapshot2026(env2, auth.userId)).usage,
    streamingAvailable: true
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleChatAction, "handleChatAction");'''

    new_main = '''    isPremium: auth.isPremium,
    plan: auth.plan || "free",
    role: isAdmin(auth.userId) ? "admin" : (auth.isPremium ? "premium" : "free"),
    usageToday: (await getUsageSnapshot2026(env2, auth.userId)).usage,
    streamingAvailable: true,
    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString(),
    userId: auth.userId || null
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleChatAction, "handleChatAction");'''

    if "schemaVersion: 2" not in t[t.find("async function handleChatAction"):t.find("async function handleChatAction") + 30000]:
        if old_main not in t:
            raise SystemExit("chat main return not found for schema inject")
        t = t.replace(old_main, new_main, 1)
        changes.append("chat-main-schema")

    # TTS error path in chat if present
    old_tts = '''        isPremium: auth.isPremium,
        plan: auth.plan || "free",
        role: isAdmin(auth.userId) ? "admin" : (auth.isPremium ? "premium" : "free"),
        usageToday: (await getUsageSnapshot2026(env2, auth.userId)).usage,
        ttsError: ttsResult.error || "TTS failed",
        streamingAvailable: true
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    new_tts = '''        isPremium: auth.isPremium,
        plan: auth.plan || "free",
        role: isAdmin(auth.userId) ? "admin" : (auth.isPremium ? "premium" : "free"),
        usageToday: (await getUsageSnapshot2026(env2, auth.userId)).usage,
        ttsError: ttsResult.error || "TTS failed",
        streamingAvailable: true,
        schemaVersion: 2,
        requestId: newRequestId(),
        created: (/* @__PURE__ */ new Date()).toISOString(),
        userId: auth.userId || null
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    if old_tts in t and "ttsError: ttsResult.error" in t:
        if "schemaVersion: 2" not in t[t.find("ttsError: ttsResult.error") - 200:t.find("ttsError: ttsResult.error") + 400]:
            t = t.replace(old_tts, new_tts, 1)
            changes.append("chat-tts-schema")

    # Unknown action default
    old_unk = '''      return new Response(JSON.stringify({
        error: "Unknown action",'''
    # Only replace if not already schema
    if 'code: "UNKNOWN_ACTION"' not in t:
        # broader replace of unknown action response start
        idx = t.find('error: "Unknown action"')
        if idx > 0:
            # find JSON.stringify({ before it
            start = t.rfind("return new Response(JSON.stringify({", idx - 80, idx)
            end = t.find("}), { status:", idx)
            if start > 0 and end > 0:
                # keep availableActions array - inject fields after error line
                t = t.replace(
                    'error: "Unknown action",',
                    'success: false,\n        error: "Unknown action",\n        code: "UNKNOWN_ACTION",\n        schemaVersion: 2,\n        requestId: newRequestId(),\n        created: (/* @__PURE__ */ new Date()).toISOString(),',
                    1,
                )
                changes.append("unknown-action")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"broken string line {li}")

if __name__ == "__main__":
    main()
