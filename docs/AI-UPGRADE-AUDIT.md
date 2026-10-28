# NEXUS A1 AI Upgrade — Audit Notes

## Scope and safety

- Source base: \`main\` at commit \`92717d90beda83b30823b8ef8faf02b4ec61e4b2\` (27 October 2026).
- Work branch: \`nexus-a1-ai-upgrade-2026-10\`.
- No production Worker deployment is performed by this branch.
- This repository is primarily a Cloudflare Worker/backend. Rich UI rendering for cards, charts, maps, responsive chat layouts, and animations must be implemented in the separate frontend repository/app; Worker response metadata alone cannot render those UI components.

## Findings addressed in this branch

1. The legacy API key is no longer hardcoded in \`worker.ts\`; compatibility now requires a Worker secret named \`NEXUS_LEGACY_API_KEY\`.
2. Plugin and Telegram test endpoints retain their functionality but require authenticated admin access.
3. OAuth initiation now derives the linked user ID from validated authentication rather than caller-controlled \`X-User-ID\`, query parameters, or a \`test_user\` fallback.
4. OAuth state identifiers use \`crypto.randomUUID()\`.
5. Figma OAuth authorization codes are no longer logged.
6. Conversation lookup/update/delete inside \`MemorySystem\` include the owning \`user_id\` filter.
7. Conversation context selection preserves message chronology while prioritizing recent/important messages.
8. Duplicate scheduled daily-report invocation was removed.
9. The master prompt now calls for task-appropriate structured answers, nearby citations, accurate tool-result reporting, useful follow-ups, and concise rationale rather than private chain-of-thought.
10. Chat responses now include a backward-compatible \`presentation\` hint object, deduplicated HTTP(S) sources, and contextual follow-up questions for substantial queries.
11. Added static regression checks and a CI workflow for npm install, static checks, TypeScript, and Wrangler dry-run validation.

## Important migration note

The legacy key must be configured as a Cloudflare Worker secret only if legacy server-to-server callers still need it. A secret embedded in browser/frontend code is not secret; the frontend should use a verified Supabase access token for user identity. Do not deploy this branch until the frontend's authentication headers and OAuth-start requests are confirmed compatible.

## Dependency remediation

- The repository's dependency audit identified high-severity packages, including a critical `proxy-addr` advisory and vulnerable Wrangler v3 dependency trees. The isolated branch will explicitly test the documented Wrangler v4 migration, then apply non-forced audit fixes. Dependency changes are committed only if static regression checks and the Wrangler dry run pass. No `npm audit fix --force` is used.

## Known limits / remaining review

- This is not an exact clone of proprietary ChatGPT or Claude internals.
- The current repository does not include the full chat frontend; visual components need a frontend source repository.
- Static tests and CI checks are not a substitute for live end-to-end tests against Supabase, KV, D1, Vectorize, OAuth providers, and MCP services.
- The Telegram test endpoint still uses a hardcoded test phone number; it is admin-protected, but live execution should wait until a dedicated test account is configured.
- Secret encryption fallback behavior and all OAuth callback/state flows require additional review before deployment.
