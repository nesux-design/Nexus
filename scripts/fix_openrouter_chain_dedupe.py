#!/usr/bin/env python3
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    old = 'modelChain = [preferredModel, ...modelChain.filter((name) => name !== preferredModel), "openrouter"];'
    new = 'modelChain = [preferredModel, ...modelChain.filter((name) => name !== preferredModel && name !== "openrouter"), "openrouter"];'
    if old in t:
        t = t.replace(old, new, 1)
        p.write_text(t)
        print("deduped")
    elif new in t:
        print("already ok")
    else:
        print("needle missing")
        raise SystemExit(1)

if __name__ == "__main__":
    main()
