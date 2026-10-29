#!/usr/bin/env python3
"""Batch 4: private thinking by default, tool-failure honesty, audit note."""
from pathlib import Path
from datetime import datetime, timezone

def main():
    w = Path("worker.ts")
    t = w.read_text()
    changes = []

    # 1) Tool / data honesty in answer formation block
    old = """- When tools/search/MCP data was used, ground claims in that data and do not invent results.
- End substantial answers ready for follow-ups; the system may attach related questions separately."""
    new = """- When tools/search/MCP data was used, ground claims in that data and do not invent results.
- If a tool, plugin, or MCP call fails or returns empty data, say so clearly; never invent profile, file, or account details.
- Prefer "I couldn't retrieve X" over confident guesses when live data is missing.
- End substantial answers ready for follow-ups; the system may attach related questions separately."""
    if old in t and "never invent profile" not in t:
        t = t.replace(old, new, 1)
        changes.append("tool-honesty-prompt")

    # 2) Thinking privacy: only full thinking when showThinking; else short public rationale or omit
    # Replace both response.thinking emissions in JSON payloads
    old_th = "thinking: response.thinking,"
    new_th = "thinking: (body.showThinking === true ? response.thinking : (response.thinking ? String(response.thinking).split(/\\n/).slice(0, 1).join(\" \").slice(0, 160) : null)),"
    if old_th in t and "body.showThinking === true ? response.thinking" not in t:
        count = t.count(old_th)
        t = t.replace(old_th, new_th)
        changes.append(f"thinking-privacyx{count}")

    # 3) Empty message guard in handleChatAction if missing
    if "if (!message || !String(message).trim())" not in t:
        needle = "async function handleChatAction(env2, request, auth, body, params, ctx) {\n  const startTime = Date.now();\n  let message = body.message;"
        insert = """async function handleChatAction(env2, request, auth, body, params, ctx) {
  const startTime = Date.now();
  let message = body.message;"""
        # add guard later after message assignment is complex — skip if risky
        pass

    w.write_text(t)

    # 4) Audit production section
    audit = Path("docs/AI-UPGRADE-AUDIT.md")
    if audit.exists():
        a = audit.read_text()
        if "## Production rollout status" not in a:
            a = a.rstrip() + f"""

## Production rollout status ({datetime.now(timezone.utc).strftime('%Y-%m-%d')})

- Merged upgrade to `main` and Cloudflare production worker is serving structured chat metadata (`presentation`, `sources`, `relatedQuestions`).
- MCP actions listed in `availableActions`; custom MCP requires `NEXUS_INTERNAL_AUTH_SECRET`.
- Batch2: ChatGPT-class answer formation + follow-up fallback + `provider` alias.
- Batch3: OpenRouter in model preference/chain + stream completion meta.
- Batch4: tool-failure honesty in master prompt; thinking truncated unless `showThinking: true`.
- Operators should still set `ENCRYPTION_KEY` and review OAuth reconnects.
- Frontend rendering remains out of scope for this Worker repo.
"""
            audit.write_text(a)
            changes.append("audit")

    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")

if __name__ == "__main__":
    main()
