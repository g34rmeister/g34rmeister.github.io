// Layout and quiz checks for every course page, in a real browser.
// Runs locally (node scripts/test_playwright.js) and in CI (.github/workflows/site-hygiene.yml).
// Playwright is loaded from the project, then from the global npm folder.
const fs = require('fs');
const http = require('http');
const path = require('path');

function loadPlaywright() {
  try { return require('playwright'); } catch (e) { /* fall through */ }
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}
const { chromium } = loadPlaywright();

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.pdf': 'application/pdf' };

// Small static server, so pages load the same way they do on GitHub Pages.
function serve() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    const file = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const pages = fs.readdirSync(ROOT).filter(f => /^robotics.*\.html$/.test(f)).sort();
const viewports = [
  { width: 1280, height: 800, name: '1280px desktop' },
  { width: 375, height: 667, name: '375px mobile' }
];

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  let totalErrors = 0;

  for (const vp of viewports) {
    console.log(`\n=== ${vp.name}: ${pages.length} pages ===`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    for (const name of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      await page.goto(base + name, { waitUntil: 'networkidle' });
      const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      if (errors.length) { console.error(`FAIL: ${name} had JS errors:`, errors); totalErrors++; }
      if (widths[0] > widths[1] + 1) { console.error(`FAIL: ${name} scrolls sideways (scrollWidth=${widths[0]}, clientWidth=${widths[1]})`); totalErrors++; }
      if (!errors.length && widths[0] <= widths[1] + 1) process.stdout.write('.');
      await page.close();
    }
    await context.close();
  }

  // Every chapter quiz should score full marks when the answers from course-data.js are picked.
  console.log('\n\n=== Chapter quizzes (full marks) ===');
  const sandbox = { window: {} };
  new Function('window', fs.readFileSync(path.join(ROOT, 'assets/js/course-data.js'), 'utf8'))(sandbox.window);
  const quizzes = sandbox.window.RISE_COURSE.quizzes;
  const quizPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const ch of Object.keys(quizzes)) {
    await quizPage.goto(`${base}robotics-quiz.html?chapter=${ch}`, { waitUntil: 'networkidle' });
    // Same order as learning.js: by lesson number, keeping data order within a lesson
    const order = id => id.split('-').map(Number);
    const questions = quizzes[ch].map((q, i) => ({ q, i }))
      .sort((a, b) => order(a.q.lesson)[0] - order(b.q.lesson)[0] || order(a.q.lesson)[1] - order(b.q.lesson)[1] || a.i - b.i)
      .map(x => x.q);
    for (let i = 0; i < questions.length; i++) {
      await quizPage.check(`input[name="q${i}"][value="${questions[i].answer}"]`);
    }
    await quizPage.click('button[type="submit"]');
    const wrong = await quizPage.locator('.quiz-question.is-wrong').count();
    if (wrong) { console.error(`FAIL: chapter ${ch} quiz had ${wrong} wrong answers`); totalErrors++; }
    else console.log(`PASS: chapter ${ch} quiz, ${questions.length} questions`);
  }

  await browser.close();
  server.close();
  if (totalErrors) { console.error(`\nFAILED with ${totalErrors} errors.`); process.exit(1); }
  console.log('\nAll layout and quiz checks passed.');
})();
