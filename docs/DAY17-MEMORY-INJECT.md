# Phase A / Day 17 — Explicit memory → model context

After thread history load, before `getSession`:

1. `listExplicitMemories()` for the user
2. Cap by plan (`getExplicitMemoryLimit`, max 50 lines in prompt)
3. Append to `sessionContext`:

```
**User memory (explicit facts):**
- fact1
- fact2
```

Works across chats (not only `conversationId` resume).

## Test
```bash
# save
curl ... -d '{"action":"memory_save","fact":"User favorite color is blue"}'
# new chat (no conversationId)
curl ... -d '{"action":"chat","message":"What is my favorite color?"}'
```
Expect answer blue from memory block, not only thread history.
