# Step 40: build 11 widgets from the step 38 proposals

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Edit ONLY `assets/js/widgets.js` and the eleven lesson files listed below.

Build these proposals from `docs/handoff/step-38-proposals-1-5.md` and `docs/handoff/step-38-proposals-6-10.md` (read each proposal block, then read the lesson again before building):

1-3 agv-vs-amr · 1-7 cycle-time-positioner · 2-5 vacuum-cup-sizing · 2-6 offs-vs-reltool · 2-7 pallet-indexing · 2-8 vision-frame-shift · 4-1 ros-domain-id · 4-6 square-fsm · 7-4 stereo-disparity · 7-6 pinhole-projection · 8-1 dlr-ring-recovery

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
