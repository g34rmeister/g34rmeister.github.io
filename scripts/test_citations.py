from pathlib import Path
import re
import sys

root = Path('.')
pages = sorted(root.glob('robotics-[1-5]-*.html'))
failures = []

for page in pages:
    text = page.read_text(encoding='utf-8')
    # Find all cited refs
    cited_refs = set(re.findall(r'href="#(ref-\d+)"', text))
    # Find all declared ref ids
    declared_refs = set(re.findall(r'id="(ref-\d+)"', text))
    
    missing_targets = cited_refs - declared_refs
    if missing_targets:
        failures.append(f'{page.name}: Cited refs without definition: {sorted(missing_targets)}')
        
    uncited_targets = declared_refs - cited_refs
    if uncited_targets:
        failures.append(f'{page.name}: Declared refs without citation: {sorted(uncited_targets)}')

if failures:
    print('Citation failures:')
    for f in failures:
        print(f'  {f}')
    sys.exit(1)
print(f'OK: All {len(pages)} lesson pages (Chapters 1 to 5) have perfectly balanced citations!')
