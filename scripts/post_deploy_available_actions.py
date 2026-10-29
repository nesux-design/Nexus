#!/usr/bin/env python3
"""Ensure MCP + custom MCP actions appear in worker availableActions."""
from pathlib import Path

MCP_ACTIONS = [
    "mcp_connectors",
    "mcp_oauth_start",
    "mcp_tools_list",
    "mcp_tools_call",
    "mcp_custom_list",
    "mcp_custom_add",
    "mcp_custom_delete",
    "mcp_custom_oauth_start",
    "mcp_custom_tools_list",
    "mcp_custom_tools_call",
]

def main():
    w = Path("worker.ts")
    t = w.read_text()
    changed = False

    # Pattern: "execute_plugin" then closing of availableActions array
    needle = '"execute_plugin"'
    if '"mcp_connectors"' in t and '"mcp_custom_list"' in t:
        print("availableActions already includes MCP actions")
    else:
        # Insert after execute_plugin in the unknown-action availableActions list
        insert = ',\n          '.join([f'"{a}"' for a in MCP_ACTIONS])
        # Prefer the error handler list (indented with 10 spaces inside JSON array)
        old = '"execute_plugin"\n        ]'
        new = f'"execute_plugin",\n          {insert}\n        ]'
        if old in t:
            t = t.replace(old, new, 1)
            changed = True
            print("patched availableActions (error handler)")
        else:
            # broader: after first execute_plugin occurrence that is followed by ]
            idx = t.find('"execute_plugin"')
            if idx < 0:
                raise SystemExit("execute_plugin not found")
            # find closing ] after this
            end = t.find(']', idx)
            chunk = t[idx:end]
            if 'mcp_connectors' in chunk:
                print("mcp already in first execute_plugin block")
            else:
                t = t[:idx] + f'"execute_plugin",\n          {insert}' + t[idx + len('"execute_plugin"'):]
                changed = True
                print("patched availableActions (fallback)")

    # Documentation GET root availableActions if present without mcp
    if '"execute_plugin"' in t and '"mcp_connectors"' not in t[t.find('availableActions'):t.find('availableActions')+2000]:
        pass  # first block already handled

    if changed:
        w.write_text(t)
    print("done", w.stat().st_size)

if __name__ == "__main__":
    main()
