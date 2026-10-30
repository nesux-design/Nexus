#!/usr/bin/env python3
"""ChatGPT-like answer pipeline upgrades for NEXUS A1 worker."""
from pathlib import Path

SHOULD_SEARCH_FN = r'''
function shouldUseWebSearch(query, planNeedsSearch) {
  const q = String(query || "").trim();
  if (!q) return false;
  // Simple definition / one-liner / greeting — no live web needed (ChatGPT-style)
  if (/^(hi|hello|hey|thanks|thank you|ok|okay|bye)\b/i.test(q)) return false;
  if (/\b(in one line|one sentence|one-liner|briefly define|what is .+\?$)\b/i.test(q) && q.length < 120) {
    // definitional unless explicitly about current events
    if (!/\b(today|latest|news|current|202[4-9]|who won|stock|price|weather)\b/i.test(q)) return false;
  }
  if (/\b(latest|today|news|current|breaking|who won|score|stock|weather|price of)\b/i.test(q)) return true;
  if (planNeedsSearch === true) return true;
  if (planNeedsSearch === false) return false;
  // Default: medium+ queries may search; short pure knowledge questions skip
  return q.length > 80;
}
function buildCitations(sources) {
  const list = Array.isArray(sources) ? sources : [];
  return list.map((s, i) => ({
    index: i + 1,
    title: s.title || s.url,
    url: s.url,
    type: "url_citation"
  }));
}
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # 1) Insert helpers before filterRelevantWebSources or buildPresentationHint
    if "function shouldUseWebSearch" not in t:
        anchor = "function filterRelevantWebSources"
        if anchor not in t:
            anchor = "function buildPresentationHint"
        if anchor not in t:
            raise SystemExit("no anchor for helpers")
        t = t.replace(anchor, SHOULD_SEARCH_FN + "\n" + anchor, 1)
        changes.append("helpers")

    # 2) Fallback plan: needsSearch false (was true — caused noise search on every fail)
    old_fb = '''return {
    plan: {
      needsSearch: true,
      complexity: "medium",
      approach: "direct",
      steps: 1,
      plan: "Process directly"'''
    new_fb = '''return {
    plan: {
      needsSearch: false,
      complexity: "simple",
      approach: "direct",
      steps: 1,
      plan: "Process directly"'''
    if old_fb in t:
        t = t.replace(old_fb, new_fb, 1)
        changes.append("fallback-needsSearch-false")

    # 3) Gate web search with shouldUseWebSearch
    old_gate = "if (reasoning.plan && reasoning.plan.needsSearch) {"
    new_gate = "if (reasoning.plan && shouldUseWebSearch(query, reasoning.plan.needsSearch)) {"
    if old_gate in t and "shouldUseWebSearch(query" not in t[t.find("if (reasoning.plan"):t.find("if (reasoning.plan")+120]:
        # only first orchestration gate
        t = t.replace(old_gate, new_gate, 1)
        changes.append("search-gate")

    # Also gate orchestrator webSearch flag near needsSearch
    old_ws = "webSearch: reasoning.plan?.needsSearch || false,"
    new_ws = "webSearch: shouldUseWebSearch(query, reasoning.plan?.needsSearch || false),"
    if old_ws in t:
        t = t.replace(old_ws, new_ws)
        changes.append("orchestrator-webSearch")

    old_groq = "const groqRawResult = await callGroqRaw(messages, reasoning.plan?.needsSearch || false);"
    new_groq = "const groqRawResult = await callGroqRaw(messages, shouldUseWebSearch(query, reasoning.plan?.needsSearch || false));"
    if old_groq in t:
        t = t.replace(old_groq, new_groq, 1)
        changes.append("groq-webSearch")

    # 4) searchPerformed + citations on quantumResponse return
    old_ret = '''searchPerformed: reasoning.plan?.needsSearch || false,
    sources: normalizedSources,
    thinking,
    artifact,
    relatedQuestions,
    language: responseLanguage
  };'''
    new_ret = '''searchPerformed: normalizedSources.length > 0,
    sources: normalizedSources,
    citations: buildCitations(normalizedSources),
    thinking,
    artifact,
    relatedQuestions,
    language: responseLanguage
  };'''
    if old_ret in t and "citations: buildCitations" not in t:
        t = t.replace(old_ret, new_ret, 1)
        changes.append("return-citations")

    # 5) Chat JSON payload: pass citations, message alias, searchPerformed from sources
    # Pattern appears twice (stream and non-stream)
    old_payload = '''sources: response.sources || [],
        relatedQuestions: response.relatedQuestions || [],
        artifact: response.artifact || null,
        searchPerformed: response.searchPerformed === true,'''
    new_payload = '''sources: response.sources || [],
        citations: response.citations || buildCitations(response.sources || []),
        relatedQuestions: response.relatedQuestions || [],
        artifact: response.artifact || null,
        searchPerformed: (response.sources && response.sources.length > 0) || response.searchPerformed === true,'''
    if old_payload in t:
        t = t.replace(old_payload, new_payload)
        changes.append("payload-citations")

    # Second payload style (less indent)
    old_payload2 = '''sources: response.sources || [],
    relatedQuestions: response.relatedQuestions || [],
    artifact: response.artifact || null,
    searchPerformed: response.searchPerformed === true,'''
    new_payload2 = '''sources: response.sources || [],
    citations: response.citations || buildCitations(response.sources || []),
    relatedQuestions: response.relatedQuestions || [],
    artifact: response.artifact || null,
    searchPerformed: (response.sources && response.sources.length > 0) || response.searchPerformed === true,'''
    if old_payload2 in t:
        t = t.replace(old_payload2, new_payload2)
        changes.append("payload2-citations")

    # 6) Stronger ChatGPT-class formation block
    old_form = "Answer formation (ChatGPT-class):"
    if old_form in t and "ChatGPT-parity response contract" not in t:
        extra = '''Answer formation (ChatGPT-class):

ChatGPT-parity response contract:
- Match modern ChatGPT answer quality: direct lead, then structured detail only if useful.
- For knowledge questions, answer from model knowledge first; use web only for freshness, news, prices, sports, or when the user asks for sources.
- When sources exist, place [n] markers next to the supported claims and keep titles honest.
- For how-to: numbered steps. For compare: short table or bullets. For code: fenced blocks with language tags.
- Never dump unrelated news links. Never pad with filler.
- Keep tone natural and confident but not arrogant; state uncertainty when the topic is disputed or time-sensitive.
'''
        # Replace the short header line area - inject after header
        t = t.replace(
            "Answer formation (ChatGPT-class):\n- Lead with a direct answer",
            extra + "\n- Lead with a direct answer",
            1,
        )
        changes.append("prompt-parity")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes applied")
    assert "shouldUseWebSearch" in t
    assert "buildCitations" in t

if __name__ == "__main__":
    main()
