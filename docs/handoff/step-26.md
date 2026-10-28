# Step 26: the Robotics OSS map page

Branch: `main`. Read `CLAUDE.md` ("Direction") and `docs/handoff/robosstics-plan.md` item 3 first.

Write ONE new page, `robotics-oss-map.html`: a map of the open-source projects this course uses, and how a newcomer can start contributing to each.

## Inputs
- `research_notes/oss-map/map-facts.md`: the ONLY facts you may use. Each line: project | fact | source URL | evidence words.
- `docs/handoff/oss-map-sources.md`: page titles via the cached files (`osscache/<name>.txt` in the cache folder given in your prompt).
- Template: `robotics-glossary.html` (an extra page, not a lesson). Copy its whole structure (head tags, canonical/og/twitter with this page's own URL and title, color-scheme, skip link, navbar, drawer, `data-build-date`, footer with the HTML5 UP credit, scripts). Replace only the page content.

## Rules
- You have NO terminal. Use only file read and file write tools. Do not browse the web. Create ONLY `robotics-oss-map.html`. Do NOT edit other files. Do NOT commit.
- Exactly one `<h1>`: "Robotics Open-Source Map".
- Every fact carries a citation `<sup><a href="#ref-N">[N]</a></sup>` and has a References list (`<ol>` with `<li id="ref-N">`), numbered by first use. Format: `Publisher, &ldquo;Page title.&rdquo; <a href="URL" target="_blank" rel="noopener noreferrer">short-url</a>.`
- Do not add facts from memory. Where `map-facts.md` gives no license for a project, write "See the project's repository." Do not guess a license.
- No marketing language (skip "world's most popular" and similar); state what the project is.
- Plain short sentences, for a newcomer.

## Content
1. A short intro: what this page is for, and that Chapter 3 (`robotics-oss.html`) explains how to contribute.
2. One section per project, in this order: ROS 2, MoveIt 2, Nav2, ros2_control, Gazebo, OpenCV, PCL, Universal Robots Client Library, Universal Robots ROS 2 driver, Wireshark. For each, a small definition list or table: What it is; License; Where the code lives; How to start contributing; How it is run (governance or process), only where the facts give it.
3. A "Used in these lessons" line per project, linking only these lessons: ROS 2: `robotics-4-1.html` (4.1) and `robotics-4-6.html` (4.6); MoveIt 2: `robotics-4-8.html` (4.8); Nav2: `robotics-3-3.html` (3.3); ros2_control: `robotics-8-5.html` (8.5); Gazebo: `robotics-10-2.html` (10.2); OpenCV: `robotics-7-3.html` (7.3) and `robotics-7-6.html` (7.6); PCL: `robotics-7-4.html` (7.4); UR Client Library: `robotics-9-6.html` (9.6); UR ROS 2 driver: `robotics-4-9.html` (4.9); Wireshark: `robotics-8-6.html` (8.6).
4. A closing line pointing to `CONTRIBUTING.md` for contributing to robOSStics itself.

Finish with a summary of at most 3 lines: file written, projects covered, references.
