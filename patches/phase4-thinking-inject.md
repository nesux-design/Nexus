# Phase 4 — Thinking inject (Claude/Grok style)

## Change
`metaThinking2026` now:
1. Calls `getMcpStyleTools(env, userId)`
2. Formats with `formatMcpStyleToolsForThinking`
3. Appends that block to `reasoning`
4. Returns `connected_tools` array

Chat response may also expose:
- `plugin_thinking`
- `plugin_tools`

## Live
nexus-a1 version with phase4 annotation (verified: Phase 4 comment + connected_tools + registry).

## Next (Phase 5)
Auto `execute_plugin` when intent matches a connected tool.
