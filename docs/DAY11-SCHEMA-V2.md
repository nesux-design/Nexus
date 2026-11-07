# Phase A / Day 11 — API Schema v2

## Success (chat)
Extra fields on every successful chat JSON:
- `schemaVersion: 2`
- `requestId` (UUID)
- `created` (ISO timestamp)
- `userId`
- existing: `role`, `plan`, `isPremium`, `usageToday`, `streamingAvailable`

## Errors
```json
{
  "success": false,
  "error": "human message",
  "code": "EMPTY_MESSAGE|USAGE_LIMIT|FEATURE_DISABLED|UNKNOWN_ACTION|...",
  "schemaVersion": 2,
  "requestId": "...",
  "created": "..."
}
```

Helpers: `newRequestId`, `buildSchemaV2Meta`, `apiError`.

Next (Day 12+): spread schema v2 to conversations, memory, image, premium_status.
