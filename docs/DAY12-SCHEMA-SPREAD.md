# Day 12 — Schema v2 spread

- `EMPTY_MESSAGE` early chat guard → `apiError` (full v2)
- `conversations_list` success → schemaVersion, requestId, created, userId
- `memory_list` success → same
- `premium_status` (admin + user) → same
- `USER_REQUIRED` on conversations_list → `apiError`
