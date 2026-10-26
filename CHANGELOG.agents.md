# Agent changelog

Short log of agent-made changes so new sessions can skip re-exploring. Newest first. Add one entry per PR: number, title, and the few facts a later agent needs (files touched, conventions introduced). Keep each entry to a few lines.

## #16 Token-saving groundwork: sync script, site checks, source registry, lesson index
- `scripts/site_sync.py` + `scripts/site_manifest.json`: regenerate sitemap, hub rows, chapter lists, prev/next, navbars and the CI page set from `course-data.js`. Never hand-edit those regions.
- `scripts/check_site.py` (citations by first use, anchors, assets, course data/glossary), `scripts/renumber_refs.py`, new workflow `site-sync.yml`.
- `docs/sources.json` (every cited source, link status, per-lesson claim checks) with `scripts/sources.py`, `scripts/fetch_text.py`, `scripts/ref_claims.py`; `docs/lessons-index.md` from `scripts/build_index.py`.
- Every lesson's citations checked against the opened source; fixes applied in the lessons, results stored in `docs/sources.json`.

## #14 (this PR): CLAUDE.md and agent changelog
- Added `CLAUDE.md` (layout, rules, checks) and this file.

## In progress: basics and cleanup PR
- Being built in a separate thread. Whoever merges it should replace this entry with its number and summary.

## #13 Wave 3: Chapter 6 capstones
- New Ch6 (`robotics-capstone.html`, 6-1..6-3), nav item "Capstone" (fa-flag-checkered) after Control on every page.

## #12 Wave 2: seven new lessons
- Added 2-8, 3-8, 3-9, 4-5, 5-9, 5-10 and more; Chapter 5 references pass; Windows on ARM folded into 3-3.

## #11 Wave 1 lessons
- Added 1-7 (robot cell), 2-5 (tooling and I/O), 2-6 (pick and place), 2-7, 3-6 (first ROS 2 package), 3-7 (launch files), 4-4 (cell safety).

## #10 Diagrams, simulators, method page
- Diagrams in 14 lessons, five simulators, `robotics-method.html` linked under every References list.

## #9 Chapters 2 to 5 source audit
- Re-sourced lessons 2-1..5-8; quiz answers and objectives aligned; course-data cache version bumped.

## Earlier (#4 to #8)
- #8 deepened Chapters 2 to 5; #7 deepened Chapter 1 and introduced inline `ref-N` citations; #6 added 1-6 and 4-3 from the roadmap assessment; #4/#5 added history, ROS, ethics sections and matching quiz/objectives.

## Citation checks for the remaining 25 lessons (PR #17)
- Checked every ref in 1-1..1-6, 2-1..2-4, 3-1, 3-2, 3-4, 3-5, 4-1..4-3, 5-1..5-7 and 5-9 against fetched sources and recorded results in `docs/sources.json` (no lesson has unchecked refs now). Many publisher sites block fetches (Cloudflare, EUR-Lex, ISO), so those refs are `unreachable` with corroboration noted where found.
- Text fix: 4-3 China robot-density sentence reworded to match the IFR text.
- Dead Nav2 links replaced with versioned Lyrical URLs in 2-4, 5-6 and 5-7 (five refs in 5-7). Still-dead links with no replacement found: 4-2 ref 22 (UNODA), 1-6 refs 9 and 11, 5-1 ref 14 and 5-2 ref 12 (Arduino Servo GitHub path), 2-4 ref 1 (Quigley ROS paper copy).
- Docs pages on docs.ros.org are read from the ros2_documentation repo (`lyrical` branch) because the site serves a bot challenge; Arduino docs from the arduino/reference-en repo.

## Agentic workflow (docs/agentic-workflow.md)
- Added `docs/agentic-workflow.md`: plan (Claude) -> Gemini drafts via Antigravity per a brief -> script/CI gate -> Claude review (citations, numbers) -> merge. Docs only.
- Added `scripts/verify_notes.py` (checks Gemini research-note quotes against fetched sources) and the search-hard, Opus quality gate and anti-hallucination harness sections in `docs/agentic-workflow.md`.

## Step 1 (Gemini handoff): dead reference links
- First run of the hackathon-style loop: ticket `docs/handoff/step-1.md`, Gemini via `agy -p` proposed candidate URLs (`research_notes/dead-links/step-1.md`), Claude fetched and checked each one.
- Fixed: 2-4 ref 1 (Quigley ROS paper, Internet Archive copy of the Stanford PDF); 5-1 ref 14 and 5-2 ref 12 (Arduino Servo links moved to `docs/readme.md` and source files; 544/2400/1500/20000, pins 9/10 and Timer1 setup confirmed in source).
- 4-2: the 2026 LAWS recommendation now cites the UN *New Agenda for Peace* brief (new ref 23, later refs renumbered). Ref 22 (UNODA) is still dead and still the only source for "no commonly agreed definition of LAWS".
- Still dead, no replacement found: 1-6 ref 9 (Nabtesco RS catalog), 1-6 ref 11 (Hexagon ISO 9283 PDF).
- Lesson learned: Gemini's first run invented "fetched" quotes (16 of 20 failed `verify_notes.py`). Headless agy cannot run shell commands at all (allow-rules, `--sandbox`, auto mode and the AUTO preset were all denied), so Gemini only proposes URLs and Claude verifies.
