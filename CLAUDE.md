# CLAUDE.md

Static GitHub Pages site (no build step) for Gerald's honors thesis, **RISE Bot Instructor**: an industrial robotics course. Read `CHANGELOG.agents.md` first instead of re-exploring the repo, and append an entry to it in every PR.

## Layout
- Course pages are root-level HTML: `robotics.html` (hub), chapter pages `robotics-intro|programming|ros|ethics|control|capstone.html`, lessons `robotics-<chapter>-<n>.html`.
- Current lessons: Ch1 1-1..1-7, Ch2 2-1..2-8, Ch3 3-1..3-9, Ch4 4-1..4-5, Ch5 (optional, control) 5-1..5-10, Ch6 (capstones) 6-1..6-3.
- Extras: `robotics-quiz.html`, `robotics-glossary.html`, `robotics-method.html` (how the course was made; update its sources/AI table if the process changes).
- Data and scripts: `assets/js/course-data.js` (objectives, keyTerms, minutes, quiz; bump `version` when quiz data changes), `assets/js/glossary-data.js`, `assets/js/learning.js`, `assets/js/widgets.js`, `assets/css/robotics.css`.
- Non-course pages (index, about, resume, portfolio, etc.) are the original HTML5 UP site.
- `.planning/` is stale tooling output from an older setup; ignore it.

## Rules
- Keep the Wikipedia-style theming already live. Do not reuse the abandoned "sketchbook" redesign.
- Every lesson needs a References list. Cite inline with `<sup><a href="#ref-N">[N]</a></sup>` pointing to `<li id="ref-N">`, numbered by first use. Never copy unchecked statistics or citations from Gerald's Gemini-drafted material.
- Append new lessons; never renumber (URLs must stay stable).
- Adding or removing a page means updating: `sitemap.xml`, the page set in `.github/workflows/site-hygiene.yml`, hub rows in `robotics.html`, the chapter page's list, prev/next links, `course-data.js` and `glossary-data.js` (a definition per key term).
- Each page needs exactly one `<h1>`, the shared head tags (canonical, og:title, twitter:card, color-scheme), the skip link, `data-build-date` and the HTML5 UP footer credit.

## Checks
CI is `.github/workflows/site-hygiene.yml` (runs on PRs and pushes to main): internal `.html` links resolve, sitemap and page set match, shared head/footer conventions. To run locally, copy each inline Python block from the workflow and run it with `python3` from the repo root.

## Token budget
Gerald's budget is tight. Prefer the changelog, this file and the project's `reports/` and `research_notes/` over re-auditing pages; read only the files you change.
