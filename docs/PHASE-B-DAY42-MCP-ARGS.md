# Phase B Day 42

## Goal
When force-routing MCP tools, do not always call with `{}`.
Extract simple args from the user message (Claude-style):
- `whoami` / identity tools: still no args
- tools with schema `query` / `search` / `docs`: fill from message text

## Safety
Surgical patch only. No PLACEHOLDER. esbuild smoke. Idempotent.

## Regression
Cloudflare whoami must still return live identity (`intent: execute_mcp`).

## Test
```bash
# still works
curl -s -X POST "$A1/api" -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"chat","message":"cloudflare whoami — mera connected identity batao"}'

# docs-style query (when authorized)
curl -s -X POST "$A1/api" -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"chat","message":"cloudflare docs search workers kv"}'
```
