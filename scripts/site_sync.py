"""Regenerate every list of lessons on the site from one source.

Sources:
  assets/js/course-data.js   chapters, lesson ids, titles, minutes (read with node)
  scripts/site_manifest.json chapter navbar label and icon, one-line lesson summaries

Generated (only these regions are touched; everything else in a page is left alone):
  sitemap.xml                         one <url> per page (keeps existing lastmod/priority)
  .github/workflows/site-hygiene.yml  the chapter page names and the (chapter, lesson count) tuple in the page-set check
  robotics.html                       lesson rows in each chapter's feed; a whole chapter block (header, featured
                                      card from the manifest, rows, quiz row) when a chapter has none
  chapter pages                       "Articles in this chapter" list and footer nav
  lesson pages                        prev/next footer nav, source-check line under References
                                      (counts from docs/sources.json)
  every robotics-* page               navbar and drawer links; ?v= on assets/ links set to a
                                      hash of the file, so caches refresh exactly when it changes
  assets/js/course-data.js            each lesson's "minutes" (reading time computed from the page) and
                                      "quizCounts" (questions per chapter, counted in assets/js/quiz/ch<N>.js)
  lesson pages                        a schema.org LearningResource JSON-LD block in <head>
  robotics-teaching.html              the per-chapter table (lessons, minutes, quiz questions)
  robotics-quiz.html                  the list of chapter quizzes
  lesson pages, robotics-oss-map.html the 'Open source in this lesson' box, and the map's anchors and
                                      'Used in these lessons' lines (from ossProjects in the manifest)
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
        for key in ('featuredTitle', 'featuredDesc'):
            if key not in extra:
                sys.exit(f'scripts/site_manifest.json: chapter {ch["id"]} needs "{key}" (the featured card on robotics.html)')
        ch['featuredTitle'], ch['featuredDesc'] = extra['featuredTitle'], extra['featuredDesc']
        for lesson in ch['lessons']:
            lesson['url'] = f'robotics-{lesson["id"]}.html'
            lesson['label'] = f'{lesson["id"].replace("-", ".")} {lesson["title"]}'
            if lesson['id'] not in extra['blurbs']:
                sys.exit(f'scripts/site_manifest.json: add a summary for lesson {lesson["id"]}')
            lesson['blurb'] = extra['blurbs'][lesson['id']]
    return chapters


def load_quiz_counts():
    """Questions per chapter, counted in assets/js/quiz/ch<N>.js (course-data.js holds only quizCounts)."""
    js = ("global.window={};const fs=require('fs'),path=require('path');require(process.argv[1]);"
          "const d=process.argv[2];for(const f of fs.readdirSync(d).sort())if(/^ch\\d+\\.js$/.test(f))require(path.join(d,f));"
          "const q=window.RISE_COURSE.quizzes,o={};for(const k in q)o[k]=q[k].length;"
          "process.stdout.write(JSON.stringify(o))")
    out = subprocess.run(['node', '-e', js, str(ROOT / 'assets/js/course-data.js'), str(ROOT / 'assets/js/quiz')],
                         capture_output=True, check=True, text=True, encoding="utf-8").stdout
    return json.loads(out)


def reading_minutes(lesson_url):
    """Reading time of a lesson: prose at 200 words a minute, code at 100 (at least 3 minutes)."""
    text = (ROOT / lesson_url).read_text(encoding='utf-8')
    body = text[text.find('robotics-article-body'):]
    end = body.find('References</h2>')
    body = body[:end] if end > 0 else body
    body = re.sub(r'<!-- oss-note -->.*?<!-- /oss-note -->', ' ', body, flags=re.S)  # generated box, not lesson text
    body = re.sub(r'<details class="check-answer">.*?</details>', ' ', body, flags=re.S)  # self-check answers, not reading time
    code = sum(len(re.sub(r'<[^>]+>', ' ', c).split()) for c in re.findall(r'<pre[^>]*>(.*?)</pre>', body, re.S))
    prose = re.sub(r'<(pre|script|style|svg)[^>]*>.*?</\1>', ' ', body, flags=re.S)
    words = len(re.sub(r'<[^>]+>', ' ', prose).split())
    return max(3, round(words / 200 + code / 100))


def course_data(text):
    counts = ', '.join(f'{k}: {QUIZ_COUNTS[k]}' for k in sorted(QUIZ_COUNTS, key=int))
    if not re.search(r'quizCounts: \{[^}]*\}', text):
        sys.exit('assets/js/course-data.js: cannot find "quizCounts"')
    text = re.sub(r'quizCounts: \{[^}]*\}', lambda _: f'quizCounts: {{{counts}}}', text, count=1)
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


def lesson_header_nav(ch, i, left, right):
    """Breadcrumb (Course home > Chapter > this lesson) and a compact position line with previous/next near the top."""
    lessons = ch['lessons']
    crumbs = ('<nav class="article-breadcrumb-bar" aria-label="Breadcrumb">\n'
              '                                <a href="robotics.html" class="article-breadcrumb-link">Course Home</a>\n'
              '                                <span class="article-breadcrumb-divider" aria-hidden="true">/</span>\n'
              f'                                <a href="{ch["url"]}">Chapter {ch["id"]} &middot; {ch["title"]}</a>\n'
              '                                <span class="article-breadcrumb-divider" aria-hidden="true">/</span>\n'
              f'                                <span aria-current="page">{lessons[i]["id"].replace("-", ".")}</span>\n'
              '                            </nav>')
    prev = f'<a class="lesson-quicknav-prev" href="{left[0]}"><span aria-hidden="true">&larr;</span> Previous<span class="sr-only">: {left[2]}</span></a>'
    nxt = f'<a class="lesson-quicknav-next" href="{right[0]}">Next<span class="sr-only">: {right[2]}</span> <span aria-hidden="true">&rarr;</span></a>'
    quick = ('<nav class="lesson-quicknav" aria-label="Lesson position and previous or next lesson">\n'
             f'                                <span class="lesson-quicknav-pos">Chapter {ch["id"]}, lesson {i + 1} of {len(lessons)}</span>\n'
             f'                                {prev}\n                                {nxt}\n'
             '                            </nav>')
    return crumbs, quick


def replace_once(text, pattern, new, where):
    matches = list(re.finditer(pattern, text, re.S))
    if len(matches) != 1:
        sys.exit(f'{where}: expected one match for {pattern!r}, found {len(matches)}')
    m = matches[0]
    return text[:m.start(1)] + new + text[m.end(1):]


def chapter_title(ch):
    return f'Chapter {ch["id"]}: {ch["title"]}'


def nav_links(chapters, active, drawer):
    """Drawer: the full flat list. Desktop row: Course Home, one 'Chapters' <details> menu, Quizzes, Cite."""
    def link(href, icon, label, extra=''):
        cls = ' class="active" aria-current="page"' if href == active else ''
        return f'<a href="{href}"{cls}{extra}><i class="fas {icon}" aria-hidden="true"></i> {label}</a>'
    tail = [('robotics-quiz.html', 'fa-question-circle', 'Quizzes'),
            ('robotics.html#thesis-cite', 'fa-quote-right', 'Citation (BibTeX)' if drawer else 'Cite')]
    lines = []
    if drawer:
        items = [('robotics.html', 'fa-home', 'Course Home')]
        items += [(ch['url'], ch['icon'], ch['nav']) for ch in chapters]
        for href, icon, label in items + tail:
            lines.append(' ' * 20 + link(href, icon, label))
        lines.append(' ' * 20 + '<a href="index.html" class="drawer-return"><i class="fas fa-arrow-left" aria-hidden="true"></i> Return to Main Portfolio</a>')
        return '\n' + '\n'.join(lines) + '\n' + ' ' * 16
    pad = ' ' * 24
    lines.append(f'{pad}<li>{link("robotics.html", "fa-home", "Course Home")}</li>')
    in_chapter = any(ch['url'] == active for ch in chapters)
    cls = ' class="active"' if in_chapter else ''
    lines.append(f'{pad}<li class="nav-chapters">')
    lines.append(f'{pad}    <details class="nav-menu">')
    lines.append(f'{pad}        <summary{cls}>Chapters</summary>')
    lines.append(f'{pad}        <ul class="nav-menu-list">')
    for ch in chapters:
        cur = ' aria-current="page"' if ch['url'] == active else ''
        lines.append(f'{pad}            <li><a href="{ch["url"]}"{cur}><span class="nav-menu-num">{ch["id"]}</span> {ch["nav"]}</a></li>')
    lines.append(f'{pad}        </ul>')
    lines.append(f'{pad}    </details>')
    lines.append(f'{pad}</li>')
    for href, icon, label in tail:
        lines.append(f'{pad}<li>{link(href, icon, label)}</li>')
    return '\n' + '\n'.join(lines) + '\n' + ' ' * 20


def nav_search(kind):
    """The search control: 'nav' sits in the desktop navbar, 'drawer' at the top of the mobile drawer.
    Hidden until learning.js has the course data to search; it fills the list and announces the count."""
    pad = ' ' * (24 if kind == 'nav' else 16)
    cls = 'nav-search' + (' nav-search-drawer' if kind == 'drawer' else '')
    lines = [f'<!-- {kind}-search -->',
             f'<div class="{cls}" role="search" aria-label="{"Search the course (menu)" if kind == "drawer" else "Search the course"}" hidden>',
             f'    <label class="sr-only" for="{kind}-search-input">Search lessons and glossary terms (press / to focus)</label>',
             '    <i class="fas fa-search" aria-hidden="true"></i>',
             f'    <input type="search" id="{kind}-search-input" class="nav-search-input" placeholder="Search" autocomplete="off" '
             f'role="combobox" aria-expanded="false" aria-controls="{kind}-search-list" aria-autocomplete="list" aria-keyshortcuts="/">',
             f'    <ul class="nav-search-results" id="{kind}-search-list" role="listbox" aria-label="Search results" hidden></ul>',
             '    <p class="nav-search-status sr-only" role="status" aria-live="polite"></p>',
             '</div>',
             f'<!-- /{kind}-search -->']
    return '\n'.join((pad + l) if i else l for i, l in enumerate(lines))


def sync_block(text, kind, anchor, where):
    """Replace the marked search block, or insert it directly after (nav) / before (drawer) its anchor line."""
    block = nav_search(kind)
    pat = re.compile(rf'<!-- {kind}-search -->.*?<!-- /{kind}-search -->', re.S)
    if pat.search(text):
        return pat.sub(lambda _: block, text, count=1)
    m = list(re.finditer(anchor, text))
    if len(m) != 1:
        sys.exit(f'{where}: expected one anchor {anchor!r} for the {kind} search, found {len(m)}')
    pad = ' ' * (24 if kind == 'nav' else 16)
    if kind == 'nav':
        return text[:m[0].end()] + '\n' + pad + block + text[m[0].end():]
    return text[:m[0].start()] + block + '\n' + pad + text[m[0].start():]


def sync_navbars(text, active, where):
    text = replace_once(text, r'<ul class="thesis-nav-links">(.*?)</ul>(?=\s*<div class="thesis-nav-actions">)', nav_links(CHAPTERS, active, False), where)
    text = replace_once(text, r'<div class="thesis-drawer-links">(.*?)</div>', nav_links(CHAPTERS, active, True), where)
    text = sync_block(text, 'nav', r'<div class="thesis-nav-actions">', where)
    return sync_block(text, 'drawer', r'<div class="thesis-drawer-links">', where)


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


def join_words(items):
    return items[0] if len(items) == 1 else ', '.join(items[:-1]) + ' and ' + items[-1]


OSS_NOTE = re.compile(r'[ \t]*<!-- oss-note -->.*?<!-- /oss-note -->\n\n', re.S)
OSS_NOTE_SKIP_CHAPTERS = {3}  # Chapter 3 is the contribution chapter itself (Gerald's prose)


def oss_note(text, lesson, where):
    """The 'Open source in this lesson' box before the References heading, from ossProjects in the manifest."""
    text = OSS_NOTE.sub('', text)
    used = [p for p in OSS_PROJECTS if lesson['id'] in p['lessons']]
    if not used or int(lesson['id'].split('-')[0]) in OSS_NOTE_SKIP_CHAPTERS:
        return text
    links = join_words([f'<a href="robotics-oss-map.html#{p["id"]}">{p["name"]}</a>' for p in used])
    pad = ' ' * 28
    box = (f'{pad}<!-- oss-note -->\n{pad}<div class="article-callout oss-note">\n'
           f'{pad}    <div class="article-callout-header"><i class="fas fa-code-branch"></i> Open source in this lesson</div>\n'
           f'{pad}    <p>Projects used or discussed here: {links}. The <a href="robotics-oss-map.html">Robotics Open-Source Map</a> shows '
           f'{"its" if len(used) == 1 else "each project&rsquo;s"} licence, where the code lives and how to make a first contribution.</p>\n'
           f'{pad}</div>\n{pad}<!-- /oss-note -->\n\n')
    matches = list(re.finditer(r'[ \t]*<h2 class="article-section-title">\d+\. References</h2>', text))
    if len(matches) != 1:
        sys.exit(f'{where}: expected one References heading, found {len(matches)}')
    return text[:matches[0].start()] + box + text[matches[0].start():]


def quiz_page(text, where):
    """The chapter list on robotics-quiz.html: one link per chapter that has questions, in reading order."""
    items = ''.join(f'\n{" " * 36}<li><a href="robotics-quiz.html?chapter={ch["id"]}">Chapter {ch["id"]} quiz: {ch["title"]}</a></li>'
                    for ch in CHAPTERS if QUIZ_COUNTS.get(str(ch['id'])))
    text = replace_once(text, r'<ul class="quiz-chapter-list">(.*?)</ul>', items + '\n' + ' ' * 32, where)
    return sync_navbars(text, 'robotics-quiz.html', where)


def oss_map_page(text, where):
    """Anchors and 'Used in these lessons' lines on the Open-Source Map, from ossProjects in the manifest."""
    labels = {l['id']: l for ch in CHAPTERS for l in ch['lessons']}
    for p in OSS_PROJECTS:
        used = join_words([f'<a href="{labels[i]["url"]}">{labels[i]["label"]}</a>' for i in p['lessons']])
        pattern = (r'(<h2 class="article-section-title"(?: id="[^"]*")?>(?=\d+\. ' + re.escape(p['name']) + r'</h2>)'
                   r'.*?<strong>Used in these lessons:</strong> .*?)</p>')
        matches = list(re.finditer(pattern, text, re.S))
        if len(matches) != 1:
            sys.exit(f'{where}: expected one section for {p["name"]!r}, found {len(matches)}')
        m = matches[0]
        block = re.sub(r'^<h2 class="article-section-title"(?: id="[^"]*")?>',
                       f'<h2 class="article-section-title" id="{p["id"]}">', m.group(1))
        block = block[:block.index('<strong>Used in these lessons:</strong> ')] + f'<strong>Used in these lessons:</strong> {used}.'
        text = text[:m.start(1)] + block + text[m.end(1):]
    return sync_navbars(text, None, where)


def lesson_page(text, ch, i, where):
    text = lesson_jsonld(text, ch['lessons'][i], where)
    text = oss_note(text, ch['lessons'][i], where)
    text = replace_once(text, r'<p class="references-note">(.*?)</p>', references_note(ch['lessons'][i]['id'], ch['lessons'][i]['url']), where)
    lessons = ch['lessons']
    if i == 0:
        left = (ch['url'], '&larr; Previous', f'Chapter {ch["id"]} overview')
    else:
        left = (lessons[i - 1]['url'], '&larr; Previous', lessons[i - 1]['label'])
    nxt = CHAPTERS[CHAPTERS.index(ch) + 1] if ch is not CHAPTERS[-1] else None
    if i + 1 < len(lessons):
        right = (lessons[i + 1]['url'], 'Next &rarr;', lessons[i + 1]['label'])
    elif nxt:
        right = (nxt['url'], 'Next chapter &rarr;', chapter_title(nxt))
    else:
        right = ('robotics.html', 'Finished &rarr;', 'Course home')
    text = replace_once(text, r'(<div class="article-footer-nav">.*?</div>)', footer_nav(left, right), where)
    crumbs, quick = lesson_header_nav(ch, i, left, right)
    text = replace_once(text, r'(<(?:div|nav) class="article-breadcrumb-bar"[^>]*>.*?</(?:div|nav)>)', crumbs, where)
    if '<nav class="lesson-quicknav"' in text:
        text = replace_once(text, r'(<nav class="lesson-quicknav".*?</nav>)', quick, where)
    else:
        if len(re.findall(r'\n([ \t]*)</header>', text)) != 1:
            sys.exit(f'{where}: expected one masthead </header>')
        text = re.sub(r'\n([ \t]*)</header>', lambda m: '\n' + m.group(1) + '    ' + quick + '\n' + m.group(1) + '</header>', text, count=1)
    return sync_navbars(text, ch['url'], where)


def chapter_page(text, ch, where):
    k = CHAPTERS.index(ch)
    left = (('robotics.html', '&larr; Course home', 'All chapters') if k == 0 else
            (CHAPTERS[k - 1]['url'], '&larr; Previous chapter', chapter_title(CHAPTERS[k - 1])))
    first = ch['lessons'][0]
    text = replace_once(text, r'(<div class="article-footer-nav">.*?</div>)',
                        footer_nav(left, (first['url'], 'Start reading &rarr;', first['label'])), where)
    items = ''.join(f'\n{" " * 32}<li><a href="{l["url"]}">{l["label"]}</a>: {l["blurb"]}</li>' for l in ch['lessons'])
    text = replace_once(text, r'Articles in this chapter</h2>\s*<ol class="article-spec-list">(.*?)</ol>',
                        items + '\n' + ' ' * 28, where)
    return sync_navbars(text, ch['url'], where)


def hub_block(ch):
    """A whole chapter block of the hub (header button, featured card, lesson rows, quiz row), for a chapter that has none yet."""
    n = ch['id']
    out = [f'<!-- Chapter {n}: {ch["title"]} -->',
           '<div class="hltv-chapter-block reveal-on-scroll">',
           f'    <button type="button" class="hltv-chapter-header" aria-expanded="true" aria-controls="chapter-{n}-feed" id="chapter-{n}-header">',
           f'        <h3 class="hltv-chapter-title"><i class="fas fa-chevron-down hltv-chapter-chevron" aria-hidden="true"></i> Chapter {n}</h3>',
           f'        <span class="hltv-chapter-kicker">{ch["title"]}</span>',
           '    </button>',
           f'    <div class="hltv-feed-list" id="chapter-{n}-feed" role="region" aria-labelledby="chapter-{n}-header">',
           f'        <a href="{ch["url"]}" class="hltv-featured-card">',
           '            <div class="hltv-featured-body">',
           f'                <h4 class="hltv-featured-title">{ch["featuredTitle"]}</h4>',
           f'                <p class="hltv-featured-desc">{ch["featuredDesc"]}</p>',
           '            </div>',
           '        </a>',
           ] + [l.rstrip() for l in hub_rows(ch, 8).split('\n') if l.strip()]
    if QUIZ_COUNTS.get(str(n)):
        out += [f'        <a href="robotics-quiz.html?chapter={n}" class="hltv-feed-row">',
                '            <span class="hltv-row-title">Chapter %d quiz</span>' % n,
                '            <div class="hltv-row-meta">',
                '                <span class="hltv-row-time">check your understanding</span>',
                '            </div>',
                '        </a>']
    out += ['    </div>', '</div>']
    return '\n'.join(('' if i == 0 else ' ' * 28) + l for i, l in enumerate(out))


def hub_add_missing_blocks(text, where):
    """Create the hub block of every chapter that has none, after the previous chapter's block (or the last one)."""
    for k, ch in enumerate(CHAPTERS):
        if f'id="chapter-{ch["id"]}-feed"' in text:
            continue
        if k == 0:
            sys.exit(f'{where}: Chapter {ch["id"]} has no block and no earlier chapter to place it after; add it by hand once')
        prev = CHAPTERS[k - 1]['id']
        m = re.search(rf'id="chapter-{prev}-feed".*?\n {{32}}</div>\n {{28}}</div>\n', text, re.S)
        if not m:
            sys.exit(f'{where}: cannot find the end of the Chapter {prev} block to place Chapter {ch["id"]} after')
        text = text[:m.end()] + '\n' + ' ' * 28 + hub_block(ch) + '\n' + text[m.end():]
    return text


def hub_rows(ch, indent=36):
    pad = ' ' * indent
    return ''.join(
        f'{pad}<a href="{l["url"]}" class="hltv-feed-row">\n'
        f'{pad}    <span class="hltv-row-title">{l["label"]}</span>\n'
        f'{pad}    <div class="hltv-row-meta">\n'
        f'{pad}        <span class="hltv-row-time">{l["minutes"]} min</span>\n'
        f'{pad}    </div>\n'
        f'{pad}</a>\n' for l in ch['lessons'])


def hub_page(text, where):
    text = hub_add_missing_blocks(text, where)
    for ch in CHAPTERS:
        pattern = (rf'id="chapter-{ch["id"]}-feed"[^>]*>.*?</a>\n'
                   rf'((?:\s*<a href="robotics-\d+-\d+\.html" class="hltv-feed-row">.*?</a>\n)+)')
        text = replace_once(text, pattern, hub_rows(ch), where)
    return sync_navbars(text, 'robotics.html', where)


def sitemap(text):
    """Pages in reading order: the portfolio, the course hub, each chapter page followed by its lessons, then the extras."""
    old = {}
    for block in re.findall(r'<url>(.*?)</url>', text, re.S):
        loc = re.search(r'<loc>(.*?)</loc>', block).group(1)
        old[loc] = block
    groups = [('Portfolio', SITE_PAGES, None), ('robOSStics: course home', ['robotics.html'], None)]
    for ch in CHAPTERS:  # a chapter page ranks above its lessons
        groups.append((f'Chapter {ch["id"]}: {ch["title"]}', [ch['url']], '0.7'))
        groups.append((None, [l['url'] for l in ch['lessons']], '0.6'))
    groups.append(('Quizzes and reference pages', EXTRA_COURSE_PAGES + TRAILING_COURSE_PAGES, '0.6'))
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for title, pages, priority in groups:
        if title:
            out.append(f'    <!-- {title} -->')
        for page in pages:
            loc = SITE if page == 'index.html' else SITE + page
            block = old.get(loc) or (f'\n        <loc>{loc}</loc>\n        <lastmod>{date.today().isoformat()}</lastmod>\n'
                                     f'        <changefreq>monthly</changefreq>\n        <priority>{priority or "0.6"}</priority>\n    ')
            if priority:
                block = re.sub(r'<priority>[^<]*</priority>', f'<priority>{priority}</priority>', block)
            out.append(f'    <url>{block}</url>')
    return '\n'.join(out) + '\n</urlset>\n'


def hygiene_workflow(text, where):
    """The expected page set: the chapter page names, then the (chapter, lesson count) tuple, both from the course data."""
    names = [f"'{ch['url']}'," for ch in CHAPTERS]
    lines = [' '.join(names[i:i + 4]) for i in range(0, len(names), 4)]
    text = replace_once(text, r"'robotics\.html',\n {14}(.*?)(?=\s?'robotics-quiz\.html')", ('\n' + ' ' * 14).join(lines), where)
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
    jobs['robotics-quiz.html'] = lambda t: quiz_page(t, 'robotics-quiz.html')
    for page in TRAILING_COURSE_PAGES:
        jobs[page] = lambda t, p=page: sync_navbars(t, None, p)
    jobs['robotics-teaching.html'] = lambda t: teaching_page(t, 'robotics-teaching.html')
    jobs['robotics-oss-map.html'] = lambda t: oss_map_page(t, 'robotics-oss-map.html')
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
OSS_PROJECTS = json.loads((ROOT / 'scripts/site_manifest.json').read_text(encoding='utf-8')).get('ossProjects', [])
SOURCE_STATUS = load_source_status()
QUIZ_COUNTS = load_quiz_counts()
MINUTES = {l['id']: reading_minutes(l['url']) for ch in CHAPTERS for l in ch['lessons']}
for _ch in CHAPTERS:  # pages built in this run use the new minutes, not the ones course-data.js had
    for _l in _ch['lessons']:
        _l['minutes'] = MINUTES[_l['id']]

if __name__ == '__main__':
    sys.exit(main('--check' in sys.argv))
