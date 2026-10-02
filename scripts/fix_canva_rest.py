#!/usr/bin/env python3
from pathlib import Path
import sys
p = Path("worker.ts")
t = p.read_text()
if "api.canva.com/v1/" not in t and "api.canva.com/rest/v1/designs" in t:
    print("Already fixed")
    sys.exit(0)
n = t.count("https://api.canva.com/v1/")
t = t.replace("https://api.canva.com/v1/", "https://api.canva.com/rest/v1/")
t = t.replace("https://api.canva.com/rest/rest/v1/", "https://api.canva.com/rest/v1/")
if "api.canva.com/v1/" in t:
    sys.exit("still has old path")
p.write_text(t)
print("OK replaced", n, "len", len(t))
