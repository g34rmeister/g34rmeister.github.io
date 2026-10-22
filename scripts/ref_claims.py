"""List each reference of a lesson with the text that cites it, as JSON.

  python3 scripts/ref_claims.py 4-4            # all refs
  python3 scripts/ref_claims.py 4-4 12 13      # only refs 12 and 13

For each ref: its number, the References entry as plain text, its URLs, and every
passage that cites it (the text between the previous citation and this one). Use it
to check a claim against its source without reading the whole lesson page.
"""
from html import unescape
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
CITE_RE = re.compile(r'<sup><a href="#ref-(\d+)">\[\d+\]</a></sup>')


def plain(html):
    html = re.sub(r'(?is)<(script|style|svg)[^>]*>.*?</\1>', ' ', html)
    html = re.sub(r'(?i)<(br|/p|/li|/h[1-6]|/tr|/figcaption|/pre)[^>]*>', ' ¶ ', html)
    return re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', ' ', html))).strip()


def ref_claims(lesson, wanted=None):
    text = (ROOT / f'robotics-{lesson}.html').read_text(encoding='utf-8')
    refs_at = text.find('<li id="ref-1">')
    body, refs_html = text[:refs_at], text[refs_at:]
    body = body[body.find('<main'):]
    marked = plain(CITE_RE.sub(lambda m: f' ⟦{m.group(1)}⟧ ', body))
    claims = {}
    for m in re.finditer(r'(.*?)((?:⟦\d+⟧\s*)+)', marked, re.S):
        passage = m.group(1).split('¶')[-1].strip()
        if len(passage) < 25:  # citation right after another one: include the previous passage
            passage = m.group(1).strip()
        passage = passage.replace('¶', ' ').strip()[-500:]
        for num in re.findall(r'\d+', m.group(2)):
            claims.setdefault(int(num), []).append(passage)
    out = []
    for num, item in re.findall(r'<li id="ref-(\d+)">(.*?)</li>', refs_html, re.S):
        num = int(num)
        if wanted and num not in wanted:
            continue
        out.append({'ref': num, 'text': plain(item),
                    'urls': list(dict.fromkeys(unescape(u) for u in re.findall(r'href="(https?://[^"]+)"', item))),
                    'citedFor': claims.get(num, [])})
    return out


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    print(json.dumps(ref_claims(sys.argv[1], {int(a) for a in sys.argv[2:]}), indent=1, ensure_ascii=False))
