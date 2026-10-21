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

# Check all quiz questions
# Parse quiz blocks
quizzes_match = re.search(r'quizzes:\s*\{(.*)\}\s*\}\s*;?\s*$', course_js, re.DOTALL)
if quizzes_match:
    quiz_str = quizzes_match.group(1)
    print("Found quizzes block.")
