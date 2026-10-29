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
- A Wrangler v4 config check passed after removing the stale `TimeMcpServer` tombstone while preserving migration tag `v2`. However, the Wrangler CLI dry-run still uploaded preview versions despite credential environment variables being unset, so that command has been removed from CI. Future CI uses local esbuild only.
- Cloudflare shows preview versions uploaded during the earlier CLI validation window; the active production deployment remains on the 26 October deployment. No production deployment was invoked.
- TypeScript compilation still reports a substantial legacy backlog (281 diagnostics in the latest CI run, mostly untyped API response objects and function argument mismatches). CI records this as informational rather than claiming a clean typecheck.

## Known limits / remaining review

- This is not an exact clone of proprietary ChatGPT or Claude internals.
- The current repository does not include the full chat frontend; visual components need a frontend source repository.
- Static tests and CI checks are not a substitute for live end-to-end tests against Supabase, KV, D1, Vectorize, OAuth providers, and MCP services.
- The Telegram test endpoint still uses a hardcoded test phone number; it is admin-protected, but live execution should wait until a dedicated test account is configured.
- Legacy plaintext secret compatibility in `decryptSecret` and all OAuth callback/state flows require additional review before deployment.

## Additional security review fixes (29 October 2026)

- Generic OAuth callbacks now reject missing, malformed, mismatched, or ownerless state records; malformed state no longer falls back to the shared `test_user` identity.
- Figma/Discord and Canva callback handlers now require the provider-bound JSON state and a non-empty owner ID; they no longer trust callback request headers or fall back to `test_user`.
- Canva callback logs no longer include the full URL, authorization code, or state. Validated OAuth state and PKCE verifier entries are consumed to reduce replay opportunities.
- Integration access-token prefixes are no longer printed to logs.
- Plugin execution no longer logs the full request body, Telegram phone number, OTP, or the complete verification result that may contain a session string.
- New integration access and refresh tokens, including refreshed tokens, are encrypted at rest with the configured `ENCRYPTION_KEY`; token reads decrypt them before provider calls. Existing plaintext records remain readable for compatibility and are migrated on read when a valid key is available.
- New OAuth integration storage now requires `ENCRYPTION_KEY` to be configured. Do not deploy until the key is set and legacy token migration/reconnection has been planned.
- OAuth callbacks now return a server error if secure integration persistence fails, rather than redirecting the user to a false `connected` state.
- Added static regression assertions for the OAuth-state validation and sensitive-log redaction.
- These are source-level safeguards. They do not replace live OAuth/provider tests or a review of existing plaintext integration records.

## Follow-up response-pipeline fixes (29 October 2026)

- The normal chat JSON response now passes through the existing presentation hints, normalized source list, contextual follow-up questions, artifact metadata, search flag, confidence, and language. Previously, quantumResponse created these fields but handleChatAction discarded most of them.
- Web sources are normalized and deduplicated before citation numbering, restricted to credential-free HTTP(S) URLs, and kept in the same order used by the citation list.
- Streaming responses now attach sources, presentation metadata, and contextual follow-up questions to the final SSE completion event; the stream search path also gives the model a numbered source list.
- The stream progress event no longer asks a model to generate hidden internal reasoning. Provider-specific raw reasoning is not returned in the user-facing thinking field; only a concise rationale summary may be returned.
- Regression checks now cover metadata passthrough, source normalization, stream completion metadata, and the absence of raw provider-reasoning exposure.

## Legacy integration-connect compatibility fix (29 October 2026)

- Fixed the legacy `integration_connect` action to store OAuth state as JSON containing the provider and authenticated user ID, matching the callback handlers' validation contract. Previously, this path stored only the provider name, causing callbacks to reject the state and breaking OAuth flows initiated through this legacy action.
- Unsupported providers are now rejected before an OAuth state record is created.
- Direct-token integration connect now checks the secure storage result and returns an error instead of reporting a false success if persistence fails.
- Added static regression assertions for state shape, provider validation ordering, and secure-storage failure handling. CI verification for this follow-up commit is pending; no live OAuth provider flow has been run.

## Verification after these changes

- GitHub Actions runs for the latest code revision: 40801902114 (push) and 40801903903 (pull request) — successful for dependency install, high-severity npm audit, static regression tests, production dependency audit (high severity), and local esbuild bundle validation.
- TypeScript compilation remains informational / non-blocking in CI and still reports legacy type errors. This is not a clean TypeScript typecheck claim.
- The current npm audit reports one moderate advisory in the transitive @hono/node-server dependency (GHSA-rmxm-3fg6-px4f); the high-severity audit threshold passes, but this is not a zero-vulnerability dependency report.
- These changes are committed only to nexus-a1-ai-upgrade-2026-10 and its existing draft PR. The main branch and production nexus-a1 Worker have not been changed or deployed.
- The Worker can return richer metadata, but a separate frontend must render interactive cards, charts, diagrams, source panels, and other visual UI. This repository contains the backend Worker, not that frontend implementation.
