# Remove local OAuth for apps that have official remote MCP

These should use **nexus-mcp-server** `/mcp/<id>` instead of local OAuth in nexus-a1:

asana, airtable, figma, github, gmail, google, googleDrive, hubspot, intercom, linear, notion, slack, stripe, sentry, supabase

(Also cloudflare/vercel/netlify/atlassian if present.)

Keep local OAuth only for apps **without** official remote MCP:

spotify, dropbox, linkedin, zoom, monday, microsoft, salesforce, twitter, mailchimp, reddit, twitch, telegram, discord, canva, wolfram

After editing `worker.ts`, run `npx wrangler deploy` (laptop — Termux cannot run wrangler).
