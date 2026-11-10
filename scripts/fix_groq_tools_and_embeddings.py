#!/usr/bin/env python3
"""Fix Groq tool_choice none / tool_use_failed + Vectorize 1536 dims."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    old_loop = """async function callGroqRaw(messages, enableWebSearch) {
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {"""
    new_loop = """async function callGroqRaw(messages, enableWebSearch) {
  const maxAttempts = 3;
  let forceTools = !!enableWebSearch;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {"""
    if "let forceTools = !!enableWebSearch" not in t and old_loop in t:
        t = t.replace(old_loop, new_loop, 1)
        changes.append("forceTools-init")

    # tools + error handling (file may store emoji as \\u274C)
    markers = [
        "if (enableWebSearch) {\n        body.tools = [{ type: \"browser_search\" }];",
        "if (enableWebSearch) {\n        body.tools = [{ type: \"browser_search\" }];",
    ]
    j = t.find('if (enableWebSearch) {\n        body.tools = [{ type: "browser_search" }]')
    if j < 0:
        j = t.find("if (enableWebSearch)")
        # find browser_search near callGroqRaw only
        gr = t.find("async function callGroqRaw")
        j = t.find('body.tools = [{ type: "browser_search" }]', gr)
        if j > 0:
            j = t.rfind("if (enableWebSearch)", gr, j)

    if j > 0 and "forceTools" in t[t.find("async function callGroqRaw"):t.find("async function callGroqRaw")+2500] and "retrying with browser_search" not in t:
        k = t.find("const data = await response.json();", j)
        if k < 0:
            raise SystemExit("no response.json after groq tools")
        new_block = '''if (forceTools) {
        body.tools = [{ type: "browser_search" }];
        body.tool_choice = "auto";
      } else {
        body.tool_choice = "none";
      }
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "User-Agent": "Nexus-AI/8.0"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const err = await response.text();
        console.error(`\\u274C Groq Error (${response.status}):`, err);
        if (response.status === 400 && /tool_use_failed|Tool choice is none|called a tool/i.test(err) && !forceTools) {
          console.log("Groq: retrying with browser_search enabled after tool_use_failed");
          forceTools = true;
          continue;
        }
        if (response.status === 429) {
          markKeyFailed("groq", key, 60);
          if (attempt < maxAttempts - 1) {
            await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
            continue;
          }
        }
        if (attempt < maxAttempts - 1) continue;
        return null;
      }
      '''
        # Keep original console.error escape style from file
        chunk = t[j:k]
        if "\\u274C" in chunk or "\u274C" in chunk:
            pass
        # Detect actual error log prefix in chunk
        if "\\u274C Groq Error" in chunk:
            new_block = new_block.replace("\\u274C", "\\u274C")
        elif "\u274C Groq Error" in chunk:
            new_block = new_block.replace("`\\u274C Groq", "`\u274C Groq")
        t = t[:j] + new_block + t[k:]
        changes.append("groq-tools-retry")

    if "outputDimensionality" not in t:
        needle = "text.substring(0, 2e3) }] } })"
        if needle in t:
            t = t.replace(needle, "text.substring(0, 2e3) }] }, outputDimensionality: 1536 })", 1)
            changes.append("embedding-1536")
        else:
            import re
            t2, n = re.subn(
                r"(text\.substring\(0,\s*2e3\)\s*\}\s*\]\s*\})(\s*\})",
                r"\1, outputDimensionality: 1536\2",
                t,
                count=1,
            )
            if n:
                t = t2
                changes.append("embedding-1536-re")

    old_ws = "webSearch: reasoning.plan?.needsSearch || false,"
    new_ws = 'webSearch: !!(reasoning.plan?.needsSearch || /\\b(news|latest|today|breaking|headline)\\b/i.test(String(query || ""))),'
    if old_ws in t:
        t = t.replace(old_ws, new_ws, 1)
        changes.append("news-websearch-force")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        # still ok if already applied
        if "retrying with browser_search" in t and "outputDimensionality" in t:
            print("already applied")
            return
        raise SystemExit("no changes")
    print("ok")

if __name__ == "__main__":
    main()
