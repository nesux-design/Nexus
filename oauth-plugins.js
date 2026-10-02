/** Nexus A1 — Claude/ChatGPT/Grok style plugins; LLM chooses tools */
export const PLUGIN_TOOL_REGISTRY = {
  discord: { tools: [
    { name: "get_user", description: "Get Discord user profile", scopes: ["identify"], action: "get_user" },
    { name: "list_guilds", description: "List Discord servers/guilds the user is in. Use for servers, guilds, communities.", scopes: ["guilds"], action: "list_guilds" },
    { name: "list_channels", description: "List channels in a Discord server. Needs guildId.", scopes: ["guilds"], action: "list_channels", params: ["guildId"] },
    { name: "get_guild", description: "Get one Discord server details. Needs guildId.", scopes: ["guilds"], action: "get_guild", params: ["guildId"] }
  ]},
  spotify: { tools: [
    { name: "get_profile", description: "Spotify profile", scopes: ["user-read-private"], action: "get_profile" },
    { name: "get_playback", description: "Currently playing on Spotify", scopes: ["user-read-playback-state"], action: "get_playback" },
    { name: "get_top_tracks", description: "Top Spotify tracks", scopes: ["user-top-read"], action: "get_top_tracks" }
  ]},
  github: { tools: [
    { name: "get_user", description: "GitHub user", scopes: [], action: "get_user" },
    { name: "list_repos", description: "List GitHub repos", scopes: ["repo"], action: "list_repos" }
  ]},
  notion: { tools: [
    { name: "list_pages", description: "List/search Notion pages", scopes: [], action: "list_pages" },
    { name: "get_page", description: "Get Notion page", scopes: [], action: "get_page", params: ["pageId"] }
  ]},
  slack: { tools: [
    { name: "list_channels", description: "List Slack channels", scopes: ["channels:read"], action: "list_channels" },
    { name: "post_message", description: "Post Slack message", scopes: ["chat:write"], action: "post_message", params: ["channel", "text"] }
  ]},
  reddit: { tools: [
    { name: "get_me", description: "Reddit identity", scopes: ["identity"], action: "get_me" },
    { name: "list_subs", description: "Subscribed subreddits", scopes: ["mysubreddits"], action: "list_subs" }
  ]},
  zoom: { tools: [
    { name: "get_user", description: "Zoom user", scopes: ["user:read"], action: "get_user" },
    { name: "list_meetings", description: "List Zoom meetings", scopes: ["meeting:read"], action: "list_meetings" }
  ]},
  twitch: { tools: [{ name: "get_user", description: "Twitch user", scopes: ["user:read:email"], action: "get_user" }] },
  twitter: { tools: [{ name: "get_me", description: "X/Twitter profile", scopes: ["tweet.read", "users.read"], action: "get_me" }] },
  linkedin: { tools: [{ name: "get_profile", description: "LinkedIn profile", scopes: ["r_liteprofile"], action: "get_profile" }] },
  dropbox: { tools: [{ name: "list_folder", description: "List Dropbox folder", scopes: [], action: "list_folder" }] },
  figma: { tools: [{ name: "get_me", description: "Figma user", scopes: [], action: "get_me" }] },
  linear: { tools: [{ name: "list_issues", description: "List Linear issues", scopes: [], action: "list_issues" }] },
  asana: { tools: [{ name: "list_tasks", description: "List Asana tasks", scopes: [], action: "list_tasks" }] },
  mailchimp: { tools: [{ name: "list_audiences", description: "List Mailchimp audiences", scopes: [], action: "list_audiences" }] },
  canva: { tools: [{ name: "list_designs", description: "List Canva designs", scopes: ["design:meta:read"], action: "list_designs" }] }
};
export function parseScopes(raw){if(!raw)return[];if(Array.isArray(raw))return raw.map(String).filter(Boolean);return String(raw).replace(/,/g," ").split(/\s+/).map(s=>s.trim()).filter(Boolean);}
export function scopesOk(granted,required){const req=required||[];if(!req.length)return true;const g=new Set((granted||[]).map(s=>String(s).toLowerCase()));if(!g.size)return true;return req.every(s=>g.has(String(s).toLowerCase()));}
export async function getPluginToolsForUser(env,userId,listIntegrationsFn){const out=[];let rows=[];try{rows=await listIntegrationsFn(env,userId);}catch{return out;}if(!Array.isArray(rows))rows=[];for(const row of rows){const app=String(row.app_name||row.app||"").toLowerCase();if(!app||!PLUGIN_TOOL_REGISTRY[app])continue;const granted=parseScopes(row.scope||row.scopes||row.token_scope||"");for(const tool of PLUGIN_TOOL_REGISTRY[app].tools)out.push({app,tool:tool.name,action:tool.action||tool.name,description:tool.description,required_scopes:tool.scopes||[],granted_scopes:granted,scopes_ok:scopesOk(granted,tool.scopes),params:tool.params||[],connected:true});}return out;}
export function pluginToolsToGeminiDeclarations(tools){const decls=[];for(const t of tools||[]){if(!t.scopes_ok)continue;const props={};const required=[];for(const p of t.params||[]){props[p]={type:"string",description:p};required.push(p);}decls.push({name:`plugin_${t.app}_${t.action||t.tool}`,description:`[Connected plugin: ${t.app}] ${t.description}. Only use if the user needs live data from ${t.app}.`,parameters:{type:"object",properties:props,...(required.length?{required}:{})}});}return decls;}
export function pluginToolsToOpenAITools(tools){return pluginToolsToGeminiDeclarations(tools).map(d=>({type:"function",function:{name:d.name,description:d.description,parameters:d.parameters}}));}
export function parsePluginFunctionName(name){const n=String(name||"");if(!n.startsWith("plugin_"))return null;const rest=n.slice(7);const i=rest.indexOf("_");if(i<0)return null;return{app:rest.slice(0,i),action:rest.slice(i+1)};}
export function formatPluginsForThinking(tools){
  if (!tools?.length) return "No connected plugins.";
  const apps = [...new Set(tools.filter(t => t.scopes_ok).map(t => t.app))];
  return apps.length ? ("Connected apps: " + apps.join(", ") + ".") : "No connected plugins.";
}
export function buildPluginThinkingSteps({ message, tools, matched, result, phase }) {
  const steps = [];
  const msg = String(message || "").trim().slice(0, 120);
  if (msg) steps.push({ title: "Understanding request", detail: msg, status: "done" });
  const apps = [...new Set((tools || []).filter(t => t.scopes_ok).map(t => t.app))];
  if (apps.length) steps.push({ title: "Checking connected apps", detail: apps.join(", "), status: "done" });
  if (phase === "model_decide" || matched) {
    steps.push({ title: "Selecting tool", detail: matched ? (matched.app + "." + (matched.tool || matched.action)) : "auto", status: "done" });
  }
  if (matched) {
    const raw = matched.description ? String(matched.description).split("\n")[0] : "";
    const label = raw.length && raw.length < 80 ? raw : ((matched.app || "") + "." + (matched.tool || matched.action || ""));
    steps.push({ title: "Running " + (matched.app || "plugin") + " tool", detail: label, status: "done" });
  }
  if (result) {
    if (result.error === "reauth_required") {
      steps.push({ title: "Needs reconnection", detail: result.app || "", status: "blocked" });
    } else if (result.success === false || result.error) {
      steps.push({ title: "Tool failed", detail: String(result.error || result.message || "").slice(0, 100), status: "error" });
    } else {
      const data = result.data;
      let summary = (result.app || matched?.app || "") + "." + (result.tool || result.action || matched?.tool || "");
      if (Array.isArray(data)) summary += " → " + data.length + " items";
      steps.push({ title: "Got live data", detail: summary, status: "done" });
      steps.push({ title: "Writing answer", detail: "From live data", status: "done" });
    }
  }
  return steps;
}
export function thinkingStepsToText(steps){return(steps||[]).map((s,i)=>`${i+1}. ${s.title}${s.detail?": "+s.detail:""}`).join("\n");}
const KEYWORDS={list_guilds:["discord servers","my servers","guilds","list guilds"],get_user:["discord profile"],get_playback:["now playing","spotify playing"],get_top_tracks:["top tracks","spotify top"],get_profile:["spotify profile","mera spotify"],list_repos:["github repos","my repos"],list_pages:["notion pages"],list_channels:["slack channels"]};
export function matchPluginFromMessage(message,tools){if(!message||!tools?.length)return null;const msg=String(message).toLowerCase();const ordered=[...tools].sort((a,b)=>(String(a.tool).startsWith("list")?0:1)-(String(b.tool).startsWith("list")?0:1));for(const t of ordered){if(!t.scopes_ok)continue;for(const k of KEYWORDS[t.tool]||KEYWORDS[t.action]||[])if(msg.includes(k))return t;}return null;}
export function reauthPayload(app,userId,workerBase="https://nexus-a1.apikeyakhilka.workers.dev"){const url=`${workerBase}/oauth/${app}?userId=${encodeURIComponent(userId||"")}`;return{success:false,error:"reauth_required",app,message:`Please reconnect ${app}`,reauth_url:url,reauth_ui:{title:`Reconnect ${app}`,action:"open_oauth",url}};}
async function apiJson(url, init = {}) {
  const res = await fetch(url, init);
  const ct = res.headers.get("Content-Type") || "";
  let data;
  try {
    data = ct.includes("json") ? await res.json() : await res.text();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const msg = typeof data === "object" && data
      ? (data.error?.message || data.error || data.message || JSON.stringify(data))
      : String(data || res.statusText);
    return {
      error: msg,
      status: res.status,
      httpStatus: res.status,
      spotify_error: typeof data === "object" ? data : { message: msg }
    };
  }
  return data;
}
export async function runPluginApi(app,action,token,params={},opts={}){const headers={Authorization:`Bearer ${token}`,Accept:"application/json"};const p=params||{};if(app==="discord"){if(action==="get_user")return apiJson("https://discord.com/api/v10/users/@me",{headers});if(action==="list_guilds")return apiJson("https://discord.com/api/v10/users/@me/guilds",{headers});if(action==="list_channels"||action==="list_guild_channels"){if(!p.guildId)return{error:"guildId required"};return apiJson(`https://discord.com/api/v10/guilds/${p.guildId}/channels`,{headers});}if(action==="get_guild"){if(!p.guildId)return{error:"guildId required"};return apiJson(`https://discord.com/api/v10/guilds/${p.guildId}`,{headers});}}if(app==="spotify"){if(action==="get_profile")return apiJson("https://api.spotify.com/v1/me",{headers});if(action==="get_playback")return apiJson("https://api.spotify.com/v1/me/player",{headers});if(action==="get_top_tracks")return apiJson("https://api.spotify.com/v1/me/top/tracks?limit=10",{headers});}if(app==="github"){const gh={...headers,"User-Agent":"nexus-a1",Accept:"application/vnd.github+json"};if(action==="get_user")return apiJson("https://api.github.com/user",{headers:gh});if(action==="list_repos")return apiJson("https://api.github.com/user/repos?per_page=20",{headers:gh});}if(app==="notion"){const nh={...headers,"Notion-Version":"2022-06-28","Content-Type":"application/json"};if(action==="list_pages")return apiJson("https://api.notion.com/v1/search",{method:"POST",headers:nh,body:"{}"});if(action==="get_page"){if(!p.pageId)return{error:"pageId required"};return apiJson(`https://api.notion.com/v1/pages/${p.pageId}`,{headers:nh});}}if(app==="slack"){if(action==="list_channels")return apiJson("https://slack.com/api/conversations.list",{headers});if(action==="post_message")return apiJson("https://slack.com/api/chat.postMessage",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({channel:p.channel,text:p.text||""})});}if(app==="twitter"&&action==="get_me")return apiJson("https://api.twitter.com/2/users/me",{headers});if(app==="figma"&&action==="get_me")return apiJson("https://api.figma.com/v1/me",{headers});if(app==="linkedin"&&action==="get_profile")return apiJson("https://api.linkedin.com/v2/userinfo",{headers});if(app==="dropbox"&&action==="list_folder")return apiJson("https://api.dropboxapi.com/2/files/list_folder",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({path:p.path||""})});
if(app==="twitch"){
  const cid=opts.clientId||opts.client_id||"";
  const th={...headers,"Client-Id":cid};
  if(action==="get_user")return apiJson("https://api.twitch.tv/helix/users",{headers:th});
}
if(app==="linear"){
  if(action==="list_issues"){
    return apiJson("https://api.linear.app/graphql",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({query:"{ issues(first: 15) { nodes { id title identifier url state { name } } } }"})});
  }
}
if(app==="asana"){
  if(action==="list_tasks"||action==="get_user"){
    const me=await apiJson("https://app.asana.com/api/1.0/users/me",{headers});
    if(me.error||me.httpStatus)return me;
    if(action==="get_user")return me;
    const ws=(me.data&&me.data.workspaces&&me.data.workspaces[0]&&me.data.workspaces[0].gid)||(me.workspaces&&me.workspaces[0]&&me.workspaces[0].gid)||"";
    if(!ws)return{error:"No Asana workspace found",data:me};
    return apiJson(`https://app.asana.com/api/1.0/tasks?assignee=me&workspace=${ws}&limit=20&opt_fields=name,completed,due_on,permalink_url`,{headers});
  }
}
if(app==="canva"&&action==="list_designs")return apiJson("https://api.canva.com/rest/v1/designs?limit=25",{headers});
return{error:`Unsupported ${app}.${action}`};}
export async function executePluginLayer(env,auth,body,helpers){const{getIntegrationFn,workerBase,clientId}=helpers||{};const app=String(body?.app||"").toLowerCase();const action=body?.action||body?.pluginAction||body?.tool;const params=body?.params||body?.pluginParams||{};if(!app||!action)return{success:false,error:"app and action required"};let integration=null;try{integration=await getIntegrationFn(env,auth.userId,app);}catch(e){return{success:false,error:e?.message||"getIntegration failed"};}if(!integration?.access_token)return reauthPayload(app,auth.userId,workerBase);const data=await runPluginApi(app,action,integration.access_token,params,{clientId});if(data?.status===401||data?.httpStatus===401)return reauthPayload(app,auth.userId,workerBase);if(data?.error||(data?.httpStatus&&data.httpStatus>=400))return{success:false,error:data.error||("HTTP "+data.httpStatus),data};return{success:true,app,tool:action,action,data};}
export function buildPluginAnswerPrompt(userMessage,app,action,data){const payload=typeof data==="string"?data:JSON.stringify(data,null,2);return`You are NEXUS, a premium AI assistant (Claude / ChatGPT / Grok quality).

The user asked: "${userMessage}"

You already called the connected plugin tool: ${app}.${action}
Here is the live API result (JSON). Do NOT invent facts not in this data.

\`\`\`json
${payload.substring(0,12000)}
\`\`\`

Write a clear, helpful answer:
- Same language as the user (Hindi/English/Hinglish).
- Lead with the answer; lists as bullets.
- If this is an API error (403, premium required, invalid token), explain simply what the user should do (reconnect app / check Spotify Developer Dashboard).
- No raw JSON dump. Top-tier SaaS AI tone, not a debug log.`;}
