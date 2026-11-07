#!/usr/bin/env python3
"""Day-10: searchPerformed reflects actual search execution, not needsSearch plan."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "let didRunWebSearch = false" not in t:
        old = "  let webSources = [];"
        new = "  let webSources = [];\n  let didRunWebSearch = false;"
        if old not in t:
            raise SystemExit("webSources init not found")
        t = t.replace(old, new, 1)
        changes.append("didRun-init")

    # Mark true only when search content applied
    old_hit = """    if (searchResult && searchResult.content) {
      enrichedContext = "\n\n**\u{1F310} LIVE SEARCH (Source: " + searchResult.source + "):**\n" + searchResult.content + "\n\n**\u26A0\uFE0F PRIMARY DATA - Today: " + TODAY + "**\n\n" + enrichedContext;"""
    # Use the actual unicode as in file - the file may use escape sequences
    needle = "if (searchResult && searchResult.content) {"
    if "didRunWebSearch = true" not in t:
        idx = t.find(needle)
        if idx < 0:
            raise SystemExit("searchResult content check not found")
        # insert after the opening brace line
        insert_at = t.find("\n", idx) + 1
        t = t[:insert_at] + "      didRunWebSearch = true;\n" + t[insert_at:]
        changes.append("didRun-true")

    old_sp = "    searchPerformed: reasoning.plan?.needsSearch || false,"
    new_sp = "    searchPerformed: didRunWebSearch,"
    if old_sp in t:
        t = t.replace(old_sp, new_sp, 1)
        changes.append("searchPerformed-field")
    elif "searchPerformed: didRunWebSearch" in t:
        pass
    else:
        raise SystemExit("searchPerformed assignment not found")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"broken string line {li}")

if __name__ == "__main__":
    main()
