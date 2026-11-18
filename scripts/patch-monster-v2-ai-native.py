#!/usr/bin/env python3
"""v2: AI-native routing (no hard keyword force) + exact code chain mimo→gemini→groq + fix code_help Gemini-only bypass"""
from pathlib import Path
import sys

path = Path("worker.ts")
content = path.read_text(encoding="utf-8")
if "PLACEHOLDER" in content[:300]:
    print("ERROR: PLACEHOLDER worker")
    sys.exit(1)

changes = 0

# ---- 1. Code model chain: EXACTLY mimo → gemini → groq → rest ----
old_code_chain = '''  if (taskType === "code") {
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

new_code_chain = '''  // Pro chains — AI planner sets taskType; order is deliberate
  if (taskType === "code") {
    // User-specified: mimo → Gemini → groq → rest
    modelChain = ["mimo", "gemini", "groq", "cerebras", "sambanova"];
  } else if (taskType === "creative") {
    modelChain = ["gemini", "mimo", "sambanova", "groq", "cerebras"];
  } else if (priorityMode === "speed") {
    modelChain = ["groq", "mimo", "gemini", "cerebras", "sambanova"];
  } else if (priorityMode === "quality") {
    modelChain = ["gemini", "mimo", "groq", "cerebras", "sambanova"];
  } else {
    modelChain = ["gemini", "mimo", "groq", "cerebras", "sambanova"];
  }'''

if old_code_chain in content:
    content = content.replace(old_code_chain, new_code_chain, 1)
    changes += 1
    print("1. Code chain = mimo → gemini → groq → cerebras → sambanova")
else:
    old2 = '''  if (taskType === "code" || priorityMode === "speed") {
    modelChain = ["mimo", "groq", "gemini", "cerebras", "sambanova"];
  } else if (taskType === "creative") {
    modelChain = ["mimo", "gemini", "groq", "sambanova", "cerebras"];
  } else if (priorityMode === "quality") {
    modelChain = ["gemini", "groq", "mimo", "sambanova", "cerebras"];
  } else {
    modelChain = ["gemini", "mimo", "groq", "cerebras", "sambanova"];
  }'''
    if old2 in content:
        content = content.replace(old2, new_code_chain, 1)
        changes += 1
        print("1b. Code chain fixed from older layout")
    else:
        print("WARN: modelChain block not found")

# ---- 2. Remove keyword short-circuit ----
old_kw_sc = '''  // Keyword pre-router short-circuit (high confidence) — specialized chains actually fire
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

new_planner = '''  // AI-native plan (no hard keyword force) — model decides like ChatGPT/Grok
  const prompt = `You are the planning brain of a top-tier AI assistant. Analyze the user query and return ONLY valid JSON (no markdown, no commentary):
{"needsSearch":bool,"complexity":"simple|medium|complex","approach":"direct|reasoning|creative|code","steps":1-5,"plan":"one short sentence"}

Rules for approach:
- "code" = write/debug/explain/refactor code, algorithms, APIs, SQL, regex, stack traces
- "creative" = stories, poems, lyrics, fiction, roleplay, pure creative writing
- "reasoning" = math, logic, multi-step analysis, comparisons that need careful thought
- "direct" = greetings, simple facts, short answers
needsSearch=true only when fresh external facts are required (news, weather, prices, live scores, "who won", current events). Do NOT set needsSearch for pure coding or creative writing.

QUERY: "${query}"
CONTEXT: ${context ? context.substring(0, 300) : "New"}`;'''

if old_kw_sc in content:
    content = content.replace(old_kw_sc, new_planner, 1)
    changes += 1
    print("2. Removed keyword short-circuit; strengthened AI planner prompt")
else:
    print("WARN: keyword short-circuit block not found (maybe already removed)")

# ---- 3. Soften quantumResponse ----
old_orch = '''    // Keyword pre-router wins when high confidence (restores specialized chains)
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

new_orch = '''    // AI plan decides taskType (no hard keyword override). Premium → quality priority.
    const forceSearch = !!(reasoning.plan?.needsSearch || /\\b(news|latest|today|breaking|headline|weather|temperature|aaj|current)\\b/i.test(String(query || "")));
    let resolvedTask = "general";
    if (reasoning.plan?.approach === "code") resolvedTask = "code";
    else if (reasoning.plan?.approach === "creative") resolvedTask = "creative";
    const resolvedPriority = isPremium || reasoning.plan?.complexity === "complex" ? "quality" : (reasoning.plan?.complexity === "simple" ? "balanced" : "quality");
    aiResult = await quantumAIOrchestrator(finalPrompt, messages, {
      webSearch: forceSearch,
      priority: resolvedPriority,
      taskType: resolvedTask,
      env2,
      userId,
      modelPreference: config.modelPreference
    });'''

if old_orch in content:
    content = content.replace(old_orch, new_orch, 1)
    changes += 1
    print("3. quantumResponse: AI plan wins (keyword override removed)")
else:
    print("WARN: quantumResponse orchestrator block not found")

# ---- 4. Fix code_help ----
old_code_help = '''  if (thinking.action === "code_help") {
    const codeExecResult = await executeCodeViaGemini(thinking.args?.code_request || message);
    if (codeExecResult) {
      await addMessage(env2, ip, auth.userId, sessionId, message, codeExecResult, true);
      return new Response(JSON.stringify({ response: codeExecResult, intent: "code_help", model: "gemini-code-execution" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }'''

new_code_help = '''  if (thinking.action === "code_help") {
    const codeReq = thinking.args?.code_request || message;
    // Pro path: full code chain mimo → gemini → groq (not Gemini-only)
    const codePrompt = getMasterPrompt() + "\\n\\nYou are an expert software engineer. Write correct, clean, production-quality code. Include a short explanation and a minimal usage example when helpful. Prefer the language the user asked for.\\n\\nUser request:\\n" + codeReq;
    const codeChainResult = await quantumAIOrchestrator(
      codePrompt,
      [{ role: "user", content: codeReq }],
      { webSearch: false, priority: "quality", taskType: "code", env2, userId: auth.userId }
    );
    if (codeChainResult && codeChainResult.success && codeChainResult.response) {
      await addMessage(env2, ip, auth.userId, sessionId, message, codeChainResult.response, true);
      return new Response(JSON.stringify({
        response: codeChainResult.response,
        intent: "code_help",
        model: codeChainResult.model || "code-chain",
        schemaVersion: 2
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    // Fallback: Gemini with codeExecution tool (run/verify)
    const codeExecResult = await executeCodeViaGemini(codeReq);
    if (codeExecResult) {
      await addMessage(env2, ip, auth.userId, sessionId, message, codeExecResult, true);
      return new Response(JSON.stringify({ response: codeExecResult, intent: "code_help", model: "gemini-code-execution", schemaVersion: 2 }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }'''

if old_code_help in content:
    content = content.replace(old_code_help, new_code_help, 1)
    changes += 1
    print("4. code_help uses mimo→gemini→groq chain first")
else:
    print("WARN: code_help handler not found")

# ---- 5. mimo temp ----
old_mimo = '''      body: JSON.stringify({
        model: "deepseek/deepseek-v4.1-flash",
        messages: [
          { role: "system", content: getMasterPrompt() },
          // 🔥 BAS YE EK LINE ADD KARNI HAI
          ...messages
        ],
        temperature: 0.7,
        max_tokens: CONFIG.MAX_TOKENS_MIMO
      }),'''

new_mimo = '''      body: JSON.stringify({
        model: "deepseek/deepseek-v4.1-flash",
        messages: [
          { role: "system", content: getMasterPrompt() + "\\n\\nWhen the user asks for code: respond with correct, complete, well-structured code first; then a brief explanation. Prefer clarity and correctness over fluff." },
          ...messages
        ],
        temperature: 0.25,
        max_tokens: CONFIG.MAX_TOKENS_MIMO
      }),'''

if old_mimo in content:
    content = content.replace(old_mimo, new_mimo, 1)
    changes += 1
    print("5. mimo/DeepSeek tuned for code quality (temp 0.25)")
else:
    print("WARN: callOpenDeep body not exact match")

if "1) Gemini first" in content:
    print("6. Search already Gemini-first — OK")
else:
    print("WARN: search order may need check")

path.write_text(content, encoding="utf-8")
print(f"DONE changes={changes} size={len(content)}")
if changes < 3:
    print("ERROR: too few changes")
    sys.exit(1)
