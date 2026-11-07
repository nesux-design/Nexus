# Day 7 — Chat usage meta + feature flags

## Chat response (extra fields)
- `role`: free | premium | admin
- `usageToday`: same shape as `premium_status` (after this message counted)

## Feature flags
Defaults (all true): chat, image_generate, voice, web_search, plugins, mcp, memory, conversations

```bash
# Any user
{"action":"feature_flags"}

# Admin only
{"action":"admin_set_feature_flag","key":"web_search","value":false}           # global
{"action":"admin_set_feature_flag","key":"image_generate","value":false,"userId":"test_user1"}
```
