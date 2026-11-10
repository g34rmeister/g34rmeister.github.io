"""Scaffold the next lesson of a chapter, so nobody has to read a whole page to copy its shell.

  python3 scripts/new_lesson.py 9 "Title of the Lesson" "One-line summary for the chapter page."
  python3 scripts/new_lesson.py 9 "Title" "Summary." --description "Search description, at most 155 characters."

The lesson gets the next free number in the chapter (lessons are appended, never renumbered).
It writes three things and prints what is left to do:

  robotics-<c>-<n>.html        shell copied from the chapter's last lesson, with an empty article
  assets/js/course-data.js     a lesson entry with empty objectives, keyTerms and keyPoints
  scripts/site_manifest.json   the one-line summary

The checks fail on purpose until the objectives, key terms, text and references are filled in.
New lessons need Gerald's approval first (see docs/handoff/omen-report.md).
"""
from html import escape
from pathlib import Path
import json
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from site_sync import CHAPTERS, ROOT, SITE  # noqa: E402

BODY = '''
                        <h2 class="article-section-title">01. TODO first section</h2>
                        <p>
                            TODO lesson text. Cite each claim like this<sup><a href="#ref-1">[1]</a></sup> and check it against the source before publishing.
                        </p>

                        <h2 class="article-section-title">02. Check your understanding</h2>
                        <ul class="article-spec-list">
                            <li class="article-spec-item">TODO question</li>
                        </ul>

                        <h2 class="article-section-title">03. References</h2>
                        <p class="references-note"></p>
                        <ol class="article-spec-list">
                            <li id="ref-1">TODO Author, &ldquo;Title.&rdquo; <a href="https://example.org/" target="_blank" rel="noopener noreferrer">example.org</a>.</li>
                        </ol>

'''


def main(argv):
    args, desc = list(argv), None
    if '--description' in args:
        i = args.index('--description')
        if i + 1 >= len(args):
            sys.exit(__doc__)
        desc = args[i + 1]
        del args[i:i + 2]
    if len(args) != 3 or not args[0].isdigit():
        sys.exit(__doc__)
    desc = desc or args[2]
    chapter = next((c for c in CHAPTERS if str(c['id']) == args[0]), None)
    if chapter is None:
        sys.exit(f'No chapter {args[0]}. Chapters: ' + ', '.join(str(c['id']) for c in CHAPTERS))
    title, blurb = args[1], args[2]
    last = chapter['lessons'][-1]
    new_id = f'{chapter["id"]}-{max(int(l["id"].split("-")[1]) for l in chapter["lessons"]) + 1}'
    label = f'{new_id.replace("-", ".")} {title}'
    page = ROOT / f'robotics-{new_id}.html'
    if page.exists():
        sys.exit(f'{page.name} already exists')

    # 1. The page: the last lesson's shell with this lesson's title, description and an empty article.
    html = (ROOT / last['url']).read_text(encoding='utf-8')
    head, rest = html.split('<!-- Course Navbar -->', 1)
    attr = lambda t: escape(t, quote=False).replace('"', '&quot;')  # noqa: E731
    full = f'{attr(label)} — Gerald Lê | robOSStics @ LSU'
    for pattern, value in [
            (r'(<title>).*?(</title>)', full),
            (r'(<meta (?:name|property)="(?:og:|twitter:)?title" content=").*?(" />)', full),
            (r'(<meta (?:name|property)="(?:og:|twitter:)?description" content=").*?(" />)', attr(desc)),
            (r'(<meta property="og:image:alt" content=").*?(" />)',
             f'{attr(label)}, part of robOSStics by Gerald Lê'),
            (r'(    robOSStics: ).*?(\n)', label)]:
        head, n = re.subn(pattern, lambda m: m.group(1) + value + m.group(2), head)
        if not n:
            sys.exit(f'{last["url"]}: shell changed, pattern not found: {pattern}')
    head = head.replace(f'{SITE}{last["url"]}', f'{SITE}{page.name}')
    rest, n = re.subn(r'(<h1 class="robotics-article-headline">).*?(</h1>)',
                      lambda m: m.group(1) + escape(label, quote=False) + m.group(2), rest)
    rest, m = re.subn(r'(<article class="robotics-article-body">\n).*?( *<!-- Footer Navigation -->)',
                      lambda mm: mm.group(1) + BODY + mm.group(2), rest, flags=re.S)
    if n != 1 or m != 1:
        sys.exit(f'{last["url"]}: shell changed, cannot find the headline or the article body')

    # 2. course-data.js: a new entry after the chapter's last lesson.
    data_path = ROOT / 'assets/js/course-data.js'
    lines = data_path.read_text(encoding='utf-8').split('\n')
    at = next((i for i, l in enumerate(lines) if l.lstrip().startswith(f'{{"id": "{last["id"]}"')), None)
    if at is None:
        sys.exit(f'course-data.js: cannot find the line for lesson {last["id"]}')
    indent = lines[at][:len(lines[at]) - len(lines[at].lstrip())]
    entry = {'id': new_id, 'minutes': 3, 'title': title, 'objectives': [], 'keyTerms': [], 'keyPoints': []}
    lines[at] = lines[at].rstrip().rstrip(',') + ','
    lines.insert(at + 1, indent + json.dumps(entry, ensure_ascii=False))

    # 3. site_manifest.json: the summary shown on the chapter page.
    man_path = ROOT / 'scripts/site_manifest.json'
    man_text = man_path.read_text(encoding='utf-8')
    manifest = json.loads(man_text)
    style = next((kw for kw in ({'indent': 1}, {'indent': 2}, {'indent': '\t'})
                  if json.dumps(manifest, ensure_ascii=False, **kw) == man_text.rstrip('\n')), None)
    if style is None:
        sys.exit('site_manifest.json: unknown formatting; add the summary by hand')
    manifest['chapters'][str(chapter['id'])]['blurbs'][new_id] = blurb

    page.write_text(head + '<!-- Course Navbar -->' + rest, encoding='utf-8')
    data_path.write_text('\n'.join(lines), encoding='utf-8')
    man_path.write_text(json.dumps(manifest, ensure_ascii=False, **style) + ('\n' if man_text.endswith('\n') else ''),
                        encoding='utf-8')
    print(f'''Created {page.name} ({label}) from the shell of {last["url"]}.
Left to do:
  1. Write the article in {page.name} (sections, Check your understanding, References).
  2. In assets/js/course-data.js fill objectives, keyTerms and keyPoints for "{new_id}"; add quiz
     questions to assets/js/quiz/ch{chapter['id']}.js and bump `version` in course-data.js if you add any.
  3. Add glossary definitions for new key terms (assets/js/glossary-data.js).
  4. python3 scripts/renumber_refs.py {page.name}
  5. Check every citation against its source and record it: python3 scripts/sources.py import FILE {new_id}
  6. python3 scripts/sources.py sync && python3 scripts/build_index.py && python3 scripts/site_sync.py
  7. Run the checks listed in CLAUDE.md.''')


if __name__ == '__main__':
    main(sys.argv[1:])
