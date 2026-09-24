# Phase 1 — Discord Bearer fix (MCP-style user OAuth)

## Goal
User OAuth tokens from `/oauth/discord` are **user tokens**, not bot tokens.
Claude/Grok-style plugins use the authorized user token with `Bearer`.

## Change (worker.ts — `discordFullControl` only)

Replace **both** occurrences inside `discordFullControl`:

```diff
- "Authorization": `Bot ${token}`,
+ "Authorization": `Bearer ${token}`,
```

and in `send_file`:

```diff
- headers: { "Authorization": `Bot ${token}` },
+ headers: { "Authorization": `Bearer ${token}` },
```

## Why
- OAuth scopes: `identify email guilds guilds.members.read`
- `Bot` prefix → 401 for user tokens
- `Bearer` → correct for user-authorized access (plugin style)

## Out of scope this phase
- No other providers
- No thinking/tool registry yet (later phases)
- MCP server unchanged

## Apply
Search `discordFullControl` in `worker.ts` and apply the two replacements above, then deploy `nexus-a1`.
