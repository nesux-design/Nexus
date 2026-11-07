# Day 9 — web_search feature flag

When `web_search` is false (global or per-user via `admin_set_feature_flag`):
- Chat still works
- Live web search is **skipped** (context note added)
- No fake search results

Toggle:
```json
{"action":"admin_set_feature_flag","key":"web_search","value":false,"userId":"test_user1"}
{"action":"admin_set_feature_flag","key":"web_search","value":true,"userId":"test_user1"}
```
