# MCP on Nexus A1 (phone / Termux)

Live worker still needs this patch once, then deploy.

## Termux (3 steps)

```bash
cd ~/Nexus   # or your clone path
git pull origin main
bash scripts/termux-apply-mcp.sh
```

Or manual:

```bash
cd ~/Nexus && git pull
curl -sL https://raw.githubusercontent.com/nesux-design/Nexus/main/patches/worker-mcp-full.patch.b64 | tr -d '\n' | base64 -d > /tmp/w.patch
patch -p1 < /tmp/w.patch
npx wrangler secret put NEXUS_INTERNAL_AUTH_SECRET   # same as MCP server
npx wrangler deploy
```

## Test

```bash
curl -s -X POST "https://nexus-a1.apikeyakhilka.workers.dev/api" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" \
  -H "X-User-ID: test_user1" \
  -d '{"action":"mcp_connectors"}'
```

Need files: `mcp-client.js`, `mcp-gateway-connectors.js` (already on main).
