# Omen handoff (2026-11-08, State updated 2026-11-10)

Who this is for: the next agent session (or Gerald) picking up robOSStics on the Linux Omen machine. Read `CLAUDE.md` and the tail of `CHANGELOG.agents.md` first; this file only adds what those do not say. The previous report (2026-10-28) is in git history.

## State
- `main` is at `10d52ec`, clean. Everything is merged: PR #23 (`site-architecture-tools`: agent tools, Chapter 11, quizzes split into `assets/js/quiz/ch<N>.js`, KaTeX, chapters menu and navbar search, show-answer blocks, accessibility fixes) and PR #24 (issue #22 source links). CI passed on both.
- 70 lessons in 11 chapters, 95 pages, 240 quiz questions; Chapter 10 (Mobile Robots and Navigation, 10.1-10.4; it was Chapter 11 until the 2026-11-10 swap) has no lab yet, and the capstones are Chapter 11. Every cited ref has a recorded claim check (`sources.py check` passes, 1111 sources).
- No open PRs, no open issues (#22 closed 2026-11-10 by #24).
- The repo's GitHub account is `g34rmeister`. This machine's `gh` also has `johnbachspec` logged in and it may be the active one; run `gh auth switch -u g34rmeister` before pushing or touching issues.

## Round of 2026-11-09/10 (details in the changelog)
- Uncommitted on branch `nav-a11y-plain-language` (2026-11-10): Check yourself above References, breadcrumb and previous/next line on lessons, reference back-links, accessibility fixes, and the plain-language pass (see the last changelog entry). Gerald has not asked for a commit or PR. To repeat the language pass: `scripts/plain_language.py` and tickets `docs/handoff/step-47.md` and `step-49.md`. If agy prints "authentication required", Gerald must run `agy` to log in.
- Look and interaction rounds were planned by Claude and implemented by Sonnet subagents, each verified by Claude (checks, Playwright, widget tests, screenshots). Gerald has not yet looked at the result in a browser; the visible changes are the 720 px text column, underlined links in running text (including citation numbers) and the "Chapters" dropdown in the navbar.
- Chapter order stays numerical (Gerald reverted a reorder; see `CLAUDE.md`).

## What happened 2026-10-28 to 2026-11-08
- New lesson 3.5 (Nav2 case study), teaching page, licences (Apache 2.0 code, CC BY-SA 4.0 text), free PR explainer and weekly link-check workflows.
- 37 widgets in `assets/js/widgets.js`, the latest being `fov` (7.1) and `vlan` (8.6); `scripts/test_widgets.js` finds and tests all of them.
- Overnight coherence/slop pass over the whole site (agy + Haiku audits, Opus line edits, Haiku before/after QA, Claude review). Citations, numbers and safety text unchanged.
- Gerald's queued items done 2026-11-06: 1.7 application claim cited (A3 FAQ), 3.3 REP 2004 wording, 5.2 watchdog wording, 5.4 links to 5.2 for stop categories, 6.4 integral-gain claim matches WPILib.
- Good-first-issue drafts: Gerald chose to fix them in-house instead of posting. All valid ones are fixed. Both drafts files record the status of each item.
- Contribution path for outsiders is now a "Suggest an edit" link in the top meta bar of every course page (`addEditLink` in `learning.js`), plus the existing one under each lesson's References.

## Open decisions (ask Gerald; do not decide)
- AMR chapter (now Chapter 10): decided 2026-11-09, Gerald asked for it; 10.1 to 10.4 exist (see the changelog). Still open: a Nav2 simulation lab (must be run first) and whether to cover AMR safety (ask Gerald; safety content).
- Chapter 3 overview (`robotics-oss.html`) has audit findings (roadmap sentences, a seven-step workflow in one sentence). It is Gerald's prose: propose edits, do not apply them.
- Teaching page wording is Gerald's. Its sentence about the edit link ("under its references") is still accurate.
- Books (Siegwart, Gat, R.U.R.) are optional. If used, keep them outside the repo and only use them to check claims.

## Known loose ends (safe to do without asking)
- 2.8 ref 18 cites an unreadable Scribd copy of the UR script manual; UR's own script manual confirms the same signatures, so swap the citation to it (record the check). 2.8 ref 12 is partial but ref 11 covers the rest of the sentence; no change needed.
- 11.3 ref 10 (capstone wheel project, 10.3 before the 2026-11-10 swap; NUS copy of the L298 datasheet) answered nothing from GitHub's runners once while loading fine locally. If the Monday link check flags it again, the runners are probably blocked there; st.com does not answer scripts either, so there is no better host yet.
- axe left 105 "incomplete" nodes on 6.4 (formulas) uninspected. Not tested at all: Safari, Firefox, touch use of the search.
- Update 2026-11-09: of the partial refs in the next item, all are resolved, including 1.7 and 5.2 (fixed 2026-11-10 with Gerald's approval; see the changelog).
- Partial refs worth a look (from the 2026-11-08 recheck; `sources.py report <lesson>` shows the notes). Each sentence names something its source does not show; check whether another ref in the same sentence covers it, else soften the wording or add a source: 1.3 ref 16 ("two classes", "four types of collaborative operation"), 1.3 ref 28 (humanoids "moving from pilots to early production"), 1.6 ref 4 (joint DOF counts, "numbered from the base"), 1.7 ref 3 (Part 1 "partly completed machinery") and ref 12 (OSHA four options; "no part of the operator's body"; safety text, so ask Gerald before editing), 5.2 ref 28 (Article 6/Annex I not reached in the fetch), 6.5 ref 8 (DMP "computes orientation angles on-chip"; the datasheet says "hardware accelerator engine").
- 4.1 ref 8 venue (ICRA workshop, Kobe) is still unconfirmed; wiki.ros.org/Papers/ICRA2009_Quigley is behind Anubis.
- About 35 refs are still unreachable behind bot walls (Britannica, ABB library, iso.org, analog.com, st.com, scribd, doi.org). Wayback rate-limited again on 2026-11-08; retry `archive.org/wayback/available` lookups slowly (one every few seconds).
- `assets.robotiq.com` is gone for good (no DNS). Robotiq manuals now live under `blog.robotiq.com/hubfs/support-files/`; the full file list is in the HTML of `robotiq.com/support/wrist-camera`. The 2019 Hand-E online manual is not hosted anywhere by Robotiq.
- Two brettbeauregard.com links in 6.4 are http only (the site has no https). Leave them.
- About 50 audit findings were kept on purpose (judgement calls or QA restorations). Do not re-apply them from `docs/handoff/step-45-slop-*.md` without reading the changelog first.

## Hard rules learned this session
- Ask Gerald before touching safety content, new chapters or lessons, renumbering, deleting pages, URL changes, unchecked citations, money, API keys, GitHub settings or another agent's config. The same goes for public GitHub actions (posting issues).
- Gerald's own prose (Ch3 3.1-3.4, OSS map, teaching page): fix errors only.
- Never let Gemini draft safety content. Gemini invented facts several times (ports, laws, byte sizes, PLC level mappings), so verify every Gemini claim against the lesson or the source.
- Do not work around a classifier denial; tell Gerald instead.
- Claude subagents use Sonnet by default (memory). Use Haiku for fetching, audits and QA, Opus for prose polish. agy (Gemini) does report-only or data-file tickets that scripts can verify.

## Tool gotchas
- Full check: `python3 scripts/site_sync.py --check && python3 scripts/check_site.py && python3 scripts/sources.py check && python3 scripts/build_index.py --check && python3 scripts/test_hygiene.py`, then `NODE_PATH=~/pw/node_modules node scripts/test_playwright.js`.
- Accessibility: download axe-core 4.10.2 to the scratchpad (never vendor it) and run `AXE_PATH=/path/axe.min.js NODE_PATH=~/pw/node_modules node scripts/test_playwright.js`.
- Wayback (`web.archive.org`) blocked automated downloads as "abusive bot traffic" on 2026-11-09; the `wayback/available` lookup API still answers.
- Quiz questions are in `assets/js/quiz/ch<N>.js`; bump `version` in `course-data.js` after changing any (it busts their cache). `quizCounts` is generated.
- `test_widgets.js` needs arguments: `node scripts/test_widgets.js "$PWD" <outdir> [name,name]`. It takes about 2-3 minutes, so run it in the background.
- After lesson or source edits: `sources.py sync && build_index.py && site_sync.py`. Record new claim checks with `sources.py import FILE LESSON`. The file is a JSON list of `{ref, status, claim, evidence, note}` using the ref number after renumbering.
- `renumber_refs.py` drops non-numeric ref ids, so give a new ref a numeric placeholder id (for example the next free number).
- `fetch_text.py --grep` is a plain substring match (no `\|`). Output is capped at 20,000 characters unless you pass `--max`.
- `check_site.py` fails on stray regex backreferences (`\1`) in page text. Use a function, not a string, for `re.sub` replacements.
- agy: `agy -p "..." --mode accept-edits --model gemini-3.8-flash-high --effort high --add-dir "$PWD" --print-timeout 45m`. It cannot run shell commands. Do not edit `~/.gemini/antigravity-cli/settings.json`.
- Playwright Chromium on Ubuntu 26.04: `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 ~/pw/node_modules/.bin/playwright install chromium`. The CI browser job is pinned to `ubuntu-24.04`.
