# Phase 3 — getMcpStyleTools

## Goal
After user authorizes an app, list **only tools allowed by granted scopes** (Claude/Grok style).

## Added helpers (after getConnectorRegistryEntry)

- `parseGrantedScopes(raw)`
- `scopesAllow(granted, required)`
- `getMcpStyleTools(env, userId)` → uses existing `listIntegrations` + `CONNECTOR_TOOL_REGISTRY`
- `formatMcpStyleToolsForThinking(tools)` → text block for later thinking injection

## Output shape (each tool)
```json
{
  "app": "discord",
  "tool": "list_guilds",
  "action": "list_guilds",
  "description": "...",
  "required_scopes": ["guilds"],
  "granted_scopes": ["identify", "guilds"],
  "scopes_ok": true,
  "connected": true
}
```

## Out of scope
- Chat injection (phase 4+)
- MCP server unchanged
