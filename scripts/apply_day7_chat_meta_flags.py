#!/usr/bin/env python3
from pathlib import Path

FLAGS_FN = '''
async function getFeatureFlags(env2, userId) {
  const defaults = {
    chat: true,
    image_generate: true,
    voice: true,
    web_search: true,
    plugins: true,
    mcp: true,
    memory: true,
    conversations: true
  };
  let globalFlags = {};
  let userFlags = {};
  try {
    if (env2 && env2.KV) {
      globalFlags = await env2.KV.get("feature_flags:global", { type: "json" }) || {};
      if (userId) userFlags = await env2.KV.get("feature_flags:user:" + userId, { type: "json" }) || {};
    }
  } catch (_) {}
  return { ...defaults, ...globalFlags, ...userFlags };
}
async function setFeatureFlag(env2, scope, key, value) {
  if (!env2 || !env2.KV) return { success: false, error: "KV unavailable" };
  const allowed = ["chat", "image_generate", "voice", "web_search", "plugins", "mcp", "memory", "conversations"];
  if (!allowed.includes(key)) return { success: false, error: "Invalid flag key", allowed };
  const kvKey = scope === "global" ? "feature_flags:global" : "feature_flags:user:" + scope;
  const current = await env2.KV.get(kvKey, { type: "json" }) || {};
  current[key] = !!value;
  await env2.KV.put(kvKey, JSON.stringify(current));
  return { success: true, scope, key, value: !!value, flags: current };
}
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "async function getFeatureFlags" not in t:
        for anchor in ["function getConversationLimit", "function getExplicitMemoryLimit", "async function getUsageSnapshot2026"]:
            if anchor in t:
                t = t.replace(anchor, FLAGS_FN + "\n" + anchor, 1)
                changes.append("flags-fns:" + anchor)
                break
        else:
            raise SystemExit("no anchor for flags")

    # Main chat success meta
    needle = "    plan: auth.plan || \"free\",\n    streamingAvailable: true\n  }), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });\n}\n__name(handleChatAction"
    if "usageToday: (await getUsageSnapshot2026(env2, auth.userId)).usage" not in t:
        old = """    isPremium: auth.isPremium,
    plan: auth.plan || "free",
    streamingAvailable: true
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleChatAction, "handleChatAction");"""
        new = """    isPremium: auth.isPremium,
    plan: auth.plan || "free",
    role: isAdmin(auth.userId) ? "admin" : (auth.isPremium ? "premium" : "free"),
    usageToday: (await getUsageSnapshot2026(env2, auth.userId)).usage,
    streamingAvailable: true
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleChatAction, "handleChatAction");"""
        if old not in t:
            raise SystemExit("chat main return not found")
        t = t.replace(old, new, 1)
        changes.append("chat-main-meta")

    old_tts = """        isPremium: auth.isPremium,
        plan: auth.plan || "free",
        ttsError: ttsResult.error || "TTS failed",
        streamingAvailable: true
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });"""
    new_tts = """        isPremium: auth.isPremium,
        plan: auth.plan || "free",
        role: isAdmin(auth.userId) ? "admin" : (auth.isPremium ? "premium" : "free"),
        usageToday: (await getUsageSnapshot2026(env2, auth.userId)).usage,
        ttsError: ttsResult.error || "TTS failed",
        streamingAvailable: true
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });"""
    if old_tts in t and "ttsError: ttsResult.error" in t:
        # only once if not already enriched near ttsError
        if "ttsError: ttsResult.error || \"TTS failed\",\n        streamingAvailable" in t or old_tts in t:
            if "usageToday: (await getUsageSnapshot2026(env2, auth.userId)).usage,\n        ttsError" not in t:
                t = t.replace(old_tts, new_tts, 1)
                changes.append("chat-tts-meta")

    if 'case "feature_flags"' not in t:
        marker = '    case "health":\n      return await handleHealthAction();'
        insert = '''    case "feature_flags": {
      if (!auth.userId || auth.userId === "anonymous") {
        return new Response(JSON.stringify({ error: "Valid X-User-ID required", code: "USER_REQUIRED" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
      const flags = await getFeatureFlags(env2, auth.userId);
      return new Response(JSON.stringify({
        success: true,
        flags,
        role: isAdmin(auth.userId) ? "admin" : (auth.isPremium ? "premium" : "free"),
        userId: auth.userId
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    case "admin_set_feature_flag": {
      if (!isAdmin(auth.userId) && auth.userId !== "akhil" && auth.userId !== "8681361916") {
        return new Response(JSON.stringify({ error: "Admin only", code: "ADMIN_REQUIRED" }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
      const flagKey = body.key || body.flag;
      const flagValue = body.value;
      const scope = body.userId || body.scope || "global";
      if (!flagKey || typeof flagValue === "undefined") {
        return new Response(JSON.stringify({ error: "key and value required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
      const setResult = await setFeatureFlag(env2, scope, flagKey, flagValue);
      return new Response(JSON.stringify(setResult), { status: setResult.success ? 200 : 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
''' + marker
        if marker not in t:
            raise SystemExit("health marker missing")
        t = t.replace(marker, insert, 1)
        changes.append("flag-actions")

    if '"feature_flags"' not in t[t.find("availableActions"):t.find("availableActions") + 2500]:
        aa = t.find("availableActions")
        chunk = t[aa:aa + 2500]
        if '"health"' not in chunk:
            raise SystemExit("health not in availableActions")
        chunk2 = chunk.replace('"health",', '"health",\n          "feature_flags",\n          "admin_set_feature_flag",', 1)
        t = t[:aa] + chunk2 + t[aa + 2500:]
        changes.append("availableActions-flags")

    p.write_text(t)
    print("changes:", changes)
    if not changes:
        raise SystemExit("no changes")
    if 'enrichedContext = "' in t:
        for li, line in enumerate(t.splitlines(), 1):
            if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
                raise SystemExit(f"broken string line {li}")

if __name__ == "__main__":
    main()
