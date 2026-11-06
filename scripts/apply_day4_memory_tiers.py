#!/usr/bin/env python3
"""Day-4: free/premium/admin explicit memory tiers. Real logic only."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # Helper for memory caps
    if "function getExplicitMemoryLimit" not in t:
        helper = '''
function getExplicitMemoryLimit(userId, user) {
  if (isAdmin(userId) || userId === "akhil" || userId === "8681361916") return Infinity;
  const plan = (user && user.plan) || "free";
  if (plan === "enterprise" || plan === "pro") return 500;
  if (plan === "plus" || (user && user.isPremium)) return 100;
  return 20; // free
}
'''
        anchor = "async function checkUsageLimit2026"
        if "async function getUsageSnapshot2026" in t:
            anchor = "async function getUsageSnapshot2026"
        if anchor not in t:
            anchor = "function isAdmin"
        t = t.replace(anchor, helper + "\n" + anchor, 1)
        changes.append("memory-limit-fn")

    # Replace saveExplicitMemory body limit slice(-50) with plan-aware
    old_save = '''  async saveExplicitMemory(fact) {
    if (!this.kv || !fact) return { success: false, error: "No KV or empty fact" };
    try {
      const key = "explicit_memory:" + this.userId;
      const existing = await this.kv.get(key, { type: "json" }) || [];
      const newEntry = { id: crypto.randomUUID(), fact: String(fact).substring(0, 500), savedAt: (/* @__PURE__ */ new Date()).toISOString() };
      const updated = [...existing, newEntry].slice(-50);
      await this.kv.put(key, JSON.stringify(updated));
      return { success: true, memory: newEntry, total: updated.length };'''

    new_save = '''  async saveExplicitMemory(fact) {
    if (!this.kv || !fact) return { success: false, error: "No KV or empty fact" };
    try {
      const key = "explicit_memory:" + this.userId;
      const existing = await this.kv.get(key, { type: "json" }) || [];
      let userRow = { plan: "free", isPremium: false };
      try { userRow = await getUser(this.env, this.userId); } catch (_) {}
      const maxMem = getExplicitMemoryLimit(this.userId, userRow);
      if (maxMem !== Infinity && existing.length >= maxMem) {
        return { success: false, error: "Explicit memory limit reached for your plan", code: "MEMORY_LIMIT", limit: maxMem, used: existing.length, plan: userRow.plan || "free" };
      }
      const newEntry = { id: crypto.randomUUID(), fact: String(fact).substring(0, 500), savedAt: (/* @__PURE__ */ new Date()).toISOString() };
      const keep = maxMem === Infinity ? 5000 : maxMem;
      const updated = [...existing, newEntry].slice(-keep);
      await this.kv.put(key, JSON.stringify(updated));
      return { success: true, memory: newEntry, total: updated.length, limit: maxMem, plan: userRow.plan || "free" };'''

    if old_save in t:
        t = t.replace(old_save, new_save, 1)
        changes.append("saveExplicitMemory-tiers")
    else:
        print("WARN: saveExplicitMemory block not exact match")

    # Enrich listExplicitMemories return via action handler instead
    old_list_case = '''    case "memory_list": {
      const memSystem2 = new MemorySystem(env2, auth.userId, auth.supabase);
      const memories = await memSystem2.listExplicitMemories();
      return new Response(JSON.stringify({ success: true, memories }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }'''
    new_list_case = '''    case "memory_list": {
      if (!auth.userId || auth.userId === "anonymous") {
        return new Response(JSON.stringify({ error: "Valid X-User-ID required", code: "USER_REQUIRED" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
      const memSystem2 = new MemorySystem(env2, auth.userId, auth.supabase);
      const memories = await memSystem2.listExplicitMemories();
      let userRow2 = { plan: "free", isPremium: false };
      try { userRow2 = await getUser(env2, auth.userId); } catch (_) {}
      const memLimit = getExplicitMemoryLimit(auth.userId, userRow2);
      return new Response(JSON.stringify({ success: true, memories, total: (memories || []).length, limit: memLimit, plan: userRow2.plan || "free", role: isAdmin(auth.userId) ? "admin" : (userRow2.isPremium ? "premium" : "free") }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }'''
    if old_list_case in t:
        t = t.replace(old_list_case, new_list_case, 1)
        changes.append("memory-list-enriched")

    # USER_REQUIRED on memory_save and memory_forget
    for label, needle in [
        ("memory_save", '''    case "memory_save": {
      if (!body.fact) {'''),
        ("memory_forget", '''    case "memory_forget": {
      if (!body.memoryId) {'''),
    ]:
        guard = '''    case "%s": {
      if (!auth.userId || auth.userId === "anonymous") {
        return new Response(JSON.stringify({ error: "Valid X-User-ID required", code: "USER_REQUIRED" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
''' % label
        if needle in t and "memory_save" in label:
            if "case \"memory_save\"" in t and "USER_REQUIRED" not in t[t.find('case "memory_save"'):t.find('case "memory_save"')+250]:
                t = t.replace(
                    '''    case "memory_save": {
      if (!body.fact) {''',
                    '''    case "memory_save": {
      if (!auth.userId || auth.userId === "anonymous") {
        return new Response(JSON.stringify({ error: "Valid X-User-ID required", code: "USER_REQUIRED" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
      if (!body.fact) {''',
                    1,
                )
                changes.append("guard-memory_save")
        if "memory_forget" in label and needle in t:
            if "USER_REQUIRED" not in t[t.find('case "memory_forget"'):t.find('case "memory_forget"')+250]:
                t = t.replace(
                    '''    case "memory_forget": {
      if (!body.memoryId) {''',
                    '''    case "memory_forget": {
      if (!auth.userId || auth.userId === "anonymous") {
        return new Response(JSON.stringify({ error: "Valid X-User-ID required", code: "USER_REQUIRED" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
      if (!body.memoryId) {''',
                    1,
                )
                changes.append("guard-memory_forget")

    # availableActions: add memory_* if missing
    if '"memory_save"' not in t[t.find("availableActions"):t.find("availableActions")+1200]:
        old_aa = '"user_profile",'
        # only within availableActions array - first occurrence after availableActions
        aa = t.find("availableActions")
        chunk = t[aa:aa+1500]
        if '"memory_save"' not in chunk and '"user_profile"' in chunk:
            chunk2 = chunk.replace(
                '"user_profile",',
                '"user_profile",\n          "memory_save",\n          "memory_list",\n          "memory_forget",',
                1,
            )
            t = t[:aa] + chunk2 + t[aa+1500:]
            changes.append("availableActions-memory")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")

if __name__ == "__main__":
    main()
