#!/usr/bin/env python3
"""God-level answer pipeline: clean tool artifacts, recover sources, honest searchPerformed.
Does NOT override AI needsSearch decision.
"""
from pathlib import Path
import re

HELPERS = r'''
function extractUrlsAsSources(text, limit = 8) {
  const out = [];
  const seen = new Set();
  const s = String(text || "");
  // markdown links [title](url)
  const md = /\[([^\]]{1,120})\]\((https?:\/\/[^)\s]+)\)/gi;
  let m;
  while ((m = md.exec(s)) !== null) {
    const url = m[2];
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title: m[1].trim() || url, url });
    if (out.length >= limit) return out;
  }
  // bare urls
  const bare = /https?:\/\/[^\s\]\)"'<>]+/gi;
  while ((m = bare.exec(s)) !== null) {
    let url = m[0].replace(/[.,;:!?)]+$/, "");
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      out.push({ title: host, url });
    } catch (_) {}
    if (out.length >= limit) break;
  }
  return out;
}
function cleanAnswerArtifacts(text) {
  let t = String(text || "");
  // Groq/OpenAI-style internal cite markers e.g. 【10†L12-L15】 or 【10†L12-L15 】
  t = t.replace(/【[^】]*】/g, "");
  // leftover dagger line refs
  t = t.replace(/\s*†L\d+-L\d+/g, "");
  // collapse whitespace
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  t = t.replace(/ +([.,;:!?])/g, "$1");
  return t.trim();
}
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # Insert helpers before filterRelevantWebSources
    if "function cleanAnswerArtifacts" not in t:
        anchor = "function filterRelevantWebSources"
        if anchor not in t:
            raise SystemExit("filterRelevantWebSources missing")
        t = t.replace(anchor, HELPERS + "\n" + anchor, 1)
        changes.append("helpers")

    # Soften filter: never return empty when we had sources — keep best effort
    old_filter_tail = """  const relevant = scored.filter((x) => x.score > 0).map((x) => x.s);
  if (relevant.length) return relevant.slice(0, limit);
  // If nothing matches query tokens, drop sources rather than attach random news
  return [];
}"""
    new_filter_tail = """  const relevant = scored.filter((x) => x.score > 0).map((x) => x.s);
  if (relevant.length) return relevant.slice(0, limit);
  // Keep best-effort top sources (still better than silent empty when search ran)
  return scored.map((x) => x.s).slice(0, Math.min(limit, 3));
}"""
    if old_filter_tail in t:
        t = t.replace(old_filter_tail, new_filter_tail, 1)
        changes.append("soften-filter")
    else:
        # try alternate ending
        alt = """  if (relevant.length) return relevant.slice(0, limit);
  // If nothing matches query tokens, drop sources rather than attach random news
  return [];
}"""
        if alt in t:
            t = t.replace(alt, """  if (relevant.length) return relevant.slice(0, limit);
  return scored.map((x) => x.s).slice(0, Math.min(limit, 3));
}""", 1)
            changes.append("soften-filter-alt")

    # Search block: recover sources from content; track didSearch
    old_search = """if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchResult = await performWebSearch(query);
    if (searchResult && searchResult.content) {
      enrichedContext = "\\n\\n**\\u{1F310} LIVE SEARCH (Source: " + searchResult.source + "):**\\n" + searchResult.content + "\\n\\n**\\u26A0\\uFE0F PRIMARY DATA - Today: " + TODAY + "**\\n\\n" + enrichedContext;
      if (searchResult.sources && searchResult.sources.length > 0) {
        webSources = filterRelevantWebSources(query, normalizeWebSources(searchResult.sources));
        const citationList = webSources.map((s, i) => `[${i + 1}] ${s.title}`).join("\\n");
        enrichedContext = "\\n\\n**\\u{1F4DA} CITE YOUR SOURCES:** When you use information from the search results, add a numbered citation marker like [1], [2] right after the claim, matching this source list:\\n" + citationList + "\\n" + enrichedContext;
      }
    }
  }"""
    # Unicode in file may be actual emoji - match more loosely with regex
    pattern = r"if \(reasoning\.plan && reasoning\.plan\.needsSearch\) \{[\s\S]*?const searchResult = await performWebSearch\(query\);[\s\S]*?if \(searchResult && searchResult\.content\) \{[\s\S]*?\n    \}\n  \}"
    new_search = '''if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchResult = await performWebSearch(query);
    if (searchResult && searchResult.content) {
      didWebSearch = true;
      enrichedContext = "\n\n**LIVE SEARCH (Source: " + searchResult.source + "):**\n" + searchResult.content + "\n\n**PRIMARY DATA - Today: " + TODAY + "**\n\n" + enrichedContext;
      let rawSources = Array.isArray(searchResult.sources) ? searchResult.sources : [];
      if (!rawSources.length) {
        rawSources = extractUrlsAsSources(searchResult.content);
      }
      webSources = filterRelevantWebSources(query, normalizeWebSources(rawSources));
      if (!webSources.length && rawSources.length) {
        webSources = normalizeWebSources(rawSources).slice(0, 5);
      }
      if (webSources.length) {
        const citationList = webSources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`).join("\n");
        enrichedContext = "\n\n**CITE YOUR SOURCES:** Use only [1], [2], ... markers matching this list. Never invent markers like 【】 or †L references.\n" + citationList + "\n" + enrichedContext;
      }
    }
  }'''
    m = re.search(pattern, t)
    if m:
        t = t[:m.start()] + new_search + t[m.end():]
        changes.append("search-block")
    else:
        print("WARN: search block regex miss")

    # Declare didWebSearch near webSources init
    if "let didWebSearch" not in t:
        if "let webSources = []" in t:
            t = t.replace("let webSources = []", "let webSources = [];\n  let didWebSearch = false", 1)
            changes.append("didWebSearch-decl")
        elif "var webSources = []" in t:
            t = t.replace("var webSources = []", "var webSources = [];\n  var didWebSearch = false", 1)
            changes.append("didWebSearch-decl-var")

    # Clean answer text after model response
    old_resp = "let response = aiResult.response;"
    new_resp = "let response = cleanAnswerArtifacts(aiResult.response);"
    if old_resp in t and "cleanAnswerArtifacts(aiResult.response)" not in t:
        t = t.replace(old_resp, new_resp, 1)
        changes.append("clean-response")

    # Honest searchPerformed
    old_sp = "searchPerformed: normalizedSources.length > 0,"
    new_sp = "searchPerformed: didWebSearch || normalizedSources.length > 0,"
    if old_sp in t:
        t = t.replace(old_sp, new_sp, 1)
        changes.append("searchPerformed")
    old_sp2 = "searchPerformed: reasoning.plan?.needsSearch || false,"
    if old_sp2 in t:
        t = t.replace(old_sp2, "searchPerformed: didWebSearch || normalizedSources.length > 0,", 1)
        changes.append("searchPerformed-alt")

    # Prompt: never emit tool junk markers
    if "Never invent markers like" not in t:
        needle = "When tools/search/MCP data was used, ground claims in that data and do not invent results."
        if needle in t:
            t = t.replace(
                needle,
                needle + "\n- Never emit internal tool markers such as 【】, †L12-L15, or raw tool IDs; use only plain [n] citations when sources are provided.",
                1,
            )
            changes.append("prompt-no-junk")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    for req in ["cleanAnswerArtifacts", "extractUrlsAsSources"]:
        if req not in t:
            raise SystemExit(f"missing {req}")

if __name__ == "__main__":
    main()
