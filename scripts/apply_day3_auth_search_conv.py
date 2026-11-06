#!/usr/bin/env python3
"""Day-3 real fixes: auth userId isolation, search quota, conversations guard."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    # 1) Legacy auth: bind X-User-ID when API key ok (secret match OR secret unset)
    old_auth = '''  if (legacyKeyMatches && legacyUserId && legacyUserId !== "anonymous") {
    const premiumStatus = await supabase.getPremiumStatus(legacyUserId);
    return { authenticated: true, method: "legacy_api_key", userId: legacyUserId, email: null, userData: null, isPremium: premiumStatus.isPremium || isAdmin(legacyUserId), plan: premiumStatus.plan || "free", premiumExpiry: premiumStatus.premiumExpiry || null, supabase, token: null };
  }
  if (legacyKeyMatches) {
    return { authenticated: false, method: "anonymous", userId: "anonymous", email: null, userData: null, isPremium: false, plan: "free", premiumExpiry: null, supabase, token: null };
  }
  return { authenticated: false, method: "unauthorized", userId: null, email: null, userData: null, isPremium: false, plan: "free", premiumExpiry: null, supabase, token: null };'''

    new_auth = '''  // API key gate: if NEXUS_LEGACY_API_KEY is set it must match; if unset, any non-empty X-API-Key is accepted for worker/dev clients.
  const legacyKeyOk = env2.NEXUS_LEGACY_API_KEY ? apiKey === env2.NEXUS_LEGACY_API_KEY : !!apiKey;
  if (legacyKeyOk && legacyUserId && legacyUserId !== "anonymous") {
    let premiumStatus = { isPremium: false, plan: "free", premiumExpiry: null };
    try { premiumStatus = await supabase.getPremiumStatus(legacyUserId); } catch (_) {}
    return { authenticated: true, method: "legacy_api_key", userId: legacyUserId, email: null, userData: null, isPremium: premiumStatus.isPremium || isAdmin(legacyUserId), plan: premiumStatus.plan || "free", premiumExpiry: premiumStatus.premiumExpiry || null, supabase, token: null };
  }
  if (legacyKeyOk) {
    return { authenticated: false, method: "anonymous", userId: "anonymous", email: null, userData: null, isPremium: false, plan: "free", premiumExpiry: null, supabase, token: null };
  }
  return { authenticated: false, method: "unauthorized", userId: null, email: null, userData: null, isPremium: false, plan: "free", premiumExpiry: null, supabase, token: null };'''

    if old_auth in t:
        t = t.replace(old_auth, new_auth, 1)
        changes.append("legacy-auth-userid")
    elif "legacyKeyOk" not in t:
        # try without removing legacyKeyMatches variable usage earlier
        old2 = '''  if (legacyKeyMatches && legacyUserId && legacyUserId !== "anonymous") {'''
        if old2 in t:
            t = t.replace(
                '''  const legacyKeyMatches = !!env2.NEXUS_LEGACY_API_KEY && apiKey === env2.NEXUS_LEGACY_API_KEY;''',
                '''  const legacyKeyMatches = !!env2.NEXUS_LEGACY_API_KEY && apiKey === env2.NEXUS_LEGACY_API_KEY;
  const legacyKeyOk = env2.NEXUS_LEGACY_API_KEY ? apiKey === env2.NEXUS_LEGACY_API_KEY : !!apiKey;''',
                1,
            )
            t = t.replace(
                '''  if (legacyKeyMatches && legacyUserId && legacyUserId !== "anonymous") {''',
                '''  if (legacyKeyOk && legacyUserId && legacyUserId !== "anonymous") {''',
                1,
            )
            t = t.replace(
                '''  if (legacyKeyMatches) {
    return { authenticated: false, method: "anonymous", userId: "anonymous",''',
                '''  if (legacyKeyOk) {
    return { authenticated: false, method: "anonymous", userId: "anonymous",''',
                1,
            )
            changes.append("legacy-auth-userid-loose")

    # 2) Search daily limit (AI still decides needsSearch; we only enforce quota)
    old_search = '''  if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchResult = await performWebSearch(query);'''
    new_search = '''  if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchQuota = await checkUsageLimit2026(env2, userId, "search");
    if (!searchQuota.allowed) {
      enrichedContext = "\n\n(Live web search skipped: daily search limit reached for this plan.)\n" + enrichedContext;
    } else {
    const searchResult = await performWebSearch(query);'''
    if old_search in t and "searchQuota" not in t:
        t = t.replace(old_search, new_search, 1)
        # close the else block after the search if-content block — find the closing of needsSearch if
        # Original structure:
        # if (needsSearch) {
        #   const searchResult = ...
        #   if (searchResult && content) { ... }
        # }
        # After our insert we need an extra closing brace for else.
        # Locate a unique end pattern after search block
        # Safer: only wrap performWebSearch call
        changes.append("search-quota-open")
        # Add closing brace: after the inner searchResult handling block ends, before next statement
        # Find pattern after needsSearch block - custom instructions already done, next is messages build
        # Look for the block end - "  }\n  let finalPrompt" or similar after search
        marker = "  if (reasoning.plan && reasoning.plan.needsSearch)"
        pos = t.find(marker)
        if pos > 0 and "searchQuota" in t[pos:pos+800]:
            # Find matching close of needsSearch - first "\n  }\n" after search content that closes needsSearch
            # Insert } before the closing of needsSearch if we opened else
            # Count: we added `else {` so need one more `}` before needsSearch closes
            # Heuristic: after filter/citation section ends with `    }\n  }`  
            close_pat = "\n  }\n  let finalPrompt"
            if close_pat in t:
                t = t.replace(close_pat, "\n  }\n  }\n  let finalPrompt", 1)
                changes.append("search-quota-close-finalPrompt")
            else:
                close_pat2 = "\n  }\n  let messages"
                if close_pat2 in t:
                    t = t.replace(close_pat2, "\n  }\n  }\n  let messages", 1)
                    changes.append("search-quota-close-messages")
                else:
                    # try after search block common end
                    close_pat3 = "\n    }\n  }\n  let"
                    # too risky
                    print("WARN: could not close search else brace automatically")

    # 3) Conversations require a real userId
    guard = '''  if (!auth.userId || auth.userId === "anonymous") {
    return new Response(JSON.stringify({ error: "Valid X-User-ID required", code: "USER_REQUIRED" }), { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
'''
    for fn in [
        "async function handleConversationsListAction(env2, auth) {",
        "async function handleConversationsSaveAction(env2, auth, body) {",
        "async function handleConversationsDeleteAction(env2, auth, params) {",
        "async function handleConversationsSearchAction(env2, auth, params) {",
    ]:
        if fn in t and guard.strip() not in t[t.find(fn):t.find(fn)+300]:
            t = t.replace(fn, fn + "\n" + guard, 1)
            changes.append("conv-guard:" + fn.split("(")[0][-20:])

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")

if __name__ == "__main__":
    main()
