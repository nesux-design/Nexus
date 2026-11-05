# Day 1 — API notes (real worker behavior)

Base: `POST https://nexus-a1.apikeyakhilka.workers.dev/api`

Headers:
- `Content-Type: application/json`
- `X-API-Key` — legacy/admin path (set `NEXUS_LEGACY_API_KEY` in Worker secrets for production)
- `X-User-ID` — user scoping for sessions/integrations

## Actions verified in production use

| action | body | success | notes |
|--------|------|---------|-------|
| `chat` | `message` (required) | JSON `response`, `model`, `intent`, `latency` | Empty message → 400 `EMPTY_MESSAGE`. Provider total failure → honest error text, not a greeting. |
| `image_generate` | `message` (prompt) | Binary image (`image/jpeg` or png) or JSON error | |
| `qr_generate` | `text` or `data` or `message` or `content` | `image/png` binary | Prefer `text` for clarity. |
| `translate` | `message` or `text`, `targetLanguage` | JSON translation fields | |
| `reminder` | `message`, `timeText` | JSON success + reminderId | |
| `health` | `{}` | status/version | |
| `integration_status` | `{}` | connected integrations | |
| `mcp_connectors` | `{}` | connector catalog when wired | |

## Roles (product direction)

- **normal** — standard models/limits (existing premium flags in worker)
- **premium** — `auth.isPremium` paths already branch quality/priority in places
- **admin** — legacy API key / elevated paths; do not ship shared keys in public apps

Day-1 code changes: honest model fallback, QR field aliases, empty chat guard only.
