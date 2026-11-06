# Day 2 — Usage hooks (free / premium / admin)

Existing engine (unchanged logic):
- `PREMIUM_TIERS_2026` — daily caps per plan (`messages`, `images`, `voice`, ...)
- `checkUsageLimit2026(env, userId, type)` — KV counter, admin bypass, increments on allow
- Already enforced on: **chat messages**, **images**, **fileAnalysis**

Day-2 additions:
1. `getUsageSnapshot2026` — read-only used/limit/remaining for today (no increment)
2. `premium_status` returns `usageToday`, `usageDate`, `role` (`free` | `premium` | `admin`)
3. **Voice** path enforces `checkUsageLimit2026(..., "voice")` → 403 when over limit

## Test

```bash
curl -s -X POST "$API" -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"premium_status"}'
```

Expect JSON with `limits` + `usageToday.messages|images|voice`.
""
