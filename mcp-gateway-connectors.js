/**
 * Full MCP gateway connector catalog (mirrors nexus-mcp-server).
 * Local A1 OAuth plugins stay in oauth-plugins.js; these are real MCP routes.
 * OAuth authorize: {MCP_BASE}/oauth/{id}/start  with X-Nexus-User-Id + Signature
 * Tools: POST {MCP_BASE}/mcp/{id}  tools/list | tools/call
 */

export const MCP_GATEWAY_BASE = "https://nexus-mcp-server.apikeyakhilka.workers.dev";

export const MCP_GATEWAY_CONNECTORS = {
  cloudflare: { id: "cloudflare", name: "Cloudflare API MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.cloudflare.com/mcp", callback: "/oauth/cloudflare/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  vercel: { id: "vercel", name: "Vercel API MCP", auth: "provider-approved-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.vercel.com", callback: "/oauth/vercel/callback", requiredSecrets: [], note: "Needs pre-approved OAuth client.", oauthReady: false, providerApprovedOnly: true },
  netlify: { id: "netlify", name: "Netlify API MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://netlify-mcp.netlify.app/mcp", callback: "/oauth/netlify/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  atlassian: { id: "atlassian", name: "Atlassian Rovo MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.atlassian.com/v2/mcp", callback: "/oauth/atlassian/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  microsoft: { id: "microsoft", name: "Microsoft Release Communications MCP", auth: "provider-approved-oauth", local: false, remoteMcp: true, mcpUrl: "https://www.microsoft.com/releasecommunications/mcp", callback: "/oauth/microsoft/callback", requiredSecrets: [], note: "Not DCR-ready.", oauthReady: false, providerApprovedOnly: true },
  googleDeveloperKnowledge: { id: "googleDeveloperKnowledge", name: "Google Developer Knowledge MCP", auth: "api-key", local: false, remoteMcp: true, mcpUrl: "https://developerknowledge.googleapis.com/mcp", callback: "/oauth/googleDeveloperKnowledge/callback", requiredSecrets: ["DEVELOPERKNOWLEDGE_API_KEY"], note: null, oauthReady: true, providerApprovedOnly: false },
  googleDrive: { id: "googleDrive", name: "Google Drive MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://drivemcp.googleapis.com/mcp/v1", callback: "/oauth/googleDrive/callback", requiredSecrets: ["GOOGLE_MCP_CLIENT_ID", "GOOGLE_MCP_CLIENT_SECRET"], note: "Official Google Drive remote MCP.", oauthReady: true, providerApprovedOnly: false },
  googleCalendar: { id: "googleCalendar", name: "Google Calendar MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://calendarmcp.googleapis.com/mcp/v1", callback: "/oauth/googleCalendar/callback", requiredSecrets: ["GOOGLE_MCP_CLIENT_ID", "GOOGLE_MCP_CLIENT_SECRET"], note: "Official Google Calendar remote MCP.", oauthReady: true, providerApprovedOnly: false },
  gmail: { id: "gmail", name: "Google Gmail MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://gmailmcp.googleapis.com/mcp/v1", callback: "/oauth/gmail/callback", requiredSecrets: ["GOOGLE_MCP_CLIENT_ID", "GOOGLE_MCP_CLIENT_SECRET"], note: "Official Gmail remote MCP.", oauthReady: true, providerApprovedOnly: false },
  github: { id: "github", name: "GitHub MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://api.githubcopilot.com/mcp/", callback: "/oauth/github/callback", requiredSecrets: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"], note: "Official remote GitHub MCP.", oauthReady: true, providerApprovedOnly: false },
  notion: { id: "notion", name: "Notion MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.notion.com/mcp", callback: "/oauth/notion/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  linear: { id: "linear", name: "Linear MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.linear.app/mcp", callback: "/oauth/linear/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  asana: { id: "asana", name: "Asana MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://mcp.asana.com/v2/mcp", callback: "/oauth/asana/callback", requiredSecrets: ["ASANA_MCP_CLIENT_ID", "ASANA_MCP_CLIENT_SECRET"], note: "Official Asana MCP.", oauthReady: true, providerApprovedOnly: false },
  figma: { id: "figma", name: "Figma Remote MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://mcp.figma.com/mcp", callback: "/oauth/figma/callback", requiredSecrets: ["FIGMA_CLIENT_ID", "FIGMA_CLIENT_SECRET"], note: "Official Figma MCP.", oauthReady: true, providerApprovedOnly: false },
  canva: { id: "canva", name: "Canva MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.canva.com/mcp", callback: "/oauth/canva/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  monday: { id: "monday", name: "monday.com MCP", auth: "provider-approved-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.monday.com/mcp", callback: "/oauth/monday/callback", requiredSecrets: [], note: "Pre-approved redirect_uris.", oauthReady: false, providerApprovedOnly: true },
  hubspot: { id: "hubspot", name: "HubSpot MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://mcp.hubspot.com", callback: "/oauth/hubspot/callback", requiredSecrets: ["HUBSPOT_MCP_CLIENT_ID", "HUBSPOT_MCP_CLIENT_SECRET"], note: "Official HubSpot MCP.", oauthReady: true, providerApprovedOnly: false },
  intercom: { id: "intercom", name: "Intercom MCP", auth: "provider-approved-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.intercom.com/mcp", callback: "/oauth/intercom/callback", requiredSecrets: [], note: "Registered redirect required.", oauthReady: false, providerApprovedOnly: true },
  stripe: { id: "stripe", name: "Stripe MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.stripe.com", callback: "/oauth/stripe/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  slack: { id: "slack", name: "Slack MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.slack.com/mcp", callback: "/oauth/slack/callback", requiredSecrets: ["SLACK_MCP_CLIENT_ID", "SLACK_MCP_CLIENT_SECRET"], note: "Official Slack remote MCP.", oauthReady: true, providerApprovedOnly: false },
  dropbox: { id: "dropbox", name: "Dropbox MCP", auth: "provider-approved-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.dropbox.com/mcp", callback: "/oauth/dropbox/callback", requiredSecrets: [], note: "Trusted partners only.", oauthReady: false, providerApprovedOnly: true },
  zapier: { id: "zapier", name: "Zapier MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.zapier.com/api/v1/connect", callback: "/oauth/zapier/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  airtable: { id: "airtable", name: "Airtable MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.airtable.com/mcp", callback: "/oauth/airtable/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  supabase: { id: "supabase", name: "Supabase MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.supabase.com/mcp", callback: "/oauth/supabase/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  sentry: { id: "sentry", name: "Sentry MCP", auth: "upstream-oauth", local: false, remoteMcp: true, mcpUrl: "https://mcp.sentry.dev/mcp", callback: "/oauth/sentry/callback", requiredSecrets: [], note: null, oauthReady: true, providerApprovedOnly: false },
  twitter: { id: "twitter", name: "X (Twitter) MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://api.x.com/mcp", callback: "/oauth/twitter/callback", requiredSecrets: ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"], note: "Official X remote MCP.", oauthReady: true, providerApprovedOnly: false },
  zoom: { id: "zoom", name: "Zoom MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://mcp.zoom.us/mcp/zoom/streamable", callback: "/oauth/zoom/callback", requiredSecrets: ["ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET"], note: "Official Zoom remote MCP.", oauthReady: true, providerApprovedOnly: false },
  salesforce: { id: "salesforce", name: "Salesforce Hosted MCP", auth: "oauth2", local: false, remoteMcp: true, mcpUrl: "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all", callback: "/oauth/salesforce/callback", requiredSecrets: ["SALESFORCE_CLIENT_ID", "SALESFORCE_CLIENT_SECRET"], note: "Official Salesforce Hosted MCP.", oauthReady: true, providerApprovedOnly: false },
  telegram: { id: "telegram", name: "Telegram MCP", auth: "bridge", local: true, remoteMcp: false, mcpUrl: null, callback: null, requiredSecrets: ["NEXUS_TELEGRAM_MCP_URL", "NEXUS_TELEGRAM_BRIDGE_SECRET"], note: "Bridge MCP (Render). No OAuth start — tools/call with login tools.", oauthReady: false, providerApprovedOnly: false },
  discord: { id: "discord", name: "Discord MCP", auth: "oauth2", local: true, remoteMcp: false, mcpUrl: null, callback: null, requiredSecrets: [], note: "No official Discord remote MCP (use A1 plugins)", oauthReady: true, providerApprovedOnly: false },
  reddit: { id: "reddit", name: "Reddit MCP", auth: "oauth2", local: true, remoteMcp: false, mcpUrl: null, callback: null, requiredSecrets: [], note: "No official remote MCP", oauthReady: true, providerApprovedOnly: false },
  mailchimp: { id: "mailchimp", name: "Mailchimp MCP", auth: "oauth2", local: true, remoteMcp: false, mcpUrl: null, callback: null, requiredSecrets: [], note: "No official full Marketing remote MCP", oauthReady: true, providerApprovedOnly: false },
  spotify: { id: "spotify", name: "Spotify MCP", auth: "oauth2", local: true, remoteMcp: false, mcpUrl: null, callback: null, requiredSecrets: [], note: "No official Spotify remote MCP (use A1 plugins)", oauthReady: true, providerApprovedOnly: false },
  twitch: { id: "twitch", name: "Twitch MCP", auth: "oauth2", local: true, remoteMcp: false, mcpUrl: null, callback: null, requiredSecrets: [], note: "No official remote MCP", oauthReady: true, providerApprovedOnly: false },
  wolfram: { id: "wolfram", name: "Wolfram Alpha MCP", auth: "api-key", local: true, remoteMcp: false, mcpUrl: null, callback: null, requiredSecrets: [], note: "API key local tools", oauthReady: true, providerApprovedOnly: false }
};

export const MCP_CONNECTOR_IDS = Object.keys(MCP_GATEWAY_CONNECTORS);

export const MCP_LOAD_PRIORITY = [
  "cloudflare", "github", "notion", "linear", "asana", "slack", "supabase", "sentry",
  "vercel", "netlify", "airtable", "atlassian", "stripe", "zapier", "figma", "canva",
  "hubspot", "googleDrive", "googleCalendar", "gmail", "twitter", "zoom", "salesforce", "telegram"
];

export function getMcpConnector(id) {
  return MCP_GATEWAY_CONNECTORS[String(id || "")] || null;
}

export function listMcpGatewayCatalog() {
  return Object.values(MCP_GATEWAY_CONNECTORS);
}

export function mcpOAuthStartPath(connectorId) {
  return `/oauth/${encodeURIComponent(connectorId)}/start`;
}
