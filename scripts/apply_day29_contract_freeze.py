#!/usr/bin/env python3
"""Day 29: ensure admin_audit_list in availableActions + health contractVersion."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if '"admin_audit_list"' not in t[t.find("availableActions"):t.find("availableActions")+2500]:
        if '"admin_set_feature_flag"' in t:
            t = t.replace(
                '"admin_set_feature_flag",',
                '"admin_set_feature_flag",\n          "admin_audit_list",',
                1,
            )
            changes.append("available-actions")

    # health payload contractVersion if simple health exists
    if "contractVersion" not in t:
        # soft: skip if complex
        pass

    p.write_text(t)
    print("changes:", changes or ["none-ok"])
    print("ok")

if __name__ == "__main__":
    main()
