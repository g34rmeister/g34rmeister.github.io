"""Regenerate every list of lessons on the site from one source.

Sources:
  assets/js/course-data.js   chapters, lesson ids, titles, minutes (read with node)
  scripts/site_manifest.json chapter navbar label and icon, one-line lesson summaries

Generated (only these regions are touched; everything else in a page is left alone):
  sitemap.xml                         one <url> per page (keeps existing lastmod/priority)
  .github/workflows/site-hygiene.yml  the (chapter, lesson count) tuple in the page-set check
  robotics.html                       lesson rows in each chapter's feed
  chapter pages                       "Articles in this chapter" list and footer nav
  lesson pages                        prev/next footer nav, source-check line under References
                                      (counts from docs/sources.json)
  every robotics-* page               navbar and drawer links; ?v= on assets/ links set to a
                                      hash of the file, so caches refresh exactly when it changes
  assets/js/course-data.js            each lesson's "minutes" (reading time computed from the page)
  lesson pages                        a schema.org LearningResource JSON-LD block in <head>
  robotics-teaching.html              the per-chapter table (lessons, minutes, quiz questions)
  footer "last updated" fallback      the page's last commit month (written locally only, never
                                      checked in CI, because CI checkouts are shallow)

Usage (from the repo root):
  python3 scripts/site_sync.py          # rewrite out-of-date regions
  python3 scripts/site_sync.py --check  # CI: exit 1 and list files that would change

Adding a lesson: create robotics-<c>-<n>.html, add it to course-data.js and a summary to
site_manifest.json, then run this script.
"""
from datetime import date
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://g34rmeister.github.io/'
SITE_PAGES = ['index.html', 'about.html', 'affiliations.html', 'portfolio.html', 'project-sample.html',
              'resume.html', 'contact.html']
EXTRA_COURSE_PAGES = ['robotics-quiz.html']
TRAILING_COURSE_PAGES = ['robotics-oss-map.html', 'robotics-teaching.html', 'robotics-method.html', 'robotics-glossary.html']
REPO_EDIT = 'https://github.com/g34rmeister/g34rmeister.github.io/edit/main/'  # 'Suggest an edit' link in each lesson


def load_course():
    js = ("global.window={};require(process.argv[1]);"
          "process.stdout.write(JSON.stringify(window.RISE_COURSE.chapters))")
    out = subprocess.run(['node', '-e', js, str(ROOT / 'assets/js/course-data.js')],
                         capture_output=True, check=True, text=True, encoding="utf-8").stdout
    chapters = json.loads(out)
    manifest = json.loads((ROOT / 'scripts/site_manifest.json').read_text(encoding='utf-8'))['chapters']
    for ch in chapters:
        extra = manifest[str(ch['id'])]
        ch['nav'], ch['icon'] = extra['nav'], extra['icon']
        for lesson in ch['lessons']:
            lesson['url'] = f'robotics-{lesson["id"]}.html'
            lesson['label'] = f'{lesson["id"].replace("-", ".")} {lesson["title"]}'
            if lesson['id'] not in extra['blurbs']:
                sys.exit(f'scripts/site_manifest.json: add a summary for lesson {lesson["id"]}')
            lesson['blurb'] = extra['blurbs'][lesson['id']]
    return chapters


def load_quiz_counts():
    js = ("global.window={};require(process.argv[1]);"
          "const q=window.RISE_COURSE.quizzes,o={};for(const k in q)o[k]=(q[k].questions||q[k]).length;"
          "process.stdout.write(JSON.stringify(o))")
    out = subprocess.run(['node', '-e', js, str(ROOT / 'assets/js/course-data.js')],
                         capture_output=True, check=True, text=True, encoding="utf-8").stdout
    return json.loads(out)


def reading_minutes(lesson_url):
    """Reading time of a lesson: prose at 200 words a minute, code at 100 (at least 3 minutes)."""
    text = (ROOT / lesson_url).read_text(encoding='utf-8')
    body = text[text.find('robotics-article-body'):]
    end = body.find('References</h2>')
    body = body[:end] if end > 0 else body
    code = sum(len(re.sub(r'<[^>]+>', ' ', c).split()) for c in re.findall(r'<pre[^>]*>(.*?)</pre>', body, re.S))
    prose = re.sub(r'<(pre|script|style|svg)[^>]*>.*?</\1>', ' ', body, flags=re.S)
    words = len(re.sub(r'<[^>]+>', ' ', prose).split())
    return max(3, round(words / 200 + code / 100))


def course_data(text):
    for ch in CHAPTERS:
        for lesson in ch['lessons']:
            pat = r'(\{"id": "%s", "minutes": )\d+' % re.escape(lesson['id'])
            if not re.search(pat, text):
                sys.exit(f'assets/js/course-data.js: cannot find "minutes" for lesson {lesson["id"]}')
            text = re.sub(pat, lambda m: m.group(1) + str(MINUTES[lesson['id']]), text, count=1)
    return text


NEW_TEXT = {}  # files rewritten earlier in this run, so asset hashes see their new content


def stamp_assets(text):
    def repl(m):
        path = m.group(1)
        data = NEW_TEXT.get(path)
        raw = data.encode('utf-8') if data is not None else (ROOT / path).read_bytes()
        return f'{path}?v={hashlib.sha1(raw).hexdigest()[:8]}{m.group(3)}'
    return re.sub(r'(assets/(?:js|css)/[A-Za-z0-9_.-]+\.(?:js|css))(\?v=[^"\']*)?(["\'])', repl, text)


def lesson_jsonld(text, lesson, where):
    m = re.search(r'<meta name="description" content="([^"]*)"', text)
    data = {'@context': 'https://schema.org', '@type': 'LearningResource',
            'name': f'{lesson["id"].replace("-", ".")} {lesson["title"]}', 'url': SITE + lesson['url'],
            'description': m.group(1) if m else '', 'inLanguage': 'en', 'learningResourceType': 'Lesson',
            'educationalLevel': 'Beginner', 'timeRequired': f'PT{MINUTES[lesson["id"]]}M',
            'teaches': lesson.get('keyTerms', []),
            'isPartOf': {'@type': 'Course', 'name': 'robOSStics', 'url': SITE + 'robotics.html'},
            'author': {'@type': 'Person', 'name': 'Gerald Lê'},
            'license': 'https://creativecommons.org/licenses/by-sa/4.0/'}
    block = ('<script type="application/ld+json" id="lesson-ld">\n'
             + json.dumps(data, ensure_ascii=False, indent=4).replace('\n', '\n        ')
             + '\n        </script>')
    if 'id="lesson-ld"' in text:
        return re.sub(r'<script type="application/ld\+json" id="lesson-ld">.*?</script>', lambda _: block, text, count=1, flags=re.S)
    if '</head>' not in text:
        sys.exit(f'{where}: no </head>')
    return text.replace('</head>', '    ' + block + '\n    </head>', 1)


def teaching_page(text, where):
    text = sync_navbars(text, None, where)
    rows = []
    for ch in CHAPTERS:
        mins = sum(MINUTES[l['id']] for l in ch['lessons'])
        note = 'Optional' if ch['title'].startswith('Extra') else ''
        rows.append(f'{" " * 36}<tr><td>{ch["id"]}</td><td><a href="{ch["url"]}">{ch["title"]}</a></td>'
                    f'<td>{len(ch["lessons"])}</td><td>{mins}</td><td>{QUIZ_COUNTS.get(str(ch["id"]), 0)}</td><td>{note}</td></tr>')
    text = re.sub(r'(<table class="article-table"[^>]*>\s*<thead>.*?</thead>\s*<tbody>)(.*?)(\s*</tbody>)',
                  lambda m: m.group(1) + '\n' + '\n'.join(rows) + m.group(3), text, count=1, flags=re.S)
    # Keep the two totals in the intro sentence current, if that wording is still there.
    total = sum(MINUTES.values())
    core = total - sum(MINUTES[l['id']] for ch in CHAPTERS if ch['title'].startswith('Extra') for l in ch['lessons'])
    text = re.sub(r'come to about \d+ minutes \(roughly \d+ hours\)', f'come to about {total} minutes (roughly {round(total / 60)} hours)', text)
    return re.sub(r'or about \d+ minutes \(roughly \d+ hours\) without', f'or about {core} minutes (roughly {round(core / 60)} hours) without', text)


def last_commit_month(path):
    out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', path], cwd=ROOT,
                         capture_output=True, text=True).stdout.strip()
    return date.fromisoformat(out).strftime('%B %Y') if out else None



def card(href, direction, target, right=False, indent=32):
    pad = ' ' * indent
    style = ' style="text-align: right;"' if right else ''
    return (f'{pad}<a href="{href}" class="article-nav-card"{style}>\n'
            f'{pad}    <span class="article-nav-dir">{direction}</span>\n'
            f'{pad}    <span class="article-nav-target">{target}</span>\n'
            f'{pad}</a>\n')


def footer_nav(left, right):
    return ('<div class="article-footer-nav">\n' + card(*left) + card(*right, right=True)
            + ' ' * 28 + '</div>')


def replace_once(text, pattern, new, where):
    matches = list(re.finditer(pattern, text, re.S))
    if len(matches) != 1:
        sys.exit(f'{where}: expected one match for {pattern!r}, found {len(matches)}')
    m = matches[0]
    return text[:m.start(1)] + new + text[m.end(1):]


def chapter_title(ch):
    return f'Chapter {ch["id"]}: {ch["title"]}'


def nav_links(chapters, active, drawer):
    items = [('robotics.html', 'fa-home', 'Course Home')]
    items += [(ch['url'], ch['icon'], ch['nav']) for ch in chapters]
    items += [('robotics-quiz.html', 'fa-question-circle', 'Quizzes'),
              ('robotics.html#thesis-cite', 'fa-quote-right', 'Citation (BibTeX)' if drawer else 'Cite')]
    lines = []
    for href, icon, label in items:
        cls = ' class="active"' if href == active else ''
        link = f'<a href="{href}"{cls}><i class="fas {icon}"></i> {label}</a>'
        lines.append(' ' * 20 + link if drawer else ' ' * 24 + f'<li>{link}</li>')
    if drawer:
        lines.append(' ' * 20 + '<a href="index.html" class="drawer-return"><i class="fas fa-arrow-left"></i> Return to Main Portfolio</a>')
    return '\n' + '\n'.join(lines) + '\n' + ' ' * (16 if drawer else 20)


def sync_navbars(text, active, where):
    text = replace_once(text, r'<ul class="thesis-nav-links">(.*?)</ul>', nav_links(CHAPTERS, active, False), where)
    return replace_once(text, r'<div class="thesis-drawer-links">(.*?)</div>', nav_links(CHAPTERS, active, True), where)


def load_source_status():
    """{lesson: (counts by status, latest check date)} from docs/sources.json, counting each ref once."""
    sys.path.insert(0, str(ROOT / 'scripts'))
    import sources
    reg = sources.load()
    latest = {}
    for entry in reg['sources'].values():
        for lesson, check in entry.get('checks', {}).items():
            latest[lesson] = max(latest.get(lesson, ''), check.get('checked', ''))
    return {lesson: (counts, latest.get(lesson, '')) for lesson, counts in sources.lesson_status(reg).items()}


def references_note(lesson_id, url=None):
    counts, checked = SOURCE_STATUS.get(lesson_id, ({}, ''))
    total = sum(counts.values())
    match = counts.get('verified', 0) + counts.get('fixed', 0)
    parts = [f'{match} of {total} references match their source text']
    if counts.get('partial'):
        n = counts['partial']
        parts.append(f'{n} supports only part of its sentence' if n == 1 else f'{n} support only part of their sentence')
    if counts.get('unreachable'):
        parts.append(f'{counts["unreachable"]} could not be opened (paywall, book or blocked site)')
    problems = sum(counts.get(s, 0) for s in ('dead', 'mismatch', 'unchecked'))
    if problems:
        parts.append(f'{problems} still need fixing')
    when = date.fromisoformat(checked).strftime('%B %Y') if checked else 'not yet'
    return (f'Source check ({when}): ' + '; '.join(parts) + '. How these sources were chosen and checked: '
            '<a href="robotics-method.html">How this course was made</a>.' + (
                f' Spot a mistake or know a better source? <a href="{REPO_EDIT}{url}" target="_blank" '
                'rel="noopener noreferrer">Suggest an edit on GitHub</a>.' if url else ''))


def lesson_page(text, ch, i, where):
    text = lesson_jsonld(text, ch['lessons'][i], where)
    text = replace_once(text, r'<p class="references-note">(.*?)</p>', references_note(ch['lessons'][i]['id'], ch['lessons'][i]['url']), where)
    lessons = ch['lessons']
    if i == 0:
        left = (ch['url'], '&lt;- Previous', f'Chapter {ch["id"]} overview')
    else:
        left = (lessons[i - 1]['url'], '&lt;- Previous', lessons[i - 1]['label'])
    nxt = CHAPTERS[CHAPTERS.index(ch) + 1] if ch is not CHAPTERS[-1] else None
    if i + 1 < len(lessons):
        right = (lessons[i + 1]['url'], 'Next -&gt;', lessons[i + 1]['label'])
    elif nxt:
        right = (nxt['url'], 'Next chapter -&gt;', chapter_title(nxt))
    else:
        right = ('robotics.html', 'Finished -&gt;', 'Course home')
    text = replace_once(text, r'(<div class="article-footer-nav">.*?</div>)', footer_nav(left, right), where)
    return sync_navbars(text, ch['url'], where)


def chapter_page(text, ch, where):
    k = CHAPTERS.index(ch)
    left = (('robotics.html', '&lt;- Course home', 'All chapters') if k == 0 else
            (CHAPTERS[k - 1]['url'], '&lt;- Previous chapter', chapter_title(CHAPTERS[k - 1])))
    first = ch['lessons'][0]
    text = replace_once(text, r'(<div class="article-footer-nav">.*?</div>)',
                        footer_nav(left, (first['url'], 'Start reading -&gt;', first['label'])), where)
    items = ''.join(f'\n{" " * 32}<li><a href="{l["url"]}">{l["label"]}</a>: {l["blurb"]}</li>' for l in ch['lessons'])
    text = replace_once(text, r'Articles in this chapter</h2>\s*<ol class="article-spec-list">(.*?)</ol>',
                        items + '\n' + ' ' * 28, where)
    return sync_navbars(text, ch['url'], where)


def hub_page(text, where):
    for ch in CHAPTERS:
        rows = ''.join(
            f'{" " * 36}<a href="{l["url"]}" class="hltv-feed-row">\n'
            f'{" " * 40}<span class="hltv-row-title">{l["label"]}</span>\n'
            f'{" " * 40}<div class="hltv-row-meta">\n'
            f'{" " * 44}<span class="hltv-row-time">{l["minutes"]} min</span>\n'
            f'{" " * 40}</div>\n'
            f'{" " * 36}</a>\n' for l in ch['lessons'])
        pattern = (rf'id="chapter-{ch["id"]}-feed"[^>]*>.*?</a>\n'
                   rf'((?:\s*<a href="robotics-\d+-\d+\.html" class="hltv-feed-row">.*?</a>\n)+)')
        text = replace_once(text, pattern, rows, where)
    return sync_navbars(text, 'robotics.html', where)


def sitemap(text):
    old = {}
    for block in re.findall(r'<url>(.*?)</url>', text, re.S):
        loc = re.search(r'<loc>(.*?)</loc>', block).group(1)
        old[loc] = block
    pages = SITE_PAGES + ['robotics.html'] + [ch['url'] for ch in CHAPTERS] + EXTRA_COURSE_PAGES
    pages += [l['url'] for ch in CHAPTERS for l in ch['lessons']] + TRAILING_COURSE_PAGES
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for page in pages:
        loc = SITE if page == 'index.html' else SITE + page
        block = old.get(loc) or (f'\n        <loc>{loc}</loc>\n        <lastmod>{date.today().isoformat()}</lastmod>\n'
                                 f'        <changefreq>monthly</changefreq>\n        <priority>0.6</priority>\n    ')
        out.append(f'    <url>{block}</url>')
    return '\n'.join(out) + '\n</urlset>\n'


def hygiene_workflow(text, where):
    counts = ', '.join(f'({ch["id"]}, {len(ch["lessons"])})' for ch in CHAPTERS)
    return replace_once(text, r'for c, count in \((.*?)\) for n in', counts, where)


def page_jobs():
    jobs = {'assets/js/course-data.js': course_data,
            'sitemap.xml': sitemap,
            '.github/workflows/site-hygiene.yml': lambda t: hygiene_workflow(t, 'site-hygiene.yml'),
            'robotics.html': lambda t: hub_page(t, 'robotics.html')}
    for ch in CHAPTERS:
        jobs[ch['url']] = lambda t, ch=ch: chapter_page(t, ch, ch['url'])
        for i, lesson in enumerate(ch['lessons']):
            jobs[lesson['url']] = lambda t, ch=ch, i=i, u=lesson['url']: lesson_page(t, ch, i, u)
    jobs['robotics-quiz.html'] = lambda t: sync_navbars(t, 'robotics-quiz.html', 'robotics-quiz.html')
    for page in TRAILING_COURSE_PAGES:
        jobs[page] = lambda t, p=page: sync_navbars(t, None, p)
    jobs['robotics-teaching.html'] = lambda t: teaching_page(t, 'robotics-teaching.html')
    return jobs


def main(check):
    stale = []
    for name, job in page_jobs().items():
        path = ROOT / name
        if not path.exists():
            sys.exit(f'{name} is listed in course-data.js but the file does not exist')
        text = path.read_text(encoding='utf-8')
        new = job(text)
        if name.startswith('robotics') and name.endswith('.html'):
            new = stamp_assets(new)
            if not check:
                month = last_commit_month(name)
                if month:
                    new = re.sub(r'(<span data-build-date>)[^<]*(</span>)', lambda m: m.group(1) + month + m.group(2), new)
        if name.startswith('assets/'):
            NEW_TEXT[name] = new
        if new != text:
            stale.append(name)
            if not check:
                path.write_text(new, encoding='utf-8')
    if check and stale:
        print('Out of sync with course-data.js / scripts/site_manifest.json. Run: python3 scripts/site_sync.py')
        for name in stale:
            print(f'  {name}')
        return 1
    print(f'{"Would update" if check else "Updated"} {len(stale)} files.' if stale else 'OK: all lesson lists and navigation are in sync.')
    return 0


CHAPTERS = load_course()
SOURCE_STATUS = load_source_status()
QUIZ_COUNTS = load_quiz_counts()
MINUTES = {l['id']: reading_minutes(l['url']) for ch in CHAPTERS for l in ch['lessons']}
for _ch in CHAPTERS:  # pages built in this run use the new minutes, not the ones course-data.js had
    for _l in _ch['lessons']:
        _l['minutes'] = MINUTES[_l['id']]

if __name__ == '__main__':
    sys.exit(main('--check' in sys.argv))
