#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
REPO="${1:-$HOME/Nexus}"
cd "$REPO"
git pull origin main
curl -sL "https://raw.githubusercontent.com/nesux-design/Nexus/main/patches/worker-mcp-full.patch.b64" | tr -d '\n' | base64 -d > /tmp/worker-mcp.patch
patch -p1 < /tmp/worker-mcp.patch
echo "OK: worker.ts patched"
if command -v npx >/dev/null 2>&1; then
  npx wrangler deploy
  echo "Deployed. Test mcp_connectors"
else
  echo "Run: npx wrangler deploy"
fi
