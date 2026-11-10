# Phase B / Day 31 — Tool router wiring

## Problem
`worker.ts` referenced `getPluginToolsForUser`, `buildPluginThinkingSteps`, `matchPluginFromMessage`, `loadMcpToolsForUser`, etc. via `typeof ... === "function"` checks, but **never imported** `oauth-plugins.js` / `mcp-client.js`. Those branches were always no-ops.

## Fix
ESM imports at the top of `worker.ts` so Wrangler bundles the real implementations.

## Expected behavior after deploy
- Chat about Discord/Spotify/etc. can force-route via `matchPluginFromMessage`
- `thinking_steps` can be non-empty Claude-style steps
- MCP tools load via `loadMcpToolsForUser`

## Test
```bash
curl -s -X POST ".../api" -H "X-API-Key: ..." -H "X-User-ID: test_user1" \
  -H "Content-Type: application/json" \
  -d '{"action":"chat","message":"mere discord servers dikhao"}'
```
Look for `thinking_steps` and/or plugin execution when Discord is connected.
