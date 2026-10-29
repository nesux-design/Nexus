#!/usr/bin/env python3
from pathlib import Path

FILTER_FN = r'''
function filterRelevantWebSources(query, sources, limit = 5) {
  const list = Array.isArray(sources) ? sources : [];
  if (!list.length) return [];
  const stop = new Set(["the", "and", "for", "are", "what", "how", "why", "who", "when", "where", "with", "from", "this", "that", "have", "has", "was", "were", "will", "your", "about", "into", "line", "simple", "explain", "please", "tell", "give", "does", "did", "can", "one", "two"]);
  const tokens = String(query || "").toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !stop.has(w));
  if (!tokens.length) return list.slice(0, limit);
  const scored = list.map((s) => {
    const hay = `${s.title || ""} ${s.url || ""}`.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (hay.includes(tok)) score += 2;
    }
    // Prefer educational / reference domains lightly
    if (/\b(wikipedia|britannica|edu|nasa\.gov|nih\.gov|khan|dictionary|merriam)\b/i.test(hay)) score += 2;
    // Downrank generic news RSS noise when off-topic
    if (/news\.google\.com|\brss\b/i.test(hay) && score < 2) score -= 3;
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter((x) => x.score > 0).map((x) => x.s);
  if (relevant.length) return relevant.slice(0, limit);
  // If nothing matches query tokens, drop sources rather than attach random news
  return [];
}
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "function filterRelevantWebSources" not in t:
        anchor = "function buildPresentationHint(answer, sources, artifact, relatedQuestions)"
        if anchor not in t:
            raise SystemExit("buildPresentationHint anchor missing")
        t = t.replace(anchor, FILTER_FN + "\n" + anchor, 1)
        changes.append("add-filter-fn")

    # Main answer path
    old1 = "const normalizedSources = normalizeWebSources(webSources);"
    new1 = "const normalizedSources = filterRelevantWebSources(query, normalizeWebSources(webSources));"
    if old1 in t and new1 not in t:
        t = t.replace(old1, new1, 1)
        changes.append("main-path")

    # Stream path — metadata may lack query; keep normalize only if no query in scope
    # Search result attach paths: filter when query variable exists nearby is hard; filter after normalize on common pattern
    old2 = "webSources = normalizeWebSources(searchResult.sources);"
    new2 = "webSources = filterRelevantWebSources(query, normalizeWebSources(searchResult.sources));"
    if old2 in t:
        # only replace if this occurs inside a function that has query in scope — common in this worker
        t = t.replace(old2, new2)
        changes.append("searchResult-path")

    old3 = "streamSources = normalizeWebSources(searchResult.sources || []);"
    new3 = "streamSources = filterRelevantWebSources(typeof query !== \"undefined\" ? query : \"\", normalizeWebSources(searchResult.sources || []));"
    if old3 in t:
        t = t.replace(old3, new3)
        changes.append("streamSources-path")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")

if __name__ == "__main__":
    main()
