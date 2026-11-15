# Phase B Day 43

## Goal
When MCP tools return documentation / URLs (e.g. Cloudflare `docs`), populate response `sources` and set `presentation.features.hasSources / hasLinks / hasCitations` — Claude/ChatGPT style citations envelope.

## Safety
Surgical only. No PLACEHOLDER. Idempotent. esbuild smoke.

## Regression
- `cloudflare whoami` still live identity
- `cloudflare docs search workers kv` still execute_mcp + now non-empty `sources`

## Test
```bash
curl -s -X POST "$A1/api" -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"chat","message":"cloudflare docs search workers kv"}' | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('intent'), len(d.get('sources') or []), (d.get('sources') or [])[:2])"
```
