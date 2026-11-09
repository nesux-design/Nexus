#!/usr/bin/env python3
"""Fix broken join/history strings from day14 thread model patch."""
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()

    broken = (
        '          const hist = conversationMessages.slice(-20).map((m) => (m.role || "user") + ": " + String(m.content || "").substring(0, 500)).join("\n'
        '");\n'
        '          if (hist) sessionContext = sessionContext + "\n'
        '\n'
        '**Conversation history:**\n'
        '" + hist;'
    )
    # Actual file has real newlines inside string literals
    broken_real = (
        "          const hist = conversationMessages.slice(-20).map((m) => (m.role || \"user\") + \": \" + String(m.content || \"\").substring(0, 500)).join(\"\n"
        "\");\n"
        "          if (hist) sessionContext = sessionContext + \"\n"
        "\n"
        "**Conversation history:**\n"
        "\" + hist;"
    )

    fixed = (
        '          const hist = conversationMessages.slice(-20).map((m) => (m.role || "user") + ": " + String(m.content || "").substring(0, 500)).join("\\n");\n'
        '          if (hist) sessionContext = sessionContext + "\\n\\n**Conversation history:**\\n" + hist;'
    )

    # Prefer exact match from read lines pattern
    broken2 = '''          const hist = conversationMessages.slice(-20).map((m) => (m.role || "user") + ": " + String(m.content || "").substring(0, 500)).join("
");
          if (hist) sessionContext = sessionContext + "

**Conversation history:**
" + hist;'''

    fixed2 = '''          const hist = conversationMessages.slice(-20).map((m) => (m.role || "user") + ": " + String(m.content || "").substring(0, 500)).join("\\n");
          if (hist) sessionContext = sessionContext + "\\n\\n**Conversation history:**\\n" + hist;'''

    if broken2 in t:
        t = t.replace(broken2, fixed2, 1)
        print("fixed via broken2")
    elif ").join(\"\n" in t or '.join("' in t and '**Conversation history:**' in t:
        # line-based repair
        lines = t.splitlines(keepends=True)
        out = []
        i = 0
        fixed_any = False
        while i < len(lines):
            if 'substring(0, 500)).join("' in lines[i] and not lines[i].rstrip().endswith(');'):
                # consume until hist; assignment complete
                j = i
                buf = lines[i]
                j += 1
                while j < len(lines) and '" + hist;' not in lines[j-1] and not (j > i and '" + hist;' in lines[j]):
                    buf += lines[j]
                    if '" + hist;' in lines[j]:
                        j += 1
                        break
                    j += 1
                else:
                    # if last line had hist
                    pass
                out.append(
                    '          const hist = conversationMessages.slice(-20).map((m) => (m.role || "user") + ": " + String(m.content || "").substring(0, 500)).join("\\n");\n'
                    '          if (hist) sessionContext = sessionContext + "\\n\\n**Conversation history:**\\n" + hist;\n'
                )
                fixed_any = True
                i = j
                continue
            out.append(lines[i])
            i += 1
        if not fixed_any:
            raise SystemExit("could not line-fix")
        t = "".join(out)
        print("fixed via line scan")
    else:
        raise SystemExit("broken block not found")

    p.write_text(t)

    # verify
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('.join("') or line.rstrip().endswith('sessionContext + "'):
            raise SystemExit(f"still broken line {li}: {line!r}")
    assert 'join("\\n")' in t or 'join("\n")' in t or '.join("\\n")' in t or ".join(\"\\n\")" in t or '.join("\\n")' in t
    # at least fixed form with backslash-n in source
    if 'substring(0, 500)).join("\\n")' not in t and "substring(0, 500)).join(\"\\n\")" not in t:
        # check for correct JS source: join("\n") as chars backslash n
        if ').join("\n");' not in t and ').join("\\n");' not in t:
            # read back
            idx = t.find('substring(0, 500)).join(')
            print(repr(t[idx:idx+40]))
            raise SystemExit("join still wrong")
    print("ok")

if __name__ == "__main__":
    main()
