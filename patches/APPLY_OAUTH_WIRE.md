# Apply OAuth plugin wire (Claude / ChatGPT / Grok style)

## Already on main
- `oauth-plugins.js` — registry, match, APIs, thinking steps, reauth

## Apply to worker.ts (one command)
```bash
cd Nexus
git pull
patch -p1 < patches/worker-oauth-wire.patch
git add worker.ts
git commit -m "feat: wire oauth-plugins into worker (Claude/Grok style)"
git push origin main
```

Or replace `worker.ts` with the fully patched file from Grok artifacts if patch conflicts.

## What the wire does
1. Import oauth-plugins.js
2. Discord user OAuth uses Bearer (not Bot)
3. metaThinking loads connected plugin tools into reasoning
4. Chat auto-runs matched plugin tools
5. integration_status returns mcp_tools + connected_apps
6. 401 / not connected → reauth_url
7. Registry apps (spotify, github, ...) via runPluginApi

OAuth browser routes (/oauth/discord etc.) stay in worker unchanged.
