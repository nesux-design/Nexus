# Phase A / Day 20 — SSE contract v2

## Enable
Header or body: `X-Stream-Mode: sse` (or `v2`, `typing`, `quantum`, …)

## Event types (`data: {json}`)
| type | meaning |
|------|--------|
| `init` | `protocol: nexus-sse-v2`, `schemaVersion: 2`, `requestId` |
| `thinking` | intermediate rationale |
| `token` | text delta (primary) |
| `chunk` | same as token (compat) |
| `search` | optional live search snippet |
| `done` | fullResponse + stats + schemaVersion + requestId |
| `[DONE]` | stream end sentinel |

## Stream path parity
Streaming now loads **conversation history** (`body.conversationId`) and **explicit memory** into context (same as non-stream chat).

## Test
```bash
curl -N -X POST "https://nexus-a1.apikeyakhilka.workers.dev/api" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" \
  -H "X-User-ID: test_user1" \
  -H "X-Stream-Mode: sse" \
  -d '{"action":"chat","message":"Say hi in 5 words"}'
```
Expect: init (schemaVersion 2) → thinking → token(s) → done → [DONE]
