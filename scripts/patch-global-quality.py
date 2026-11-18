#!/usr/bin/env python3
"""Global time + fair mimo prompts. No model ID changes."""
from pathlib import Path
import re, sys
path = Path("worker.ts")
content = path.read_text(encoding="utf-8")
if "PLACEHOLDER" in content[:300]:
    print("ERROR PLACEHOLDER"); sys.exit(1)
changes = 0

if "formatInZone" not in content and "istString" in content:
    pat = re.compile(r"function getCurrentDate\(\) \{.*?\n\}", re.S)
    new_fn = '''function getCurrentDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  function formatInZone(timeZone) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone, weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
      }).formatToParts(now);
      const g = (t) => (parts.find((p) => p.type === t) || {}).value || "";
      return g("weekday") + ", " + g("day") + " " + g("month") + " " + g("year") + " " + g("hour") + ":" + g("minute") + ":" + g("second") + " " + g("dayPeriod") + " (" + timeZone + ")";
    } catch (e) { return now.toISOString() + " (" + timeZone + ")"; }
  }
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return {
    year: now.getUTCFullYear(), month: pad(now.getUTCMonth() + 1), day: pad(now.getUTCDate()),
    hours: pad(now.getUTCHours()), minutes: pad(now.getUTCMinutes()),
    full: now.getUTCFullYear() + "-" + pad(now.getUTCMonth() + 1) + "-" + pad(now.getUTCDate()),
    timestamp: Date.now(), iso: now.toISOString(), unix: Math.floor(now.getTime() / 1e3),
    utcString: formatInZone("UTC"), istString: formatInZone("Asia/Kolkata"),
    zones: {
      UTC: formatInZone("UTC"), IST: formatInZone("Asia/Kolkata"),
      EST: formatInZone("America/New_York"), PST: formatInZone("America/Los_Angeles"),
      GMT: formatInZone("Europe/London"), CET: formatInZone("Europe/Paris"),
      Dubai: formatInZone("Asia/Dubai"), Singapore: formatInZone("Asia/Singapore"),
      Tokyo: formatInZone("Asia/Tokyo"), Sydney: formatInZone("Australia/Sydney")
    },
    formatInZone, dayName: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][ist.getUTCDay()]
  };
}'''
    m = pat.search(content)
    if m:
        content = content[:m.start()] + new_fn + content[m.end():]
        changes += 1
        print("1. global getCurrentDate")

old_crit = '''**CRITICAL TIME (live \u2014 never invent clock time from search):**\n- IST: ${getCurrentDate().istString}\n- UTC: ${getCurrentDate().utcString}\n- Date: ${getCurrentDate().full} | Year: ${getCurrentDate().year}\nFor "current time / abhi kitna baja" answer ONLY from the lines above. For weather "right now", prefer latest observation timestamps.`;'''
# try unicode dash variants
for old_crit in [
'''**CRITICAL TIME (live — never invent clock time from search):**
- IST: ${getCurrentDate().istString}
- UTC: ${getCurrentDate().utcString}
- Date: ${getCurrentDate().full} | Year: ${getCurrentDate().year}
For "current time / abhi kitna baja" answer ONLY from the lines above. For weather "right now", prefer latest observation timestamps.`;''',
]:
    if old_crit in content:
        new_crit = '''**CRITICAL TIME (live — never invent clock time):**
- IST (India): ${getCurrentDate().istString}
- UTC: ${getCurrentDate().utcString}
- US Eastern: ${getCurrentDate().zones.EST}
- US Pacific: ${getCurrentDate().zones.PST}
- London: ${getCurrentDate().zones.GMT}
- Dubai: ${getCurrentDate().zones.Dubai}
- Singapore: ${getCurrentDate().zones.Singapore}
- Tokyo: ${getCurrentDate().zones.Tokyo}
- Sydney: ${getCurrentDate().zones.Sydney}
- Date: ${getCurrentDate().full} | Year: ${getCurrentDate().year}
If user asks time for a listed zone/city, answer from this block. For other cities, use web search or nearest major zone. Never invent a clock time.`;'''
        content = content.replace(old_crit, new_crit, 1)
        changes += 1
        print("2. world times in prompt")
        break

old_csm = '''async function callSpecificModel(modelName, prompt, messages, enableWebSearch) {
  switch (modelName) {
    case "gemini":
      return await callGemini(prompt, enableWebSearch);
    case "groq":
      return await callGroq(messages, enableWebSearch);
    case "mimo":
      return await callOpenDeep(messages);
    case "cerebras":
      return await callCerebras(messages);
    case "sambanova":
      return await callSambaNova(messages);
    default:
      return null;
  }
}'''
new_csm = '''async function callSpecificModel(modelName, prompt, messages, enableWebSearch) {
  const baseMsgs = Array.isArray(messages) ? messages : [];
  const withSystem = (msgs) => {
    if (!prompt || typeof prompt !== "string" || prompt.length < 40) return msgs;
    if (msgs.some((m) => m && m.role === "system")) return msgs;
    return [{ role: "system", content: prompt }, ...msgs.filter((m) => m && m.role !== "system")];
  };
  switch (modelName) {
    case "gemini":
      return await callGemini(prompt, enableWebSearch);
    case "groq":
      return await callGroq(withSystem(baseMsgs), enableWebSearch);
    case "mimo":
      return await callOpenDeep(withSystem(baseMsgs));
    case "cerebras":
      return await callCerebras(withSystem(baseMsgs));
    case "sambanova":
      return await callSambaNova(withSystem(baseMsgs));
    default:
      return null;
  }
}'''
if old_csm in content:
    content = content.replace(old_csm, new_csm, 1)
    changes += 1
    print("3. fair prompts for mimo/groq")

# callOpenDeep: log + respect system
old_od = '''  const key = getNextKey("openrouter");
  if (!key)
    return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(function() {
      controller.abort();
    }, CONFIG.MODEL_TIMEOUT);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "HTTP-Referer": CONFIG.WORKER_URL,
        "X-Title": CONFIG.APP_NAME,
        "User-Agent": "Nexus-AI/8.0"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4.1-flash",
        messages: [
          { role: "system", content: getMasterPrompt() + "\\n\\nWhen the user asks for code: respond with correct, complete, well-structured code first; then a brief explanation. Prefer clarity and correctness over fluff." },
          ...messages
        ],
        temperature: 0.25,
        max_tokens: CONFIG.MAX_TOKENS_MIMO
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text)
        return text;
    }
    if (response.status === 429) {
      markKeyFailed("openrouter", key, 60);
    }
  } catch (e) {
  }
  return null;
}'''
new_od = '''  const key = getNextKey("openrouter");
  if (!key) {
    console.log("mimo/OpenRouter: no key");
    return null;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(function() {
      controller.abort();
    }, CONFIG.MODEL_TIMEOUT);
    const hasSystem = Array.isArray(messages) && messages.some((m) => m && m.role === "system");
    const finalMessages = hasSystem ? messages : [
      { role: "system", content: getMasterPrompt() + "\\n\\nWhen the user asks for code: respond with correct, complete, well-structured code first; then a brief explanation. Prefer clarity and correctness over fluff." },
      ...(messages || [])
    ];
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "HTTP-Referer": CONFIG.WORKER_URL,
        "X-Title": CONFIG.APP_NAME,
        "User-Agent": "Nexus-AI/8.0"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4.1-flash",
        messages: finalMessages,
        temperature: 0.25,
        max_tokens: CONFIG.MAX_TOKENS_MIMO
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
      console.log("mimo/OpenRouter: empty content");
    } else {
      console.log("mimo/OpenRouter failed:", response.status);
      if (response.status === 429) markKeyFailed("openrouter", key, 60);
    }
  } catch (e) {
    console.log("mimo/OpenRouter error:", e && e.message);
  }
  return null;
}'''
if old_od in content:
    content = content.replace(old_od, new_od, 1)
    changes += 1
    print("4. callOpenDeep respect system + logs")

path.write_text(content, encoding="utf-8")
print("DONE", changes, len(content))
if changes < 2:
    sys.exit(1)
