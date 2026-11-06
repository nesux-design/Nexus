#!/usr/bin/env python3
"""Day-5: conversation count limits by plan. Real enforcement on save + list metadata."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "function getConversationLimit" not in t:
        helper = '''
function getConversationLimit(userId, user) {
  if (isAdmin(userId) || userId === "akhil" || userId === "8681361916") return Infinity;
  const plan = (user && user.plan) || "free";
  if (plan === "enterprise" || plan === "pro") return 200;
  if (plan === "plus" || (user && user.isPremium)) return 50;
  return 10; // free
}
function getMessagesPerConversationLimit(userId, user) {
  if (isAdmin(userId) || userId === "akhil" || userId === "8681361916") return Infinity;
  const plan = (user && user.plan) || "free";
  if (plan === "enterprise" || plan === "pro") return 500;
  if (plan === "plus" || (user && user.isPremium)) return 200;
  return 40; // free
}
'''
        anchor = "function getExplicitMemoryLimit"
        if anchor not in t:
            anchor = "async function getUsageSnapshot2026"
        if anchor not in t:
            raise SystemExit("no anchor for conversation limit helpers")
        t = t.replace(anchor, helper + "\n" + anchor, 1)
        changes.append("conv-limit-fns")

    # List: metadata
    old_list = '''  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const conversations = await memorySystem.getChatFromSupabase();
  return new Response(JSON.stringify({ success: true, conversations: Array.isArray(conversations) ? conversations : [], total: Array.isArray(conversations) ? conversations.length : 0 }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}'''
    new_list = '''  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const conversations = await memorySystem.getChatFromSupabase();
  const list = Array.isArray(conversations) ? conversations : [];
  let userRow = { plan: "free", isPremium: false };
  try { userRow = await getUser(env2, auth.userId); } catch (_) {}
  const convLimit = getConversationLimit(auth.userId, userRow);
  return new Response(JSON.stringify({
    success: true,
    conversations: list,
    total: list.length,
    limit: convLimit,
    plan: userRow.plan || "free",
    role: isAdmin(auth.userId) ? "admin" : (userRow.isPremium ? "premium" : "free")
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}'''
    if old_list in t:
        t = t.replace(old_list, new_list, 1)
        changes.append("list-meta")
    else:
        # looser match
        old_list2 = '''  return new Response(JSON.stringify({ success: true, conversations: Array.isArray(conversations) ? conversations : [], total: Array.isArray(conversations) ? conversations.length : 0 }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''
        if old_list2 in t and "getConversationLimit(auth.userId" not in t:
            t = t.replace(old_list2, '''  const list = Array.isArray(conversations) ? conversations : [];
  let userRow = { plan: "free", isPremium: false };
  try { userRow = await getUser(env2, auth.userId); } catch (_) {}
  const convLimit = getConversationLimit(auth.userId, userRow);
  return new Response(JSON.stringify({
    success: true,
    conversations: list,
    total: list.length,
    limit: convLimit,
    plan: userRow.plan || "free",
    role: isAdmin(auth.userId) ? "admin" : (userRow.isPremium ? "premium" : "free")
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });''', 1)
            changes.append("list-meta-loose")

    # Save: enforce new-conversation cap + message cap
    old_save_tail = '''  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const savedId = await memorySystem.saveChatToSupabase(conversationId, messages, title);
  return new Response(JSON.stringify({ success: true, conversationId: savedId, title: title || void 0 }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}'''
    new_save_tail = '''  let userRowSave = { plan: "free", isPremium: false };
  try { userRowSave = await getUser(env2, auth.userId); } catch (_) {}
  const convLimit = getConversationLimit(auth.userId, userRowSave);
  const msgLimit = getMessagesPerConversationLimit(auth.userId, userRowSave);
  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  if (!conversationId) {
    const existing = await memorySystem.getChatFromSupabase();
    const count = Array.isArray(existing) ? existing.length : 0;
    if (convLimit !== Infinity && count >= convLimit) {
      return new Response(JSON.stringify({
        success: false,
        error: "Conversation limit reached for your plan",
        code: "CONVERSATION_LIMIT",
        limit: convLimit,
        used: count,
        plan: userRowSave.plan || "free"
      }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }
  const trimmedMessages = (msgLimit === Infinity) ? messages : messages.slice(-msgLimit);
  const savedId = await memorySystem.saveChatToSupabase(conversationId, trimmedMessages, title);
  return new Response(JSON.stringify({
    success: true,
    conversationId: savedId,
    title: title || void 0,
    messageCount: trimmedMessages.length,
    messageLimit: msgLimit,
    conversationLimit: convLimit,
    plan: userRowSave.plan || "free"
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}'''
    if old_save_tail in t:
        t = t.replace(old_save_tail, new_save_tail, 1)
        changes.append("save-limits")
    else:
        print("WARN: save tail not matched")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    assert "getConversationLimit" in t

if __name__ == "__main__":
    main()
