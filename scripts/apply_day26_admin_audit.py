#!/usr/bin/env python3
"""Phase A Day 26: audit_log table + appendAuditLog + admin_audit_list."""
from pathlib import Path

HELPERS = '''
async function appendAuditLog(env2, entry) {
  const row = {
    id: typeof newRequestId === "function" ? newRequestId() : ("aud_" + Date.now()),
    actor_user_id: entry && entry.actor ? String(entry.actor) : null,
    action: entry && entry.action ? String(entry.action) : "unknown",
    target: entry && entry.target != null ? String(entry.target) : null,
    meta: entry && entry.meta != null ? JSON.stringify(entry.meta) : null,
    created_at: Date.now()
  };
  try {
    if (env2 && env2.DB) {
      await env2.DB.prepare(
        "INSERT INTO audit_log (id, actor_user_id, action, target, meta, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(row.id, row.actor_user_id, row.action, row.target, row.meta, row.created_at).run();
    }
  } catch (e) {
    console.error("audit D1 write failed", e && e.message);
  }
  try {
    if (env2 && env2.KV) {
      const key = "audit:recent";
      const existing = await env2.KV.get(key, { type: "json" }) || [];
      const next = [row, ...(Array.isArray(existing) ? existing : [])].slice(0, 200);
      await env2.KV.put(key, JSON.stringify(next), { expirationTtl: 60 * 60 * 24 * 30 });
    }
  } catch (e2) {
    console.error("audit KV write failed", e2 && e2.message);
  }
  return row;
}
async function listAuditLogs(env2, limit) {
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
  try {
    if (env2 && env2.DB) {
      const res = await env2.DB.prepare(
        "SELECT id, actor_user_id, action, target, meta, created_at FROM audit_log ORDER BY created_at DESC LIMIT ?"
      ).bind(lim).all();
      if (res && Array.isArray(res.results) && res.results.length) {
        return res.results.map((r) => ({
          id: r.id,
          actor: r.actor_user_id,
          action: r.action,
          target: r.target,
          meta: (() => { try { return r.meta ? JSON.parse(r.meta) : null; } catch (_) { return r.meta; } })(),
          createdAt: r.created_at
        }));
      }
    }
  } catch (e) {
    console.error("audit D1 list failed", e && e.message);
  }
  try {
    if (env2 && env2.KV) {
      const existing = await env2.KV.get("audit:recent", { type: "json" }) || [];
      return (Array.isArray(existing) ? existing : []).slice(0, lim).map((r) => ({
        id: r.id,
        actor: r.actor_user_id,
        action: r.action,
        target: r.target,
        meta: (() => { try { return typeof r.meta === "string" ? JSON.parse(r.meta) : r.meta; } catch (_) { return r.meta; } })(),
        createdAt: r.created_at
      }));
    }
  } catch (_) {}
  return [];
}
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "async function appendAuditLog" not in t:
        # place before apiError or after rateLimitHeaders
        if "function rateLimitHeaders" in t:
            t = t.replace("function rateLimitHeaders", HELPERS + "function rateLimitHeaders", 1)
        else:
            t = t.replace("function apiError", HELPERS + "function apiError", 1)
        changes.append("helpers")

    # D1 table
    old_table = '{ name: "error_logs", sql: "CREATE TABLE IF NOT EXISTS error_logs (id TEXT PRIMARY KEY, user_id TEXT, error_type TEXT, error_message TEXT, endpoint TEXT, created_at INTEGER)" },'
    new_table = old_table + '\n    { name: "audit_log", sql: "CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, actor_user_id TEXT, action TEXT, target TEXT, meta TEXT, created_at INTEGER)" },'
    if "name: \"audit_log\"" not in t and 'name: "audit_log"' not in t:
        if old_table not in t:
            raise SystemExit("error_logs table def not found")
        t = t.replace(old_table, new_table, 1)
        changes.append("d1-table")

    # admin_set_feature_flag audit
    old_flag = '''      const setResult = await setFeatureFlag(env2, scope, flagKey, flagValue);
      return new Response(JSON.stringify(setResult), { status: setResult.success ? 200 : 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    case "health":'''
    new_flag = '''      const setResult = await setFeatureFlag(env2, scope, flagKey, flagValue);
      if (setResult && setResult.success) {
        try {
          await appendAuditLog(env2, {
            actor: auth.userId,
            action: "admin_set_feature_flag",
            target: String(scope),
            meta: { key: flagKey, value: flagValue }
          });
        } catch (_) {}
      }
      return new Response(JSON.stringify({ ...setResult, schemaVersion: 2, requestId: newRequestId(), created: (/* @__PURE__ */ new Date()).toISOString() }), { status: setResult.success ? 200 : 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    case "admin_audit_list": {
      if (!isAdmin(auth.userId) && auth.userId !== "akhil" && auth.userId !== "8681361916") {
        return apiError("ADMIN_REQUIRED", "Admin only", 403);
      }
      const logs = await listAuditLogs(env2, body.limit || 50);
      return new Response(JSON.stringify({
        success: true,
        logs,
        total: logs.length,
        schemaVersion: 2,
        requestId: newRequestId(),
        created: (/* @__PURE__ */ new Date()).toISOString()
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    case "health":'''
    if "admin_audit_list" not in t:
        if old_flag not in t:
            raise SystemExit("admin_set_feature_flag return not found")
        t = t.replace(old_flag, new_flag, 1)
        changes.append("flag-audit+list")

    # availableActions array - add admin_audit_list if present
    if '"admin_set_feature_flag"' in t and '"admin_audit_list"' not in t:
        t = t.replace('"admin_set_feature_flag"', '"admin_set_feature_flag",\n          "admin_audit_list"', 1)
        changes.append("available-actions")

    # memory_forget audit (best-effort)
    if 'action: "memory_forget"' not in t:
        # find memory_forget success return - optional soft
        pass

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    assert "appendAuditLog" in t
    assert "admin_audit_list" in t
    print("ok")

if __name__ == "__main__":
    main()
