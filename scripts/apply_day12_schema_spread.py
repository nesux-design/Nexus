#!/usr/bin/env python3
"""Day 12: schema v2 on empty message + conversations/memory/premium_status."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # 1) Early empty message guard
    old_empty = '''  if (!message || !String(message).trim()) {
    return new Response(JSON.stringify({ error: "message is required", code: "EMPTY_MESSAGE" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }'''
    new_empty = '''  if (!message || !String(message).trim()) {
    return apiError("EMPTY_MESSAGE", "message is required", 400);
  }'''
    if old_empty in t:
        t = t.replace(old_empty, new_empty, 1)
        changes.append("empty-apiError")

    # 2) conversations_list success
    old_list = '''  return new Response(JSON.stringify({
    success: true,
    conversations: list,
    total: list.length,
    limit: convLimit,
    plan: userRow.plan || "free",
    role: isAdmin(auth.userId) ? "admin" : (userRow.isPremium ? "premium" : "free")
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    new_list = '''  return new Response(JSON.stringify({
    success: true,
    conversations: list,
    total: list.length,
    limit: convLimit,
    plan: userRow.plan || "free",
    role: isAdmin(auth.userId) ? "admin" : (userRow.isPremium ? "premium" : "free"),
    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString(),
    userId: auth.userId || null
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    if old_list in t and "conversations: list" in t:
        # only if this block doesn't already have schemaVersion near conversations list
        if "conversations: list,\n    total: list.length,\n    limit: convLimit" in t:
            idx = t.find("conversations: list")
            window = t[idx:idx+400]
            if "schemaVersion: 2" not in window:
                t = t.replace(old_list, new_list, 1)
                changes.append("conversations-list")

    # 3) memory_list success
    old_mem = '''      return new Response(JSON.stringify({ success: true, memories, total: (memories || []).length, limit: memLimit, plan: userRow2.plan || "free", role: isAdmin(auth.userId) ? "admin" : (userRow2.isPremium ? "premium" : "free") }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });'''
    new_mem = '''      return new Response(JSON.stringify({ success: true, memories, total: (memories || []).length, limit: memLimit, plan: userRow2.plan || "free", role: isAdmin(auth.userId) ? "admin" : (userRow2.isPremium ? "premium" : "free"), schemaVersion: 2, requestId: newRequestId(), created: (/* @__PURE__ */ new Date()).toISOString(), userId: auth.userId || null }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });'''
    if old_mem in t:
        t = t.replace(old_mem, new_mem, 1)
        changes.append("memory-list")
    else:
        # try flexible single-line-ish
        marker = "limit: memLimit, plan: userRow2.plan || \"free\", role: isAdmin(auth.userId)"
        if "schemaVersion: 2, requestId: newRequestId()" not in t[t.find("case \"memory_list\""):t.find("case \"memory_list\"")+900]:
            old2 = "limit: memLimit, plan: userRow2.plan || \"free\", role: isAdmin(auth.userId) ? \"admin\" : (userRow2.isPremium ? \"premium\" : \"free\")"
            new2 = "limit: memLimit, plan: userRow2.plan || \"free\", role: isAdmin(auth.userId) ? \"admin\" : (userRow2.isPremium ? \"premium\" : \"free\"), schemaVersion: 2, requestId: newRequestId(), created: (/* @__PURE__ */ new Date()).toISOString(), userId: auth.userId || null"
            if old2 in t:
                t = t.replace(old2, new2, 1)
                changes.append("memory-list-flex")

    # 4) premium_status admin + user returns
    old_admin = '''    return new Response(JSON.stringify({
      userId: auth.userId,
      isPremium: true,
      plan: "enterprise",
      premiumExpiry: null,
      limits: enterpriseTier,
      usageToday: snapAdmin.usage,
      usageDate: snapAdmin.date,
      role: "admin"
    }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    new_admin = '''    return new Response(JSON.stringify({
      userId: auth.userId,
      isPremium: true,
      plan: "enterprise",
      premiumExpiry: null,
      limits: enterpriseTier,
      usageToday: snapAdmin.usage,
      usageDate: snapAdmin.date,
      role: "admin",
      schemaVersion: 2,
      requestId: newRequestId(),
      created: (/* @__PURE__ */ new Date()).toISOString()
    }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
    if old_admin in t:
        t = t.replace(old_admin, new_admin, 1)
        changes.append("premium-admin")

    old_user = '''    usageToday: snap.usage,
    usageDate: snap.date,
    role: (user.isPremium ? "premium" : "free")
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handlePremiumStatusAction'''
    new_user = '''    usageToday: snap.usage,
    usageDate: snap.date,
    role: (user.isPremium ? "premium" : "free"),
    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString()
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handlePremiumStatusAction'''
    if old_user in t:
        t = t.replace(old_user, new_user, 1)
        changes.append("premium-user")

    # 5) USER_REQUIRED on conversations_list -> apiError (first pattern only if exact)
    old_ur = '''  if (!auth.userId || auth.userId === "anonymous") {
    return new Response(JSON.stringify({ error: "Valid X-User-ID required", code: "USER_REQUIRED" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }

  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);'''
    new_ur = '''  if (!auth.userId || auth.userId === "anonymous") {
    return apiError("USER_REQUIRED", "Valid X-User-ID required", 401);
  }

  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);'''
    if old_ur in t:
        t = t.replace(old_ur, new_ur, 1)
        changes.append("user-required-conv")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"broken string {li}")

if __name__ == "__main__":
    main()
