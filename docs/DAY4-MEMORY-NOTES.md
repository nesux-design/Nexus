# Day 4 — Explicit memory tiers (free / premium / admin)

| Role / plan | Max explicit memories |
|-------------|----------------------|
| free | 20 |
| plus / isPremium | 100 |
| pro / enterprise | 500 |
| admin | unlimited |

Actions (require `X-User-ID`):
- `memory_save` `{ "fact": "..." }` → may return `MEMORY_LIMIT`
- `memory_list` → `{ memories, total, limit, plan, role }`
- `memory_forget` `{ "memoryId": "..." }`

Tied to existing `MemorySystem` KV keys `explicit_memory:{userId}` — no placeholder storage.
