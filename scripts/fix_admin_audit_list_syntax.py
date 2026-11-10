#!/usr/bin/env python3
"""Fix day29 mistake: admin_audit_list was inserted inside appendAuditLog object."""
from pathlib import Path
import re

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    t2, n = re.subn(
        r'(action:\s*"admin_set_feature_flag",)\s*\n\s*"admin_audit_list",\s*\n',
        r"\1\n",
        t,
    )
    if n:
        t = t2
        changes.append(f"removed_corrupt:{n}")

    # catalog entry with safe neighbors only
    if '"admin_audit_list"' not in t[t.find("availableActions"): t.find("availableActions") + 3500]:
        old = '          "admin_set_feature_flag",\n          "clear_session",'
        new = '          "admin_set_feature_flag",\n          "admin_audit_list",\n          "clear_session",'
        if old in t:
            t = t.replace(old, new, 1)
            changes.append("catalog")
        else:
            old2 = '          "feature_flags",\n          "admin_set_feature_flag",'
            if old2 in t:
                t = t.replace(old2, old2 + '\n          "admin_audit_list",', 1)
                changes.append("catalog-alt")

    if re.search(r'action:\s*"admin_set_feature_flag",\s*\n\s*"admin_audit_list",', t):
        raise SystemExit("still corrupt")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        print("already clean")
        return
    print("ok")

if __name__ == "__main__":
    main()
