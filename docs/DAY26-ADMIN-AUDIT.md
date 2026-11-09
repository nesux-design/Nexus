# Phase A / Day 26 — Admin audit log

## Storage
- D1 table `audit_log` (id, actor_user_id, action, target, meta, created_at)
- KV fallback `audit:recent` (last 200)

## Logged
- `admin_set_feature_flag` (on success)

## Read
```json
{"action":"admin_audit_list","limit":50}
```
Admin only (`isAdmin` / akhil / 8681361916).

## Test
1. Set a flag as admin
2. `admin_audit_list` → see entry
