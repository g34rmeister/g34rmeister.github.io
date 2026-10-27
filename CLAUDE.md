# CLAUDE.md

Static GitHub Pages site (no build step) for Gerald's honors thesis, **RISE Bot Instructor**: an industrial robotics course. Read `CHANGELOG.agents.md` first instead of re-exploring the repo, and append an entry to it in every PR.

## Layout
- Course pages are root-level HTML: `robotics.html` (hub), chapter pages `robotics-intro|programming|ros|ethics|control|capstone|vision|networks.html`, lessons `robotics-<chapter>-<n>.html`.
- Current lessons: Ch1 1-1..1-7, Ch2 2-1..2-8, Ch3 3-1..3-9, Ch4 4-1..4-5, Ch5 (optional, control) 5-1..5-10, Ch6 (capstones) 6-1..6-3, Ch7 (machine vision) 7-1..7-6, Ch8 (industrial networks) 8-1..8-6.
- Extras: `robotics-quiz.html`, `robotics-glossary.html`, `robotics-method.html` (how the course was made; update its sources/AI table if the process changes).
- Data and scripts: `assets/js/course-data.js` (objectives, keyTerms, minutes, quiz; bump `version` when quiz data changes), `assets/js/glossary-data.js`, `assets/js/learning.js`, `assets/js/widgets.js`, `assets/css/robotics.css`.
- Non-course pages (index, about, resume, portfolio, etc.) are the original HTML5 UP site.
- `.planning/` is stale tooling output from an older setup; ignore it.

## Rules
- Keep the Wikipedia-style theming already live. Do not reuse the abandoned "sketchbook" redesign.
- Every lesson needs a References list. Cite inline with `<sup><a href="#ref-N">[N]</a></sup>` pointing to `<li id="ref-N">`, numbered by first use (after editing citations run `python3 scripts/renumber_refs.py robotics-X-Y.html`). Never copy unchecked statistics or citations from Gerald's Gemini-drafted material.
- Append new lessons; never renumber (URLs must stay stable).
- Adding a lesson: create `robotics-<c>-<n>.html`, add it to `course-data.js`, a one-line summary to `scripts/site_manifest.json` and glossary definitions for new key terms, then run `python3 scripts/site_sync.py`. That regenerates `sitemap.xml`, hub rows, the chapter list, prev/next links, navbars and the page set in `site-hygiene.yml`; never edit those by hand.
- Each page needs exactly one `<h1>`, the shared head tags (canonical, og:title, twitter:card, color-scheme), the skip link, `data-build-date` and the HTML5 UP footer credit.

## Agent tools (read these instead of the pages)
- `docs/lessons-index.md`: every lesson's objectives, key terms, sections, ref count and source-check status. Start here to find where a topic lives.
- `docs/sources.json`: every cited source with link status and per-lesson claim checks. `python3 scripts/sources.py report 4-4` lists one lesson's unverified or wrong refs. After checking claims, record them (`sources.py import FILE LESSON`) so nobody re-checks. CI (`sources.py check`) fails if any cited ref has no recorded check, so every new citation must be checked before it is pushed.
- `python3 scripts/ref_claims.py 4-4 [N ...]`: each ref with the exact text that cites it.
- `python3 scripts/fetch_text.py URL --grep word`: a source as plain text (handles PDFs, github.com via raw, bot walls via Chromium).

## Checks
Two workflows run on PRs and pushes to main. `site-hygiene.yml`: internal links, sitemap/page set, shared head/footer, browser layout tests. `site-sync.yml`: `site_sync.py --check`, `check_site.py` (citation numbering, anchors, assets, course data and glossary), `sources.py check`, `build_index.py --check`. Run them all locally before pushing:
`python3 scripts/site_sync.py --check && python3 scripts/check_site.py && python3 scripts/sources.py check && python3 scripts/build_index.py --check`
After changing a lesson or `sources.json`, run `python3 scripts/sources.py sync && python3 scripts/build_index.py && python3 scripts/site_sync.py` (each lesson shows a source-check line generated from `sources.json`).

## Agentic workflow
Bulk lesson drafting is delegated to Gemini via Antigravity and reviewed by Claude; see `docs/agentic-workflow.md` before starting multi-lesson work.

## Token budget
Gerald's budget is tight. Prefer the changelog, this file and the project's `reports/` and `research_notes/` over re-auditing pages; read only the files you change.
