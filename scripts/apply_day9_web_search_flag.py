#!/usr/bin/env python3
"""Day-9: honor web_search feature flag inside quantumResponse search path."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    old = '''  if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchQuota = await checkUsageLimit2026(env2, userId, "search");
    if (!searchQuota.allowed) {
      enrichedContext = "\\n\\n(Live web search skipped: daily search limit reached for this plan.)\\n" + enrichedContext;
    } else {
    const searchResult = await performWebSearch(query);'''

    # actual file uses real escape sequences as two-char backslash-n in source
    old = """  if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchQuota = await checkUsageLimit2026(env2, userId, "search");
    if (!searchQuota.allowed) {
      enrichedContext = "\n\n(Live web search skipped: daily search limit reached for this plan.)\n" + enrichedContext;
    } else {
    const searchResult = await performWebSearch(query);"""

    new = """  if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchFlags = await getFeatureFlags(env2, userId);
    if (searchFlags && searchFlags.web_search === false) {
      enrichedContext = "\n\n(Live web search skipped: web_search feature is disabled for this user/plan.)\n" + enrichedContext;
    } else {
    const searchQuota = await checkUsageLimit2026(env2, userId, "search");
    if (!searchQuota.allowed) {
      enrichedContext = "\n\n(Live web search skipped: daily search limit reached for this plan.)\n" + enrichedContext;
    } else {
    const searchResult = await performWebSearch(query);"""

    if "web_search feature is disabled" not in t:
        if old not in t:
            raise SystemExit("search block not found")
        t = t.replace(old, new, 1)
        # need one extra closing brace for the new else layer before finalPrompt
        # current end of needsSearch:
        #    }
        #  }
        #  let finalPrompt
        # after adding another else { we need one more }
        close = "\n  }\n  }\n  let finalPrompt"
        # may already have two braces from day3
        if "web_search feature is disabled" in t:
            # find the search block end - after our edit there should be 3 closing braces before let finalPrompt
            # Original day3: if needsSearch { if !quota {} else { ... } }  -> two }
            # Now: if needsSearch { if !flag {} else { if !quota {} else { ... } } } -> three }
            marker = "\n  }\n  }\n  let finalPrompt"
            if marker in t:
                t = t.replace(marker, "\n  }\n  }\n  }\n  let finalPrompt", 1)
                changes.append("extra-brace")
            else:
                # try with only one brace before finalPrompt (if structure differs)
                marker2 = "\n  }\n  let finalPrompt"
                if marker2 in t and t.count("web_search feature is disabled"):
                    # count braces carefully - if day3 already has 2, marker should exist
                    print("WARN: two-brace marker missing; inspecting")
                    idx = t.find("let finalPrompt")
                    print(repr(t[idx-40:idx+20]))
                    raise SystemExit("brace marker missing")
        changes.append("web-search-flag")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"broken string line {li}")

if __name__ == "__main__":
    main()
