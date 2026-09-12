# NEXUS AI ↔ MCP gateway bind

## Status
- **Live** `nexus-a1` worker: still healthy (service binding `NEXUS_MCP_SERVER` already present).
- **Do not deploy** from GitHub until `worker.ts` is restored from commit `03c752a`.
- Shared secret `NEXUS_INTERNAL_AUTH_SECRET` is set on both `nexus-a1` and `nexus-mcp-server`.

## Restore worker.ts (required before next deploy)

```bash
cd Nexus
git fetch origin
git show 03c752a08dff18c9c58a23bb5923a1471a30807d:worker.ts > worker.ts
git add worker.ts
git commit -m "fix: restore worker.ts"
git push origin main
```

## Then apply MCP gateway bind

1. Paste helpers from `docs/MCP_GATEWAY_BIND_SNIPPET.ts` **immediately before** `async fetch(request: Request, env2: Env, ...)`
2. Inside `fetch`, **right after** `pathname` / `ip` are set and **before** `/health`, add the routes block from the same snippet file (search for `MCP gateway (catalog + custom MCP connect)`).
3. Deploy: `npx wrangler deploy`

## Product routes (after bind)

| Path | Purpose |
|------|---------|
| `/connectors` | NEXUS Connectors UI (add custom MCP server) |
| `/api/mcp/connectors` | Catalog from MCP worker |
| `/api/mcp/custom` | List/add custom MCP URLs |
| `/api/mcp/custom/:id/probe` | Probe upstream (forwards real OAuth challenge) |
| `/mcp/*` | Proxy to MCP gateway |

UI copy uses only **NEXUS** branding.
