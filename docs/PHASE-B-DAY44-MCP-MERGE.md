# Phase B Day 44

## Bug
`ensureMcpToolsForMessage` returned early when **any** MCP tools were already loaded. So if GitHub (or another connector) filled `mcp_tools`, a message like `cloudflare whoami` never merged Cloudflare tools → force-route missed → `general_chat` tutorial.

## Fix
- **Merge** named connectors from the user message into the existing tool list (no early-return).
- Skip re-fetch only when that **same** connector already has tools.
- Aliases: `cf` → cloudflare, `gh` → github, `jira`/`confluence` → atlassian, plus asana/canva/zoom/hubspot/salesforce/airtable/telegram.
- `matchMcpFromMessage` returns `inputSchema` so Day 42 arg extraction works on force-route.
- Small docs/search score boost.

## Safety
Surgical `mcp-client.js` only. No PLACEHOLDER. worker.ts unchanged.

## Regression
- `cloudflare whoami` → `execute_mcp` + live identity
- `cloudflare docs search workers kv` → `execute_mcp` + sources

## Test
```bash
curl -s -X POST "https://nexus-a1.apikeyakhilka.workers.dev/api" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" \
  -H "X-User-ID: test_user1" \
  -d '{"action":"chat","message":"cloudflare whoami — mera connected identity batao"}' \
| python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('intent'), (d.get('response') or '')[:100])"
```
