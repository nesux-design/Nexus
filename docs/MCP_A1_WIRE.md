# MCP gateway wired into Nexus A1 (Claude/Grok style)

## Already on `main`
| File | Purpose |
|------|--------|
| `mcp-gateway-connectors.js` | All **35** nexus-mcp-server connectors |
| `mcp-client.js` | HMAC client: tools/list, tools/call, oauth start, model decls |
| `docs/MCP_A1_WIRE.md` | This guide |

## Apply worker wiring (required for chat)

Worker is large; apply the full patch from this chat’s artifact **or** hand-edit these points (same as Claude/Grok plugins):

1. **Import** `./mcp-client.js` next to `oauth-plugins.js`
2. **Env**: `NEXUS_INTERNAL_AUTH_SECRET`, `MCP_SERVER_URL`
3. **metaThinking2026**: `loadMcpToolsForUser` → pass MCP decls into `resolveToolIntent`
4. **resolveViaGemini / OpenAI**: handle `mcp_*` → `execute_mcp`
5. **handleChatAction**: `execute_mcp` block (callMcpTool + natural answer)
6. **API cases**: `mcp_connectors`, `mcp_oauth_start`, `mcp_tools_list`, `mcp_tools_call`

### One-liner after you have `worker-mcp-full.patch`
```bash
cd Nexus && git pull
# save full patch as patches/worker-mcp-gateway.patch then:
patch -p1 < patches/worker-mcp-gateway.patch
npx wrangler deploy
```

### Secret (nexus-a1)
```bash
npx wrangler secret put NEXUS_INTERNAL_AUTH_SECRET --name nexus-a1
# SAME value as nexus-mcp-server
```

Service binding `NEXUS_MCP_SERVER` is already in `wrangler.toml`.

## API test
```bash
curl -s -X POST "https://nexus-a1.apikeyakhilka.workers.dev/api" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" \
  -H "X-User-ID: test_user1" \
  -d '{"action":"mcp_connectors"}'
```

## Chat (after deploy)
- Plugins (Discord/Spotify…) stay as before
- MCP (Cloudflare, GitHub MCP, Telegram bridge, …) via `mcp_*` tools
- Telegram: already connected on MCP server; A1 can call through gateway once worker patched + secret set

## Commits
- `338e58b` catalog
- `ec759f6` mcp-client
- `f11ca17` docs + partial patch placeholder
