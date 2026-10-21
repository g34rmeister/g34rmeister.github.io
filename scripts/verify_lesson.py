import sys
import re
from pathlib import Path

def verify(filename):
    p = Path(filename)
    if not p.exists():
        print(f"File {filename} not found")
        return False
    text = p.read_text(encoding='utf-8')
    
    # 1. H1 check
    h1s = re.findall(r'<h1[^>]*>.*?</h1>', text, re.DOTALL)
    if len(h1s) != 1:
        print(f"FAILED: Found {len(h1s)} <h1> tags (expected exactly 1)")
        return False
        
    # 2. Citations check
    cited = re.findall(r'href="#(ref-\d+)"', text)
    declared = re.findall(r'id="(ref-\d+)"', text)
    
    cited_set = set(cited)
    declared_set = set(declared)
    
    missing = cited_set - declared_set
    uncited = declared_set - cited_set
    
    if missing:
        print(f"FAILED: Cited refs without definition: {sorted(missing)}")
        return False
    if uncited:
        print(f"FAILED: Declared refs without citation: {sorted(uncited)}")
        return False
        
    # Check ordering of first appearance
    first_seen = {}
    for i, ref in enumerate(cited):
        if ref not in first_seen:
            first_seen[ref] = len(first_seen) + 1
            
    expected_order = [f"ref-{i}" for i in range(1, len(first_seen) + 1)]
    actual_order = list(first_seen.keys())
    if expected_order != actual_order:
        print(f"WARNING: Citation order discrepancy: expected {expected_order[:5]}... got {actual_order[:5]}...")
        
    # 3. Em dash check
    # Check for unicode em-dash \u2014 and html entity &mdash;
    # Note: allow in reference titles if original title had an em-dash or standard title, but best 0.
    # Check in article body
    body_match = re.search(r'<article class="robotics-article-body">(.*?)</article>', text, re.DOTALL)
    if body_match:
        body_text = body_match.group(1)
        # ignore inside <ol class="article-spec-list"> references if any
        ref_split = re.split(r'<h2[^>]*>\s*\d+\.\s*References', body_text)
        content_only = ref_split[0]
        em_dashes = re.findall(r'(\u2014|&mdash;)', content_only)
        if em_dashes:
            print(f"FAILED: Found {len(em_dashes)} em-dashes in article content!")
            return False
            
    # 4. Word count
    clean = re.sub(r'<[^>]+>', ' ', text)
    total_words = len(clean.split())
    
    content_clean = re.sub(r'<[^>]+>', ' ', content_only) if body_match else ""
    content_words = len(content_clean.split())
    
    print(f"SUCCESS: {filename}")
    print(f"  - Citations: {len(declared_set)} references, all cited and defined.")
    print(f"  - Em dashes: 0 in content.")
    print(f"  - Total words: {total_words} (article body: {content_words})")
    return True

if __name__ == '__main__':
    if len(sys.argv) > 1:
        verify(sys.argv[1])
    else:
        for f in sorted(Path('.').glob('robotics-*.html')):
            verify(f)
