# NEXUS A1 — API Contract v1 (Phase A freeze)

**Base:** `POST https://nexus-a1.apikeyakhilka.workers.dev/api`  
**Auth headers:** `X-API-Key`, `X-User-ID`  
**Content-Type:** `application/json`  
**Schema:** `schemaVersion: 2` on success/error envelopes where applied.

This document freezes the **backend product spine** after Phase A (Days 11–30). Frontend should target this contract; additive fields are OK, removals are not without a major version bump.

---

## Common success fields (schema v2)

| Field | Type | Notes |
|-------|------|--------|
| `schemaVersion` | number | `2` |
| `requestId` | string | UUID per request |
| `created` | string | ISO timestamp |
| `userId` | string\|null | Bound user |
| `role` | string | `free` \| `premium` \| `admin` |
| `plan` | string | e.g. `free` |
| `usageToday` | object | When relevant (chat, premium_status) |
| `conversationId` | string\|null | Chat threads |
| `conversationTitle` | string\|null | Chat threads |

## Common error envelope

```json
{
  "success": false,
  "error": "human message",
  "code": "EMPTY_MESSAGE",
  "schemaVersion": 2,
  "requestId": "...",
  "created": "..."
}
```

### Error codes

| Code | HTTP | Meaning |
|------|------|--------|
| `EMPTY_MESSAGE` | 400 | Chat message empty |
| `UNKNOWN_ACTION` | 400 | Unknown `action` |
| `USER_REQUIRED` | 401 | Valid `X-User-ID` required |
| `ADMIN_REQUIRED` | 403 | Admin-only action |
| `FEATURE_DISABLED` | 403 | Feature flag off |
| `USAGE_LIMIT` | 403 | Daily plan quota |
| `MEMORY_LIMIT` | 403 | Explicit memory cap |
| `CONVERSATION_LIMIT` | 403 | Conversation cap |
| `VOICE_LIMIT` | 403 | Voice quota |
| `RATE_LIMITED` | 429 | Per-minute rate limit |

### Rate limit headers (success + 429)

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset` (unix ms)
- `Retry-After` (on 429)

---

## Actions (v1 catalog)

### Core chat / media
| action | Purpose |
|--------|--------|
| `chat` | Text chat; optional `conversationId`, `tts`, stream via `X-Stream-Mode` |
| `voice` | Voice pipeline |
| `image_generate` / `real_photo` / `image_edit` / `image_enhance` | Image |
| `qr_generate` | QR |
| `file_analysis` | Files |
| `translate` / `youtube` / `shopping` / `code_help` / `canvas` / `reminder` | Utilities |

### Account / limits
| action | Purpose |
|--------|--------|
| `premium_status` | Plan + `usageToday` |
| `premium_request` / `premium_verify` / `premium_plans` | Billing flow |
| `user_profile` | Profile |
| `feature_flags` | Effective flags |
| `admin_set_feature_flag` | Admin toggle (audited) |
| `admin_audit_list` | Admin audit log |

### Memory / conversations
| action | Purpose |
|--------|--------|
| `memory_save` / `memory_list` / `memory_forget` | Explicit memory (injected into model context) |
| `conversations_list` / `conversations_save` / `conversations_delete` / `conversations_search` | Threads |

### Plugins / MCP
| action | Purpose |
|--------|--------|
| `integration_status` / `integration_connect` / `integration_disconnect` / `execute_plugin` | OAuth plugins |
| `mcp_connectors` / `mcp_oauth_start` / `mcp_tools_list` / `mcp_tools_call` | MCP gateway |
| `mcp_custom_*` | Custom MCP URL connectors |

### Ops
| action | Purpose |
|--------|--------|
| `health` | Liveness |
| `clear_session` | Clear session |
| `agents_list` / `image_gallery` | Lists |

---

## Chat (`action: chat`)

**Body:** `{ "action": "chat", "message": "...", "conversationId": optional }`

**Behavior:**
- Empty message → `EMPTY_MESSAGE`
- Auto-creates/resumes `conversationId` (thread model)
- Injects explicit memory into model context
- Returns schema v2 + `usageToday`

**Streaming:** header `X-Stream-Mode: sse` (or `v2`, `typing`, `quantum`)

SSE events: `init` → `thinking` → `token`/`chunk` → `done` → `[DONE]`  
Protocol: `nexus-sse-v2`, `schemaVersion: 2`

---

## Feature flags

Keys: `chat`, `voice`, `image_generate`, `web_search`, `memory`, `conversations`, `plugins`, `mcp`

- Disabled hard gates → `FEATURE_DISABLED` (except `web_search` which skips search only)

---

## Contract rules for frontend

1. Always send `X-API-Key` + `X-User-ID`.
2. Prefer `code` over parsing `error` strings.
3. Treat unknown JSON fields as forward-compatible.
4. Do not rely on search running for greetings (`searchPerformed` is honest).
5. Threads: store `conversationId` client-side to resume.

**Contract version:** `v1` — frozen end of Phase A.  
**Next phases:** B tools/MCP depth, C multimodal reliability, D answer quality.
