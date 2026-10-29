#!/usr/bin/env python3
from pathlib import Path

MCP = [
    "mcp_connectors", "mcp_oauth_start", "mcp_tools_list", "mcp_tools_call",
    "mcp_custom_list", "mcp_custom_add", "mcp_custom_delete",
    "mcp_custom_oauth_start", "mcp_custom_tools_list", "mcp_custom_tools_call",
]

def main():
    w = Path("worker.ts")
    t = w.read_text()
    insert = ",\n          ".join(f'"{a}"' for a in MCP)
    old1 = '"execute_plugin"\n        ]'
    new1 = f'"execute_plugin",\n          {insert}\n        ]'
    if '"mcp_connectors"' not in t[t.find("availableActions"):t.find("availableActions")+800]:
        if old1 not in t:
            raise SystemExit("availableActions execute_plugin needle missing")
        t = t.replace(old1, new1, 1)
        print("block1 patched")
    else:
        print("block1 already has mcp")
    old2b = '"message_feedback", "user_profile", "agents_list", "image_gallery", "health", "clear_session"]'
    if old2b in t and "mcp_connectors" not in t[t.find("message_feedback"):t.find("message_feedback")+400]:
        mcp_csv = ", ".join(f'"{a}"' for a in MCP)
        new2b = f'"message_feedback", "user_profile", "agents_list", "image_gallery", "health", "clear_session", {mcp_csv}, "integration_status", "integration_connect", "integration_disconnect", "execute_plugin"]'
        t = t.replace(old2b, new2b, 1)
        print("block2 patched")
    w.write_text(t)
    print("done", w.stat().st_size)

if __name__ == "__main__":
    main()
