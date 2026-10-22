"""Print a source URL as plain text, for checking a cited claim with few tokens.

  python3 scripts/fetch_text.py URL [--grep WORD ...] [--max 20000]

- github.com pages are read from raw.githubusercontent.com (agent sandboxes block github.com).
- PDFs go through pdftotext.
- Pages behind a bot challenge ("Just a moment...") are retried in headless Chromium (Playwright).
- --grep prints only the paragraphs that contain any of the words (case-insensitive), so you can
  check a number or a name without reading the whole page.
"""
from html import unescape
from pathlib import Path
import os
import re
import subprocess
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sources import UA, raw_github  # noqa: E402

PW_SCRIPT = r"""
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) {
  pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }
(async () => {
  const opts = { headless: true };
  const browser = await pw.chromium.launch(opts);
  const page = await browser.newPage({ userAgent: process.argv[2] });
  try {
    await page.goto(process.argv[1], { waitUntil: 'domcontentloaded', timeout: 45000 });
    for (let i = 0; i < 8 && /just a moment/i.test(await page.title()); i++) await page.waitForTimeout(2000);
    console.log(await page.title());
    console.log(await page.evaluate(() => document.body ? document.body.innerText : ''));
  } catch (e) { console.log('PLAYWRIGHT ERROR: ' + e.message); }
  await browser.close();
})();
"""


def curl_bytes(url):
    cmd = ['curl', '-sS', '-L', '--max-time', '60', '-A', UA, '-o', '-', '-w', '\n@@%{http_code} %{content_type}', url]
    out = subprocess.run(cmd, capture_output=True, timeout=90).stdout
    body, _, tail = out.rpartition(b'\n@@')
    code, _, ctype = tail.decode('latin-1').partition(' ')
    return int(code) if code.isdigit() else 0, ctype, body


def html_to_text(html):
    html = re.sub(r'(?is)<(script|style|noscript|svg|nav|footer)[^>]*>.*?</\1>', ' ', html)
    html = re.sub(r'(?i)<(br|/p|/div|/li|/h[1-6]|/tr|/section|/article)[^>]*>', '\n', html)
    text = unescape(re.sub(r'<[^>]+>', ' ', html))
    lines = [re.sub(r'[ \t\xa0]+', ' ', ln).strip() for ln in text.split('\n')]
    return '\n'.join(ln for ln in lines if ln)


def browser_text(url):
    out = subprocess.run(['node', '-e', PW_SCRIPT, url, UA], capture_output=True, timeout=120)
    return out.stdout.decode('utf-8', 'replace')


def get_text(url):
    if url.startswith('https://github.com/'):
        url = raw_github(url) or url
    code, ctype, body = curl_bytes(url)
    if body[:5] == b'%PDF-' or 'pdf' in ctype:
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            f.write(body)
        try:
            text = subprocess.run(['pdftotext', '-layout', f.name, '-'], capture_output=True, timeout=120).stdout.decode('utf-8', 'replace')
        finally:
            os.unlink(f.name)
        return f'[HTTP {code}, PDF]\n{text}'
    html = body.decode('utf-8', 'replace')
    if code in (403, 429, 503, 0) or 'Just a moment...' in html[:2000]:
        return f'[HTTP {code} via curl; retried in Chromium]\n{browser_text(url)}'
    if 'html' not in ctype:
        return f'[HTTP {code}, {ctype}]\n{html}'
    return f'[HTTP {code}]\n{html_to_text(html)}'


def main(argv):
    if not argv or argv[0].startswith('-'):
        sys.exit(__doc__)
    url, words, limit = argv[0], [], 20000
    if '--max' in argv:
        limit = int(argv[argv.index('--max') + 1])
    if '--grep' in argv:
        words = [w.lower() for w in argv[argv.index('--grep') + 1:] if not w.startswith('--')]
        words = words[:words.index('--max')] if '--max' in words else words
    text = get_text(url)
    if words:
        paras = [p for p in re.split(r'\n', text) if any(w in p.lower() for w in words)]
        text = text.split('\n', 1)[0] + '\n' + '\n'.join(paras)
    print(text[:limit])


if __name__ == '__main__':
    main(sys.argv[1:])
