# KaTeX (vendored)

- Version: 0.16.22 (MIT licence, see LICENSE)
- Source: https://registry.npmjs.org/katex/-/katex-0.16.22.tgz (npm package `katex`, `dist/` folder)
- Downloaded: 2026-11-09
- Files copied unchanged: `katex.min.js`, `katex.min.css`, `contrib/auto-render.min.js`, `fonts/*.woff2`, `LICENSE`.
- Only the `.woff2` fonts are shipped. `katex.min.css` also names `.woff` and `.ttf` fallbacks; browsers that support WOFF2 (all current ones) take the first `src` entry and never request them.
- Loaded on demand by `assets/js/learning.js` on lesson pages whose text contains `\(` or `\[` outside code.
