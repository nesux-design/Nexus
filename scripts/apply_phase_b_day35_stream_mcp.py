#!/usr/bin/env python3
"""Phase B Day 35: stream path MCP force-route parity."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "PHASE_B_DAY35" in t:
        print("already applied")
        return
    if "PHASE_B_DAY34" not in t:
        raise SystemExit("DAY34 required first")

    needle = (
        'console.error("stream plugin force", pluginStreamErr && pluginStreamErr.message);\n'
        "      }\n"
        '      if (decision.intent === "reminder") {'
    )
    if needle not in t:
        raise SystemExit("anchor not found")

    block = (
        "      // PHASE_B_DAY35 - stream path MCP force-route parity with non-stream\n"
        "      try {\n"
        '        if (userId && userId !== "anonymous" && typeof loadMcpToolsForUser === "function" && typeof matchMcpFromMessage === "function" && typeof callMcpTool === "function") {\n'
        "          const mcpPack = await loadMcpToolsForUser(env2, userId, { limit: 12 });\n"
        "          const mcpTools = (mcpPack && mcpPack.tools) || [];\n"
        "          const forcedMcp = matchMcpFromMessage(message, mcpTools);\n"
        "          if (forcedMcp && forcedMcp.connector && forcedMcp.name) {\n"
        '            ultra.thinking("Using connected MCP: " + forcedMcp.connector + "." + forcedMcp.name);\n'
        '            let mcpResult = { success: false, error: "call failed" };\n'
        "            try {\n"
        "              mcpResult = await callMcpTool(env2, userId, forcedMcp.connector, forcedMcp.name, {});\n"
        "            } catch (e) {\n"
        "              mcpResult = { success: false, error: e && e.message ? e.message : String(e) };\n"
        "            }\n"
        '            const steps = typeof buildMcpThinkingSteps === "function"\n'
        "              ? buildMcpThinkingSteps({ message, connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult })\n"
        "              : [];\n"
        "            if (mcpResult && mcpResult.oauth_required) {\n"
        '              const msg = (mcpResult.message || "Please reconnect MCP") + (mcpResult.reauth_url ? "\\n" + mcpResult.reauth_url : "");\n'
        "              ultra.chunk(msg);\n"
        '              if (userId !== "anonymous") await addMessage(env2, ip, userId, sessionId, message, msg);\n'
        '              ultra.done(msg, { intent: "execute_mcp", thinking_steps: steps, mcp: { connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult }, model: "mcp" });\n'
        "              return;\n"
        "            }\n"
        '            const answerPrompt = typeof buildMcpAnswerPrompt === "function"\n'
        "              ? buildMcpAnswerPrompt(message, forcedMcp.connector, forcedMcp.name, mcpResult)\n"
        '              : ("User: " + message + "\\nMCP " + forcedMcp.connector + "." + forcedMcp.name + " data:\\n" + JSON.stringify(mcpResult).substring(0, 8000));\n'
        "            let natural = null;\n"
        "            try {\n"
        "              const aiOut = await callGeminiOrGroq(answerPrompt, [{ role: \"user\", content: answerPrompt }], { temperature: 0.4, maxTokens: 1200, useWebSearch: false });\n"
        "              natural = (aiOut && (aiOut.result || aiOut.text)) || null;\n"
        "            } catch (e) {\n"
        '              console.error("stream mcp answer", e && e.message);\n'
        "            }\n"
        "            if (!natural) {\n"
        '              natural = typeof mcpResult === "string" ? mcpResult : JSON.stringify(mcpResult, null, 2).substring(0, 4000);\n'
        "            }\n"
        '            ultra.thinking("Writing answer from live MCP data");\n'
        "            const parts = String(natural).match(/\\S+\\s*/g) || [String(natural)];\n"
        '            fullResponse = "";\n'
        "            for (const p of parts) {\n"
        "              ultra.chunk(p);\n"
        "              fullResponse += p;\n"
        "            }\n"
        '            if (userId !== "anonymous") {\n'
        "              await addMessage(env2, ip, userId, sessionId, message, natural);\n"
        "            }\n"
        "            ultra.done(natural, {\n"
        '              intent: "execute_mcp",\n'
        "              thinking_steps: steps,\n"
        "              mcp: { connector: forcedMcp.connector, tool: forcedMcp.name, result: mcpResult },\n"
        '              model: "mcp+llm"\n'
        "            });\n"
        "            return;\n"
        "          }\n"
        "        }\n"
        "      } catch (mcpStreamErr) {\n"
        '        console.error("stream mcp force", mcpStreamErr && mcpStreamErr.message);\n'
        "      }\n"
    )

    repl = (
        'console.error("stream plugin force", pluginStreamErr && pluginStreamErr.message);\n'
        "      }\n"
        + block
        + '      if (decision.intent === "reminder") {'
    )
    p.write_text(t.replace(needle, repl, 1))
    assert "PHASE_B_DAY35" in p.read_text()
    print("ok")

if __name__ == "__main__":
    main()
