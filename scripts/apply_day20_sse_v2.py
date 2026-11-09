#!/usr/bin/env python3
"""Phase A Day 20: SSE contract v2 + stream uses memory/thread context."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # --- 1) UltraStream protocol v2 ---
    if "nexus-sse-v2" not in t:
        old_init = '''        self.send({
          type: "init",
          timestamp: Date.now(),
          version: "8.0",
          mode: "monster"
        });'''
        new_init = '''        self.send({
          type: "init",
          timestamp: Date.now(),
          version: "2.0",
          protocol: "nexus-sse-v2",
          schemaVersion: 2,
          requestId: self.requestId || null,
          mode: "monster"
        });'''
        if old_init not in t:
            raise SystemExit("UltraStream init block not found")
        t = t.replace(old_init, new_init, 1)

        old_ctor = '''  constructor() {
    this.controller = null;
    this.encoder = new TextEncoder();
    this.closed = false;
    this.chunkCount = 0;
    this.totalCharacters = 0;
    this.startTime = Date.now();
  }'''
        new_ctor = '''  constructor(opts) {
    this.controller = null;
    this.encoder = new TextEncoder();
    this.closed = false;
    this.chunkCount = 0;
    this.totalCharacters = 0;
    this.startTime = Date.now();
    this.requestId = opts && opts.requestId ? opts.requestId : (typeof newRequestId === "function" ? newRequestId() : null);
  }'''
        if old_ctor not in t:
            raise SystemExit("UltraStream constructor not found")
        t = t.replace(old_ctor, new_ctor, 1)

        old_chunk = '''  chunk(text) {
    this.chunkCount = this.chunkCount + 1;
    this.totalCharacters = this.totalCharacters + text.length;
    this.send({
      type: "chunk",
      text,
      index: this.chunkCount
    });
  }'''
        new_chunk = '''  chunk(text) {
    this.chunkCount = this.chunkCount + 1;
    this.totalCharacters = this.totalCharacters + text.length;
    // v2 primary event
    this.send({
      type: "token",
      text,
      index: this.chunkCount
    });
    // backward-compatible alias
    this.send({
      type: "chunk",
      text,
      index: this.chunkCount
    });
  }
  token(text) {
    this.chunk(text);
  }'''
        if old_chunk not in t:
            raise SystemExit("UltraStream.chunk not found")
        t = t.replace(old_chunk, new_chunk, 1)

        old_done = '''        this.send({
          type: "done",
          fullResponse,
          stats: {
            chunks: this.chunkCount,
            characters: this.totalCharacters,
            time: Date.now() - this.startTime,
            speed: Math.round(this.totalCharacters / ((Date.now() - this.startTime) / 1e3))
          },
          metadata: metadata || {}
        });'''
        new_done = '''        this.send({
          type: "done",
          fullResponse,
          schemaVersion: 2,
          requestId: this.requestId || null,
          stats: {
            chunks: this.chunkCount,
            characters: this.totalCharacters,
            time: Date.now() - this.startTime,
            speed: Math.round(this.totalCharacters / ((Date.now() - this.startTime) / 1e3))
          },
          metadata: metadata || {}
        });'''
        if old_done not in t:
            raise SystemExit("UltraStream.done send not found")
        t = t.replace(old_done, new_done, 1)
        changes.append("ultrastream-v2")

    # --- 2) new UltraStream() passes requestId ---
    if "new UltraStream({ requestId" not in t:
        old_new = "  const ultra = new UltraStream();"
        new_new = "  const ultra = new UltraStream({ requestId: typeof newRequestId === \"function\" ? newRequestId() : null });"
        if old_new not in t:
            raise SystemExit("new UltraStream() not found")
        t = t.replace(old_new, new_new, 1)
        changes.append("ultra-ctor-call")

    # --- 3) Stream path: memory + optional conversation history before ultimateChatHandler ---
    if "STREAM_CONTEXT_V1" not in t:
        old_stream = '''  if (streamMode === "typing" || streamMode === "burst" || streamMode === "word" || streamMode === "quantum") {
    const context = await buildContext(env2, ip, auth.userId, sessionId, message);
    const { stream, processPromise } = await ultimateChatHandler(env2, message, context, auth.userId, sessionId, ip, streamMode);
    ctx.waitUntil(processPromise);
    return new Response(stream, { headers: { ...CORS_HEADERS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Stream-Mode": streamMode } });
  }'''
        new_stream = '''  if (streamMode === "typing" || streamMode === "burst" || streamMode === "word" || streamMode === "quantum" || streamMode === "sse" || streamMode === "v2") {
    // STREAM_CONTEXT_V1 — same memory/thread enrichment as non-stream chat
    let context = await buildContext(env2, ip, auth.userId, sessionId, message);
    try {
      if (auth.userId && auth.userId !== "anonymous") {
        const streamMem = new MemorySystem(env2, auth.userId, auth.supabase);
        const streamConvId = body.conversationId || null;
        if (streamConvId) {
          const existingConv = await streamMem.getChatFromSupabase(streamConvId);
          if (existingConv && Array.isArray(existingConv.messages)) {
            const hist = existingConv.messages.slice(-20).map((m) => (m.role || "user") + ": " + String(m.content || "").substring(0, 500)).join("\\n");
            if (hist) context = context + "\\n\\n**Conversation history:**\\n" + hist;
          }
        }
        const facts = await streamMem.listExplicitMemories();
        if (Array.isArray(facts) && facts.length) {
          let userRowMem = { plan: "free", isPremium: false };
          try { userRowMem = await getUser(env2, auth.userId); } catch (_) {}
          const memCap = getExplicitMemoryLimit(auth.userId, userRowMem);
          const cap = memCap === Infinity ? 50 : Math.min(memCap, 50);
          const lines = facts.slice(0, cap).map((m) => "- " + String(m && m.fact != null ? m.fact : m).substring(0, 300));
          context = context + "\\n\\n**User memory (explicit facts):**\\n" + lines.join("\\n");
        }
      }
    } catch (streamCtxErr) {
      console.error("stream context enrich", streamCtxErr && streamCtxErr.message);
    }
    const { stream, processPromise } = await ultimateChatHandler(env2, message, context, auth.userId, sessionId, ip, streamMode);
    ctx.waitUntil(processPromise);
    return new Response(stream, { headers: { ...CORS_HEADERS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Stream-Mode": streamMode, "X-Schema-Version": "2" } });
  }'''
        if old_stream not in t:
            raise SystemExit("streamMode branch not found")
        t = t.replace(old_stream, new_stream, 1)
        changes.append("stream-context")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    for li, line in enumerate(t.splitlines(), 1):
        s = line.rstrip()
        if s.endswith('.join("') or s.endswith('context + "') or s.endswith('sessionContext + "'):
            raise SystemExit(f"broken string line {li}: {s}")
    assert "nexus-sse-v2" in t
    assert "STREAM_CONTEXT_V1" in t
    print("ok")

if __name__ == "__main__":
    main()
