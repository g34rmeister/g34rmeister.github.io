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
  // Questions live in assets/js/quiz/ch<N>.js (each adds itself to window.RISE_COURSE.quizzes); the answers are read from there.
  for (const f of fs.readdirSync(path.join(ROOT, 'assets/js/quiz')).filter(n => /^ch\d+\.js$/.test(n)).sort()) {
    new Function('window', fs.readFileSync(path.join(ROOT, 'assets/js/quiz', f), 'utf8'))(sandbox.window);
  }
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
    const status = await quizPage.locator('.quiz-result').textContent();
    const wrong = await quizPage.locator('.quiz-question.is-wrong').count();
    const full = `Final score: ${questions.length} out of ${questions.length}.`;
    if (wrong || !status.includes(full)) { console.error(`FAIL: chapter ${ch} quiz: ${wrong} wrong, result "${status}"`); totalErrors++; }
    else console.log(`PASS: chapter ${ch} quiz, ${questions.length} questions`);
  }

  // One wrong answer first: feedback must name the correct choice, and retry must reset only that question
  {
    const ch = Object.keys(quizzes)[0];
    await quizPage.goto(`${base}robotics-quiz.html?chapter=${ch}`, { waitUntil: 'networkidle' });
    const text = await quizPage.locator('.quiz-question').first().locator('.quiz-choice span').allTextContents();
    // Find the correct choice text for question 0 by answering wrongly: the feedback reveals it
    await quizPage.locator('input[name="q0"][value="0"]').check();
    let fb = await quizPage.locator('.quiz-question').first().locator('.quiz-feedback').textContent();
    if (/Correct\./.test(fb)) {
      await quizPage.goto(`${base}robotics-quiz.html?chapter=${ch}`, { waitUntil: 'networkidle' });
      await quizPage.locator('input[name="q0"][value="1"]').check();
      fb = await quizPage.locator('.quiz-question').first().locator('.quiz-feedback').textContent();
    }
    const named = text.some(t => fb.includes(`The answer is "${t.trim()}"`));
    const locked = await quizPage.locator('input[name="q0"]').first().isDisabled();
    const prog = await quizPage.locator('.quiz-progress').textContent();
    if (!named || !locked || !/1 of \d+ answered, 0 correct/.test(prog)) { console.error(`FAIL: chapter ${ch} wrong-answer feedback ("${fb}", locked=${locked}, "${prog}")`); totalErrors++; }
    else console.log(`PASS: chapter ${ch} wrong answer names the correct choice, locks, shows progress`);
  }

  // Lessons: "Check yourself" sits before the References heading, is a real h2 and is listed in both contents lists.
  console.log('\n=== Check yourself placement ===');
  {
    const pg = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    for (const name of ['robotics-1-1.html', 'robotics-4-4.html', 'robotics-3-5.html']) {
      await pg.goto(base + name, { waitUntil: 'networkidle' });
      await pg.waitForSelector('#check-yourself', { timeout: 10000 }).catch(() => {});
      const r = await pg.evaluate(() => {
        const box = document.getElementById('check-yourself');
        const refs = [...document.querySelectorAll('.robotics-article-body h2')].find(h => /References\s*$/.test(h.textContent));
        const toc = sel => [...document.querySelectorAll(sel + ' a')].map(a => a.getAttribute('href'));
        return { box: !!box, h2: !!(box && box.querySelector('h2')), before: !!(box && refs && (box.compareDocumentPosition(refs) & Node.DOCUMENT_POSITION_FOLLOWING)),
          kp: !!document.querySelector('.key-points') && !!box && !!(document.querySelector('.key-points').compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING),
          main: toc('nav.wp-toc').includes('#check-yourself'), side: toc('nav.wp-toc-side').includes('#check-yourself'),
          order: toc('nav.wp-toc').indexOf('#check-yourself') === toc('nav.wp-toc').length - 2 };
      });
      if (!r.box || !r.h2 || !r.before || !r.kp || !r.main || !r.side || !r.order) { console.error(`FAIL: ${name} check-yourself ${JSON.stringify(r)}`); totalErrors++; }
      else console.log(`PASS: ${name} Check yourself after Key points, before References, in both contents lists`);
    }
    // Layout round: hub starts with one chapter open and start cards; lessons get a bottom bar below 1200px and a filled Next card.
    {
      const hp = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await hp.goto(base + 'robotics.html', { waitUntil: 'networkidle' });
      const hub = await hp.evaluate(() => ({ open: document.querySelectorAll('.hltv-chapter-block:not(.is-collapsed)').length,
        pills: document.querySelectorAll('.chapter-progress-pill').length, blocks: document.querySelectorAll('.hltv-chapter-block').length,
        cards: document.querySelectorAll('.hub-start:not([hidden]) .hub-start-card').length,
        // The chapter list sits in a centred column: a dropped .robotics-container rule once let it run edge to edge.
        gutter: Math.round(document.querySelector('.robotics-container').getBoundingClientRect().left) }));
      if (hub.open !== 1 || hub.pills !== hub.blocks || hub.cards !== 3 || hub.gutter < 40) { console.error(`FAIL: hub layout ${JSON.stringify(hub)}`); totalErrors++; }
      else console.log('PASS: hub opens one chapter, labels every chapter and shows three start cards to a new visitor');
      await hp.setViewportSize({ width: 375, height: 760 });
      await hp.goto(base + 'robotics-4-4.html', { waitUntil: 'networkidle' });
      const bar = await hp.evaluate(() => { const b = document.querySelector('.lesson-bottom-bar'); const n = document.querySelector('.article-footer-nav a.article-nav-card:last-child');
        return { shown: !!b && getComputedStyle(b).display !== 'none', links: b ? b.querySelectorAll('a').length : 0, next: b && b.querySelector('.lesson-bottom-next') ? b.querySelector('.lesson-bottom-next').getAttribute('href') : '',
          time: !!(n && n.querySelector('.article-nav-time')), overflow: document.documentElement.scrollWidth - window.innerWidth }; });
      if (!bar.shown || bar.links !== 3 || bar.next !== 'robotics-4-5.html' || !bar.time || bar.overflow > 0) { console.error(`FAIL: lesson bottom bar ${JSON.stringify(bar)}`); totalErrors++; }
      else console.log('PASS: phone lesson has the bottom bar (chapter, contents, next) and a reading time on the Next card');
      await hp.close();
    }
    // Opened at #ref-3 the page must still show that reference after the box is inserted.
    await pg.goto(base + 'robotics-1-1.html#ref-3', { waitUntil: 'networkidle' });
    await pg.waitForSelector('#check-yourself');
    // The browser scrolls smoothly to the fragment, so wait for it to arrive.
    await pg.waitForFunction(() => { const t = document.getElementById('ref-3').getBoundingClientRect().top; return t > 60 && t < 400; }, null, { timeout: 8000 }).catch(() => {});
    const top = await pg.evaluate(() => document.getElementById('ref-3').getBoundingClientRect().top);
    if (top < 60 || top > 400) { console.error(`FAIL: #ref-3 at ${top}px after the quiz box loaded`); totalErrors++; }
    else console.log('PASS: page opened at #ref-3 still shows that reference');
    // Wayfinding: breadcrumb nav, position line with previous/next, citation backlinks, icons hidden from assistive tech.
    await pg.goto(base + 'robotics-4-4.html', { waitUntil: 'networkidle' });
    const w = await pg.evaluate(() => ({
      crumb: !!document.querySelector('nav[aria-label="Breadcrumb"] [aria-current="page"]'),
      quick: /lesson 4 of \d+/.test((document.querySelector('.lesson-quicknav') || {}).textContent || '') && document.querySelectorAll('.lesson-quicknav a').length === 2,
      back: document.querySelectorAll('li[id^="ref-"] .ref-backlinks a').length > 0,
      icons: document.querySelectorAll('i.fas:not([aria-hidden]), i.far:not([aria-hidden]), i.fab:not([aria-hidden])').length,
      navCurrent: !!document.querySelector('.nav-menu-list a[aria-current="page"]')
    }));
    if (!w.crumb || !w.quick || !w.back || w.icons || !w.navCurrent) { console.error(`FAIL: wayfinding ${JSON.stringify(w)}`); totalErrors++; }
    else console.log('PASS: breadcrumb nav, position line, citation backlinks, hidden icons, aria-current in menu');
    await pg.goto(base + 'robotics-4-4.html#ref-3', { waitUntil: 'networkidle' });
    const hl = await pg.evaluate(() => getComputedStyle(document.getElementById('ref-3')).outlineStyle);
    if (hl === 'none') { console.error('FAIL: targeted reference is not highlighted'); totalErrors++; } else console.log('PASS: targeted reference is highlighted');
    await pg.close();
  }

  // Lessons with LaTeX (\( \) or \[ \]) outside code must render with the vendored KaTeX: no errors, no raw delimiters.
  console.log('\n=== Math rendering (KaTeX) ===');
  const mathPages = pages.filter(name => {
    const html = fs.readFileSync(path.join(ROOT, name), 'utf8').replace(/<(pre|code|script|style)[^>]*>[\s\S]*?<\/\1>/g, ' ');
    return /\\[(\[]/.test(html);
  });
  const mathContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  for (const name of mathPages) {
    const page = await mathContext.newPage();
    await page.goto(base + name, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-math'), null, { timeout: 15000 }).catch(() => {});
    const r = await page.evaluate(() => {
      const body = document.querySelector('.robotics-article-body');
      const raw = [];
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
      let n;
      while ((n = walker.nextNode())) {
        if (n.parentNode.closest('code,pre,script,style')) continue;
        if (/\\[(\[]/.test(n.nodeValue)) raw.push(n.nodeValue.trim().slice(0, 60));
      }
      return { state: document.documentElement.getAttribute('data-math'), formulas: document.querySelectorAll('.katex').length,
        errors: [...document.querySelectorAll('.katex-error')].map(e => e.getAttribute('title') || e.textContent), raw };
    });
    if (r.state !== 'ready' || !r.formulas || r.errors.length || r.raw.length) {
      console.error(`FAIL: ${name} math: state=${r.state}, ${r.formulas} formulas, errors=${JSON.stringify(r.errors)}, raw=${JSON.stringify(r.raw)}`);
      totalErrors++;
    } else console.log(`PASS: ${name} ${r.formulas} formulas, 0 errors`);
    await page.close();
  }
  await mathContext.close();
  if (!mathPages.length) { console.error('FAIL: no page with math found'); totalErrors++; }

  // Accessibility (axe-core). Optional: runs only when AXE_PATH points at an axe.min.js (not vendored, not needed in CI).
  console.log('\n=== Accessibility (axe-core) ===');
  if (!process.env.AXE_PATH || !fs.existsSync(process.env.AXE_PATH)) {
    console.log('Skipped: set AXE_PATH to an axe.min.js file to run the axe accessibility check.');
  } else {
    const axePages = ['robotics.html', 'robotics-1-1.html', 'robotics-quiz.html?chapter=1', 'robotics-glossary.html'];
    const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      await ctx.addInitScript(t => { try { localStorage.setItem('theme', t); } catch (e) { /* storage blocked */ } }, scheme);
      for (const name of axePages) {
        const page = await ctx.newPage();
        await page.goto(base + name, { waitUntil: 'networkidle' });
        await page.addScriptTag({ path: process.env.AXE_PATH });
        const bad = await page.evaluate(async t => {
          const r = await axe.run(document, { runOnly: { type: 'tag', values: t }, resultTypes: ['violations'] });
          return r.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
            .map(v => v.id + ' (' + v.impact + ', ' + v.nodes.length + ' nodes, e.g. ' + v.nodes[0].target.join(' ') + ')');
        }, tags);
        if (bad.length) { console.error(`FAIL: ${name} (${scheme}) axe: ${bad.join('; ')}`); totalErrors++; }
        else console.log(`PASS: ${name} (${scheme}) no serious or critical axe violations`);
        await page.close();
      }
      await ctx.close();
    }
  }

  await browser.close();
  server.close();
  if (totalErrors) { console.error(`\nFAILED with ${totalErrors} errors.`); process.exit(1); }
  console.log('\nAll layout and quiz checks passed.');
})();
