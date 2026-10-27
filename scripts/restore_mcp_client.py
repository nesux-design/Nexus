#!/usr/bin/env python3
from pathlib import Path
import base64
parts = []
for i in range(3):
    p = Path(f"mcp-client.b64.part{i}")
    if not p.exists():
        raise SystemExit(f"missing {p}")
    parts.append(p.read_text().strip())
data = base64.b64decode("".join(parts))
Path("mcp-client.js").write_bytes(data)
print("Wrote mcp-client.js", len(data))
