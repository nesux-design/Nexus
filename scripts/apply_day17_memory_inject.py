#!/usr/bin/env python3
"""Phase A Day 17: inject explicit memories into sessionContext for every chat."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "MEMORY_INJECT_V1" in t:
        print("already applied")
        return

    # Insert AFTER thread load catch, BEFORE getSession
    old = '''  } catch (threadLoadErr) {
    console.error("thread load error", threadLoadErr && threadLoadErr.message);
  }
  const session = await getSession(env2, ip, auth.userId, sessionId);'''

    # All newlines as real newlines in source; \\n becomes \n in JS string (two chars backslash-n)
    new = '''  } catch (threadLoadErr) {
    console.error("thread load error", threadLoadErr && threadLoadErr.message);
  }
  // MEMORY_INJECT_V1 — durable facts across conversations (plan-capped)
  try {
    if (auth.userId && auth.userId !== "anonymous") {
      const memInject = new MemorySystem(env2, auth.userId, auth.supabase);
      const facts = await memInject.listExplicitMemories();
      if (Array.isArray(facts) && facts.length) {
        let userRowMem = { plan: "free", isPremium: false };
        try { userRowMem = await getUser(env2, auth.userId); } catch (_) {}
        const memCap = getExplicitMemoryLimit(auth.userId, userRowMem);
        const cap = memCap === Infinity ? 50 : Math.min(memCap, 50);
        const lines = facts.slice(0, cap).map((m) => "- " + String(m && m.fact != null ? m.fact : m).substring(0, 300));
        sessionContext = sessionContext + "\\n\\n**User memory (explicit facts):**\\n" + lines.join("\\n");
      }
    }
  } catch (memInjErr) {
    console.error("memory inject error", memInjErr && memInjErr.message);
  }
  const session = await getSession(env2, ip, auth.userId, sessionId);'''

    if old not in t:
        raise SystemExit("thread load / getSession anchor not found")
    t = t.replace(old, new, 1)
    p.write_text(t)

    assert "MEMORY_INJECT_V1" in t
    # Guard: no broken open string endings on inject lines
    for li, line in enumerate(t.splitlines(), 1):
        s = line.rstrip()
        if s.endswith('sessionContext + "') or s.endswith('.join("'):
            raise SystemExit(f"broken string line {li}: {s}")
        if s.endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"broken enrichedContext {li}")
    print("ok")

if __name__ == "__main__":
    main()
