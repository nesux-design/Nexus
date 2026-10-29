#!/usr/bin/env python3
"""Batch 3: OpenRouter in preference/chain + grounded confidence + stream meta."""
from pathlib import Path

def main():
    w = Path("worker.ts")
    t = w.read_text()
    changes = []

    # 1) supportedModels include openrouter
    old_sm = 'const supportedModels = ["gemini", "groq", "mimo", "cerebras", "sambanova"];'
    new_sm = 'const supportedModels = ["gemini", "groq", "mimo", "cerebras", "sambanova", "openrouter"];'
    if old_sm in t:
        t = t.replace(old_sm, new_sm, 1)
        changes.append("supportedModels")

    # 2) allowedModelPreferences include openrouter
    old_ap = 'const allowedModelPreferences = ["auto", "gemini", "groq", "mimo", "cerebras", "sambanova"];'
    new_ap = 'const allowedModelPreferences = ["auto", "gemini", "groq", "mimo", "cerebras", "sambanova", "openrouter"];'
    if old_ap in t:
        t = t.replace(old_ap, new_ap, 1)
        changes.append("allowedModelPreferences")

    # 3) Append openrouter as last fallback on each modelChain assignment
    chains = [
        ('modelChain = ["mimo", "groq", "gemini", "cerebras", "sambanova"];',
         'modelChain = ["mimo", "groq", "gemini", "cerebras", "sambanova", "openrouter"];'),
        ('modelChain = ["mimo", "gemini", "groq", "sambanova", "cerebras"];',
         'modelChain = ["mimo", "gemini", "groq", "sambanova", "cerebras", "openrouter"];'),
        ('modelChain = ["gemini", "groq", "mimo", "sambanova", "cerebras"];',
         'modelChain = ["gemini", "groq", "mimo", "sambanova", "cerebras", "openrouter"];'),
    ]
    # default balanced chain may be truncated differently — handle common pattern
    for old, new in chains:
        if old in t and new not in t:
            t = t.replace(old, new, 1)
            changes.append(f"chain:{old[15:40]}")

    # balanced/default chain: find line with modelChain = ["gemini", "mimo"
    import re
    def add_openrouter_to_chain(match):
        s = match.group(0)
        if "openrouter" in s:
            return s
        s2 = s.rstrip()
        if s2.endswith("];"):
            return s2[:-2] + ', "openrouter"];'
        return s
    t2, n = re.subn(
        r'modelChain = \[[^\]]+\];',
        add_openrouter_to_chain,
        t,
    )
    if n:
        t = t2
        changes.append(f"modelChain-regex:{n}")

    # 4) Grounded confidence: when sources exist, don't leave confidence low without reason
    # Patch a common return path that sets confidence from reasoning only
    old_conf = 'confidence: reasoning.plan?.approach || "general_chat",\n    confidence: reasoning.reasoning?.confidence || 0.7,'
    new_conf = 'intent: reasoning.plan?.approach || "general_chat",\n    confidence: (Array.isArray(webSources) && webSources.length) ? Math.max(reasoning.reasoning?.confidence || 0.7, 0.75) : (reasoning.reasoning?.confidence || 0.7),'
    # may not match exactly — skip if missing
    if old_conf in t:
        t = t.replace(old_conf, new_conf, 1)
        changes.append("grounded-confidence")

    # 5) Stream done: ensure relatedQuestions + sources pass through explicitly
    old_stream = '''stream.done(fullResponse, {
      mode: config.name,
      totalChunks: chunks.length,
      ...(metadata || {}),
      ...completionMetadata,
      presentation: buildPresentationHint(fullResponse, sourceList, null, completionMetadata.relatedQuestions || [])
    });'''
    new_stream = '''stream.done(fullResponse, {
      mode: config.name,
      totalChunks: chunks.length,
      ...(metadata || {}),
      ...completionMetadata,
      sources: sourceList.length ? sourceList : (completionMetadata.sources || (metadata && metadata.sources) || []),
      relatedQuestions: completionMetadata.relatedQuestions || (metadata && metadata.relatedQuestions) || [],
      searchPerformed: !!(completionMetadata.searchPerformed || (metadata && metadata.searchPerformed) || sourceList.length),
      presentation: buildPresentationHint(
        fullResponse,
        sourceList.length ? sourceList : (completionMetadata.sources || []),
        completionMetadata.artifact || null,
        completionMetadata.relatedQuestions || []
      )
    });'''
    if old_stream in t:
        t = t.replace(old_stream, new_stream, 1)
        changes.append("stream.done-meta")
    else:
        # try flexible whitespace
        m = re.search(
            r'stream\.done\(fullResponse, \{[\s\S]*?presentation: buildPresentationHint\(fullResponse, sourceList, null, completionMetadata\.relatedQuestions \|\| \[\]\)\s*\}\);',
            t,
        )
        if m and 'relatedQuestions: completionMetadata.relatedQuestions' not in m.group(0):
            t = t[:m.start()] + new_stream + t[m.end():]
            changes.append("stream.done-meta-re")

    w.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes applied")
    # sanity
    assert '"openrouter"' in t[t.find('allowedModelPreferences'):t.find('allowedModelPreferences')+200]
    print("ok", w.stat().st_size)

if __name__ == "__main__":
    main()
