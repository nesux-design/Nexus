#!/usr/bin/env python3
"""Phase B Day 32: honest searchPerformed/sources from Groq tools + early conversationId.
Does not change model chain / search providers / Groq retry logic beyond returning sources.
"""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "PHASE_B_DAY32" in t and "normalizeModelResult" in t and "aiResult.sources" in t:
        print("already applied")
        return

    old_cg = """async function callGroq(messages, enableWebSearch) {
  const result = await callGroqRaw(messages, enableWebSearch);
  return result ? result.content : null;
}"""
    new_cg = """async function callGroq(messages, enableWebSearch) {
  const result = await callGroqRaw(messages, enableWebSearch);
  if (!result || !result.content) return null;
  // PHASE_B_DAY32 — keep sources from browser_search for envelope honesty
  return result;
}"""
    if old_cg in t:
        t = t.replace(old_cg, new_cg, 1)
        changes.append("callGroq")
    else:
        raise SystemExit("callGroq block not found")

    helper = '''
// PHASE_B_DAY32 — normalize model result (string | { content, sources })
function normalizeModelResult(result) {
  if (!result) return null;
  if (typeof result === "string") {
    return { response: result, sources: [] };
  }
  if (typeof result === "object" && result.content) {
    return { response: result.content, sources: Array.isArray(result.sources) ? result.sources : [] };
  }
  return null;
}
'''
    if "function normalizeModelResult" not in t:
        anchor = "async function quantumAIOrchestrator"
        if anchor not in t:
            raise SystemExit("orchestrator missing")
        t = t.replace(anchor, helper + anchor, 1)
        changes.append("helper")

    old_a = """        if (result) {
          return { response: result, model: modelName, success: true };
        }"""
    new_a = """        if (result) {
          const norm = typeof normalizeModelResult === "function" ? normalizeModelResult(result) : null;
          if (norm) return { response: norm.response, model: modelName, success: true, sources: norm.sources || [] };
        }"""
    if old_a in t:
        t = t.replace(old_a, new_a)
        changes.append("returns_a")

    old_b = """        console.log("\\u2705 Success with model:", modelName);
        return { response: result, model: modelName, success: true };"""
    # file may use real emoji or escaped
    for old_b_try in [
        old_b,
        old_b.replace("\\u2705", "\u2705"),
        '''        console.log("\u2705 Success with model:", modelName);
        return { response: result, model: modelName, success: true };''',
    ]:
        if old_b_try in t:
            t = t.replace(
                old_b_try,
                '''        console.log("\u2705 Success with model:", modelName);
        const norm2 = typeof normalizeModelResult === "function" ? normalizeModelResult(result) : (typeof result === "string" ? { response: result, sources: [] } : null);
        if (!norm2) continue;
        return { response: norm2.response, model: modelName, success: true, sources: norm2.sources || [] };''',
                1,
            )
            changes.append("returns_b")
            break

    marker = "const normalizedSources = normalizeWebSources(webSources);"
    inject = """if (aiResult && Array.isArray(aiResult.sources) && aiResult.sources.length) {
    didRunWebSearch = true;
    webSources = (webSources || []).concat(aiResult.sources);
  }
  const normalizedSources = normalizeWebSources(webSources);"""
    if marker in t and "aiResult.sources" not in t:
        t = t.replace(marker, inject, 1)
        changes.append("merge-sources")

    old_th = """  let conversationId = body.conversationId || null;
  let conversationMessages = [];
  let conversationTitle = body.title || null;
  try {
    if (auth.userId && auth.userId !== "anonymous") {
      const threadMem = new MemorySystem(env2, auth.userId, auth.supabase);
      if (conversationId) {"""
    new_th = """  let conversationId = body.conversationId || null;
  let conversationMessages = [];
  let conversationTitle = body.title || null;
  // PHASE_B_DAY32 — assign thread id up front so response envelope never drops it on KV/supabase lag
  if (!conversationId && auth.userId && auth.userId !== "anonymous") {
    conversationId = crypto.randomUUID();
    conversationTitle = conversationTitle || String(message || "").substring(0, 80) || "New Chat";
  }
  try {
    if (auth.userId && auth.userId !== "anonymous") {
      const threadMem = new MemorySystem(env2, auth.userId, auth.supabase);
      if (conversationId && body.conversationId) {"""
    if old_th in t:
        t = t.replace(old_th, new_th, 1)
        changes.append("early-conv-id")

    p.write_text(t)
    print("changes:", changes)
    if not changes:
        raise SystemExit("no changes")
    assert "PHASE_B_DAY32" in t
    print("ok")

if __name__ == "__main__":
    main()
