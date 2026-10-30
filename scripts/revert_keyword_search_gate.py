#!/usr/bin/env python3
"""Remove keyword-based shouldUseWebSearch; keep AI plan.needsSearch as source of truth."""
from pathlib import Path
import re

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # Remove shouldUseWebSearch function entirely
    t2, n = re.subn(
        r"\nfunction shouldUseWebSearch\(query, planNeedsSearch\) \{[\s\S]*?\n\}\n",
        "\n",
        t,
        count=1,
    )
    if n:
        t = t2
        changes.append("remove-shouldUseWebSearch-fn")

    # Restore gates to pure AI decision
    reps = [
        (
            "if (reasoning.plan && shouldUseWebSearch(query, reasoning.plan.needsSearch)) {",
            "if (reasoning.plan && reasoning.plan.needsSearch) {",
        ),
        (
            "const groqRawResult = await callGroqRaw(messages, shouldUseWebSearch(query, reasoning.plan?.needsSearch || false));",
            "const groqRawResult = await callGroqRaw(messages, reasoning.plan?.needsSearch || false);",
        ),
        (
            "webSearch: shouldUseWebSearch(query, reasoning.plan?.needsSearch || false),",
            "webSearch: reasoning.plan?.needsSearch || false,",
        ),
    ]
    for old, new in reps:
        if old in t:
            t = t.replace(old, new)
            changes.append(f"restore:{old[:40]}")

    # Keep buildCitations + searchPerformed based on actual sources (honest metadata)
    # Leave filterRelevantWebSources — quality filter, not routing

    if "shouldUseWebSearch" in t:
        # leftover references
        t = t.replace("shouldUseWebSearch(query, reasoning.plan.needsSearch)", "reasoning.plan.needsSearch")
        t = t.replace("shouldUseWebSearch(query, reasoning.plan?.needsSearch || false)", "reasoning.plan?.needsSearch || false")
        changes.append("cleanup-leftovers")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if "shouldUseWebSearch" in t:
        raise SystemExit("shouldUseWebSearch still present")
    if not changes:
        raise SystemExit("nothing changed")

if __name__ == "__main__":
    main()
