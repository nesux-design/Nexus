# Remove local Google + GitHub from nexus-a1

Local OAuth/plugin handlers for Google and GitHub are deprecated.
Use official remote MCP on **nexus-mcp-server**:

- `/mcp/github` → `https://api.githubcopilot.com/mcp/`
- `/mcp/gmail` → `https://gmailmcp.googleapis.com/mcp/v1`
- `/mcp/googleDrive` → `https://drivemcp.googleapis.com/mcp/v1`

Apply `patches/google-github-to-mcp.diff` to `worker.ts` then:

```bash
npx wrangler deploy
```
