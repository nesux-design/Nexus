# Notion + Linear → official remote MCP

Local OAuth in **nexus-a1** for these two is deprecated.

Use **nexus-mcp-server**:

| App | Official MCP | Gateway |
|-----|--------------|--------|
| Notion | `https://mcp.notion.com/mcp` | `/mcp/notion` |
| Linear | `https://mcp.linear.app/mcp` | `/mcp/linear` |

## Remove from nexus-a1 `worker.ts`

1. From `GENERIC_OAUTH_PROVIDERS` array, remove `"notion"` and `"linear"`.
2. If any `/oauth/notion` or `/oauth/linear` routes exist, return 410 `moved_to_mcp` with the gateway URLs above.
3. Redeploy: `npx wrangler deploy`

## Deploy mcp-server

```bash
cd nexus-mcp-server && npx wrangler deploy
```
