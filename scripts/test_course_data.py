from pathlib import Path
import re
import sys
import json

root = Path('.')

# 1. Parse course-data.js
course_js = (root / 'assets/js/course-data.js').read_text(encoding='utf-8')

# Extract lessons
# Simple regex to get lesson entries
lesson_matches = re.finditer(r'\{\s*"id":\s*"(\d+-\d+)",\s*"minutes":\s*(\d+),\s*"title":\s*"([^"]+)",\s*"objectives":\s*\[(.*?)\],\s*"keyTerms":\s*\[(.*?)\]\s*\}', course_js, re.DOTALL)

lessons = {}
all_key_terms = set()
for m in lesson_matches:
    lid = m.group(1)
    mins = int(m.group(2))
    title = m.group(3)
    raw_objs = m.group(4)
    raw_terms = m.group(5)
    
    # parse objectives
    objs = [o.strip(' "\'') for o in re.findall(r'"((?:[^"\\]|\\.)*)"', raw_objs)]
    terms = [t.strip(' "\'') for t in re.findall(r'"((?:[^"\\]|\\.)*)"', raw_terms)]
    
    lessons[lid] = {
        'id': lid,
        'minutes': mins,
        'title': title,
        'objectives': objs,
        'keyTerms': terms
    }
    all_key_terms.update(terms)

print(f"Found {len(lessons)} lessons in course-data.js")

# Parse glossary
glossary_js = (root / 'assets/js/glossary-data.js').read_text(encoding='utf-8')
glossary_terms = set(re.findall(r'^\s*"((?:[^"\\]|\\.)+)":\s*"', glossary_js, re.MULTILINE))
print(f"Found {len(glossary_terms)} terms in glossary-data.js")

missing_glossary = all_key_terms - glossary_terms
if missing_glossary:
    print(f"ERROR: {len(missing_glossary)} key terms missing from glossary:")
    for t in sorted(missing_glossary):
        print(f"  - {t}")
else:
    print("OK: All keyTerms are defined in glossary-data.js")

# Check all quiz questions: they live in assets/js/quiz/ch<N>.js, with only quizCounts in course-data.js
import subprocess
js = ("global.window={};const fs=require('fs'),path=require('path');require(path.resolve('assets/js/course-data.js'));"
      "const d=path.resolve('assets/js/quiz');for(const f of fs.readdirSync(d).sort())if(/^ch\\d+\\.js$/.test(f))require(path.join(d,f));"
      "process.stdout.write(JSON.stringify(window.RISE_COURSE))")
course = json.loads(subprocess.run(['node', '-e', js], capture_output=True, check=True, text=True, encoding='utf-8').stdout)
errors = 0
counts = {str(k): v for k, v in course.get('quizCounts', {}).items()}
if counts != {k: len(v) for k, v in course['quizzes'].items()}:
    print("ERROR: quizCounts in course-data.js does not match the quiz files (run scripts/site_sync.py)")
    errors += 1
for ch, questions in course['quizzes'].items():
    for i, q in enumerate(questions):
        if q['lesson'] not in lessons or not q['lesson'].startswith(f'{ch}-'):
            print(f"ERROR: quiz {ch} question {i + 1}: lesson {q['lesson']} is not in chapter {ch}")
            errors += 1
        if not 0 <= q['answer'] < len(q['choices']):
            print(f"ERROR: quiz {ch} question {i + 1}: answer index out of range")
            errors += 1
print(f"OK: {sum(counts.values())} quiz questions in {len(counts)} chapter files" if not errors else f"{errors} quiz errors")
if errors:
    sys.exit(1)
