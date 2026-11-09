#!/usr/bin/env python3
"""Phase A Day 23: X-RateLimit-* headers, richer checkRateLimit, schema v2 429."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # 1) apiError accepts optional extraHeaders
    if "extraHeaders = {}" not in t[t.find("function apiError"):t.find("function apiError")+400]:
        old_api = '''function apiError(code, message, status = 400, extra = {}) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    code,
    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString(),
    ...extra
  }), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}'''
        new_api = '''function apiError(code, message, status = 400, extra = {}, extraHeaders = {}) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    code,
    schemaVersion: 2,
    requestId: newRequestId(),
    created: (/* @__PURE__ */ new Date()).toISOString(),
    ...extra
  }), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json", ...extraHeaders } });
}'''
        if old_api not in t:
            raise SystemExit("apiError block not found")
        t = t.replace(old_api, new_api, 1)
        changes.append("apiError-headers")

    # 2) checkRateLimit returns limit/remaining/reset
    if "RATE_LIMIT_META_V1" not in t:
        old_rl = '''  if (ipData.count >= CONFIG.RATE_LIMIT_IP)
    return { allowed: false, retryAfter: Math.ceil((ipData.reset - now) / 1e3) };
  if (userId !== "anonymous" && userData.count >= CONFIG.RATE_LIMIT_USER)
    return { allowed: false, retryAfter: Math.ceil((userData.reset - now) / 1e3) };
  ipData.count++;
  if (userId !== "anonymous")
    userData.count++;
  await Promise.all([env2.KV.put(ipKey, JSON.stringify(ipData), { expirationTtl: 60 }), env2.KV.put(userKey, JSON.stringify(userData), { expirationTtl: 60 })]);
  return { allowed: true };
}'''
        new_rl = '''  // RATE_LIMIT_META_V1
  const ipLimit = CONFIG.RATE_LIMIT_IP;
  const userLimit = CONFIG.RATE_LIMIT_USER;
  if (ipData.count >= ipLimit) {
    return {
      allowed: false,
      scope: "ip",
      limit: ipLimit,
      remaining: 0,
      reset: ipData.reset,
      retryAfter: Math.ceil((ipData.reset - now) / 1e3)
    };
  }
  if (userId !== "anonymous" && userData.count >= userLimit) {
    return {
      allowed: false,
      scope: "user",
      limit: userLimit,
      remaining: 0,
      reset: userData.reset,
      retryAfter: Math.ceil((userData.reset - now) / 1e3)
    };
  }
  ipData.count++;
  if (userId !== "anonymous")
    userData.count++;
  await Promise.all([env2.KV.put(ipKey, JSON.stringify(ipData), { expirationTtl: 60 }), env2.KV.put(userKey, JSON.stringify(userData), { expirationTtl: 60 })]);
  const activeLimit = userId !== "anonymous" ? userLimit : ipLimit;
  const activeCount = userId !== "anonymous" ? userData.count : ipData.count;
  const activeReset = userId !== "anonymous" ? userData.reset : ipData.reset;
  return {
    allowed: true,
    scope: userId !== "anonymous" ? "user" : "ip",
    limit: activeLimit,
    remaining: Math.max(0, activeLimit - activeCount),
    reset: activeReset,
    retryAfter: 0
  };
}'''
        if old_rl not in t:
            raise SystemExit("checkRateLimit return block not found")
        t = t.replace(old_rl, new_rl, 1)
        changes.append("checkRateLimit-meta")

    # 3) 429 response schema v2 + headers
    old_429 = '''    if (!rateLimit.allowed)
      return new Response(JSON.stringify({ error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter }), { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Retry-After": String(rateLimit.retryAfter) } });'''
    new_429 = '''    if (!rateLimit.allowed) {
      const rlHeaders = {
        "Retry-After": String(rateLimit.retryAfter || 60),
        "X-RateLimit-Limit": String(rateLimit.limit != null ? rateLimit.limit : ""),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(rateLimit.reset != null ? rateLimit.reset : "")
      };
      return apiError("RATE_LIMITED", "Rate limit exceeded", 429, {
        retryAfter: rateLimit.retryAfter,
        scope: rateLimit.scope || null,
        limit: rateLimit.limit != null ? rateLimit.limit : null,
        remaining: 0,
        reset: rateLimit.reset != null ? rateLimit.reset : null
      }, rlHeaders);
    }'''
    if old_429 in t:
        t = t.replace(old_429, new_429, 1)
        changes.append("429-body")

    # 4) Helper to attach rate limit headers on chat success
    if "function rateLimitHeaders" not in t:
        helper = '''
function rateLimitHeaders(rateLimit) {
  if (!rateLimit || rateLimit.allowed === false && rateLimit.remaining == null) return {};
  return {
    "X-RateLimit-Limit": String(rateLimit.limit != null ? rateLimit.limit : ""),
    "X-RateLimit-Remaining": String(rateLimit.remaining != null ? rateLimit.remaining : ""),
    "X-RateLimit-Reset": String(rateLimit.reset != null ? rateLimit.reset : "")
  };
}
'''
        t = t.replace("function apiError", helper + "function apiError", 1)
        changes.append("rl-helper")

    # 5) Note: rateLimit is computed in outer fetch, not always passed to handleChatAction.
    # Attach headers in fetch after handleAction when possible is complex.
    # Instead, store last rate limit on a weak path: enhance handleAction is heavy.
    # Practical: chat returns already work; expose rate limit on premium_status is alternate.
    # Add X-RateLimit on SSE return in stream branch - rateLimit not in scope inside handleChatAction.
    #
    # Pass rateLimit via attaching on JSON responses at the outer layer:
    # Find: const rateLimit = await checkRateLimit...
    # And after handleAction response, clone with headers.

    if "RATE_LIMIT_RESPONSE_WRAP_V1" not in t:
        # Find pattern after rate limit check where request is handled
        # Look for common handleAction call result return
        anchor = "const rateLimit = await checkRateLimit(env2, ip, auth.userId);"
        if anchor not in t:
            raise SystemExit("rateLimit call not found")
        # We'll add a wrap function and use it only if we find `return await handleAction` nearby is too broad
        # Simpler approach: inject after rateLimit allowed, store on env-like:
        # Actually Cloudflare worker is single request - we can set globalThis.__lastRateLimit = rateLimit after check
        inject = '''const rateLimit = await checkRateLimit(env2, ip, auth.userId);
    // RATE_LIMIT_RESPONSE_WRAP_V1
    try { globalThis.__nexusLastRateLimit = rateLimit; } catch (_) {}'''
        t = t.replace(anchor, inject, 1)
        changes.append("store-last-rl")

        # Patch main chat return headers to include rate limit
        old_chat_headers = '''  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleChatAction, "handleChatAction");'''
        new_chat_headers = '''  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json", ...rateLimitHeaders(typeof globalThis !== "undefined" ? globalThis.__nexusLastRateLimit : null) } });
}
__name(handleChatAction, "handleChatAction");'''
        if old_chat_headers in t:
            t = t.replace(old_chat_headers, new_chat_headers, 1)
            changes.append("chat-headers")

        # SSE stream headers
        old_sse = '''    return new Response(stream, { headers: { ...CORS_HEADERS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Stream-Mode": streamMode, "X-Schema-Version": "2" } });'''
        new_sse = '''    return new Response(stream, { headers: { ...CORS_HEADERS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Stream-Mode": streamMode, "X-Schema-Version": "2", ...rateLimitHeaders(typeof globalThis !== "undefined" ? globalThis.__nexusLastRateLimit : null) } });'''
        if old_sse in t:
            t = t.replace(old_sse, new_sse, 1)
            changes.append("sse-headers")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    assert "RATE_LIMIT_META_V1" in t
    for li, line in enumerate(t.splitlines(), 1):
        s = line.rstrip()
        if s.endswith('.join("') or s.endswith('enrichedContext = "'):
            raise SystemExit(f"broken {li}")
    print("ok")

if __name__ == "__main__":
    main()
