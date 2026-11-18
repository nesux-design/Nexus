#!/usr/bin/env python3
"""Pending small fixes: live time, vision order, TTS race, cleanup"""
from pathlib import Path
import sys
path = Path("worker.ts")
content = path.read_text(encoding="utf-8")
if "PLACEHOLDER" in content[:300]:
    print("ERROR PLACEHOLDER"); sys.exit(1)
changes = 0

old_gcd = '''function getCurrentDate() {
  const now = /* @__PURE__ */ new Date();
  return {
    year: now.getUTCFullYear(),
    month: String(now.getUTCMonth() + 1).padStart(2, "0"),
    day: String(now.getUTCDate()).padStart(2, "0"),
    hours: String(now.getUTCHours()).padStart(2, "0"),
    minutes: String(now.getUTCMinutes()).padStart(2, "0"),
    full: now.getUTCFullYear() + "-" + String(now.getUTCMonth() + 1).padStart(2, "0") + "-" + String(now.getUTCDate()).padStart(2, "0"),
    timestamp: Date.now(),
    iso: now.toISOString(),
    unix: Math.floor(now.getTime() / 1e3)
  };
}'''

if "istString" not in content:
    if old_gcd in content:
        new_gcd = '''function getCurrentDate() {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  const pad = (n) => String(n).padStart(2, "0");
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return {
    year: now.getUTCFullYear(),
    month: pad(now.getUTCMonth() + 1),
    day: pad(now.getUTCDate()),
    hours: pad(now.getUTCHours()),
    minutes: pad(now.getUTCMinutes()),
    full: now.getUTCFullYear() + "-" + pad(now.getUTCMonth() + 1) + "-" + pad(now.getUTCDate()),
    timestamp: Date.now(),
    iso: now.toISOString(),
    unix: Math.floor(now.getTime() / 1e3),
    utcString: weekday[now.getUTCDay()] + ", " + now.getUTCDate() + " " + months[now.getUTCMonth()] + " " + now.getUTCFullYear() + " " + pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds()) + " UTC",
    istString: weekday[ist.getUTCDay()] + ", " + ist.getUTCDate() + " " + months[ist.getUTCMonth()] + " " + ist.getUTCFullYear() + " " + pad(ist.getUTCHours()) + ":" + pad(ist.getUTCMinutes()) + ":" + pad(ist.getUTCSeconds()) + " IST",
    dayName: weekday[ist.getUTCDay()]
  };
}'''
        content = content.replace(old_gcd, new_gcd, 1)
        changes += 1
        print("1a. getCurrentDate live IST/UTC")
    else:
        print("WARN: getCurrentDate block not exact")
else:
    print("1a. istString already present")

old_today = '''**Today's Date: ${TODAY}**
**Current Year: ${CURRENT_YEAR}**`;
}
__name(getMasterPrompt, "getMasterPrompt");'''

new_today = '''**CRITICAL TIME (live — never invent clock time from search):**
- IST: ${getCurrentDate().istString}
- UTC: ${getCurrentDate().utcString}
- Date: ${getCurrentDate().full} | Year: ${getCurrentDate().year}
For "current time / abhi kitna baja" answer ONLY from the lines above. For weather "right now", prefer latest observation timestamps.`;
}
__name(getMasterPrompt, "getMasterPrompt");'''

if old_today in content:
    content = content.replace(old_today, new_today, 1)
    changes += 1
    print("1b. master prompt live time")
elif "CRITICAL TIME" in content:
    print("1b. already has CRITICAL TIME")
else:
    print("WARN: master prompt TODAY block not found")

if "pureTimeRe" not in content:
    old_empty = '''  if (!message || !String(message).trim()) {
    return apiError("EMPTY_MESSAGE", "message is required", 400);
  }
  if (message && /\\b(remember|yaad\\s*rakh)/i.test(message)) {'''
    new_empty = '''  if (!message || !String(message).trim()) {
    return apiError("EMPTY_MESSAGE", "message is required", 400);
  }
  // Pure current-time — never search
  const pureTimeRe = /^(what('?s| is)? (the )?(current )?time( now)?|current time|abhi (kitna|kya) (baja|time)|time (kya|kitna) (hai|hua)|what time is it( now)?|kitna baja hai|abhi ka time)[?.!\\s]*$/i;
  if (pureTimeRe.test(String(message).trim())) {
    const d = getCurrentDate();
    const resp = "**Current time (live)**\\n\\n- **IST:** " + d.istString + "\\n- **UTC:** " + d.utcString + "\\n\\nExact at the moment of this reply.";
    return new Response(JSON.stringify({
      response: resp, intent: "general_chat", model: "nexus-clock", latency: Date.now() - startTime,
      schemaVersion: 2, searchPerformed: false, confidence: 1.0,
      requestId: (typeof newRequestId === "function" ? newRequestId() : ("clk_" + Date.now())),
      created: new Date().toISOString(), userId: auth.userId
    }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  if (message && /\\b(remember|yaad\\s*rakh)/i.test(message)) {'''
    if old_empty in content:
        content = content.replace(old_empty, new_empty, 1)
        changes += 1
        print("1c. pure time fast path")
    else:
        print("WARN: handleChat empty-message insert point not found")
else:
    print("1c. pureTimeRe already present")

old_vis = '''async function quantumVisionAnalyze(imageData, prompt) {
  const geminiResult = await analyzeImageWithGemini(imageData, prompt);
  if (geminiResult)
    return { analysis: geminiResult, provider: "Gemini 2.5 Flash", success: true };
  const gemmaResult = await analyzeImageWithGemma(imageData, prompt);
  if (gemmaResult)
    return { analysis: gemmaResult, provider: "Gemma-3 (SambaNova)", success: true };
  const openDeepResult = await analyzeImageWithOpenDeep(imageData, prompt);
  if (openDeepResult)
    return { analysis: openDeepResult, provider: "DeepSeek V4.1 Flash (OpenRouter)", success: true };
  const glmResult = await analyzeImageWithGLM(imageData, prompt);
  if (glmResult)
    return { analysis: glmResult, provider: "GLM-4V (Zhipu AI)", success: true };
  return { success: false, error: "All vision engines failed" };
}'''

new_vis = '''async function quantumVisionAnalyze(imageData, prompt) {
  // Order fixed: Gemini → Gemma → GLM → OpenRouter (4th mode)
  const geminiResult = await analyzeImageWithGemini(imageData, prompt);
  if (geminiResult)
    return { analysis: geminiResult, provider: "Gemini 2.5 Flash", success: true };
  const gemmaResult = await analyzeImageWithGemma(imageData, prompt);
  if (gemmaResult)
    return { analysis: gemmaResult, provider: "Gemma-3 (SambaNova)", success: true };
  const glmResult = await analyzeImageWithGLM(imageData, prompt);
  if (glmResult)
    return { analysis: glmResult, provider: "GLM-4V (Zhipu AI)", success: true };
  const openDeepResult = await analyzeImageWithOpenDeep(imageData, prompt);
  if (openDeepResult)
    return { analysis: openDeepResult, provider: "OpenRouter Vision", success: true };
  return { success: false, error: "All vision engines failed" };
}'''

if old_vis in content:
    content = content.replace(old_vis, new_vis, 1)
    changes += 1
    print("2. Vision order: Gemini → Gemma → GLM → OpenRouter")
else:
    print("WARN: vision block not found")

old_tts_timeout = '''      const timeout = setTimeout(() => controller.abort(), 25e3);
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {'''
new_tts_timeout = '''      const timeout = setTimeout(() => controller.abort(), 8e3);
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {'''
if old_tts_timeout in content:
    content = content.replace(old_tts_timeout, new_tts_timeout, 1)
    changes += 1
    print("3. ElevenLabs TTS timeout 25s → 8s (faster fallback)")
else:
    print("WARN: elevenlabs timeout not found")

content2 = content.replace(
    '". Today is " + TODAY + ". Provide specific details',
    '". Today is " + getCurrentDate().full + " (" + (getCurrentDate().istString || "") + "). Provide specific details',
    1
)
if content2 != content:
    content = content2
    changes += 1
    print("4. Search prompt uses live date")

content2 = content.replace(
    'PRIMARY DATA - Today: " + TODAY + "**',
    'PRIMARY DATA - Today: " + getCurrentDate().full + " | " + (getCurrentDate().istString || "") + "**',
    1
)
if content2 != content:
    content = content2
    changes += 1
    print("5. enrichedContext live date")

path.write_text(content, encoding="utf-8")
print(f"DONE changes={changes} size={len(content)}")
if changes < 2:
    print("ERROR too few"); sys.exit(1)
