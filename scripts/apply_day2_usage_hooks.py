#!/usr/bin/env python3
"""Day-2: free/premium/admin usage visibility + voice limit. Real hooks only."""
from pathlib import Path

SNAPSHOT_FN = r'''
async function getUsageSnapshot2026(env2, userId) {
  const types = ["messages", "images", "voice", "search", "fileAnalysis", "vision"];
  if (isAdmin(userId) || userId === "akhil" || userId === "8681361916") {
    const usage = {};
    for (const type of types) {
      usage[type] = { used: 0, limit: Infinity, remaining: Infinity };
    }
    return { plan: "enterprise", usage, date: new Date().toISOString().split("T")[0] };
  }
  const user = await getUser(env2, userId);
  const plan = user.plan || "free";
  const tier = PREMIUM_TIERS_2026[plan] || PREMIUM_TIERS_2026.free;
  const today = new Date().toISOString().split("T")[0];
  const usage = {};
  for (const type of types) {
    const limit = tier[type];
    const lim = (limit === undefined || limit === null) ? 5 : limit;
    if (lim === Infinity) {
      usage[type] = { used: 0, limit: Infinity, remaining: Infinity };
      continue;
    }
    let used = 0;
    if (env2 && env2.KV) {
      const usageKey = "usage2026:" + userId + ":" + type + ":" + today;
      const raw = await env2.KV.get(usageKey);
      used = raw ? parseInt(raw, 10) || 0 : 0;
    }
    usage[type] = { used, limit: lim, remaining: Math.max(0, lim - used) };
  }
  return { plan, usage, date: today, isPremium: !!user.isPremium };
}
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "async function getUsageSnapshot2026" not in t:
        anchor = "async function checkUsageLimit2026"
        if anchor not in t:
            raise SystemExit("checkUsageLimit2026 missing")
        t = t.replace(anchor, SNAPSHOT_FN + "\n" + anchor, 1)
        changes.append("snapshot-fn")

    # Enhance premium_status for normal + admin
    old_admin_return = '''return new Response(JSON.stringify({
      userId: auth.userId,
      isPremium: true,
      plan: "enterprise",
      premiumExpiry: null,
      limits: enterpriseTier
    }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    new_admin_return = '''const snapAdmin = await getUsageSnapshot2026(env2, auth.userId);
    return new Response(JSON.stringify({
      userId: auth.userId,
      isPremium: true,
      plan: "enterprise",
      premiumExpiry: null,
      limits: enterpriseTier,
      usageToday: snapAdmin.usage,
      usageDate: snapAdmin.date,
      role: "admin"
    }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    if old_admin_return in t and "usageToday: snapAdmin" not in t:
        t = t.replace(old_admin_return, new_admin_return, 1)
        changes.append("premium-status-admin")

    old_user_return = '''return new Response(JSON.stringify({
    userId: auth.userId,
    isPremium: user.isPremium || false,
    plan: user.plan || "free",
    premiumExpiry: user.premiumExpiry || null,
    limits: tier
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    new_user_return = '''const snap = await getUsageSnapshot2026(env2, auth.userId);
  return new Response(JSON.stringify({
    userId: auth.userId,
    isPremium: user.isPremium || false,
    plan: user.plan || "free",
    premiumExpiry: user.premiumExpiry || null,
    limits: tier,
    usageToday: snap.usage,
    usageDate: snap.date,
    role: (user.isPremium ? "premium" : "free")
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    if old_user_return in t and "usageToday: snap.usage" not in t:
        t = t.replace(old_user_return, new_user_return, 1)
        changes.append("premium-status-user")

    # Voice daily limit at start of handleVoiceChatSupreme (after audioFile check)
    if "checkUsageLimit2026(env2, userId, \"voice\")" not in t and "checkUsageLimit2026(env2, userId, 'voice')" not in t:
        old_voice = '''    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const transcript = await divineVoiceToText(audioFile, language);'''
        new_voice = '''    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const voiceLimit = await checkUsageLimit2026(env2, userId, "voice");
    if (!voiceLimit.allowed) {
      return new Response(JSON.stringify({ error: voiceLimit.upgradeMessage || "Daily voice limit reached", code: "VOICE_LIMIT", ...voiceLimit }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS }
      });
    }
    const transcript = await divineVoiceToText(audioFile, language);'''
        if old_voice in t:
            t = t.replace(old_voice, new_voice, 1)
            changes.append("voice-limit")
        else:
            print("WARN: voice block not matched")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    assert "getUsageSnapshot2026" in t

if __name__ == "__main__":
    main()
