# Nexus A1 — MCP-style plugin phases (1–7)

MCP server remains unchanged. Only A1 OAuth plugins.

## Phase 1 — Discord Bearer
`discordFullControl`: `Bot ${token}` → `Bearer ${token}` (user OAuth).

## Phase 2 — CONNECTOR_TOOL_REGISTRY
Apps: discord, spotify, github, notion, slack (+ later reddit, zoom, twitch, twitter, mailchimp, linkedin, dropbox, linear, asana, figma, canva).
Helper: `getConnectorRegistryEntry(app)`.

## Phase 3 — getMcpStyleTools
`parseGrantedScopes`, `scopesAllow`, `getMcpStyleTools(env, userId)`, `formatMcpStyleToolsForThinking(tools)`.
Uses existing `listIntegrations`.

## Phase 4 — Thinking inject
`metaThinking2026` loads connected tools, appends to `reasoning`, returns `connected_tools`.

## Phase 5 — Auto tool call
`matchConnectorToolFromMessage`, `tryAutoConnectorTool` → `executePluginNew`.
Wired in `handleChatAction` after `metaThinking2026`.

## Phase 6 — Registry + keywords expand
More apps + Hindi/English keywords (`dikhao`, zoom meetings, github repos, …).

## Phase 7 — integration_status (pending live if CF MCP down)
Return `mcp_tools` + `connected_apps` with `scopes_ok`.

## Live note
Phases 1–6 were applied via Cloudflare content API (around worker versions 525–528).
GitHub Actions deploy of stock `worker.ts` can overwrite those live patches.
Merge this logic into `worker.ts` before next CI deploy.
