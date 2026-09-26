export const CONNECTOR_TOOL_REGISTRY = {
  discord:{authHeader:"Bearer",tools:[
    {name:"get_user",description:"Get Discord user profile",scopes:["identify"],action:"get_user"},
    {name:"list_guilds",description:"List Discord servers",scopes:["guilds"],action:"list_guilds"},
    {name:"list_guild_channels",description:"List channels in a server",scopes:["guilds"],action:"list_channels",params:["guildId"]},
    {name:"get_guild",description:"Get server details",scopes:["guilds"],action:"get_guild",params:["guildId"]}]},
  spotify:{authHeader:"Bearer",tools:[
    {name:"get_profile",description:"Spotify profile",scopes:["user-read-private"],action:"get_profile"},
    {name:"get_playback",description:"Current playback",scopes:["user-read-playback-state"],action:"get_playback"},
    {name:"get_top_tracks",description:"Top tracks",scopes:["user-top-read"],action:"get_top_tracks"}]},
  github:{authHeader:"Bearer",tools:[
    {name:"get_user",description:"GitHub user",scopes:[],action:"get_user"},
    {name:"list_repos",description:"List repositories",scopes:["repo"],action:"list_repos"}]},
  notion:{authHeader:"Bearer",tools:[
    {name:"list_pages",description:"List Notion pages",scopes:[],action:"list_pages"},
    {name:"get_page",description:"Get Notion page",scopes:[],action:"get_page",params:["pageId"]}]},
  slack:{authHeader:"Bearer",tools:[
    {name:"list_channels",description:"List Slack channels",scopes:["channels:read"],action:"list_channels"},
    {name:"post_message",description:"Post Slack message",scopes:["chat:write"],action:"post_message",params:["channel","text"]}]},
  reddit:{authHeader:"Bearer",tools:[
    {name:"get_me",description:"Reddit identity",scopes:["identity"],action:"get_me"},
    {name:"list_subs",description:"List subscribed subreddits",scopes:["mysubreddits"],action:"list_subs"}]},
  zoom:{authHeader:"Bearer",tools:[
    {name:"get_user",description:"Zoom user",scopes:["user:read"],action:"get_user"},
    {name:"list_meetings",description:"List meetings",scopes:["meeting:read"],action:"list_meetings"}]},
  twitch:{authHeader:"Bearer",tools:[{name:"get_user",description:"Twitch user",scopes:["user:read:email"],action:"get_user"}]},
  twitter:{authHeader:"Bearer",tools:[{name:"get_me",description:"X profile",scopes:["tweet.read","users.read"],action:"get_me"}]},
  mailchimp:{authHeader:"Bearer",tools:[{name:"list_audiences",description:"List audiences",scopes:[],action:"list_audiences"}]},
  linkedin:{authHeader:"Bearer",tools:[{name:"get_profile",description:"LinkedIn profile",scopes:["r_liteprofile"],action:"get_profile"}]},
  dropbox:{authHeader:"Bearer",tools:[{name:"list_folder",description:"List folder",scopes:[],action:"list_folder"}]},
  linear:{authHeader:"Bearer",tools:[{name:"list_issues",description:"List issues",scopes:[],action:"list_issues"}]},
  asana:{authHeader:"Bearer",tools:[{name:"list_tasks",description:"List tasks",scopes:[],action:"list_tasks"}]},
  figma:{authHeader:"Bearer",tools:[{name:"get_me",description:"Figma user",scopes:[],action:"get_me"}]},
  canva:{authHeader:"Bearer",tools:[{name:"list_designs",description:"List designs",scopes:["design:meta:read"],action:"list_designs"}]}
};
export function getConnectorRegistryEntry(app){return CONNECTOR_TOOL_REGISTRY[String(app||"").toLowerCase()]||null;}
export function parseGrantedScopes(raw){if(!raw)return[];if(Array.isArray(raw))return raw.map(String).filter(Boolean);return String(raw).replace(/,/g," ").split(" ").map(s=>s.trim()).filter(Boolean);}
export function scopesAllow(granted,required){const req=required||[];if(!req.length)return true;const g={};(granted||[]).forEach(s=>{g[String(s).toLowerCase()]=true;});if(!Object.keys(g).length)return true;return req.every(s=>!!g[String(s).toLowerCase()]);}
export async function getMcpStyleTools(env,userId,listIntegrationsFn){const available=[];let integrations=[];try{integrations=await listIntegrationsFn(env,userId);}catch{return available;}if(!Array.isArray(integrations))integrations=[];for(const integ of integrations){const app=String(integ.app_name||integ.app||"").toLowerCase();if(!app)continue;const reg=getConnectorRegistryEntry(app);if(!reg?.tools)continue;const granted=parseGrantedScopes(integ.scope||integ.scopes||integ.token_scope||"");for(const tool of reg.tools)available.push({app,tool:tool.name,action:tool.action||tool.name,description:tool.description||tool.name,required_scopes:tool.scopes||[],granted_scopes:granted,scopes_ok:scopesAllow(granted,tool.scopes),params:tool.params||[],connected:true});}return available;}
export function formatMcpStyleToolsForThinking(tools){if(!tools?.length)return"Connected plugins: none.";return"Connected plugins (MCP-style): "+tools.map(t=>"- "+t.app+"."+t.tool+": "+t.description+" [scopes_ok="+t.scopes_ok+"]").join("; ")+". Use execute_plugin when scopes_ok=true";}
const KEYWORDS={list_guilds:["discord server","discord servers","my servers","guilds","my guilds","discord servers dikhao"],get_user:["discord profile","my discord","who am i on discord","discord user","zoom user","twitch"],get_profile:["spotify profile","my spotify","linkedin profile"],get_playback:["now playing","spotify playing","current song","what is playing","ab kya chal raha"],get_top_tracks:["top tracks","spotify top","favourite songs"],list_repos:["my repos","github repos","list repositories","my repositories","github dikhao"],list_pages:["notion pages","my notion","notion dikhao"],list_channels:["slack channels","my slack channels","slack dikhao"],post_message:["slack message","send slack"],get_me:["reddit profile","my reddit","twitter profile","x profile","figma profile"],list_subs:["my subreddits","reddit subs"],list_meetings:["zoom meetings","my meetings","zoom dikhao"],list_audiences:["mailchimp","audiences"],list_folder:["dropbox","my dropbox"],list_issues:["linear issues"],list_tasks:["asana tasks"],list_designs:["canva designs","my canva"]};
export function matchConnectorToolFromMessage(message,tools){if(!message||!tools?.length)return null;const msg=String(message).toLowerCase();for(const t of tools){if(!t.scopes_ok)continue;for(const k of(KEYWORDS[t.tool]||KEYWORDS[t.action]||[]))if(msg.includes(k))return t;if(msg.includes(t.app)&&(msg.includes("list")||msg.includes("show")||msg.includes("get")||msg.includes("dikhao")||msg.includes("batao"))&&(t.tool.startsWith("list")||t.tool.startsWith("get_")))return t;}return null;}
export function reauthPayload(app,userId,workerBase="https://nexus-a1.apikeyakhilka.workers.dev"){const url=workerBase+"/oauth/"+app+"?userId="+encodeURIComponent(userId||"");return{success:false,error:"reauth_required",app,message:"Please reconnect this app",reauth_url:url,reauth_ui:{title:"Reconnect "+app,action:"open_oauth",url}};}
async function connectorFetchJson(url,init={}){const response=await fetch(url,init);const ct=response.headers.get("Content-Type")||"";const data=ct.includes("application/json")?await response.json().catch(()=>({})):await response.text();return response.status===401?{...(typeof data==="object"?data:{error:data}),status:401}:data;}
export async function runConnectorApiAction(app,action,token,params={},opts={}){const headers={Authorization:"Bearer "+token,Accept:"application/json"};const p=params||{};
if(app==="discord"){if(action==="get_user")return connectorFetchJson("https://discord.com/api/v10/users/@me",{headers});if(action==="list_guilds")return connectorFetchJson("https://discord.com/api/v10/users/@me/guilds",{headers});if(action==="list_channels"||action==="list_guild_channels"){if(!p.guildId)return{error:"guildId required"};return connectorFetchJson("https://discord.com/api/v10/guilds/"+p.guildId+"/channels",{headers});}if(action==="get_guild"){if(!p.guildId)return{error:"guildId required"};return connectorFetchJson("https://discord.com/api/v10/guilds/"+p.guildId,{headers});}}
if(app==="spotify"){if(action==="get_profile")return connectorFetchJson("https://api.spotify.com/v1/me",{headers});if(action==="get_playback")return connectorFetchJson("https://api.spotify.com/v1/me/player",{headers});if(action==="get_top_tracks")return connectorFetchJson("https://api.spotify.com/v1/me/top/tracks?limit=10",{headers});}
if(app==="github"){const gh={...headers,"User-Agent":"nexus-a1",Accept:"application/vnd.github+json"};if(action==="get_user")return connectorFetchJson("https://api.github.com/user",{headers:gh});if(action==="list_repos")return connectorFetchJson("https://api.github.com/user/repos?per_page=20",{headers:gh});}
if(app==="notion"){const nh={...headers,"Notion-Version":"2022-06-28","Content-Type":"application/json"};if(action==="list_pages")return connectorFetchJson("https://api.notion.com/v1/search",{method:"POST",headers:nh,body:"{}"});if(action==="get_page"){if(!p.pageId)return{error:"pageId required"};return connectorFetchJson("https://api.notion.com/v1/pages/"+p.pageId,{headers:nh});}}
if(app==="slack"){if(action==="list_channels")return connectorFetchJson("https://slack.com/api/conversations.list",{headers});if(action==="post_message")return connectorFetchJson("https://slack.com/api/chat.postMessage",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({channel:p.channel,text:p.text||""})});}
if(app==="reddit"){const rh={...headers,"User-Agent":"nexus-a1/1.0"};if(action==="get_me")return connectorFetchJson("https://oauth.reddit.com/api/v1/me",{headers:rh});if(action==="list_subs")return connectorFetchJson("https://oauth.reddit.com/subreddits/mine/subscriber",{headers:rh});}
if(app==="zoom"){if(action==="get_user")return connectorFetchJson("https://api.zoom.us/v2/users/me",{headers});if(action==="list_meetings")return connectorFetchJson("https://api.zoom.us/v2/users/me/meetings",{headers});}
if(app==="twitch"){const th={...headers,"Client-Id":opts.clientId||""};if(action==="get_user")return connectorFetchJson("https://api.twitch.tv/helix/users",{headers:th});}
if(app==="twitter"&&action==="get_me")return connectorFetchJson("https://api.twitter.com/2/users/me",{headers});
if(app==="dropbox"&&action==="list_folder")return connectorFetchJson("https://api.dropboxapi.com/2/files/list_folder",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({path:p.path||""})});
if(app==="figma"&&action==="get_me")return connectorFetchJson("https://api.figma.com/v1/me",{headers});
if(app==="linkedin"&&action==="get_profile")return connectorFetchJson("https://api.linkedin.com/v2/userinfo",{headers});
return{error:"Unsupported action "+app+"."+action};}
