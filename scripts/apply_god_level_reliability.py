#!/usr/bin/env python3
"""Reliability + quality fixes from live sandbox testing."""
from pathlib import Path
import re

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # 1) QR accepts message like other actions
    old_qr = "const text = body.text || body.data;"
    new_qr = "const text = body.text || body.data || body.message || body.content;"
    if old_qr in t and "body.message || body.content" not in t[t.find("handleQRAction"):t.find("handleQRAction")+250]:
        # only in QR handler - replace first occurrence near handleQRAction
        idx = t.find("async function handleQRAction")
        if idx < 0:
            raise SystemExit("handleQRAction missing")
        chunk = t[idx:idx+400]
        if old_qr in chunk:
            t = t[:idx] + chunk.replace(old_qr, new_qr, 1) + t[idx+400:]
            changes.append("qr-message-alias")

    # 2) Orchestrator fallback must NOT be a greeting that ignores the user
    old_fb = '''return {
    response: "I am " + CONFIG.APP_NAME + " created by " + CONFIG.CREATOR + ". How can I help you today?",
    model: "fallback",
    success: false
  };'''
    new_fb = '''return {
    response: "I could not complete a full model response just now (providers were busy or timed out). Please retry your question in a moment — I will answer it directly.",
    model: "fallback",
    success: false
  };'''
    if old_fb in t:
        t = t.replace(old_fb, new_fb, 1)
        changes.append("fallback-no-greeting")
    else:
        # looser
        if "How can I help you today?" in t and "providers were busy" not in t:
            t = t.replace(
                'response: "I am " + CONFIG.APP_NAME + " created by " + CONFIG.CREATOR + ". How can I help you today?"',
                'response: "I could not complete a full model response just now (providers were busy or timed out). Please retry your question in a moment — I will answer it directly."',
                1,
            )
            changes.append("fallback-no-greeting-loose")

    # 3) Track liveSearchContent when search succeeds; recover answer if models fall back
    if "let liveSearchContent" not in t:
        if "let didWebSearch = false" in t:
            t = t.replace("let didWebSearch = false", "let didWebSearch = false;\n  let liveSearchContent = null", 1)
            changes.append("liveSearchContent-decl")
        elif "let webSources = [];\n  let didWebSearch = false" in t:
            t = t.replace(
                "let webSources = [];\n  let didWebSearch = false",
                "let webSources = [];\n  let didWebSearch = false;\n  let liveSearchContent = null",
                1,
            )
            changes.append("liveSearchContent-decl2")

    # Set liveSearchContent inside search success block
    if "didWebSearch = true" in t and "liveSearchContent = searchResult.content" not in t:
        t = t.replace(
            "didWebSearch = true;",
            "didWebSearch = true;\n      liveSearchContent = searchResult.content;",
            1,
        )
        changes.append("liveSearchContent-set")

    # After cleanAnswerArtifacts, recover from search if fallback/greeting
    old_clean = "let response = cleanAnswerArtifacts(aiResult.response);"
    new_clean = '''let response = cleanAnswerArtifacts(aiResult.response);
  // God-level recovery: never return a useless greeting when the user asked a real question
  const looksLikeGreeting = /how can i help you today/i.test(response || "") || /i am nexus created by/i.test(response || "");
  if ((aiResult.model === "fallback" || looksLikeGreeting || aiResult.success === false) && liveSearchContent && String(liveSearchContent).length > 80) {
    const cleanedSearch = cleanAnswerArtifacts(String(liveSearchContent).slice(0, 3500));
    response = "Here is what I found from live sources:\n\n" + cleanedSearch;
    aiResult = { ...aiResult, model: (aiResult.model === "fallback" ? "search-recovery" : aiResult.model), success: true };
  } else if ((aiResult.model === "fallback" || looksLikeGreeting) && query) {
    response = cleanAnswerArtifacts("I could not finish generating the full answer just now. Please ask again: \"" + String(query).slice(0, 200) + "\"");
  }'''
    if old_clean in t and "search-recovery" not in t:
        t = t.replace(old_clean, new_clean, 1)
        changes.append("search-recovery")

    # 4) One emergency retry inside orchestrator before giving up — gemini no-search
    old_exhaust = '''if (config.env2) {
    await logError(config.env2, config.userId || "anonymous", "ai_provider_chain_exhausted"'''
    # Insert emergency try before logError exhaust - careful
    emergency = '''// Emergency single-shot retry (no web tools) before user-visible failure
  try {
    const emergency = await callSpecificModel("gemini", prompt, messages, false);
    if (emergency) {
      return { response: emergency, model: "gemini", success: true };
    }
  } catch (e) {
    console.error("emergency gemini failed:", e && e.message);
  }
  try {
    const emergency2 = await callSpecificModel("groq", prompt, messages, false);
    if (emergency2) {
      return { response: emergency2, model: "groq", success: true };
    }
  } catch (e) {
    console.error("emergency groq failed:", e && e.message);
  }
  if (config.env2) {
    await logError(config.env2, config.userId || "anonymous", "ai_provider_chain_exhausted"'''
    if old_exhaust in t and "Emergency single-shot retry" not in t:
        t = t.replace(old_exhaust, emergency, 1)
        changes.append("emergency-retry")

    # 5) Empty chat message early return in handleChatAction
    if "Message is required" not in t[t.find("async function handleChatAction"):t.find("async function handleChatAction")+2500]:
        # insert after sessionId assignment block is complex; skip if risky
        pass

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")

if __name__ == "__main__":
    main()
