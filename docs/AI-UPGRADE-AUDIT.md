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

- `NEXUS_LEGACY_API_KEY` is now read from the Worker environment rather than source code. It is for trusted server-to-server compatibility only; a browser frontend must use a verified Supabase access token instead of shipping a shared key.
- `ENCRYPTION_KEY` must be configured as a high-entropy Cloudflare secret of at least 32 characters. The known fallback encryption key was removed and encryption errors no longer fall back to plaintext. Existing integration tokens encrypted with the old fallback may need to be reconnected if no valid secret was configured previously. Do not deploy until this secret and the frontend authentication migration are verified.
- The Wrangler dry-run now bundles successfully after restoring the missing MCP client exports. The repository still has a large legacy TypeScript error backlog; the CI typecheck step is currently informational and is not a passing typecheck claim.

The legacy key must be configured as a Cloudflare Worker secret only if legacy server-to-server callers still need it. A secret embedded in browser/frontend code is not secret; the frontend should use a verified Supabase access token for user identity. Do not deploy this branch until the frontend's authentication headers and OAuth-start requests are confirmed compatible.

## Dependency remediation

- The active Cloudflare deployment reports Durable Object migration tag `v2`. The repository had a `v2` deletion tombstone for `TimeMcpServer` even though no preceding migration created that class; Wrangler v4 rejects this inconsistent history. The branch removes only that stale tombstone and preserves the already-deployed `v2` tag. This configuration has not been deployed; validate with local/no-credentials checks first.

- The repository's dependency audit identified high-severity packages, including a critical `proxy-addr` advisory and vulnerable Wrangler v3 dependency trees. The isolated branch explicitly tests the documented Wrangler v4 migration, then applies non-forced audit fixes. Dependency changes are committed only if static regression checks and the Wrangler dry run pass. No `npm audit fix --force` is used. The next CI run is the controlled migration attempt.

## Verification status

- Static regression tests pass.
- Local esbuild bundle check passes.
- Wrangler v4 configuration check passes with Cloudflare credentials explicitly unset; the stale `TimeMcpServer` tombstone was removed while preserving migration tag `v2`.
- The first successful Wrangler v3 dry-run checks created preview versions in the Cloudflare account. The active production deployment remained on the 26 October deployment. Subsequent validation was switched to local/no-credentials mode, and no production deployment was invoked.
- TypeScript compilation still reports a substantial legacy backlog (roughly 276 diagnostics in the latest report, mostly untyped API response objects and function argument mismatches). CI records this as informational rather than claiming a clean typecheck.

## Known limits / remaining review

- This is not an exact clone of proprietary ChatGPT or Claude internals.
- The current repository does not include the full chat frontend; visual components need a frontend source repository.
- Static tests and CI checks are not a substitute for live end-to-end tests against Supabase, KV, D1, Vectorize, OAuth providers, and MCP services.
- The Telegram test endpoint still uses a hardcoded test phone number; it is admin-protected, but live execution should wait until a dedicated test account is configured.
- Legacy plaintext secret compatibility in `decryptSecret` and all OAuth callback/state flows require additional review before deployment.
