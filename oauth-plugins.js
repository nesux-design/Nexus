/**
 * Nexus A1 — Claude / ChatGPT / Grok style OAuth Plugins
 * Worker keeps OAuth routes + token storage; this module = tools, match, API, thinking.
 */
export const PLUGIN_TOOL_REGISTRY = {
  discord: {
    tools: [
      { name: "get_user", description: "Get Discord user profile", scopes: ["identify"], action: "get_user" },
      { name: "list_guilds", description: "List Discord servers the user is in", scopes: ["guilds"], action: "list_guilds" },
      { name: "list_channels", description: "List channels in a Discord server", scopes: ["guilds"], action: "list_channels", params: ["guildId"] },
      { name: "get_guild", description: "Get Discord server details", scopes: ["guilds"], action: "get_guild", params: ["guildId"] }
    ]
  },
  spotify: {
    tools: [
      { name: "get_profile", description: "Get Spotify profile", scopes: ["user-read-private"], action: "get_profile" },
      { name: "get_playback", description: "What is currently playing", scopes: ["user-read-playback-state"], action: "get_playback" },
      { name: "get_top_tracks", description: "User top tracks", scopes: ["user-top-read"], action: "get_top_tracks" }
    ]
  },
  github: {
    tools: [
      { name: "get_user", description: "GitHub authenticated user", scopes: [], action: "get_user" },
      { name: "list_repos", description: "List GitHub repositories", scopes: ["repo"], action: "list_repos" }
    ]
  },
  notion: {
    tools: [
      { name: "list_pages", description: "Search/list Notion pages", scopes: [], action: "list_pages" },
      { name: "get_page", description: "Get a Notion page", scopes: [], action: "get_page", params: ["pageId"] }
    ]
  },
  slack: {
    tools: [
      { name: "list_channels", description: "List Slack channels", scopes: ["channels:read"], action: "list_channels" },
      { name: "post_message", description: "Post a Slack message", scopes: ["chat:write"], action: "post_message", params: ["channel", "text"] }
    ]
  },
  reddit: {
    tools: [
      { name: "get_me", description: "Reddit identity", scopes: ["identity"], action: "get_me" },
      { name: "list_subs", description: "Subscribed subreddits", scopes: ["mysubreddits"], action: "list_subs" }
    ]
  },
  zoom: {
    tools: [
      { name: "get_user", description: "Zoom user profile", scopes: ["user:read"], action: "get_user" },
      { name: "list_meetings", description: "List Zoom meetings", scopes: ["meeting:read"], action: "list_meetings" }
    ]
  },
  twitch: { tools: [{ name: "get_user", description: "Twitch user", scopes: ["user:read:email"], action: "get_user" }] },
  twitter: { tools: [{ name: "get_me", description: "X/Twitter profile", scopes: ["tweet.read", "users.read"], action: "get_me" }] },
  linkedin: { tools: [{ name: "get_profile", description: "LinkedIn profile", scopes: ["r_liteprofile"], action: "get_profile" }] },
  dropbox: { tools: [{ name: "list_folder", description: "List Dropbox folder", scopes: [], action: "list_folder" }] },
  figma: { tools: [{ name: "get_me", description: "Figma current user", scopes: [], action: "get_me" }] },
  linear: { tools: [{ name: "list_issues", description: "List Linear issues", scopes: [], action: "list_issues" }] },
  asana: { tools: [{ name: "list_tasks", description: "List Asana tasks", scopes: [], action: "list_tasks" }] },
  mailchimp: { tools: [{ name: "list_audiences", description: "List Mailchimp audiences", scopes: [], action: "list_audiences" }] },
  canva: { tools: [{ name: "list_designs", description: "List Canva designs", scopes: ["design:meta:read"], action: "list_designs" }] }
};

export function parseScopes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return String(raw).replace(/,/g, " ").split(/\s+/).map((s) => s.trim()).filter(Boolean);
}

export function scopesOk(granted, required) {
  const req = required || [];
  if (!req.length) return true;
  const g = new Set((granted || []).map((s) => String(s).toLowerCase()));
  if (!g.size) return true;
  return req.every((s) => g.has(String(s).toLowerCase()));
}

export async function getPluginToolsForUser(env, userId, listIntegrationsFn) {
  const out = [];
  let rows = [];
  try {
    rows = await listIntegrationsFn(env, userId);
  } catch {
    return out;
  }
  if (!Array.isArray(rows)) rows = [];
  for (const row of rows) {
    const app = String(row.app_name || row.app || "").toLowerCase();
    if (!app || !PLUGIN_TOOL_REGISTRY[app]) continue;
    const granted = parseScopes(row.scope || row.scopes || row.token_scope || "");
    for (const tool of PLUGIN_TOOL_REGISTRY[app].tools) {
      out.push({
        app,
        tool: tool.name,
        action: tool.action || tool.name,
        description: tool.description,
        required_scopes: tool.scopes || [],
        granted_scopes: granted,
        scopes_ok: scopesOk(granted, tool.scopes),
        params: tool.params || [],
        connected: true
      });
    }
  }
  return out;
}

export function formatPluginsForThinking(tools) {
  if (!tools?.length) {
    return "Plugins: none connected. User can connect apps via /oauth/<app>?userId=...";
  }
  const lines = tools.map(
    (t) => `${t.app}.${t.tool} (${t.description}) scopes_ok=${t.scopes_ok}`
  );
  return (
    "Available plugins (like Claude/Grok connectors):\n" +
    lines.map((l) => "- " + l).join("\n") +
    "\nWhen the user asks about a connected app, call that tool. If scopes_ok=false, ask them to re-authorize."
  );
}

export function buildPluginThinkingSteps({ message, tools, matched, result }) {
  const steps = [];
  steps.push({ title: "Read user message", detail: String(message || "").slice(0, 180), status: "done" });
  const apps = [...new Set((tools || []).map((t) => t.app))];
  steps.push({
    title: "Scan connected plugins",
    detail: apps.length ? apps.join(", ") : "none",
    status: "done"
  });
  if (matched) {
    steps.push({
      title: `Select tool ${matched.app}.${matched.tool}`,
      detail: matched.description + ` [scopes_ok=${matched.scopes_ok}]`,
      status: matched.scopes_ok ? "done" : "blocked"
    });
  } else {
    steps.push({ title: "No plugin match — continue normal chat", detail: "", status: "done" });
  }
  if (result) {
    if (result.error === "reauth_required") {
      steps.push({ title: "Need re-authorization", detail: result.reauth_url || result.app, status: "blocked" });
    } else if (result.success) {
      steps.push({ title: "Plugin API succeeded", detail: `${result.app}.${result.tool || result.action}`, status: "done" });
    } else {
      steps.push({ title: "Plugin failed", detail: String(result.error || result.message || ""), status: "error" });
    }
  }
  return steps;
}

export function thinkingStepsToText(steps) {
  return (steps || []).map((s, i) => `${i + 1}. ${s.title}${s.detail ? ": " + s.detail : ""}`).join("\n");
}

const KEYWORDS = {
  list_guilds: ["discord server", "discord servers", "my servers", "guilds", "my guilds", "discord servers dikhao", "discord dikhao"],
  get_user: ["discord profile", "my discord", "who am i on discord", "discord user"],
  get_profile: ["spotify profile", "my spotify", "linkedin profile"],
  get_playback: ["now playing", "spotify playing", "current song", "what is playing", "ab kya chal raha", "spotify dikhao"],
  get_top_tracks: ["top tracks", "spotify top", "favourite songs"],
  list_repos: ["my repos", "github repos", "list repositories", "github dikhao", "my github"],
  list_pages: ["notion pages", "my notion", "notion dikhao"],
  list_channels: ["slack channels", "slack dikhao"],
  post_message: ["send slack", "slack message"],
  get_me: ["reddit profile", "my reddit", "twitter profile", "x profile", "figma me", "figma profile"],
  list_subs: ["my subreddits", "reddit subs"],
  list_meetings: ["zoom meetings", "my meetings", "zoom dikhao"],
  list_folder: ["dropbox", "my dropbox"],
  list_issues: ["linear issues"],
  list_tasks: ["asana tasks"],
  list_designs: ["canva designs", "my canva"],
  list_audiences: ["mailchimp", "audiences"]
};

export function matchPluginFromMessage(message, tools) {
  if (!message || !tools?.length) return null;
  const msg = String(message).toLowerCase();
  for (const t of tools) {
    if (!t.scopes_ok) continue;
    for (const k of KEYWORDS[t.tool] || KEYWORDS[t.action] || []) {
      if (msg.includes(k)) return t;
    }
    if (
      msg.includes(t.app) &&
      (msg.includes("list") || msg.includes("show") || msg.includes("get") || msg.includes("dikhao") || msg.includes("batao") || msg.includes("mere"))
    ) {
      if (String(t.tool).startsWith("list") || String(t.tool).startsWith("get_")) return t;
    }
  }
  return null;
}

export function reauthPayload(app, userId, workerBase = "https://nexus-a1.apikeyakhilka.workers.dev") {
  const url = `${workerBase}/oauth/${app}?userId=${encodeURIComponent(userId || "")}`;
  return {
    success: false,
    error: "reauth_required",
    app,
    message: `Please reconnect ${app}`,
    reauth_url: url,
    reauth_ui: { title: `Reconnect ${app}`, action: "open_oauth", url }
  };
}

async function apiJson(url, init = {}) {
  const res = await fetch(url, init);
  const ct = res.headers.get("Content-Type") || "";
  let data;
  try {
    data = ct.includes("json") ? await res.json() : await res.text();
  } catch {
    data = {};
  }
  if (res.status === 401) {
    return { ...(typeof data === "object" && data ? data : { error: data }), status: 401, httpStatus: 401 };
  }
  return data;
}

export async function runPluginApi(app, action, token, params = {}, opts = {}) {
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
  const p = params || {};

  if (app === "discord") {
    if (action === "get_user") return apiJson("https://discord.com/api/v10/users/@me", { headers });
    if (action === "list_guilds") return apiJson("https://discord.com/api/v10/users/@me/guilds", { headers });
    if (action === "list_channels" || action === "list_guild_channels") {
      if (!p.guildId) return { error: "guildId required" };
      return apiJson(`https://discord.com/api/v10/guilds/${p.guildId}/channels`, { headers });
    }
    if (action === "get_guild") {
      if (!p.guildId) return { error: "guildId required" };
      return apiJson(`https://discord.com/api/v10/guilds/${p.guildId}`, { headers });
    }
  }
  if (app === "spotify") {
    if (action === "get_profile") return apiJson("https://api.spotify.com/v1/me", { headers });
    if (action === "get_playback") return apiJson("https://api.spotify.com/v1/me/player", { headers });
    if (action === "get_top_tracks") return apiJson("https://api.spotify.com/v1/me/top/tracks?limit=10", { headers });
  }
  if (app === "github") {
    const gh = { ...headers, "User-Agent": "nexus-a1", Accept: "application/vnd.github+json" };
    if (action === "get_user") return apiJson("https://api.github.com/user", { headers: gh });
    if (action === "list_repos") return apiJson("https://api.github.com/user/repos?per_page=20", { headers: gh });
  }
  if (app === "notion") {
    const nh = { ...headers, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
    if (action === "list_pages") return apiJson("https://api.notion.com/v1/search", { method: "POST", headers: nh, body: "{}" });
    if (action === "get_page") {
      if (!p.pageId) return { error: "pageId required" };
      return apiJson(`https://api.notion.com/v1/pages/${p.pageId}`, { headers: nh });
    }
  }
  if (app === "slack") {
    if (action === "list_channels") return apiJson("https://slack.com/api/conversations.list", { headers });
    if (action === "post_message") {
      return apiJson("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ channel: p.channel, text: p.text || "" })
      });
    }
  }
  if (app === "reddit") {
    const rh = { ...headers, "User-Agent": "nexus-a1/1.0" };
    if (action === "get_me") return apiJson("https://oauth.reddit.com/api/v1/me", { headers: rh });
    if (action === "list_subs") return apiJson("https://oauth.reddit.com/subreddits/mine/subscriber", { headers: rh });
  }
  if (app === "zoom") {
    if (action === "get_user") return apiJson("https://api.zoom.us/v2/users/me", { headers });
    if (action === "list_meetings") return apiJson("https://api.zoom.us/v2/users/me/meetings", { headers });
  }
  if (app === "twitch") {
    const th = { ...headers, "Client-Id": opts.clientId || "" };
    if (action === "get_user") return apiJson("https://api.twitch.tv/helix/users", { headers: th });
  }
  if (app === "twitter" && action === "get_me") return apiJson("https://api.twitter.com/2/users/me", { headers });
  if (app === "dropbox" && action === "list_folder") {
    return apiJson("https://api.dropboxapi.com/2/files/list_folder", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ path: p.path || "" })
    });
  }
  if (app === "figma" && action === "get_me") return apiJson("https://api.figma.com/v1/me", { headers });
  if (app === "linkedin" && action === "get_profile") return apiJson("https://api.linkedin.com/v2/userinfo", { headers });
  return { error: `Unsupported plugin action ${app}.${action}` };
}

export async function executePluginLayer(env, auth, body, helpers) {
  const { getIntegrationFn, workerBase, clientId } = helpers || {};
  const app = String(body?.app || "").toLowerCase();
  const action = body?.action || body?.pluginAction || body?.tool;
  const params = body?.params || body?.pluginParams || {};
  if (!app || !action) return { success: false, error: "app and action required" };

  let integration = null;
  try {
    integration = await getIntegrationFn(env, auth.userId, app);
  } catch (e) {
    return { success: false, error: e?.message || "getIntegration failed" };
  }
  if (!integration?.access_token) {
    return reauthPayload(app, auth.userId, workerBase);
  }

  let data = await runPluginApi(app, action, integration.access_token, params, { clientId });
  if (data?.status === 401 || data?.httpStatus === 401) {
    return reauthPayload(app, auth.userId, workerBase);
  }
  return { success: true, app, tool: action, action, data };
}
