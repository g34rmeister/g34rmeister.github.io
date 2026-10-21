from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

root = Path('.')
pages = sorted(root.glob('*.html'))
page_names = {p.name for p in pages}

# Check 1: Internal links
link_re = re.compile(r'href="([^"#?]+?\.html)(?:[#?][^"]*)?"')
failures = []
for page in pages:
    text = page.read_text(encoding='utf-8', errors='strict')
    for match in link_re.finditer(text):
        target = match.group(1)
        if target.startswith(('http://', 'https://')):
            continue
        target_name = Path(target).name
        if target_name not in page_names:
            failures.append(f'{page.name} -> {target}')
if failures:
    print('Broken internal page links:')
    for failure in failures:
        print(f'  {failure}')
    sys.exit(1)
print(f'OK: {len(pages)} pages, all internal .html links resolve.')

# Check 2: Sitemap
expected = {
    'index.html', 'about.html', 'affiliations.html', 'portfolio.html',
    'project-sample.html', 'resume.html', 'contact.html', 'robotics.html',
    'robotics-intro.html', 'robotics-programming.html', 'robotics-ros.html',
    'robotics-ethics.html', 'robotics-control.html', 'robotics-quiz.html', 'robotics-glossary.html', 'robotics-method.html',
} | {f'robotics-{c}-{n}.html' for c, count in ((1, 7), (2, 6), (3, 7), (4, 4), (5, 8)) for n in range(1, count + 1)}
actual_pages = {p.name for p in root.glob('*.html') if p.name != '404.html'}
if actual_pages != expected:
    print(f'Page set drift. Actual: {sorted(actual_pages)} Expected: {sorted(expected)}')
    sys.exit(1)

tree = ET.parse('sitemap.xml')
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = {el.text.split('/')[-1] or 'index.html' for el in tree.findall('.//s:loc', ns)}
if 'https://g34rmeister.github.io/' in {el.text for el in tree.findall('.//s:loc', ns)}:
    urls.add('index.html')
missing = expected - urls
extra = urls - expected - {'index.html'}
if missing or extra:
    print(f'Sitemap drift. Missing: {sorted(missing)} Extra: {sorted(extra)}')
    sys.exit(1)
print('OK: sitemap.xml covers all published pages.')

# Check 3: Shared conventions
required_snippets = [
    '<link rel="canonical"',
    'property="og:title"',
    'name="twitter:card"',
    '<meta name="color-scheme"',
    '<a class="skip-link" href="#main">',
    'data-build-date',
    'Design: <a href="http://html5up.net">HTML5 UP</a>',
]
failures = []
for page in [p for p in pages if p.name != '404.html']:
    text = page.read_text(encoding='utf-8', errors='strict')
    for snippet in required_snippets:
        if snippet not in text:
            failures.append(f'{page.name} is missing: {snippet}')
    if text.count('<h1') != 1:
        failures.append(f"{page.name} should contain exactly one <h1 (found {text.count('<h1')})")
if failures:
    print('Convention failures:')
    for failure in failures:
        print(f'  {failure}')
    sys.exit(1)
print(f'OK: {len(pages)} pages follow SEO/a11y/footer conventions.')
