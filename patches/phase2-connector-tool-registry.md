# Phase 2 — CONNECTOR_TOOL_REGISTRY

## Goal
Claude/Grok-style plugin tools map: each OAuth app → tools + required scopes.

## Insert before `var OAUTH_CONFIG = {` in worker.ts

Registry apps (initial): **discord, spotify, github, notion, slack**

Each tool has: `name`, `description`, `scopes[]`, `action` (maps to execute_plugin action).

Helper: `getConnectorRegistryEntry(app)`

## Discord tools
- get_user (scope: identify)
- list_guilds (scope: guilds)
- list_guild_channels (scope: guilds, param guildId)
- get_guild (scope: guilds, param guildId)

## Out of scope
- No chat injection yet (phase 3+)
- MCP server unchanged
- Existing OAuth routes unchanged

## Live
Deployed on nexus-a1 with phase2 annotation when applied via Cloudflare content API.
