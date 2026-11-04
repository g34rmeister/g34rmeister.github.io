// Auto-discovers every [data-widget] on every lesson page and checks it at 320 px in light and dark.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const root = process.argv[2], out = process.argv[3], only = process.argv[4] ? process.argv[4].split(',') : null;
const pages = fs.readdirSync(root).filter(f => /^robotics-\d+-\d+\.html$/.test(f) &&
  fs.readFileSync(path.join(root, f), 'utf8').includes('data-widget='));
(async () => {
  const b = await chromium.launch(); let fail = 0, n = 0;
  for (const scheme of ['light', 'dark']) for (const f of pages) {
    const ctx = await b.newContext({ viewport: { width: 320, height: 800 }, colorScheme: scheme });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => m.type() === 'error' && !/favicon|ERR_FILE_NOT_FOUND/.test(m.text()) && errs.push(m.text()));
    await p.goto('file://' + path.join(root, f)); await p.waitForTimeout(400);
    const res = await p.evaluate(() => [...document.querySelectorAll('[data-widget]')].map(el => {
      const svgs = [...el.querySelectorAll('svg')];
      return { name: el.dataset.widget, built: !el.querySelector(':scope > p.widget-note') && el.children.length > 0,
        wide: el.scrollWidth > el.clientWidth + 1, svgOk: svgs.every(s => s.getAttribute('role') === 'img' && s.getAttribute('aria-label')),
        buttons: el.querySelectorAll('button').length };
    }).concat([{ pageOverflow: document.documentElement.scrollWidth > innerWidth }]));
    const po = res.pop().pageOverflow;
    for (const r of res) {
      if (only && !only.includes(r.name)) continue;
      n++; const ok = r.built && !r.wide && r.svgOk && !po && !errs.length;
      if (!ok) { fail++; console.log('FAIL', scheme, f, JSON.stringify(r), po ? 'PAGE-OVERFLOW' : '', errs.join(';')); }
      if (only && scheme === 'dark') {
        const el = await p.$(`[data-widget="${r.name}"]`);
        await el.screenshot({ path: path.join(out, `w-${r.name}.png`) });
      }
    }
    await ctx.close();
  }
  console.log(`${n - fail} of ${n} widget renders passed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
