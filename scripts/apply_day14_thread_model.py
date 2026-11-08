#!/usr/bin/env python3
"""Phase A Day 14: chat auto conversationId + resume history."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "THREAD_MODEL_V1" in t:
        print("already applied")
        return

    old_ctx = "  const sessionContext = await buildContext(env2, ip, auth.userId, sessionId, message);"
    new_ctx = '''  // THREAD_MODEL_V1
  let sessionContext = await buildContext(env2, ip, auth.userId, sessionId, message);
  let conversationId = body.conversationId || null;
  let conversationMessages = [];
  let conversationTitle = body.title || null;
  try {
    if (auth.userId && auth.userId !== "anonymous") {
      const threadMem = new MemorySystem(env2, auth.userId, auth.supabase);
      if (conversationId) {
        const existingConv = await threadMem.getChatFromSupabase(conversationId);
        if (existingConv && Array.isArray(existingConv.messages)) {
          conversationMessages = existingConv.messages;
          if (!conversationTitle && existingConv.title) conversationTitle = existingConv.title;
          const hist = conversationMessages.slice(-20).map((m) => (m.role || "user") + ": " + String(m.content || "").substring(0, 500)).join("\n");
          if (hist) sessionContext = sessionContext + "\n\n**Conversation history:**\n" + hist;
        }
      }
    }
  } catch (threadLoadErr) {
    console.error("thread load error", threadLoadErr && threadLoadErr.message);
  }'''
    if old_ctx not in t:
        raise SystemExit("sessionContext line not found")
    t = t.replace(old_ctx, new_ctx, 1)
    changes.append("load-thread")

    old_save = '''  await addMessage(env2, ip, auth.userId, sessionId, message, response.response);
  await saveToVectorDB(env2, auth.userId, message, { response: response.response?.substring(0, 500), type: "chat", intent: thinking.action });'''
    new_save = '''  await addMessage(env2, ip, auth.userId, sessionId, message, response.response);
  try {
    if (auth.userId && auth.userId !== "anonymous" && message) {
      const threadMemSave = new MemorySystem(env2, auth.userId, auth.supabase);
      const nextMessages = [...conversationMessages, { role: "user", content: String(message) }, { role: "assistant", content: String(response.response || "") }];
      if (!conversationId) {
        conversationTitle = conversationTitle || String(message).substring(0, 80);
        // new thread: respect plan conversation cap
        let userRowThread = { plan: "free", isPremium: false };
        try { userRowThread = await getUser(env2, auth.userId); } catch (_) {}
        const convLimit = getConversationLimit(auth.userId, userRowThread);
        const existingList = await threadMemSave.getChatFromSupabase();
        const count = Array.isArray(existingList) ? existingList.length : 0;
        if (convLimit !== Infinity && count >= convLimit) {
          // still answer, but do not persist new thread
          console.error("thread cap reached", count, convLimit);
        } else {
          conversationId = await threadMemSave.saveChatToSupabase(null, nextMessages, conversationTitle);
        }
      } else {
        conversationId = await threadMemSave.saveChatToSupabase(conversationId, nextMessages, conversationTitle);
      }
    }
  } catch (threadSaveErr) {
    console.error("thread save error", threadSaveErr && threadSaveErr.message);
  }
  await saveToVectorDB(env2, auth.userId, message, { response: response.response?.substring(0, 500), type: "chat", intent: thinking.action });'''
    if old_save not in t:
        raise SystemExit("addMessage/saveToVectorDB block not found")
    t = t.replace(old_save, new_save, 1)
    changes.append("save-thread")

    # Add conversationId to schema v2 chat return
    old_ret = '''    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString(),
    userId: auth.userId || null
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleChatAction, "handleChatAction");'''
    new_ret = '''    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString(),
    userId: auth.userId || null,
    conversationId: conversationId || null,
    conversationTitle: conversationTitle || null
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleChatAction, "handleChatAction");'''
    if old_ret not in t:
        raise SystemExit("chat return schema block not found")
    t = t.replace(old_ret, new_ret, 1)
    changes.append("return-conversationId")

    p.write_text(t)
    print("changes:", changes)
    assert "THREAD_MODEL_V1" in t
    assert "conversationId: conversationId || null" in t
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"broken string {li}")

if __name__ == "__main__":
    main()
