#!/usr/bin/env python3
"""Day-1 real reliability fixes only. No placeholders. No search-routing experiments."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    old1 = 'response: "I am " + CONFIG.APP_NAME + " created by " + CONFIG.CREATOR + ". How can I help you today?"'
    new1 = 'response: "I could not reach any language model just now (all providers failed or timed out). Please retry in a moment."'
    if old1 in t:
        t = t.replace(old1, new1, 1)
        changes.append("orchestrator-fallback")

    old2 = 'text: CONFIG.APP_NAME + " by " + CONFIG.CREATOR + " - How can I help you today?"'
    new2 = 'text: "I could not reach any language model just now. Please retry in a moment."'
    if old2 in t:
        t = t.replace(old2, new2, 1)
        changes.append("stream-fallback")

    old_qr = "const text = body.text || body.data;"
    new_qr = "const text = body.text || body.data || body.message || body.content;"
    idx = t.find("async function handleQRAction")
    if idx < 0:
        raise SystemExit("handleQRAction missing")
    end = idx + 450
    chunk = t[idx:end]
    if old_qr in chunk and "body.message || body.content" not in chunk:
        t = t[:idx] + chunk.replace(old_qr, new_qr, 1) + t[end:]
        changes.append("qr-alias")

    if "EMPTY_MESSAGE" not in t[t.find("async function handleChatAction"):t.find("async function handleChatAction") + 3500]:
        t = t.replace(
            "  if (message && /\\b(remember|yaad\\s*rakh)/i.test(message))",
            """  if (!message || !String(message).trim()) {
    return new Response(JSON.stringify({ error: "message is required", code: "EMPTY_MESSAGE" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  if (message && /\\b(remember|yaad\\s*rakh)/i.test(message))""",
            1,
        )
        # file uses real single-backslash regex in source
        t2 = Path("worker.ts").read_text()
        # re-read current after previous edits
        pass

    # Fix empty-message with exact worker regex (single backslash chars)
    marker = "  if (message && /\b(remember|yaad\s*rakh)/i.test(message))"
    if marker in t and "EMPTY_MESSAGE" not in t[t.find("async function handleChatAction"):t.find("async function handleChatAction") + 3500]:
        t = t.replace(
            marker,
            "  if (!message || !String(message).trim()) {\n"
            "    return new Response(JSON.stringify({ error: \"message is required\", code: \"EMPTY_MESSAGE\" }), { status: 400, headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });\n"
            "  }\n"
            + marker,
            1,
        )
        changes.append("empty-message-guard")

    p.write_text(t)
    print("changes:", changes)
    if not changes:
        print("already applied")
        return
    if "could not reach any language model" not in t:
        raise SystemExit("fallback text missing after patch")

if __name__ == "__main__":
    main()
