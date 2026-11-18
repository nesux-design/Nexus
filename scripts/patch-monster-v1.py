#!/usr/bin/env python3
"""Monster-level web search + specialized routing patch for Nexus worker.ts"""
from pathlib import Path
import sys

path = Path("worker.ts")
content = path.read_text(encoding="utf-8")
if "PLACEHOLDER" in content[:300]:
    print("ERROR: worker looks broken (PLACEHOLDER)")
    sys.exit(1)

changes = 0

# ========== 1. Web search order: Gemini FIRST, Groq SECOND ==========
old_search = '''async function performWebSearchUncached(query) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const datedQuery = query + " " + today;
  try {
    const groqResult = await callGroqCompound(
      [{ role: "user", content: datedQuery }],
      true
    );
    if (groqResult && groqResult.content && groqResult.content.length > 50) {
      console.log("\\u2705 Web Search: Groq Compound found results");
      return groqResult;
    }
  } catch (e) {
    console.error("Groq Compound failed:", e.message);
  }
  try {
    const geminiResult = await webSearchGeminiFlash(datedQuery);
    if (geminiResult && geminiResult.content && geminiResult.content.length > 50) {
      console.log("\\u2705 Web Search: Gemini Flash found results");
      return geminiResult;
    }
  } catch (e) {
    console.error("Gemini Flash failed:", e.message);
  }'''

old_search_real = old_search.replace("\\u2705", "\u2705")

new_search = '''async function performWebSearchUncached(query) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  // Monster search: force freshness + location hints for India-centric queries
  let datedQuery = query + " " + today + " latest";
  if (/\\b(weather|temperature|temp|baarish|mausam|aaj ka)\\b/i.test(query)) {
    datedQuery = query + " current conditions right now " + today + " latest observation";
  } else if (/\\b(news|breaking|headline|score|match|election|price|stock)\\b/i.test(query)) {
    datedQuery = query + " " + today + " latest breaking";
  }
  // 1) Gemini first (Google grounding — highest quality)
  try {
    const geminiResult = await webSearchGeminiFlash(datedQuery);
    if (geminiResult && geminiResult.content && geminiResult.content.length > 50) {
      console.log("\\u2705 Web Search: Gemini Flash found results");
      return geminiResult;
    }
  } catch (e) {
    console.error("Gemini Flash failed:", e.message);
  }
  // 2) Groq Compound second
  try {
    const groqResult = await callGroqCompound(
      [{ role: "user", content: datedQuery }],
      true
    );
    if (groqResult && groqResult.content && groqResult.content.length > 50) {
      console.log("\\u2705 Web Search: Groq Compound found results");
      return groqResult;
    }
  } catch (e) {
    console.error("Groq Compound failed:", e.message);
  }'''

new_search_real = new_search.replace("\\u2705", "\u2705")

if old_search_real in content:
    content = content.replace(old_search_real, new_search_real, 1)
    changes += 1
    print("1. Search order: Gemini first, Groq second + freshness boost")
elif old_search in content:
    content = content.replace(old_search, new_search, 1)
    changes += 1
    print("1. Search order (escaped form)")
else:
    if "const groqResult = await callGroqCompound" in content and "webSearchGeminiFlash(datedQuery)" in content:
        print("ERROR: search block found but exact match failed")
        sys.exit(1)
    else:
        print("ERROR: search block not found")
        sys.exit(1)

# ========== 2. Keyword pre-router ==========
old_trivial = '''function isTrivialChatMessage(text) {
  const q = String(text || "").trim().toLowerCase();
  if (!q) return true;
  if (q.length <= 4) return true;
  if (/^(hi|hello|hey|hii|helo|yo|sup|thanks|thank you|thx|ok|okay|bye|ping|test|hola|namaste)[.!?\\s]*$/i.test(q)) return true;
  if (/^(what'?s up|how are you|kaise ho)[.!?\\s]*$/i.test(q)) return true;
  return false;
}'''

new_router = '''function isTrivialChatMessage(text) {
  const q = String(text || "").trim().toLowerCase();
  if (!q) return true;
  if (q.length <= 4) return true;
  if (/^(hi|hello|hey|hii|helo|yo|sup|thanks|thank you|thx|ok|okay|bye|ping|test|hola|namaste)[.!?\\s]*$/i.test(q)) return true;
  if (/^(what'?s up|how are you|kaise ho)[.!?\\s]*$/i.test(q)) return true;
  return false;
}

/** Monster keyword pre-router — decides specialized chain without waiting for LLM planner */
function classifyQueryIntent(query) {
  const q = String(query || "").trim().toLowerCase();
  const out = { taskType: "general", needsSearch: false, priority: "balanced", approach: "direct", confidence: 0.5 };

  // CODE / programming
  if (/\\b(code|coding|program|function|class|debug|bug|error|stack\\s*trace|algorithm|leetcode|typescript|javascript|python|java|sql|api|endpoint|regex|refactor|implement|write a (script|function|class)|fix this code|compile|runtime)\\b/i.test(q)
      || /```/.test(query)
      || /\\b(def |const |let |var |function\\s*\\(|#include|import\\s+\\{)/.test(query)) {
    out.taskType = "code";
    out.approach = "code";
    out.priority = "quality";
    out.confidence = 0.92;
    return out;
  }

  // CREATIVE writing
  if (/\\b(story|poem|poetry|lyrics|song|novel|fiction|creative write|screenplay|dialogue|character|plot|kahani|kavita|shayari)\\b/i.test(q)) {
    out.taskType = "creative";
    out.approach = "creative";
    out.priority = "quality";
    out.confidence = 0.9;
    return out;
  }

  // LIVE / SEARCH-HEAVY
  if (/\\b(news|latest|today|aaj|breaking|headline|weather|temperature|mausam|baarish|score|match|live|price|stock|share|crypto|election|who won|result|kitna baja|current time|abhi)\\b/i.test(q)
      || /\\b(202[5-9]|2026)\\b/.test(q) && /\\b(who|what|when|where|which|kitna|kya)\\b/i.test(q)) {
    out.needsSearch = true;
    out.priority = "quality";
    out.approach = "reasoning";
    out.confidence = 0.88;
    return out;
  }

  // MATH / reasoning
  if (/\\b(calculate|solve|equation|integral|derivative|prove|math|algebra|geometry|probability|statistics|compute)\\b/i.test(q)
      || /[∫∑√π]/.test(query)
      || /\\d+\\s*[\\+\\-\\*\\/\\^]\\s*\\d+/.test(q)) {
    out.approach = "reasoning";
    out.priority = "quality";
    out.taskType = "general";
    out.confidence = 0.85;
    return out;
  }

  // Long / complex questions → quality
  if (q.length > 180 || (q.match(/\\?/g) || []).length >= 2) {
    out.priority = "quality";
    out.approach = "reasoning";
    out.confidence = 0.7;
  }

  return out;
}
'''

if old_trivial in content:
    content = content.replace(old_trivial, new_router, 1)
    changes += 1
    print("2. Added classifyQueryIntent keyword pre-router")
else:
    print("WARN: isTrivialChatMessage block not exact — skip router insert")

# ========== 3. Wire keyword router ==========
old_orch_call = '''    aiResult = await quantumAIOrchestrator(finalPrompt, messages, {
      webSearch: !!(reasoning.plan?.needsSearch || /\\b(news|latest|today|breaking|headline)\\b/i.test(String(query || ""))),
      priority: isPremium ? "quality" : "balanced",
      taskType: reasoning.plan?.approach === "code" ? "code" : reasoning.plan?.approach === "creative" ? "creative" : "general",
      env2,
      userId,
      modelPreference: config.modelPreference
    });'''

new_orch_call = '''    // Keyword pre-router wins when high confidence (restores specialized chains)
    const kw = typeof classifyQueryIntent === "function" ? classifyQueryIntent(query) : { taskType: "general", needsSearch: false, priority: "balanced", approach: "direct", confidence: 0 };
    const forceSearch = !!(reasoning.plan?.needsSearch || kw.needsSearch || /\\b(news|latest|today|breaking|headline|weather|temperature|aaj)\\b/i.test(String(query || "")));
    let resolvedTask = reasoning.plan?.approach === "code" ? "code" : reasoning.plan?.approach === "creative" ? "creative" : "general";
    let resolvedPriority = isPremium ? "quality" : "balanced";
    if (kw.confidence >= 0.85) {
      if (kw.taskType === "code" || kw.taskType === "creative") resolvedTask = kw.taskType;
      if (kw.priority === "quality") resolvedPriority = "quality";
    }
    if (isPremium) resolvedPriority = "quality";
    aiResult = await quantumAIOrchestrator(finalPrompt, messages, {
      webSearch: forceSearch,
      priority: resolvedPriority,
      taskType: resolvedTask,
      env2,
      userId,
      modelPreference: config.modelPreference
    });'''

if old_orch_call in content:
    content = content.replace(old_orch_call, new_orch_call, 1)
    changes += 1
    print("3. Wired keyword router into quantumAIOrchestrator call")
else:
    print("WARN: orchestrator call block not found exactly")

# ========== 4. Model chains ==========
old_chains = '''  if (taskType === "code" || priorityMode === "speed") {
    modelChain = ["mimo", "groq", "gemini", "cerebras", "sambanova"];
  } else if (taskType === "creative") {
    modelChain = ["mimo", "gemini", "groq", "sambanova", "cerebras"];
  } else if (priorityMode === "quality") {
    modelChain = ["gemini", "groq", "mimo", "sambanova", "cerebras"];
  } else {
    modelChain = ["gemini", "mimo", "groq", "cerebras", "sambanova"];
  }'''

new_chains = '''  // Monster specialized chains (keyword + taskType aware)
  if (taskType === "code") {
    // Code: deepseek/mimo + cerebras strong, then gemini, groq
    modelChain = ["mimo", "cerebras", "gemini", "groq", "sambanova"];
  } else if (taskType === "creative") {
    modelChain = ["gemini", "mimo", "sambanova", "groq", "cerebras"];
  } else if (priorityMode === "speed") {
    modelChain = ["groq", "mimo", "gemini", "cerebras", "sambanova"];
  } else if (priorityMode === "quality") {
    // Quality / search-heavy: Gemini first (grounding), then strong fallbacks
    modelChain = ["gemini", "mimo", "groq", "cerebras", "sambanova"];
  } else {
    modelChain = ["gemini", "mimo", "groq", "cerebras", "sambanova"];
  }'''

if old_chains in content:
    content = content.replace(old_chains, new_chains, 1)
    changes += 1
    print("4. Upgraded specialized model chains")
else:
    print("WARN: modelChain block not found")

# ========== 5. multiStageReasoning keyword first ==========
old_ms = '''async function multiStageReasoning(query, context, options) {
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

new_ms = '''async function multiStageReasoning(query, context, options) {
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
  // Keyword pre-router short-circuit (high confidence) — specialized chains actually fire
  if (typeof classifyQueryIntent === "function") {
    const kw = classifyQueryIntent(query);
    if (kw.confidence >= 0.85) {
      return {
        plan: {
          needsSearch: !!kw.needsSearch,
          complexity: kw.needsSearch || kw.taskType === "code" ? "medium" : "simple",
          approach: kw.approach || "direct",
          steps: kw.needsSearch ? 2 : 1,
          plan: "Keyword router: " + (kw.taskType || kw.approach)
        },
        reasoning: { method: kw.approach, confidence: kw.confidence, insights: ["keyword-router"] },
        search: null,
        response: null,
        model: "keyword-router"
      };
    }
  }
  const prompt = `Analyze and create PLAN. Return ONLY JSON:
{"needsSearch":bool,"complexity":"simple/medium/complex","approach":"direct/reasoning/creative/code","steps":1-5,"plan":"brief"}

QUERY: "${query}"
CONTEXT: ${context ? context.substring(0, 300) : "New"}`;'''

if old_ms in content:
    content = content.replace(old_ms, new_ms, 1)
    changes += 1
    print("5. multiStageReasoning uses keyword router first")
else:
    print("WARN: multiStageReasoning block not found")

path.write_text(content, encoding="utf-8")
print(f"DONE changes={changes} size={len(content)}")
if changes < 3:
    print("ERROR: too few changes applied")
    sys.exit(1)
