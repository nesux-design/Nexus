# Phase A / Day 14 — Chat thread model

## Behavior
- Optional `conversationId` on `action: chat`
- If provided: load last 20 messages into context as **Conversation history**
- After answer: append user + assistant turns; save via MemorySystem (KV/Supabase)
- If omitted: create new thread (respect plan conversation cap); return new `conversationId`
- Response fields: `conversationId`, `conversationTitle` (+ schema v2)

## Test
```bash
# new thread
curl ... -d '{"action":"chat","message":"My name is Akhil"}'
# resume with returned conversationId
curl ... -d '{"action":"chat","conversationId":"...","message":"What is my name?"}'
```
