#!/usr/bin/env python3
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "let didRunWebSearch = false" not in t:
        if "  let webSources = [];" not in t:
            raise SystemExit("webSources not found")
        t = t.replace("  let webSources = [];", "  let webSources = [];\n  let didRunWebSearch = false;", 1)
        changes.append("init")

    if "didRunWebSearch = true" not in t:
        # Only first occurrence inside quantum search path (has performWebSearch nearby)
        marker = "    if (searchResult && searchResult.content) {"
        idx = t.find(marker)
        if idx < 0:
            raise SystemExit("searchResult marker not found")
        # ensure this is the performWebSearch path
        window = t[max(0, idx - 400):idx]
        if "performWebSearch" not in window and "searchQuota" not in window and "searchFlags" not in window:
            # try next occurrence
            idx2 = t.find(marker, idx + 1)
            if idx2 < 0:
                raise SystemExit("no suitable searchResult block")
            idx = idx2
        nl = t.find("\n", idx)
        t = t[:nl + 1] + "      didRunWebSearch = true;\n" + t[nl + 1:]
        changes.append("true-flag")

    old = "    searchPerformed: reasoning.plan?.needsSearch || false,"
    new = "    searchPerformed: didRunWebSearch,"
    if old in t:
        t = t.replace(old, new, 1)
        changes.append("field")
    elif "searchPerformed: didRunWebSearch," in t:
        pass
    else:
        raise SystemExit("searchPerformed assignment missing")

    p.write_text(t)
    print("changes:", changes or ["already"])
    if not changes and "searchPerformed: didRunWebSearch," not in t:
        raise SystemExit("failed")

if __name__ == "__main__":
    main()
