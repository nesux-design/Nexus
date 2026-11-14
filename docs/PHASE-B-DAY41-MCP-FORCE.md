# Phase B Day 41

## Bug
When any MCP tools were already loaded (e.g. another connector authorized), the Day 39/40 oauth probe required `mcp_tools.length === 0` and **skipped** Cloudflare (and other named connectors). Chat fell back to `general_chat` CLI tutorial instead of `execute_mcp` + reauth URL.

## Fix
- Non-stream + stream: probe named connectors even if other tools exist
- `listMcpTools` / `callMcpTool`: treat `provider_authorization_required` as oauth_required

## Safety
No PLACEHOLDER writes. esbuild smoke. Aborts if worker invalid.

## Test
```bash
curl -s -X POST "$A1/api" -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"chat","message":"cloudflare whoami — mera connected identity batao"}'
```
Expect `intent: execute_mcp` with live data **or** authorize URL (not CLI tutorial).
