# MCP gateway on Nexus A1

## On GitHub now
- `mcp-client.js`
- `mcp-gateway-connectors.js` (35 connectors)
- `patches/worker-mcp-api-only.patch` — adds API actions to worker.ts

## Deploy (required — live worker is still old)

```bash
cd Nexus
git pull origin main
patch -p1 < patches/worker-mcp-api-only.patch
# secret must match nexus-mcp-server
npx wrangler secret put NEXUS_INTERNAL_AUTH_SECRET --name nexus-a1
npx wrangler deploy
```

## Test after deploy

```bash
curl -s -X POST "https://nexus-a1.apikeyakhilka.workers.dev/api" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" \
  -H "X-User-ID: test_user1" \
  -d '{"action":"mcp_connectors"}'
```

Other actions: `mcp_oauth_start`, `mcp_tools_list`, `mcp_tools_call`.

Chat auto-routing of MCP tools needs the larger chat wire (next); API path works after this patch + deploy.
