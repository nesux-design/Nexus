# Phase A / Day 23 — Rate limit headers

## On success (chat / SSE)
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset` (unix ms)

## On 429
Body (schema v2):
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "schemaVersion": 2,
  "retryAfter": 42,
  "scope": "user|ip",
  "limit": 2000,
  "remaining": 0,
  "reset": 1234567890
}
```
Headers: `Retry-After`, `X-RateLimit-*`

## Test
```bash
curl -sI -X POST ".../api" -H "X-API-Key: ..." -H "X-User-ID: test_user1" \
  -H "Content-Type: application/json" \
  -d '{"action":"chat","message":"ping"}'
```
Look for `X-RateLimit-Remaining`.
