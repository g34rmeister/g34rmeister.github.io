"""Source registry for lesson References lists.

docs/sources.json records every source cited in a lesson's References list: which refs cite
it, whether the link still loads, and, per lesson, whether someone compared the lesson's
claim with the source. Agents read it instead of re-opening sources that were already checked.

Each entry is keyed by URL (refs with no URL, such as books, get a "book:" key). Fields:
  citedBy     current refs, e.g. ["2-3#ref-1"] (rebuilt by `sync`, so renumbering is safe)
  refText     the References entry as plain text
  http, finalUrl, title, blocked, rawUrl, rawHttp, linkChecked   from `links`
  checks      {"<lesson>": {"status", "claim", "evidence", "note", "suggestedUrl",
               "corroboratedBy", "checked"}}: one claim check per citing lesson

Usage (from the repo root):
  python3 scripts/sources.py sync               # add new refs, drop removed ones (no network)
  python3 scripts/sources.py links [--all]      # fetch new (or all) URLs, record HTTP status
  python3 scripts/sources.py import FILE.json LESSON   # merge a claim-check result file
  python3 scripts/sources.py report [LESSON]    # status counts per lesson, or one lesson's problems
  python3 scripts/sources.py check              # CI: registry covers every cited source

Check status values:
  verified     the source was opened and supports the cited text
  partial      supports part of it; see note
  mismatch     does not support it; the lesson needs a fix (see note)
  dead         link is gone; suggestedUrl gives the new location if one was found
  unreachable  could not be opened (paywall, bot wall, book); see corroboratedBy
  fixed        was partial/mismatch/dead and the lesson or link has since been corrected
A source with no entry under checks for a lesson is unchecked for that lesson.
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


def source_key(lesson, body):
    urls = list(dict.fromkeys(unescape(u) for u in URL_RE.findall(body)))
    return urls or [f'book:{lesson}:{ref_text(body)[:80]}']


def scan():
    """Return {key: [{"ref": "2-3#ref-1", "text": ...}, ...]} from the lesson pages."""
    found = {}
    for page in lesson_pages():
        lesson = page.stem.replace('robotics-', '')
        for num, body in REF_RE.findall(page.read_text(encoding='utf-8')):
            for key in source_key(lesson, body):
                found.setdefault(key, []).append({'ref': f'{lesson}#ref-{num}', 'text': ref_text(body)})
    return found


def refs_of(lesson):
    """{ref number: [registry keys]} for one lesson page."""
    text = (ROOT / f'robotics-{lesson}.html').read_text(encoding='utf-8')
    return {int(num): source_key(lesson, body) for num, body in REF_RE.findall(text)}


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
        entry = sources.setdefault(url, {})
        entry.pop('verification', None)
        entry['citedBy'] = [c['ref'] for c in cites]
        entry['refText'] = cites[0]['text'][:300]
        lessons = {c['ref'].split('#')[0] for c in cites}
        for lesson in list(entry.get('checks', {})):
            if lesson not in lessons:
                del entry['checks'][lesson]
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
    todo = [u for u, e in reg['sources'].items() if not u.startswith('book:') and (everything or 'http' not in e)]
    print(f'Fetching {len(todo)} URLs...')
    with ThreadPoolExecutor(max_workers=12) as pool:
        for url, res in zip(todo, pool.map(fetch, todo)):
            entry = reg['sources'][url]
            for k in ('finalUrl', 'title', 'error', 'blocked', 'rawUrl', 'rawHttp'):
                entry.pop(k, None)
            entry.update(res)
            entry['linkChecked'] = today
    return reg


def import_checks(reg, path, lesson):
    today = date.today().isoformat()
    keys = refs_of(lesson)
    results = json.loads(Path(path).read_text(encoding='utf-8'))
    for r in results:
        check = {k: r[k] for k in ('status', 'claim', 'evidence', 'note', 'suggestedUrl', 'corroboratedBy') if r.get(k)}
        check['checked'] = r.get('checked', today)
        for key in keys.get(int(r['ref']), []):
            reg['sources'][key].setdefault('checks', {})[lesson] = check
    print(f'{lesson}: imported {len(results)} checks for {len(keys)} refs')
    return reg


def lesson_status(reg):
    """{lesson: {status: count}} counting each ref once (its worst status)."""
    rank = ['mismatch', 'dead', 'partial', 'unchecked', 'unreachable', 'fixed', 'verified']
    worst = {}
    for key, entry in reg['sources'].items():
        for ref in entry['citedBy']:
            lesson = ref.split('#')[0]
            status = entry.get('checks', {}).get(lesson, {}).get('status', 'unchecked')
            if ref not in worst or rank.index(status) < rank.index(worst[ref]):
                worst[ref] = status
    out = {}
    for ref, status in worst.items():
        row = out.setdefault(ref.split('#')[0], {})
        row[status] = row.get(status, 0) + 1
    return out


def report(reg, lesson=None):
    if lesson:
        for key, entry in reg['sources'].items():
            check = entry.get('checks', {}).get(lesson)
            refs = [r.split('#')[1] for r in entry['citedBy'] if r.startswith(lesson + '#')]
            if refs and (not check or check['status'] not in ('verified', 'fixed')):
                status = check['status'] if check else 'unchecked'
                print(f"{','.join(refs)} {status}: {key}\n    {check.get('note', '') if check else ''}")
        return
    for lesson, row in sorted(lesson_status(reg).items(), key=lambda kv: [int(x) for x in kv[0].split('-')]):
        print(lesson, row)


def check(reg):
    missing = set(scan()) - set(reg['sources'])
    if missing:
        print('docs/sources.json is missing cited sources. Run: python3 scripts/sources.py sync')
        for url in sorted(missing):
            print(f'  {url}')
        return 1
    print(f'OK: docs/sources.json covers all {len(reg["sources"])} cited sources.')
    return 0


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'report'
    reg = load()
    if cmd == 'sync':
        save(sync(reg))
    elif cmd == 'links':
        save(links(sync(reg), '--all' in sys.argv))
    elif cmd == 'import':
        save(import_checks(sync(reg), sys.argv[2], sys.argv[3]))
    elif cmd == 'report':
        report(reg, sys.argv[2] if len(sys.argv) > 2 else None)
    elif cmd == 'check':
        sys.exit(check(reg))
    else:
        sys.exit(__doc__)
