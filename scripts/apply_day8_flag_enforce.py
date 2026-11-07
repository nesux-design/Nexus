#!/usr/bin/env python3
"""Day-8: enforce feature flags with 403 FEATURE_DISABLED."""
from pathlib import Path

HELPER = '''
function featureFlagKeyForAction(action) {
  if (!action) return null;
  if (action === "chat") return "chat";
  if (action === "voice") return "voice";
  if (action === "image_generate" || action === "real_photo" || action === "image_edit" || action === "image_enhance") return "image_generate";
  if (action.startsWith("memory_")) return "memory";
  if (action.startsWith("conversations_")) return "conversations";
  if (action === "execute_plugin" || action === "integration_connect" || action === "integration_disconnect" || action === "integration_status") return "plugins";
  if (action.startsWith("mcp_")) return "mcp";
  return null;
}
async function rejectIfFeatureDisabled(env2, userId, action) {
  const flagKey = featureFlagKeyForAction(action);
  if (!flagKey) return null;
  const flags = await getFeatureFlags(env2, userId);
  if (flags && flags[flagKey] === false) {
    return new Response(JSON.stringify({
      error: "Feature disabled: " + flagKey,
      code: "FEATURE_DISABLED",
      flag: flagKey,
      action
    }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  return null;
}
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "function featureFlagKeyForAction" not in t:
        anchor = "async function getFeatureFlags"
        if anchor not in t:
            raise SystemExit("getFeatureFlags missing")
        t = t.replace(anchor, HELPER + "\n" + anchor, 1)
        changes.append("helpers")

    old = '''async function handleAction(env2, request, auth, action, body, params, ctx) {
  if (action === "voice") {
    return await handleVoiceChatSupreme(request, env2, auth.userId, params.sessionId || generateId());
  }
  switch (action) {'''

    new = '''async function handleAction(env2, request, auth, action, body, params, ctx) {
  const featureBlock = await rejectIfFeatureDisabled(env2, auth.userId, action);
  if (featureBlock) return featureBlock;
  if (action === "voice") {
    return await handleVoiceChatSupreme(request, env2, auth.userId, params.sessionId || generateId());
  }
  switch (action) {'''

    if "rejectIfFeatureDisabled(env2, auth.userId, action)" not in t:
        if old not in t:
            raise SystemExit("handleAction entry not found")
        t = t.replace(old, new, 1)
        changes.append("handleAction-gate")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"broken string line {li}")

if __name__ == "__main__":
    main()
