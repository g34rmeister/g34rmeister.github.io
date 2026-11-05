# Step 41: build 8 more widgets from the step 38 proposals

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Edit ONLY `assets/js/widgets.js` and the eleven lesson files listed below.

Build these proposals (rated 2) from `docs/handoff/step-38-proposals-1-5.md` and `docs/handoff/step-38-proposals-6-10.md` (read each proposal block, then read the lesson again before building):

1-1 edge-case-classifier · 6-1 ultrasonic-distance · 6-5 gyro-drift · 6-10 jacobian-singularity · 7-1 f-number-aperture · 7-2 cross-polarization · 7-5 presence-area-check · 8-2 ethernet-ip-messaging

Rules (same as every earlier widget ticket):
- Read the whole of `assets/js/widgets.js` first and copy the existing style exactly: plain ES5 inside the IIFE; helpers `h()`, `s()`, `frame()`, `button()`, `slider()`, `plotFrame()`, `pts()`; `reduceMotion`; CSS classes `widget-note`, `widget-buttons`, `widget-plot`, `widget-readout`, `widget-control`; `d-*` classes for SVG shapes and text so light and dark themes work. No libraries, no canvas, no new CSS, no colours in style attributes.
- Data-widget names: use the proposal's kebab-case name with hyphens removed for the INIT key only if needed; the `data-widget` value and the INIT key must match exactly. Add every init function to `INIT` and every name to the header comment.
- Each widget shows ONLY what its lesson says: the lesson's formulas, numbers, names, defaults (use the lesson's worked-example values as defaults) and wording. Do not add facts. If a proposal needs something the lesson does not state, leave that part out.
- No safety content of any kind.
- Fit a 320 px phone: SVG `viewBox` no wider than about 400 units, `width="100%"`, stack vertically; every SVG `role="img"` with an `aria-label`; every clickable item a real `<button>` or focusable with Enter/Space; `aria-pressed` on toggles; a readout with `aria-live="polite"`. Animation only via `requestAnimationFrame` and none when `reduceMotion`.
- Placeholder in the lesson, at the proposal's placement, between paragraphs inside `.robotics-article-body` (never inside `<p>`, `<pre>`, lists or tables):
  `<div data-widget="NAME"><p class="widget-note">The ... needs JavaScript. With it on, you can ...</p></div>`
- If a lesson does not load widgets.js yet, add `<script src="assets/js/widgets.js" defer></script>` next to its other script tags in the same position as `robotics-6-3.html` (no `?v=`; it is generated). Do not touch any other `?v=` value.
- Keep every tag balanced.

Finish with at most 14 lines: one line per widget (lesson, name, what it shows, anything left out and why). Do not claim you tested anything.

Extra rules learned from step 40:
- Give every `<svg>` the classes `widget-plot lesson-diagram` (the `d-*` styles only apply inside `.lesson-diagram`).
- Every number shown as a fact must be in the lesson. Slider ranges and layout coordinates may be your own; facts may not.
- Keep text inside SVGs at least 11 units high in a viewBox no wider than 400.
