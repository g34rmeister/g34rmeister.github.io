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
- 4-2: the 2026 LAWS recommendation cites the UN *New Agenda for Peace* brief (new ref 23); ref 22 (dead UNODA page) replaced by CRS IF11294 (2021), sentence now "no single, universally accepted definition".
- 1-6 (sources found by Claude after Gemini's candidates failed): Nabtesco RS product page and RS-50A leaflet replace the dead RS catalog; the 1985 date and 65.4-240 ratio range were removed (no fetchable source). The dead Hexagon ISO 9283 PDF is replaced by Kuric et al. 2018 (test cube, five points, 30 cycles), Taslakova 1997 (AP) and Vagvolgyi et al. 2020 (RP formula); "full rated load" removed. Refs renumbered.
- Lesson learned: Gemini's first run invented "fetched" quotes (16 of 20 failed `verify_notes.py`). Headless agy cannot run shell commands at all (allow-rules, `--sandbox`, auto mode and the AUTO preset were all denied), so Gemini only proposes URLs and Claude verifies.
- Last three dead refs (1-2 refs 17 and 22, 5-7 ref 11) now point to Internet Archive copies; claims rechecked (partial, rest covered by sibling refs). No dead refs remain in the course.
- Step 2 (Ch5 partial refs, `docs/handoff/step-2.md`): Gemini named the gap and candidate sources for 26 partial refs; Claude verified. Added Pololu Simple Motor Controller guide (5-2, ultrasonic PWM) and Woodman 2007 inertial-navigation report (5-5, gyro bias); DRV8833 ref now links the datasheet PDF that states the 10-30% switching-loss figure; 5-6 TurtleBot3 midpoint integration confirmed in source. ABB/UR forum citations in 5-9 still need official manuals (JS-only library pages, not fetchable).
- `scripts/fetch_text.py`: Jina Reader fallback for JS-rendered or bot-walled pages (MathWorks and docs.arduino.cc now readable).
- Step 3 (Ch1 and Ch3 partial refs, `docs/handoff/step-3.md`): 1-2 gets Britannica for the 1812 Jacquard-loom count and Lyon loom burning (new ref 11, later refs renumbered); 3-1 DDSI-RTPS ref now links the 2.5 PDF (PB 7400, DG 250, PG 2 confirmed); 3-5 Nav2, MoveIt 2 and SLAM Toolbox refs verified against their current docs. Gemini mislabeled refs by one in its Ch3 notes; verification was done against the real refs. Ch2 (T-3b) rerunning after Gemini tried a shell command.
- 5-9: ABB forum threads that were never opened are no longer the only source for zone, corner-path and SingArea claims. Added the ABB RAPID technical reference manual (3HAC050917-001 rev AC, RobotWare 6.16.04; new ref 13, later refs renumbered) and reworded three sentences to what it states. Event 50024 and the MoveJ workaround still rest on the forum refs.
- Step 3 Ch2: 2-1 LBR iiwa (seven-axis torque sensors) and 2-3 KRL/Pascal and Nemec (JSI since 1983) refs verified; two links moved to working URL variants.
- Step 4 (Ch4 and Ch6 partial refs): 4-2 "Category 4 needs diagnostic coverage above 99%" corrected to "at least 99%" (KEYENCE: high DC is 99% <= DC); 4-3 NBER w23285 ref links the PDF with the 2017 ranges; 6-1 URSim ports confirmed in the existing UR client library ref.
- Step 5 (all 59 remaining partial refs, `docs/handoff/step-5.md`): Gemini read each current source and gave evidence words per cited sentence; Claude's checker fetched every source and kept only exact matches. 14 refs upgraded to verified (only 41 of the 90 sentences Gemini called "supported" fully matched). Not-found sentences listed in `research_notes/partials/step-5*.md` for follow-up.
- Step 6 (15 sentences no cited source supported, `docs/handoff/step-6.md`): new verified sources: ISO 8373:2021 sample and ifr.org (1-1), JAEA Fukushima archive records for the PackBot dates (1-5), PJRC Encoder.h state table (5-3), MathWorks pidstd (5-4); Woodman added to the 5-5 magnetometer sentence. Corrections: 1-1 "robotic device" claim was ISO's, not the IFR's; 1-5 "first robot entry" and "several hundred millisieverts per hour" dropped; 1-4 "over 60 standard courses" dropped; 1-1 "from 1967 to the late 1980s" dropped; 5-4 "ISA standard form" now "standard form". Refs renumbered in 1-1, 1-5, 5-3, 5-4.
- Step 7 (formerly unreachable refs, `docs/handoff/step-7.md`): with the Jina fallback 85 of 129 unreachable sources became readable. Claude cached their text; Gemini read the cache and gave evidence words; Claude's checker matched them against the same text (comma numbers rechecked whole). 60 refs upgraded to verified (35 in Ch1, Ch5, Ch6; 25 in Ch2-4, mostly ISO/EU/ANSI standards pages).
