#!/usr/bin/env python3
"""Phase B Day 31: trivial message search gate + fix needsSearch fallback."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # 1) Fallback plan must NOT force web search
    old_fb = '''  return {
    plan: {
      needsSearch: true,
      complexity: "medium",
      approach: "direct",
      steps: 1,
      plan: "Process directly"
    },'''
    new_fb = '''  return {
    plan: {
      needsSearch: false,
      complexity: "simple",
      approach: "direct",
      steps: 1,
      plan: "Process directly"
    },'''
    if old_fb in t:
        t = t.replace(old_fb, new_fb, 1)
        changes.append("fallback-needsSearch-false")

    # 2) Helper isTrivialChatMessage (once)
    if "function isTrivialChatMessage" not in t and "PHASE_B_SEARCH_GATE" not in t:
        helper = '''
// PHASE_B_SEARCH_GATE — greetings / pings must not burn search quota
function isTrivialChatMessage(text) {
  const q = String(text || "").trim().toLowerCase();
  if (!q) return true;
  if (q.length <= 4) return true;
  if (/^(hi|hello|hey|hii|helo|yo|sup|thanks|thank you|thx|ok|okay|bye|ping|test|hola|namaste)[.!?\\s]*$/i.test(q)) return true;
  if (/^(what'?s up|how are you|kaise ho)[.!?\\s]*$/i.test(q)) return true;
  return false;
}
'''
        # place near multiStageReasoning
        anchor = "async function multiStageReasoning"
        if anchor not in t:
            raise SystemExit("multiStageReasoning not found")
        t = t.replace(anchor, helper + anchor, 1)
        changes.append("helper")

    # 3) At start of multiStageReasoning, short-circuit trivial
    old_msr = '''async function multiStageReasoning(query, context, options) {
  const prompt = `Analyze and create PLAN. Return ONLY JSON:
{"needsSearch":bool,"complexity":"simple/medium/complex","approach":"direct/reasoning/creative/code","steps":1-5,"plan":"brief"}

QUERY: "${query}"
CONTEXT: ${context ? context.substring(0, 300) : "New"}`;'''
    new_msr = '''async function multiStageReasoning(query, context, options) {
  if (typeof isTrivialChatMessage === "function" && isTrivialChatMessage(query)) {
    return {
      plan: {
        needsSearch: false,
        complexity: "simple",
        approach: "direct",
        steps: 1,
        plan: "Trivial/greeting — no web search"
      },
      reasoning: { method: "direct", confidence: 0.9, insights: ["trivial"] },
      search: null,
      response: null,
      model: "search-gate"
    };
  }
  const prompt = `Analyze and create PLAN. Return ONLY JSON:
{"needsSearch":bool,"complexity":"simple/medium/complex","approach":"direct/reasoning/creative/code","steps":1-5,"plan":"brief"}

QUERY: "${query}"
CONTEXT: ${context ? context.substring(0, 300) : "New"}`;'''
    if old_msr in t:
        t = t.replace(old_msr, new_msr, 1)
        changes.append("msr-gate")
    elif "Trivial/greeting" in t:
        changes.append("msr-already")
    else:
        print("WARN: multiStageReasoning prompt block not exact")

    # 4) Expand isSmallTalk regex for related questions (and consistency)
    old_st = 'const isSmallTalk = /^(hi|hello|hey|thanks|thank you|ok|okay|bye)[.!?\\s]*$/i.test(trimmedQuery);'
    # actual source may use different escape
    old_st2 = 'const isSmallTalk = /^(hi|hello|hey|thanks|thank you|ok|okay|bye)[.!?\s]*$/i.test(trimmedQuery);'
    new_st = 'const isSmallTalk = typeof isTrivialChatMessage === "function" ? isTrivialChatMessage(trimmedQuery) : /^(hi|hello|hey|thanks|thank you|ok|okay|bye|ping|test)[.!?\s]*$/i.test(trimmedQuery);'
    if old_st2 in t:
        t = t.replace(old_st2, new_st)
        changes.append("smalltalk")
    elif old_st in t:
        t = t.replace(old_st, new_st)
        changes.append("smalltalk")

    # 5) Hard gate before performWebSearch in quantumResponse
    old_search = '''  if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchFlags = await getFeatureFlags(env2, userId);'''
    new_search = '''  if (reasoning.plan && reasoning.plan.needsSearch && !(typeof isTrivialChatMessage === "function" && isTrivialChatMessage(query))) {
    const searchFlags = await getFeatureFlags(env2, userId);'''
    if old_search in t and "isTrivialChatMessage(query)" not in t[t.find("if (reasoning.plan && reasoning.plan.needsSearch"):t.find("if (reasoning.plan && reasoning.plan.needsSearch")+120]:
        t = t.replace(old_search, new_search, 1)
        changes.append("quantum-search-gate")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    assert "needsSearch: true" not in t or t.count("needsSearch: true") == 0 or "Process directly" not in t[t.find("needsSearch: true")-50:t.find("needsSearch: true")+80]
    # verify fallback fixed
    assert "needsSearch: false" in t
    assert "PHASE_B_SEARCH_GATE" in t or "isTrivialChatMessage" in t
    print("ok")

if __name__ == "__main__":
    main()
