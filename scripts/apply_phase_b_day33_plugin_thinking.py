#!/usr/bin/env python3
"""Phase B Day 33: force-route thinking_steps + richer plugin keywords. Does not touch Groq/search/embedding."""
from pathlib import Path

def main():
    wp = Path("worker.ts")
    op = Path("oauth-plugins.js")
    t = wp.read_text()
    o = op.read_text()
    changes = []

    if "PHASE_B_DAY33" in t and "mere discord" in o:
        print("already applied")
        return

    old_kw = 'KEYWORDS={list_guilds:["discord servers","my servers","guilds","list guilds"],get_user:["discord profile"],get_playback:["now playing","spotify playing"],get_top_tracks:["top tracks","spotify top"],get_profile:["spotify profile","mera spotify"],list_repos:["github repos","my repos"],list_pages:["notion pages"],list_channels:["slack channels"]};'
    new_kw = 'KEYWORDS={list_guilds:["discord servers","my servers","guilds","list guilds","mere discord","discord server","servers dikhao","discord dikhao"],get_user:["discord profile","mera discord","discord profile batao","my discord"],list_channels:["slack channels","mere slack","slack channel","channels dikhao"],post_message:["slack message","post to slack","slack pe bhejo"],get_playback:["now playing","spotify playing","kya chal raha","currently playing"],get_top_tracks:["top tracks","spotify top","mere top tracks","top songs"],get_profile:["spotify profile","mera spotify","my spotify"],list_repos:["github repos","my repos","mere github","github repository","repos dikhao"],list_pages:["notion pages","mere notion","notion dikhao"],list_folder:["dropbox","dropbox folder","mere dropbox"],list_issues:["linear issues","mere linear"],list_tasks:["asana tasks","mere asana"],get_me:["twitter profile","x profile","mera twitter","my twitter","reddit profile"],list_designs:["canva designs","mere canva"],get_me_figma:["figma","mera figma"]};'
    if old_kw in o:
        o = o.replace(old_kw, new_kw, 1)
        changes.append("keywords")
    elif "mere discord" not in o:
        raise SystemExit("KEYWORDS not found")

    old_f = '''    if (forced && forced.scopes_ok) {
      thinking.action = "execute_plugin";
      thinking.args = { app: forced.app, action: forced.action || forced.tool };
      thinking.reasoning = (thinking.reasoning || "") + " | Forced plugin: " + forced.app + "." + (forced.action || forced.tool);
      thinking.confidence = Math.max(thinking.confidence || 0, 0.92);
    }'''
    new_f = '''    if (forced && forced.scopes_ok) {
      thinking.action = "execute_plugin";
      thinking.args = { app: forced.app, action: forced.action || forced.tool };
      thinking.reasoning = (thinking.reasoning || "") + " | Forced plugin: " + forced.app + "." + (forced.action || forced.tool);
      thinking.confidence = Math.max(thinking.confidence || 0, 0.92);
      // PHASE_B_DAY33 — Claude-style steps when force-route wins
      if (typeof buildPluginThinkingSteps === "function") {
        thinking.thinking_steps = buildPluginThinkingSteps({
          message: message,
          tools: thinking.connected_tools,
          matched: forced,
          result: null,
          phase: "forced"
        });
      }
    }'''
    if old_f in t:
        t = t.replace(old_f, new_f, 1)
        changes.append("force-steps")
    else:
        raise SystemExit("force plugin block missing")

    old_m = '''    if (forcedMcp) {
      thinking.action = "execute_mcp";
      thinking.args = { connector: forcedMcp.connector, tool: forcedMcp.name };
      thinking.reasoning = (thinking.reasoning || "") + " | Forced MCP: " + forcedMcp.connector + "." + forcedMcp.name;
      thinking.confidence = Math.max(thinking.confidence || 0, 0.9);
    }'''
    new_m = '''    if (forcedMcp) {
      thinking.action = "execute_mcp";
      thinking.args = { connector: forcedMcp.connector, tool: forcedMcp.name };
      thinking.reasoning = (thinking.reasoning || "") + " | Forced MCP: " + forcedMcp.connector + "." + forcedMcp.name;
      thinking.confidence = Math.max(thinking.confidence || 0, 0.9);
      if (typeof buildMcpThinkingSteps === "function") {
        thinking.thinking_steps = buildMcpThinkingSteps({
          message: message,
          tools: thinking.mcp_tools,
          matched: forcedMcp,
          result: null,
          phase: "forced"
        });
      } else if (typeof buildPluginThinkingSteps === "function") {
        thinking.thinking_steps = buildPluginThinkingSteps({
          message: message,
          tools: thinking.connected_tools || [],
          matched: { app: forcedMcp.connector, tool: forcedMcp.name, action: forcedMcp.name },
          result: null,
          phase: "forced"
        });
      }
    }'''
    if old_m in t:
        t = t.replace(old_m, new_m, 1)
        changes.append("mcp-force-steps")

    old_env = "thinking: response.thinking,\n        intent: thinking.action,"
    new_env = "thinking: response.thinking,\n        thinking_steps: thinking.thinking_steps || [],\n        connected_tools: thinking.connected_tools || [],\n        intent: thinking.action,"
    if old_env in t and "thinking_steps: thinking.thinking_steps" not in t:
        t = t.replace(old_env, new_env)
        changes.append("envelope")

    wp.write_text(t)
    op.write_text(o)
    print("changes:", changes)
    if not changes:
        raise SystemExit("no changes")
    print("ok")

if __name__ == "__main__":
    main()
