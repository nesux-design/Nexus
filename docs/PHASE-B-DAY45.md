# Phase B Day 45

## Goal
Single source of truth for MCP re-auth URLs so stream and non-stream paths stay in sync (Claude-style connect UX).

## Change
- `mcp-client.js` `callMcpTool`: on `oauth_required` / 401, call `getMcpOAuthStart` once and attach `authorize_url`.
- `listMcpTools`: same for tools/list failures that need OAuth.
- `worker.ts`: prefer `mcpResult.authorize_url` before a second OAuth probe.

## Not in scope
- Silent token refresh inside `nexus-mcp-server` (Day 46+).
- Model IDs / search chain.

## Test
```bash
curl -s -X POST "https://nexus-a1.apikeyakhilka.workers.dev/api" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" \
  -H "X-User-ID: test_user1" \
  -d '{"action":"chat","message":"cloudflare whoami"}' \
| python3 -c "import sys,json;d=json.load(sys.stdin);print('intent',d.get('intent'));print((d.get('response') or '')[:240])"
```
