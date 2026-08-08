var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
import { env } from "cloudflare:workers";
import { TimeMcpServer } from "./mcp-time.js"; 
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __defProp22 = Object.defineProperty;
var __name22 = /* @__PURE__ */ __name2((target, value) => __defProp22(target, "name", { value, configurable: true }), "__name");
function getCurrentDate() {
  const now = /* @__PURE__ */ new Date();
  return {
    year: now.getUTCFullYear(),
    month: String(now.getUTCMonth() + 1).padStart(2, "0"),
    day: String(now.getUTCDate()).padStart(2, "0"),
    hours: String(now.getUTCHours()).padStart(2, "0"),
    minutes: String(now.getUTCMinutes()).padStart(2, "0"),
    full: now.getUTCFullYear() + "-" + String(now.getUTCMonth() + 1).padStart(2, "0") + "-" + String(now.getUTCDate()).padStart(2, "0"),
    timestamp: Date.now(),
    iso: now.toISOString(),
    unix: Math.floor(now.getTime() / 1e3)
  };
}
__name(getCurrentDate, "getCurrentDate");
__name2(getCurrentDate, "getCurrentDate");
__name22(getCurrentDate, "getCurrentDate");
var CURRENT_DATE = getCurrentDate();
var CURRENT_YEAR = CURRENT_DATE.year;
var CURRENT_MONTH = CURRENT_DATE.month;
var CURRENT_DAY = CURRENT_DATE.day;
var TODAY = CURRENT_DATE.full;
var CONFIG = {
  APP_NAME: "NEXUS",
  CREATOR: "Akhil Jaiswal",
  API_KEY: "akhil-123",
  UPI_ID: "jaiswalanushi8@oksbi",
  AMAZON_AFFILIATE_ID: "akhilgpt-21",
  ADMIN_IDS: ["admin", "akhil", "jaiswalanushi08", "8681361916"],
  SLACK_WEBHOOK_URL: "",
  SLACK_SIGNING_SECRET: "",
  FRONTEND_URL: "https://nexus-xai.vercel.app",
  WORKER_URL: "https://nexus-a1.apikeyakhilka.workers.dev",
  THINKING_MODE: true,
  // ╔══════════════════════════════════════════════════════════╗
  // ║  MODEL INPUT LIMITS (Context Window Size)              ║
  // ║  Based on actual 2026 data for all providers           ║
  // ╚══════════════════════════════════════════════════════════╝
  CONTEXT_WINDOW: {
    max_tokens: 1e6,
    max_messages: 500,
    importance_threshold: 0.3,
    model_limits: {
      gemini: 1e6,
      // Gemini 2.5 Flash-Lite: 1M input, 65K output
      groq: 131072,
      // Groq GPT-OSS 120B: 131K input, 65K output
      mimo: 1e6,
      // NVIDIA Nemotron: 262K input, 262K output
      cerebras: 8192,
      // Cerebras Llama 3.1 8B: 8K input, 8K output
      sambanova: 128e3,
      // SambaNova Gemma 3: 128K input, 128K output
      glm: 64e3
      // GLM-4V: 64K input, 32K output
    }
  },
  // ╔══════════════════════════════════════════════════════════╗
  // ║  PREMIUM TIERS                                          ║
  // ╚══════════════════════════════════════════════════════════╝
  PREMIUM_PLANS: {
    monthly: { price: 299, days: 30, name: "Monthly Plan" },
    yearly: { price: 1499, days: 365, name: "Yearly Plan" },
    pro: { price: 2999, days: 365, name: "Pro Plan" }
  },
  PAID_FEATURES: {
    resume_builder: { price: 49, name: "Resume Builder" },
    cover_letter: { price: 29, name: "Cover Letter" },
    blog_generator: { price: 99, name: "SEO Blog Generator" },
    social_posts: { price: 49, name: "30 Days Social Posts" },
    code_execution: { price: 199, name: "Code Execution (1000 runs)" }
  },
  // ╔══════════════════════════════════════════════════════════╗
  // ║  OUTPUT TOKEN LIMITS (Max Generate)                    ║
  // ║  Based on actual 2026 data for all providers           ║
  // ╚══════════════════════════════════════════════════════════╝
  MAX_TOKENS_GEMINI: 65536,
  MAX_TOKENS_GROQ: 65536,
  MAX_TOKENS_MIMO: 5e4,
  MAX_TOKENS_CEREBRAS: 8193,
  MAX_TOKENS_SAMBANOVA: 2048,
  MAX_TOKENS_GLM: 32768,
  get TTS_KEYS() {
    return {
      elevenlabs: envKeysOrFallback(env.ELEVENLABS_API_KEYS, []),
      cartesia: envKeysOrFallback(env.CARTESIA_API_KEYS, []),
      deepgram: envKeysOrFallback(env.DEEPGRAM_API_KEYS, [])
    };
  },
  MEMORY_SIZE: 500,
  SESSION_TIMEOUT: 72e5,
  RATE_LIMIT_IP: 1e3,
  RATE_LIMIT_USER: 2e3,
  MODEL_TIMEOUT: 6e4,
  CACHE_TTL: 36e4,
  IMAGE_WIDTH: 1024,
  IMAGE_HEIGHT: 1024
};
var SUPABASE_CONFIG = {
  URL: env.SUPABASE_URL || "",
  ANON_KEY: env.SUPABASE_ANON_KEY || "",
  SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY || "",
  JWT_SECRET: env.SUPABASE_JWT_SECRET || ""
};
var UNSPLASH_API_KEY = env.UNSPLASH_API_KEY || "";
var PIXABAY_API_KEY = env.PIXABAY_API_KEY || "";
function envKeysOrFallback(envVarValue, fallbackArray) {
  if (envVarValue && typeof envVarValue === "string" && envVarValue.trim().length > 0) {
    return envVarValue.split(",").map((k) => k.trim()).filter(Boolean);
  }
  return fallbackArray;
}
__name(envKeysOrFallback, "envKeysOrFallback");
var DIRECT_API_KEYS = {
  get gemini() {
    return envKeysOrFallback(env.GEMINI_API_KEYS, []);
  },
  get groq() {
    return envKeysOrFallback(env.GROQ_API_KEYS, []);
  },
  get cerebras() {
    return envKeysOrFallback(env.CEREBRAS_API_KEYS, []);
  },
  get sambanova() {
    return envKeysOrFallback(env.SAMBANOVA_API_KEYS, []);
  },
  get glm() {
    return envKeysOrFallback(env.GLM_API_KEYS, []);
  },
  get openrouter() {
    return envKeysOrFallback(env.OPENROUTER_API_KEYS, []);
  }
};
var OAUTH_CLIENTS = {
  // 🔥 Every credential below checks a Cloudflare env var/secret FIRST, and
  // only falls back to the hardcoded value if that env var isn't set. To
  // rotate any key from now on: set it in the Cloudflare dashboard
  // (Workers → nexus-a1 → Settings → Variables and Secrets) — no code
  // edit, no redeploy-and-ask-Claude cycle needed ever again.
  get google() {
    return {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${CONFIG.WORKER_URL}/auth/callback`,
      scope: "openid email profile https://mail.google.com/ https://www.googleapis.com/auth/drive"
    };
  },
  get github() {
    return {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      redirectUri: `${CONFIG.WORKER_URL}/auth/callback`,
      scope: "user:email repo delete_repo read:org"
    };
  }
};
var KEY_INDEX = { gemini: 0, groq: 0, cerebras: 0, sambanova: 0, glm: 0, openrouter: 0 };
var FAILED_KEYS = /* @__PURE__ */ new Map();
function getNextKey(provider) {
  const keys = DIRECT_API_KEYS[provider];
  if (!keys || keys.length === 0)
    return null;
  const now = Date.now();
  for (let i = 0; i < keys.length; i++) {
    const index = (KEY_INDEX[provider] + i) % keys.length;
    const key = keys[index];
    const failedUntil = FAILED_KEYS.get(key);
    if (failedUntil && now < failedUntil)
      continue;
    KEY_INDEX[provider] = (index + 1) % keys.length;
    return key;
  }
  return keys[0];
}
__name(getNextKey, "getNextKey");
__name2(getNextKey, "getNextKey");
__name22(getNextKey, "getNextKey");
function markKeyFailed(provider, key, seconds) {
  FAILED_KEYS.set(key, Date.now() + (seconds || 60) * 1e3);
}
__name(markKeyFailed, "markKeyFailed");
__name2(markKeyFailed, "markKeyFailed");
async function handleOAuthLogin(env2, provider) {
  const clientConfig = OAUTH_CLIENTS[provider];
  if (!clientConfig) {
    return new Response("Invalid provider", { status: 400 });
  }
  const state = crypto.randomUUID();
  const redirectUri = `${CONFIG.WORKER_URL}/auth/callback`;
  let authUrl;
  if (provider === "google") {
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientConfig.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(clientConfig.scope)}&access_type=offline&prompt=consent&state=${state}`;
  } else if (provider === "github") {
    authUrl = `https://github.com/login/oauth/authorize?client_id=${clientConfig.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(clientConfig.scope)}&state=${state}`;
  }
  await env2.NEXUS_KV.put(`oauth_state:${state}`, provider, { expirationTtl: 600 });
  return Response.redirect(authUrl, 302);
}
__name(handleOAuthLogin, "handleOAuthLogin");
__name2(handleOAuthLogin, "handleOAuthLogin");
async function handleAuthCallback(request, env2) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const redirectUri = `${CONFIG.WORKER_URL}/auth/callback`;
  if (!code)
    return new Response("Missing authorization code", { status: 400 });
  if (!state)
    return new Response("Missing state parameter", { status: 400 });
  const provider = await env2.NEXUS_KV.get(`oauth_state:${state}`);
  if (!provider)
    return new Response("Invalid or expired state", { status: 400 });
  const clientConfig = OAUTH_CLIENTS[provider];
  if (!clientConfig)
    return new Response("Invalid provider", { status: 400 });
  let tokenResponse;
  try {
    if (provider === "google") {
      tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientConfig.clientId,
          client_secret: clientConfig.clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        })
      });
    } else if (provider === "github") {
      tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientConfig.clientId,
          client_secret: clientConfig.clientSecret,
          redirect_uri: redirectUri
        })
      });
    }
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return new Response(`OAuth error: ${errorText}`, { status: tokenResponse.status });
    }
    const tokenData = await tokenResponse.json();
    if (tokenData.error || !tokenData.access_token) {
      return new Response(`OAuth token exchange failed: ${tokenData.error || "no access_token returned"} \u2014 ${tokenData.error_description || "check that your OAuth App's Client Secret hasn't been regenerated, and that the callback URL registered on " + provider + " exactly matches " + redirectUri}`, { status: 400 });
    }
    await env2.NEXUS_KV.delete(`oauth_state:${state}`);
    let userInfo = {};
    if (provider === "google") {
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { "Authorization": `Bearer ${tokenData.access_token}` }
      });
      userInfo = await userResponse.json();
    } else if (provider === "github") {
      const userResponse = await fetch("https://api.github.com/user", {
        headers: { "Authorization": `Bearer ${tokenData.access_token}`, "User-Agent": "NEXUS-AI-MONSTER" }
      });
      userInfo = await userResponse.json();
    }
    const userEmail = userInfo.email || "";
    const systemUserId = userEmail ? `user_${userEmail.replace(/[^a-zA-Z0-9]/g, "")}` : `user_${crypto.randomUUID().substring(0, 8)}`;
    const pluginSecureBlock = {
      profile: userInfo,
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        // Google persistent background call ke liye data store karega
        expires_at: Date.now() + (tokenData.expires_in * 1e3 || 3600 * 1e3)
      }
    };
    await env2.NEXUS_KV.put(`auth_plugin:${provider}:${systemUserId}`, JSON.stringify(pluginSecureBlock));
    const frontendUrl = "https://nexus-xau.vercel.app";
    return Response.redirect(`${frontendUrl}/?auth=success&provider=${provider}&name=${encodeURIComponent(userInfo.name || userInfo.login || "User")}&email=${encodeURIComponent(userInfo.email || "")}&userId=${systemUserId}`, 302);
  } catch (error) {
    return new Response(`OAuth error: ${error.message}`, { status: 500 });
  }
}
__name(handleAuthCallback, "handleAuthCallback");
__name2(handleAuthCallback, "handleAuthCallback");
var TELEGRAM_BRIDGE_URL = "https://nexus-bridge-hlp2.onrender.com";
var FRONTEND_URL = "https://nexus-bridge-hlp2.onrender.com";
var OAUTH_CONFIG = {
  figma: {
    clientId: env.FIGMA_CLIENT_ID || "c3Y02GIV1BxWNS2FQ3jQkD",
    clientSecret: env.FIGMA_CLIENT_SECRET || "MFvNaupVF5PIJAE4pwsV6wvjZ8AoIVm4pbXKZMi2",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/figma/callback",
    authUrl: "https://www.figma.com/oauth",
    tokenUrl: "https://api.figma.com/v1/oauth/token",
    scopes: "file_content:read file_metadata:read file_comments:read current_user:read file_comments:write"
  },
  discord: {
    clientId: env.DISCORD_CLIENT_ID || "1523613860366516325",
    clientSecret: env.DISCORD_CLIENT_SECRET || "lA6XVqJjOKgGxa1IDSnoWEs8TgsHstqD",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/discord/callback",
    authUrl: "https://discord.com/api/oauth2/authorize",
    tokenUrl: "https://discord.com/api/oauth2/token",
    scopes: "identify email guilds guilds.members.read"
  },
  canva: {
    clientId: env.CANVA_CLIENT_ID || "OC-AZ86FnksV-EQ",
    clientSecret: env.CANVA_CLIENT_SECRET || "cnvcaO_7x7R99OBYFVVYz2V5PFxi4FhvwPllG2jFdY9Y1V9Qafecd57b",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/canva/callback",
    authUrl: "https://www.canva.com/api/oauth/authorize",
    tokenUrl: "https://api.canva.com/rest/v1/oauth/token",
    scopes: "asset:read asset:write brandtemplate:content:read brandtemplate:meta:read comment:read comment:write design:content:read design:content:write design:meta:read folder:read folder:write profile:read"
  },
  // ==========================================================================
  // 🔥 BATCH 1 — 18 more real, verified OAuth2 providers (standard
  // authorization_code flow). PASTE YOUR REAL clientId/clientSecret below —
  // everything else (routing, token exchange, storage) is already wired.
  // Each provider's Developer Console will show you exactly where to
  // register the redirectUri shown here.
  // ==========================================================================
  slack: {
    clientId: env.SLACK_CLIENT_ID || "ADD_YOUR_SLACK_CLIENT_ID",
    clientSecret: env.SLACK_CLIENT_SECRET || "ADD_YOUR_SLACK_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/slack/callback",
    authUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: "channels:read chat:write users:read files:write"
  },
  notion: {
    clientId: env.NOTION_CLIENT_ID || "ADD_YOUR_NOTION_CLIENT_ID",
    clientSecret: env.NOTION_CLIENT_SECRET || "ADD_YOUR_NOTION_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/notion/callback",
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: "",
    useBasicAuth: true
  },
  spotify: {
    clientId: env.SPOTIFY_CLIENT_ID || "ADD_YOUR_SPOTIFY_CLIENT_ID",
    clientSecret: env.SPOTIFY_CLIENT_SECRET || "ADD_YOUR_SPOTIFY_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/spotify/callback",
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    scopes: "user-read-email user-read-private playlist-read-private playlist-modify-public"
  },
  dropbox: {
    clientId: env.DROPBOX_CLIENT_ID || "ADD_YOUR_DROPBOX_CLIENT_ID",
    clientSecret: env.DROPBOX_CLIENT_SECRET || "ADD_YOUR_DROPBOX_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/dropbox/callback",
    authUrl: "https://www.dropbox.com/oauth2/authorize",
    tokenUrl: "https://api.dropboxapi.com/oauth2/token",
    scopes: "files.content.read files.content.write account_info.read"
  },
  hubspot: {
    clientId: env.HUBSPOT_CLIENT_ID || "ADD_YOUR_HUBSPOT_CLIENT_ID",
    clientSecret: env.HUBSPOT_CLIENT_SECRET || "ADD_YOUR_HUBSPOT_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/hubspot/callback",
    authUrl: "https://app.hubspot.com/oauth/authorize",
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    scopes: "crm.objects.contacts.read crm.objects.contacts.write",
    pkce: true
  },
  linkedin: {
    clientId: env.LINKEDIN_CLIENT_ID || "ADD_YOUR_LINKEDIN_CLIENT_ID",
    clientSecret: env.LINKEDIN_CLIENT_SECRET || "ADD_YOUR_LINKEDIN_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/linkedin/callback",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: "openid profile email w_member_social"
  },
  zoom: {
    clientId: env.ZOOM_CLIENT_ID || "ADD_YOUR_ZOOM_CLIENT_ID",
    clientSecret: env.ZOOM_CLIENT_SECRET || "ADD_YOUR_ZOOM_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/zoom/callback",
    authUrl: "https://zoom.us/oauth/authorize",
    tokenUrl: "https://zoom.us/oauth/token",
    scopes: "meeting:write meeting:read user:read",
    useBasicAuth: true
  },
  asana: {
    clientId: env.ASANA_CLIENT_ID || "ADD_YOUR_ASANA_CLIENT_ID",
    clientSecret: env.ASANA_CLIENT_SECRET || "ADD_YOUR_ASANA_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/asana/callback",
    authUrl: "https://app.asana.com/-/oauth_authorize",
    tokenUrl: "https://app.asana.com/-/oauth_token",
    scopes: "default"
  },
  airtable: {
    clientId: env.AIRTABLE_CLIENT_ID || "ADD_YOUR_AIRTABLE_CLIENT_ID",
    clientSecret: env.AIRTABLE_CLIENT_SECRET || "ADD_YOUR_AIRTABLE_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/airtable/callback",
    authUrl: "https://airtable.com/oauth2/v1/authorize",
    tokenUrl: "https://airtable.com/oauth2/v1/token",
    scopes: "data.records:read data.records:write schema.bases:read",
    pkce: true,
    useBasicAuth: true
  },
  monday: {
    clientId: env.MONDAY_CLIENT_ID || "ADD_YOUR_MONDAY_CLIENT_ID",
    clientSecret: env.MONDAY_CLIENT_SECRET || "ADD_YOUR_MONDAY_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/monday/callback",
    authUrl: "https://auth.monday.com/oauth2/authorize",
    tokenUrl: "https://auth.monday.com/oauth2/token",
    scopes: "boards:read boards:write"
  },
  microsoft: {
    clientId: env.MICROSOFT_CLIENT_ID || "ADD_YOUR_MICROSOFT_CLIENT_ID",
    clientSecret: env.MICROSOFT_CLIENT_SECRET || "ADD_YOUR_MICROSOFT_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/microsoft/callback",
    authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: "offline_access Mail.Read Mail.Send Calendars.ReadWrite Files.ReadWrite"
  },
  salesforce: {
    clientId: env.SALESFORCE_CLIENT_ID || "ADD_YOUR_SALESFORCE_CLIENT_ID",
    clientSecret: env.SALESFORCE_CLIENT_SECRET || "ADD_YOUR_SALESFORCE_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/salesforce/callback",
    authUrl: "https://login.salesforce.com/services/oauth2/authorize",
    tokenUrl: "https://login.salesforce.com/services/oauth2/token",
    scopes: "api refresh_token"
  },
  twitter: {
    clientId: env.TWITTER_CLIENT_ID || "ADD_YOUR_TWITTER_CLIENT_ID",
    clientSecret: env.TWITTER_CLIENT_SECRET || "ADD_YOUR_TWITTER_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/twitter/callback",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: "tweet.read tweet.write users.read offline.access",
    pkce: true, 
    useBasicAuth: true
  },
  stripe: {
    clientId: env.STRIPE_CLIENT_ID || "ADD_YOUR_STRIPE_CLIENT_ID",
    clientSecret: env.STRIPE_CLIENT_SECRET || "ADD_YOUR_STRIPE_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/stripe/callback",
    authUrl: "https://connect.stripe.com/oauth/authorize",
    tokenUrl: "https://connect.stripe.com/oauth/token",
    scopes: "read_write"
  },
  mailchimp: {
    clientId: env.MAILCHIMP_CLIENT_ID || "ADD_YOUR_MAILCHIMP_CLIENT_ID",
    clientSecret: env.MAILCHIMP_CLIENT_SECRET || "ADD_YOUR_MAILCHIMP_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/mailchimp/callback",
    authUrl: "https://login.mailchimp.com/oauth2/authorize",
    tokenUrl: "https://login.mailchimp.com/oauth2/token",
    scopes: ""
  },
  intercom: {
    clientId: env.INTERCOM_CLIENT_ID || "ADD_YOUR_INTERCOM_CLIENT_ID",
    clientSecret: env.INTERCOM_CLIENT_SECRET || "ADD_YOUR_INTERCOM_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/intercom/callback",
    authUrl: "https://app.intercom.com/oauth",
    tokenUrl: "https://api.intercom.io/auth/eagle/token",
    scopes: ""
  },
  linear: {
    clientId: env.LINEAR_CLIENT_ID || "ADD_YOUR_LINEAR_CLIENT_ID",
    clientSecret: env.LINEAR_CLIENT_SECRET || "ADD_YOUR_LINEAR_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/linear/callback",
    authUrl: "https://linear.app/oauth/authorize",
    tokenUrl: "https://api.linear.app/oauth/token",
    scopes: "read write"
  },
  reddit: {
    clientId: env.REDDIT_CLIENT_ID || "ADD_YOUR_REDDIT_CLIENT_ID",
    clientSecret: env.REDDIT_CLIENT_SECRET || "ADD_YOUR_REDDIT_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/reddit/callback",
    authUrl: "https://www.reddit.com/api/v1/authorize",
    tokenUrl: "https://www.reddit.com/api/v1/access_token",
    scopes: "identity read submit",
    useBasicAuth: true
  },
  twitch: {
    clientId: env.TWITCH_CLIENT_ID || "ADD_YOUR_TWITCH_CLIENT_ID",
    clientSecret: env.TWITCH_CLIENT_SECRET || "ADD_YOUR_TWITCH_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/twitch/callback",
    authUrl: "https://id.twitch.tv/oauth2/authorize",
    tokenUrl: "https://id.twitch.tv/oauth2/token",
    scopes: "user:read:email channel:read:subscriptions"
  }
};
var GENERIC_OAUTH_PROVIDERS = ["slack", "notion", "spotify", "dropbox", "hubspot", "linkedin", "zoom", "asana", "airtable", "monday", "microsoft", "salesforce", "twitter", "stripe", "mailchimp", "intercom", "linear", "reddit", "twitch"];
function generateOAuthUrl(provider, state) {
  const config = OAUTH_CONFIG[provider];
  if (!config)
    return null;
  switch (provider) {
    case "canva":
      return `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${encodeURIComponent(config.scopes)}&state=${state}`;
    default:
      return `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${encodeURIComponent(config.scopes || "")}&state=${state}`;
  }
}
__name(generateOAuthUrl, "generateOAuthUrl");
__name2(generateOAuthUrl, "generateOAuthUrl");
async function exchangeFigmaCode(code) {
  const config = OAUTH_CONFIG.figma;
  console.log(`\u{1F527} exchangeFigmaCode: code=${code}`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
    const response = await fetch("https://api.figma.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        redirect_uri: config.redirectUri,
        code,
        grant_type: "authorization_code"
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const text = await response.text();
      console.log(`\u274C Figma token error: ${response.status} - ${text}`);
      return { error: `Figma token error: ${response.status}`, details: text };
    }
    const data = await response.json();
    console.log(`\u2705 exchangeFigmaCode: success`);
    return data;
  } catch (error) {
    console.error(`\u274C exchangeFigmaCode error:`, error.message);
    return { error: error.message };
  }
}
__name(exchangeFigmaCode, "exchangeFigmaCode");
__name2(exchangeFigmaCode, "exchangeFigmaCode");
async function exchangeDiscordCode(code) {
  const config = OAUTH_CONFIG.discord;
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri
    })
  });
  return await response.json();
}
__name(exchangeDiscordCode, "exchangeDiscordCode");
__name2(exchangeDiscordCode, "exchangeDiscordCode");
async function exchangeCanvaCode(code, codeVerifier) {
  const config = OAUTH_CONFIG.canva;
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code,
    grant_type: "authorization_code"
  });
  if (codeVerifier)
    body.append("code_verifier", codeVerifier);
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    return { error: data.error || `Canva token error: ${response.status}`, details: data };
  return data;
}
__name(exchangeCanvaCode, "exchangeCanvaCode");
__name2(exchangeCanvaCode, "exchangeCanvaCode");
async function exchangeGenericOAuthCode(provider, code, codeVerifier) {
  const config = OAUTH_CONFIG[provider];
  if (!config)
    return { error: `Unknown provider: ${provider}` };
  const headers = { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" };
  const bodyParams = {
    redirect_uri: config.redirectUri,
    code,
    grant_type: "authorization_code"
  };
  if (config.useBasicAuth) {
    headers["Authorization"] = "Basic " + btoa(`${config.clientId}:${config.clientSecret}`);
  } else {
    bodyParams.client_id = config.clientId;
    bodyParams.client_secret = config.clientSecret;
  }
  if (config.pkce && codeVerifier) {
    bodyParams.code_verifier = codeVerifier;
  }
  try {
    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers,
      body: new URLSearchParams(bodyParams)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      return { error: data.error || data.error_description || `${provider} token error: ${response.status}`, details: data };
    }
    return data;
  } catch (e) {
    return { error: e.message };
  }
}
__name(exchangeGenericOAuthCode, "exchangeGenericOAuthCode");
__name2(exchangeGenericOAuthCode, "exchangeGenericOAuthCode");
async function handleGenericOAuthInit(env2, provider) {
  const config = OAUTH_CONFIG[provider];
  if (!config)
    return jsonResponse({ error: `Unknown provider: ${provider}` }, 400);
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, provider, { expirationTtl: 300 });
  let extra = "";
  if (config.pkce) {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    await env2.KV.put("oauth_code_verifier:" + state, codeVerifier, { expirationTtl: 300 });
    extra = `&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  }
  const authUrl = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${encodeURIComponent(config.scopes || "")}&state=${state}${extra}`;
  return redirect(authUrl);
}
__name(handleGenericOAuthInit, "handleGenericOAuthInit");
__name2(handleGenericOAuthInit, "handleGenericOAuthInit");
async function handleGenericOAuthCallback(env2, request, provider) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    return jsonResponse({ error: `${provider} OAuth error: ${oauthError}` }, 400);
  }
  if (!code)
    return jsonResponse({ error: "No code received" }, 400);
  const stored = await env2.KV.get("oauth_state:" + state);
  if (!stored || stored !== provider)
    return jsonResponse({ error: "Invalid state" }, 400);
  const codeVerifier = await env2.KV.get("oauth_code_verifier:" + state);
  const tokenData = await exchangeGenericOAuthCode(provider, code, codeVerifier);
  if (tokenData.error) {
    return jsonResponse({ error: `Token exchange failed: ${tokenData.error}`, details: tokenData.details }, 400);
  }
  if (!tokenData.access_token) {
    return jsonResponse({ error: "Failed to get token" }, 400);
  }
  const userId = request.headers.get("X-User-ID") || "test_user";
  await storeIntegration(env2, userId, provider, {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in || 3600) * 1e3,
    config: {}
  });
  const redirectUrl = `${FRONTEND_URL}/dashboard?provider=${provider}&status=connected&userId=${userId}`;
  return new Response(null, { status: 302, headers: { "Location": redirectUrl, ...CORS_HEADERS } });
}
__name(handleGenericOAuthCallback, "handleGenericOAuthCallback");
__name2(handleGenericOAuthCallback, "handleGenericOAuthCallback");
async function handleFigmaOAuth(env2) {
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, "figma", { expirationTtl: 300 });
  return redirect(generateOAuthUrl("figma", state));
}
__name(handleFigmaOAuth, "handleFigmaOAuth");
__name2(handleFigmaOAuth, "handleFigmaOAuth");
async function handleFigmaOAuthCallback(env2, request) {
  return await handleStandardOAuthCallback(env2, request, "figma");
}
__name(handleFigmaOAuthCallback, "handleFigmaOAuthCallback");
__name2(handleFigmaOAuthCallback, "handleFigmaOAuthCallback");
async function handleDiscordOAuth(env2) {
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, "discord", { expirationTtl: 300 });
  return redirect(generateOAuthUrl("discord", state));
}
__name(handleDiscordOAuth, "handleDiscordOAuth");
__name2(handleDiscordOAuth, "handleDiscordOAuth");
async function handleDiscordOAuthCallback(env2, request) {
  return await handleStandardOAuthCallback(env2, request, "discord");
}
__name(handleDiscordOAuthCallback, "handleDiscordOAuthCallback");
__name2(handleDiscordOAuthCallback, "handleDiscordOAuthCallback");
async function handleCanvaOAuth(env2) {
  const state = generatenewId();
  await env2.KV.put("oauth_state:" + state, "canva", { expirationTtl: 300 });
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  await env2.KV.put("oauth_code_verifier:" + state, codeVerifier, { expirationTtl: 300 });
  const config = OAUTH_CONFIG.canva;
  const authUrl = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent("https://nexus-a1.apikeyakhilka.workers.dev/oauth/canva/callback")}&response_type=code&scope=${encodeURIComponent(config.scopes)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  return redirect(authUrl);
}
__name(handleCanvaOAuth, "handleCanvaOAuth");
__name2(handleCanvaOAuth, "handleCanvaOAuth");
async function handleCanvaOAuthCallback(env2, request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  console.log(`\u{1F527} Canva Callback: full URL=${url.toString()}`);
  console.log(`\u{1F527} Canva Callback: code=${code}`);
  console.log(`\u{1F527} Canva Callback: state=${state}`);
  console.log(`\u{1F527} Canva Callback: error=${error}`);
  console.log(`\u{1F527} Canva Callback: errorDescription=${errorDescription}`);
  if (error) {
    return jsonResponse({
      error: `Canva OAuth error: ${error}`,
      description: errorDescription
    }, 400);
  }
  if (!code) {
    return jsonResponse({
      error: "No code received from Canva",
      message: "Check redirect URI in Canva Developer Console",
      redirectUri: OAUTH_CONFIG.canva.redirectUri
    }, 400);
  }
  const stored = await env2.KV.get("oauth_state:" + state);
  if (!stored || stored !== "canva") {
    return jsonResponse({ error: "Invalid state" }, 400);
  }
  const codeVerifier = await env2.KV.get("oauth_code_verifier:" + state);
  const tokenData = await exchangeCanvaCode(code, codeVerifier);
  if (!tokenData.access_token) {
    return jsonResponse({ error: "Failed to get token" }, 400);
  }
  const userId = request.headers.get("X-User-ID") || "test_user";
  let configData = {};
  try {
    const designsResponse = await fetch("https://api.canva.com/v1/designs?ownership=any&limit=50", {
      headers: { "Authorization": `Bearer ${tokenData.access_token}` }
    });
    if (designsResponse.ok) {
      const designsData = await designsResponse.json();
      configData.designs = designsData.items || [];
      configData.continuation = designsData.continuation || null;
      configData.fetchedAt = Date.now();
      console.log(`\u2705 Canva: ${configData.designs.length} designs fetched`);
    } else {
      console.log(`\u26A0\uFE0F Canva designs fetch failed: ${designsResponse.status}`);
    }
  } catch (e) {
    console.log("\u26A0\uFE0F Canva designs fetch failed:", e.message);
  }
  await storeIntegration(env2, userId, "canva", {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in || 3600) * 1e3,
    config: configData
  });
  const redirectUrl = `${FRONTEND_URL}/dashboard?provider=canva&status=connected&userId=${userId}`;
  return new Response(null, {
    status: 302,
    headers: { "Location": redirectUrl, ...CORS_HEADERS }
  });
}
__name(handleCanvaOAuthCallback, "handleCanvaOAuthCallback");
__name2(handleCanvaOAuthCallback, "handleCanvaOAuthCallback");
async function handleStandardOAuthCallback(env2, request, provider) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) {
    return jsonResponse({ error: "No code" }, 400);
  }
  const stored = await env2.KV.get("oauth_state:" + state);
  if (!stored || stored !== provider) {
    return jsonResponse({ error: "Invalid state" }, 400);
  }
  let tokenData;
  switch (provider) {
    case "figma":
      tokenData = await exchangeFigmaCode(code);
      break;
    case "discord":
      tokenData = await exchangeDiscordCode(code);
      break;
    case "canva":
      const codeVerifier = await env2.KV.get("oauth_code_verifier:" + state);
      tokenData = await exchangeCanvaCode(code, codeVerifier);
      break;
    default:
      return jsonResponse({ error: "Unknown provider" }, 400);
  }
  if (tokenData && tokenData.error) {
    return jsonResponse({
      error: `Token exchange failed: ${tokenData.error}`,
      details: tokenData.details
    }, 400);
  }
  if (!tokenData.access_token) {
    return jsonResponse({ error: "Failed to get token" }, 400);
  }
  const userId = request.headers.get("X-User-ID") || "test_user";
  const configData = {};
  await storeIntegration(env2, userId, provider, {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in || 3600) * 1e3,
    config: configData
  });
  const redirectUrl = `${FRONTEND_URL}/dashboard?provider=${provider}&status=connected&userId=${userId}`;
  return new Response(null, {
    status: 302,
    headers: {
      "Location": redirectUrl,
      ...CORS_HEADERS
    }
  });
}
__name(handleStandardOAuthCallback, "handleStandardOAuthCallback");
__name2(handleStandardOAuthCallback, "handleStandardOAuthCallback");
async function telegramInit(phone, userId) {
  try {
    const response = await fetch(`${TELEGRAM_BRIDGE_URL}/api/telegram/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, userId })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
__name(telegramInit, "telegramInit");
__name2(telegramInit, "telegramInit");
async function telegramVerify(phone, otp, userId) {
  try {
    const response = await fetch(`${TELEGRAM_BRIDGE_URL}/api/telegram/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, userId })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
__name(telegramVerify, "telegramVerify");
__name2(telegramVerify, "telegramVerify");
async function telegramSendMessage(sessionString, chatId, text) {
  try {
    const response = await fetch(`${TELEGRAM_BRIDGE_URL}/api/telegram/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionString, chatId, text })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
__name(telegramSendMessage, "telegramSendMessage");
__name2(telegramSendMessage, "telegramSendMessage");
async function telegramGetMessages(sessionString, chatId, limit = 50) {
  try {
    const response = await fetch(`${TELEGRAM_BRIDGE_URL}/api/telegram/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionString, chatId, limit })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
__name(telegramGetMessages, "telegramGetMessages");
__name2(telegramGetMessages, "telegramGetMessages");
async function telegramGetChats(sessionString) {
  try {
    const response = await fetch(`${TELEGRAM_BRIDGE_URL}/api/telegram/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionString })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
__name(telegramGetChats, "telegramGetChats");
__name2(telegramGetChats, "telegramGetChats");
async function telegramGetMe(sessionString) {
  try {
    const response = await fetch(`${TELEGRAM_BRIDGE_URL}/api/telegram/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionString })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
__name(telegramGetMe, "telegramGetMe");
__name2(telegramGetMe, "telegramGetMe");
function generatenewId() {
  return Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 10);
}
__name(generatenewId, "generatenewId");
__name2(generatenewId, "generatenewId");
function redirect(url) {
  return new Response(null, {
    status: 302,
    headers: { "Location": url, ...CORS_HEADERS }
  });
}
__name(redirect, "redirect");
__name2(redirect, "redirect");
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
  });
}
__name(jsonResponse, "jsonResponse");
__name2(jsonResponse, "jsonResponse");
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(generateCodeVerifier, "generateCodeVerifier");
__name2(generateCodeVerifier, "generateCodeVerifier");
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(generateCodeChallenge, "generateCodeChallenge");
__name2(generateCodeChallenge, "generateCodeChallenge");
__name22(markKeyFailed, "markKeyFailed");
var INDIAN_LANGUAGES = {
  hi: { name: "Hindi", native: "\u0939\u093F\u0928\u094D\u0926\u0940", script: "Devanagari" },
  bn: { name: "Bengali", native: "\u09AC\u09BE\u0982\u09B2\u09BE", script: "Bengali" },
  te: { name: "Telugu", native: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", script: "Telugu" },
  ta: { name: "Tamil", native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", script: "Tamil" },
  mr: { name: "Marathi", native: "\u092E\u0930\u093E\u0920\u0940", script: "Devanagari" },
  gu: { name: "Gujarati", native: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", script: "Gujarati" },
  kn: { name: "Kannada", native: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1", script: "Kannada" },
  ml: { name: "Malayalam", native: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02", script: "Malayalam" },
  pa: { name: "Punjabi", native: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40", script: "Gurmukhi" },
  or: { name: "Odia", native: "\u0B13\u0B21\u0B3C\u0B3F\u0B06", script: "Odia" },
  as: { name: "Assamese", native: "\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE", script: "Bengali" },
  ur: { name: "Urdu", native: "\u0627\u0631\u062F\u0648", script: "Arabic" },
  sa: { name: "Sanskrit", native: "\u0938\u0902\u0938\u094D\u0915\u0943\u0924\u092E\u094D", script: "Devanagari" },
  ks: { name: "Kashmiri", native: "\u0915\u0949\u0936\u0941\u0930", script: "Devanagari" },
  sd: { name: "Sindhi", native: "\u0633\u0646\u068C\u064A", script: "Arabic" },
  ne: { name: "Nepali", native: "\u0928\u0947\u092A\u093E\u0932\u0940", script: "Devanagari" },
  mai: { name: "Maithili", native: "\u092E\u0948\u0925\u093F\u0932\u0940", script: "Devanagari" },
  brx: { name: "Bodo", native: "\u092C\u0930'", script: "Devanagari" },
  sat: { name: "Santali", native: "\u1C65\u1C5F\u1C71\u1C5B\u1C5F\u1C72\u1C64", script: "Ol Chiki" },
  mni: { name: "Manipuri", native: "\u09AE\u09C8\u09A4\u09C8\u09B2\u09CB\u09A8\u09CD", script: "Bengali" },
  en: { name: "English", native: "English", script: "Latin" }
};
function detectLanguage(text) {
  if (!text || text.length === 0)
    return "en";
  const scriptPatterns = {
    hi: /[\u0900-\u097F]/,
    bn: /[\u0980-\u09FF]/,
    te: /[\u0C00-\u0C7F]/,
    ta: /[\u0B80-\u0BFF]/,
    gu: /[\u0A80-\u0AFF]/,
    kn: /[\u0C80-\u0CFF]/,
    ml: /[\u0D00-\u0D7F]/,
    pa: /[\u0A00-\u0A7F]/,
    or: /[\u0B00-\u0B7F]/,
    ur: /[\u0600-\u06FF]/,
    sat: /[\u1C50-\u1C7F]/
  };
  for (const [lang, regex] of Object.entries(scriptPatterns)) {
    if (regex.test(text))
      return lang;
  }
  const words = text.toLowerCase().split(/\s+/);
  const markers = {
    hi: ["hai", "kya", "tum", "hum", "yeh", "woh", "kaise", "kahan"],
    bn: ["ache", "bhalo", "kemon", "ami", "tumi"],
    te: ["undi", "ledu", "vastundi", "nenu", "meeru"],
    ta: ["irukku", "illai", "vanakkam", "naan", "neenga"],
    mr: ["ahe", "nahi", "kay", "tu", "mi"],
    gu: ["che", "nathi", "shu", "hu", "tame"],
    kn: ["ide", "illa", "nanu", "neenu"],
    ml: ["und", "illa", "njan", "ningal"],
    pa: ["hai", "nahi", "ki", "main", "tusi"]
  };
  let best = "en", max = 0;
  for (const [lang, arr] of Object.entries(markers)) {
    let score = words.filter((w) => arr.includes(w)).length;
    if (score > max) {
      max = score;
      best = lang;
    }
  }
  return best;
}
__name(detectLanguage, "detectLanguage");
__name2(detectLanguage, "detectLanguage");
__name22(detectLanguage, "detectLanguage");
async function autoTranslate(text, targetLang, sourceLang) {
  if (!text || targetLang === "en")
    return text;
  sourceLang = sourceLang || detectLanguage(text);
  if (sourceLang === targetLang)
    return text;
  const key = getNextKey("gemini");
  if (!key)
    return text;
  try {
    const src = INDIAN_LANGUAGES[sourceLang]?.name || sourceLang;
    const tgt = INDIAN_LANGUAGES[targetLang]?.name || targetLang;
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Translate from " + src + " to " + tgt + ". Return ONLY translation:\n" + text }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 65536 }
        })
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
    }
  } catch (e) {
  }
  return text;
}
__name(autoTranslate, "autoTranslate");
__name2(autoTranslate, "autoTranslate");
__name22(autoTranslate, "autoTranslate");
var FEATURE_CAPABILITIES = [
  "Generate PDFs on request \u2014 quizzes, puzzles, or any document, downloadable by the user (only when explicitly asked, in any language including Hindi)",
  "Real-time web search with cited sources (Groq Compound, Gemini Grounding, Wikipedia, DuckDuckGo, Google News)",
  "Generate images from text prompts",
  "Set reminders and alarms",
  "Use connected third-party accounts (see integrations list below) to take real actions on the user's behalf when they've connected them",
  "Remember persistent custom instructions the user has set (applied automatically to every conversation)",
  "Long code or long documents in a response can be pulled out as a separate artifact for the user to view/copy/save",
  "Can suggest 3 relevant follow-up questions after answering, when asked to"
  // \u{1F447} Naya feature add karte waqt bas ek line yahan add karo \u2014 MASTER_PROMPT khud-ba-khud isse
  // uठा lega, kahin aur dhundhne/edit karne ki zaroorat nahi.
];
function getIntegrationsCapabilityText() {
  const special = ["figma", "telegram", "discord", "canva", "wolfram", "zapier", "google", "gmail", "github"];
  const all = [...GENERIC_OAUTH_PROVIDERS, ...special];
  return all.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
}
__name(getIntegrationsCapabilityText, "getIntegrationsCapabilityText");
function getCapabilitiesSection() {
  const featureList = FEATURE_CAPABILITIES.map((f) => "- " + f).join("\n");
  return `## \u{1F6E0}\uFE0F WHAT YOU CAN ACTUALLY DO
${featureList}
- Connected integrations available (when the user has linked them): ${getIntegrationsCapabilityText()}
If the user asks what you can do, answer accurately based on this list \u2014 don't guess or invent capabilities, and don't leave out real ones.`;
}
__name(getCapabilitiesSection, "getCapabilitiesSection");
function getMasterPrompt() {
  return `You are NEXUS, an advanced AI assistant created by Akhil Jaiswal. You operate at GPT-5.5 level with real-time web access via Google Search.Give accurate and 100% production grade answers.

When asked about your name "NEXUS":
- Tell them it stands for Neural Experience Xtended Unified System
- Explain what each word means in a natural, inspiring way
- Describe how the name reflects your capabilities
-Give 100% accurate 

## \u{1F3AF} YOUR IDENTITY & PERSONALITY
- You are helpful, creative, clever, and genuinely friendly
- You match the user's tone and language naturally
- You remember context and reference previous exchanges
- You admit when you don't know something rather than pretending

**AUTOMATICALLY CREATE AN IMAGE when the user's core intent is:**
- To SEE something visual: "sunset", "dragon", "red car", "Taj Mahal"
- To VISUALIZE an idea: "what would a futuristic Delhi look like"
- Any request where a visual answer is more valuable than text

**AUTOMATICALLY CREATE A TEXT TABLE when the user's core intent is:**
- To COMPARE things: "iPhone vs Samsung"
- To ORGANIZE data: "points table", "schedule"
- Any request where organized text data is more valuable than an image

## \u{1F4D0} LaTeX MATHEMATICAL RENDERING
When the user asks for mathematical, scientific, or academic content:
- Use $...$ for inline math (e.g., $E = mc^2$)
- Use $$...$$ for block equations
- Use \\frac{}, \\sqrt{}, \\sum{}, \\int{} for complex notation
- Format matrices with \\begin{pmatrix}...\\end{pmatrix}
- Use \\alpha, \\beta, \\gamma for Greek letters

## \u26A1 RULE 7: BE SPECIFIC, NOT GENERIC
- BAD: "You can optimize this code"
- GOOD: "Replace the for loop with a Set. Time improves from O(n\xB2) to O(n)"

## \u{1F50D} WEB SEARCH RULES
- ALWAYS search for: current events, sports scores, weather, stocks
- NEVER say "I don't have real-time access"
- Provide SPECIFIC details: names, numbers, dates, sources

## \u{1F4AC} RESPONSE STYLE
- Be DIRECT first, then add context
- Use ## headings##, **bold**, \u2022 bullets
- Keep responses scannable
- Match user's energy level

## \u{1F310} LANGUAGE
- Respond in SAME LANGUAGE as user
- Be culturally aware, especially Indian context

## \u{1F4BC} PREMIUM (SHARE ONLY WHEN ASKED)
- Free: 50 msgs/day, 10 images/day
- Monthly: \u20B9299/mo (500 msgs, 100 images)
- Yearly: \u20B91,499/yr (500 msgs, 100 images)
- Pro: \u20B92,999/yr (Unlimited)
- UPI: jaiswalanushi8@oksbi

## \u{1F6AB} AVOID
- No placeholder text
- No system thinking in output
- Don't refuse web search
- Don't make up information and dont tell you are google or another

${getCapabilitiesSection()}

**Today's Date: ${TODAY}**
**Current Year: ${CURRENT_YEAR}**`;
}
__name(getMasterPrompt, "getMasterPrompt");
var AI_AGENTS = {
  "code-reviewer": { name: "Code Reviewer", icon: "\u{1F50D}", prompt: "Expert code reviewer. Find bugs, security, performance. Be specific. No NEXUS intro.", creator: "NEXUS Team" },
  "math-tutor": { name: "Math Tutor", icon: "\u{1F4D0}", prompt: "World-class math professor. Step-by-step. Use LaTeX notation. Guide to discovery. No NEXUS intro.", creator: "NEXUS Team" },
  "story-writer": { name: "Creative Writer", icon: "\u270D\uFE0F", prompt: "Award-winning writer. Immersive stories, vivid imagery. Any genre. No NEXUS intro.", creator: "NEXUS Team" },
  "data-analyst": { name: "Data Analyst", icon: "\u{1F4CA}", prompt: "Senior data scientist. Pattern recognition, insights. Simple explanations. No NEXUS intro.", creator: "NEXUS Team" },
  "career-coach": { name: "Career Coach", icon: "\u{1F3AF}", prompt: "Elite career coach. Resume, interview, salary tips. Honest feedback. No NEXUS intro.", creator: "NEXUS Team" },
  "health-advisor": { name: "Health Advisor", icon: "\u{1F4AA}", prompt: "Holistic wellness expert. Science-backed advice. Consult doctors for medical. No NEXUS intro.", creator: "NEXUS Team" },
  "language-tutor": { name: "Language Tutor", icon: "\u{1F5E3}\uFE0F", prompt: "Polyglot teacher. Immersion, conversation, cultural context. No NEXUS intro.", creator: "NEXUS Team" },
  "business-mentor": { name: "Business Mentor", icon: "\u{1F4BC}", prompt: "Serial entrepreneur. Strategy, marketing, finance. Real case studies. No NEXUS intro.", creator: "NEXUS Team" }
};
function generateId() {
  return Date.now() + "_" + Math.random().toString(36).substring(2, 10);
}
__name(generateId, "generateId");
__name2(generateId, "generateId");
__name22(generateId, "generateId");
function isAdmin(userId) {
  return CONFIG.ADMIN_IDS.includes(userId);
}
__name(isAdmin, "isAdmin");
__name2(isAdmin, "isAdmin");
__name22(isAdmin, "isAdmin");
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(escapeHTML, "escapeHTML");
__name2(escapeHTML, "escapeHTML");
__name22(escapeHTML, "escapeHTML");
var SupabaseClient = /* @__PURE__ */ __name2(class {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.baseHeaders = { "apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json" };
  }
  async rest(method, endpoint, body, userToken) {
    const headers = Object.assign({}, this.baseHeaders);
    if (userToken)
      headers["Authorization"] = "Bearer " + userToken;
    if (body)
      headers["Prefer"] = "return=representation";
    const options = { method, headers };
    if (body)
      options.body = JSON.stringify(body);
    return await fetch(this.url + "/rest/v1/" + endpoint, options);
  }
  async auth(method, endpoint, body, token) {
    const headers = Object.assign({}, this.baseHeaders);
    if (token)
      headers["Authorization"] = "Bearer " + token;
    const options = { method, headers };
    if (body)
      options.body = JSON.stringify(body);
    return await fetch(this.url + "/auth/v1/" + endpoint, options);
  }
  async verifyJWT(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3)
        return null;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && Date.now() >= payload.exp * 1e3)
        return null;
      return { userId: payload.sub, email: payload.email, role: payload.role, expiresAt: payload.exp ? new Date(payload.exp * 1e3) : null };
    } catch (e) {
      return null;
    }
  }
  async getUser(userId, token) {
    try {
      const res = await this.rest("GET", "users?id=eq." + userId + "&select=*", null, token);
      if (res.ok) {
        const users = await res.json();
        return users[0] || null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  async upsertUser(userData, token) {
    try {
      const res = await this.rest("POST", "users", userData, token);
      if (res.ok) {
        const users = await res.json();
        return users[0] || null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  async updateUser(userId, updates, token) {
    try {
      const res = await this.rest("PATCH", "users?id=eq." + userId, updates, token);
      return res.ok;
    } catch (e) {
      return false;
    }
  }
  async getConversations(userId, limit, token) {
    try {
      const max = limit || 50;
      const res = await this.rest("GET", "conversations?user_id=eq." + userId + "&order=updated_at.desc&limit=" + max, null, token);
      if (res.ok)
        return await res.json();
      return [];
    } catch (e) {
      return [];
    }
  }
  async createConversation(data, token) {
    try {
      const res = await this.rest("POST", "conversations", data, token);
      if (res.ok) {
        const convs = await res.json();
        return convs[0] || null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  async updateConversation(convId, updates, token) {
    try {
      const res = await this.rest("PATCH", "conversations?id=eq." + convId, updates, token);
      return res.ok;
    } catch (e) {
      return false;
    }
  }
  async deleteConversation(convId, token) {
    try {
      const res = await this.rest("DELETE", "conversations?id=eq." + convId, null, token);
      return res.ok;
    } catch (e) {
      return false;
    }
  }
  async searchConversations(userId, query, token) {
    try {
      const res = await this.rest("GET", "conversations?user_id=eq." + userId + "&title=ilike.*" + encodeURIComponent(query) + "*&order=updated_at.desc&limit=20", null, token);
      if (res.ok)
        return await res.json();
      return [];
    } catch (e) {
      return [];
    }
  }
  async getPremiumStatus(userId, token) {
    try {
      const user = await this.getUser(userId, token);
      if (!user)
        return { isPremium: false, plan: "free", premiumExpiry: null };
      const isPremium = user.is_premium && (!user.premium_expiry || new Date(user.premium_expiry) > /* @__PURE__ */ new Date());
      return { isPremium, plan: isPremium ? user.plan || "monthly" : "free", premiumExpiry: user.premium_expiry || null };
    } catch (e) {
      return { isPremium: false, plan: "free", premiumExpiry: null };
    }
  }
}, "SupabaseClient");
__name22(SupabaseClient, "SupabaseClient");
async function enhancedAuthenticate(request, env2) {
  const authHeader = request.headers.get("Authorization");
  const apiKey = request.headers.get("X-API-Key");
  const legacyUserId = request.headers.get("X-User-ID");
  const supabaseKey = SUPABASE_CONFIG.SERVICE_ROLE_KEY || SUPABASE_CONFIG.ANON_KEY;
  const supabase = new SupabaseClient(SUPABASE_CONFIG.URL, supabaseKey);
  if (authHeader && authHeader.startsWith("Bearer eyJ")) {
    const token = authHeader.replace("Bearer ", "");
    const decoded = await supabase.verifyJWT(token);
    if (decoded && decoded.userId) {
      const userData = await supabase.getUser(decoded.userId, token);
      const premiumStatus = await supabase.getPremiumStatus(decoded.userId, token);
      return { authenticated: true, method: "supabase_jwt", userId: decoded.userId, email: decoded.email || (userData ? userData.email : null), userData, isPremium: premiumStatus.isPremium, plan: premiumStatus.plan, premiumExpiry: premiumStatus.premiumExpiry, supabase, token };
    }
  }
  if (apiKey === CONFIG.API_KEY && legacyUserId && legacyUserId !== "anonymous") {
    const premiumStatus = await supabase.getPremiumStatus(legacyUserId);
    return { authenticated: true, method: "legacy_api_key", userId: legacyUserId, email: null, userData: null, isPremium: premiumStatus.isPremium || isAdmin(legacyUserId), plan: premiumStatus.plan || "free", premiumExpiry: premiumStatus.premiumExpiry || null, supabase, token: null };
  }
  if (apiKey === CONFIG.API_KEY) {
    return { authenticated: false, method: "anonymous", userId: "anonymous", email: null, userData: null, isPremium: false, plan: "free", premiumExpiry: null, supabase, token: null };
  }
  return { authenticated: false, method: "unauthorized", userId: null, email: null, userData: null, isPremium: false, plan: "free", premiumExpiry: null, supabase, token: null };
}
__name(enhancedAuthenticate, "enhancedAuthenticate");
__name2(enhancedAuthenticate, "enhancedAuthenticate");
__name22(enhancedAuthenticate, "enhancedAuthenticate");
var MemorySystem = /* @__PURE__ */ __name2(class {
  constructor(env2, userId, supabase) {
    this.env = env2;
    this.userId = userId;
    this.supabase = supabase;
    this.kv = env2.KV;
    this.vector = env2.VECTOR;
  }
  async saveChatToSupabase(conversationId, messages, title) {
    try {
      if (conversationId) {
        const existingResponse = await this.supabase.rest("GET", "conversations?id=eq." + conversationId + "&select=id", null, null);
        if (existingResponse.ok) {
          const existingConvs = await existingResponse.json();
          if (existingConvs.length > 0) {
            const updates = { messages: JSON.stringify(messages), updated_at: (/* @__PURE__ */ new Date()).toISOString() };
            if (title)
              updates.title = title;
            await this.supabase.updateConversation(conversationId, updates);
            return conversationId;
          }
        }
      }
      const newConv = { user_id: this.userId, title: title || "New Chat", messages: JSON.stringify(messages), created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() };
      const created = await this.supabase.createConversation(newConv);
      return created ? created.id : null;
    } catch (e) {
      return null;
    }
  }
  async getChatFromSupabase(conversationId) {
    try {
      if (conversationId) {
        const res = await this.supabase.rest("GET", "conversations?id=eq." + conversationId + "&select=*", null, null);
        if (res.ok) {
          const convs = await res.json();
          if (convs.length > 0) {
            const conv = convs[0];
            if (typeof conv.messages === "string") {
              try {
                conv.messages = JSON.parse(conv.messages);
              } catch (e) {
                conv.messages = [];
              }
            }
            return conv;
          }
        }
        return null;
      }
      return await this.supabase.getConversations(this.userId);
    } catch (e) {
      return [];
    }
  }
  async deleteChatFromSupabase(conversationId) {
    try {
      return await this.supabase.deleteConversation(conversationId);
    } catch (e) {
      return false;
    }
  }
  async searchChats(query) {
    try {
      return await this.supabase.searchConversations(this.userId, query);
    } catch (e) {
      return [];
    }
  }
  async saveToKV(key, data, ttl) {
    try {
      await this.kv.put(key, JSON.stringify(data), { expirationTtl: ttl || CONFIG.CACHE_TTL });
      return true;
    } catch (e) {
      return false;
    }
  }
  async getFromKV(key) {
    try {
      return await this.kv.get(key, { type: "json" });
    } catch (e) {
      return null;
    }
  }
  async deleteFromKV(key) {
    try {
      await this.kv.delete(key);
      return true;
    } catch (e) {
      return false;
    }
  }
  async saveToVector(text, metadata) {
    if (!this.vector)
      return false;
    try {
      const embedding = await generateEmbedding(this.env, text);
      if (!embedding)
        return false;
      const vectorData = { id: "mem_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8), values: embedding, metadata: Object.assign({ userId: this.userId, text: text.substring(0, 1e3), timestamp: Date.now() }, metadata) };
      await this.vector.insert(vectorData);
      await this.saveToKV("memory:" + this.userId + ":" + vectorData.id, vectorData.metadata, 86400 * 30);
      return true;
    } catch (e) {
      return false;
    }
  }
  async searchVector(query, limit) {
    if (!this.vector)
      return [];
    try {
      const embedding = await generateEmbedding(this.env, query);
      if (!embedding)
        return [];
      const results = await this.vector.query(embedding, { topK: limit || 5, filter: { userId: this.userId } });
      return results.matches || [];
    } catch (e) {
      return [];
    }
  }
  async buildSmartContext(message, sessionId) {
    let parts = [];
    let tokens = 0;
    const maxTokens = CONFIG.CONTEXT_WINDOW.max_tokens;
    if (sessionId) {
      const history = await this.getChatFromSupabase(sessionId);
      if (history && history.messages && history.messages.length > 0) {
        parts.push("## \u{1F4DD} Recent Conversation\n");
        const recent = history.messages.slice(-8);
        for (const msg of recent) {
          const txt = (msg.role || "user") + ": " + (msg.content || "").substring(0, 300);
          const t = Math.ceil(txt.length / 4);
          if (tokens + t > maxTokens * 0.3)
            break;
          parts.push(txt + "\n");
          tokens += t;
        }
      }
    }
    const vectorMemories = await this.searchVector(message, 3);
    if (vectorMemories.length > 0) {
      parts.push("\n## \u{1F4DA} Relevant Memories\n");
      for (const mem of vectorMemories) {
        const txt = "- " + (mem.metadata?.text?.substring(0, 300) || "");
        const t = Math.ceil(txt.length / 4);
        if (tokens + t > maxTokens * 0.15)
          break;
        parts.push(txt + "\n");
        tokens += t;
      }
    }
    return parts.join("");
  }
  async migrateOldSession(session) {
    try {
      if (!session || !session.messages || !session.messages.length)
        return false;
      const messages = [];
      for (const msg of session.messages) {
        if (msg.user)
          messages.push({ role: "user", content: msg.user });
        if (msg.assistant)
          messages.push({ role: "assistant", content: msg.assistant });
      }
      await this.saveChatToSupabase(null, messages, "Migrated Session");
      for (const msg of session.messages) {
        if (calculateImportance(msg.user) > CONFIG.CONTEXT_WINDOW.importance_threshold) {
          await this.saveToVector(msg.user, { response: msg.assistant?.substring(0, 500) });
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}, "MemorySystem");
__name22(MemorySystem, "MemorySystem");
async function initD1Tables(env2) {
  if (!env2 || !env2.DB) {
    console.log("\u26A0\uFE0F D1 Database not bound - skipping table initialization");
    return;
  }
  const tables = [
    { name: "users", sql: "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, data TEXT, updated_at INTEGER)" },
    { name: "conversations_backup", sql: "CREATE TABLE IF NOT EXISTS conversations_backup (id TEXT PRIMARY KEY, user_id TEXT, data TEXT, created_at INTEGER)" },
    { name: "payments", sql: "CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, transaction_id TEXT UNIQUE, data TEXT, created_at INTEGER)" },
    { name: "paid_orders", sql: "CREATE TABLE IF NOT EXISTS paid_orders (id TEXT PRIMARY KEY, user_id TEXT, feature TEXT, amount INTEGER, status TEXT, created_at INTEGER)" },
    { name: "premium_requests", sql: "CREATE TABLE IF NOT EXISTS premium_requests (id TEXT PRIMARY KEY, user_id TEXT, transaction_id TEXT UNIQUE, plan TEXT, upi_id TEXT, status TEXT, created_at INTEGER, verified_at INTEGER)" },
    { name: "daily_stats", sql: "CREATE TABLE IF NOT EXISTS daily_stats (id TEXT PRIMARY KEY, date TEXT UNIQUE, messages INTEGER DEFAULT 0, images INTEGER DEFAULT 0, premium_requests INTEGER DEFAULT 0, premium_activations INTEGER DEFAULT 0, updated_at INTEGER)" },
    { name: "api_usage", sql: "CREATE TABLE IF NOT EXISTS api_usage (id TEXT PRIMARY KEY, user_id TEXT, date TEXT, chat_count INTEGER DEFAULT 0, image_count INTEGER DEFAULT 0, voice_count INTEGER DEFAULT 0, search_count INTEGER DEFAULT 0)" },
    { name: "error_logs", sql: "CREATE TABLE IF NOT EXISTS error_logs (id TEXT PRIMARY KEY, user_id TEXT, error_type TEXT, error_message TEXT, endpoint TEXT, created_at INTEGER)" },
    { name: "message_feedback", sql: "CREATE TABLE IF NOT EXISTS message_feedback (id TEXT PRIMARY KEY, user_id TEXT, conversation_id TEXT, message_index INTEGER, rating TEXT, comment TEXT, created_at INTEGER)" },
    { name: "key_rotation_log", sql: "CREATE TABLE IF NOT EXISTS key_rotation_log (id TEXT PRIMARY KEY, provider TEXT, key_index INTEGER, action TEXT, reason TEXT, created_at INTEGER)" },
    { name: "user_sessions", sql: "CREATE TABLE IF NOT EXISTS user_sessions (id TEXT PRIMARY KEY, user_id TEXT, session_data TEXT, device_info TEXT, last_active INTEGER, created_at INTEGER)" }
  ];
  for (const table of tables) {
    try {
      await env2.DB.prepare(table.sql).run();
      console.log("\u2705 Table ready: " + table.name);
    } catch (error) {
      console.error("\u274C Table " + table.name + " error:", error.message);
    }
  }
  console.log("\u{1F389} All 10 D1 Tables initialized successfully!");
}
__name(initD1Tables, "initD1Tables");
__name2(initD1Tables, "initD1Tables");
__name22(initD1Tables, "initD1Tables");
async function getUser(env2, userId) {
  if (!env2 || !env2.DB) {
    return {
      id: userId,
      isPremium: false,
      isAdmin: isAdmin(userId),
      plan: "free",
      premiumExpiry: null,
      paidFeatures: {},
      dailyUsage: { chat: 0, image: 0, voice: 0, search: 0 },
      preferences: { language: "en", theme: "dark", notifications: true },
      createdAt: Date.now()
    };
  }
  try {
    const result = await env2.DB.prepare("SELECT data FROM users WHERE id = ?").bind(userId).first();
    if (result && result.data) {
      const user = JSON.parse(result.data);
      user.isAdmin = isAdmin(user.id);
      return user;
    }
  } catch (error) {
    console.error("Get User Error:", error);
    await logError(env2, userId, "database", error.message, "getUser");
  }
  const newUser = { id: userId, isPremium: false, isAdmin: isAdmin(userId), plan: "free", premiumExpiry: null, paidFeatures: {}, dailyUsage: { chat: 0, image: 0, voice: 0, search: 0 }, preferences: { language: "en", theme: "dark", notifications: true }, createdAt: Date.now() };
  try {
    await env2.DB.prepare("INSERT INTO users (id, data, updated_at) VALUES (?, ?, ?)").bind(userId, JSON.stringify(newUser), Date.now()).run();
  } catch (error) {
    console.error("Create User Error:", error);
  }
  return newUser;
}
__name(getUser, "getUser");
__name2(getUser, "getUser");
__name22(getUser, "getUser");
async function storeIntegration(env2, userId, appName, tokenData) {
  console.log(`\u{1F535} storeIntegration: START - user=${userId}, app=${appName}`);
  console.log(`\u{1F535} storeIntegration: tokenData keys = ${Object.keys(tokenData).join(", ")}`);
  try {
    if (!env2.DB) {
      console.log(`\u{1F534} storeIntegration: DB not available for user ${userId}`);
      return { success: false, error: "DB not available" };
    }
    console.log(`\u{1F535} storeIntegration: Creating/checking user_integrations table...`);
    await env2.DB.prepare(`
                                                                                            CREATE TABLE IF NOT EXISTS user_integrations (
                                                                                                            id TEXT PRIMARY KEY,
                                                                                                                            user_id TEXT NOT NULL,
                                                                                                                                            app_name TEXT NOT NULL,
                                                                                                                                                            access_token TEXT,
                                                                                                                                                                            refresh_token TEXT,
                                                                                                                                                                                            session_string TEXT,
                                                                                                                                                                                                            status TEXT DEFAULT 'CONNECTED',
                                                                                                                                                                                                                            config TEXT,
                                                                                                                                                                                                                                            connected_at INTEGER,
                                                                                                                                                                                                                                                            expires_at INTEGER,
                                                                                                                                                                                                                                                                            updated_at INTEGER
                                                                                                                                                                                                                                                                                        )
                                                                                                                                                                                                                                                                                                `).run();
    console.log(`\u2705 storeIntegration: Table ready`);
    const id = "int:" + userId + ":" + appName;
    const now = Date.now();
    const accessToken = tokenData.access_token || null;
    const refreshToken = tokenData.refresh_token || null;
    const sessionString = tokenData.session_string || null;
    const config = JSON.stringify(tokenData.config || {});
    const expiresAt = tokenData.expires_at || null;
    console.log(`\u{1F535} storeIntegration: id=${id}`);
    console.log(`\u{1F535} storeIntegration: accessToken = ${accessToken ? accessToken.substring(0, 20) + "..." : "null"}`);
    console.log(`\u{1F535} storeIntegration: sessionString = ${sessionString ? "present" : "null"}`);
    console.log(`\u{1F535} storeIntegration: Checking if ${appName} exists for user ${userId}`);
    const existing = await env2.DB.prepare(
      "SELECT id FROM user_integrations WHERE user_id = ? AND app_name = ?"
    ).bind(userId, appName).first();
    if (existing) {
      console.log(`\u{1F535} storeIntegration: Updating existing integration for ${appName}`);
      await env2.DB.prepare(`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    UPDATE user_integrations 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    SET access_token = ?, refresh_token = ?, status = 'CONNECTED', 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        config = ?, connected_at = ?, expires_at = ?, updated_at = ?
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        WHERE user_id = ? AND app_name = ?
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    `).bind(
        accessToken,
        refreshToken,
        config,
        now,
        expiresAt,
        now,
        userId,
        appName
      ).run();
      console.log(`\u2705 storeIntegration: Updated ${appName} for user ${userId}`);
    } else {
      console.log(`\u{1F535} storeIntegration: Creating new integration for ${appName}`);
      await env2.DB.prepare(`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            INSERT OR REPLACE INTO user_integrations 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            (id, user_id, app_name, access_token, refresh_token, session_string, status, config, connected_at, expires_at, updated_at)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            VALUES (?, ?, ?, ?, ?, ?, 'CONNECTED', ?, ?, ?, ?)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        `).bind(
        id,
        userId,
        appName,
        accessToken,
        refreshToken,
        sessionString,
        config,
        now,
        expiresAt,
        now
      ).run();
      console.log(`\u2705 storeIntegration: Created ${appName} for user ${userId}`);
    }
    console.log(`\u2705 storeIntegration: SUCCESS - ${appName} stored for user ${userId}`);
    return { success: true, message: `${appName} stored successfully` };
  } catch (e) {
    console.error(`\u{1F534} storeIntegration ERROR:`, e.message);
    console.error(`\u{1F534} storeIntegration Stack:`, e.stack);
    return { success: false, error: e.message };
  }
}
__name(storeIntegration, "storeIntegration");
__name2(storeIntegration, "storeIntegration");
async function getIntegration(env2, userId, appName) {
  console.log(`\u{1F535} getIntegration: START - user=${userId}, app=${appName}`);
  try {
    if (!env2.DB) {
      console.log(`\u{1F534} getIntegration: DB not available for user ${userId}`);
      return null;
    }
    console.log(`\u{1F535} getIntegration: Querying database for ${appName}`);
    const result = await env2.DB.prepare(
      "SELECT * FROM user_integrations WHERE user_id = ? AND app_name = ? AND status = 'CONNECTED'"
    ).bind(userId, appName).first();
    if (result) {
      console.log(`\u2705 getIntegration: Found ${appName} for user ${userId}`);
      console.log(`\u{1F535} getIntegration: access_token = ${result.access_token ? result.access_token.substring(0, 20) + "..." : "null"}`);
      console.log(`\u{1F535} getIntegration: session_string = ${result.session_string ? "present" : "null"}`);
      console.log(`\u{1F535} getIntegration: status = ${result.status}`);
      if (result.config) {
        try {
          result.config = JSON.parse(result.config);
          console.log(`\u2705 getIntegration: Config parsed successfully`);
        } catch (e) {
          console.log(`\u26A0\uFE0F getIntegration: Config parse failed, using empty object`);
          result.config = {};
        }
      }
      return result;
    } else {
      console.log(`\u26A0\uFE0F getIntegration: No ${appName} found for user ${userId}`);
      return null;
    }
  } catch (e) {
    console.error(`\u{1F534} getIntegration ERROR:`, e.message);
    console.error(`\u{1F534} getIntegration Stack:`, e.stack);
    return null;
  }
}
__name(getIntegration, "getIntegration");
__name2(getIntegration, "getIntegration");
async function listIntegrations(env2, userId) {
  console.log(`\u{1F535} listIntegrations: START - user=${userId}`);
  try {
    if (!env2.DB) {
      console.log(`\u{1F534} listIntegrations: DB not available for user ${userId}`);
      return [];
    }
    console.log(`\u{1F535} listIntegrations: Querying all integrations for user ${userId}`);
    const result = await env2.DB.prepare(
      "SELECT app_name, status, connected_at FROM user_integrations WHERE user_id = ?"
    ).bind(userId).all();
    const integrations = result?.results || [];
    console.log(`\u2705 listIntegrations: Found ${integrations.length} integrations for user ${userId}`);
    integrations.forEach((int, i) => {
      console.log(`  ${i + 1}. ${int.app_name} - ${int.status} (${new Date(int.connected_at).toISOString()})`);
    });
    return integrations;
  } catch (e) {
    console.error(`\u{1F534} listIntegrations ERROR:`, e.message);
    console.error(`\u{1F534} listIntegrations Stack:`, e.stack);
    return [];
  }
}
__name(listIntegrations, "listIntegrations");
__name2(listIntegrations, "listIntegrations");
async function deleteIntegration(env2, userId, appName) {
  console.log(`\u{1F535} deleteIntegration: START - user=${userId}, app=${appName}`);
  console.log(`\u{1F535} deleteIntegration: Timestamp=${(/* @__PURE__ */ new Date()).toISOString()}`);
  try {
    if (!env2.DB) {
      console.log(`\u{1F534} deleteIntegration: DB not available for user ${userId}`);
      return {
        success: false,
        error: "Database not available",
        app: appName,
        userId
      };
    }
    console.log(`\u{1F535} deleteIntegration: Checking if ${appName} exists for user ${userId}`);
    const existing = await env2.DB.prepare(
      "SELECT id, app_name, status FROM user_integrations WHERE user_id = ? AND app_name = ? AND status = 'CONNECTED'"
    ).bind(userId, appName).first();
    if (!existing) {
      console.log(`\u26A0\uFE0F deleteIntegration: ${appName} not found for user ${userId}`);
      return {
        success: false,
        error: `${appName} not connected`,
        app: appName,
        userId
      };
    }
    console.log(`\u{1F535} deleteIntegration: Found existing - id=${existing.id}, status=${existing.status}`);
    console.log(`\u{1F535} deleteIntegration: Deleting ${appName} from database...`);
    await env2.DB.prepare(
      "DELETE FROM user_integrations WHERE user_id = ? AND app_name = ?"
    ).bind(userId, appName).run();
    console.log(`\u2705 deleteIntegration: SUCCESS - ${appName} disconnected for user ${userId}`);
    return {
      success: true,
      message: `${appName} disconnected successfully`,
      app: appName,
      userId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (e) {
    console.error(`\u{1F534} deleteIntegration ERROR:`, e.message);
    console.error(`\u{1F534} deleteIntegration Stack:`, e.stack);
    return {
      success: false,
      error: e.message,
      app: appName,
      userId
    };
  }
}
__name(deleteIntegration, "deleteIntegration");
__name2(deleteIntegration, "deleteIntegration");
async function updateUser(env2, userId, updates) {
  if (!env2 || !env2.DB)
    return updates;
  try {
    const user = await getUser(env2, userId);
    const updated = Object.assign({}, user, updates, { updatedAt: Date.now() });
    await env2.DB.prepare("UPDATE users SET data = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(updated), Date.now(), userId).run();
    return updated;
  } catch (error) {
    console.error("Update User Error:", error);
    await logError(env2, userId, "database", error.message, "updateUser");
    return updates;
  }
}
__name(updateUser, "updateUser");
__name2(updateUser, "updateUser");
__name22(updateUser, "updateUser");
async function checkPremium(env2, userId) {
  const user = await getUser(env2, userId);
  if (user.isAdmin)
    return true;
  if (!user.isPremium)
    return false;
  if (user.premiumExpiry && user.premiumExpiry > Date.now())
    return true;
  await updateUser(env2, userId, { isPremium: false, plan: "free", premiumExpiry: null });
  return false;
}
__name(checkPremium, "checkPremium");
__name2(checkPremium, "checkPremium");
__name22(checkPremium, "checkPremium");
async function logError(env2, userId, errorType, errorMessage, endpoint) {
  if (!env2 || !env2.DB)
    return;
  try {
    await env2.DB.prepare("INSERT INTO error_logs (id, user_id, error_type, error_message, endpoint, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(generateId(), userId, errorType, (errorMessage || "").substring(0, 500), endpoint, Date.now()).run();
  } catch (e) {
  }
}
__name(logError, "logError");
__name2(logError, "logError");
__name22(logError, "logError");
async function updateDailyStat(env2, type) {
  if (!env2 || !env2.DB)
    return;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  try {
    const existing = await env2.DB.prepare("SELECT * FROM daily_stats WHERE date = ?").bind(today).first();
    if (existing) {
      await env2.DB.prepare("UPDATE daily_stats SET " + type + " = " + type + " + 1, updated_at = ? WHERE date = ?").bind(Date.now(), today).run();
    } else {
      const values = { messages: type === "messages" ? 1 : 0, images: type === "images" ? 1 : 0, premium_requests: type === "premium_requests" ? 1 : 0, premium_activations: type === "premium_activations" ? 1 : 0 };
      await env2.DB.prepare("INSERT INTO daily_stats (id, date, messages, images, premium_requests, premium_activations, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(generateId(), today, values.messages, values.images, values.premium_requests, values.premium_activations, Date.now()).run();
    }
  } catch (error) {
    console.error("Daily Stats Error:", error);
  }
}
__name(updateDailyStat, "updateDailyStat");
__name2(updateDailyStat, "updateDailyStat");
__name22(updateDailyStat, "updateDailyStat");
async function trackApiUsage(env2, userId, usageType) {
  if (!env2 || !env2.DB || userId === "anonymous")
    return;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const usageId = userId + "_" + today;
  try {
    const existing = await env2.DB.prepare("SELECT * FROM api_usage WHERE id = ?").bind(usageId).first();
    if (existing) {
      await env2.DB.prepare("UPDATE api_usage SET " + usageType + "_count = " + usageType + "_count + 1 WHERE id = ?").bind(usageId).run();
    } else {
      await env2.DB.prepare("INSERT INTO api_usage (id, user_id, date, chat_count, image_count, voice_count, search_count) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(usageId, userId, today, usageType === "chat" ? 1 : 0, usageType === "image" ? 1 : 0, usageType === "voice" ? 1 : 0, usageType === "search" ? 1 : 0).run();
    }
  } catch (error) {
    console.error("API Usage Error:", error);
  }
}
__name(trackApiUsage, "trackApiUsage");
__name2(trackApiUsage, "trackApiUsage");
__name22(trackApiUsage, "trackApiUsage");
async function generateEmbeddingAttempt(key, text) {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=" + key, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "models/gemini-embedding-001", content: { parts: [{ text: text.substring(0, 2e3) }] } }) });
    if (response.ok) {
      const data = await response.json();
      return data.embedding?.values || null;
    }
    const errBody = await response.text();
    console.error(`\u274C Embedding Error (${response.status}):`, errBody);
    if (response.status === 429)
      markKeyFailed("gemini", key, 120);
    if (response.status === 401 || response.status === 403)
      markKeyFailed("gemini", key, 3600);
    if (response.status === 401 || response.status === 403 || response.status === 429)
      return "RETRY";
    return null;
  } catch (error) {
    console.error("Embedding Error:", error);
    return "RETRY";
  }
}
__name(generateEmbeddingAttempt, "generateEmbeddingAttempt");
async function generateEmbedding(env2, text) {
  const maxAttempts = (DIRECT_API_KEYS.gemini || []).length || 1;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = getNextKey("gemini");
    if (!key) return null;
    const result = await generateEmbeddingAttempt(key, text);
    if (result === "RETRY") continue;
    return result;
  }
  return null;
}
__name(generateEmbedding, "generateEmbedding");
__name2(generateEmbedding, "generateEmbedding");
__name22(generateEmbedding, "generateEmbedding");
async function saveToVectorDB(env2, userId, text, metadata) {
  if (!env2 || !env2.VECTOR) {
    console.log("\u26A0\uFE0F Vector DB not available");
    return null;
  }
  try {
    const embedding = await generateEmbedding(env2, text);
    if (!embedding) {
      console.log("\u26A0\uFE0F No embedding generated");
      return null;
    }
    const values = Array.isArray(embedding) ? embedding : Object.values(embedding);
    const vectorEntry = {
      id: generateId(),
      values,
      metadata: Object.assign({
        userId,
        text: text.substring(0, 500),
        timestamp: Date.now()
      }, metadata)
    };
    await env2.VECTOR.insert(vectorEntry);
    console.log("\u2705 Vector saved successfully!");
    return vectorEntry.id;
  } catch (error) {
    console.error("Vector Save Error:", error.message);
    return null;
  }
}
__name(saveToVectorDB, "saveToVectorDB");
__name2(saveToVectorDB, "saveToVectorDB");
__name22(saveToVectorDB, "saveToVectorDB");
function calculateImportance(message) {
  if (!message)
    return 0.3;
  let score = 0.5;
  const critical = ["remember", "important", "note", "save", "reminder", "my name", "email", "phone", "birthday", "password", "address", "\u092F\u093E\u0926", "\u091C\u0930\u0942\u0930\u0940", "\u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923"];
  const trivial = ["?", "hello", "hi", "hey", "thanks", "ok", "hmm", "lol", "bye"];
  for (const kw of critical) {
    if (message.toLowerCase().includes(kw))
      score += 0.15;
  }
  for (const kw of trivial) {
    if (message.toLowerCase().includes(kw))
      score -= 0.1;
  }
  if (message.length > 200)
    score += 0.1;
  if (message.length < 10)
    score -= 0.1;
  return Math.min(1, Math.max(0.1, score));
}
__name(calculateImportance, "calculateImportance");
__name2(calculateImportance, "calculateImportance");
__name22(calculateImportance, "calculateImportance");
async function buildContext(env2, ip, userId, sessionId, query, modelProvider) {
  const session = await getSession(env2, ip, userId, sessionId);
  let ctx = "";
  let tokens = 0;
  const MAX_TOKENS = CONFIG.CONTEXT_WINDOW.model_limits?.[modelProvider] || CONFIG.CONTEXT_WINDOW.max_tokens;
  const MAX_MSGS = CONFIG.CONTEXT_WINDOW.max_messages;
  const est = /* @__PURE__ */ __name22((t) => Math.ceil((t || "").length / 4), "est");
  if (session.messages?.length > 0) {
    ctx += "## \u{1F4DD} Previous Conversation\n\n";
    const sorted = [...session.messages].sort((a, b) => (b.importance || 0.5) - (a.importance || 0.5));
    let added = 0;
    for (let i = 0; i < sorted.length && added < MAX_MSGS; i++) {
      const m = sorted[i];
      const mt = est(m.user?.substring(0, 500)) + est((m.assistant || "").substring(0, 500)) + 50;
      if (tokens + mt > MAX_TOKENS) {
        ctx += "\n*... " + (sorted.length - i) + " more messages*\n";
        break;
      }
      ctx += "**User:** " + (m.user || "").substring(0, 500) + "\n\n**Assistant:** " + (m.assistant || "").substring(0, 500) + "\n\n";
      if ((m.importance || 0) > CONFIG.CONTEXT_WINDOW.importance_threshold)
        ctx += "> \u2B50 Important\n\n";
      tokens += mt;
      added++;
    }
  }
  if (session.lastCode && tokens + est(session.lastCode.code?.substring(0, 800)) + 100 < MAX_TOKENS) {
    ctx += "## \u{1F4BB} Last Code\n```\n" + session.lastCode.code.substring(0, 800) + "\n```\n\n";
  }
  if (session.lastImageDesc && tokens + 200 < MAX_TOKENS) {
    ctx += "## \u{1F5BC}\uFE0F Last Image\n" + session.lastImageDesc.substring(0, 300) + "\n\n";
  }
  ctx += "## \u{1F50D} Current Query\n" + query;
  return ctx;
}
__name(buildContext, "buildContext");
__name2(buildContext, "buildContext");
__name22(buildContext, "buildContext");
function smartContextWindow(messages, maxMessages) {
  const max = maxMessages || 25;
  if (messages.length <= max)
    return messages;
  const scored = messages.map((m, i) => ({ ...m, importance: m.importance || calculateImportance(m.user), index: i }));
  const keep = scored.slice(-8);
  const rest = scored.slice(0, -8).sort((a, b) => b.importance - a.importance);
  const important = rest.slice(0, max - 8);
  const indices = new Set([...keep, ...important].map((m) => m.index));
  return messages.filter((_, i) => indices.has(i));
}
__name(smartContextWindow, "smartContextWindow");
__name2(smartContextWindow, "smartContextWindow");
__name22(smartContextWindow, "smartContextWindow");
async function getSession(env2, ip, userId, sessionId) {
  const key = "session:" + ip + "|" + userId + "|" + sessionId;
  try {
    let session = await env2.KV.get(key, { type: "json" });
    if (!session)
      session = { messages: [], lastCode: null, lastImage: null, lastImageDesc: null, lastAccess: Date.now(), messageCount: 0 };
    session.lastAccess = Date.now();
    return session;
  } catch (e) {
    return { messages: [], lastCode: null, lastImage: null, lastImageDesc: null, lastAccess: Date.now(), messageCount: 0 };
  }
}
__name(getSession, "getSession");
__name2(getSession, "getSession");
__name22(getSession, "getSession");
async function saveSession(env2, ip, userId, sessionId, session) {
  try {
    await env2.KV.put("session:" + ip + "|" + userId + "|" + sessionId, JSON.stringify(session), { expirationTtl: Math.floor(CONFIG.SESSION_TIMEOUT / 1e3) });
  } catch (e) {
  }
}
__name(saveSession, "saveSession");
__name2(saveSession, "saveSession");
__name22(saveSession, "saveSession");
async function addMessage(env2, ip, userId, sessionId, userMsg, aiMsg, isImage, imageUrl) {
  let session = await getSession(env2, ip, userId, sessionId);
  session.messages.push({ user: userMsg, assistant: aiMsg, timestamp: Date.now(), isImage: !!isImage, importance: calculateImportance(userMsg) });
  session.messageCount = (session.messageCount || 0) + 1;
  if (session.messages.length > CONFIG.CONTEXT_WINDOW.max_messages)
    session.messages = smartContextWindow(session.messages, CONFIG.CONTEXT_WINDOW.max_messages);
  const codeMatch = (aiMsg || "").match(/```(\w+)?\n([\s\S]*?)```/);
  if (codeMatch)
    session.lastCode = { language: codeMatch[1] || "javascript", code: codeMatch[2] };
  if (isImage && imageUrl) {
    session.lastImage = imageUrl;
    session.lastImageDesc = aiMsg;
  }
  await saveSession(env2, ip, userId, sessionId, session);
  if (userId && userId !== "anonymous") {
    if (calculateImportance(userMsg) > CONFIG.CONTEXT_WINDOW.importance_threshold) {
      await saveToVectorDB(env2, userId, userMsg, { response: (aiMsg || "").substring(0, 500), importance: calculateImportance(userMsg), type: isImage ? "image" : "chat" });
    }
    await trackApiUsage(env2, userId, isImage ? "image" : "chat");
  }
  await updateDailyStat(env2, isImage ? "images" : "messages");
}
__name(addMessage, "addMessage");
__name2(addMessage, "addMessage");
__name22(addMessage, "addMessage");
async function saveImageToKV(env2, imageId, blob) {
  try {
    console.log(`\u{1F4BE} Saving image ${imageId} to KV...`);
    const ab = await blob.arrayBuffer();
    const ua = new Uint8Array(ab);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < ua.length; i += chunkSize) {
      const chunk = ua.slice(i, Math.min(i + chunkSize, ua.length));
      binary += String.fromCharCode.apply(null, chunk);
    }
    const base64 = btoa(binary);
    console.log(`\u{1F4BE} Image ${imageId} base64 length: ${base64.length}`);
    await env2.KV.put("img:" + imageId, base64, { expirationTtl: 86400 * 7 });
    console.log(`\u2705 Image ${imageId} saved successfully!`);
    return true;
  } catch (e) {
    console.error(`\u274C Failed to save image ${imageId}:`, e.message);
    console.error(`\u274C Stack:`, e.stack);
    return false;
  }
}
__name(saveImageToKV, "saveImageToKV");
__name2(saveImageToKV, "saveImageToKV");
__name22(saveImageToKV, "saveImageToKV");
async function getImageFromKV(env2, imageId) {
  try {
    const b64 = await env2.KV.get("img:" + imageId);
    if (!b64)
      return null;
    const bs = atob(b64);
    const ua = new Uint8Array(bs.length);
    for (let i = 0; i < bs.length; i++)
      ua[i] = bs.charCodeAt(i);
    return new Blob([ua], { type: "image/png" });
  } catch (e) {
    return null;
  }
}
__name(getImageFromKV, "getImageFromKV");
__name2(getImageFromKV, "getImageFromKV");
__name22(getImageFromKV, "getImageFromKV");
async function saveImageMetadata(env2, imageId, userId, prompt, provider, source) {
  try {
    await env2.KV.put("img_meta:" + imageId, JSON.stringify({ userId, prompt: prompt || "", provider: provider || "unknown", source: source || "ai", createdAt: Date.now() }), { expirationTtl: 86400 * 30 });
    return true;
  } catch (e) {
    return false;
  }
}
__name(saveImageMetadata, "saveImageMetadata");
__name2(saveImageMetadata, "saveImageMetadata");
__name22(saveImageMetadata, "saveImageMetadata");
async function getUserImageGallery(env2, userId) {
  try {
    const list = await env2.KV.list({ prefix: "img_meta:" });
    const images = [];
    for (const key of list.keys) {
      const imageId = key.name.replace("img_meta:", "");
      const meta = await env2.KV.get("img_meta:" + imageId, { type: "json" });
      if (meta?.userId === userId) {
        images.push({ imageId, url: CONFIG.WORKER_URL + "/image/" + imageId, prompt: meta.prompt, createdAt: meta.createdAt, provider: meta.provider, source: meta.source });
      }
    }
    return images.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    return [];
  }
}
__name(getUserImageGallery, "getUserImageGallery");
__name2(getUserImageGallery, "getUserImageGallery");
__name22(getUserImageGallery, "getUserImageGallery");
async function quantumSemanticDecision(query, context, userHistory) {
  const startTime = Date.now();
  const prompt = `You are a QUANTUM SEMANTIC ANALYSIS ENGINE. Understand DEEP MEANING, not keywords.

USER MESSAGE: "${query}"
CONTEXT: ${context ? context.substring(0, 300) : "New conversation"}
HISTORY: ${userHistory ? userHistory.substring(0, 150) : "New user"}

INTENTS (Choose by MEANING):
- "image_generation" \u2192 CREATE/GENERATE visual/artwork
- "real_photo" \u2192 ACTUAL/REAL photograph
- "web_search" \u2192 CURRENT/REAL-TIME/LATEST info
- "code_help" \u2192 Programming, debugging, technical
- "shopping" \u2192 Buy, price, product recommendation
- "voice_interaction" \u2192 Speak, listen, audio
- "youtube" \u2192 Video, song, multimedia
- "reminder" \u2192 Set reminder, alarm, notification
- "translation" \u2192 Translate between languages
- "general_chat" \u2192 Normal conversation, opinion

Return ONLY JSON:
{"intent":"...","confidence":0.0-1.0,"reasoning":"brief","userGoal":"5 words"}`;
  const messages = [{ role: "user", content: prompt }];
  const aiResult = await callGeminiOrGroq(prompt, messages, {
    temperature: 0,
    maxTokens: 200,
    useWebSearch: false,
    timeout: 5e3,
    functionName: "semanticDecision"
  });
  if (aiResult.success && aiResult.result) {
    const jsonMatch = aiResult.result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const decision = JSON.parse(jsonMatch[0]);
        return {
          intent: decision.intent || "general_chat",
          confidence: decision.confidence || 0.7,
          decisionTime: Date.now() - startTime,
          reasoning: decision.reasoning || "Analysis complete",
          model: aiResult.model
        };
      } catch (e) {
      }
    }
  }
  return {
    intent: "general_chat",
    confidence: 0.5,
    decisionTime: Date.now() - startTime,
    reasoning: "Fallback",
    model: "none"
  };
}
__name(quantumSemanticDecision, "quantumSemanticDecision");
__name2(quantumSemanticDecision, "quantumSemanticDecision");
__name22(quantumSemanticDecision, "quantumSemanticDecision");
async function callGroqCompoundAttempt(messages, enableWebSearch, key) {
  try {
    const body = {
      model: "groq/compound",
      messages: messages.slice(-15),
      temperature: 0.3,
      max_completion_tokens: 799,
      top_p: 0.95,
      stream: false,
      compound_custom: {
        tools: {
          enabled_tools: []
          // Khali array initially
        }
      }
    };
    if (enableWebSearch) {
      body.compound_custom.tools.enabled_tools = [
        "web_search",
        "visit_website"
      ];
    }
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "User-Agent": "Nexus-AI/8.0",
        "Groq-Model-Version": "latest"
        // 🔥 IMPORTANT: latest version enable karo
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const err = await response.text();
      console.error(`\u274C Compound Error (${response.status}):`, err);
      if (response.status === 429)
        markKeyFailed("groq", key, 60);
      if (response.status === 401 || response.status === 403)
        markKeyFailed("groq", key, 3600);
      if (response.status === 401 || response.status === 403 || response.status === 429)
        return "RETRY";
      return null;
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    let sources = [];
    const executedTools = data.choices?.[0]?.message?.executed_tools;
    if (executedTools && executedTools.length > 0) {
      console.log("\u{1F527} Compound: Tools were used for this query");
      for (const tool of executedTools) {
        const results = tool.search_results?.results || tool.search_results || [];
        if (Array.isArray(results)) {
          for (const r of results) {
            const url = r.url || r.link;
            if (url) sources.push({ title: r.title || url, url });
          }
        }
      }
    }
    if (!text) return null;
    return { content: text, source: "Groq Compound (Web Search)", sources };
  } catch (e) {
    console.error("\u274C Compound Error:", e.message);
    return "RETRY";
  }
}
__name(callGroqCompoundAttempt, "callGroqCompoundAttempt");
async function callGroqCompound(messages, enableWebSearch) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    console.error("\u274C Compound: Invalid messages array");
    return null;
  }
  const maxAttempts = (DIRECT_API_KEYS.groq || []).length || 1;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = getNextKey("groq");
    if (!key) return null;
    const result = await callGroqCompoundAttempt(messages, enableWebSearch, key);
    if (result === "RETRY") continue;
    return result;
  }
  return null;
}
__name(callGroqCompound, "callGroqCompound");
__name2(callGroqCompound, "callGroqCompound");
__name22(callGroqCompound, "callGroqCompound");
async function webSearchGeminiFlash(query) {
  const key = getNextKey("gemini");
  if (!key) {
    return null;
  }
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Search the web for the most recent information about: " + query + ". Today is " + TODAY + ". Provide specific details, dates, names, and sources."
            }]
          }],
          generationConfig: {
            maxOutputTokens: 3e3,
            temperature: 0.3
          },
          tools: [{
            googleSearch: {}
          }]
        })
      }
    );
    if (response.ok) {
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content && content.length > 50) {
        let sources = [];
        const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        for (const c of chunks) {
          if (c.web?.uri) sources.push({ title: c.web.title || c.web.uri, url: c.web.uri });
        }
        return {
          source: "Gemini 2.5 Flash (Google)",
          content,
          sources
        };
      }
    }
    if (response.status === 429) {
      markKeyFailed("gemini", key, 60);
    }
  } catch (e) {
    console.error("Gemini Flash Search Error:", e.message);
  }
  return null;
}
__name(webSearchGeminiFlash, "webSearchGeminiFlash");
__name2(webSearchGeminiFlash, "webSearchGeminiFlash");
__name22(webSearchGeminiFlash, "webSearchGeminiFlash");
async function webSearchRSS(query) {
  try {
    const rssUrl = "https://news.google.com/rss/search?q=" + encodeURIComponent(query) + "&hl=en-IN&gl=IN&ceid=IN:en";
    const response = await fetch(rssUrl);
    const text = await response.text();
    const items = text.match(/<title>(.*?)<\/title>/g);
    const links = text.match(/<link>(.*?)<\/link>/g);
    if (items && items.length > 1) {
      let content = "\u{1F4F0} Latest News Headlines:\n\n";
      let count = 0;
      let sources = [];
      for (let i = 1; i < Math.min(items.length, 10); i++) {
        const headline = items[i].replace(/<title>|<\/title>/g, "").trim();
        const link = links && links[i] ? links[i].replace(/<link>|<\/link>/g, "").trim() : null;
        if (headline && !headline.includes("Google News") && headline.length > 5) {
          content += "\u2022 " + headline + "\n";
          count = count + 1;
          if (link) sources.push({ title: headline, url: link });
        }
      }
      if (count > 0) {
        return {
          source: "Google News (RSS)",
          content,
          sources
        };
      }
    }
  } catch (e) {
    console.error("RSS Search Error:", e.message);
  }
  return null;
}
__name(webSearchRSS, "webSearchRSS");
__name2(webSearchRSS, "webSearchRSS");
__name22(webSearchRSS, "webSearchRSS");
async function webSearchWikipedia(query) {
  try {
    const searchUrl = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + encodeURIComponent(query) + "&format=json&origin=*";
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    if (searchData.query && searchData.query.search && searchData.query.search[0]) {
      const title = searchData.query.search[0].title;
      const contentUrl = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=" + encodeURIComponent(title) + "&format=json&origin=*";
      const contentResponse = await fetch(contentUrl);
      const contentData = await contentResponse.json();
      const pages = contentData.query.pages;
      const pageKeys = Object.keys(pages);
      if (pageKeys.length > 0) {
        const extract = pages[pageKeys[0]].extract;
        if (extract && extract.length > 50) {
          return {
            source: "Wikipedia",
            content: extract.substring(0, 3e3),
            sources: [{ title, url: "https://en.wikipedia.org/wiki/" + encodeURIComponent(title.replace(/ /g, "_")) }]
          };
        }
      }
    }
  } catch (e) {
    console.error("Wikipedia Search Error:", e.message);
  }
  return null;
}
__name(webSearchWikipedia, "webSearchWikipedia");
__name2(webSearchWikipedia, "webSearchWikipedia");
__name22(webSearchWikipedia, "webSearchWikipedia");
async function webSearchDuckDuckGo(query) {
  try {
    const url = "https://api.duckduckgo.com/?q=" + encodeURIComponent(query) + "&format=json&no_html=1&skip_disambig=1";
    const response = await fetch(url);
    const data = await response.json();
    if (data.AbstractText && data.AbstractText.length > 50) {
      return {
        source: "DuckDuckGo",
        content: data.AbstractText,
        sources: data.AbstractURL ? [{ title: data.Heading || "DuckDuckGo", url: data.AbstractURL }] : []
      };
    }
    if (data.RelatedTopics && data.RelatedTopics[0] && data.RelatedTopics[0].Text && data.RelatedTopics[0].Text.length > 50) {
      return {
        source: "DuckDuckGo",
        content: data.RelatedTopics[0].Text,
        sources: data.RelatedTopics[0].FirstURL ? [{ title: data.RelatedTopics[0].Text.substring(0, 60), url: data.RelatedTopics[0].FirstURL }] : []
      };
    }
  } catch (e) {
    console.error("DuckDuckGo Search Error:", e.message);
  }
  return null;
}
__name(webSearchDuckDuckGo, "webSearchDuckDuckGo");
__name2(webSearchDuckDuckGo, "webSearchDuckDuckGo");
__name22(webSearchDuckDuckGo, "webSearchDuckDuckGo");
async function performWebSearchUncached(query) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const datedQuery = query + " " + today;
  try {
    const groqResult = await callGroqCompound(
      [{ role: "user", content: datedQuery }],
      true
    );
    if (groqResult && groqResult.content && groqResult.content.length > 50) {
      console.log("\u2705 Web Search: Groq Compound found results");
      return groqResult;
    }
  } catch (e) {
    console.error("Groq Compound failed:", e.message);
  }
  try {
    const geminiResult = await webSearchGeminiFlash(datedQuery);
    if (geminiResult && geminiResult.content && geminiResult.content.length > 50) {
      console.log("\u2705 Web Search: Gemini Flash found results");
      return geminiResult;
    }
  } catch (e) {
    console.error("Gemini Flash failed:", e.message);
  }
  try {
    const rssResult = await webSearchRSS(datedQuery);
    if (rssResult && rssResult.content && rssResult.content.length > 50) {
      console.log("\u2705 Web Search: Google News RSS found results");
      return rssResult;
    }
  } catch (e) {
    console.error("RSS failed:", e.message);
  }
  try {
    const wikiResult = await webSearchWikipedia(datedQuery);
    if (wikiResult && wikiResult.content && wikiResult.content.length > 50) {
      console.log("\u2705 Web Search: Wikipedia found results");
      return wikiResult;
    }
  } catch (e) {
    console.error("Wikipedia failed:", e.message);
  }
  try {
    const ddgResult = await webSearchDuckDuckGo(datedQuery);
    if (ddgResult && ddgResult.content && ddgResult.content.length > 50) {
      console.log("\u2705 Web Search: DuckDuckGo found results");
      return ddgResult;
    }
  } catch (e) {
    console.error("DuckDuckGo failed:", e.message);
  }
  console.log("\u26A0\uFE0F All 5 search sources failed");
  return null;
}
__name(performWebSearchUncached, "performWebSearchUncached");
function normalizeSearchCacheKey(query) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const normalized = String(query).toLowerCase().trim().replace(/\s+/g, " ").substring(0, 200);
  return "search_cache:" + today + ":" + normalized;
}
__name(normalizeSearchCacheKey, "normalizeSearchCacheKey");
async function performWebSearch(query) {
  const cacheKey = normalizeSearchCacheKey(query);
  try {
    if (env.KV) {
      const cached = await env.KV.get(cacheKey, { type: "json" });
      if (cached) {
        console.log("\u26A1 Web Search: Cache hit");
        return cached;
      }
    }
  } catch (e) {
    console.error("Search cache read error:", e.message);
  }
  const result = await performWebSearchUncached(query);
  if (result && result.content && env.KV) {
    try {
      await env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 600 });
    } catch (e) {
      console.error("Search cache write error:", e.message);
    }
  }
  return result;
}
__name(performWebSearch, "performWebSearch");
__name2(performWebSearch, "performWebSearch");
__name22(performWebSearch, "performWebSearch");
async function multiStageReasoning(query, context, options) {
  const prompt = `Analyze and create PLAN. Return ONLY JSON:
{"needsSearch":bool,"complexity":"simple/medium/complex","approach":"direct/reasoning/creative/code","steps":1-5,"plan":"brief"}

QUERY: "${query}"
CONTEXT: ${context ? context.substring(0, 300) : "New"}`;
  const messages = [{ role: "user", content: prompt }];
  const aiResult = await callGeminiOrGroq(prompt, messages, {
    temperature: 0.1,
    maxTokens: 200,
    useWebSearch: false,
    timeout: 5e3,
    functionName: "multiStageReasoning"
  });
  if (aiResult.success && aiResult.result) {
    const jsonMatch = aiResult.result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const plan = JSON.parse(jsonMatch[0]);
        return {
          plan,
          reasoning: {
            method: plan.approach || "direct",
            confidence: 0.7,
            insights: []
          },
          search: null,
          response: null,
          model: aiResult.model
        };
      } catch (e) {
      }
    }
  }
  return {
    plan: {
      needsSearch: true,
      complexity: "medium",
      approach: "direct",
      steps: 1,
      plan: "Process directly"
    },
    reasoning: {
      method: "direct",
      confidence: 0.5,
      insights: []
    },
    search: null,
    response: null,
    model: "none"
  };
}
__name(multiStageReasoning, "multiStageReasoning");
__name2(multiStageReasoning, "multiStageReasoning");
__name22(multiStageReasoning, "multiStageReasoning");
async function callGeminiOrGroq(prompt, messages, options) {
  const config = options || {};
  const enableWebSearch = config.webSearch !== false;
  try {
    const key = getNextKey("gemini");
    if (key) {
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: config.maxTokens || CONFIG.MAX_TOKENS_GEMINI,
          temperature: config.temperature || 0.2,
          topP: 0.95,
          topK: 40
        }
      };
      if (enableWebSearch && config.useWebSearch !== false) {
        body.tools = [{ googleSearch: {} }];
      }
      const controller = new AbortController();
      const timeout = setTimeout(function() {
        controller.abort();
      }, config.timeout || CONFIG.MODEL_TIMEOUT);
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal
        }
      );
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.length > 0) {
          return { success: true, result: text, model: "gemini" };
        }
      }
      if (response.status === 429 || response.status === 503) {
        markKeyFailed("gemini", key, 60);
      }
    }
  } catch (e) {
    console.log("\u26A0\uFE0F Gemini failed, trying Groq...");
  }
  try {
    const key = getNextKey("groq");
    if (key) {
      const body = {
        model: "openai/gpt-oss-120b",
        messages: messages || [{ role: "user", content: prompt }],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || CONFIG.MAX_TOKENS_GROQ,
        top_p: 0.95
      };
      if (enableWebSearch && config.useWebSearch !== false) {
        body.tools = [{ type: "web_search" }];
        body.tool_choice = "auto";
      }
      const controller = new AbortController();
      const timeout = setTimeout(function() {
        controller.abort();
      }, config.timeout || CONFIG.MODEL_TIMEOUT);
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + key,
          "Content-Type": "application/json",
          "User-Agent": "Nexus-AI/8.0"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.length > 0) {
          return { success: true, result: text, model: "groq" };
        }
      }
      if (response.status === 429) {
        markKeyFailed("groq", key, 60);
      }
    }
  } catch (e) {
    console.log("\u26A0\uFE0F Groq also failed");
  }
  return { success: false, result: null, model: "none" };
}
__name(callGeminiOrGroq, "callGeminiOrGroq");
__name2(callGeminiOrGroq, "callGeminiOrGroq");
__name22(callGeminiOrGroq, "callGeminiOrGroq");
async function quantumAIOrchestrator(prompt, messages, options) {
  const config = options || {};
  const enableWebSearch = config.webSearch !== false;
  const priorityMode = config.priority || "balanced";
  const taskType = config.taskType || "general";
  let modelChain;
  if (taskType === "code" || priorityMode === "speed") {
    modelChain = ["mimo", "groq", "gemini", "cerebras", "sambanova"];
  } else if (taskType === "creative") {
    modelChain = ["kimi", "gemini", "groq", "sambanova", "cerebras"];
  } else if (priorityMode === "quality") {
    modelChain = ["gemini", "groq", "mimo", "sambanova", "cerebras"];
  } else {
    modelChain = ["gemini", "mimo", "groq", "cerebras", "sambanova"];
  }
  if (priorityMode === "speed") {
    const parallelModels = modelChain.slice(0, 2);
    const promises = parallelModels.map(async function(modelName) {
      try {
        const result = await callSpecificModel(modelName, prompt, messages, enableWebSearch);
        if (result) {
          return { response: result, model: modelName, success: true };
        }
      } catch (e) {
      }
      return null;
    });
    const raceResult = await Promise.race([
      Promise.all(promises).then(function(results) {
        return results.find(function(r) {
          return r !== null;
        }) || null;
      }),
      new Promise(function(resolve) {
        setTimeout(function() {
          resolve(null);
        }, 5e3);
      })
    ]);
    if (raceResult) {
      return raceResult;
    }
  }
  for (const modelName of modelChain) {
    try {
      const result = await withRetry(() => callSpecificModel(modelName, prompt, messages, enableWebSearch), 1, 400);
      if (result) {
        console.log("\u2705 Success with model:", modelName);
        return { response: result, model: modelName, success: true };
      }
    } catch (e) {
      console.error(modelName + " failed:", e.message);
      if (config.env2) {
        await logError(config.env2, config.userId || "anonymous", "ai_provider_failure", `${modelName}: ${e.message}`, "quantumAIOrchestrator").catch(() => {
        });
      }
    }
  }
  if (config.env2) {
    await logError(config.env2, config.userId || "anonymous", "ai_provider_chain_exhausted", `All models in chain failed: ${modelChain.join(", ")}`, "quantumAIOrchestrator").catch(() => {
    });
  }
  return {
    response: "I am " + CONFIG.APP_NAME + " created by " + CONFIG.CREATOR + ". How can I help you today?",
    model: "fallback",
    success: false
  };
}
__name(quantumAIOrchestrator, "quantumAIOrchestrator");
__name2(quantumAIOrchestrator, "quantumAIOrchestrator");
__name22(quantumAIOrchestrator, "quantumAIOrchestrator");
async function withRetry(fn, retries, delayMs) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}
__name(withRetry, "withRetry");
__name2(withRetry, "withRetry");
async function callSpecificModel(modelName, prompt, messages, enableWebSearch) {
  switch (modelName) {
    case "gemini":
      return await callGemini(prompt, enableWebSearch);
    case "groq":
      return await callGroq(messages, enableWebSearch);
    case "mimo":
      return await callMimo(messages);
    case "cerebras":
      return await callCerebras(messages);
    case "sambanova":
      return await callSambaNova(messages);
    default:
      return null;
  }
}
__name(callSpecificModel, "callSpecificModel");
__name2(callSpecificModel, "callSpecificModel");
__name22(callSpecificModel, "callSpecificModel");
async function callGemini(prompt, enableWebSearch) {
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = getNextKey("gemini");
    if (!key)
      return null;
    try {
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: CONFIG.MAX_TOKENS_GEMINI,
          temperature: 0.3,
          topP: 0.95,
          topK: 40
        }
      };
      if (enableWebSearch) {
        body.tools = [{ googleSearch: {} }];
      }
      const controller = new AbortController();
      const timeout = setTimeout(function() {
        controller.abort();
      }, CONFIG.MODEL_TIMEOUT);
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal
        }
      );
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text)
          return text;
      }
      if (response.status === 429 || response.status === 503) {
        markKeyFailed("gemini", key, 60);
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }
      } else {
        break;
      }
    } catch (e) {
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
    }
  }
  return null;
}
__name(callGemini, "callGemini");
__name2(callGemini, "callGemini");
__name22(callGemini, "callGemini");
async function callGroq(messages, enableWebSearch) {
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = getNextKey("groq");
    if (!key)
      return null;
    try {
      const body = {
        model: "openai/gpt-oss-120b",
        messages: messages.slice(-10),
        // Sirf last 15 messages
        temperature: 0.7,
        max_tokens: 5555,
        // max_completion_tokens
        top_p: 1,
        reasoning_effort: "high",
        // 🔥 FIXED: medium rakho
        stream: false
        // Worker already handles streaming separately
      };
      if (enableWebSearch) {
        body.tools = [{ type: "browser_search" }];
        body.tool_choice = "auto";
      }
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "User-Agent": "Nexus-AI/8.0"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const err = await response.text();
        console.error(`\u274C Groq Error (${response.status}):`, err);
        if (response.status === 429) {
          markKeyFailed("groq", key, 60);
          if (attempt < maxAttempts - 1) {
            await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
            continue;
          }
        }
        return null;
      }
      const data = await response.json();
      if (data.choices?.[0]?.message?.executed_tools) {
        const searchResults = data.choices[0].message.executed_tools[0]?.search_results;
        if (searchResults) {
          console.log(`\u{1F50E} Groq Search Results: ${JSON.stringify(searchResults).substring(0, 300)}...`);
        }
      }
      return data.choices?.[0]?.message?.content || null;
    } catch (e) {
      console.error("\u274C Groq Error:", e.message);
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}
__name(callGroq, "callGroq");
__name2(callGroq, "callGroq");
__name22(callGroq, "callGroq");
async function callMimo(messages) {
  const key = getNextKey("openrouter");
  if (!key)
    return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(function() {
      controller.abort();
    }, CONFIG.MODEL_TIMEOUT);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "HTTP-Referer": CONFIG.WORKER_URL,
        "X-Title": CONFIG.APP_NAME,
        "User-Agent": "Nexus-AI/8.0"
      },
      body: JSON.stringify({
        model: "xiaomi/mimo-v2.5-pro",
        messages: [
          { role: "system", content: getMasterPrompt() },
          // 🔥 BAS YE EK LINE ADD KARNI HAI
          ...messages
        ],
        temperature: 0.7,
        max_tokens: CONFIG.MAX_TOKENS_MIMO
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text)
        return text;
    }
  } catch (e) {
  }
  return null;
}
__name(callMimo, "callMimo");
__name2(callMimo, "callMimo");
__name22(callMimo, "callMimo");
async function callCerebras(messages) {
  const key = getNextKey("cerebras");
  if (!key)
    return null;
  try {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-oss-120b",
        messages,
        temperature: 0.3,
        max_completion_tokens: CONFIG.MAX_TOKENS_CEREBRAS,
        top_p: 1,
        // 3️⃣ 🔥 Ye naya parameter add karo
        reasoning_effort: "high"
      })
    });
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text)
        return text;
    }
    if (response.status === 429) {
      markKeyFailed("cerebras", key, 60);
    }
  } catch (e) {
  }
  return null;
}
__name(callCerebras, "callCerebras");
__name2(callCerebras, "callCerebras");
__name22(callCerebras, "callCerebras");
async function callSambaNova(messages) {
  const key = getNextKey("sambanova");
  if (!key)
    return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(function() {
      controller.abort();
    }, CONFIG.MODEL_TIMEOUT);
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma-4-31b-it",
        messages,
        temperature: 0.3,
        max_tokens: CONFIG.MAX_TOKENS_SAMBANOVA
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text)
        return text;
    }
  } catch (e) {
  }
  return null;
}
__name(callSambaNova, "callSambaNova");
__name2(callSambaNova, "callSambaNova");
__name22(callSambaNova, "callSambaNova");
var IMAGE_ENGINES = {
  flux: {
    name: "FLUX 1 Schnell",
    speed: "ultra-fast",
    quality: "high",
    style: "realistic",
    generate: async function(env2, prompt, options) {
      if (!env2?.AI) {
        console.log("\u274C Flux: AI binding not available");
        return null;
      }
      try {
        console.log("\u{1F527} Flux: Generating image...");
        const r = await env2.AI.run("@cf/black-forest-labs/flux-1-schnell", {
          prompt,
          width: options?.width || CONFIG.IMAGE_WIDTH,
          height: options?.height || CONFIG.IMAGE_HEIGHT,
          num_steps: options?.num_steps || 4
        });
        console.log(`\u{1F527} Flux: Response keys = ${Object.keys(r).join(", ")}`);
        const imageData = r?.response || r?.image || null;
        if (imageData) {
          console.log(`\u2705 Flux: Image length = ${imageData.length}`);
          return imageData;
        } else {
          console.log("\u274C Flux: No image in response");
          console.log(`\u{1F527} Flux: Full response = ${JSON.stringify(r).substring(0, 200)}`);
          return null;
        }
      } catch (e) {
        console.error("\u274C Flux ERROR:", e.message);
        return null;
      }
    }
  },
  lucid: {
    name: "Lucid Origin",
    speed: "medium",
    quality: "ultra-high",
    style: "photorealistic",
    generate: async function(env2, prompt, options) {
      if (!env2?.AI) {
        console.log("\u274C Lucid: AI binding not available");
        return null;
      }
      try {
        console.log("\u{1F527} Lucid: Generating image...");
        const r = await env2.AI.run("@cf/leonardo/lucid-origin", {
          prompt,
          width: options?.width || CONFIG.IMAGE_WIDTH,
          height: options?.height || CONFIG.IMAGE_HEIGHT,
          num_steps: options?.num_steps || 20,
          guidance: options?.guidance || 7.5
        });
        console.log(`\u{1F527} Lucid: Response keys = ${Object.keys(r).join(", ")}`);
        const imageData = r?.response || r?.image || null;
        if (imageData) {
          console.log(`\u2705 Lucid: Image length = ${imageData.length}`);
          return imageData;
        } else {
          console.log("\u274C Lucid: No image in response");
          console.log(`\u{1F527} Lucid: Full response = ${JSON.stringify(r).substring(0, 200)}`);
          return null;
        }
      } catch (e) {
        console.error("\u274C Lucid ERROR:", e.message);
        return null;
      }
    }
  },
  sdxl: {
    name: "SDXL Turbo",
    speed: "fast",
    quality: "ultra-high",
    style: "photorealistic",
    generate: async function(env2, prompt, options) {
      if (!env2?.AI) {
        console.log("\u274C SDXL: AI binding not available");
        return null;
      }
      try {
        console.log("\u{1F527} SDXL: Generating image...");
        const r = await env2.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
          prompt,
          width: options?.width || CONFIG.IMAGE_WIDTH,
          height: options?.height || CONFIG.IMAGE_HEIGHT,
          num_steps: options?.num_steps || 20,
          guidance: options?.guidance || 7.5
        });
        console.log(`\u{1F527} SDXL: Response keys = ${Object.keys(r).join(", ")}`);
        const imageData = r?.response || r?.image || null;
        if (imageData) {
          console.log(`\u2705 SDXL: Image length = ${imageData.length}`);
          return imageData;
        } else {
          console.log("\u274C SDXL: No image in response");
          console.log(`\u{1F527} SDXL: Full response = ${JSON.stringify(r).substring(0, 200)}`);
          return null;
        }
      } catch (e) {
        console.error("\u274C SDXL ERROR:", e.message);
        return null;
      }
    }
  },
  phoenix: {
    name: "Phoenix 1.0",
    speed: "fast",
    quality: "ultra-high",
    style: "artistic",
    generate: async function(env2, prompt, options) {
      if (!env2?.AI) {
        console.log("\u274C Phoenix: AI binding not available");
        return null;
      }
      try {
        console.log("\u{1F527} Phoenix: Generating image...");
        const r = await env2.AI.run("@cf/leonardo/phoenix-1.0", {
          prompt,
          width: options?.width || CONFIG.IMAGE_WIDTH,
          height: options?.height || CONFIG.IMAGE_HEIGHT,
          num_steps: options?.num_steps || 20,
          guidance: options?.guidance || 7.5
        });
        console.log(`\u{1F527} Phoenix: Response keys = ${Object.keys(r).join(", ")}`);
        const imageData = r?.response || r?.image || null;
        if (imageData) {
          console.log(`\u2705 Phoenix: Image length = ${imageData.length}`);
          return imageData;
        } else {
          console.log("\u274C Phoenix: No image in response");
          console.log(`\u{1F527} Phoenix: Full response = ${JSON.stringify(r).substring(0, 200)}`);
          return null;
        }
      } catch (e) {
        console.error("\u274C Phoenix ERROR:", e.message);
        return null;
      }
    }
  },
  agnes: {
    name: "Agnes AI",
    speed: "fast",
    quality: "high",
    style: "realistic",
    generate: async function(env2, prompt, options) {
      const apiKey = env2?.AGNES_API_KEY;
      if (!apiKey) {
        console.log("\u274C Agnes: AGNES_API_KEY not set");
        return null;
      }
      try {
        console.log("\u{1F527} Agnes: Generating image...");
        const width = options?.width || CONFIG.IMAGE_WIDTH;
        const height = options?.height || CONFIG.IMAGE_HEIGHT;
        const response = await fetch("https://apihub.agnes-ai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "agnes-image-2.1-flash",
            prompt,
            size: width + "x" + height,
            return_base64: true
          })
        });
        if (!response.ok) {
          const errBody = await response.text();
          console.error(`\u274C Agnes ERROR (${response.status}):`, errBody);
          return null;
        }
        const data = await response.json();
        const imageData = data?.data?.[0]?.b64_json || null;
        if (imageData) {
          console.log(`\u2705 Agnes: Image length = ${imageData.length}`);
          return imageData;
        } else {
          console.log("\u274C Agnes: No image in response");
          console.log(`\u{1F527} Agnes: Full response = ${JSON.stringify(data).substring(0, 200)}`);
          return null;
        }
      } catch (e) {
        console.error("\u274C Agnes ERROR:", e.message);
        return null;
      }
    }
  }
};
async function aiStyleDetector(prompt, env2) {
  const systemPrompt = `You are an AI style detection expert. Analyze the user's prompt and determine the BEST image generation style.

    USER PROMPT: "${prompt}"

    Your task: Understand the DEEP MEANING of what the user wants. Think like a professional artist.

    Return ONLY this JSON:
    {
        "style": "photorealistic OR cinematic OR artistic OR anime OR illustration OR logo OR product OR general",
            "hasText": true/false,
                "mood": "happy/sad/dramatic/calm/epic/romantic/mysterious/professional",
                    "lighting": "studio/natural/dramatic/golden hour/neon/dark",
                        "composition": "portrait/landscape/close-up/wide/action/abstract",
                            "bestEngine": "phoenix OR sdxl OR flux OR lucid",
                                "confidence": 0.0-1.0,
                                    "reasoning": "Why you chose this style (brief)"
                                    }

                                    IMPORTANT: 
                                    - NO keyword matching
                                    - Understand the user's INTENT
                                    - Think like an artist
                                    - Confidence must be based on understanding, not keywords`;
  console.log(`\u{1F50D} aiStyleDetector: Calling Gemini...`);
  const result = await callTextModelWithFallback(systemPrompt, env2);
  console.log(`\u{1F50D} aiStyleDetector: result.success=${result.success}, result.result=${result.result ? "present" : "undefined"}`);
  if (result && result.success && result.result && typeof result.result === "string") {
    try {
      const jsonMatch = result.result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const decision = JSON.parse(jsonMatch[0]);
        return {
          style: decision.style || "general",
          hasText: decision.hasText || false,
          mood: decision.mood || "neutral",
          lighting: decision.lighting || "natural",
          composition: decision.composition || "general",
          bestEngine: decision.bestEngine || "lucid",
          confidence: decision.confidence || 0.7,
          reasoning: decision.reasoning || "AI analysis complete"
        };
      }
    } catch (e) {
      console.error("AI Style Detection parse error:", e.message);
    }
  }
  return await aiStyleDetectorFallback(prompt, env2);
}
__name(aiStyleDetector, "aiStyleDetector");
__name2(aiStyleDetector, "aiStyleDetector");
async function aiStyleDetectorFallback(prompt, env2) {
  const fallbackPrompt = `Describe this image request in 5 words. What is the BEST visual style for: "${prompt}"
                                                                                                                                                                                                                                                                            Return ONLY: style,mood,lighting,composition,engine`;
  const result = await callTextModelWithFallback(fallbackPrompt, env2);
  const parts = result.result.split(",").map((s) => s.trim().toLowerCase());
  return {
    style: parts[0] || "general",
    hasText: prompt.includes("text") || prompt.includes("word"),
    mood: parts[1] || "neutral",
    lighting: parts[2] || "natural",
    composition: parts[3] || "general",
    bestEngine: parts[4] || "lucid",
    confidence: 0.6,
    reasoning: "Fallback analysis"
  };
}
__name(aiStyleDetectorFallback, "aiStyleDetectorFallback");
__name2(aiStyleDetectorFallback, "aiStyleDetectorFallback");
async function aiPromptEnhancer(userPrompt, style, mood, lighting, composition, env2) {
  const systemPrompt = `You are a MASTER prompt engineer. Enhance this prompt for AI image generation.

                                                                                                                                                                                                                                                                                                                                                                        USER REQUEST: "${userPrompt}"
                                                                                                                                                                                                                                                                                                                                                                        STYLE: ${style}
                                                                                                                                                                                                                                                                                                                                                                        MOOD: ${mood}
                                                                                                                                                                                                                                                                                                                                                                        LIGHTING: ${lighting}
                                                                                                                                                                                                                                                                                                                                                                        COMPOSITION: ${composition}

                                                                                                                                                                                                                                                                                                                                                                        Your task: Create the PERFECT prompt that captures the user's TRUE INTENT.

                                                                                                                                                                                                                                                                                                                                                                        Rules:
                                                                                                                                                                                                                                                                                                                                                                        1. Understand the EMOTION behind the request
                                                                                                                                                                                                                                                                                                                                                                        2. Add artistic details that match the style
                                                                                                                                                                                                                                                                                                                                                                        3. Include quality keywords naturally
                                                                                                                                                                                                                                                                                                                                                                        4. Keep it under 200 words
                                                                                                                                                                                                                                                                                                                                                                        5. Make it FEEL like the user described it

                                                                                                                                                                                                                                                                                                                                                                        Return ONLY the enhanced prompt. No explanation.`;
  const result = await callTextModelWithFallback(systemPrompt, env2);
  if (result.success && result.result && result.result.length > 20) {
    return result.result;
  }
  const fallbackPrompt = `Rewrite this image description in professional terms: "${userPrompt}"
                                                                                                                                                                                                                                                                                                                                                                                                            Style: ${style}. Make it amazing.`;
  const fallbackResult = await callTextModelWithFallback(fallbackPrompt, env2);
  return fallbackResult.success ? fallbackResult.result : userPrompt;
}
__name(aiPromptEnhancer, "aiPromptEnhancer");
__name2(aiPromptEnhancer, "aiPromptEnhancer");
async function aiEngineSelector(prompt, style, hasText, env2) {
  const systemPrompt = `Select the BEST AI image generation engine for this request.

                                                                                                                                                                                                                                                                                                                                                                                                                            REQUEST: "${prompt}"
                                                                                                                                                                                                                                                                                                                                                                                                                            DETECTED STYLE: ${style}
                                                                                                                                                                                                                                                                                                                                                                                                                            HAS TEXT: ${hasText}

                                                                                                                                                                                                                                                                                                                                                                                                                            Available Engines:
                                                                                                                                                                                                                                                                                                                                                                                                                            1. phoenix - Leonardo AI's best, ultra quality, supports text
                                                                                                                                                                                                                                                                                                                                                                                                                            2. sdxl - Stability AI, best for photorealistic
                                                                                                                                                                                                                                                                                                                                                                                                                            3. flux - Black Forest Labs, fastest, good quality  
                                                                                                                                                                                                                                                                                                                                                                                                                            4. lucid - Best for artistic and anime

                                                                                                                                                                                                                                                                                                                                                                                                                            Consider:
                                                                                                                                                                                                                                                                                                                                                                                                                            - Quality needed
                                                                                                                                                                                                                                                                                                                                                                                                                            - Speed required  
                                                                                                                                                                                                                                                                                                                                                                                                                            - If text is needed
                                                                                                                                                                                                                                                                                                                                                                                                                            - The user's intention

                                                                                                                                                                                                                                                                                                                                                                                                                            Return ONLY JSON:
                                                                                                                                                                                                                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                                                                                                                                                                                                                "engine": "phoenix OR sdxl OR flux OR lucid",
                                                                                                                                                                                                                                                                                                                                                                                                                                    "reasoning": "Why this engine",
                                                                                                                                                                                                                                                                                                                                                                                                                                        "confidence": 0.0-1.0
                                                                                                                                                                                                                                                                                                                                                                                                                                        }`;
  const result = await callTextModelWithFallback(systemPrompt, env2);
  try {
    const jsonMatch = result.result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const decision = JSON.parse(jsonMatch[0]);
      return {
        engine: decision.engine || "flux",
        reasoning: decision.reasoning || "AI selected best engine",
        confidence: decision.confidence || 0.7
      };
    }
  } catch (e) {
    console.error("AI Engine Selection parse error:", e.message);
  }
  const styleMap = {
    "photorealistic": "sdxl",
    "cinematic": "sdxl",
    "artistic": "lucid",
    "anime": "lucid",
    "illustration": "phoenix",
    "logo": "phoenix",
    "product": "sdxl",
    "general": "phoenix"
  };
  return {
    engine: styleMap[style] || "flux",
    reasoning: "Style-based fallback",
    confidence: 0.5
  };
}
__name(aiEngineSelector, "aiEngineSelector");
__name2(aiEngineSelector, "aiEngineSelector");
async function pureAIImageGenerator(env2, userPrompt, options = {}) {
  console.log("\u{1F3A8} PURE AI IMAGE GENERATOR v11.0");
  console.log("\u{1F4DD} User prompt:", userPrompt);
  const styleDecision = await aiStyleDetector(userPrompt, env2);
  console.log("\u{1F3AF} AI Style:", styleDecision.style);
  console.log("\u{1F9E0} Reasoning:", styleDecision.reasoning);
  console.log("\u{1F3A8} Best Engine:", styleDecision.bestEngine);
  console.log("\u{1F4CA} Confidence:", styleDecision.confidence);
  const enhancedPrompt = await aiPromptEnhancer(
    userPrompt,
    styleDecision.style,
    styleDecision.mood,
    styleDecision.lighting,
    styleDecision.composition,
    env2
  );
  console.log("\u2728 AI Enhanced Prompt:", enhancedPrompt);
  const engineDecision = await aiEngineSelector(
    userPrompt,
    styleDecision.style,
    styleDecision.hasText,
    env2
  );
  console.log("\u{1F527} AI Selected Engine:", engineDecision.engine);
  console.log("\u{1F4AD} Reasoning:", engineDecision.reasoning);
  const engine = IMAGE_ENGINES[engineDecision.engine] || IMAGE_ENGINES.flux;
  const result = await callImageEngine(env2, engine, enhancedPrompt, options);
  if (result.success) {
    return {
      success: true,
      blob: result.blob,
      provider: engine.name,
      url: CONFIG.WORKER_URL + "/image/" + result.imageId,
      imageId: result.imageId,
      prompt: enhancedPrompt,
      originalPrompt: userPrompt,
      styleDecision,
      engineDecision
    };
  }
  console.log("\u{1F504} AI Auto-Fallback triggered");
  const fallbackEngines = ["flux", "sdxl", "lucid", "agnes"];
  for (const engineName of fallbackEngines) {
    if (engineName === engineDecision.engine)
      continue;
    const fallbackEngine = IMAGE_ENGINES[engineName];
    if (!fallbackEngine)
      continue;
    const fallbackResult = await callImageEngine(env2, fallbackEngine, enhancedPrompt, options);
    if (fallbackResult.success) {
      return {
        success: true,
        blob: fallbackResult.blob,
        provider: fallbackEngine.name,
        url: CONFIG.WORKER_URL + "/image/" + fallbackResult.imageId,
        imageId: fallbackResult.imageId,
        prompt: enhancedPrompt,
        originalPrompt: userPrompt,
        styleDecision,
        engineDecision: { engine: engineName, reasoning: "Auto-fallback" }
      };
    }
  }
  return {
    success: false,
    error: "All AI engines failed",
    originalPrompt: userPrompt,
    styleDecision
  };
}
__name(pureAIImageGenerator, "pureAIImageGenerator");
__name2(pureAIImageGenerator, "pureAIImageGenerator");
async function callTextModelWithFallback(prompt, env2) {
  const models = [
    { name: "gemini", provider: "gemini" },
    { name: "openrouter", provider: "openrouter" },
    { name: "gemma", provider: "sambanova" },
    { name: "groq", provider: "groq" },
    { name: "cerebras", provider: "cerebras" }
  ];
  const messages = [{ role: "user", content: prompt }];
  for (const model of models) {
    try {
      console.log(`\u{1F504} AI Thinking with: ${model.name}`);
      let result;
      switch (model.provider) {
        case "gemini":
          result = await callGemini(prompt, false);
          break;
        case "openrouter":
          result = await callMimo(messages);
          break;
        case "sambanova":
          result = await callSambaNova(messages);
          break;
        case "groq":
          result = await callGroq(messages, false);
          break;
        case "cerebras":
          result = await callCerebras(messages);
          break;
      }
      if (result && typeof result === "string" && result.length > 5) {
        console.log(`\u2705 AI thinking complete: ${model.name}`);
        return { success: true, result, provider: model.name };
      }
    } catch (error) {
      console.log(`\u26A0\uFE0F ${model.name} failed:`, error.message);
    }
  }
  console.log("\u26A0\uFE0F All text models failed, using basic enhancement");
  return {
    success: true,
    result: enhancePromptBasic(prompt),
    // 🔥 FIX: prompt use karo, userPrompt nahi
    provider: "fallback"
  };
}
__name(callTextModelWithFallback, "callTextModelWithFallback");
__name2(callTextModelWithFallback, "callTextModelWithFallback");
function enhancePromptBasic(prompt) {
  const qualityWords = ["stunning", "masterpiece", "beautiful", "detailed", "professional", "high quality", "amazing", "incredible"];
  const randomQuality = qualityWords[Math.floor(Math.random() * qualityWords.length)];
  const enhancements = [
    `A ${randomQuality} image of ${prompt}`,
    `${prompt}, created with artistic excellence and professional quality`,
    `${randomQuality} ${prompt} with perfect composition and lighting`,
    `Beautiful ${prompt} with incredible detail and quality`
  ];
  return enhancements[Math.floor(Math.random() * enhancements.length)];
}
__name(enhancePromptBasic, "enhancePromptBasic");
__name2(enhancePromptBasic, "enhancePromptBasic");
async function callImageEngine(env2, engine, prompt, options) {
  try {
    console.log(`\u{1F4E4} ${engine.name} params: ${JSON.stringify({ prompt: prompt.substring(0, 50) })}`);
    const imageData = await engine.generate(env2, prompt, options);
    console.log(`\u{1F4E4} ${engine.name}: imageData type = ${typeof imageData}`);
    console.log(`\u{1F4E4} ${engine.name}: imageData length = ${imageData ? imageData.length : "null"}`);
    console.log(`\u{1F4E4} ${engine.name}: imageData startsWith = ${imageData ? imageData.substring(0, 30) : "null"}`);
    if (imageData) {
      let base64Data = imageData;
      if (typeof imageData === "string" && imageData.startsWith("data:image")) {
        base64Data = imageData.split(",")[1];
        console.log(`\u{1F4E4} ${engine.name}: Removed data:image prefix`);
      }
      try {
        const binaryString = atob(base64Data);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: "image/png" });
        const imageId = generateId();
        await saveImageToKV(env2, imageId, blob);
        console.log(`\u2705 ${engine.name}: Image saved: ${imageId}, size: ${blob.size} bytes`);
        trackEvent(env2, "image_generated", { model: engine.name, status: "ok", value: blob.size });
        return {
          success: true,
          blob,
          provider: engine.name,
          url: CONFIG.WORKER_URL + "/image/" + imageId,
          imageId,
          prompt
        };
      } catch (atobError) {
        console.error(`\u274C ${engine.name}: atob failed:`, atobError.message);
        console.error(`\u274C ${engine.name}: base64Data length = ${base64Data.length}`);
        console.error(`\u274C ${engine.name}: base64Data startsWith = ${base64Data.substring(0, 50)}`);
        try {
          if (typeof Buffer !== "undefined") {
            const buffer = Buffer.from(base64Data, "base64");
            const blob = new Blob([buffer], { type: "image/png" });
            const imageId = generateId();
            await saveImageToKV(env2, imageId, blob);
            console.log(`\u2705 ${engine.name}: Buffer fallback saved: ${imageId}`);
            return {
              success: true,
              blob,
              provider: engine.name,
              url: CONFIG.WORKER_URL + "/image/" + imageId,
              imageId,
              prompt
            };
          }
        } catch (bufferError) {
          console.error(`\u274C ${engine.name}: Buffer fallback failed:`, bufferError.message);
        }
        try {
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "image/png" });
          const imageId = generateId();
          await saveImageToKV(env2, imageId, blob);
          console.log(`\u2705 ${engine.name}: Manual decode saved: ${imageId}`);
          return {
            success: true,
            blob,
            provider: engine.name,
            url: CONFIG.WORKER_URL + "/image/" + imageId,
            imageId,
            prompt
          };
        } catch (manualError) {
          console.error(`\u274C ${engine.name}: Manual decode failed:`, manualError.message);
        }
        return { success: false, error: "Base64 decode failed" };
      }
    }
    console.log(`\u274C ${engine.name}: No image data returned`);
    return { success: false, error: "No image data" };
  } catch (error) {
    console.error(`\u274C callImageEngine error:`, error.message);
    console.error(`\u274C Stack:`, error.stack);
    return { success: false, error: error.message };
  }
}
__name(callImageEngine, "callImageEngine");
__name2(callImageEngine, "callImageEngine");
async function analyzeImageWithGemini(imageData, prompt) {
  const key = getNextKey("gemini");
  if (!key)
    return null;
  try {
    let cleanBase64 = imageData;
    if (cleanBase64.includes(",")) {
      cleanBase64 = cleanBase64.split(",")[1];
    }
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt || "Describe this image according to previous questions if related if not related only describe in extreme." },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: cleanBase64
                }
              }
            ]
          }],
          generationConfig: {
            maxOutputTokens: CONFIG.MAX_TOKENS_GEMINI,
            temperature: 0.7
          }
        })
      }
    );
    if (response.ok) {
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content && content.length > 10)
        return content;
    }
    if (response.status === 429)
      markKeyFailed("gemini", key, 60);
  } catch (e) {
  }
  return null;
}
__name(analyzeImageWithGemini, "analyzeImageWithGemini");
__name2(analyzeImageWithGemini, "analyzeImageWithGemini");
async function analyzeImageWithGLM(imageData, prompt) {
  console.log("\u{1F50D} GLM-4V CALLED \u2014 Image type:", typeof imageData, "Length:", imageData?.length);
  const key = getNextKey("glm");
  console.log("\u{1F511} GLM Key:", key ? "Available" : "MISSING");
  if (!key)
    return null;
  try {
    let img = imageData;
    if (img.length > 5e4 && img.startsWith("data:image")) {
      console.log("\u26A0\uFE0F Image too large, compressing...");
      const base64Data = img.split(",")[1];
      prompt = (prompt || "give answer of questions according to previous question if related if not related only describe in extreme") + " (be concise, under 50 words)";
    }
    if (!img.startsWith("data:") && !img.startsWith("http")) {
      img = "data:image/jpeg;base64," + img;
    }
    console.log("\u{1F4F8} Image prefix:", img.substring(0, 60));
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "glm-4v",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt || "Describe in extreme according to previous question if not related only describe." },
            { type: "image_url", image_url: { url: img } }
          ]
        }],
        max_tokens: CONFIG.MAX_TOKENS_GLM
      })
    });
    console.log("\u{1F4E1} GLM Status:", response.status);
    if (response.ok) {
      const d = await response.json();
      console.log("\u2705 GLM SUCCESS");
      return d.choices?.[0]?.message?.content || null;
    } else {
      const errText = await response.text();
      console.log("\u274C GLM Error:", response.status, errText.substring(0, 200));
    }
  } catch (e) {
    console.log("\u274C GLM Exception:", e.message);
  }
  return null;
}
__name(analyzeImageWithGLM, "analyzeImageWithGLM");
__name2(analyzeImageWithGLM, "analyzeImageWithGLM");
async function figmaFullControl(token, fileId, action, params) {
  const headers = { "X-Figma-Token": token };
  switch (action) {
    case "get_file":
      return await fetch(`https://api.figma.com/v1/files/${fileId}`, { headers }).then((r) => r.json());
    case "get_nodes":
      return await fetch(`https://api.figma.com/v1/files/${fileId}/nodes?ids=${params.nodeIds.join(",")}`, { headers }).then((r) => r.json());
    case "get_variables":
      return await fetch(`https://api.figma.com/v1/files/${fileId}/variables/local`, { headers }).then((r) => r.json());
    case "get_published_vars":
      return await fetch(`https://api.figma.com/v1/files/${fileId}/variables/published`, { headers }).then((r) => r.json());
    case "get_images":
      return await fetch(`https://api.figma.com/v1/images/${fileId}?ids=${params.nodeIds.join(",")}`, { headers }).then((r) => r.json());
    case "get_comments":
      return await fetch(`https://api.figma.com/v1/files/${fileId}/comments`, { headers }).then((r) => r.json());
    case "post_comment":
      return await fetch(`https://api.figma.com/v1/files/${fileId}/comments`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ message: params.message, client_meta: params.clientMeta })
      }).then((r) => r.json());
    default:
      return { error: "Unknown Figma action" };
  }
}
__name(figmaFullControl, "figmaFullControl");
__name2(figmaFullControl, "figmaFullControl");
async function telegramFullControl(token, action, params) {
  const baseUrl = `https://api.telegram.org/bot${token}`;
  switch (action) {
    case "send_message":
      return await fetch(`${baseUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          text: params.text,
          parse_mode: params.parse_mode || "HTML",
          reply_markup: params.keyboard ? JSON.parse(params.keyboard) : void 0
        })
      }).then((r) => r.json());
    case "send_photo":
      return await fetch(`${baseUrl}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          photo: params.photo,
          caption: params.caption,
          parse_mode: "HTML"
        })
      }).then((r) => r.json());
    case "send_video":
      return await fetch(`${baseUrl}/sendVideo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          video: params.video,
          caption: params.caption
        })
      }).then((r) => r.json());
    case "send_sticker":
      return await fetch(`${baseUrl}/sendSticker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          sticker: params.sticker
        })
      }).then((r) => r.json());
    case "send_document":
      return await fetch(`${baseUrl}/sendDocument`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          document: params.document,
          caption: params.caption
        })
      }).then((r) => r.json());
    case "send_audio":
      return await fetch(`${baseUrl}/sendAudio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          audio: params.audio,
          caption: params.caption
        })
      }).then((r) => r.json());
    case "delete_message":
      return await fetch(`${baseUrl}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          message_id: params.messageId
        })
      }).then((r) => r.json());
    case "ban_member":
      return await fetch(`${baseUrl}/banChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          user_id: params.userId
        })
      }).then((r) => r.json());
    case "unban_member":
      return await fetch(`${baseUrl}/unbanChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          user_id: params.userId
        })
      }).then((r) => r.json());
    case "promote_member":
      return await fetch(`${baseUrl}/promoteChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          user_id: params.userId,
          can_change_info: params.canChangeInfo,
          can_post_messages: params.canPostMessages,
          can_edit_messages: params.canEditMessages,
          can_delete_messages: params.canDeleteMessages,
          can_invite_users: params.canInviteUsers,
          can_restrict_members: params.canRestrictMembers,
          can_pin_messages: params.canPinMessages,
          can_promote_members: params.canPromoteMembers
        })
      }).then((r) => r.json());
    case "set_webhook":
      return await fetch(`${baseUrl}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: params.url })
      }).then((r) => r.json());
    case "get_webhook_info":
      return await fetch(`${baseUrl}/getWebhookInfo`).then((r) => r.json());
    case "get_chat_member":
      return await fetch(`${baseUrl}/getChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: params.chatId,
          user_id: params.userId
        })
      }).then((r) => r.json());
    case "get_chat":
      return await fetch(`${baseUrl}/getChat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: params.chatId })
      }).then((r) => r.json());
    case "get_me":
      return await fetch(`${baseUrl}/getMe`).then((r) => r.json());
    default:
      return { error: "Unknown Telegram action" };
  }
}
__name(telegramFullControl, "telegramFullControl");
__name2(telegramFullControl, "telegramFullControl");
async function discordFullControl(token, action, params) {
  const headers = {
    "Authorization": `Bot ${token}`,
    "Content-Type": "application/json"
  };
  switch (action) {
    case "send_message":
      return await fetch(`https://discord.com/api/v10/channels/${params.channelId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: params.content,
          embeds: params.embeds,
          components: params.components,
          tts: params.tts || false
        })
      }).then((r) => r.json());
    case "send_file":
      const formData = new FormData();
      formData.append("file", params.file, params.filename);
      if (params.content)
        formData.append("content", params.content);
      return await fetch(`https://discord.com/api/v10/channels/${params.channelId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bot ${token}` },
        body: formData
      }).then((r) => r.json());
    case "create_channel":
      return await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/channels`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: params.name,
          type: params.type || 0,
          topic: params.topic,
          permission_overwrites: params.permissions
        })
      }).then((r) => r.json());
    case "create_role":
      return await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/roles`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: params.name,
          color: params.color,
          permissions: params.permissions,
          hoist: params.hoist || false,
          mentionable: params.mentionable || false
        })
      }).then((r) => r.json());
    case "add_role":
      return await fetch(
        `https://discord.com/api/v10/guilds/${params.guildId}/members/${params.userId}/roles/${params.roleId}`,
        { method: "PUT", headers }
      ).then((r) => r.ok ? { success: true } : { error: "Failed to add role" });
    case "remove_role":
      return await fetch(
        `https://discord.com/api/v10/guilds/${params.guildId}/members/${params.userId}/roles/${params.roleId}`,
        { method: "DELETE", headers }
      ).then((r) => r.ok ? { success: true } : { error: "Failed to remove role" });
    case "kick_member":
      return await fetch(
        `https://discord.com/api/v10/guilds/${params.guildId}/members/${params.userId}`,
        { method: "DELETE", headers }
      ).then((r) => r.ok ? { success: true } : { error: "Failed to kick member" });
    case "ban_member":
      return await fetch(
        `https://discord.com/api/v10/guilds/${params.guildId}/bans/${params.userId}`,
        { method: "PUT", headers, body: JSON.stringify({ delete_message_days: params.days || 0 }) }
      ).then((r) => r.ok ? { success: true } : { error: "Failed to ban member" });
    case "unban_member":
      return await fetch(
        `https://discord.com/api/v10/guilds/${params.guildId}/bans/${params.userId}`,
        { method: "DELETE", headers }
      ).then((r) => r.ok ? { success: true } : { error: "Failed to unban member" });
    case "create_embed":
      return await fetch(`https://discord.com/api/v10/channels/${params.channelId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          embeds: [{
            title: params.title,
            description: params.description,
            color: params.color,
            fields: params.fields,
            thumbnail: params.thumbnail ? { url: params.thumbnail } : void 0,
            image: params.image ? { url: params.image } : void 0,
            footer: params.footer ? { text: params.footer } : void 0,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }]
        })
      }).then((r) => r.json());
    case "create_thread":
      return await fetch(`https://discord.com/api/v10/channels/${params.channelId}/threads`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: params.name,
          auto_archive_duration: params.autoArchiveDuration || 1440,
          type: params.isPrivate ? 12 : 11
        })
      }).then((r) => r.json());
    case "get_guild":
      return await fetch(`https://discord.com/api/v10/guilds/${params.guildId}`, { headers }).then((r) => r.json());
    case "get_members":
      return await fetch(
        `https://discord.com/api/v10/guilds/${params.guildId}/members?limit=${params.limit || 1e3}`,
        { headers }
      ).then((r) => r.json());
    default:
      return { error: "Unknown Discord action" };
  }
}
__name(discordFullControl, "discordFullControl");
__name2(discordFullControl, "discordFullControl");
async function wolframFullControl(appId, action, params) {
  const baseUrl = "https://api.wolframalpha.com/v1";
  switch (action) {
    case "query":
      const queryParams = new URLSearchParams({
        appid: appId,
        input: params.input,
        format: "plaintext,image",
        output: "json"
      });
      return await fetch(`${baseUrl}/result?${queryParams}`).then((r) => r.text());
    case "full_query":
      const fullParams = new URLSearchParams({
        appid: appId,
        input: params.input,
        format: "plaintext,image,sound",
        output: "json",
        units: params.units || "metric"
      });
      return await fetch(`${baseUrl}/query?${fullParams}`).then((r) => r.json());
    default:
      return { error: "Unknown Wolfram action" };
  }
}
__name(wolframFullControl, "wolframFullControl");
__name2(wolframFullControl, "wolframFullControl");
async function canvaFullControl(token, action, params, cachedDesigns) {
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  switch (action) {
    case "get_user":
      return await fetch("https://api.canva.com/v1/users/me", { headers }).then((r) => r.json());
    case "list_folders":
      return await fetch("https://api.canva.com/v1/folders", { headers }).then((r) => r.json());
    case "list_designs":
      return await fetch("https://api.canva.com/v1/designs?ownership=any&limit=" + (params?.limit || 50), { headers }).then((r) => r.json());
    case "create_design":
      return await fetch("https://api.canva.com/v1/designs", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: params.title,
          template_id: params.templateId,
          dimensions: params.dimensions || { width: 1920, height: 1080 }
        })
      }).then((r) => r.json());
    case "export_design": {
      const designId = params.designId || cachedDesigns?.[0]?.id;
      if (!designId) {
        return { error: "No Canva design found. Create one first or specify designId." };
      }
      return await fetch(`https://api.canva.com/v1/designs/${designId}/exports`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          format: params.format || "png",
          quality: params.quality || "standard"
        })
      }).then((r) => r.json());
    }
    default:
      return { error: "Unknown Canva action" };
  }
}
__name(canvaFullControl, "canvaFullControl");
__name2(canvaFullControl, "canvaFullControl");
async function zapierFullControl(webhookUrl, params) {
  return await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data)
  }).then((r) => r.ok ? { success: true } : { error: "Webhook failed" });
}
__name(zapierFullControl, "zapierFullControl");
__name2(zapierFullControl, "zapierFullControl");
async function genericAuthenticatedApiCall(token, method, endpoint, body, extraHeaders) {
  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...extraHeaders || {}
    };
    const options = { method: method || "GET", headers };
    if (body && method !== "GET") {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }
    const response = await fetch(endpoint, options);
    const contentType = response.headers.get("Content-Type") || "";
    const data = contentType.includes("application/json") ? await response.json().catch(() => ({})) : await response.text();
    if (!response.ok) {
      return { success: false, status: response.status, error: typeof data === "object" ? data.error || data.message : data };
    }
    return { success: true, status: response.status, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
__name(genericAuthenticatedApiCall, "genericAuthenticatedApiCall");
__name2(genericAuthenticatedApiCall, "genericAuthenticatedApiCall");
async function executePluginFull(env2, auth, body) {
  const { app, action, params } = body;
  if (!app || !action) {
    return { error: "app and action are required" };
  }
  const integration = await env2.DB.prepare(
    "SELECT access_token FROM user_integrations WHERE user_id = ? AND app_name = ? AND status = 'CONNECTED'"
  ).bind(auth.userId, app).first();
  if (!integration) {
    return { error: `${app} not connected. Please connect first.` };
  }
  let result;
  try {
    switch (app) {
      case "figma":
        result = await figmaFullControl(integration.access_token, params.fileId, action, params);
        break;
      case "telegram":
        result = await telegramFullControl(integration.access_token, action, params);
        break;
      case "discord":
        result = await discordFullControl(integration.access_token, action, params);
        break;
      case "wolfram":
        result = await wolframFullControl(integration.access_token, action, params);
        break;
      case "canva":
        result = await canvaFullControl(integration.access_token, action, params);
        break;
      case "zapier":
        result = await zapierFullControl(integration.access_token, params);
        break;
      default:
        if (GENERIC_OAUTH_PROVIDERS.includes(app) || ["google", "gmail", "github"].includes(app)) {
          if (!params || !params.endpoint) {
            return { error: `To use ${app}, provide 'endpoint' (full API URL) and optionally 'method' (GET/POST/etc), 'body', and 'headers' in params.` };
          }
          const apiResult = await genericAuthenticatedApiCall(
            integration.access_token,
            params.method || "GET",
            params.endpoint,
            params.body,
            params.headers
          );
          if (apiResult.success === false) {
            return { error: apiResult.error || `${app} API call failed`, status: apiResult.status };
          }
          result = apiResult.data;
          break;
        }
        return { error: "Unknown app" };
    }
  } catch (error) {
    return { error: error.message };
  }
  return { success: true, data: result };
}
__name(executePluginFull, "executePluginFull");
__name2(executePluginFull, "executePluginFull");
__name22(analyzeImageWithGLM, "analyzeImageWithGLM");
async function analyzeImageWithGemma(imageData, prompt) {
  console.log("\u{1F4F8} analyzeImageWithGemma: Starting...");
  const key = getNextKey("sambanova");
  if (!key)
    return null;
  try {
    let img = imageData;
    if (!img.startsWith("data:")) {
      img = "data:image/jpeg;base64," + img;
    }
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma-4-31b-it",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt || "Describe this image according to previous questions if not related from previous question describe only in extreame." },
            { type: "image_url", image_url: { url: img } }
          ]
        }],
        max_tokens: 1e3
      })
    });
    if (response.ok) {
      const d = await response.json();
      return d.choices?.[0]?.message?.content || null;
    }
  } catch (e) {
    console.error("\u274C analyzeImageWithGemma Error:", e.message);
  }
  return null;
}
__name(analyzeImageWithGemma, "analyzeImageWithGemma");
__name2(analyzeImageWithGemma, "analyzeImageWithGemma");
__name22(analyzeImageWithGemma, "analyzeImageWithGemma");
async function quantumVisionAnalyze(imageData, prompt) {
  const geminiResult = await analyzeImageWithGemini(imageData, prompt);
  if (geminiResult)
    return { analysis: geminiResult, provider: "Gemini 2.5 Flash", success: true };
  const gemmaResult = await analyzeImageWithGemma(imageData, prompt);
  if (gemmaResult)
    return { analysis: gemmaResult, provider: "Gemma-3 (SambaNova)", success: true };
  const glmResult = await analyzeImageWithGLM(imageData, prompt);
  if (glmResult)
    return { analysis: glmResult, provider: "GLM-4V (Zhipu AI)", success: true };
  return { success: false, error: "All vision engines failed" };
}
__name(quantumVisionAnalyze, "quantumVisionAnalyze");
__name2(quantumVisionAnalyze, "quantumVisionAnalyze");
__name22(quantumVisionAnalyze, "quantumVisionAnalyze");
async function quantumImageTransform(env2, imageData, instruction) {
  if (!env2?.AI)
    return { success: false };
  try {
    let img = imageData;
    if (!img.startsWith("data:"))
      img = "data:image/png;base64," + img;
    const r = await env2.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
      prompt: instruction,
      image: img,
      strength: 0.75,
      guidance: 7.5,
      steps: 20
    });
    if (r?.image) {
      const bs = atob(r.image);
      const ua = new Uint8Array(bs.length);
      for (let i = 0; i < bs.length; i++)
        ua[i] = bs.charCodeAt(i);
      const blob = new Blob([ua], { type: "image/png" });
      const iid = generateId();
      await saveImageToKV(env2, iid, blob);
      return {
        success: true,
        blob,
        provider: "SDXL Transform",
        url: CONFIG.WORKER_URL + "/image/" + iid,
        imageId: iid
      };
    }
  } catch (e) {
  }
  return { success: false };
}
__name(quantumImageTransform, "quantumImageTransform");
__name2(quantumImageTransform, "quantumImageTransform");
__name22(quantumImageTransform, "quantumImageTransform");
async function autoTranslateResponse(response, targetLang) {
  if (!response || targetLang === "en")
    return response;
  const key = getNextKey("gemini");
  if (!key)
    return response;
  try {
    const targetName = INDIAN_LANGUAGES[targetLang]?.name || targetLang;
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Translate to " + targetName + ". Keep ALL formatting. Return ONLY translation:\n\n" + response }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: CONFIG.MAX_TOKENS_GEMINI }
        })
      }
    );
    if (r.ok) {
      const d = await r.json();
      return d.candidates?.[0]?.content?.parts?.[0]?.text || response;
    }
  } catch (e) {
  }
  return response;
}
__name(autoTranslateResponse, "autoTranslateResponse");
__name2(autoTranslateResponse, "autoTranslateResponse");
__name22(autoTranslateResponse, "autoTranslateResponse");
function escapePdfText(str) {
  return String(str).replace(/[^\x00-\xFF]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
__name(escapePdfText, "escapePdfText");
function wrapPdfText(text, maxChars) {
  const words = String(text).split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}
__name(wrapPdfText, "wrapPdfText");
function generateSimplePDF(title, bodyText) {
  const pageWidth = 612, pageHeight = 792;
  const marginLeft = 50, marginTop = 742, lineHeight = 16, maxCharsPerLine = 90;
  let allLines = [];
  allLines.push({ text: escapePdfText(title), size: 18 });
  allLines.push({ text: "", size: 12 });
  const paragraphs = String(bodyText).split("\n");
  for (const para of paragraphs) {
    if (para.trim() === "") {
      allLines.push({ text: "", size: 12 });
      continue;
    }
    const wrapped = wrapPdfText(para, maxCharsPerLine);
    for (const w of wrapped) allLines.push({ text: escapePdfText(w), size: 12 });
  }
  const pages = [];
  let cur = [];
  let usedHeight = 0;
  for (const line of allLines) {
    const h = line.size === 18 ? 24 : lineHeight;
    if (usedHeight + h > marginTop - 50) {
      pages.push(cur);
      cur = [];
      usedHeight = 0;
    }
    cur.push(line);
    usedHeight += h;
  }
  if (cur.length) pages.push(cur);
  if (pages.length === 0) pages.push([{ text: "(empty)", size: 12 }]);
  const pageObjIds = [];
  const contentObjIds = [];
  let objCounter = 3;
  const fontObjId = objCounter++;
  for (const pageLines of pages) {
    let y = marginTop;
    let streamOps = "BT\n";
    for (const line of pageLines) {
      const fontSize = line.size;
      streamOps += `/F1 ${fontSize} Tf
1 0 0 1 ${marginLeft} ${y} Tm
(${line.text}) Tj
`;
      y -= fontSize === 18 ? 24 : lineHeight;
    }
    streamOps += "ET";
    const contentObjId = objCounter++;
    const pageObjId = objCounter++;
    contentObjIds.push({ id: contentObjId, stream: streamOps });
    pageObjIds.push(pageObjId);
  }
  const objStrings = [];
  objStrings[1] = `1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
`;
  const kids = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  objStrings[2] = `2 0 obj
<< /Type /Pages /Kids [ ${kids} ] /Count ${pageObjIds.length} >>
endobj
`;
  objStrings[fontObjId] = `${fontObjId} 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
`;
  for (let i = 0; i < pages.length; i++) {
    const c = contentObjIds[i];
    const pId = pageObjIds[i];
    objStrings[c.id] = `${c.id} 0 obj
<< /Length ${c.stream.length} >>
stream
${c.stream}
endstream
endobj
`;
    objStrings[pId] = `${pId} 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjId} 0 R >> >> /Contents ${c.id} 0 R >>
endobj
`;
  }
  const maxObjId = objCounter - 1;
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 1; i <= maxObjId; i++) {
    offsets.push(pdf.length);
    pdf += objStrings[i];
  }
  const xrefStart = pdf.length;
  pdf += `xref
0 ${maxObjId + 1}
`;
  pdf += `0000000000 65535 f 
`;
  for (let i = 1; i <= maxObjId; i++) {
    pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }
  pdf += `trailer
<< /Size ${maxObjId + 1} /Root 1 0 R >>
startxref
${xrefStart}
%%EOF`;
  return pdf;
}
__name(generateSimplePDF, "generateSimplePDF");
function pdfToBase64(pdfStr) {
  return btoa(pdfStr);
}
__name(pdfToBase64, "pdfToBase64");
async function generateQuizOrPuzzleContent(env2, topic, type, questionCount) {
  const count = questionCount || 10;
  const kind = type === "puzzle" ? "puzzles (riddles, logic puzzles, or brain teasers)" : "quiz questions (multiple choice, 4 options each, mark correct answer clearly)";
  const prompt = `Create ${count} ${kind} on the topic: "${topic}".
Format as plain text, numbered, one question per block, clear and well-spaced. Include an "Answer Key" section at the end listing all correct answers. Do NOT use markdown symbols like ** or #. Keep it clean plain text suitable for printing.`;
  const messages = [{ role: "user", content: prompt }];
  try {
    const result = await quantumAIOrchestrator(prompt, messages, {
      webSearch: false,
      priority: "quality",
      taskType: "general",
      env2
    });
    return result.response || null;
  } catch (e) {
    console.error("generateQuizOrPuzzleContent error:", e.message);
    return null;
  }
}
__name(generateQuizOrPuzzleContent, "generateQuizOrPuzzleContent");
function buildPdfHtml(title, bodyText) {
  const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paragraphs = String(bodyText).split("\n").map((line) => {
    if (line.trim() === "") return "<br/>";
    return "<p>" + escapeHtml(line) + "</p>";
  }).join("\n");
  return `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap');
body { font-family: 'Noto Sans', 'Noto Sans Devanagari', Arial, sans-serif; font-size: 14px; line-height: 1.6; padding: 40px; color: #111; }
h1 { font-size: 22px; margin-bottom: 20px; }
p { margin: 4px 0; white-space: pre-wrap; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${paragraphs}
</body>
</html>`;
}
__name(buildPdfHtml, "buildPdfHtml");
async function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
__name(arrayBufferToBase64, "arrayBufferToBase64");
async function generateUnicodePDFViaBrowser(env2, title, bodyText, isRetry) {
  if (!env2 || !env2.BROWSER) return null;
  try {
    const html = buildPdfHtml(title, bodyText);
    const pdfResponse = await env2.BROWSER.quickAction("pdf", { html });
    if (!pdfResponse || !pdfResponse.ok) {
      let errBody = "";
      try {
        errBody = pdfResponse ? await pdfResponse.text() : "no response";
      } catch (e2) {
      }
      console.error(`\u274C Browser Run PDF failed (status ${pdfResponse ? pdfResponse.status : "none"}):`, errBody);
      if (!isRetry) {
        let waitMs = 11e3;
        const retryAfter = pdfResponse ? pdfResponse.headers.get("Retry-After") : null;
        if (retryAfter && !isNaN(Number(retryAfter))) {
          waitMs = Number(retryAfter) * 1e3 + 500;
        }
        console.log(`\u{1F504} Retrying Browser Run PDF once after ${waitMs}ms (rate limit: Free plan allows 1 request/10s)...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        return await generateUnicodePDFViaBrowser(env2, title, bodyText, true);
      }
      return null;
    }
    const buf = await pdfResponse.arrayBuffer();
    return await arrayBufferToBase64(buf);
  } catch (e) {
    console.error("generateUnicodePDFViaBrowser error:", e.message);
    if (!isRetry) {
      await new Promise((resolve) => setTimeout(resolve, 11e3));
      return await generateUnicodePDFViaBrowser(env2, title, bodyText, true);
    }
    return null;
  }
}
__name(generateUnicodePDFViaBrowser, "generateUnicodePDFViaBrowser");
function getPdfGenerationLimit(plan) {
  const limits = { free: 3, plus: 15, pro: 60, enterprise: Infinity };
  return limits[plan] !== void 0 ? limits[plan] : 3;
}
__name(getPdfGenerationLimit, "getPdfGenerationLimit");
async function checkPdfLimit(env2, userId) {
  if (isAdmin(userId)) {
    return { allowed: true, limit: Infinity, used: 0, remaining: Infinity, plan: "enterprise" };
  }
  const user = await getUser(env2, userId);
  const plan = user.plan || "free";
  const limit = getPdfGenerationLimit(plan);
  if (limit === Infinity) {
    return { allowed: true, limit, used: 0, remaining: Infinity, plan };
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const key = "pdf_usage:" + userId + ":" + today;
  const used = parseInt(await env2.KV.get(key)) || 0;
  return { allowed: used < limit, limit, used, remaining: Math.max(0, limit - used), plan };
}
__name(checkPdfLimit, "checkPdfLimit");
async function incrementPdfUsage(env2, userId) {
  if (isAdmin(userId)) return;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const key = "pdf_usage:" + userId + ":" + today;
  const current = parseInt(await env2.KV.get(key)) || 0;
  await env2.KV.put(key, String(current + 1), { expirationTtl: 172800 });
}
__name(incrementPdfUsage, "incrementPdfUsage");
function trackEvent(env2, eventName, data) {
  try {
    if (!env2 || !env2.ANALYTICS) return;
    const d = data || {};
    env2.ANALYTICS.writeDataPoint({
      blobs: [eventName, String(d.userId || "anonymous"), String(d.plan || "free"), String(d.model || ""), String(d.status || "ok")],
      doubles: [Number(d.latency) || 0, Number(d.value) || 1],
      indexes: [eventName]
    });
  } catch (e) {
    console.error("trackEvent error (non-fatal):", e.message);
  }
}
__name(trackEvent, "trackEvent");
function extractArtifact(responseText) {
  if (!responseText || typeof responseText !== "string") return null;
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  let largestBlock = null;
  while ((match = codeBlockRegex.exec(responseText)) !== null) {
    const lang = match[1] || "text";
    const code = match[2];
    if (!largestBlock || code.length > largestBlock.content.length) {
      largestBlock = { language: lang, content: code };
    }
  }
  if (largestBlock && largestBlock.content.trim().length > 200) {
    const langTitles = { javascript: "Code", js: "Code", python: "Code", py: "Code", html: "HTML Document", jsx: "React Component", tsx: "React Component" };
    return {
      type: "code",
      language: largestBlock.language,
      content: largestBlock.content.trim(),
      title: (langTitles[largestBlock.language.toLowerCase()] || largestBlock.language.toUpperCase() || "Code") + " Snippet"
    };
  }
  const headerCount = (responseText.match(/^#{1,3}\s/gm) || []).length;
  if (headerCount >= 2 && responseText.length > 1500) {
    return {
      type: "document",
      language: "markdown",
      content: responseText.trim(),
      title: "Document"
    };
  }
  return null;
}
__name(extractArtifact, "extractArtifact");
async function generateRelatedQuestions(env2, query, responseText) {
  try {
    const prompt = `Based on this Q&A, suggest exactly 3 short, natural follow-up questions the user might ask next.
Question: "${query}"
Answer summary: "${String(responseText).substring(0, 500)}"

Respond ONLY with a JSON array of 3 strings, nothing else. Example: ["Follow up 1?", "Follow up 2?", "Follow up 3?"]`;
    const result = await quantumAIOrchestrator(prompt, [{ role: "user", content: prompt }], {
      webSearch: false,
      priority: "speed",
      taskType: "general",
      env2
    });
    const parsed = tryParseJSON(result.response);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3).map((q) => String(q)).filter(Boolean);
    }
    return [];
  } catch (e) {
    console.error("generateRelatedQuestions error:", e.message);
    return [];
  }
}
__name(generateRelatedQuestions, "generateRelatedQuestions");
function tryParseJSON(text) {
  if (!text || typeof text !== "string")
    return null;
  let cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}
__name(tryParseJSON, "tryParseJSON");
__name2(tryParseJSON, "tryParseJSON");
async function quantumResponse(env2, query, context, userInfo, options) {
  const config = options || {};
  const isAgentChat = config.isAgentChat || false;
  const isPremium = config.isPremium || false;
  const userId = config.userId || "anonymous";
  const agentPrompt = config.agentPrompt || null;
  const targetLanguage = config.targetLanguage || "en";
  const detectedLanguage = detectLanguage(query);
  const responseLanguage = detectedLanguage;
  const startTime = Date.now();
  const reasoning = await multiStageReasoning(query, context, {
    stages: ["plan", "search", "reason"]
  });
  let enrichedContext = context || "";
  let webSources = [];
  try {
    const userForPrefs = await getUser(env2, userId);
    if (userForPrefs.customInstructions) {
      enrichedContext = "\n\n**\u{1F464} USER'S CUSTOM INSTRUCTIONS (always follow these):**\n" + userForPrefs.customInstructions + "\n\n" + enrichedContext;
    }
  } catch (e) {
    console.error("Custom instructions fetch error:", e.message);
  }
  if (reasoning.plan && reasoning.plan.needsSearch) {
    const searchResult = await performWebSearch(query);
    if (searchResult && searchResult.content) {
      enrichedContext = "\n\n**\u{1F310} LIVE SEARCH (Source: " + searchResult.source + "):**\n" + searchResult.content + "\n\n**\u26A0\uFE0F PRIMARY DATA - Today: " + TODAY + "**\n\n" + enrichedContext;
      if (searchResult.sources && searchResult.sources.length > 0) {
        webSources = searchResult.sources;
      }
    }
  }
  let finalPrompt;
  if (isAgentChat && agentPrompt) {
    finalPrompt = agentPrompt + "\n\n**Context:** " + enrichedContext + "\n\n**Query:** " + query + "\n\n**Respond in " + (INDIAN_LANGUAGES[responseLanguage]?.name || responseLanguage) + ".** No NEXUS intro.";
  } else {
    finalPrompt = getMasterPrompt() + "\n\n**Language: " + (INDIAN_LANGUAGES[responseLanguage]?.name || responseLanguage) + "**\n**Today: " + TODAY + "**\n**Complexity: " + (reasoning.plan?.complexity || "medium") + "**\n**Approach: " + (reasoning.plan?.approach || "direct") + "**\n\n" + enrichedContext + "\n\n**Query:** " + query;
    if (!isPremium && /(premium|upgrade|plan|price|subscription)/i.test(query)) {
      finalPrompt += "\n\n**Premium Plans:** Monthly: \u20B9299 | Yearly: \u20B91,499 | Pro: \u20B92,999/year. UPI: " + CONFIG.UPI_ID;
    }
  }
  const messages = [{ role: "user", content: finalPrompt }];
  if (config.responseFormat === "json") {
    const schemaHint = config.jsonSchema ? `

**Respond with ONLY valid JSON matching this schema (no markdown fences, no commentary):**
${JSON.stringify(config.jsonSchema)}` : `

**Respond with ONLY valid JSON (no markdown fences, no commentary).**`;
    messages[0].content += schemaHint;
  }
  const aiResult = await quantumAIOrchestrator(finalPrompt, messages, {
    webSearch: reasoning.plan?.needsSearch || false,
    priority: isPremium ? "quality" : "balanced",
    taskType: reasoning.plan?.approach === "code" ? "code" : reasoning.plan?.approach === "creative" ? "creative" : "general",
    env2,
    userId
  });
  console.log("aiResult.model:", aiResult.model);
  console.log("aiResult.response preview:", aiResult.response?.substring(0, 100));
  let response = aiResult.response;
  let jsonParsed = null;
  let jsonValid = null;
  if (config.responseFormat === "json") {
    const parsed = tryParseJSON(response);
    if (parsed !== null) {
      jsonParsed = parsed;
      jsonValid = true;
    } else {
      try {
        const repairResult = await callSpecificModel(aiResult.model !== "fallback" ? aiResult.model : "gemini", `Fix this into valid JSON only, no commentary, no markdown fences:

${response}`, [{ role: "user", content: `Fix this into valid JSON only, no commentary, no markdown fences:

${response}` }], false);
        const reparsed = tryParseJSON(repairResult);
        if (reparsed !== null) {
          response = repairResult;
          jsonParsed = reparsed;
          jsonValid = true;
        } else {
          jsonValid = false;
        }
      } catch (e) {
        jsonValid = false;
      }
    }
  }
  if (targetLanguage !== "en" && targetLanguage !== responseLanguage) {
    response = await autoTranslateResponse(response, targetLanguage);
  }
  const latency = Date.now() - startTime;
  trackEvent(env2, "chat_response", { userId, model: aiResult.model, latency, status: "ok" });
  const artifact = extractArtifact(response);
  let relatedQuestions = [];
  if (config.includeRelatedQuestions) {
    relatedQuestions = await generateRelatedQuestions(env2, query, response);
  }
  return {
    response,
    ...config.responseFormat === "json" ? { json: jsonParsed, jsonValid } : {},
    model: aiResult.model,
    intent: reasoning.plan?.approach || "general_chat",
    confidence: reasoning.reasoning?.confidence || 0.7,
    latency,
    isPremium,
    searchPerformed: reasoning.plan?.needsSearch || false,
    sources: webSources,
    artifact,
    relatedQuestions,
    language: responseLanguage
  };
}
__name(quantumResponse, "quantumResponse");
__name2(quantumResponse, "quantumResponse");
__name22(quantumResponse, "quantumResponse");
var UltraStream = /* @__PURE__ */ __name2(class {
  constructor() {
    this.controller = null;
    this.encoder = new TextEncoder();
    this.closed = false;
    this.chunkCount = 0;
    this.totalCharacters = 0;
    this.startTime = Date.now();
  }
  create() {
    const self = this;
    return new ReadableStream({
      start: function(controller) {
        self.controller = controller;
        self.send({
          type: "init",
          timestamp: Date.now(),
          version: "8.0",
          mode: "monster"
        });
      },
      cancel: function() {
        self.closed = true;
        self.controller = null;
      }
    });
  }
  send(data) {
    if (!this.closed && this.controller) {
      try {
        this.controller.enqueue(
          this.encoder.encode("data: " + JSON.stringify(data) + "\n\n")
        );
      } catch (e) {
      }
    }
  }
  chunk(text) {
    this.chunkCount = this.chunkCount + 1;
    this.totalCharacters = this.totalCharacters + text.length;
    this.send({
      type: "chunk",
      text,
      index: this.chunkCount
    });
  }
  thinking(reason) {
    this.send({
      type: "thinking",
      reason,
      timestamp: Date.now()
    });
  }
  searchResult(source, snippet) {
    this.send({
      type: "search",
      source,
      snippet: (snippet || "").substring(0, 200)
    });
  }
  imageProgress(engine, status) {
    this.send({
      type: "image_progress",
      engine,
      status
    });
  }
  done(fullResponse, metadata) {
    if (!this.closed && this.controller) {
      try {
        this.send({
          type: "done",
          fullResponse,
          stats: {
            chunks: this.chunkCount,
            characters: this.totalCharacters,
            time: Date.now() - this.startTime,
            speed: Math.round(this.totalCharacters / ((Date.now() - this.startTime) / 1e3))
          },
          metadata: metadata || {}
        });
        this.controller.enqueue(this.encoder.encode("data: [DONE]\n\n"));
        this.controller.close();
      } catch (e) {
      }
    }
    this.closed = true;
  }
  error(message, code) {
    if (!this.closed && this.controller) {
      try {
        this.send({
          type: "error",
          error: message,
          code: code || 500,
          timestamp: Date.now()
        });
        this.controller.close();
      } catch (e) {
      }
    }
    this.closed = true;
  }
}, "UltraStream");
__name22(UltraStream, "UltraStream");
var STREAMING_MODES = {
  typing: {
    name: "Human Typing",
    delay: 30,
    chunkMode: "smart",
    description: "ChatGPT natural feel"
  },
  burst: {
    name: "Burst Mode",
    delay: 0,
    chunkMode: "sentence",
    description: "DeepSeek instant speed"
  },
  word: {
    name: "Word by Word",
    delay: 50,
    chunkMode: "word",
    description: "Claude dramatic effect"
  },
  quantum: {
    name: "Quantum Mode",
    delay: 10,
    chunkMode: "smart",
    description: "Gemini ultra-fast thinking"
  }
};
function intelligentChunk(text, mode) {
  if (!text)
    return [];
  switch (mode) {
    case "word": {
      const words = text.split(/(\s+)/);
      const chunks = [];
      for (let i = 0; i < words.length; i = i + 2) {
        chunks.push(words.slice(i, i + 2).join(""));
      }
      return chunks.filter(function(c) {
        return c.length > 0;
      });
    }
    case "sentence":
      return text.match(/[^.!?\n]+[.!?\n]?/g) || [text];
    case "smart":
    default: {
      const smartChunks = [];
      let i = 0;
      while (i < text.length) {
        let end = i + 4;
        if (end < text.length) {
          for (let j = end; j < text.length && j < end + 5; j++) {
            if (/[\s.,!?;:\n]/.test(text[j])) {
              end = j + 1;
              break;
            }
          }
        }
        smartChunks.push(text.substring(i, Math.min(end, text.length)));
        i = Math.min(end, text.length);
      }
      return smartChunks;
    }
  }
}
__name(intelligentChunk, "intelligentChunk");
__name2(intelligentChunk, "intelligentChunk");
__name22(intelligentChunk, "intelligentChunk");
async function quantumStreaming(gen, stream, mode) {
  const config = STREAMING_MODES[mode] || STREAMING_MODES.typing;
  let fullResponse = "";
  stream.thinking("Starting " + config.name + " streaming mode...");
  try {
    for await (const chunk of gen) {
      if (chunk && chunk.text) {
        fullResponse = fullResponse + chunk.text;
        if (chunk.provider) {
          stream.send({
            type: "provider",
            provider: chunk.provider
          });
        }
      }
    }
    if (!fullResponse) {
      stream.error("No response generated");
      return "";
    }
    const chunks = intelligentChunk(fullResponse, config.chunkMode);
    for (const chunk of chunks) {
      stream.chunk(chunk);
      if (config.delay > 0) {
        await new Promise(function(resolve) {
          setTimeout(resolve, config.delay);
        });
      }
    }
    stream.done(fullResponse, {
      mode: config.name,
      totalChunks: chunks.length
    });
    return fullResponse;
  } catch (e) {
    stream.error(e.message);
    return fullResponse;
  }
}
__name(quantumStreaming, "quantumStreaming");
__name2(quantumStreaming, "quantumStreaming");
__name22(quantumStreaming, "quantumStreaming");
async function* quantumStreamGenerator(messages, prompt) {
  const streamers = [
    { name: "gemini", gen: function() {
      return quantumGeminiStream(prompt);
    } },
    { name: "groq", gen: function() {
      return quantumGroqStream(messages);
    } },
    { name: "mimo", gen: function() {
      return quantumMimoStream(messages);
    } },
    { name: "cerebras", gen: function() {
      return quantumCerebrasStream(messages);
    } },
    { name: "sambanova", gen: function() {
      return quantumSambaNovaStream(messages);
    } }
  ];
  for (const s of streamers) {
    try {
      let hasContent = false;
      for await (const chunk of s.gen()) {
        if (chunk) {
          hasContent = true;
          yield { text: chunk, provider: s.name };
        }
      }
      if (hasContent)
        return;
    } catch (e) {
    }
  }
  yield {
    text: CONFIG.APP_NAME + " by " + CONFIG.CREATOR + " - How can I help you today?",
    provider: "fallback"
  };
}
__name(quantumStreamGenerator, "quantumStreamGenerator");
__name2(quantumStreamGenerator, "quantumStreamGenerator");
__name22(quantumStreamGenerator, "quantumStreamGenerator");
async function* quantumGeminiStream(prompt) {
  const key = getNextKey("gemini");
  if (!key)
    return;
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=" + key,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: CONFIG.MAX_TOKENS_GEMINI,
            temperature: 0.7
          },
          tools: [{ googleSearch: {} }]
        })
      }
    );
    if (!response.ok) {
      if (response.status === 429)
        markKeyFailed("gemini", key, 60);
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      buffer = buffer + decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
          try {
            const data = JSON.parse(line.substring(6));
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text)
              yield text;
          } catch (e) {
          }
        }
      }
    }
  } catch (e) {
  }
}
__name(quantumGeminiStream, "quantumGeminiStream");
__name2(quantumGeminiStream, "quantumGeminiStream");
__name22(quantumGeminiStream, "quantumGeminiStream");
async function* quantumGroqStream(messages) {
  const key = getNextKey("groq");
  if (!key)
    return;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.7,
        max_tokens: CONFIG.MAX_TOKENS_GROQ,
        tools: [{ type: "web_search" }],
        tool_choice: "auto",
        stream: true
      })
    });
    if (!response.ok) {
      if (response.status === 429)
        markKeyFailed("groq", key, 60);
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      buffer = buffer + decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
          try {
            const data = JSON.parse(line.substring(6));
            const text = data?.choices?.[0]?.delta?.content;
            if (text)
              yield text;
          } catch (e) {
          }
        }
      }
    }
  } catch (e) {
  }
}
__name(quantumGroqStream, "quantumGroqStream");
__name2(quantumGroqStream, "quantumGroqStream");
__name22(quantumGroqStream, "quantumGroqStream");
async function* quantumMimoStream(messages) {
  const key = getNextKey("openrouter");
  if (!key)
    return;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "HTTP-Referer": CONFIG.WORKER_URL,
        "X-Title": CONFIG.APP_NAME
      },
      body: JSON.stringify({
        model: "xiaomi/mimo-v2.5-pro",
        messages,
        temperature: 0.3,
        max_tokens: CONFIG.MAX_TOKENS_MIMO,
        stream: true
      })
    });
    if (!response.ok)
      return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      buffer = buffer + decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
          try {
            const data = JSON.parse(line.substring(6));
            const text = data?.choices?.[0]?.delta?.content;
            if (text)
              yield text;
          } catch (e) {
          }
        }
      }
    }
  } catch (e) {
  }
}
__name(quantumMimoStream, "quantumMimoStream");
__name2(quantumMimoStream, "quantumMimoStream");
__name22(quantumMimoStream, "quantumMimoStream");
async function* quantumCerebrasStream(messages) {
  const key = getNextKey("cerebras");
  if (!key)
    return;
  try {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-oss120",
        messages,
        temperature: 0.3,
        max_completion_tokens: CONFIG.MAX_TOKENS_CEREBRAS,
        top_p: 1,
        // 3️⃣ 🔥 Ye naya parameter add karo
        reasoning_effort: "high",
        stream: true
      })
    });
    if (!response.ok) {
      if (response.status === 429)
        markKeyFailed("cerebras", key, 60);
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      buffer = buffer + decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
          try {
            const data = JSON.parse(line.substring(6));
            const text = data?.choices?.[0]?.delta?.content;
            if (text)
              yield text;
          } catch (e) {
          }
        }
      }
    }
  } catch (e) {
  }
}
__name(quantumCerebrasStream, "quantumCerebrasStream");
__name2(quantumCerebrasStream, "quantumCerebrasStream");
__name22(quantumCerebrasStream, "quantumCerebrasStream");
async function* quantumSambaNovaStream(messages) {
  const key = getNextKey("sambanova");
  if (!key)
    return;
  try {
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma-4-31b-it",
        messages,
        temperature: 0.3,
        max_tokens: CONFIG.MAX_TOKENS_SAMBANOVA
      })
    });
    if (!response.ok)
      return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      buffer = buffer + decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
          try {
            const data = JSON.parse(line.substring(6));
            const text = data?.choices?.[0]?.delta?.content;
            if (text)
              yield text;
          } catch (e) {
          }
        }
      }
    }
  } catch (e) {
  }
}
__name(quantumSambaNovaStream, "quantumSambaNovaStream");
__name2(quantumSambaNovaStream, "quantumSambaNovaStream");
__name22(quantumSambaNovaStream, "quantumSambaNovaStream");
async function ultimateChatHandler(env2, message, context, userId, sessionId, ip, mode) {
  const ultra = new UltraStream();
  const stream = ultra.create();
  const processPromise = async function() {
    let fullResponse = "";
    try {
      const decision = await quantumSemanticDecision(message, context, null);
      ultra.thinking("Detected: " + decision.intent + " (" + Math.round(decision.confidence * 100) + "%)");
      let enrichedContext = context || "";
      if (decision.intent === "web_search") {
        const searchResult = await performWebSearch(message);
        if (searchResult) {
          ultra.searchResult(searchResult.source, searchResult.content);
          enrichedContext = "\n\n**\u{1F310} SEARCH: " + searchResult.source + "**\n" + searchResult.content + "\n\n" + enrichedContext;
        }
      }
      const detectedLanguage = detectLanguage(message);
      const finalPrompt = getMasterPrompt() + "\n\n**Language: " + (INDIAN_LANGUAGES[detectedLanguage]?.name || "English") + "**\n**Today: " + TODAY + "**\n\n" + enrichedContext;
      const messages = [{ role: "user", content: finalPrompt }];
      const gen = quantumStreamGenerator(messages, finalPrompt);
      fullResponse = await quantumStreaming(gen, ultra, mode);
      if (fullResponse && userId !== "anonymous") {
        await addMessage(env2, ip, userId, sessionId, message, fullResponse);
        await saveToVectorDB(env2, userId, message, {
          response: fullResponse.substring(0, 500),
          type: "chat",
          intent: decision.intent
        });
        await updateDailyStat(env2, "messages");
      }
    } catch (e) {
      ultra.error(e.message);
    }
  }();
  return {
    stream,
    processPromise
  };
}
__name(ultimateChatHandler, "ultimateChatHandler");
__name2(ultimateChatHandler, "ultimateChatHandler");
__name22(ultimateChatHandler, "ultimateChatHandler");
async function unsplashSearch(query, options) {
  const config = options || {};
  try {
    const params = new URLSearchParams({
      query,
      per_page: Math.min(config.per_page || 10, 30),
      page: config.page || 1,
      orientation: config.orientation || "landscape",
      order_by: config.order || "relevant"
    });
    if (config.color) {
      params.append("color", config.color);
    }
    const url = "https://api.unsplash.com/search/photos?query=" + encodeURIComponent(query) + "&per_page=" + Math.min(config.per_page || 10, 30) + "&page=" + (config.page || 1) + "&orientation=" + (config.orientation || "landscape") + "&order_by=" + (config.order || "relevant");
    console.log("\u{1F4F8} Unsplash URL:", url);
    const response = await fetch(url, {
      headers: {
        "Authorization": "Client-ID " + UNSPLASH_API_KEY,
        "Accept-Version": "v1"
      }
    });
    console.log("\u{1F4F8} Unsplash Status:", response.status);
    if (!response.ok) {
      console.log("\u26A0\uFE0F Unsplash rate limit, falling back to Pixabay...");
      return { success: false, error: "Unsplash unavailable", photos: [] };
    }
    const data = await response.json();
    const photos = (data.results || []).map(function(photo) {
      return {
        id: photo.id,
        thumbnail: photo.urls.thumb,
        medium: photo.urls.small,
        full: photo.urls.regular,
        hd: photo.urls.full,
        raw: photo.urls.raw,
        description: photo.description || photo.alt_description || query,
        tags: (photo.tags || []).map(function(t) {
          return t.title;
        }).join(", "),
        likes: photo.likes,
        downloads: photo.downloads || 0,
        user: photo.user?.name || "Unknown",
        userImage: photo.user?.profile_image?.small || "",
        pageUrl: photo.links?.html || "",
        width: photo.width,
        height: photo.height,
        source: "Unsplash"
      };
    });
    return {
      success: true,
      total: data.total || 0,
      totalPages: data.total_pages || 0,
      photos,
      query,
      source: "Unsplash",
      rateLimitRemaining: parseInt(response.headers.get("X-Ratelimit-Remaining") || "50")
    };
  } catch (error) {
    console.log("\u26A0\uFE0F Unsplash error, falling back to Pixabay:", error.message);
    return { success: false, error: error.message, photos: [] };
  }
}
__name(unsplashSearch, "unsplashSearch");
__name2(unsplashSearch, "unsplashSearch");
__name22(unsplashSearch, "unsplashSearch");
async function pixabaySearch(query, options) {
  const config = options || {};
  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: query,
    image_type: "photo",
    per_page: 3,
    page: config.page || 1,
    safesearch: config.safesearch !== false ? "true" : "false",
    order: config.order || "popular",
    orientation: config.orientation || "all"
  });
  if (config.category) {
    params.append("category", config.category);
  }
  if (config.colors) {
    params.append("colors", config.colors);
  }
  try {
    const response = await fetch("https://pixabay.com/api/?" + params.toString());
    if (!response.ok) {
      return { success: false, error: "Pixabay API error: " + response.status, photos: [] };
    }
    const data = await response.json();
    const photos = (data.hits || []).map(function(hit) {
      return {
        id: hit.id,
        thumbnail: hit.previewURL,
        medium: hit.webformatURL,
        full: hit.largeImageURL,
        hd: hit.fullHDURL || hit.largeImageURL,
        tags: hit.tags,
        likes: hit.likes,
        views: hit.views,
        downloads: hit.downloads,
        user: hit.user,
        userImage: hit.userImageURL,
        pageUrl: hit.pageURL,
        width: hit.imageWidth,
        height: hit.imageHeight,
        source: "Pixabay"
      };
    });
    return {
      success: true,
      total: data.total || 0,
      totalHits: data.totalHits || 0,
      photos,
      query,
      source: "Pixabay"
    };
  } catch (error) {
    return { success: false, error: error.message, photos: [] };
  }
}
__name(pixabaySearch, "pixabaySearch");
__name2(pixabaySearch, "pixabaySearch");
__name22(pixabaySearch, "pixabaySearch");
async function unifiedRealPhotoSearch(query, options) {
  const config = options || {};
  const unsplashResult = await unsplashSearch(query, config);
  if (unsplashResult.success && unsplashResult.photos.length > 0) {
    console.log("\u2705 Photos from Unsplash: " + unsplashResult.photos.length + " results");
    return unsplashResult;
  }
  console.log("\u26A0\uFE0F Unsplash failed, trying Pixabay...");
  const pixabayResult = await pixabaySearch(query, config);
  if (pixabayResult.success && pixabayResult.photos.length > 0) {
    console.log("\u2705 Photos from Pixabay: " + pixabayResult.photos.length + " results");
    return pixabayResult;
  }
  return { success: false, error: "No photos found from any source", photos: [], query };
}
__name(unifiedRealPhotoSearch, "unifiedRealPhotoSearch");
__name2(unifiedRealPhotoSearch, "unifiedRealPhotoSearch");
__name22(unifiedRealPhotoSearch, "unifiedRealPhotoSearch");
function formatPhotoGallery(photos, query, total, source) {
  if (!photos || photos.length === 0) {
    return '\u{1F4F8} **No real photos found for:** "' + query + '"\n\n\u{1F4A1} Try different keywords or check spelling.';
  }
  let response = '## \u{1F4F8} Real Photos: "' + query + '"\n';
  response += "\u{1F4F7} **Source:** " + (source || "Unknown") + "\n";
  response += "\u{1F50D} **" + (total || photos.length) + "** results found\n\n";
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    response += "### " + (i + 1) + ". " + (photo.tags ? photo.tags.split(",")[0] : "Photo") + "\n";
    response += "![" + query + "](" + photo.medium + ")\n";
    response += "\u{1F464} " + photo.user + " | \u2764\uFE0F " + (photo.likes || 0) + " likes";
    if (photo.views) {
      response += " | \u{1F441}\uFE0F " + photo.views + " views";
    }
    response += "\n\u{1F4D0} " + photo.width + "\xD7" + photo.height + " pixels\n";
    response += "\u{1F517} [View Full](" + photo.pageUrl + ")";
    if (photo.hd) {
      response += " | [Download HD](" + photo.hd + ")";
    }
    response += "\n\n";
  }
  return response;
}
__name(formatPhotoGallery, "formatPhotoGallery");
__name2(formatPhotoGallery, "formatPhotoGallery");
__name22(formatPhotoGallery, "formatPhotoGallery");
var VOICE_CONFIG = {
  synthesis: {
    voices: {
      hindi: {
        elevenlabs: "EXAVITQu4vr4xnSDxMaL",
        cartesia: "faf0731e-dfb9-4cfc-8119-259a79b27e12"
      },
      english: {
        elevenlabs: "EXAVITQu4vr4xnSDxMaL",
        cartesia: "faf0731e-dfb9-4cfc-8119-259a79b27e12"
      }
    }
  }
};
async function divineVoiceToText(audioBlob, language) {
  const key = getNextKey("groq");
  if (!key) {
    console.log("\u274C No Groq key available");
    return { success: false, error: "Voice recognition service unavailable" };
  }
  try {
    let filename = "audio.webm";
    if (audioBlob.type === "audio/mpeg" || audioBlob.type === "audio/mp3") {
      filename = "audio.mp3";
    } else if (audioBlob.type === "audio/wav") {
      filename = "audio.wav";
    }
    console.log(`\u{1F3A4} Transcribing: language=${language}, type=${audioBlob.type}, size=${audioBlob.size}`);
    const formData = new FormData();
    formData.append("file", audioBlob, filename);
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("language", language === "hi" ? "hi" : "en");
    formData.append("response_format", "json");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2e4);
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key },
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      console.log(`\u2705 Transcription: "${data.text}"`);
      return {
        success: true,
        text: data.text,
        language: language || "en",
        duration: data.duration
      };
    } else {
      const errorText = await response.text();
      console.log(`\u274C Groq failed: ${response.status} - ${errorText}`);
      if (response.status === 429)
        markKeyFailed("groq", key, 60);
      return { success: false, error: `Transcription failed: ${response.status}` };
    }
  } catch (error) {
    console.log("\u274C Transcription error:", error.message);
    return { success: false, error: error.message };
  }
}
__name(divineVoiceToText, "divineVoiceToText");
__name2(divineVoiceToText, "divineVoiceToText");
__name22(divineVoiceToText, "divineVoiceToText");
async function divineTextToVoice(text, language) {
  const isHindi = language === "hi" || /[\u0900-\u097F]/.test(text);
  const cleanText = text.substring(0, 2e3).replace(/[*_#~`>|]/g, "");
  const voiceLang = isHindi ? "hindi" : "english";
  console.log(`\u{1F50A} TTS: ${voiceLang}`);
  const elevenKeys = CONFIG.TTS_KEYS?.elevenlabs || [];
  for (let i = 0; i < elevenKeys.length; i++) {
    const key = elevenKeys[i]?.trim();
    if (!key)
      continue;
    try {
      const voiceId = VOICE_CONFIG.synthesis.voices[voiceLang]?.elevenlabs;
      if (!voiceId)
        continue;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25e3);
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_flash_v2",
          voice_settings: { stability: 0.3, similarity_boost: 0.7 }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (response.ok) {
        const audio = await response.arrayBuffer();
        if (audio.byteLength > 500) {
          console.log("\u2705 ElevenLabs Success!");
          return { success: true, audio, type: "audio/mpeg", provider: "ElevenLabs", voice: isHindi ? "Riya" : "Sarah", quality: "good" };
        }
      } else if (response.status === 429) {
        await new Promise((r) => setTimeout(r, 1e3));
      }
    } catch (e) {
      console.log(`\u26A0\uFE0F ElevenLabs error:`, e.message);
    }
  }
  const cartesiaKeys = CONFIG.TTS_KEYS?.cartesia;
  if (cartesiaKeys?.length) {
    for (let i = 0; i < cartesiaKeys.length; i++) {
      try {
        const currentKey = cartesiaKeys[i]?.trim();
        if (!currentKey)
          continue;
        const voiceId = VOICE_CONFIG.synthesis.voices[voiceLang]?.cartesia;
        if (!voiceId)
          continue;
        const response = await fetch("https://api.cartesia.ai/tts/bytes", {
          method: "POST",
          headers: {
            "X-API-Key": currentKey,
            "Cartesia-Version": "2024-06-10",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model_id: "sonic-3.5",
            transcript: cleanText,
            voice: { mode: "id", id: voiceId },
            output_format: { container: "wav", encoding: "pcm_s16le", sample_rate: 44100 }
          })
        });
        if (response.ok) {
          console.log("\u2705 Cartesia Success!");
          return { success: true, audio: await response.arrayBuffer(), type: "audio/wav", provider: "Cartesia", voice: "Riya", quality: "studio" };
        }
      } catch (e) {
        console.log(`\u26A0\uFE0F Cartesia error:`, e.message);
      }
    }
  }
  const geminiResult = await geminiNativeTTS(cleanText, language);
  if (geminiResult && geminiResult.success) {
    console.log("\u2705 Gemini 3.1 Flash TTS Success!");
    return geminiResult;
  }
  const dgKeys = CONFIG.TTS_KEYS?.deepgram;
  if (dgKeys?.length) {
    for (let i = 0; i < dgKeys.length; i++) {
      try {
        const currentKey = dgKeys[i]?.trim();
        if (!currentKey)
          continue;
        const response = await fetch("https://api.deepgram.com/v1/speak", {
          method: "POST",
          headers: { "Authorization": "Token " + currentKey, "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanText })
        });
        if (response.ok) {
          console.log("\u2705 Deepgram Success!");
          return { success: true, audio: await response.arrayBuffer(), type: "audio/mpeg", provider: "Deepgram", voice: "Auto", quality: "good" };
        }
      } catch (e) {
        console.log(`\u26A0\uFE0F Deepgram error:`, e.message);
      }
    }
  }
  try {
    const langCode = isHindi ? "hi" : "en";
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(cleanText.substring(0, 200))}`;
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > 500) {
        console.log("\u2705 Google TTS Success!");
        return { success: true, audio: buffer, type: "audio/mpeg", provider: "Google TTS", voice: "Default", quality: "good" };
      }
    }
  } catch (e) {
    console.log("\u26A0\uFE0F Google TTS error:", e.message);
  }
  return { success: false, error: "All TTS providers failed" };
}
__name(divineTextToVoice, "divineTextToVoice");
__name2(divineTextToVoice, "divineTextToVoice");
__name22(divineTextToVoice, "divineTextToVoice");
async function handleVoiceChatSupreme(request, env2, userId, sessionId) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const language = formData.get("language") || "en";
    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const transcript = await divineVoiceToText(audioFile, language);
    if (!transcript.success) {
      return new Response(JSON.stringify({ error: transcript.error }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const userPremium = await checkPremium(env2, userId);
    const context = await buildContext(env2, ip, userId, sessionId, transcript.text);
    const aiResult = await quantumResponse(env2, transcript.text, context, {}, {
      isPremium: userPremium,
      userId,
      targetLanguage: language
    });
    await addMessage(env2, ip, userId, sessionId, transcript.text, aiResult.response);
    await updateDailyStat(env2, "messages");
    console.log(`\u{1F50A} TTS Provider Check: Calling divineTextToVoice for response length ${aiResult.response.length}`);
    const voice = await divineTextToVoice(aiResult.response, language);
    console.log(`\u{1F50A} TTS Result: success=${voice.success}, provider=${voice.provider || "none"}, error=${voice.error || "none"}`);
    if (voice.success) {
      return new Response(voice.audio, {
        headers: {
          "Content-Type": voice.type,
          "X-Transcript": encodeURIComponent(transcript.text),
          "X-Response": encodeURIComponent(aiResult.response),
          "X-Provider": voice.provider,
          "X-Voice": voice.voice || "Unknown",
          "X-Quality": voice.quality || "Unknown",
          "Access-Control-Expose-Headers": "X-Transcript, X-Response, X-Provider, X-Voice, X-Quality"
        }
      });
    }
    return new Response(JSON.stringify({
      transcript: transcript.text,
      response: aiResult.response,
      voiceError: voice.error
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(handleVoiceChatSupreme, "handleVoiceChatSupreme");
__name2(handleVoiceChatSupreme, "handleVoiceChatSupreme");
__name22(handleVoiceChatSupreme, "handleVoiceChatSupreme");
async function geminiNativeTTS(text, language) {
  const isHindi = language === "hi" || /[\u0900-\u097F]/.test(text);
  const key = getNextKey("gemini");
  if (!key)
    return null;
  const cleanText = text.substring(0, 2e3).replace(/[*_#~`>|]/g, "");
  const voiceName = "Kore";
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=" + key,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: cleanText }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName }
              }
            }
          }
        })
      }
    );
    if (response.ok) {
      const data = await response.json();
      const audioB64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioB64) {
        const pcmAudio = base64ToArrayBuffer(audioB64);
        const wavAudio = pcmToWav(pcmAudio, 24e3);
        console.log("\u2705 Gemini 3.1 Flash TTS Success!");
        return {
          success: true,
          audio: wavAudio,
          type: "audio/wav",
          provider: "Gemini 3.1 Flash TTS",
          voice: voiceName,
          quality: "ultra"
        };
      }
    }
    if (response.status === 429)
      markKeyFailed("gemini", key, 60);
  } catch (e) {
    console.log("\u26A0\uFE0F Gemini TTS failed:", e.message);
  }
  return null;
}
__name(geminiNativeTTS, "geminiNativeTTS");
__name2(geminiNativeTTS, "geminiNativeTTS");
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}
__name(base64ToArrayBuffer, "base64ToArrayBuffer");
__name2(base64ToArrayBuffer, "base64ToArrayBuffer");
function pcmToWav(pcmData, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.byteLength;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);
  const pcmView = new Uint8Array(pcmData);
  const targetView = new Uint8Array(buffer);
  targetView.set(pcmView, 44);
  return buffer;
}
__name(pcmToWav, "pcmToWav");
__name2(pcmToWav, "pcmToWav");
function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
__name(writeString, "writeString");
__name2(writeString, "writeString");
async function quantumShopping(product, budget) {
  const searchLink = "https://www.amazon.in/s?k=" + encodeURIComponent(product) + "&tag=" + CONFIG.AMAZON_AFFILIATE_ID;
  const searchQuery = "best " + product + " " + (budget ? "under \u20B9" + budget + " " : "") + "india " + CURRENT_YEAR + " reviews buying guide";
  const webResults = await performWebSearch(searchQuery);
  let researchData = "";
  if (webResults && webResults.content) {
    researchData = webResults.content;
  }
  const prompt = "As a WORLD-CLASS shopping expert, recommend the BEST " + product + " options " + (budget ? "under \u20B9" + budget + " " : "") + "on Amazon India (" + CURRENT_YEAR + ").\n\nUse this data: " + researchData + "\n\nFormat:\n## \u{1F6CD}\uFE0F Top Recommendations\n### 1. **[Product Name]** - \u20B9[Price]\n- \u2B50 Rating\n- \u2728 Key Features\n- \u{1F4A1} Why Best\n\n## \u{1F4CA} Comparison Table\n| Product | Price | Rating | Best For |\n|---------|-------|--------|----------|\n\n## \u{1F4B0} Budget Tip\n[Smart buying advice]";
  const result = await quantumAIOrchestrator(prompt, [{ role: "user", content: prompt }], {
    webSearch: false,
    priority: "quality"
  });
  return {
    analysis: result.response,
    searchLink,
    product,
    budget,
    year: CURRENT_YEAR
  };
}
__name(quantumShopping, "quantumShopping");
__name2(quantumShopping, "quantumShopping");
__name22(quantumShopping, "quantumShopping");
async function quantumYoutubeSummary(videoUrl) {
  try {
    const videoId = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
    if (!videoId) {
      return "## \xF0\u0178\u017D\xAC YouTube Video\n\nWatch: " + videoUrl;
    }
    const oembedResponse = await fetch("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + videoId + "&format=json");
    let title = "Video";
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      title = oembedData.title || "Video";
    }
    const searchResult = await performWebSearch("youtube video " + videoId + " summary key points");
    if (searchResult && searchResult.content) {
      return "## \xF0\u0178\u017D\xAC " + title + "\n\n\xF0\u0178\u201C\x9D **Summary:**\n" + searchResult.content + "\n\n\xF0\u0178\u201C\xBA **Watch:** " + videoUrl;
    }
    return "## \xF0\u0178\u017D\xAC " + title + "\n\n\xF0\u0178\u201C\xBA Watch: " + videoUrl;
  } catch (e) {
    return "## \xF0\u0178\u017D\xAC YouTube Video\n\nWatch: " + videoUrl;
  }
}
__name(quantumYoutubeSummary, "quantumYoutubeSummary");
__name2(quantumYoutubeSummary, "quantumYoutubeSummary");
__name22(quantumYoutubeSummary, "quantumYoutubeSummary");
async function generateQRCodeQuantum(text, size) {
  const qrSize = size || 300;
  try {
    const response = await fetch("https://api.qrserver.com/v1/create-qr-code/?size=" + qrSize + "x" + qrSize + "&data=" + encodeURIComponent(text));
    if (response.ok) {
      const blob = await response.blob();
      return { success: true, blob };
    }
  } catch (e) {
  }
  return { success: false };
}
__name(generateQRCodeQuantum, "generateQRCodeQuantum");
__name2(generateQRCodeQuantum, "generateQRCodeQuantum");
__name22(generateQRCodeQuantum, "generateQRCodeQuantum");
async function generateCanvasArtifact(env2, code, language) {
  const canvasId = generateId();
  let html = "";
  if (language === "html" || language === "css" || language === "javascript" || language === "js") {
    html = '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>NEXUS Canvas</title>\n    <style>body{margin:0;padding:20px;font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0}</style>\n</head>\n<body>' + code + "</body>\n</html>";
  } else {
    html = "<pre><code>" + escapeHTML(code) + "</code></pre>";
  }
  await env2.KV.put("canvas:" + canvasId, html, { expirationTtl: 86400 });
  return { canvasId, url: CONFIG.WORKER_URL + "/canvas/" + canvasId, preview: html.substring(0, 500) };
}
__name(generateCanvasArtifact, "generateCanvasArtifact");
__name2(generateCanvasArtifact, "generateCanvasArtifact");
__name22(generateCanvasArtifact, "generateCanvasArtifact");
async function setQuantumReminder(env2, userId, message, minutes) {
  const reminderId = generateId();
  const reminderTime = Date.now() + minutes * 60 * 1e3;
  await env2.KV.put("reminder:" + reminderId, JSON.stringify({
    id: reminderId,
    userId,
    message,
    time: reminderTime,
    createdAt: Date.now()
  }), { expirationTtl: minutes * 60 + 3600 });
  return {
    success: true,
    reminderId,
    at: new Date(reminderTime).toISOString(),
    message,
    inMinutes: minutes
  };
}
__name(setQuantumReminder, "setQuantumReminder");
__name2(setQuantumReminder, "setQuantumReminder");
async function checkReminders(env2) {
  const now = Date.now();
  const list = await env2.KV.list({ prefix: "reminder:" });
  for (const key of list.keys) {
    const reminder = await env2.KV.get(key.name, { type: "json" });
    if (reminder && reminder.time <= now) {
      await env2.KV.put(`pending_notification:${reminder.userId}`, reminder.message);
      await env2.KV.delete(key.name);
      console.log(`\u2705 Reminder triggered for user: ${reminder.userId}`);
    }
  }
}
__name(checkReminders, "checkReminders");
__name2(checkReminders, "checkReminders");
function parseChatGPTTime(timeText) {
  const now = Date.now();
  const inMatch = timeText.match(/(?:in|after)\s+(\d+)\s*(min|minute|hour|day|sec)/i);
  if (inMatch) {
    const value = parseInt(inMatch[1]);
    const unit = inMatch[2].toLowerCase();
    if (unit.startsWith("hour"))
      return now + value * 60 * 60 * 1e3;
    if (unit.startsWith("day"))
      return now + value * 24 * 60 * 60 * 1e3;
    if (unit.startsWith("sec"))
      return now + value * 1e3;
    return now + value * 60 * 1e3;
  }
  const atMatch = timeText.match(/(\d{1,2})(?=(?::\d{2})|(?:\s*(?:am|pm)))(?::(\d{2}))?\s*(am|pm)?/i);
  if (atMatch) {
    const date = /* @__PURE__ */ new Date();
    let hour = parseInt(atMatch[1]);
    const minute = atMatch[2] ? parseInt(atMatch[2]) : 0;
    const ampm = atMatch[3];
    if (ampm === "pm" && hour !== 12)
      hour += 12;
    if (ampm === "am" && hour === 12)
      hour = 0;
    date.setHours(hour, minute, 0, 0);
    if (timeText.toLowerCase().includes("tomorrow"))
      date.setDate(date.getDate() + 1);
    else if (date <= /* @__PURE__ */ new Date())
      date.setDate(date.getDate() + 1);
    return date.getTime();
  }
  const simpleMatch = timeText.match(/(\d+)\s*(min|minute|hour|day)/i);
  if (simpleMatch) {
    const value = parseInt(simpleMatch[1]);
    const unit = simpleMatch[2].toLowerCase();
    if (unit.startsWith("hour"))
      return now + value * 60 * 60 * 1e3;
    if (unit.startsWith("day"))
      return now + value * 24 * 60 * 60 * 1e3;
    return now + value * 60 * 1e3;
  }
  return now + 5 * 60 * 1e3;
}
__name(parseChatGPTTime, "parseChatGPTTime");
__name2(parseChatGPTTime, "parseChatGPTTime");
function parseChatGPTTimeToMinutes(timeText) {
  const futureTime = parseChatGPTTime(timeText);
  return Math.ceil((futureTime - Date.now()) / (60 * 1e3));
}
__name(parseChatGPTTimeToMinutes, "parseChatGPTTimeToMinutes");
__name2(parseChatGPTTimeToMinutes, "parseChatGPTTimeToMinutes");
function getPremiumReminderLimit(plan) {
  const limits = { free: 3, plus: 10, pro: 50, enterprise: 1e3 };
  return limits[plan] || 3;
}
__name(getPremiumReminderLimit, "getPremiumReminderLimit");
__name2(getPremiumReminderLimit, "getPremiumReminderLimit");
async function checkPremiumReminderLimit(env2, userId) {
  if (isAdmin(userId)) {
    return { allowed: true, limit: Infinity, used: 0, remaining: Infinity, plan: "enterprise" };
  }
  const user = await getUser(env2, userId);
  const plan = user.plan || "free";
  const limit = getPremiumReminderLimit(plan);
  const currentMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  let usage = await env2.DB.prepare("SELECT count FROM premium_reminder_usage WHERE user_id = ? AND usage_month = ?").bind(userId, currentMonth).first();
  const used = usage?.count || 0;
  return { allowed: used < limit, limit, used, remaining: limit - used, plan };
}
__name(checkPremiumReminderLimit, "checkPremiumReminderLimit");
__name2(checkPremiumReminderLimit, "checkPremiumReminderLimit");
async function incrementPremiumReminderUsage(env2, userId) {
  if (isAdmin(userId))
    return;
  const currentMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  await env2.DB.prepare(`INSERT INTO premium_reminder_usage (id, user_id, usage_month, count) VALUES (?, ?, ?, 1) ON CONFLICT(user_id, usage_month) DO UPDATE SET count = count + 1`).bind(generateId(), userId, currentMonth).run();
}
__name(incrementPremiumReminderUsage, "incrementPremiumReminderUsage");
__name2(incrementPremiumReminderUsage, "incrementPremiumReminderUsage");
async function setPremiumReminder(env2, userId, message, timeText) {
  const limitCheck = await checkPremiumReminderLimit(env2, userId);
  if (!limitCheck.allowed) {
    return { success: false, error: `Monthly limit reached (${limitCheck.limit}/${limitCheck.limit}). Upgrade to premium!`, limitReached: true };
  }
  const scheduleTime = parseChatGPTTime(timeText);
  const id = generateId();
  await env2.DB.prepare(`INSERT INTO premium_reminders (id, user_id, message, reminder_type, schedule_time, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(id, userId, message, "one-time", scheduleTime, "active", Date.now()).run();
  await incrementPremiumReminderUsage(env2, userId);
  return { success: true, reminderId: id, message, triggerTime: new Date(scheduleTime).toLocaleString(), system: "premium_primary" };
}
__name(setPremiumReminder, "setPremiumReminder");
__name2(setPremiumReminder, "setPremiumReminder");
async function setChatGPTReminder(env2, userId, message, timeText) {
  const user = await getUser(env2, userId);
  const plan = user.plan || "free";
  if (plan !== "free") {
    const premiumResult = await setPremiumReminder(env2, userId, message, timeText);
    if (premiumResult.success)
      return premiumResult;
  }
  const minutes = parseChatGPTTimeToMinutes(timeText);
  const kvResult = await setQuantumReminder(env2, userId, message, minutes);
  return { ...kvResult, system: "kv_fallback", note: "Upgrade to premium for more reminders!" };
}
__name(setChatGPTReminder, "setChatGPTReminder");
__name2(setChatGPTReminder, "setChatGPTReminder");
__name22(setQuantumReminder, "setQuantumReminder");
var PREMIUM_TIERS_2026 = {
  free: {
    name: "Free Tier",
    price: 0,
    messages: 50,
    images: 10,
    vision: 5,
    voice: 5,
    search: 20,
    fileAnalysis: 3,
    contextWindows: {
      gemini: 32e3,
      groq: 16e3,
      mimo: 16e3,
      cerebras: 8e3,
      sambanova: 16e3,
      glm: 8e3
    },
    availableModels: ["gemini", "groq", "mimo", "cerebras", "sambanova", "glm"],
    history: "24 hours",
    support: "community"
  },
  plus: {
    name: "NEXUS Plus",
    price: 299,
    messages: 500,
    images: 100,
    vision: 50,
    voice: 50,
    search: 200,
    fileAnalysis: 30,
    contextWindows: {
      gemini: 1e5,
      groq: 65536,
      mimo: 35e3,
      cerebras: 32e3,
      sambanova: 65536,
      glm: 32e3
    },
    availableModels: ["gemini", "groq", "mimo", "cerebras", "sambanova", "glm"],
    history: "30 days",
    support: "priority"
  },
  pro: {
    name: "NEXUS Pro",
    price: 1499,
    messages: 2e3,
    images: 500,
    vision: 200,
    voice: 200,
    search: 1e3,
    fileAnalysis: 100,
    contextWindows: {
      gemini: 5e5,
      groq: 1e5,
      mimo: 65e3,
      cerebras: 65536,
      sambanova: 1e5,
      glm: 64e3
    },
    availableModels: ["gemini", "groq", "mimo", "cerebras", "sambanova", "glm"],
    history: "90 days",
    support: "priority-24x7"
  },
  enterprise: {
    name: "NEXUS Enterprise",
    price: 2999,
    messages: Infinity,
    images: Infinity,
    vision: Infinity,
    voice: Infinity,
    search: Infinity,
    fileAnalysis: Infinity,
    contextWindows: {
      gemini: 1e6,
      groq: 131072,
      mimo: 1e5,
      cerebras: 131072,
      sambanova: 128e3,
      glm: 64e3
    },
    availableModels: ["gemini", "groq", "mimo", "cerebras", "sambanova", "glm"],
    history: "unlimited",
    support: "dedicated-24x7"
  }
};
async function checkUsageLimit2026(env2, userId, type) {
  if (isAdmin(userId)) {
    return { allowed: true, remaining: Infinity, tier: "enterprise" };
  }
  const user = await getUser(env2, userId);
  const tierName = user.plan || "free";
  const tier = PREMIUM_TIERS_2026[tierName] || PREMIUM_TIERS_2026.free;
  const limit = tier[type] || 5;
  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity, tier: tierName };
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const usageKey = "usage2026:" + userId + ":" + type + ":" + today;
  let currentUsage = await env2.KV.get(usageKey);
  currentUsage = currentUsage ? parseInt(currentUsage) : 0;
  if (currentUsage >= limit) {
    const nextTier = tierName === "free" ? "NEXUS Plus (\u20B9299/yr)" : tierName === "plus" ? "NEXUS Pro (\u20B91499/yr)" : "NEXUS Enterprise (\u20B92999/yr)";
    return {
      allowed: false,
      remaining: 0,
      limit,
      tier: tierName,
      resetAt: new Date(Date.now() + 864e5).toISOString(),
      upgradeMessage: "\u{1F6AB} Daily " + type + " limit reached (" + limit + "/day). Upgrade to " + nextTier + "!"
    };
  }
  await env2.KV.put(usageKey, String(currentUsage + 1), { expirationTtl: 86400 });
  return {
    allowed: true,
    remaining: limit - currentUsage - 1,
    limit,
    tier: tierName,
    used: currentUsage + 1
  };
}
__name(checkUsageLimit2026, "checkUsageLimit2026");
__name2(checkUsageLimit2026, "checkUsageLimit2026");
__name22(checkUsageLimit2026, "checkUsageLimit2026");
async function premiumRequest2026(env2, userId, transactionId, plan, upiId) {
  if (!["plus", "pro", "enterprise"].includes(plan)) {
    return { success: false, error: "Invalid plan. Choose: plus, pro, or enterprise." };
  }
  const existing = await env2.DB.prepare("SELECT * FROM premium_requests WHERE transaction_id = ?").bind(transactionId).first();
  if (existing) {
    return { success: false, error: "Transaction ID already submitted" };
  }
  const planDetails = PREMIUM_TIERS_2026[plan];
  await env2.DB.prepare("INSERT INTO premium_requests (id, user_id, transaction_id, plan, upi_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(generateId(), userId, transactionId, plan, upiId || CONFIG.UPI_ID, "pending", Date.now()).run();
  await updateDailyStat(env2, "premium_requests");
  await sendPremiumAlert2026(env2, userId, transactionId, plan, planDetails.price, upiId);
  return {
    success: true,
    message: "\u2705 " + planDetails.name + " request submitted! \u20B9" + planDetails.price + "/yr",
    plan: planDetails,
    status: "pending"
  };
}
__name(premiumRequest2026, "premiumRequest2026");
__name2(premiumRequest2026, "premiumRequest2026");
__name22(premiumRequest2026, "premiumRequest2026");
async function verifyPremium2026(env2, userId, transactionId, plan) {
  const request = await env2.DB.prepare("SELECT * FROM premium_requests WHERE user_id = ? AND transaction_id = ? AND status = ?").bind(userId, transactionId, "pending").first();
  if (!request) {
    return { success: false, error: "No pending request found" };
  }
  const planDetails = PREMIUM_TIERS_2026[plan];
  const expiryDate = Date.now() + 365 * 864e5;
  await updateUser(env2, userId, { isPremium: true, plan, premiumExpiry: expiryDate, tier: planDetails });
  await env2.DB.prepare("UPDATE premium_requests SET status = ?, verified_at = ? WHERE user_id = ? AND transaction_id = ?").bind("verified", Date.now(), userId, transactionId).run();
  await env2.DB.prepare("INSERT INTO payments (id, transaction_id, user_id, amount, plan, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(generateId(), transactionId, userId, planDetails.price, plan, "verified", Date.now()).run();
  await updateDailyStat(env2, "premium_activations");
  return {
    success: true,
    message: "\u{1F389} " + planDetails.name + " activated! Welcome to NEXUS Premium!",
    plan: planDetails.name,
    expiresAt: new Date(expiryDate).toISOString(),
    features: planDetails
  };
}
__name(verifyPremium2026, "verifyPremium2026");
__name2(verifyPremium2026, "verifyPremium2026");
__name22(verifyPremium2026, "verifyPremium2026");
async function metaThinking2026(env2, userMessage, sessionContext, hasLastImage, lastImageDesc, isPremium, userId) {
  if (!CONFIG.THINKING_MODE) {
    return { action: "general_chat", prompt: userMessage, reasoning: "Thinking disabled", confidence: 0.5 };
  }
  const prompt = `Analyze and decide action. Return ONLY JSON:
{"action":"image_generation/real_photo/improve_image/edit_image/web_search/shopping/youtube/code_help/voice_interaction/file_analysis/general_chat","prompt":"enhanced query","reasoning":"brief","confidence":0.0-1.0}

USER: "${userMessage}"
CONTEXT: ${sessionContext?.substring(0, 300) || "New"}
${hasLastImage ? 'LAST IMAGE: "' + (lastImageDesc || "") + '"\n' : ""}
PLAN: ${isPremium ? "Premium" : "Free"}
TODAY: ${TODAY}`;
  const messages = [{ role: "user", content: prompt }];
  const aiResult = await callGeminiOrGroq(prompt, messages, {
    temperature: 0.1,
    maxTokens: 250,
    useWebSearch: true,
    timeout: 5e3,
    functionName: "metaThinking"
  });
  if (aiResult.success && aiResult.result) {
    const jsonMatch = aiResult.result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const decision = JSON.parse(jsonMatch[0]);
        return {
          action: decision.action || "general_chat",
          prompt: decision.prompt || userMessage,
          reasoning: decision.reasoning || "Complete",
          confidence: decision.confidence || 0.7
        };
      } catch (e) {
      }
    }
  }
  return { action: "general_chat", prompt: userMessage, reasoning: "Fallback", confidence: 0.3 };
}
__name(metaThinking2026, "metaThinking2026");
__name2(metaThinking2026, "metaThinking2026");
__name22(metaThinking2026, "metaThinking2026");
async function sendPremiumAlert2026(env2, userId, transactionId, plan, price, upiId) {
  if (!CONFIG.SLACK_WEBHOOK_URL)
    return;
  const planEmojis = { plus: "\u2B50", pro: "\u{1F451}", enterprise: "\u{1F3F0}" };
  await fetch(CONFIG.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: (planEmojis[plan] || "\u{1F4B3}") + " NEW " + plan.toUpperCase() + " REQUEST", emoji: true }
        },
        { type: "divider" },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*\u{1F464} User:*\n`" + userId + "`" },
            { type: "mrkdwn", text: "*\u{1F4B3} Plan:*\n" + plan.toUpperCase() + " - \u20B9" + price + "/yr" },
            { type: "mrkdwn", text: "*\u{1F194} Transaction:*\n`" + transactionId + "`" },
            { type: "mrkdwn", text: "*\u{1F3E6} UPI:*\n" + (upiId || CONFIG.UPI_ID) },
            { type: "mrkdwn", text: "*\u23F0 Time:*\n" + (/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
            { type: "mrkdwn", text: "*\u{1F4C5} Date:*\n" + TODAY }
          ]
        },
        { type: "divider" },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "\u2705 Approve", emoji: true },
              style: "primary",
              value: JSON.stringify({ action: "approve", userId, transactionId, plan }),
              action_id: "approve_premium_2026"
            },
            {
              type: "button",
              text: { type: "plain_text", text: "\u274C Reject", emoji: true },
              style: "danger",
              value: JSON.stringify({ action: "reject", userId, transactionId, plan }),
              action_id: "reject_premium_2026"
            }
          ]
        }
      ]
    })
  });
}
__name(sendPremiumAlert2026, "sendPremiumAlert2026");
__name2(sendPremiumAlert2026, "sendPremiumAlert2026");
__name22(sendPremiumAlert2026, "sendPremiumAlert2026");
async function sendDailyStats2026(env2) {
  if (!env2?.DB || !CONFIG.SLACK_WEBHOOK_URL)
    return;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const stats = await env2.DB.prepare("SELECT * FROM daily_stats WHERE date = ?").bind(today).first();
  const weekStart = new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0];
  const weekStats = await env2.DB.prepare("SELECT SUM(messages) as msgs, SUM(images) as imgs, SUM(premium_activations) as activations FROM daily_stats WHERE date >= ?").bind(weekStart).first();
  await fetch(CONFIG.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blocks: [
        { type: "header", text: { type: "plain_text", text: "\u{1F4CA} NEXUS MONSTER DAILY REPORT", emoji: true } },
        { type: "section", text: { type: "mrkdwn", text: "\u{1F4C5} *" + (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + "*" } },
        { type: "divider" },
        { type: "section", fields: [
          { type: "mrkdwn", text: "\u{1F4AC} *Messages:*\n" + (stats?.messages || 0) },
          { type: "mrkdwn", text: "\u{1F5BC}\uFE0F *Images:*\n" + (stats?.images || 0) },
          { type: "mrkdwn", text: "\u{1F514} *Requests:*\n" + (stats?.premium_requests || 0) },
          { type: "mrkdwn", text: "\u2705 *Activations:*\n" + (stats?.premium_activations || 0) }
        ] },
        { type: "divider" },
        { type: "section", fields: [
          { type: "mrkdwn", text: "\u{1F4C8} *Week Msgs:*\n" + (weekStats?.msgs || 0) },
          { type: "mrkdwn", text: "\u{1F4B0} *Week Revenue:*\n\u20B9" + (weekStats?.activations || 0) * 299 }
        ] },
        { type: "context", elements: [{ type: "mrkdwn", text: "\u{1F916} NEXUS v8.0 MONSTER | " + CURRENT_YEAR + " | By Akhil Jaiswal" }] }
      ]
    })
  });
}
__name(sendDailyStats2026, "sendDailyStats2026");
__name2(sendDailyStats2026, "sendDailyStats2026");
__name22(sendDailyStats2026, "sendDailyStats2026");
async function handleSlackCommandCenter2026(request, env2) {
  try {
    const body = await request.text();
    const timestamp = request.headers.get("X-Slack-Request-Timestamp");
    const signature = request.headers.get("X-Slack-Signature");
    if (!timestamp || !signature)
      return new Response("Missing headers", { status: 401 });
    if (Math.abs(Date.now() / 1e3 - parseInt(timestamp)) > 300)
      return new Response("Request too old", { status: 401 });
    const sigBasestring = "v0:" + timestamp + ":" + body;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(CONFIG.SLACK_SIGNING_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(sigBasestring));
    const expected = "v0=" + Array.from(new Uint8Array(sigBytes)).map(function(b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
    if (expected !== signature)
      return new Response("Invalid signature", { status: 401 });
    const payload = JSON.parse(new URLSearchParams(body).get("payload"));
    if (payload?.type === "block_actions") {
      const actionData = JSON.parse(payload.actions[0].value);
      const { action, userId, transactionId, plan } = actionData;
      if (action === "approve") {
        const result = await verifyPremium2026(env2, userId, transactionId, plan);
        await fetch(payload.response_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            replace_original: true,
            blocks: [
              { type: "header", text: { type: "plain_text", text: result.success ? "\u2705 APPROVED" : "\u274C FAILED", emoji: true } },
              { type: "section", text: { type: "mrkdwn", text: result.success ? "*User:* " + userId + "\n*Plan:* " + plan.toUpperCase() + "\n*Expires:* " + result.expiresAt : "*Error:* " + result.error } }
            ]
          })
        });
      } else if (action === "reject") {
        await env2.DB.prepare("UPDATE premium_requests SET status = ? WHERE user_id = ? AND transaction_id = ?").bind("rejected", userId, transactionId).run();
        await fetch(payload.response_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            replace_original: true,
            blocks: [
              { type: "header", text: { type: "plain_text", text: "\u274C REJECTED", emoji: true } },
              { type: "section", text: { type: "mrkdwn", text: "*User:* " + userId + "\n*Transaction:* " + transactionId } }
            ]
          })
        });
      }
    }
    return new Response("", { status: 200 });
  } catch (e) {
    return new Response("", { status: 200 });
  }
}
__name(handleSlackCommandCenter2026, "handleSlackCommandCenter2026");
__name2(handleSlackCommandCenter2026, "handleSlackCommandCenter2026");
__name22(handleSlackCommandCenter2026, "handleSlackCommandCenter2026");
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-User-ID, X-Session-ID, X-Stream-Mode, X-Target-Language",
  "Access-Control-Expose-Headers": "X-Transcript, X-Response-Text, X-TTS-Provider, X-Provider, X-Image-Id, X-Latency, X-Source, X-Voice, X-Quality",
  "Access-Control-Max-Age": "86400"
};
async function checkRateLimit(env2, ip, userId) {
  const now = Date.now();
  const window = 6e4;
  const ipKey = "rl:ip:" + ip;
  const userKey = "rl:user:" + userId;
  let ipData = await env2.KV.get(ipKey, { type: "json" }) || { count: 0, reset: now + window };
  let userData = await env2.KV.get(userKey, { type: "json" }) || { count: 0, reset: now + window };
  if (now > ipData.reset)
    ipData = { count: 0, reset: now + window };
  if (now > userData.reset)
    userData = { count: 0, reset: now + window };
  if (ipData.count >= CONFIG.RATE_LIMIT_IP)
    return { allowed: false, retryAfter: Math.ceil((ipData.reset - now) / 1e3) };
  if (userId !== "anonymous" && userData.count >= CONFIG.RATE_LIMIT_USER)
    return { allowed: false, retryAfter: Math.ceil((userData.reset - now) / 1e3) };
  ipData.count++;
  if (userId !== "anonymous")
    userData.count++;
  await Promise.all([env2.KV.put(ipKey, JSON.stringify(ipData), { expirationTtl: 60 }), env2.KV.put(userKey, JSON.stringify(userData), { expirationTtl: 60 })]);
  return { allowed: true };
}
__name(checkRateLimit, "checkRateLimit");
__name2(checkRateLimit, "checkRateLimit");
__name22(checkRateLimit, "checkRateLimit");
async function handleAction(env2, request, auth, action, body, params, ctx) {
  if (action === "voice") {
    return await handleVoiceChatSupreme(request, env2, auth.userId, params.sessionId || generateId());
  }
  switch (action) {
    case "chat":
      return await handleChatAction(env2, request, auth, body, params, ctx);
    case "image_generate":
      return await handleImageGenerateAction(env2, auth, body);
    case "real_photo":
      return await handleRealPhotoAction(env2, auth, body, params);
    case "image_edit":
      return await handleImageEditAction(env2, auth, body);
    case "image_enhance":
      return await handleImageEnhanceAction(env2, auth, body);
    case "shopping":
      return await handleShoppingAction(env2, auth, body);
    case "youtube":
      return await handleYoutubeAction(body);
    case "code_help":
      return await handleCodeHelpAction(env2, auth, body);
    case "file_analysis":
      return await handleFileAnalysisAction(env2, auth, body);
    case "qr_generate":
      return await handleQRAction(body);
    case "reminder":
      const { message, timeText } = body;
      if (!message || !timeText) {
        return new Response(JSON.stringify({ error: "message and timeText required" }), { status: 400 });
      }
      const reminderResult = await setChatGPTReminder(env2, auth.userId, message, timeText);
      return new Response(JSON.stringify(reminderResult), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    case "canvas":
      return await handleCanvasAction(env2, body);
    case "translate":
      return await handleTranslateAction(body);
    case "premium_status":
      return await handlePremiumStatusAction(env2, auth);
    case "premium_request":
      return await handlePremiumRequestAction(env2, auth, body);
    case "premium_verify":
      return await handlePremiumVerifyAction(env2, auth, body);
    case "pr_review":
      const { code: reviewCode, language: codeLang, filename, author } = body;
      if (!reviewCode) {
        return new Response(JSON.stringify({ error: "code required" }), { status: 400 });
      }
      const prReview = await enhancedCodeReview(reviewCode, codeLang, filename, author);
      return new Response(JSON.stringify(prReview), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    case "debug":
      const { error_log, code_context, stack_trace } = body;
      if (!error_log) {
        return new Response(JSON.stringify({ error: "error_log required" }), { status: 400 });
      }
      const debugResult = await debugError(error_log, code_context, stack_trace);
      return new Response(JSON.stringify({ success: true, analysis: debugResult }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    case "premium_plans":
      return await handlePremiumPlansAction();
    case "conversations_list":
      return await handleConversationsListAction(env2, auth);
    case "conversations_save":
      return await handleConversationsSaveAction(env2, auth, body);
    case "conversations_delete":
      return await handleConversationsDeleteAction(env2, auth, params);
    case "conversations_search":
      return await handleConversationsSearchAction(env2, auth, params);
    case "message_edit":
      return await handleMessageEditAction(env2, auth, body);
    case "regenerate_response":
      return await handleRegenerateAction(env2, auth, body);
    case "message_feedback":
      return await handleMessageFeedbackAction(env2, auth, body);
    case "user_profile":
      return await handleUserProfileAction(env2, auth);
    case "agents_list":
      return await handleAgentsListAction(env2, auth);
    case "image_gallery":
      return await handleImageGalleryAction(env2, auth);
    case "health":
      return await handleHealthAction();
    case "clear_session":
      return await handleClearSessionAction(env2, auth, params);
    case "set_custom_instructions": {
      const instructions = String(body.instructions || "").substring(0, 2e3);
      await updateUser(env2, auth.userId, { customInstructions: instructions });
      return new Response(JSON.stringify({ success: true, customInstructions: instructions }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
    case "get_custom_instructions": {
      const userForInstructions = await getUser(env2, auth.userId);
      return new Response(JSON.stringify({ success: true, customInstructions: userForInstructions.customInstructions || "" }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
    case "generate_pdf": {
      console.log(`\u{1F535} generate_pdf: User ${auth.userId}, docType=${body.docType}`);
      const pdfLimitCheck = await checkPdfLimit(env2, auth.userId);
      if (!pdfLimitCheck.allowed) {
        return new Response(JSON.stringify({
          error: `Daily PDF generation limit reached (${pdfLimitCheck.used}/${pdfLimitCheck.limit}). Upgrade your plan for more.`,
          limitReached: true,
          plan: pdfLimitCheck.plan,
          limit: pdfLimitCheck.limit,
          used: pdfLimitCheck.used
        }), {
          status: 429,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
      const docType = body.docType || "document";
      const topic = body.topic || body.title || "Untitled";
      let pdfTitle = body.title || topic;
      let pdfBody;
      if (docType === "quiz" || docType === "puzzle") {
        pdfBody = await generateQuizOrPuzzleContent(env2, topic, docType, body.count || 10);
        if (!pdfBody) {
          return new Response(JSON.stringify({ error: "Could not generate content, please try again" }), {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          });
        }
      } else {
        pdfBody = body.content || "";
        if (!pdfBody) {
          return new Response(JSON.stringify({ error: "content is required for docType 'document'" }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          });
        }
      }
      let pdfBase64;
      let usedUnicodeRenderer = false;
      const unicodeResult = await generateUnicodePDFViaBrowser(env2, pdfTitle, pdfBody);
      if (unicodeResult) {
        pdfBase64 = unicodeResult;
        usedUnicodeRenderer = true;
      } else {
        try {
          const pdfStr = generateSimplePDF(pdfTitle, pdfBody);
          pdfBase64 = pdfToBase64(pdfStr);
        } catch (e) {
          console.error("PDF generation failed:", e.message);
          return new Response(JSON.stringify({ error: "PDF generation failed: " + e.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          });
        }
      }
      let safeFileName = (pdfTitle || "document").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").substring(0, 50);
      if (!safeFileName) safeFileName = "document";
      await incrementPdfUsage(env2, auth.userId);
      trackEvent(env2, "pdf_generated", { userId: auth.userId, plan: pdfLimitCheck.plan, status: "ok" });
      return new Response(JSON.stringify({
        success: true,
        fileName: safeFileName + ".pdf",
        mimeType: "application/pdf",
        base64: pdfBase64,
        dataUrl: "data:application/pdf;base64," + pdfBase64,
        content: pdfBody,
        unicodeSupport: usedUnicodeRenderer,
        note: usedUnicodeRenderer ? "Rendered via Browser Run (full language support)" : "Rendered via basic PDF (English/Latin script only). Enable Browser Run binding for full Hindi/Devanagari support.",
        usage: { used: pdfLimitCheck.used + 1, limit: pdfLimitCheck.limit, plan: pdfLimitCheck.plan }
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
    case "integration_status":
      console.log(`\u{1F535} integration_status: User ${auth.userId}`);
      const integrations = await listIntegrations(env2, auth.userId);
      return new Response(JSON.stringify({
        success: true,
        integrations,
        availableApps: ["figma", "telegram", "discord", "canva", "wolfram", "zapier", ...GENERIC_OAUTH_PROVIDERS]
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    case "integration_connect":
      console.log(`\u{1F535} integration_connect: User ${auth.userId}, app ${body.app}`);
      const { app, token } = body;
      if (!app) {
        return new Response(JSON.stringify({ error: "app required" }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
      if (token) {
        await storeIntegration(env2, auth.userId, app, { access_token: token });
        return new Response(JSON.stringify({
          success: true,
          message: `${app} connected with token`
        }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
      const oauthState = generatenewId();
      await env2.KV.put("oauth_state:" + oauthState, app, { expirationTtl: 300 });
      const oauthConfig = OAUTH_CONFIG[app];
      if (!oauthConfig) {
        return new Response(JSON.stringify({ error: `${app} not supported` }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
      let pkceExtra = "";
      if (oauthConfig.pkce) {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        await env2.KV.put("oauth_code_verifier:" + oauthState, codeVerifier, { expirationTtl: 300 });
        pkceExtra = `&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      }
      const oauthUrl = `${oauthConfig.authUrl}?client_id=${oauthConfig.clientId}&redirect_uri=${encodeURIComponent(oauthConfig.redirectUri)}&response_type=code&scope=${encodeURIComponent(oauthConfig.scopes || "")}&state=${oauthState}${pkceExtra}`;
      return new Response(JSON.stringify({
        success: true,
        oauthUrl,
        message: `Redirect to OAuth for ${app}`
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    case "integration_disconnect":
      console.log(`\u{1F535} integration_disconnect: User ${auth.userId} disconnecting app ${body.app}`);
      const { app: disconnectApp } = body;
      if (!disconnectApp) {
        return new Response(JSON.stringify({
          success: false,
          error: "app required"
        }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
      const deleteResult = await deleteIntegration(env2, auth.userId, disconnectApp);
      return new Response(JSON.stringify(deleteResult), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    case "execute_plugin":
      console.log(`\u{1F535} execute_plugin: User ${auth.userId} executing plugin ${body.app}`);
      const pluginResult = await executePluginNew(env2, auth, body);
      return new Response(JSON.stringify(pluginResult), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    default:
      return new Response(JSON.stringify({
        error: "Unknown action",
        availableActions: [
          "chat",
          "voice",
          "image_generate",
          "real_photo",
          "image_edit",
          "image_enhance",
          "shopping",
          "youtube",
          "code_help",
          "file_analysis",
          "qr_generate",
          "reminder",
          "canvas",
          "translate",
          "premium_status",
          "premium_request",
          "premium_verify",
          "premium_plans",
          "conversations_list",
          "conversations_save",
          "conversations_delete",
          "conversations_search",
          "user_profile",
          "agents_list",
          "image_gallery",
          "health",
          "clear_session",
          "integration_status",
          "integration_connect",
          "integration_disconnect",
          "execute_plugin"
        ]
      }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
}
__name(handleAction, "handleAction");
__name2(handleAction, "handleAction");
__name22(handleAction, "handleAction");
async function handleChatAction(env2, request, auth, body, params, ctx) {
  const startTime = Date.now();
  let message = body.message;
  let image = body.image;
  const streamMode = request.headers.get("X-Stream-Mode") || params.streamMode || "normal";
  const targetLanguage = request.headers.get("X-Target-Language") || body.targetLanguage || "en";
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const sessionId = params.sessionId || generateId();
  const contentType = request.headers.get("Content-Type") || "";
  if (contentType.includes("multipart/form-data") && body.action === "chat") {
    const formData = await request.formData();
    message = formData.get("message") || message;
    const uploadedImage = formData.get("image");
    if (uploadedImage && typeof uploadedImage === "object" && uploadedImage.arrayBuffer) {
      const buffer = await uploadedImage.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      image = btoa(binary);
    }
  }
  if (body.reminderMessage && body.reminderMinutes) {
    const result = await setQuantumReminder(env2, auth.userId, body.reminderMessage, body.reminderMinutes);
    return new Response(JSON.stringify(result), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  if (body.videoUrl) {
    const summary = await quantumYoutubeSummary(body.videoUrl);
    await addMessage(env2, ip, auth.userId, sessionId, "YouTube: " + body.videoUrl, summary);
    await updateDailyStat(env2, "messages");
    return new Response(JSON.stringify({ response: summary }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  if (body.shoppingProduct) {
    const result = await quantumShopping(body.shoppingProduct, body.shoppingBudget);
    const response2 = result.analysis + "\n\n\u{1F517} [View on Amazon](" + result.searchLink + ")";
    await addMessage(env2, ip, auth.userId, sessionId, "Shopping: " + body.shoppingProduct, response2);
    await updateDailyStat(env2, "messages");
    return new Response(JSON.stringify({ response: response2, shoppingLink: result.searchLink }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  if (image && body.transformInstruction) {
    const result = await quantumImageTransform(env2, image, body.transformInstruction);
    if (result.success) {
      await addMessage(env2, ip, auth.userId, sessionId, message || "Image transform", "Image transformed", true, result.url);
      await updateDailyStat(env2, "images");
      return new Response(result.blob, { headers: { "Content-Type": "image/png", "X-Provider": result.provider, "X-Image-Id": result.imageId, ...CORS_HEADERS } });
    }
  }
  const usageCheck = await checkUsageLimit2026(env2, auth.userId, "messages");
  if (!usageCheck.allowed)
    return new Response(JSON.stringify({ error: usageCheck.upgradeMessage }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  if (!message && !image)
    return new Response(JSON.stringify({ error: "Message or image is required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  if (streamMode === "typing" || streamMode === "burst" || streamMode === "word" || streamMode === "quantum") {
    const context = await buildContext(env2, ip, auth.userId, sessionId, message);
    const { stream, processPromise } = await ultimateChatHandler(env2, message, context, auth.userId, sessionId, ip, streamMode);
    ctx.waitUntil(processPromise);
    return new Response(stream, { headers: { ...CORS_HEADERS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Stream-Mode": streamMode } });
  }
  const sessionContext = await buildContext(env2, ip, auth.userId, sessionId, message);
  const session = await getSession(env2, ip, auth.userId, sessionId);
  const thinking = await metaThinking2026(env2, message, sessionContext, !!session.lastImage, session.lastImageDesc, auth.isPremium, auth.userId);
  if (thinking.action === "real_photo") {
    const searchResult = await unifiedRealPhotoSearch(thinking.prompt || message);
    if (searchResult.success && searchResult.photos.length > 0) {
      const response2 = formatPhotoGallery(searchResult.photos, message, searchResult.total, searchResult.source);
      await addMessage(env2, ip, auth.userId, sessionId, message, response2, true);
      await updateDailyStat(env2, "images");
      return new Response(JSON.stringify({ response: response2, photos: searchResult.photos.slice(0, 5), total: searchResult.total, source: searchResult.source }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }
  if (thinking.action === "image_generation") {
    const imageCheck = await checkUsageLimit2026(env2, auth.userId, "images");
    if (!imageCheck.allowed) {
      return new Response(JSON.stringify({ error: imageCheck.upgradeMessage }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
    const imageResult = await pureAIImageGenerator(env2, thinking.prompt || message);
    if (imageResult.success) {
      const aiResponseMessage = await callGeminiOrGroq(
        `User requested image: "${message}". Image generated. Write a natural, friendly response. 2-3 sentences.`,
        [{ role: "user", content: `User requested image: "${message}". Image generated. Write a natural, friendly response. 2-3 sentences.` }],
        { temperature: 0.7, maxTokens: 200, useWebSearch: false }
      );
      await addMessage(
        env2,
        ip,
        auth.userId,
        sessionId,
        message,
        aiResponseMessage.result || "Here is your AI-generated image!",
        true,
        imageResult.url
      );
      await updateDailyStat(env2, "images");
      await saveImageMetadata(
        env2,
        imageResult.imageId,
        auth.userId,
        thinking.prompt || message,
        imageResult.provider
      );
      return new Response(imageResult.blob, {
        headers: {
          "Content-Type": "image/png",
          "X-Provider": imageResult.provider,
          "X-Image-Id": imageResult.imageId,
          "X-Style": imageResult.styleDecision.style,
          "X-Confidence": String(imageResult.styleDecision.confidence),
          "X-Reasoning": encodeURIComponent(imageResult.styleDecision.reasoning || "AI selected"),
          "X-Engine-Reasoning": encodeURIComponent(imageResult.engineDecision.reasoning || "AI selected"),
          "X-Text-Response": encodeURIComponent(aiResponseMessage.result || "Here is your image!"),
          ...CORS_HEADERS
        }
      });
    } else {
      const errorResponse = await callGeminiOrGroq(
        `User requested image: "${message}". All AI image engines failed. Write a kind, helpful response.`,
        [{ role: "user", content: `User requested image: "${message}". All AI image engines failed. Write a kind, helpful response.` }],
        { temperature: 0.7, maxTokens: 150, useWebSearch: false }
      );
      return new Response(JSON.stringify({
        error: errorResponse.result || "Image generation failed. Please try a different request.",
        details: imageResult.error
      }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
  }
  if (image) {
    const visionResult = await quantumVisionAnalyze(image, message);
    if (visionResult.success) {
      await addMessage(env2, ip, auth.userId, sessionId, "Image analysis", visionResult.analysis);
      return new Response(JSON.stringify({ analysis: visionResult.analysis, provider: visionResult.provider }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }
  const response = await quantumResponse(env2, message, sessionContext, {}, { isPremium: auth.isPremium, userId: auth.userId, targetLanguage, responseFormat: body.response_format, jsonSchema: body.jsonSchema });
  await addMessage(env2, ip, auth.userId, sessionId, message, response.response);
  await saveToVectorDB(env2, auth.userId, message, { response: response.response?.substring(0, 500), type: "chat", intent: thinking.action });
  await updateDailyStat(env2, "messages");
  const shouldReturnTTS = body.tts === true || request.headers.get("X-TTS") === "true";
  if (shouldReturnTTS) {
    const startTTS = Date.now();
    const ttsResult = await divineTextToVoice(response.response, body.language || targetLanguage || "en");
    const ttsLatency = Date.now() - startTTS;
    if (ttsResult.success) {
      return new Response(ttsResult.audio, {
        headers: {
          "Content-Type": ttsResult.type || "audio/mpeg",
          "X-Response-Text": encodeURIComponent(response.response),
          "X-Provider": ttsResult.provider || "unknown",
          "X-Quality": ttsResult.quality || "good",
          "X-TTS-Latency": String(ttsLatency),
          "X-Model": response.model || "AI",
          "X-Latency": String(Date.now() - startTime),
          "Access-Control-Expose-Headers": "X-Response-Text, X-Provider, X-Quality, X-TTS-Latency, X-Model, X-Latency",
          ...CORS_HEADERS
        }
      });
    } else {
      return new Response(JSON.stringify({
        response: response.response,
        intent: thinking.action,
        model: response.model,
        latency: Date.now() - startTime,
        isPremium: auth.isPremium,
        plan: auth.plan || "free",
        ttsError: ttsResult.error || "TTS failed",
        streamingAvailable: true
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
  }
  const pendingNotification = await env2.KV.get(`pending_notification:${auth.userId}`);
  if (pendingNotification) {
    response.response = `\u{1F514} **Reminder:** ${pendingNotification.replace("\u{1F514} NEXUS Reminder:", "").trim()}

---

` + response.response;
    await env2.KV.delete(`pending_notification:${auth.userId}`);
  }
  return new Response(JSON.stringify({
    response: response.response,
    ...response.json !== void 0 ? { json: response.json, jsonValid: response.jsonValid } : {},
    intent: thinking.action,
    model: response.model,
    latency: Date.now() - startTime,
    isPremium: auth.isPremium,
    plan: auth.plan || "free",
    streamingAvailable: true
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleChatAction, "handleChatAction");
__name2(handleChatAction, "handleChatAction");
__name22(handleChatAction, "handleChatAction");
async function handleImageGenerateAction(env2, auth, body) {
  const prompt = body.prompt || body.message;
  if (!prompt)
    return new Response(JSON.stringify({ error: "Prompt required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const imageCheck = await checkUsageLimit2026(env2, auth.userId, "images");
  if (!imageCheck.allowed)
    return new Response(JSON.stringify({ error: imageCheck.upgradeMessage }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const result = await pureAIImageGenerator(env2, prompt);
  if (result.success) {
    await saveImageMetadata(env2, result.imageId, auth.userId, prompt, result.provider);
    await updateDailyStat(env2, "images");
    return new Response(result.blob, { headers: { "Content-Type": "image/png", "X-Provider": result.provider, "X-Image-Id": result.imageId, ...CORS_HEADERS } });
  }
  return new Response(JSON.stringify({ error: "Image generation failed" }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleImageGenerateAction, "handleImageGenerateAction");
__name2(handleImageGenerateAction, "handleImageGenerateAction");
__name22(handleImageGenerateAction, "handleImageGenerateAction");
async function handleRealPhotoAction(env2, auth, body, params) {
  const query = body.query || params.query || "";
  if (!query)
    return new Response(JSON.stringify({ error: "Search query required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const result = await unifiedRealPhotoSearch(query, { per_page: body.per_page || 10, page: body.page || 1, orientation: body.orientation || "all", order: body.order || "popular" });
  return new Response(JSON.stringify(result), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleRealPhotoAction, "handleRealPhotoAction");
__name2(handleRealPhotoAction, "handleRealPhotoAction");
__name22(handleRealPhotoAction, "handleRealPhotoAction");
async function handleImageEditAction(env2, auth, body) {
  const imageData = body.image;
  const instruction = body.instruction || body.prompt;
  if (!imageData || !instruction)
    return new Response(JSON.stringify({ error: "Image and instruction required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const result = await quantumImageTransform(env2, imageData, instruction);
  if (result.success)
    return new Response(result.blob, { headers: { "Content-Type": "image/png", "X-Provider": result.provider, "X-Image-Id": result.imageId, ...CORS_HEADERS } });
  return new Response(JSON.stringify({ error: "Image editing failed" }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleImageEditAction, "handleImageEditAction");
__name2(handleImageEditAction, "handleImageEditAction");
__name22(handleImageEditAction, "handleImageEditAction");
async function handleImageEnhanceAction(env2, auth, body) {
  const imageData = body.image;
  if (!imageData)
    return new Response(JSON.stringify({ error: "Image required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  if (!env2?.AI)
    return new Response(JSON.stringify({ error: "AI binding not available" }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  try {
    let img = imageData;
    if (!img.startsWith("data:"))
      img = "data:image/png;base64," + img;
    const r = await env2.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", { prompt: "enhance quality, improve details, sharpen, high resolution, professional quality, 4K, HDR", image: img, strength: 0.3, guidance: 4, steps: 15 });
    if (r?.image) {
      const bs = atob(r.image);
      const ua = new Uint8Array(bs.length);
      for (let i = 0; i < bs.length; i++)
        ua[i] = bs.charCodeAt(i);
      const blob = new Blob([ua], { type: "image/png" });
      const iid = generateId();
      await saveImageToKV(env2, iid, blob);
      return new Response(blob, { headers: { "Content-Type": "image/png", "X-Provider": "Quality Enhancer", "X-Image-Id": iid, ...CORS_HEADERS } });
    }
  } catch (e) {
  }
  return new Response(JSON.stringify({ error: "Enhancement failed" }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleImageEnhanceAction, "handleImageEnhanceAction");
__name2(handleImageEnhanceAction, "handleImageEnhanceAction");
__name22(handleImageEnhanceAction, "handleImageEnhanceAction");
async function handleShoppingAction(env2, auth, body) {
  const product = body.product || body.query;
  const budget = body.budget;
  if (!product)
    return new Response(JSON.stringify({ error: "Product name required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const result = await quantumShopping(product, budget);
  const response = result.analysis + "\n\n\u{1F517} [View on Amazon](" + result.searchLink + ")";
  return new Response(JSON.stringify({ response, analysis: result.analysis, searchLink: result.searchLink, product: result.product, budget: result.budget }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleShoppingAction, "handleShoppingAction");
__name2(handleShoppingAction, "handleShoppingAction");
__name22(handleShoppingAction, "handleShoppingAction");
async function handleYoutubeAction(body) {
  const videoUrl = body.videoUrl || body.url;
  if (!videoUrl)
    return new Response(JSON.stringify({ error: "YouTube URL required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const summary = await quantumYoutubeSummary(videoUrl);
  return new Response(JSON.stringify({ response: summary }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleYoutubeAction, "handleYoutubeAction");
__name2(handleYoutubeAction, "handleYoutubeAction");
__name22(handleYoutubeAction, "handleYoutubeAction");
async function handleCodeHelpAction(env2, auth, body) {
  const code = body.code || body.message;
  const language = body.language || "javascript";
  if (!code)
    return new Response(JSON.stringify({ error: "Code required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const prompt = "You are an EXPERT " + language + " developer. Analyze, debug, optimize this code:\n\n```" + language + "\n" + code + "\n```\n\nProvide: Bugs, Security Issues, Performance Improvements, Best Practices.";
  const result = await quantumAIOrchestrator(prompt, [{ role: "user", content: prompt }], { webSearch: false, priority: "quality", taskType: "code" });
  return new Response(JSON.stringify({ response: result.response, model: result.model }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleCodeHelpAction, "handleCodeHelpAction");
__name2(handleCodeHelpAction, "handleCodeHelpAction");
__name22(handleCodeHelpAction, "handleCodeHelpAction");
async function handleFileAnalysisAction(env2, auth, body) {
  const fileContent = body.fileContent || body.content || body.text;
  const fileType = body.fileType || "text";
  if (!fileContent)
    return new Response(JSON.stringify({ error: "File content required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const usageCheck = await checkUsageLimit2026(env2, auth.userId, "fileAnalysis");
  if (!usageCheck.allowed)
    return new Response(JSON.stringify({ error: usageCheck.upgradeMessage }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const prompt = "Analyze this " + fileType + " content: Summary, Key Points, Insights.\n\nCONTENT:\n" + fileContent.substring(0, 1e4);
  const result = await quantumAIOrchestrator(prompt, [{ role: "user", content: prompt }], { webSearch: false, priority: "quality" });
  return new Response(JSON.stringify({ response: result.response, model: result.model }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleFileAnalysisAction, "handleFileAnalysisAction");
__name2(handleFileAnalysisAction, "handleFileAnalysisAction");
__name22(handleFileAnalysisAction, "handleFileAnalysisAction");
async function handleQRAction(body) {
  const text = body.text || body.data;
  if (!text)
    return new Response(JSON.stringify({ error: "Text required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const qr = await generateQRCodeQuantum(text, body.size || 300);
  if (qr.success)
    return new Response(qr.blob, { headers: { "Content-Type": "image/png" } });
  return new Response(JSON.stringify({ error: "QR generation failed" }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleQRAction, "handleQRAction");
__name2(handleQRAction, "handleQRAction");
__name22(handleQRAction, "handleQRAction");
async function handleReminderAction(env2, auth, body) {
  const message = body.message;
  const minutes = body.minutes || body.time || 60;
  if (!message)
    return new Response(JSON.stringify({ error: "Reminder message required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const result = await setQuantumReminder(env2, auth.userId, message, minutes);
  return new Response(JSON.stringify(result), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleReminderAction, "handleReminderAction");
__name2(handleReminderAction, "handleReminderAction");
__name22(handleReminderAction, "handleReminderAction");
async function handleCanvasAction(env2, body) {
  const html = body.html || "";
  const css = body.css || "";
  const js = body.js || "";
  const title = body.title || "NEXUS Canvas";
  const fullCode = html + "\n<style>" + css + "</style>\n<script>" + js + "<\/script>";
  const result = await generateCanvasArtifact(env2, fullCode, "html");
  return new Response(JSON.stringify(result), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleCanvasAction, "handleCanvasAction");
__name2(handleCanvasAction, "handleCanvasAction");
__name22(handleCanvasAction, "handleCanvasAction");
async function handleTranslateAction(body) {
  const text = body.text || body.message;
  const targetLang = body.targetLanguage || body.target || "en";
  const sourceLang = body.sourceLanguage || body.source;
  if (!text)
    return new Response(JSON.stringify({ error: "Text required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const translated = await autoTranslate(text, targetLang, sourceLang);
  return new Response(JSON.stringify({ translation: translated, targetLanguage: targetLang, sourceLanguage: sourceLang || detectLanguage(text) }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleTranslateAction, "handleTranslateAction");
__name2(handleTranslateAction, "handleTranslateAction");
__name22(handleTranslateAction, "handleTranslateAction");
async function handlePremiumStatusAction(env2, auth) {
  const isUserAdmin = isAdmin(auth.userId) || auth.userId === "akhil" || auth.userId === "8681361916";
  if (isUserAdmin) {
    const enterpriseTier = {
      messages: Infinity,
      images: Infinity,
      name: "Enterprise (Admin)",
      price: 0,
      days: 365
    };
    return new Response(JSON.stringify({
      userId: auth.userId,
      isPremium: true,
      plan: "enterprise",
      premiumExpiry: null,
      limits: enterpriseTier
    }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const user = await getUser(env2, auth.userId);
  const tier = PREMIUM_TIERS_2026[user.plan || "free"];
  return new Response(JSON.stringify({
    userId: auth.userId,
    isPremium: user.isPremium || false,
    plan: user.plan || "free",
    premiumExpiry: user.premiumExpiry || null,
    limits: tier
  }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handlePremiumStatusAction, "handlePremiumStatusAction");
__name2(handlePremiumStatusAction, "handlePremiumStatusAction");
__name22(handlePremiumStatusAction, "handlePremiumStatusAction");
async function handlePremiumRequestAction(env2, auth, body) {
  const transactionId = body.transactionId;
  const plan = body.plan;
  const upiId = body.upiId;
  if (!transactionId || !plan)
    return new Response(JSON.stringify({ error: "transactionId and plan required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const result = await premiumRequest2026(env2, auth.userId, transactionId, plan, upiId);
  return new Response(JSON.stringify(result), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handlePremiumRequestAction, "handlePremiumRequestAction");
__name2(handlePremiumRequestAction, "handlePremiumRequestAction");
__name22(handlePremiumRequestAction, "handlePremiumRequestAction");
async function handlePremiumVerifyAction(env2, auth, body) {
  if (!isAdmin(auth.userId))
    return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const targetUserId = body.userId;
  const transactionId = body.transactionId;
  const plan = body.plan;
  if (!targetUserId || !transactionId || !plan)
    return new Response(JSON.stringify({ error: "userId, transactionId, plan required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const result = await verifyPremium2026(env2, targetUserId, transactionId, plan);
  return new Response(JSON.stringify(result), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handlePremiumVerifyAction, "handlePremiumVerifyAction");
__name2(handlePremiumVerifyAction, "handlePremiumVerifyAction");
__name22(handlePremiumVerifyAction, "handlePremiumVerifyAction");
async function handlePremiumPlansAction() {
  return new Response(JSON.stringify({ plans: PREMIUM_TIERS_2026, paidFeatures: CONFIG.PAID_FEATURES, upiId: CONFIG.UPI_ID }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handlePremiumPlansAction, "handlePremiumPlansAction");
__name2(handlePremiumPlansAction, "handlePremiumPlansAction");
__name22(handlePremiumPlansAction, "handlePremiumPlansAction");
async function handleConversationsListAction(env2, auth) {
  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const conversations = await memorySystem.getChatFromSupabase();
  return new Response(JSON.stringify({ success: true, conversations: Array.isArray(conversations) ? conversations : [], total: Array.isArray(conversations) ? conversations.length : 0 }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleConversationsListAction, "handleConversationsListAction");
__name2(handleConversationsListAction, "handleConversationsListAction");
__name22(handleConversationsListAction, "handleConversationsListAction");
async function handleConversationsSaveAction(env2, auth, body) {
  const conversationId = body.conversationId;
  let title = body.title;
  const messages = body.messages;
  if (!messages)
    return new Response(JSON.stringify({ error: "Messages required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  if (!title && !conversationId) {
    const firstUserMsg = messages.find((m) => m.role === "user")?.content;
    if (firstUserMsg)
      title = await autoGenerateTitle(firstUserMsg);
  }
  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const savedId = await memorySystem.saveChatToSupabase(conversationId, messages, title);
  return new Response(JSON.stringify({ success: true, conversationId: savedId, title: title || void 0 }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleConversationsSaveAction, "handleConversationsSaveAction");
__name2(handleConversationsSaveAction, "handleConversationsSaveAction");
__name22(handleConversationsSaveAction, "handleConversationsSaveAction");
async function handleConversationsDeleteAction(env2, auth, params) {
  const conversationId = params.conversationId;
  if (!conversationId)
    return new Response(JSON.stringify({ error: "Conversation ID required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const deleted = await memorySystem.deleteChatFromSupabase(conversationId);
  return new Response(JSON.stringify({ success: deleted }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleConversationsDeleteAction, "handleConversationsDeleteAction");
__name2(handleConversationsDeleteAction, "handleConversationsDeleteAction");
__name22(handleConversationsDeleteAction, "handleConversationsDeleteAction");
async function handleConversationsSearchAction(env2, auth, params) {
  const query = params.query || "";
  if (!query)
    return new Response(JSON.stringify({ error: "Search query required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const results = await memorySystem.searchChats(query);
  return new Response(JSON.stringify({ success: true, results, total: results.length }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleConversationsSearchAction, "handleConversationsSearchAction");
__name2(handleConversationsSearchAction, "handleConversationsSearchAction");
__name22(handleConversationsSearchAction, "handleConversationsSearchAction");
function contextFromConversationMessages(messages, maxTurns) {
  const turns = (messages || []).slice(-((maxTurns || 10) * 2));
  let ctx = "";
  for (let i = 0; i < turns.length - 1; i += 2) {
    const u = turns[i];
    const a = turns[i + 1];
    if (u?.role === "user") {
      ctx += "**User:** " + (u.content || "").substring(0, 500) + "\n\n";
      if (a?.role === "assistant") {
        ctx += "**Assistant:** " + (a.content || "").substring(0, 500) + "\n\n";
      }
    }
  }
  return ctx;
}
__name(contextFromConversationMessages, "contextFromConversationMessages");
__name2(contextFromConversationMessages, "contextFromConversationMessages");
async function autoGenerateTitle(firstMessage) {
  try {
    const prompt = `Generate a short 3-6 word title (no quotes, no punctuation at the end) summarizing this chat opener:
"${(firstMessage || "").substring(0, 300)}"`;
    const result = await callGeminiOrGroq(prompt, [{ role: "user", content: prompt }], { temperature: 0.4, maxTokens: 20, useWebSearch: false });
    const title = (result.result || "").trim().replace(/^["']|["']$/g, "").split("\n")[0];
    return title || (firstMessage || "New chat").substring(0, 40);
  } catch (e) {
    return (firstMessage || "New chat").substring(0, 40);
  }
}
__name(autoGenerateTitle, "autoGenerateTitle");
__name2(autoGenerateTitle, "autoGenerateTitle");
async function handleMessageEditAction(env2, auth, body) {
  const { conversationId, messageIndex, newContent } = body;
  if (!conversationId || messageIndex === void 0 || !newContent) {
    return new Response(JSON.stringify({ error: "conversationId, messageIndex, and newContent are required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const convo = await memorySystem.getChatFromSupabase(conversationId);
  if (!convo) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const messages = Array.isArray(convo.messages) ? convo.messages : [];
  if (messageIndex < 0 || messageIndex >= messages.length || messages[messageIndex]?.role !== "user") {
    return new Response(JSON.stringify({ error: "messageIndex must point to a user message" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const truncated = messages.slice(0, messageIndex);
  const editedMessage = { ...messages[messageIndex], content: newContent, edited: true, editedAt: Date.now() };
  const context = contextFromConversationMessages(truncated, 10);
  const aiResponse = await quantumResponse(env2, newContent, context, {}, { isPremium: auth.isPremium, userId: auth.userId });
  const finalMessages = [...truncated, editedMessage, { role: "assistant", content: aiResponse.response, regenerated: true }];
  const savedId = await memorySystem.saveChatToSupabase(conversationId, finalMessages, convo.title);
  return new Response(JSON.stringify({ success: true, conversationId: savedId, response: aiResponse.response, model: aiResponse.model, messages: finalMessages }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleMessageEditAction, "handleMessageEditAction");
__name2(handleMessageEditAction, "handleMessageEditAction");
__name22(handleMessageEditAction, "handleMessageEditAction");
async function handleRegenerateAction(env2, auth, body) {
  const { conversationId } = body;
  let { messageIndex } = body;
  if (!conversationId) {
    return new Response(JSON.stringify({ error: "conversationId is required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const memorySystem = new MemorySystem(env2, auth.userId, auth.supabase);
  const convo = await memorySystem.getChatFromSupabase(conversationId);
  if (!convo) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const messages = Array.isArray(convo.messages) ? convo.messages : [];
  if (messageIndex === void 0) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant") {
        messageIndex = i;
        break;
      }
    }
  }
  if (messageIndex === void 0 || messages[messageIndex]?.role !== "assistant") {
    return new Response(JSON.stringify({ error: "No assistant message found to regenerate" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const priorUser = messages.slice(0, messageIndex).reverse().find((m) => m.role === "user");
  if (!priorUser) {
    return new Response(JSON.stringify({ error: "No prior user message found" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  const truncated = messages.slice(0, messageIndex - 1 >= 0 && messages[messageIndex - 1]?.role === "user" ? messageIndex - 1 : messageIndex);
  const context = contextFromConversationMessages(truncated, 10);
  const aiResponse = await quantumResponse(env2, priorUser.content, context, {}, { isPremium: auth.isPremium, userId: auth.userId });
  const finalMessages = [...truncated, priorUser, { role: "assistant", content: aiResponse.response, regenerated: true }];
  const savedId = await memorySystem.saveChatToSupabase(conversationId, finalMessages, convo.title);
  return new Response(JSON.stringify({ success: true, conversationId: savedId, response: aiResponse.response, model: aiResponse.model, messages: finalMessages }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleRegenerateAction, "handleRegenerateAction");
__name2(handleRegenerateAction, "handleRegenerateAction");
__name22(handleRegenerateAction, "handleRegenerateAction");
async function handleMessageFeedbackAction(env2, auth, body) {
  const { conversationId, messageIndex, rating, comment } = body;
  if (!conversationId || messageIndex === void 0 || !rating) {
    return new Response(JSON.stringify({ error: "conversationId, messageIndex, and rating ('up'|'down') are required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
  try {
    await env2.DB.prepare(
      "INSERT INTO message_feedback (id, user_id, conversation_id, message_index, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(generateId(), auth.userId, conversationId, messageIndex, rating, comment || null, Date.now()).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
}
__name(handleMessageFeedbackAction, "handleMessageFeedbackAction");
__name2(handleMessageFeedbackAction, "handleMessageFeedbackAction");
__name22(handleMessageFeedbackAction, "handleMessageFeedbackAction");
async function handleUserProfileAction(env2, auth) {
  const userData = await auth.supabase.getUser(auth.userId, auth.token);
  const premiumStatus = await auth.supabase.getPremiumStatus(auth.userId, auth.token);
  return new Response(JSON.stringify({ success: true, profile: { id: auth.userId, email: auth.email || (userData ? userData.email : null), fullName: userData ? userData.full_name : null, avatarUrl: userData ? userData.avatar_url : null, isPremium: premiumStatus.isPremium, plan: premiumStatus.plan, premiumExpiry: premiumStatus.premiumExpiry, createdAt: userData ? userData.created_at : null, lastLogin: userData ? userData.last_login : null } }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleUserProfileAction, "handleUserProfileAction");
__name2(handleUserProfileAction, "handleUserProfileAction");
__name22(handleUserProfileAction, "handleUserProfileAction");
async function handleAgentsListAction(env2, auth) {
  const userAgents = [];
  try {
    if (env2.DB) {
      const result = await env2.DB.prepare("SELECT id, data FROM conversations_backup WHERE user_id = ? AND id LIKE 'agent:%'").bind(auth.userId).all();
      if (result?.results) {
        for (const row of result.results) {
          try {
            userAgents.push(JSON.parse(row.data));
          } catch (e) {
          }
        }
      }
    }
  } catch (e) {
  }
  return new Response(JSON.stringify({ systemAgents: AI_AGENTS, userAgents }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleAgentsListAction, "handleAgentsListAction");
__name2(handleAgentsListAction, "handleAgentsListAction");
__name22(handleAgentsListAction, "handleAgentsListAction");
async function handleImageGalleryAction(env2, auth) {
  const images = await getUserImageGallery(env2, auth.userId);
  return new Response(JSON.stringify({ success: true, images, total: images.length }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleImageGalleryAction, "handleImageGalleryAction");
__name2(handleImageGalleryAction, "handleImageGalleryAction");
__name22(handleImageGalleryAction, "handleImageGalleryAction");
async function handleHealthAction() {
  return new Response(JSON.stringify({ status: "active", name: CONFIG.APP_NAME, creator: CONFIG.CREATOR, version: "8.0", date: TODAY, year: CURRENT_YEAR, uptime: "99.99%", features: { auth: true, webSearch: 5, models: 6, imageGen: 3, voice: 4, pixabay: true, unsplash: true, streaming: 4, premium: 4, languages: 21 }, languages: Object.keys(INDIAN_LANGUAGES) }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleHealthAction, "handleHealthAction");
__name2(handleHealthAction, "handleHealthAction");
__name22(handleHealthAction, "handleHealthAction");
async function handleClearSessionAction(env2, auth, params) {
  const ip = params.ip || "unknown";
  const sessionId = params.sessionId || "default";
  const targetUserId = params.userId || auth.userId;
  if (targetUserId !== auth.userId && !isAdmin(auth.userId))
    return new Response(JSON.stringify({ error: "You can only clear your own session. Admin access required for other users." }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  await env2.KV.delete("session:" + ip + "|" + targetUserId + "|" + sessionId);
  return new Response(JSON.stringify({ success: true, message: "Session cleared for user: " + targetUserId }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
__name(handleClearSessionAction, "handleClearSessionAction");
__name2(handleClearSessionAction, "handleClearSessionAction");
__name22(handleClearSessionAction, "handleClearSessionAction");
async function executeLivePlugin(env2, userId, pluginName, actionType = "read", payload = {}) {
  if (pluginName === "github") {
    const githubAuth = await env2.NEXUS_KV.get(`auth_plugin:github:${userId}`, { type: "json" });
    if (!githubAuth)
      return "\u26A0\uFE0F GitHub Plugin not connected by user.";
    const headers = {
      "Authorization": `Bearer ${githubAuth.tokens.access_token}`,
      "User-Agent": "NEXUS-AI-MONSTER",
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    };
    try {
      if (actionType === "read") {
        const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=3", { headers });
        if (!response.ok)
          return `GitHub API Error: ${response.statusText}`;
        const repos = await response.json();
        return repos.map((r) => `\u2022 Repo: ${r.name} | URL: ${r.html_url}`).join("\n");
      }
      if (actionType === "create_repo") {
        if (!payload.repoName)
          return "\u26A0\uFE0F Error: Repository name is required.";
        const response = await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: payload.repoName,
            description: payload.description || "Created by NEXUS AI Monster Plugin",
            private: !!payload.isPrivate
          })
        });
        if (!response.ok)
          return `GitHub Create Error: ${await response.text()}`;
        const repoData = await response.json();
        return `\u{1F389} Successfully Created Repo: **${repoData.name}**
\u{1F517} Link: ${repoData.html_url}`;
      }
      if (actionType === "delete_repo") {
        if (!payload.repoOwner || !payload.repoName)
          return "\u26A0\uFE0F Error: repoOwner and repoName are required.";
        const response = await fetch(`https://api.github.com/repos/${payload.repoOwner}/${payload.repoName}`, {
          method: "DELETE",
          headers
        });
        if (response.status === 204)
          return `\u{1F5D1}\uFE0F Repository **${payload.repoName}** has been successfully deleted.`;
        return `GitHub Delete Error: Status ${response.status}`;
      }
    } catch (e) {
      return `GitHub Plugin Exception: ${e.message}`;
    }
  }
  if (pluginName === "google_gmail") {
    const googleAuth = await env2.NEXUS_KV.get(`auth_plugin:google:${userId}`, { type: "json" });
    if (!googleAuth)
      return "\u26A0\uFE0F Google Plugin not connected by user.";
    const baseHeaders = { "Authorization": `Bearer ${googleAuth.tokens.access_token}` };
    try {
      if (actionType === "read") {
        const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=3", { headers: baseHeaders });
        if (!response.ok)
          return `Gmail API Error: ${response.statusText}`;
        const data = await response.json();
        if (!data.messages || data.messages.length === 0)
          return "No new unread emails found.";
        return `Found ${data.messages.length} recent unread emails. Inside system processing...`;
      }
      if (actionType === "send_email") {
        if (!payload.to || !payload.subject || !payload.body)
          return "\u26A0\uFE0F Error: Missing 'to', 'subject' or 'body'.";
        const rawEmail = [
          `To: ${payload.to}`,
          `Subject: ${payload.subject}`,
          'Content-Type: text/plain; charset="UTF-8"',
          "",
          payload.body
        ].join("\r\n");
        const utf8Bytes = new TextEncoder().encode(rawEmail);
        let binaryStr = "";
        for (let i = 0; i < utf8Bytes.byteLength; i++) {
          binaryStr += String.fromCharCode(utf8Bytes[i]);
        }
        const encodedEmail = btoa(binaryStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: { ...baseHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ raw: encodedEmail })
        });
        if (!response.ok)
          return `Gmail Send Error: ${await response.text()}`;
        return `\u{1F680} Email successfully dispatched to **${payload.to}** with subject: "${payload.subject}"`;
      }
      if (actionType === "delete_email") {
        if (!payload.messageId)
          return "\u26A0\uFE0F Error: Message ID is required.";
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${payload.messageId}/trash`, {
          method: "POST",
          headers: baseHeaders
        });
        if (!response.ok)
          return `Gmail Trash Error: ${await response.text()}`;
        return `\u{1F5D1}\uFE0F Email Message ID: **${payload.messageId}** has been moved to Trash successfully.`;
      }
    } catch (e) {
      return `Gmail Plugin Exception: ${e.message}`;
    }
  }
  return "Unknown plugin tool handler.";
}
__name(executeLivePlugin, "executeLivePlugin");
__name2(executeLivePlugin, "executeLivePlugin");
async function handlePluginDisconnect(env2, provider, userId) {
  if (!provider || !userId) {
    return new Response(JSON.stringify({ error: "Missing provider or userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  }
  const key = `auth_plugin:${provider}:${userId}`;
  const exists = await env2.NEXUS_KV.get(key);
  if (!exists) {
    return new Response(JSON.stringify({ success: false, message: `Plugin ${provider} was not connected.` }), {
      status: 400,
      // Isko 400 status de diya taaki frontend ko pata chale connection nahi tha
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  }
  await env2.NEXUS_KV.delete(key);
  return new Response(JSON.stringify({
    success: true,
    message: `\u{1F50C} ${provider.toUpperCase()} Plugin disconnected successfully! Tokens cleared from secure vault.`
  }), { headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
}
__name(handlePluginDisconnect, "handlePluginDisconnect");
__name2(handlePluginDisconnect, "handlePluginDisconnect");
async function executePluginNew(env2, auth, body) {
  console.log(`\u{1F535} executePluginNew: START - User=${auth.userId}`);
  console.log(`\u{1F535} executePluginNew: body = ${JSON.stringify(body)}`);
  const { app, action, params } = body;
  if (!app || !action) {
    console.log(`\u{1F534} executePluginNew: app or action missing`);
    return { success: false, error: "app and action are required" };
  }
  console.log(`\u{1F535} executePluginNew: app=${app}, action=${action}`);
  const isTelegramAuth = app === "telegram" && (action === "init" || action === "verify");
  const integration = await getIntegration(env2, auth.userId, app);
  console.log(`\u{1F535} executePluginNew: integration = ${integration ? "FOUND" : "NOT FOUND"}`);
  if (!integration && !isTelegramAuth) {
    console.log(`\u{1F534} executePluginNew: ${app} not connected for user ${auth.userId}`);
    return { success: false, error: `${app} not connected. Please connect first.` };
  }
  const token = integration?.access_token;
  const sessionString = integration?.session_string;
  console.log(`\u{1F535} executePluginNew: token = ${token ? "present" : "null"}`);
  console.log(`\u{1F535} executePluginNew: sessionString = ${sessionString ? "present" : "null"}`);
  let result;
  try {
    switch (app) {
      case "telegram":
        console.log(`\u{1F535} executePluginNew: TELEGRAM action=${action}`);
        switch (action) {
          case "init":
            console.log(`\u{1F535} executePluginNew: Calling telegramInit with phone=${params.phone}`);
            result = await telegramInit(params.phone, auth.userId);
            break;
          case "verify":
            console.log(`\u{1F535} executePluginNew: Calling telegramVerify with phone=${params.phone}, otp=${params.otp}`);
            result = await telegramVerify(params.phone, params.otp, auth.userId);
            console.log(`\u{1F535} verify result: ${JSON.stringify(result)}`);
            console.log(`\u{1F535} result.success = ${result?.success}`);
            console.log(`\u{1F535} result.sessionString = ${result?.sessionString ? "present" : "null"}`);
            if (result && result.success && result.sessionString) {
              console.log(`\u2705 executePluginNew: Telegram session stored for user ${auth.userId}`);
              await storeIntegration(env2, auth.userId, "telegram", {
                session_string: result.sessionString,
                phone: params.phone,
                connected_at: Date.now()
              });
            }
            break;
          case "send_message":
            console.log(`\u{1F535} executePluginNew: Calling telegramSendMessage to chatId=${params.chatId}`);
            result = await telegramSendMessage(sessionString, params.chatId, params.text);
            break;
          case "get_messages":
            console.log(`\u{1F535} executePluginNew: Calling telegramGetMessages from chatId=${params.chatId}`);
            result = await telegramGetMessages(sessionString, params.chatId, params.limit);
            break;
          case "get_chats":
            console.log(`\u{1F535} executePluginNew: Calling telegramGetChats`);
            result = await telegramGetChats(sessionString);
            break;
          case "get_me":
            console.log(`\u{1F535} executePluginNew: Calling telegramGetMe`);
            result = await telegramGetMe(sessionString);
            break;
          default:
            return { success: false, error: `Unknown telegram action: ${action}` };
        }
        break;
      case "figma": {
        let fileId = params?.fileId;
        if (!fileId && integration?.config?.cachedFileId) {
          fileId = integration.config.cachedFileId;
        }
        if (!fileId) {
          return { success: false, error: "No Figma file connected yet. Share a Figma file URL or ID once and NEXUS will remember it." };
        }
        result = await figmaFullControl(token, fileId, action, params);
        if (params?.fileId && params.fileId !== integration?.config?.cachedFileId) {
          await storeIntegration(env2, auth.userId, "figma", {
            access_token: token,
            refresh_token: integration.refresh_token,
            expires_at: integration.expires_at,
            config: { ...integration.config || {}, cachedFileId: params.fileId }
          });
        }
        break;
      }
      case "discord":
        result = await discordFullControl(token, action, params);
        break;
      case "canva":
        result = await canvaFullControl(token, action, params, integration?.config?.designs);
        break;
      case "wolfram":
        result = await wolframFullControl(token, action, params);
        break;
      case "zapier":
        result = await zapierFullControl(token, params);
        break;
      default:
        if (GENERIC_OAUTH_PROVIDERS.includes(app)) {
          if (!params?.endpoint) {
            return { success: false, error: `Provide params.endpoint (full API URL) for ${app}. NEXUS should know this API's shape.` };
          }
          result = await genericAuthenticatedApiCall(token, params.method || "GET", params.endpoint, params.body, params.headers);
          break;
        }
        console.log(`\u{1F534} executePluginNew: Unknown app ${app}`);
        return { success: false, error: `Unknown app: ${app}` };
    }
  } catch (error) {
    console.error(`\u{1F534} executePluginNew ERROR:`, error.message);
    console.error(`\u{1F534} executePluginNew Stack:`, error.stack);
    return { success: false, error: error.message };
  }
  console.log(`\u2705 executePluginNew: SUCCESS - app=${app}, action=${action}`);
  return { success: true, data: result };
}
__name(executePluginNew, "executePluginNew");
__name2(executePluginNew, "executePluginNew");
async function enhancedCodeReview(code, language, filename, author) {
  const existingReviewer = AI_AGENTS["code-reviewer"];
  const enhancedPrompt = `${existingReviewer.prompt}

            FILE: ${filename || "unknown"}
            AUTHOR: ${author || "unknown"}
            LANGUAGE: ${language || "auto-detect"}

            CODE TO REVIEW:
            \`\`\`
            ${code}
            \`\`\`

            Return review in GitHub PR format:

            ## \u{1F7E2} Strengths
            - [what's good]

            ## \u{1F534} Issues Found
            | Line | Severity | Issue | Suggestion |
            |------|----------|-------|------------|
            | 1-5 | \u{1F534} Critical | ... | ... |
            | 10 | \u{1F7E1} Warning | ... | ... |
            | 15 | \u{1F535} Suggestion | ... | ... |

            ## \u{1F4CA} Summary
            - Security: \u2705/\u26A0\uFE0F/\u274C
            - Performance: \u2705/\u26A0\uFE0F/\u274C
            - Maintainability: \u2705/\u26A0\uFE0F/\u274C
            - Test Coverage: \u2705/\u26A0\uFE0F/\u274C

            ## \u2705 Verdict
            APPROVED / CHANGES_REQUESTED / COMMENT

            ## \u{1F527} Suggested Fix (if needed)
            \`\`\`${language}
            // fixed code
            \`\`\``;
  const messages = [{ role: "user", content: enhancedPrompt }];
  const review = await callGroq(messages);
  return {
    review,
    author,
    filename,
    reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(enhancedCodeReview, "enhancedCodeReview");
__name2(enhancedCodeReview, "enhancedCodeReview");
async function debugError(errorLog, codeContext, stackTrace) {
  const debugPrompt = `You are a senior debugging engineer. Analyze this error.

    ERROR MESSAGE: ${errorLog}
    STACK TRACE: ${stackTrace || "Not provided"}
    CODE CONTEXT:
    \`\`\`
    ${codeContext || "Not provided"}
    \`\`\`

    Provide:
    1. **Root Cause** (What caused this? 1-2 sentences)
    2. **Fix** (Exact code fix)
    3. **Prevention** (How to avoid)

    Format:
    \`\`\`
    ## \u{1F50D} Root Cause
    [analysis]

    ## \u{1F527} Fix
    \`\`\`language
    // fixed code
    \`\`\`

    ## \u{1F6E1}\uFE0F Prevention
    - [tip1]
    - [tip2]
    \`\`\``;
  const result = await callGemini([{ role: "user", content: debugPrompt }]);
  return result;
}
__name(debugError, "debugError");
__name2(debugError, "debugError");
var worker_default = {
  async fetch(request, env2, ctx) {
    Object.assign(CURRENT_DATE, getCurrentDate());
    CURRENT_YEAR = CURRENT_DATE.year;
    CURRENT_MONTH = CURRENT_DATE.month;
    CURRENT_DAY = CURRENT_DATE.day;
    TODAY = CURRENT_DATE.full;
    if (env2.SLACK_WEBHOOK_URL)
      CONFIG.SLACK_WEBHOOK_URL = env2.SLACK_WEBHOOK_URL;
    if (env2.SLACK_SIGNING_SECRET)
      CONFIG.SLACK_SIGNING_SECRET = env2.SLACK_SIGNING_SECRET;
    await initD1Tables(env2);
    if (request.method === "OPTIONS")
      return new Response(null, { headers: CORS_HEADERS });
    const url = new URL(request.url);
    const path = url.pathname;
    const pathname = url.pathname;
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (path === "/health")
      return await handleHealthAction();
    if (path === "/branding/logo") {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><defs><linearGradient id="g"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><text x="10" y="40" font-size="32" font-weight="bold" fill="url(#g)">NEXUS</text><text x="120" y="28" font-size="12" fill="#8b5cf6">GPT-5.5</text><text x="120" y="44" font-size="10" fill="#94a3b8">by Akhil</text></svg>';
      return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
    }
    if (path.startsWith("/image/")) {
      const imageId = path.split("/")[2];
      const blob = await getImageFromKV(env2, imageId);
      if (blob)
        return new Response(blob, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=604800" } });
      return new Response("Image not found", { status: 404 });
    }
    if (path.startsWith("/canvas/")) {
      const canvasId = path.split("/")[2];
      const html = await env2.KV.get("canvas:" + canvasId);
      if (html)
        return new Response(html, { headers: { "Content-Type": "text/html", "Cache-Control": "public, max-age=3600" } });
      return new Response("Canvas not found", { status: 404 });
    }
    if (path === "/api/test/plugins") {
      const targetUserId = url.searchParams.get("userId");
      const targetProvider = url.searchParams.get("provider");
      const actionType = url.searchParams.get("actionType") || "read";
      if (!targetUserId || !targetProvider) {
        return new Response(JSON.stringify({ error: "Missing parameters" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
      }
      let payload = {
        to: url.searchParams.get("to") || "jaiswalanushi8@gmail.com",
        subject: url.searchParams.get("subject") || "NEXUS AI Monster Test",
        body: url.searchParams.get("body") || "Bhai! NEXUS AI ka Full Action Plugin ekdam perfect kaam kar raha hai. Live from Cloudflare Worker!",
        repoName: url.searchParams.get("repoName") || "nexus-auto-repo"
      };
      const pluginName = targetProvider === "google" ? "google_gmail" : "github";
      const output = await executeLivePlugin(env2, targetUserId, pluginName, actionType, payload);
      return new Response(JSON.stringify({
        success: true,
        provider: targetProvider,
        actionExecuted: actionType,
        output
      }), { headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
    if (pathname === "/test-execute") {
      return new Response(JSON.stringify({
        status: "OK",
        action: "execute_plugin",
        message: "Route is working!",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    if (pathname === "/testplugin") {
      const result = await executePluginNew(env2, {
        userId: "test_user",
        authenticated: true
      }, {
        app: "telegram",
        action: "init",
        params: { phone: "+919839524592" }
      });
      return new Response(JSON.stringify(result), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
    if (path === "/slack/events" && request.method === "POST")
      return await handleSlackCommandCenter2026(request, env2);
    const auth = await enhancedAuthenticate(request, env2);
    const rateLimit = await checkRateLimit(env2, ip, auth.userId);
    if (!rateLimit.allowed)
      return new Response(JSON.stringify({ error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter }), { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Retry-After": String(rateLimit.retryAfter) } });
    if (pathname === "/execute-plugin" && request.method === "POST") {
      console.log("\u{1F535} /execute-plugin: Direct call");
      try {
        const auth2 = await enhancedAuthenticate(request, env2);
        if (!auth2.authenticated) {
          return new Response(JSON.stringify({
            success: false,
            error: "Authentication required"
          }), {
            status: 401,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          });
        }
        const body = await request.json();
        const result = await executePluginNew(env2, auth2, body);
        return new Response(JSON.stringify(result), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("\u{1F534} /execute-plugin error:", error.message);
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
    }
    if (pathname === "/oauth/figma")
      return await handleFigmaOAuth(env2);
    if (pathname === "/oauth/figma/callback")
      return await handleFigmaOAuthCallback(env2, request);
    if (pathname === "/oauth/discord")
      return await handleDiscordOAuth(env2);
    if (pathname === "/oauth/discord/callback")
      return await handleDiscordOAuthCallback(env2, request);
    if (pathname === "/oauth/canva")
      return await handleCanvaOAuth(env2);
    if (pathname === "/oauth/canva/callback")
      return await handleCanvaOAuthCallback(env2, request);
    for (const genProvider of GENERIC_OAUTH_PROVIDERS) {
      if (pathname === `/oauth/${genProvider}`)
        return await handleGenericOAuthInit(env2, genProvider);
      if (pathname === `/oauth/${genProvider}/callback`)
        return await handleGenericOAuthCallback(env2, request, genProvider);
    }
    if (path === "/api" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const action = body.action || "chat";
      const params = Object.fromEntries(url.searchParams);
      return await handleAction(env2, request, auth, action, body, params, ctx);
    }
    if (pathname === "/api/plugin" && request.method === "POST") {
      const body = await request.json();
      const result = await executePluginFull(env2, auth, body);
      return new Response(JSON.stringify(result), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
    if (path === "/chat" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const params = Object.fromEntries(url.searchParams);
      params.sessionId = request.headers.get("X-Session-ID") || generateId();
      return await handleAction(env2, request, auth, "chat", body, params, ctx);
    }
    if (path === "/voice-chat" && request.method === "POST") {
      const params = Object.fromEntries(url.searchParams);
      params.sessionId = request.headers.get("X-Session-ID") || generateId();
      return await handleVoiceChatSupreme(request, env2, auth.userId, params.sessionId);
    }
    if (pathname === "/oauth/google/login") {
      return await handleOAuthLogin(env2, "google");
    }
    if (pathname === "/oauth/github/login") {
      return await handleOAuthLogin(env2, "github");
    }
    if (pathname === "/auth/callback") {
      return await handleAuthCallback(request, env2);
    }
    if (path === "/oauth/disconnect") {
      const targetUserId = url.searchParams.get("userId");
      const targetProvider = url.searchParams.get("provider");
      return await handlePluginDisconnect(env2, targetProvider, targetUserId);
    }
    if (path === "/premium/status")
      return await handlePremiumStatusAction(env2, auth);
    if (path === "/premium/request" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return await handlePremiumRequestAction(env2, auth, body);
    }
    if (path === "/premium/plans")
      return await handlePremiumPlansAction();
    if (path === "/conversations" && request.method === "GET")
      return await handleConversationsListAction(env2, auth);
    if (path === "/conversations" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return await handleConversationsSaveAction(env2, auth, body);
    }
    if (path === "/pixabay/search" && request.method === "GET") {
      const params = Object.fromEntries(url.searchParams);
      const body = { query: params.q, ...params };
      return await handleRealPhotoAction(env2, auth, body, params);
    }
    if (path === "/qr" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return await handleQRAction(body);
    }
    if (path === "/canvas" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return await handleCanvasAction(env2, body);
    }
    if (path === "/clear") {
      const params = { ip, sessionId: request.headers.get("X-Session-ID") || "default" };
      return await handleClearSessionAction(env2, auth, params);
    }
    if (path === "/")
      return new Response(JSON.stringify({ name: CONFIG.APP_NAME, version: "8.0", creator: CONFIG.CREATOR, year: CURRENT_YEAR, oneEndpoint: "/api", documentation: 'POST /api with { "action": "...", ...params }', availableActions: ["chat", "voice", "image_generate", "real_photo", "image_edit", "image_enhance", "shopping", "youtube", "code_help", "file_analysis", "qr_generate", "reminder", "canvas", "translate", "premium_status", "premium_request", "premium_verify", "premium_plans", "conversations_list", "conversations_save", "conversations_delete", "conversations_search", "message_edit", "regenerate_response", "message_feedback", "user_profile", "agents_list", "image_gallery", "health", "clear_session"], premium: PREMIUM_TIERS_2026, upi: CONFIG.UPI_ID }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ error: "Not found", tip: "Use /api endpoint" }), { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  },
  async scheduled(event, env2, ctx) {
    Object.assign(CURRENT_DATE, getCurrentDate());
    CURRENT_YEAR = CURRENT_DATE.year;
    CURRENT_MONTH = CURRENT_DATE.month;
    CURRENT_DAY = CURRENT_DATE.day;
    TODAY = CURRENT_DATE.full;
    await checkReminders(env2);
    await sendDailyStats2026(env2);
    await sendDailyStats2026(env2);
    console.log("\xF0\u0178\u201C\u0160 NEXUS Monster Daily Report sent at " + (/* @__PURE__ */ new Date()).toISOString());
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
