# Phase B / Day 40 — MCP reauth URL + stream parity

## Goal
When an MCP connector needs OAuth, return a **Claude/Grok-style** response with a real `authorize_url` (via `getMcpOAuthStart`), never a CLI tutorial or bare "Please reconnect".

## Changes
1. **Stream path** (`X-Stream-Mode: sse`): same named-connector oauth probe as Day 39 non-stream; on 401, emit authorize URL in the stream `done` metadata.
2. **Stream / non-stream** `oauth_required` after `callMcpTool`: always resolve `getMcpOAuthStart` and put `mcp.authorize_url` on the envelope.
3. **Named connectors** expanded: atlassian, asana, canva (plus existing cloudflare, github, vercel, …).

## Safety
- Does not change chat / image / plugins / memory / search paths.
- Only touches MCP force-route + reauth messaging.

## Test
```bash
curl -s -X POST "https://nexus-a1.apikeyakhilka.workers.dev/api" \
  -H "Content-Type: application/json" -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"chat","message":"cloudflare whoami — mera connected identity batao"}'

curl -N -s -X POST "https://nexus-a1.apikeyakhilka.workers.dev/api" \
  -H "Content-Type: application/json" -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -H "X-Stream-Mode: sse" \
  -d '{"action":"chat","message":"cloudflare whoami"}'
```
Expect `intent: execute_mcp` and either live email/id **or** `mcp.authorize_url` when token missing.
