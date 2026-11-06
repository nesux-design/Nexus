# Day 6 — Conversation save reliability (KV fallback)

Problem: `conversations_save` returned `conversationId: null` when Supabase `createConversation` failed silently.

Fix:
- Always allocate an id (`crypto.randomUUID()` if new).
- Try Supabase create/patch first.
- On failure/empty → **KV fallback** (`conv_index:{userId}`, `conv_data:{userId}:{id}`).
- List merges Supabase + KV; delete clears both.

Plan limits from Day 5 still apply on save/list.
