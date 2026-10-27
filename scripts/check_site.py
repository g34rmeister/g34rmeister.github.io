"""Site checks that catch the mistakes agent reviews used to catch by hand.

  python3 scripts/check_site.py

Runs in CI (.github/workflows/site-sync.yml). Checks:
  citations   every lesson has a References list; each [N] points to a ref-N that exists,
              every ref is cited, refs are numbered by first use, no duplicate ids
  anchors     every href="#id" and href="page.html#id" points to an id that exists
  assets      every local src/href (images, css, js) points to a file that exists
  externals   links in References open in a new tab with rel="noopener noreferrer"
  course      course-data.js: quiz answers in range, quiz lessons exist, every key term
              has a glossary definition, every lesson page is listed and vice versa
Exit code 1 lists every failure.
"""
from html import unescape
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
ID_RE = re.compile(r'\sid="([^"]+)"')
CITE_RE = re.compile(r'<sup><a href="#ref-(\d+)">\[(\d+)\]</a></sup>')
failures = []


def fail(msg):
    failures.append(msg)


def lesson_key(p):
    return [int(x) if x.isdigit() else x for x in re.split(r'(\d+)', p.name)]


def pages():
    return sorted(ROOT.glob('*.html'), key=lesson_key)


def check_citations(page, text):
    refs_at = text.find('<li id="ref-1">')
    if refs_at < 0:
        fail(f'{page.name}: no References list (<li id="ref-1">)')
        return
    declared = re.findall(r'<li id="ref-(\d+)">', text)
    if declared != [str(i) for i in range(1, len(declared) + 1)]:
        fail(f'{page.name}: References are not numbered 1..{len(declared)} in order')
    order = []
    for href_n, label_n in CITE_RE.findall(text[:refs_at]):
        if href_n != label_n:
            fail(f'{page.name}: citation label [{label_n}] links to #ref-{href_n}')
        if href_n not in order:
            order.append(href_n)
    missing = sorted(set(order) - set(declared), key=int)
    uncited = sorted(set(declared) - set(order), key=int)
    if missing:
        fail(f'{page.name}: cited but not in References: {missing}')
    if uncited:
        fail(f'{page.name}: in References but never cited: {uncited}')
    if not missing and order != sorted(order, key=int):
        first_bad = next(n for i, n in enumerate(order) if int(n) != i + 1)
        fail(f'{page.name}: refs not numbered by first use (first out of order: [{first_bad}])')
    for num, body in re.findall(r'<li id="ref-(\d+)">(.*?)</li>', text, re.S):
        for a in re.findall(r'<a [^>]*href="https?://[^"]+"[^>]*>', body):
            if 'target="_blank"' not in a or 'rel="noopener noreferrer"' not in a:
                fail(f'{page.name}: ref-{num} external link needs target="_blank" rel="noopener noreferrer"')


def check_ids_and_links(all_pages):
    ids = {}
    texts = {}
    for page in all_pages:
        text = page.read_text(encoding='utf-8')
        texts[page.name] = text
        found = ID_RE.findall(re.sub(r'(?is)<script.*?</script>', '', text))
        dupes = sorted({i for i in found if found.count(i) > 1})
        if dupes:
            fail(f'{page.name}: duplicate ids {dupes[:5]}')
        ids[page.name] = set(found)
    for name, text in texts.items():
        body = re.sub(r'(?is)<script.*?</script>', '', text)
        for href in re.findall(r'href="([^"]+)"', body):
            href = unescape(href)
            if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:', 'data:')) or href in ('#', ''):
                continue
            target, _, anchor = href.partition('#')
            target = target.split('?')[0]
            if target and not (ROOT / target).exists():
                fail(f'{name}: link to missing file {target}')
                continue
            if anchor and (target or name).endswith('.html') and anchor not in ids.get(target or name, set()):
                fail(f'{name}: link to missing anchor {href}')
        for src in re.findall(r'\ssrc="([^"]+)"', body):
            if not src.startswith(('http://', 'https://', 'data:', '//')) and not (ROOT / src.split('?')[0]).exists():
                fail(f'{name}: missing file {src}')


def check_course(lesson_pages):
    js = ("global.window={};require(process.argv[1]);require(process.argv[2]);"
          "process.stdout.write(JSON.stringify({c: window.RISE_COURSE, g: Object.keys(window.RISE_GLOSSARY)}))")
    data = json.loads(subprocess.run(['node', '-e', js, str(ROOT / 'assets/js/course-data.js'),
                                      str(ROOT / 'assets/js/glossary-data.js')],
                                     capture_output=True, check=True, text=True, encoding="utf-8").stdout)
    course, glossary = data['c'], set(data['g'])
    lessons = {l['id']: l for ch in course['chapters'] for l in ch['lessons']}
    on_disk = {p.stem.replace('robotics-', '') for p in lesson_pages}
    for lid in sorted(set(lessons) - on_disk):
        fail(f'course-data.js: lesson {lid} has no robotics-{lid}.html')
    for lid in sorted(on_disk - set(lessons)):
        fail(f'robotics-{lid}.html is not in course-data.js')
    for lid, lesson in lessons.items():
        for term in lesson['keyTerms']:
            if term not in glossary:
                fail(f'glossary-data.js: no definition for key term "{term}" (lesson {lid})')
        if not lesson.get('objectives'):
            fail(f'course-data.js: lesson {lid} has no objectives')
    for chapter, questions in course['quizzes'].items():
        for i, q in enumerate(questions):
            where = f'course-data.js quiz {chapter} question {i + 1}'
            if q['lesson'] not in lessons:
                fail(f'{where}: unknown lesson {q["lesson"]}')
            elif not q['lesson'].startswith(f'{chapter}-'):
                fail(f'{where}: lesson {q["lesson"]} is not in chapter {chapter}')
            if not 0 <= q['answer'] < len(q['choices']):
                fail(f'{where}: answer index out of range')


def main():
    all_pages = pages()
    lesson_pages = [p for p in all_pages if re.fullmatch(r'robotics-\d+-\d+\.html', p.name)]
    for page in lesson_pages:
        check_citations(page, page.read_text(encoding='utf-8'))
    check_ids_and_links(all_pages)
    check_course(lesson_pages)
    if failures:
        print(f'{len(failures)} problems:')
        for f in failures:
            print(f'  {f}')
        return 1
    print(f'OK: {len(all_pages)} pages, {len(lesson_pages)} lessons: citations, anchors, assets and course data check out.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
