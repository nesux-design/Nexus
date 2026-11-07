#!/usr/bin/env python3
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "web_search feature is disabled" in t:
        print("already applied")
        return

    old = (
        "  if (reasoning.plan && reasoning.plan.needsSearch) {\n"
        "    const searchQuota = await checkUsageLimit2026(env2, userId, \"search\");\n"
        "    if (!searchQuota.allowed) {\n"
        "      enrichedContext = \"\\n\\n(Live web search skipped: daily search limit reached for this plan.)\\n\" + enrichedContext;\n"
        "    } else {\n"
        "    const searchResult = await performWebSearch(query);"
    )
    # Build with actual content as in file (escaped n in source)
    old = (
        '  if (reasoning.plan && reasoning.plan.needsSearch) {\n'
        '    const searchQuota = await checkUsageLimit2026(env2, userId, "search");\n'
        '    if (!searchQuota.allowed) {\n'
        '      enrichedContext = "\\n\\n(Live web search skipped: daily search limit reached for this plan.)\\n" + enrichedContext;\n'
        '    } else {\n'
        '    const searchResult = await performWebSearch(query);'
    )
    new = (
        '  if (reasoning.plan && reasoning.plan.needsSearch) {\n'
        '    const searchFlags = await getFeatureFlags(env2, userId);\n'
        '    if (searchFlags && searchFlags.web_search === false) {\n'
        '      enrichedContext = "\\n\\n(Live web search skipped: web_search feature is disabled for this user/plan.)\\n" + enrichedContext;\n'
        '    } else {\n'
        '    const searchQuota = await checkUsageLimit2026(env2, userId, "search");\n'
        '    if (!searchQuota.allowed) {\n'
        '      enrichedContext = "\\n\\n(Live web search skipped: daily search limit reached for this plan.)\\n" + enrichedContext;\n'
        '    } else {\n'
        '    const searchResult = await performWebSearch(query);'
    )
    if old not in t:
        raise SystemExit("search block not found")
    t = t.replace(old, new, 1)

    # Add one closing brace before let finalPrompt (extra else nest)
    marker = "\n  }\n  }\n  let finalPrompt"
    if marker not in t:
        raise SystemExit("closing brace marker not found: " + repr(t[t.find("let finalPrompt")-50:t.find("let finalPrompt")+20]))
    t = t.replace(marker, "\n  }\n  }\n  }\n  let finalPrompt", 1)

    p.write_text(t)
    assert "web_search feature is disabled" in t
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"broken string line {li}")
    print("ok")

if __name__ == "__main__":
    main()
