# Step 28: two more widgets (trapezoid, zones)

Branch: `main`. Read `CLAUDE.md` ("Direction") first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Edit only `assets/js/widgets.js` and the HTML files named below.

Read the whole of `assets/js/widgets.js` first and copy the style of the step 27 widgets (`rosgraph`, `movejl`, `prflow`) exactly: plain ES5 inside the existing IIFE, the `h()`, `s()`, `frame()`, `button()`, `slider()`, `plotFrame()`, `pts()` helpers, `reduceMotion`, the existing CSS classes and the `d-*` diagram classes, so colours work in light and dark themes. No libraries, no new CSS. Add each init function to `INIT` and its name to the header comment.

Each widget shows ONLY what its lesson says. Read the lesson first. Do not add facts, numbers, names or rules that are not in that lesson. Notes are short plain sentences in the lesson's own terms.

## 1. `trapezoid` in `robotics-6-9.html`

Place the placeholder after the paragraph that gives the triangular-profile worked example (D = 0.05 m) in section 03, before the Python code block. A rest-to-rest velocity-profile explorer using exactly the lesson's equations (section 02 and 03):

- Three sliders: D (distance, 0.01 to 1.0 m, step 0.01, default 0.5), v_max (0.05 to 0.5 m/s, step 0.01, default 0.25), a_max (0.1 to 1.0 m/s², step 0.05, default 0.5). Defaults are the lesson's worked example.
- Plot v(t) from 0 to T as a polyline (time on x, velocity on y), with a dashed horizontal line at v_max. Shade the area under the curve with `d-fill` style fill or low opacity, because the lesson says the area equals D.
- Case test as in the lesson: trapezoid if D >= v_max^2 / a_max, else triangular (t_a = sqrt(D / a_max), v_peak = sqrt(D a_max), T = 2 sqrt(D / a_max), no cruise).
- Readout: the case name ("trapezoidal" or "triangular"), t_a, t_c (0 when triangular), T, peak velocity, and the area check (area under the curve = D). Three decimals.
- With the defaults the readout must show t_a = 0.500 s, t_c = 1.500 s, T = 2.500 s. With D = 0.05 it must show triangular, t_a = 0.316 s, v_peak = 0.158 m/s, T = 0.632 s.
- No animation is needed.

## 2. `zones` in `robotics-8-6.html`

Place the placeholder at the end of section 02 ("Network segmentation: zones, conduits, and the DMZ"), after the jump-box paragraph and before the heading of section 03. A clickable diagram of exactly what section 02 describes:

- Three zones stacked top to bottom: enterprise (corporate) network, DMZ, Cell Security Zone. Inside the cell zone, show the lesson's levels (Level 2 area control, Level 1 controller LANs, Level 0 field I/O) and the lesson's example devices (PLC, robot controller, I/O). Inside the DMZ, the database/reporting server and the jump box.
- Conduits drawn as lines between zones. Show: cell pushes production records to the DMZ server; office application pulls from the DMZ server; remote user goes through the jump box (with multifactor authentication). Show the direct path from the corporate network to the control network as a crossed-out/dashed line labelled as not allowed, since the lesson says no direct communication paths are required.
- Each zone, conduit and device is focusable (`tabindex="0"`, `role="button"`), works with click and Enter/Space, highlights itself, and shows a one-sentence readout taken from the lesson's own wording (definition of a zone, a conduit, the DMZ, the jump box, push/pull).
- Do not add VLANs, firewall rules, port numbers or products; they are not in section 02.

## Both widgets

Placeholder format:
```html
<div data-widget="NAME">
    <p class="widget-note">The ... needs JavaScript. With it on, you can ...</p>
</div>
```
Put it between paragraphs inside `.robotics-article-body`, never inside `<p>`, `<pre>`, lists or tables. Keep every tag balanced. Neither lesson loads `widgets.js` yet: add `<script src="assets/js/widgets.js?v=1.3" defer></script>` in the same position as in `robotics-6-3.html`, and bump every existing `widgets.js?v=1.2` in every `robotics-*.html` to `?v=1.3`.

Fit a 320 px wide phone: SVG with `viewBox` and `width="100%"`, no fixed pixel widths. Keep the viewBox no wider than about 400 units so text stays readable on a phone (step 27's 620-wide diagrams were too small); stack vertically rather than widen. Every SVG gets `role="img"` and an `aria-label`.

## Finish

A summary of at most 6 lines: files changed, where each placeholder went, and anything you could not do and why. Do not claim you tested anything.
