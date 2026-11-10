#!/usr/bin/env python3
"""Plain-language pass over lesson paragraphs (extract, verify, apply).

  plain_language.py extract OUT_PREFIX [--parts N]   hard-to-read paragraphs -> OUT_PREFIX-<k>.json
  plain_language.py verify CANDIDATES REWRITES       report which rewrites are safe to apply
  plain_language.py apply CANDIDATES REWRITES [--only IDS_FILE]   write the safe ones into the pages

A candidate is one <p> or <li> before the References heading whose text has a long sentence or a stiff word.
A rewrite is accepted only if it keeps every tag, citation, code span, link, number and entity of the original,
and the paragraph has no safety wording (those stay as written; see CLAUDE.md).
"""
import argparse, glob, html, json, re, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_LESSONS = {'1-7', '3-1', '3-2', '3-3', '3-4', '5-1', '5-2', '5-3', '5-4', '5-5'}  # safety/legal text, Gerald's prose
SAFETY = re.compile(r'safe|hazard|risk|injur|guard|emergency|e-stop|estop|protective|lockout|tagout|\bstop\b|\bstops\b|stopping|'
                    r'\bISO\b|\bIEC\b|OSHA|ANSI|\bRIA\b|standard|liab|legal|law\b|regulat|certif|collaborative|force limit|'
                    r'speed and separation|voltage|shock|pinch|crush|must\b|never\b|warning|danger|caution', re.I)
STIFF = re.compile(r'\b(utili[sz]\w*|facilitat\w*|leverag\w*|optimi[sz]\w*|robust\w*|paradigm\w*|comprehensive|methodolog\w*|'
                   r'infrastructure|aforementioned|subsequently|henceforth|thereby|therein|wherein|whereby|necessitat\w*|'
                   r'commence\w*|endeavou?r\w*|in order to|prior to|a multitude of|plethora|encompass\w*|heterogeneous|'
                   r'ubiquitous|seamless\w*|holistic\w*|mitigat\w*|delineat\w*|predicated|instantiat\w*|abstraction\w*|'
                   r'agnostic|decoupl\w*|orchestrat\w*|granular\w*|interoperab\w*|deterministic\w*|constitut\w*)\b', re.I)
BLOCK = re.compile(r'<(p|li)((?:\s[^>]*)?)>(.*?)</\1>', re.S)
TAG = re.compile(r'<[^>]+>')
LONG = 30   # words in one sentence


def lessons():
    return sorted((re.match(r'robotics-(\d+-\d+)\.html', Path(p).name).group(1), Path(p))
                  for p in glob.glob(str(ROOT / 'robotics-[0-9]*-[0-9]*.html')))


def plain(inner):
    return re.sub(r'\s+', ' ', html.unescape(TAG.sub('', re.sub(r'<sup>.*?</sup>', '', inner, flags=re.S)))).strip()


def blocks(text):
    """(start, end, inner) of each simple <p>/<li> in the article before References, outside callouts and figures."""
    m = re.search(r'<h2[^>]*>[^<]*References\s*</h2>', text)
    end = m.start() if m else len(text)
    start = text.find('article-section-title')
    if start < 0:
        return
    skip = [(s.start(), s.end()) for s in re.finditer(
        r'<(div|figure|details|table|pre|nav|aside)\b[^>]*class="[^"]*(?:callout|lesson-diagram|show-answer|widget)[^"]*".*?</\1>', text[:end], re.S)]
    skip += [(s.start(), s.end()) for s in re.finditer(r'<!-- oss-note -->.*?<!-- /oss-note -->|<pre\b.*?</pre>|<table\b.*?</table>|<figure\b.*?</figure>', text[:end], re.S)]
    for b in BLOCK.finditer(text, start, end):
        if any(s <= b.start() < e for s, e in skip):
            continue
        inner = b.group(3)
        if re.search(r'<(p|li|ul|ol|div|pre|table|figure|svg|input|button|select)\b', inner) or '\\(' in inner or '\\[' in inner:
            continue
        yield b.start(3), b.end(3), inner


def hard(inner):
    t = plain(inner)
    if len(t.split()) < 12 or SAFETY.search(t):
        return None
    longest = max((len(s.split()) for s in re.split(r'(?<=[.!?])\s+', t)), default=0)
    stiff = sorted({w.lower() for w in STIFF.findall(t)})
    if longest >= LONG or stiff:
        return {'longest_sentence': longest, 'stiff': stiff}
    return None


def candidates():
    out = []
    for lid, path in lessons():
        if lid in SKIP_LESSONS:
            continue
        text = path.read_text(encoding='utf-8')
        n = 0
        for s, e, inner in blocks(text):
            why = hard(inner)
            if why:
                n += 1
                out.append({'id': '%s#%d' % (lid, n), 'lesson': lid, 'why': why, 'html': inner.strip()})
    return out


def fingerprint(inner):
    """Everything a rewrite must keep, as multisets."""
    protected = re.findall(r'<sup>.*?</sup>|<code\b.*?</code>|<kbd\b.*?</kbd>|<a\b[^>]*>|<abbr\b[^>]*>|<span\b[^>]*>', inner, re.S)
    rest = re.sub(r'<sup>.*?</sup>|<code\b.*?</code>|<kbd\b.*?</kbd>', ' ', inner, flags=re.S)
    tags = TAG.findall(rest)
    text = TAG.sub(' ', rest)
    return {
        'protected': Counter(re.sub(r'\s+', ' ', p) for p in protected),
        'tags': Counter(re.sub(r'\s+', ' ', t) for t in tags),
        'numbers': Counter(re.findall(r'\d+(?:[.,]\d+)*', text)),
        'entities': Counter(e for e in re.findall(r'&[a-zA-Z]+;|&#\d+;', text) if e not in ('&mdash;', '&ndash;')),
        'quotes': Counter(re.sub(r'\s+', ' ', q) for q in re.findall(r'"[^"]{3,}"|&ldquo;.*?&rdquo;|\u201c.*?\u201d', text, re.S)),
        'caps': Counter(w for w in re.findall(r'\b[A-Za-z]*[A-Z][A-Za-z0-9]*[A-Z0-9][A-Za-z0-9]*\b', text)),  # acronyms, CamelCase
    }


def check(old, new, key_terms=()):
    probs = []
    if not new or not new.strip():
        return ['empty']
    fo, fn = fingerprint(old), fingerprint(new)
    for k in fo:
        if fo[k] != fn[k]:
            diff = (fo[k] - fn[k]) + (fn[k] - fo[k])
            probs.append('%s differ: %s' % (k, ', '.join(list(diff)[:4])))
    po, pn = plain(old), plain(new)
    if len(pn.split()) > len(po.split()) * 1.25 + 4:
        probs.append('longer than the original by more than a quarter')
    if len(pn.split()) < len(po.split()) * 0.6:
        probs.append('lost more than 40% of the words')
    if SAFETY.search(pn):
        probs.append('introduces safety wording')
    if re.search(r'\\\d|&mdash;|—', new):
        probs.append('backreference or em dash')
    if re.search(r'<a\b', old):
        ao = [plain(x) for x in re.findall(r'<a\b[^>]*>(.*?)</a>', old, re.S)]
        an = [plain(x) for x in re.findall(r'<a\b[^>]*>(.*?)</a>', new, re.S)]
        if Counter(ao) != Counter(an):
            probs.append('link text changed')
    for t in key_terms:
        pat = re.compile(r'\b' + re.escape(t) + r's?\b', re.I)
        if pat.search(po) and not pat.search(pn):
            probs.append('dropped key term "%s"' % t)
    longest = max((len(s.split()) for s in re.split(r'(?<=[.!?])\s+', pn)), default=0)
    if longest > 32:
        probs.append('still has a %d-word sentence' % longest)
    return probs


def key_terms_by_lesson():
    src = (ROOT / 'assets/js/course-data.js').read_text(encoding='utf-8')
    out = {}
    for m in re.finditer(r'id:\s*[\'"](\d+-\d+)[\'"].*?keyTerms:\s*\[(.*?)\]', src, re.S):
        out[m.group(1)] = re.findall(r'[\'"]([^\'"]+)[\'"]', m.group(2))
    return out


def load_pairs(cand_file, rew_file):
    cands = {c['id']: c for c in json.loads(Path(cand_file).read_text(encoding='utf-8'))}
    rews = json.loads(Path(rew_file).read_text(encoding='utf-8'))
    kt = key_terms_by_lesson()
    good, bad = [], []
    for r in rews:
        c = cands.get(r.get('id'))
        if not c:
            bad.append((r.get('id'), ['unknown id'])); continue
        new = (r.get('html') or '').strip()
        if new == c['html']:
            continue
        probs = check(c['html'], new, kt.get(c['lesson'], ()))
        (bad if probs else good).append((c['id'], probs) if probs else (c, new))
    return good, bad, len(cands), len(rews)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    e = sub.add_parser('extract'); e.add_argument('prefix'); e.add_argument('--parts', type=int, default=1)
    for name in ('verify', 'apply'):
        p = sub.add_parser(name); p.add_argument('candidates'); p.add_argument('rewrites'); p.add_argument('--only')
        p.add_argument('--pairs', help='write accepted before/after pairs to this JSON file')
    a = ap.parse_args()
    if a.cmd == 'extract':
        c = candidates()
        by_lesson = {}
        for x in c:
            by_lesson.setdefault(x['lesson'], []).append(x)
        parts = [[] for _ in range(a.parts)]
        # contiguous split by chapter order, balanced by count
        order = sorted(by_lesson, key=lambda s: tuple(map(int, s.split('-'))))
        target, k = len(c) / a.parts, 0
        for lid in order:
            if len(parts[k]) >= target and k < a.parts - 1:
                k += 1
            parts[k].extend(by_lesson[lid])
        for i, part in enumerate(parts, 1):
            Path('%s-%d.json' % (a.prefix, i)).write_text(json.dumps(part, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
            print('part %d: %d paragraphs, lessons %s..%s' % (i, len(part), part[0]['lesson'], part[-1]['lesson']))
        print('total', len(c))
        return
    good, bad, nc, nr = load_pairs(a.candidates, a.rewrites)
    only = set(json.loads(Path(a.only).read_text())) if a.only else None
    if only is not None:
        good = [g for g in good if g[0]['id'] in only]
    print('%d candidates, %d rewrites, %d accepted, %d rejected' % (nc, nr, len(good), len(bad)))
    for i, probs in bad:
        print('  reject %s: %s' % (i, '; '.join(probs)))
    if a.pairs:
        Path(a.pairs).write_text(json.dumps([{'id': c['id'], 'old': c['html'], 'new': n} for c, n in good], indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    if a.cmd == 'apply':
        done = 0
        by = {}
        for c, n in good:
            by.setdefault(c['lesson'], []).append((c, n))
        for lid, items in by.items():
            path = ROOT / ('robotics-%s.html' % lid)
            text = path.read_text(encoding='utf-8')
            for c, n in items:
                if text.count(c['html']) != 1:
                    print('  skip %s: original text not found exactly once' % c['id']); continue
                text = text.replace(c['html'], n); done += 1
            path.write_text(text, encoding='utf-8')
        print('applied', done)


if __name__ == '__main__':
    main()
