"""Source registry for lesson References lists.

docs/sources.json records every URL cited in a lesson's References list, which
refs cite it, whether the link still loads, and whether a person or agent has
checked the cited claim against the page. Agents read it instead of re-opening
sources that were already checked.

Usage (from the repo root):
  python3 scripts/sources.py sync               # add new refs, drop removed ones (no network)
  python3 scripts/sources.py links [--all]      # fetch unchecked (or all) URLs, record HTTP status
  python3 scripts/sources.py report             # counts by lesson and status
  python3 scripts/sources.py check              # CI: registry covers every cited URL

Verification values (set by hand or by a review pass, never by `links`):
  verified     the page was opened and supports the claim it is cited for
  partial      the page supports part of the claim; see note
  mismatch     the page does not support the claim; the lesson needs a fix (see note)
  unreachable  could not be opened (paywall, 403, dead); claim rests on other evidence
  unchecked    nobody has compared the claim with the page yet
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from html import unescape
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / 'docs' / 'sources.json'
REF_RE = re.compile(r'<li id="ref-(\d+)">(.*?)</li>', re.S)
URL_RE = re.compile(r'href="(https?://[^"]+)"')
TAG_RE = re.compile(r'<[^>]+>')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'


def lesson_key(path):
    return [int(x) if x.isdigit() else x for x in re.split(r'(\d+)', path.name)]


def lesson_pages():
    return sorted(ROOT.glob('robotics-*-*.html'), key=lesson_key)


def ref_text(body):
    return re.sub(r'\s+', ' ', unescape(TAG_RE.sub('', body))).strip()


def scan():
    """Return {url: [{"ref": "2-3#ref-1", "text": ...}, ...]} from the lesson pages."""
    found = {}
    for page in lesson_pages():
        lesson = page.stem.replace('robotics-', '')
        for num, body in REF_RE.findall(page.read_text(encoding='utf-8')):
            for url in dict.fromkeys(unescape(u) for u in URL_RE.findall(body)):
                found.setdefault(url, []).append({'ref': f'{lesson}#ref-{num}', 'text': ref_text(body)})
    return found


def load():
    if REGISTRY.exists():
        return json.loads(REGISTRY.read_text(encoding='utf-8'))
    return {'about': 'See scripts/sources.py for the schema and commands.', 'sources': {}}


def save(reg):
    reg['sources'] = dict(sorted(reg['sources'].items()))
    REGISTRY.parent.mkdir(exist_ok=True)
    REGISTRY.write_text(json.dumps(reg, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')


def sync(reg):
    found = scan()
    sources = reg['sources']
    for url in list(sources):
        if url not in found:
            del sources[url]
    for url, cites in found.items():
        entry = sources.setdefault(url, {'verification': 'unchecked'})
        entry['citedBy'] = [c['ref'] for c in cites]
        entry['refText'] = cites[0]['text'][:300]
    return reg


def raw_github(url):
    """github.com blob/tree/repo URL -> a raw.githubusercontent.com URL that shows the same content."""
    m = re.match(r'https://github\.com/([^/]+)/([^/#?]+)(?:/(?:blob|tree)/([^/]+)(/[^#?]*)?)?/?(?:[#?].*)?$', url)
    if not m:
        return None
    owner, repo, ref, path = m.groups()
    if ref and path and '.' in path.rsplit('/', 1)[-1]:
        return f'https://raw.githubusercontent.com/{owner}/{repo}/{ref}{path}'
    return f'https://raw.githubusercontent.com/{owner}/{repo}/{ref or "HEAD"}{(path or "").rstrip("/")}/README.md'


def curl(url):
    cmd = ['curl', '-sS', '-L', '--max-time', '25', '--max-redirs', '8', '-A', UA,
           '-o', '-', '-w', '\n@@%{http_code} %{url_effective}', '-r', '0-200000', url]
    try:
        out = subprocess.run(cmd, capture_output=True, timeout=40).stdout.decode('utf-8', 'replace')
    except subprocess.TimeoutExpired:
        return 0, url, ''
    body, _, tail = out.rpartition('\n@@')
    code, _, final = tail.partition(' ')
    return (int(code) if code.isdigit() else 0), final, body


def fetch(url):
    code, final, body = curl(url)
    result = {'http': code}
    if final and final != url:
        result['finalUrl'] = final
    m = re.search(r'<title[^>]*>(.*?)</title>', body, re.S | re.I)
    if m:
        result['title'] = re.sub(r'\s+', ' ', unescape(m.group(1))).strip()[:160]
    if 'access to this repository is not enabled' in body:
        # The agent sandbox proxy blocks github.com pages; the raw file shows the same content.
        result['blocked'] = 'sandbox-proxy'
        raw = raw_github(url)
        if raw:
            result['rawUrl'] = raw
            result['rawHttp'] = curl(raw)[0]
    elif result.get('title') == 'Just a moment...':
        result['blocked'] = 'bot-challenge'
    return result


def links(reg, everything=False):
    today = date.today().isoformat()
    todo = [u for u, e in reg['sources'].items() if everything or 'http' not in e]
    print(f'Fetching {len(todo)} URLs...')
    with ThreadPoolExecutor(max_workers=12) as pool:
        for url, res in zip(todo, pool.map(fetch, todo)):
            entry = reg['sources'][url]
            for k in ('finalUrl', 'title', 'error', 'blocked', 'rawUrl', 'rawHttp'):
                entry.pop(k, None)
            entry.update(res)
            entry['linkChecked'] = today
    return reg


def report(reg):
    by_lesson = {}
    for entry in reg['sources'].values():
        for ref in entry['citedBy']:
            row = by_lesson.setdefault(ref.split('#')[0], {})
            row[entry['verification']] = row.get(entry['verification'], 0) + 1
            if entry.get('http', 200) >= 400 or entry.get('http') == 0:
                row['badLink'] = row.get('badLink', 0) + 1
    for lesson in sorted(by_lesson, key=lambda s: [int(x) for x in s.split('-')]):
        print(lesson, by_lesson[lesson])


def check(reg):
    missing = set(scan()) - set(reg['sources'])
    if missing:
        print('docs/sources.json is missing cited URLs. Run: python3 scripts/sources.py sync')
        for url in sorted(missing):
            print(f'  {url}')
        return 1
    print(f'OK: docs/sources.json covers all {len(reg["sources"])} cited URLs.')
    return 0


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'report'
    reg = load()
    if cmd == 'sync':
        save(sync(reg))
    elif cmd == 'links':
        save(links(sync(reg), '--all' in sys.argv))
    elif cmd == 'report':
        report(reg)
    elif cmd == 'check':
        sys.exit(check(reg))
    else:
        sys.exit(__doc__)
