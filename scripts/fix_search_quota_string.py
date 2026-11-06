#!/usr/bin/env python3
from pathlib import Path

def main():
    p = Path("worker.ts")
    t = p.read_text()
    # Exact broken multi-line string in source file
    broken = (
        "      enrichedContext = \"\n"
        "\n"
        "(Live web search skipped: daily search limit reached for this plan.)\n"
        "\" + enrichedContext;"
    )
    fixed = (
        '      enrichedContext = "\\n\\n(Live web search skipped: daily search limit reached for this plan.)\\n" + enrichedContext;'
    )
    if broken not in t:
        # try normalized newlines
        broken2 = broken.replace("\n", "\r\n")
        if broken2 in t:
            t = t.replace(broken2, fixed, 1)
        else:
            # line scanner
            lines = t.splitlines(keepends=True)
            out = []
            i = 0
            fixed_any = False
            while i < len(lines):
                if (
                    "enrichedContext = " in lines[i]
                    and lines[i].rstrip().endswith('= "')
                    and i + 2 < len(lines)
                    and "Live web search skipped" in lines[i + 2]
                ):
                    # skip until line with " + enrichedContext
                    j = i
                    while j < len(lines) and '" + enrichedContext' not in lines[j]:
                        j += 1
                    if j < len(lines):
                        out.append(fixed + ("\n" if not fixed.endswith("\n") else ""))
                        if not fixed.endswith("\n"):
                            pass
                        out[-1] = fixed + "\n"
                        i = j + 1
                        fixed_any = True
                        continue
                out.append(lines[i])
                i += 1
            if not fixed_any:
                raise SystemExit("broken string not found")
            t = "".join(out)
    else:
        t = t.replace(broken, fixed, 1)

    p.write_text(t)
    # verify
    for li, line in enumerate(t.splitlines(), 1):
        if line.rstrip().endswith('enrichedContext = "') and '" + enrichedContext' not in line:
            raise SystemExit(f"still broken line {li}")
    print("ok")

if __name__ == "__main__":
    main()
