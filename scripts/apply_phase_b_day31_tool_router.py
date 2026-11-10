#!/usr/bin/env python3
"""Phase B Day 31: import plugin/MCP helpers so tool router is real, not dead typeof checks."""
from pathlib import Path

IMPORTS = '''
// PHASE_B_DAY31_TOOL_ROUTER — bind Claude-style plugin + MCP helpers into the Worker bundle
import {
  PLUGIN_TOOL_REGISTRY,
  getPluginToolsForUser,
  pluginToolsToGeminiDeclarations,
  pluginToolsToOpenAITools,
  formatPluginsForThinking,
  buildPluginThinkingSteps,
  thinkingStepsToText,
  matchPluginFromMessage,
  executePluginLayer,
  runPluginApi,
  reauthPayload,
  parsePluginFunctionName
} from \./oauth-plugins.js\;

import {
  loadMcpToolsForUser,
  matchMcpFromMessage,
  mcpToolsToGeminiDeclarations,
  mcpToolsToOpenAITools,
  buildMcpThinkingSteps,
  formatMcpForThinking,
  mcpFunctionName,
  parseMcpFunctionName,
  listMcpConnectors,
  listMcpTools,
  callMcpTool,
  getMcpOAuthStart
} from \./mcp-client.js\;

'''.replace('\\./', './').replace('\\;', ';')

def main():
    p = Path("worker.ts")
    t = p.read_text()
    if "PHASE_B_DAY31_TOOL_ROUTER" in t:
        print("already applied")
        return

    # Insert after initial file comment block (before Env interface or first code)
    markers = [
        "// ── Cloudflare bindings",
        "interface Env",
        "type Env",
        "const CONFIG",
        "var CONFIG",
    ]
    insert_at = None
    for m in markers:
        i = t.find(m)
        if i > 0:
            insert_at = i
            break
    if insert_at is None:
        # after first block comment
        i = t.find("*/")
        if i < 0:
            raise SystemExit("no insert point")
        insert_at = i + 2
        while insert_at < len(t) and t[insert_at] in "\r\n":
            insert_at += 1

    imports = """\n// PHASE_B_DAY31_TOOL_ROUTER — bind Claude-style plugin + MCP helpers into the Worker bundle\nimport {\n  PLUGIN_TOOL_REGISTRY,\n  getPluginToolsForUser,\n  pluginToolsToGeminiDeclarations,\n  pluginToolsToOpenAITools,\n  formatPluginsForThinking,\n  buildPluginThinkingSteps,\n  thinkingStepsToText,\n  matchPluginFromMessage,\n  executePluginLayer,\n  runPluginApi,\n  reauthPayload,\n  parsePluginFunctionName\n} from \"./oauth-plugins.js\";\n\nimport {\n  loadMcpToolsForUser,\n  matchMcpFromMessage,\n  mcpToolsToGeminiDeclarations,\n  mcpToolsToOpenAITools,\n  buildMcpThinkingSteps,\n  formatMcpForThinking,\n  mcpFunctionName,\n  parseMcpFunctionName,\n  listMcpConnectors,\n  listMcpTools,\n  callMcpTool,\n  getMcpOAuthStart\n} from \"./mcp-client.js\";\n\n"""

    t = t[:insert_at] + imports + t[insert_at:]

    # Ensure thinking_steps flow into chat JSON response if missing
    if "thinking_steps: thinking.thinking_steps" not in t and "thinking_steps:" in t:
        # try attach on main chat return near connected_tools
        old = "connected_tools: thinking.connected_tools || []"
        if old in t and "thinking_steps: thinking.thinking_steps" not in t:
            t = t.replace(
                old,
                old + ",\n    thinking_steps: thinking.thinking_steps || []",
                1,
            )

    p.write_text(t)
    assert "PHASE_B_DAY31_TOOL_ROUTER" in t
    assert 'from "./oauth-plugins.js"' in t
    assert 'from "./mcp-client.js"' in t
    print("ok")

if __name__ == "__main__":
    main()
