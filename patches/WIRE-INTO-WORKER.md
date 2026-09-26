# Nexus A1 — MCP-style connector phases 1–8 wire-in

This is the minimal worker.ts wiring for the MCP-style connector layer. It does not modify or replace nexus-mcp-server.

## Wire points

1. Import the five connector helpers from ./connector-mcp-phases.js.
2. In discordFullControl, use Bearer instead of Bot for the existing user OAuth token in both normal requests and send_file.
3. In metaThinking2026, load connected tools with getMcpStyleTools(env, userId, listIntegrations), append formatMcpStyleToolsForThinking output to reasoning, and return connected_tools.
4. executePluginNew reads the existing user_integrations access token and calls runConnectorApiAction. HTTP 401 becomes reauthPayload(app, userId, CONFIG.WORKER_URL).
5. handleChatAction checks matchConnectorToolFromMessage(message, thinking.connected_tools || []) immediately after metaThinking2026 and auto-executes a matched scoped connector tool.
6. integration_status keeps its existing fields and adds mcp_tools and connected_apps.
7. No environment variable names are changed or added. Existing TWITCH_CLIENT_ID is reused.
8. The MCP server is not edited. Existing executePluginFull is not replaced.

Only these three repository paths are part of this change:
- connector-mcp-phases.js
- patches/WIRE-INTO-WORKER.md
- worker.ts
