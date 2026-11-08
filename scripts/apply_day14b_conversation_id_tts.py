#!/usr/bin/env python3
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "THREAD_MODEL_V1" not in t:
        raise SystemExit("THREAD_MODEL_V1 missing - day14 not on worker")

    old_tts = '''        schemaVersion: 2,
        requestId: newRequestId(),
        created: (/* @__PURE__ */ new Date()).toISOString(),
        userId: auth.userId || null
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }
  const pendingNotification'''

    new_tts = '''        schemaVersion: 2,
        requestId: newRequestId(),
        created: (/* @__PURE__ */ new Date()).toISOString(),
        userId: auth.userId || null,
        conversationId: conversationId || null,
        conversationTitle: conversationTitle || null
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }
  const pendingNotification'''

    if "conversationId: conversationId || null" in t[t.find("ttsError"):t.find("ttsError")+500]:
        changes.append("tts-already")
    elif old_tts in t:
        t = t.replace(old_tts, new_tts, 1)
        changes.append("tts-conversationId")
    else:
        print("WARN: tts block not exact")

    # Deploy marker so CF rebuilds
    if "THREAD_MODEL_V1_DEPLOY2" not in t:
        t = t.replace("THREAD_MODEL_V1", "THREAD_MODEL_V1_DEPLOY2", 1)
        changes.append("deploy-marker")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")

if __name__ == "__main__":
    main()
