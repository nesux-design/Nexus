# MCP gateway in Nexus A1

- `mcp-gateway-connectors.js` — full catalog (35 connectors) from nexus-mcp-server
- `mcp-client.js` — HMAC client, tools/list, tools/call, oauth start, Gemini/OpenAI decls
- `worker.ts` — loads MCP tools in metaThinking, function-calling `mcp_*`, execute_mcp path, API:
  - action `mcp_connectors`
  - action `mcp_oauth_start` { connector }
  - action `mcp_tools_list` { connector }
  - action `mcp_tools_call` { connector, name, arguments }

Requires secret `NEXUS_INTERNAL_AUTH_SECRET` (same as MCP server) on nexus-a1.
Service binding `NEXUS_MCP_SERVER` already in wrangler.toml.
