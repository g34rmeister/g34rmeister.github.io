#!/usr/bin/env python3
"""one-off: extract/verify/apply glossary + manifest blurb rewrites. usage: gloss.py extract|verify|apply"""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import plain_language as pl
H = ROOT / 'docs/handoff'
EXTRA = re.compile(r'\b(provid\w+|enabl\w+|via|perform\w*|employ\w*|retain\w*|discrete|respective\w*|thus|hence|wherea?s|'
                   r'in which|by which|upon|approximately|numerous|obtain\w*|determin\w+|ensur\w+|specif(?:y|ies|ied) the|'
                   r'characteri[sz]\w*|correspond\w*|respect to|capab\w+|allow\w* for|is responsible for|in a manner)\b', re.I)
G = ROOT / 'assets/js/glossary-data.js'
M = ROOT / 'scripts/site_manifest.json'
LINE = re.compile(r'^\t("(?:[^"\\]|\\.)*"): ("(?:[^"\\]|\\.)*")(,?)$', re.M)

def term_lessons():
    src = (ROOT / 'assets/js/course-data.js').read_text()
    out = {}
    for m in re.finditer(r"id:\s*['\"](\d+-\d+)['\"].*?keyTerms:\s*\[(.*?)\]", src, re.S):
        for t in re.findall(r"'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"", m.group(2)):
            out.setdefault((t[0] or t[1]).replace("\\'", "'"), []).append(m.group(1))
    return out

def items():
    tl = term_lessons()
    out = []
    for m in LINE.finditer(G.read_text()):
        k, v = json.loads(m.group(1)), json.loads(m.group(2))
        out.append({'id': 'g:' + k, 'kind': 'glossary', 'term': k, 'lessons': tl.get(k, []), 'text': v})
    man = json.loads(M.read_text())
    for c, ch in man['chapters'].items():
        out.append({'id': 'f:' + c, 'kind': 'featuredDesc', 'text': ch['featuredDesc']})
        for l, b in ch['blurbs'].items():
            out.append({'id': 'b:' + l, 'kind': 'blurb', 'lesson': l, 'text': b})
    return out

def flag(it):
    t = pl.plain(it['text']); n = len(t.split())
    stiff = sorted({w.lower() for w in pl.STIFF.findall(t)} | {w.lower() for w in EXTRA.findall(t)})
    limit = 22 if it['kind'] == 'glossary' else 24
    if n > limit or stiff:
        return {'words': n, 'stiff': stiff}

cmd = sys.argv[1]
if cmd == 'extract':
    safe, rest = [], []
    for it in items():
        f = flag(it)
        if not f: continue
        it.update(f)
        (safe if pl.SAFETY.search(it['text']) or pl.SAFETY.search(it.get('term', '')) else rest).append(it)
    g = [i for i in rest if i['kind'] == 'glossary']; o = [i for i in rest if i['kind'] != 'glossary']
    half = (len(g) + 1) // 2
    for name, part in (('step-54-candidates-1', g[:half]), ('step-54-candidates-2', g[half:]), ('step-55-candidates', o)):
        (H / (name + '.json')).write_text(json.dumps(part, indent=1, ensure_ascii=False))
        print(name, len(part))
    (H / 'step-54-safety-candidates.json').write_text(json.dumps(safe, indent=1, ensure_ascii=False))
    print('safety (not sent)', len(safe))
else:
    by = {i['id']: i for i in items()}
    ok, bad = [], []
    for rf in sys.argv[2:]:
        for r in json.loads(Path(rf).read_text()):
            old = by.get(r['id'])
            if not old: bad.append((r['id'], ['unknown id'])); continue
            new = r['text'].strip()
            if new == old['text']: continue
            probs = pl.check(old['text'], new)
            limit = 26 if old['kind'] == 'glossary' else 26
            if max(len(s.split()) for s in re.split(r'(?<=[.!?])\s+', new)) > limit: probs.append('sentence over %d words' % limit)
            if ';' in new and ';' not in old['text']: probs.append('semicolon')
            if old['kind'] == 'glossary' and len(re.split(r'(?<=[.!?])\s+', new)) > 2: probs.append('more than 2 sentences')
            (bad if probs else ok).append((r['id'], probs, old['text'], new) if not probs else (r['id'], probs))
    print('ok', len(ok), 'bad', len(bad))
    for b in bad: print('BAD', b[0], '|', '; '.join(b[1]))
    Path(sys.argv[0]).with_name('pairs.json').write_text(json.dumps([{'id': a, 'old': c, 'new': d} for a, _, c, d in ok], indent=1, ensure_ascii=False))
    if cmd == 'apply':
        skip = set(json.loads(Path(sys.argv[0]).with_name('reject.json').read_text())) if Path(sys.argv[0]).with_name('reject.json').exists() else set()
        over = json.loads(Path(sys.argv[0]).with_name('override.json').read_text()) if Path(sys.argv[0]).with_name('override.json').exists() else {}
        new = {a: d for a, _, c, d in ok if a not in skip}; new.update(over)
        gt = G.read_text()
        def sub(m):
            k = 'g:' + json.loads(m.group(1))
            return '\t%s: %s%s' % (m.group(1), json.dumps(new[k], ensure_ascii=False), m.group(3)) if k in new else m.group(0)
        G.write_text(LINE.sub(sub, gt))
        mt = M.read_text(); n = 0
        for k, v in new.items():
            if k[0] in 'bf':
                o = json.dumps(by[k]['text'], ensure_ascii=False); assert mt.count(o) == 1, k
                mt = mt.replace(o, json.dumps(v, ensure_ascii=False)); n += 1
        M.write_text(mt)
        print('applied', len(new), 'manifest', n)
