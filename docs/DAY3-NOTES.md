# Day 3 — Auth user isolation, search quota, conversations

## Fixes

1. **Legacy API auth userId**
   - If `NEXUS_LEGACY_API_KEY` is set → key must match + `X-User-ID` binds that user.
   - If secret is **not** set → non-empty `X-API-Key` + `X-User-ID` still binds user (dev/worker clients).
   - Stops all traffic collapsing into `userId: null` (usage/conversations leakage).

2. **Search daily limit**
   - AI still decides `needsSearch`.
   - Before `performWebSearch`, `checkUsageLimit2026(..., "search")`.
   - Over limit → search skipped with context note (no fake results).

3. **Conversations**
   - list/save/delete/search require real `userId` (not missing/anonymous) → `401 USER_REQUIRED`.

## Test

```bash
curl -s -X POST "$API" -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"premium_status"}'
# expect userId: "test_user1"

curl -s -X POST "$API" -H "Content-Type: application/json" \
  -H "X-API-Key: akhil-123" -H "X-User-ID: test_user1" \
  -d '{"action":"conversations_list"}'
```
