# Day 8 — Feature flag enforcement

`rejectIfFeatureDisabled` runs at the start of `handleAction`.

| Flag | Actions |
|------|---------|
| chat | chat |
| voice | voice |
| image_generate | image_generate, real_photo, image_edit, image_enhance |
| memory | memory_* |
| conversations | conversations_* |
| plugins | execute_plugin, integration_* |
| mcp | mcp_* |

Disabled → `403` `{ code: "FEATURE_DISABLED", flag, action }`

Admin can toggle via `admin_set_feature_flag` (Day 7).
