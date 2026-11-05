#!/usr/bin/env python3
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "EMPTY_MESSAGE" in t:
        print("already present")
        return
    # Exact source line from worker.ts
    old = "  if (message && /\\b(remember|yaad\\s*rakh)/i.test(message)) {"
    # In the actual file on disk the string is with single backslashes
    old = "  if (message && /\b(remember|yaad\s*rakh)/i.test(message)) {"
    if old not in t:
        raise SystemExit("marker not found")
    new = (
        "  if (!message || !String(message).trim()) {\n"
        "    return new Response(JSON.stringify({ error: \"message is required\", code: \"EMPTY_MESSAGE\" }), "
        "{ status: 400, headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });\n"
        "  }\n"
        + old
    )
    t = t.replace(old, new, 1)
    p.write_text(t)
    assert "EMPTY_MESSAGE" in p.read_text()
    print("ok")

if __name__ == "__main__":
    main()
