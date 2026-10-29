#!/usr/bin/env python3
"""Apply next ChatGPT-level backend batch to worker.ts on main."""
from pathlib import Path

def main():
    w = Path("worker.ts")
    t = w.read_text()
    changes = []

    # 1) Accept body.provider as alias for body.model
    old_pref = 'const modelPreference = allowedModelPreferences.includes(body.model) ? body.model : "auto";'
    new_pref = 'const requestedModel = body.model || body.provider || body.modelPreference || "auto";\n  const modelPreference = allowedModelPreferences.includes(requestedModel) ? requestedModel : "auto";'
    if old_pref in t and 'body.provider || body.modelPreference' not in t:
        t = t.replace(old_pref, new_pref, 1)
        changes.append("modelPreference provider alias")

    # 2) Lower related-questions threshold + always try for non-small-talk
    old_rq = 'if (config.includeRelatedQuestions === true || (config.includeRelatedQuestions !== false && trimmedQuery.length > 30 && !isSmallTalk))'
    new_rq = 'if (config.includeRelatedQuestions === true || (config.includeRelatedQuestions !== false && trimmedQuery.length > 12 && !isSmallTalk))'
    if old_rq in t:
        t = t.replace(old_rq, new_rq, 1)
        changes.append("relatedQuestions threshold")

    # 3) Heuristic fallback when generateRelatedQuestions returns []
    old_gen_end = '''    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3).map((q) => String(q)).filter(Boolean);
    }
    return [];
  } catch (e) {
    console.error("generateRelatedQuestions error:", e.message);
    return [];
  }
}'''
    new_gen_end = '''    if (Array.isArray(parsed)) {
      const qs = parsed.slice(0, 3).map((q) => String(q)).filter(Boolean);
      if (qs.length) return qs;
    }
    return heuristicRelatedQuestions(query, responseText);
  } catch (e) {
    console.error("generateRelatedQuestions error:", e.message);
    return heuristicRelatedQuestions(query, responseText);
  }
}
function heuristicRelatedQuestions(query, responseText) {
  const q = String(query || "").trim();
  if (!q) return [];
  const base = q.length > 80 ? q.slice(0, 77) + "..." : q;
  const out = [
    `Can you explain more about: ${base}?`,
    `What are practical next steps related to this?`,
    `Are there common mistakes or edge cases I should know?`
  ];
  return out;
}'''
    if 'function heuristicRelatedQuestions' not in t and old_gen_end in t:
        t = t.replace(old_gen_end, new_gen_end, 1)
        changes.append("heuristicRelatedQuestions")
    elif 'function heuristicRelatedQuestions' not in t:
        # looser match
        needle = 'console.error("generateRelatedQuestions error:"'
        if needle in t and 'heuristicRelatedQuestions' not in t:
            t = t.replace(
                'return [];\n  } catch (e) {\n    console.error("generateRelatedQuestions error:", e.message);\n    return [];',
                'return heuristicRelatedQuestions(query, responseText);\n  } catch (e) {\n    console.error("generateRelatedQuestions error:", e.message);\n    return heuristicRelatedQuestions(query, responseText);',
                1,
            )
            # still need function + first return path
            t = t.replace(
                'return parsed.slice(0, 3).map((q) => String(q)).filter(Boolean);\n    }\n    return [];',
                'const qs = parsed.slice(0, 3).map((q) => String(q)).filter(Boolean);\n      if (qs.length) return qs;\n    }\n    return heuristicRelatedQuestions(query, responseText);',
                1,
            )
            insert_at = t.find('__name(generateRelatedQuestions')
            if insert_at > 0 and 'function heuristicRelatedQuestions' not in t:
                fn = '''
function heuristicRelatedQuestions(query, responseText) {
  const q = String(query || "").trim();
  if (!q) return [];
  const base = q.length > 80 ? q.slice(0, 77) + "..." : q;
  return [
    `Can you explain more about: ${base}?`,
    `What are practical next steps related to this?`,
    `Are there common mistakes or edge cases I should know?`
  ];
}
'''
                t = t[:insert_at] + fn + t[insert_at:]
            changes.append("heuristicRelatedQuestions-loose")

    # 4) Stronger ChatGPT-style answer formation guidance in identity block
    old_id = 'Aim for accurate, useful, production-quality answers, but state uncertainty and limitations honestly.'
    new_id = '''Aim for accurate, useful, production-quality answers, but state uncertainty and limitations honestly.

Answer formation (ChatGPT-class):
- Lead with a direct answer in 1–3 sentences when the user asked a concrete question.
- For multi-part or how-to requests, use clear markdown structure (short headings, bullets, numbered steps).
- Prefer scannable layout over long walls of text; keep paragraphs short.
- When tools/search/MCP data was used, ground claims in that data and do not invent results.
- End substantial answers ready for follow-ups; the system may attach related questions separately.'''
    if old_id in t and 'Answer formation (ChatGPT-class)' not in t:
        t = t.replace(old_id, new_id, 1)
        changes.append("answer formation guidance")

    # 5) Clearer MCP custom auth error for operators
    old_err = 'Missing NEXUS_INTERNAL_AUTH_SECRET or userId'
    # leave client as-is; soft message in worker cases if present
    if 'case "mcp_custom_list"' in t and 'NEXUS_INTERNAL_AUTH_SECRET is not configured' not in t:
        # no-op if cases already thin wrappers
        pass

    w.write_text(t)
    print("changes:", changes or ["none"])
    print("size", w.stat().st_size)
    if not changes:
        raise SystemExit("no changes applied — needles may have drifted")

if __name__ == "__main__":
    main()
