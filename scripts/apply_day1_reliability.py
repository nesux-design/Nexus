#!/usr/bin/env python3
"""Day-1 real reliability fixes only. No placeholders. No search-routing experiments."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # 1) Orchestrator fallback: never ignore the user with a greeting
    old1 = 'response: "I am " + CONFIG.APP_NAME + " created by " + CONFIG.CREATOR + ". How can I help you today?"'
    new1 = 'response: "I could not reach any language model just now (all providers failed or timed out). Please retry in a moment."'
    if old1 in t:
        t = t.replace(old1, new1, 1)
        changes.append("orchestrator-fallback")

    # 2) Stream generator fallback greeting
    old2 = 'text: CONFIG.APP_NAME + " by " + CONFIG.CREATOR + " - How can I help you today?"'
    new2 = 'text: "I could not reach any language model just now. Please retry in a moment."'
    if old2 in t:
        t = t.replace(old2, new2, 1)
        changes.append("stream-fallback")

    # 3) QR: accept message/content aliases (real bug from live test)
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

    # 4) Empty chat message -> 400 (after multipart parse)
    needle = """  if (message && /\\b(remember|yaad\\s*rakh)/i.test(message)) {"""
    # actual file has single backslashes in regex
    needle = "  if (message && /\\b(remember|yaad\\s*rakh)/i.test(message)) {"
    # Read exact from file
    marker = "if (message && /\b(remember|yaad\s*rakh)/i.test(message))"
    if marker in t and "error\": \"message is required\"" not in t[t.find("async function handleChatAction"):t.find("async function handleChatAction")+3500]:
        insert = """  if (!message || !String(message).trim()) {
    return new Response(JSON.stringify({ error: "message is required", code: "EMPTY_MESSAGE" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  if (message && /\b(remember|yaad\s*rakh)/i.test(message))"""
        # replace only the if (message && remember line start - keep body
        t = t.replace(
            "  if (message && /\b(remember|yaad\s*rakh)/i.test(message))",
            """  if (!message || !String(message).trim()) {
    return new Response(JSON.stringify({ error: "message is required", code: "EMPTY_MESSAGE" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  if (message && /\b(remember|yaad\s*rakh)/i.test(message))""",
            1,
        )
        changes.append("empty-message-guard")

    p.write_text(t)
    print("changes:", changes)
    if not changes:
        raise SystemExit("no changes applied")
    # verify critical
    assert "How can I help you today?" not in t or t.count("How can I help you today?") < 2
    assert "all providers failed" in t or "could not reach any language model" in t

if __name__ == "__main__":
    main()
