"""Renumber a lesson's references by first use and reorder its References list to match.

  python3 scripts/renumber_refs.py robotics-4-4.html [more pages...]

Use it after adding, removing or moving citations: cite new sources with any unused
number, run this, and every [N] and <li id="ref-N"> comes out numbered 1, 2, 3... in
reading order. Refs that are no longer cited are reported, not deleted.
"""
from pathlib import Path
import re
import sys

CITE_RE = re.compile(r'<sup><a href="#ref-(\d+)">\[\d+\]</a></sup>')
LI_RE = re.compile(r'(\s*)<li id="ref-(\d+)">(.*?)</li>', re.S)


def renumber(path):
    text = path.read_text(encoding='utf-8')
    refs_at = text.find('<li id="ref-')
    list_start = text.rfind('<ol', 0, refs_at)
    list_end = text.find('</ol>', refs_at)
    body, refs, tail = text[:list_start], text[list_start:list_end], text[list_end:]
    order = list(dict.fromkeys(CITE_RE.findall(body)))
    items = {num: (ws, item) for ws, num, item in LI_RE.findall(refs)}
    uncited = [n for n in items if n not in order]
    missing = [n for n in order if n not in items]
    if missing:
        sys.exit(f'{path.name}: cited but not in References: {missing}')
    new_num = {old: str(i + 1) for i, old in enumerate(order + uncited)}
    body = CITE_RE.sub(lambda m: f'<sup><a href="#ref-{new_num[m.group(1)]}">[{new_num[m.group(1)]}]</a></sup>', body)
    head = refs[:LI_RE.search(refs).start()]
    last = list(LI_RE.finditer(refs))[-1]
    lis = ''.join(f'{items[old][0]}<li id="ref-{new_num[old]}">{items[old][1]}</li>' for old in order + uncited)
    path.write_text(body + head + lis + refs[last.end():] + tail, encoding='utf-8')
    changed = sum(1 for o, n in new_num.items() if o != n)
    print(f'{path.name}: {changed} refs renumbered' + (f'; never cited: {[new_num[n] for n in uncited]}' if uncited else ''))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for arg in sys.argv[1:]:
        renumber(Path(arg))
