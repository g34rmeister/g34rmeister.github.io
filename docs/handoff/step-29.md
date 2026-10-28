# Step 29: static diagrams for lessons that have none

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Edit only the lesson files in YOUR part (A or B, named in your prompt). Do not touch `assets/`.

## What to add

One static inline SVG figure per lesson (two at most if the lesson clearly needs both), placed right after the paragraph that explains the thing it shows. Before drawing, read the whole lesson. The figure shows ONLY what the lesson's text says: its terms, names, numbers and order. No new facts, numbers, products or steps. If the lesson does not say it, it is not in the figure.

## Format (copy exactly; see `robotics-1-1.html` for a real one)

```html
<figure class="lesson-diagram">
    <svg viewBox="0 0 400 H" role="img" aria-label="One sentence describing the diagram" xmlns="http://www.w3.org/2000/svg">
        ... shapes ...
    </svg>
    <figcaption>One or two plain sentences saying what the figure shows.</figcaption>
</figure>
```

- Classes only, no colours: `d-box` (box), `d-box-gold` (highlighted box), `d-line` (thin line), `d-strong` (thick link-colour line), `d-fill` (filled dot or arrowhead), `d-text`, `d-title`, `d-muted` (text). This makes light and dark themes work. No `style=` attributes, no `fill="#..."`.
- Arrowheads: a `<marker>` in `<defs>` with a path of class `d-fill`. Marker ids must be unique on the whole page: use `arrow-<lesson>-<n>`, e.g. `arrow-7-2-1`.
- viewBox width 400 (at most 440) so text stays readable on a 320 px phone. Stack things vertically instead of making the figure wide. Keep text inside the viewBox; estimate about 7 units per character at `d-text` size.
- Captions: no citation, OR cite only a reference already cited in the paragraph right before the figure, with exactly the same `<sup><a href="#ref-N">[N]</a></sup>` markup. Never add a new reference.
- Place figures between paragraphs inside `.robotics-article-body`, never inside `<p>`, `<pre>`, lists or tables. Keep every tag balanced. Do not change any existing text.

## Part A

1. `robotics-7-1.html`: global shutter vs rolling shutter timing (rows on the y axis, time on the x axis: all rows exposed together vs staggered rows). Section 03.
2. `robotics-7-2.html`: side-view sketches of the lighting setups the lesson describes (backlight, directional/glancing, darkfield, diffuse dome, coaxial): light, part, camera, and the light path. A small grid of panels stacked two per row is fine.
3. `robotics-7-5.html`: spatial resolution / Nyquist: the smallest feature spanned by the number of pixels the lesson gives. Section 02.
4. `robotics-7-6.html`: the camera data path the lesson describes (camera driver node, the `sensor_msgs/Image` and `sensor_msgs/CameraInfo` topics, `cv_bridge`, OpenCV), using the lesson's exact topic and package names.
5. `robotics-8-1.html`: sinking vs sourcing DC I/O, and NPN vs PNP three-wire sensors (supply, load/input, switch, the three wires), exactly as the lesson describes which side is switched.
6. `robotics-8-2.html`: EtherCAT processing on the fly (one frame passing through each device in turn and back), as the lesson describes it.
7. `robotics-8-5.html`: the communication hierarchy the lesson describes (device level with IO-Link up to OPC UA and publish-subscribe), using the lesson's level names.

## Part B

1. `robotics-10-4.html`: architecture of what the capstone builds (the stand-in servers, the ROS 2 node, the maintenance log, the README/license/pull request), using the lesson's component names.
2. `robotics-3-1.html`: a repository file tree showing the files the lesson names (LICENSE, README, CONTRIBUTING, code of conduct, and any others it names) with a one-word role each.
3. `robotics-3-3.html`: ROS 2 distributions and release branches as the lesson describes them (only distribution names and branch names written in the lesson).
4. `robotics-3-4.html`: the two lab paths side by side (Path A browser editing, Path B local Git and checks) ending in the same pull request, using the lesson's step names.
5. `robotics-9-1.html`: the maintenance strategies the lesson names, side by side, with the one-line difference the lesson gives.
6. `robotics-9-4.html`: the DC voltage / continuity measurement setup only if the lesson describes probe placement; otherwise the solid-state switching leakage idea as the lesson describes it. If neither is described concretely, skip this lesson and say so.
7. `robotics-9-5.html`: the calibration order as a flowchart (revolution counters, resolver/fine calibration, TCP and load data, workspace recalibration and program correction), in the lesson's order.

## Finish

At most 8 lines: each lesson, where the figure went (after which paragraph), and any lesson you skipped and why. Do not claim you tested or verified anything.
