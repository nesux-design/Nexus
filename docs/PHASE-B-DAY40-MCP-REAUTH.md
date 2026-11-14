# Phase B Day 40 — MCP reauth URL + stream parity

## Goal
When MCP OAuth is missing, return Claude-style authorize URL (not CLI tutorial). Stream path matches non-stream.

## Safety
- Apply script restores day39 if worker is PLACEHOLDER/short
- Refuses to commit PLACEHOLDER
- esbuild smoke before commit

## Test after deploy
```bash
curl -s -X POST "$A1/api" -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"chat","message":"cloudflare whoami — mera connected identity batao"}'
```
Expect `intent: execute_mcp` + live identity **or** `mcp.authorize_url`.
