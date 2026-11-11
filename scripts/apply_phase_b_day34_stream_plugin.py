#!/usr/bin/env python3
"""Phase B Day 34: stream (SSE) path plugin force-route parity with non-stream FORCE_PLUGIN.
Does not change Groq/search/embedding or non-stream chat.
"""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "PHASE_B_DAY34" in t:
        print("already applied")
        return

    old = '''      const decision = await quantumSemanticDecision(message, context, null);
      ultra.thinking("Reviewing your request and preparing a response.");
      if (decision.intent === "reminder") {'''

    new = '''      const decision = await quantumSemanticDecision(message, context, null);
      ultra.thinking("Reviewing your request and preparing a response.");
      // PHASE_B_DAY34 — stream path plugin force-route parity with non-stream FORCE_PLUGIN
      try {
        if (userId && userId !== "anonymous" && typeof getPluginToolsForUser === "function" && typeof matchPluginFromMessage === "function" && typeof executePluginNew === "function") {
          const tools = await getPluginToolsForUser(env2, userId, listIntegrations);
          const forced = matchPluginFromMessage(message, tools || []);
          if (forced && forced.scopes_ok !== false) {
            const pluginAction = forced.action || forced.tool;
            ultra.thinking("Using connected plugin: " + forced.app + "." + pluginAction);
            const pluginResult = await executePluginNew(env2, { userId }, { app: forced.app, action: pluginAction, params: {} });
            const steps = typeof buildPluginThinkingSteps === "function"
              ? buildPluginThinkingSteps({ message, tools: tools || [], matched: forced, result: pluginResult, phase: "forced" })
              : [];
            if (pluginResult && pluginResult.error === "reauth_required") {
              const msg = (pluginResult.message || "Please reconnect") + (pluginResult.reauth_url ? "\n" + pluginResult.reauth_url : "");
              ultra.chunk(msg);
              if (userId !== "anonymous") await addMessage(env2, ip, userId, sessionId, message, msg);
              ultra.done(msg, { intent: "execute_plugin", thinking_steps: steps, plugin: { app: forced.app, tool: pluginAction, result: pluginResult }, model: "plugin" });
              return;
            }
            if (pluginResult && pluginResult.success === false && pluginResult.error) {
              const failMsg = String(pluginResult.error);
              ultra.chunk(failMsg);
              if (userId !== "anonymous") await addMessage(env2, ip, userId, sessionId, message, failMsg);
              ultra.done(failMsg, { intent: "execute_plugin", thinking_steps: steps, plugin: { app: forced.app, tool: pluginAction, result: pluginResult }, model: "plugin" });
              return;
            }
            const rawData = pluginResult && pluginResult.data !== undefined ? pluginResult.data : pluginResult;
            const answerPrompt = typeof buildPluginAnswerPrompt === "function"
              ? buildPluginAnswerPrompt(message, forced.app, pluginAction, rawData)
              : ("User: " + message + "\nData: " + JSON.stringify(rawData).substring(0, 8000));
            let natural = null;
            try {
              const aiOut = await callGeminiOrGroq(answerPrompt, [{ role: "user", content: answerPrompt }], { temperature: 0.4, maxTokens: 1200, useWebSearch: false });
              natural = (aiOut && (aiOut.result || aiOut.text)) || null;
            } catch (e) {
              console.error("stream plugin answer", e && e.message);
            }
            if (!natural) {
              natural = typeof rawData === "string" ? rawData : JSON.stringify(rawData, null, 2).substring(0, 4000);
            }
            ultra.thinking("Writing answer from live plugin data");
            const parts = String(natural).match(/\S+\s*/g) || [String(natural)];
            fullResponse = "";
            for (const p of parts) {
              ultra.chunk(p);
              fullResponse += p;
            }
            if (userId !== "anonymous") {
              await addMessage(env2, ip, userId, sessionId, message, natural);
            }
            ultra.done(natural, {
              intent: "execute_plugin",
              thinking_steps: steps,
              plugin: { app: forced.app, tool: pluginAction, result: pluginResult },
              model: "plugin+llm",
              presentation: { version: 1, kind: "prose", features: { hasCode: false, hasTable: false, hasLinks: false, hasNumberedSteps: false, hasCitations: false, hasSources: false, hasArtifact: false, hasRelatedQuestions: false } }
            });
            return;
          }
        }
      } catch (pluginStreamErr) {
        console.error("stream plugin force", pluginStreamErr && pluginStreamErr.message);
      }
      if (decision.intent === "reminder") {'''

    if old not in t:
        raise SystemExit("anchor not found")
    t = t.replace(old, new, 1)
    p.write_text(t)
    assert "PHASE_B_DAY34" in t
    print("ok")

if __name__ == "__main__":
    main()
