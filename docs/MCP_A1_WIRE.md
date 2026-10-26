# MCP gateway wired into Nexus A1

## Committed files
- `mcp-gateway-connectors.js` — all 35 nexus-mcp-server connectors (catalog)
- `mcp-client.js` — HMAC client: list/call tools, oauth start, model tool decls
- `patches/worker-mcp-gateway.patch` — worker.ts chat + API wiring

## Apply worker patch + deploy
```bash
cd Nexus
git pull
git apply patches/worker-mcp-gateway.patch
# if conflicts, use full worker from Grok artifacts or re-apply sections in docs
npx wrangler deploy
```

## Required secret on nexus-a1
`NEXUS_INTERNAL_AUTH_SECRET` = same value as on `nexus-mcp-server`

Service binding `NEXUS_MCP_SERVER` already in wrangler.toml.

## New API actions (POST /api)
| action | body |
|--------|------|
| mcp_connectors | — |
| mcp_oauth_start | `{ "connector": "github" }` |
| mcp_tools_list | `{ "connector": "telegram" }` |
| mcp_tools_call | `{ "connector": "telegram", "name": "telegram_get_me", "arguments": { "userId": "..." } }` |

## Chat behaviour
- Loads live MCP tools alongside OAuth plugins
- Model can call `mcp_{connector}_{tool}`
- Fallback keyword match (e.g. telegram / cloudflare)
- Thinking shows MCP gateway steps (Claude/Grok style)
