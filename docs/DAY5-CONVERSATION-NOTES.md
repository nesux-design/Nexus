# Day 5 — Conversation retention by plan

| Plan / role | Max conversations | Max messages kept per conversation |
|-------------|-------------------|-------------------------------------|
| free | 10 | 40 |
| plus / premium | 50 | 200 |
| pro / enterprise | 200 | 500 |
| admin | unlimited | unlimited |

- **New** conversation (no `conversationId`) blocked with `403 CONVERSATION_LIMIT` when over cap.
- **Update** existing conversation still allowed; messages trimmed to plan message cap.
- `conversations_list` returns `total`, `limit`, `plan`, `role`.
