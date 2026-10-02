#!/usr/bin/env python3
from pathlib import Path
import sys
p = Path("oauth-plugins.js")
t = p.read_text()
if "api.twitch.tv/helix/users" in t:
    print("Already fixed")
    sys.exit(0)

old = 'if(app==="dropbox"&&action==="list_folder")return apiJson("https://api.dropboxapi.com/2/files/list_folder",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({path:p.path||""})});return{error:`Unsupported ${app}.${action}`};}'

new = r'''if(app==="dropbox"&&action==="list_folder")return apiJson("https://api.dropboxapi.com/2/files/list_folder",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({path:p.path||""})});
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
return{error:`Unsupported ${app}.${action}`};}'''

if old not in t:
    sys.exit("runPluginApi dropbox block missing")
t = t.replace(old, new, 1)
assert "api.twitch.tv/helix/users" in t
p.write_text(t)
print("OK", len(t))
