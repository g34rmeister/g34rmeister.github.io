#!/usr/bin/env python3
"""one-off round 2+: gloss2.py extract N_PARTS | verify REWRITES... | apply REWRITES...  (STEP env = ticket number)"""
import json, re, sys, os, html
from collections import Counter
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import plain_language as pl
H = ROOT / 'docs/handoff'; HERE = Path(__file__).parent; STEP = os.environ.get('STEP', '57')
EXTRA = re.compile(r'\b(provid\w+|enabl\w+|via|perform\w*|employ\w*|retain\w*|respective\w*|thus|hence|upon|approximately|numerous|'
                   r'obtain\w*|characteri[sz]\w*|capab\w+|allow\w* for|is responsible for|in a manner)\b', re.I)
G = ROOT / 'assets/js/glossary-data.js'; M = ROOT / 'scripts/site_manifest.json'
LINE = re.compile(r'^\t("(?:[^"\\]|\\.)*"): ("(?:[^"\\]|\\.)*")(,?)$', re.M)
sents = lambda t: [s for s in re.split(r'(?<=[.!?])\s+', t) if s]
norm = lambda t: re.sub(r'[^a-z0-9]+', '', html.unescape(t).lower())

def term_lessons():
    out = {}
    for line in (ROOT / 'assets/js/course-data.js').read_text().splitlines():
        line = line.strip().rstrip(',')
        if line.startswith('{"id": "'):
            d = json.loads(line)
            for t in d.get('keyTerms', []): out.setdefault(t, []).append(d['id'])
    return out

def lesson_norm(l, cache={}):
    if l not in cache:
        p = ROOT / ('robotics-%s.html' % l)
        t = p.read_text() if p.exists() else ''
        t = re.sub(r'<(script|style|sup)\b.*?</\1>', ' ', t, flags=re.S)
        cache[l] = norm(re.sub(r'<[^>]+>', ' ', t))
    return cache[l]

def items():
    tl = term_lessons(); out = []
    for m in LINE.finditer(G.read_text()):
        k, v = json.loads(m.group(1)), json.loads(m.group(2))
        out.append({'id': 'g:' + k, 'kind': 'glossary', 'term': k, 'lessons': tl.get(k, []), 'text': v})
    man = json.loads(M.read_text())
    for c, ch in man['chapters'].items():
        out.append({'id': 'f:' + c, 'kind': 'featuredDesc', 'lessons': [], 'text': ch['featuredDesc']})
        for l, b in ch['blurbs'].items():
            out.append({'id': 'b:' + l, 'kind': 'blurb', 'lessons': [l], 'text': b})
    return out

def task(it, done):
    t = it['text']; n = len(t.split())
    if it['id'] in done or pl.SAFETY.search(t) or pl.SAFETY.search(it.get('term', '')) or not it['lessons']: return None
    if any(l in pl.SKIP_LESSONS for l in it['lessons'][:1]): return None
    longest = max(len(s.split()) for s in sents(t))
    stiff = sorted({w.lower() for w in pl.STIFF.findall(t)} | {w.lower() for w in EXTRA.findall(t)})
    if it['kind'] == 'glossary' and n < 18: return {'task': 'deepen', 'min_words': max(n + 8, 24)}
    if longest > 24 or stiff: return {'task': 'clarify', 'min_words': n, 'longest_sentence': longest, 'stiff': stiff}

cmd = sys.argv[1]
donef = HERE / 'done.json'
done = set(json.loads(donef.read_text())) if donef.exists() else set()
if cmd == 'extract':
    c = []
    for it in items():
        f = task(it, done)
        if f: it.update(f); c.append(it)
    k = int(sys.argv[2]); print(len(c), Counter(i['task'] for i in c), Counter(i['kind'] for i in c))
    for j in range(k):
        (H / ('step-%s-candidates-%d.json' % (STEP, j + 1))).write_text(json.dumps(c[j::k], indent=1, ensure_ascii=False))
else:
    by = {}
    for j in range(1, 9):
        f = H / ('step-%s-candidates-%d.json' % (STEP, j))
        if f.exists(): by.update({i['id']: i for i in json.loads(f.read_text())})
    ok, bad = [], []
    for rf in sys.argv[2:]:
        for r in json.loads(Path(rf).read_text()):
            old = by.get(r['id'])
            if not old: bad.append((r['id'], ['unknown id'])); continue
            new = r['text'].strip(); ev = r.get('evidence') or []
            if new == old['text']: continue
            probs = []
            evtext = ' '.join(e.get('quote', '') for e in ev)
            for e in ev:
                q = norm(e.get('quote', ''))
                if len(q) < 15 or q not in lesson_norm(str(e.get('lesson', ''))): probs.append('evidence quote not in lesson %s: %s' % (e.get('lesson'), e.get('quote', '')[:50]))
            fo, fn = pl.fingerprint(old['text']), pl.fingerprint(new); fe = pl.fingerprint(evtext + ' ' + old.get('term', ''))
            for key in ('numbers', 'caps', 'quotes', 'tags', 'protected', 'entities'):
                miss = fo[key] - fn[key]
                if miss: probs.append('%s dropped: %s' % (key, ', '.join(list(miss)[:4])))
                add = [x for x in (fn[key] - fo[key]) if x not in fe[key] and norm(x) not in norm(evtext)]
                if add and key != 'quotes': probs.append('%s added without evidence: %s' % (key, ', '.join(add[:4])))
            n = len(new.split())
            if n < old['min_words']: probs.append('shorter than min_words (%d < %d)' % (n, old['min_words']))
            if old['task'] == 'deepen' and not ev: probs.append('deepen without evidence')
            if pl.SAFETY.search(new): probs.append('introduces safety wording')
            if re.search(r'—|&mdash;|;', new): probs.append('em dash or semicolon')
            if max(len(s.split()) for s in sents(new)) > 30: probs.append('a sentence over 30 words')
            (bad.append((r['id'], probs)) if probs else ok.append({'id': r['id'], 'task': old['task'], 'lessons': old['lessons'], 'old': old['text'], 'new': new, 'evidence': [e['quote'] for e in ev]}))
    print('ok', len(ok), 'bad', len(bad))
    for b in bad: print('BAD', b[0], '|', '; '.join(b[1]))
    (HERE / ('pairs-%s.json' % STEP)).write_text(json.dumps(ok, indent=1, ensure_ascii=False))
    (HERE / ('bad-%s.json' % STEP)).write_text(json.dumps([{'id': a, 'problems': b} for a, b in bad], indent=1, ensure_ascii=False))
    if cmd == 'apply':
        rj = HERE / ('reject-%s.json' % STEP); ov = HERE / ('override-%s.json' % STEP)
        skip = set(json.loads(rj.read_text())) if rj.exists() else set()
        new = {p['id']: p['new'] for p in ok if p['id'] not in skip}
        if ov.exists(): new.update(json.loads(ov.read_text()))
        G.write_text(LINE.sub(lambda m: '\t%s: %s%s' % (m.group(1), json.dumps(new['g:' + json.loads(m.group(1))], ensure_ascii=False), m.group(3)) if 'g:' + json.loads(m.group(1)) in new else m.group(0), G.read_text()))
        mt = M.read_text(); allit = {i['id']: i for i in items()}
        for k, v in new.items():
            if k[0] in 'bf':
                o = json.dumps(allit[k]['text'], ensure_ascii=False); assert mt.count(o) == 1, k
                mt = mt.replace(o, json.dumps(v, ensure_ascii=False))
        M.write_text(mt)
        donef.write_text(json.dumps(sorted(done | set(new))))
        print('applied', len(new))
