"""Print a lesson's article as plain text, without the page shell, for agents to read.

  python3 scripts/lesson_text.py 4-4              # whole article, references left out
  python3 scripts/lesson_text.py 4-4 -s 3         # only section 03
  python3 scripts/lesson_text.py 4-4 -s topics    # sections whose heading contains "topics"
  python3 scripts/lesson_text.py 4-4 --refs       # include the reference list
  python3 scripts/lesson_text.py 4-4 --outline    # headings only, with line numbers

Each output line starts with the line number in robotics-<lesson>.html, so a passage can be
found and changed with Edit without reading the page. Tags are dropped, citations stay as [N],
SVG drawings collapse to one line, widgets show as [widget: name] and code lines start with |. Read-only: this is a
view, the HTML page stays the source.
"""
from html import unescape
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent


def plain(html):
    html = re.sub(r'<a [^>]*href="(robotics-[^"#]+\.html)[^"]*"[^>]*>(.*?)</a>', r'\2 (\1)', html)
    return re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', '', html))).strip()


def render(lesson, section=None, refs=False, outline=False):
    path = ROOT / f'robotics-{lesson}.html'
    if not path.exists():
        sys.exit(f'{path.name} does not exist')
    lines = path.read_text(encoding='utf-8').split('\n')
    start = next((i for i, l in enumerate(lines) if '<article' in l), None)
    end = next((i for i, l in enumerate(lines) if '<!-- Footer Navigation -->' in l or '</article>' in l), None)
    if start is None or end is None:
        sys.exit(f'{path.name}: no <article> body found')
    h1 = next((plain(l) for l in lines[:start] if '<h1' in l), path.name)
    out = [f'# {h1}  ({path.name}, article lines {start + 1}-{end})']
    show, in_refs, svg_from, svg_label, in_pre = section is None, False, None, '', False
    for n, raw in enumerate(lines[start + 1:end], start + 2):
        if svg_from is None and '<svg' in raw:
            svg_from = n
            m = re.search(r'aria-label="([^"]*)"', raw)
            svg_label = unescape(m.group(1)) if m else ''
        if svg_from is not None:
            if '</svg>' in raw:
                if show and not outline and not in_refs:
                    out.append(f'{svg_from:>4}  [svg, lines {svg_from}-{n}: {svg_label}]')
                svg_from = None
            continue
        head = re.search(r'<h2[^>]*>(.*?)</h2>', raw)
        if head:
            title = plain(head.group(1))
            in_refs = bool(re.match(r'(\d+\.\s*)?References$', title))
            if section is not None:
                num = re.match(r'0*(\d+)\.', title)
                show = (num and num.group(1) == section.lstrip('0')) if section.isdigit() \
                    else section.lower() in title.lower()
            if show or outline:
                out.append(f'{n:>4}  ## {title}')
            continue
        if outline or not show or (in_refs and not refs):
            continue
        widget = re.search(r'data-widget="([^"]+)"', raw)
        if widget:
            out.append(f'{n:>4}  [widget: {widget.group(1)}]')
            continue
        if in_pre or '<pre' in raw:  # code keeps its indentation
            in_pre = '</pre>' not in raw
            code = unescape(re.sub(r'<[^>]+>', '', raw)).rstrip()
            if code.strip():
                out.append(f'{n:>4}  | {code if "<pre" not in raw else code.strip()}')
            continue
        text = plain(raw)
        if not text:
            continue
        if re.search(r'<h[3-6]', raw):
            text = '### ' + text
        elif '<li' in raw:
            m = re.search(r'<li id="ref-(\d+)"', raw)
            text = (f'[{m.group(1)}] ' if m else '- ') + text
        elif '<figcaption' in raw:
            text = 'Caption: ' + text
        out.append(f'{n:>4}  {text}')
    return '\n'.join(out)


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args[0].startswith('-'):
        sys.exit(__doc__)
    sec = args[args.index('-s') + 1] if '-s' in args else None
    print(render(args[0].replace('.', '-'), sec, '--refs' in args, '--outline' in args))
