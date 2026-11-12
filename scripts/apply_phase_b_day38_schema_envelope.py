#!/usr/bin/env python3
"""Phase B Day 38: schema v2 envelope on execute_mcp / execute_plugin responses."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "PHASE_B_DAY38" in t:
        print("already applied")
        return

    old_oauth = '''await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);
      return new Response(JSON.stringify({ response: msg, thinking_steps: steps, intent: "execute_mcp", mcp: { connector, tool: toolName, result: mcpResult }, model: "mcp" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    if (!mcpResult || mcpResult.success === false) {'''

    new_oauth = '''await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);
      // PHASE_B_DAY38 — schema v2 envelope
      {
        const _snap = await getUsageSnapshot2026(env2, auth.userId);
        return new Response(JSON.stringify({
          response: msg,
          thinking_steps: steps,
          intent: "execute_mcp",
          mcp: { connector, tool: toolName, result: mcpResult },
          model: "mcp",
          presentation: { version: 1, kind: "prose", features: { hasCode: false, hasTable: false, hasLinks: true, hasNumberedSteps: false, hasCitations: false, hasSources: false, hasArtifact: false, hasRelatedQuestions: false } },
          sources: [],
          relatedQuestions: [],
          searchPerformed: false,
          latency: Date.now() - startTime,
          streamingAvailable: true,
          conversationId: typeof conversationId !== "undefined" ? conversationId : null,
          ...buildSchemaV2Meta(auth, _snap.usage)
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
    }
    if (!mcpResult || mcpResult.success === false) {'''

    old_fail = '''await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);
      return new Response(JSON.stringify({ response: msg, thinking_steps: steps, intent: "execute_mcp", mcp: { connector, tool: toolName, result: mcpResult }, model: "mcp" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    const rawData = mcpResult.data'''

    new_fail = '''await addMessage(env2, ip, auth.userId, sessionId, message, msg, true);
      // PHASE_B_DAY38 — schema v2 envelope
      {
        const _snap = await getUsageSnapshot2026(env2, auth.userId);
        return new Response(JSON.stringify({
          response: msg,
          thinking_steps: steps,
          intent: "execute_mcp",
          mcp: { connector, tool: toolName, result: mcpResult },
          model: "mcp",
          presentation: { version: 1, kind: "prose", features: { hasCode: false, hasTable: false, hasLinks: false, hasNumberedSteps: false, hasCitations: false, hasSources: false, hasArtifact: false, hasRelatedQuestions: false } },
          sources: [],
          relatedQuestions: [],
          searchPerformed: false,
          latency: Date.now() - startTime,
          streamingAvailable: true,
          conversationId: typeof conversationId !== "undefined" ? conversationId : null,
          ...buildSchemaV2Meta(auth, _snap.usage)
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
    }
    const rawData = mcpResult.data'''

    old_ok = '''await addMessage(env2, ip, auth.userId, sessionId, message, natural, true);
    return new Response(JSON.stringify({ response: natural, thinking_steps: steps, intent: "execute_mcp", mcp: { connector, tool: toolName, result: mcpResult }, model: "mcp+llm" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  if (thinking.action === "real_photo") {'''

    new_ok = '''await addMessage(env2, ip, auth.userId, sessionId, message, natural, true);
    // PHASE_B_DAY38 — schema v2 envelope
    {
      const _snap = await getUsageSnapshot2026(env2, auth.userId);
      return new Response(JSON.stringify({
        response: natural,
        thinking_steps: steps,
        intent: "execute_mcp",
        mcp: { connector, tool: toolName, result: mcpResult },
        model: "mcp+llm",
        presentation: { version: 1, kind: "prose", features: { hasCode: false, hasTable: false, hasLinks: false, hasNumberedSteps: false, hasCitations: false, hasSources: false, hasArtifact: false, hasRelatedQuestions: false } },
        sources: [],
        relatedQuestions: [],
        searchPerformed: false,
        latency: Date.now() - startTime,
        streamingAvailable: true,
        conversationId: typeof conversationId !== "undefined" ? conversationId : null,
        ...buildSchemaV2Meta(auth, _snap.usage)
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }
  if (thinking.action === "real_photo") {'''

    old_plug_ok = '''await addMessage(env2, ip, auth.userId, sessionId, message, natural, true);
    return new Response(JSON.stringify({ response: natural, thinking: typeof thinkingStepsToText === "function" ? thinkingStepsToText(steps) : thinking.reasoning, thinking_steps: steps, intent: "execute_plugin", plugin: { app, tool: pluginAction, result: pluginResult }, connected_tools: thinking.connected_tools, model: "plugin+llm" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });'''

    new_plug_ok = '''await addMessage(env2, ip, auth.userId, sessionId, message, natural, true);
    // PHASE_B_DAY38 — schema v2 envelope (plugin)
    {
      const _snap = await getUsageSnapshot2026(env2, auth.userId);
      return new Response(JSON.stringify({
        response: natural,
        thinking: typeof thinkingStepsToText === "function" ? thinkingStepsToText(steps) : thinking.reasoning,
        thinking_steps: steps,
        intent: "execute_plugin",
        plugin: { app, tool: pluginAction, result: pluginResult },
        connected_tools: thinking.connected_tools,
        model: "plugin+llm",
        presentation: { version: 1, kind: "prose", features: { hasCode: false, hasTable: false, hasLinks: false, hasNumberedSteps: false, hasCitations: false, hasSources: false, hasArtifact: false, hasRelatedQuestions: false } },
        sources: [],
        relatedQuestions: [],
        searchPerformed: false,
        latency: Date.now() - startTime,
        streamingAvailable: true,
        conversationId: typeof conversationId !== "undefined" ? conversationId : null,
        ...buildSchemaV2Meta(auth, _snap.usage)
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }'''

    for name, old, new in [
        ("oauth", old_oauth, new_oauth),
        ("fail", old_fail, new_fail),
        ("ok", old_ok, new_ok),
        ("plugin_ok", old_plug_ok, new_plug_ok),
    ]:
        if old not in t:
            raise SystemExit(f"anchor missing: {name}")
        t = t.replace(old, new, 1)
        print("patched", name)

    p.write_text(t)
    assert "PHASE_B_DAY38" in p.read_text()
    print("ok")

if __name__ == "__main__":
    main()
