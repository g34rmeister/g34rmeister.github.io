# Omen handoff (2026-11-08, State updated 2026-11-09)

Who this is for: the next agent session (or Gerald) picking up robOSStics on the Linux Omen machine. Read `CLAUDE.md` and the tail of `CHANGELOG.agents.md` first; this file only adds what those do not say. The previous report (2026-10-28) is in git history.

## State
- `main` is at `04f1be6`. All work since then is uncommitted on branch `site-architecture-tools` (about 100 files: agent tools, Chapter 11, Try-it boxes, figures, Open-Source Map links and entries, README). Gerald has not asked for a commit or PR yet.
- 70 lessons in 11 chapters, 95 pages; Chapter 11 (Mobile Robots and Navigation, 11.1-11.4) is new and has no lab yet. Every cited ref has a recorded claim check (`sources.py check` passes, 1112 sources). Local checks, browser tests and the widget tests (74 renders) pass on the branch; CI has not run on it.
- No open PRs, no open issues (#21 closed 2026-11-06: the link came back).

## What happened since 2026-10-28 (details in the changelog)
- New lesson 3.5 (Nav2 case study), teaching page, licences (Apache 2.0 code, CC BY-SA 4.0 text), free PR explainer and weekly link-check workflows.
- 37 widgets in `assets/js/widgets.js`, the latest being `fov` (7.1) and `vlan` (8.6); `scripts/test_widgets.js` finds and tests all of them.
- Overnight coherence/slop pass over the whole site (agy + Haiku audits, Opus line edits, Haiku before/after QA, Claude review). Citations, numbers and safety text unchanged.
- Gerald's queued items done 2026-11-06: 1.7 application claim cited (A3 FAQ), 3.3 REP 2004 wording, 5.2 watchdog wording, 5.4 links to 5.2 for stop categories, 6.4 integral-gain claim matches WPILib.
- Good-first-issue drafts: Gerald chose to fix them in-house instead of posting. All valid ones are fixed. Both drafts files record the status of each item.
- Contribution path for outsiders is now a "Suggest an edit" link in the top meta bar of every course page (`addEditLink` in `learning.js`), plus the existing one under each lesson's References.

## Open decisions (ask Gerald; do not decide)
- Chapter 11 for AMR material: decided 2026-11-09, Gerald asked for it; 11.1 to 11.4 exist (see the changelog). Still open: a Nav2 simulation lab (must be run first) and whether to cover AMR safety (ask Gerald; safety content).
- Chapter 3 overview (`robotics-oss.html`) has audit findings (roadmap sentences, a seven-step workflow in one sentence). It is Gerald's prose: propose edits, do not apply them.
- Teaching page wording is Gerald's. Its sentence about the edit link ("under its references") is still accurate.
- Books (Siegwart, Gat, R.U.R.) are optional. If used, keep them outside the repo and only use them to check claims.

## Known loose ends (safe to do without asking)
- Update 2026-11-09: of the partial refs in the next item, all are resolved, including 1.7 and 5.2 (fixed 2026-11-10 with Gerald's approval; see the changelog).
- Partial refs worth a look (from the 2026-11-08 recheck; `sources.py report <lesson>` shows the notes). Each sentence names something its source does not show; check whether another ref in the same sentence covers it, else soften the wording or add a source: 1.3 ref 16 ("two classes", "four types of collaborative operation"), 1.3 ref 28 (humanoids "moving from pilots to early production"), 1.6 ref 4 (joint DOF counts, "numbered from the base"), 1.7 ref 3 (Part 1 "partly completed machinery") and ref 12 (OSHA four options; "no part of the operator's body"; safety text, so ask Gerald before editing), 5.2 ref 28 (Article 6/Annex I not reached in the fetch), 6.5 ref 8 (DMP "computes orientation angles on-chip"; the datasheet says "hardware accelerator engine").
- 4.1 ref 8 venue (ICRA workshop, Kobe) is still unconfirmed; wiki.ros.org/Papers/ICRA2009_Quigley is behind Anubis.
- About 35 refs are still unreachable behind bot walls (Britannica, ABB library, iso.org, analog.com, st.com, scribd, doi.org). Wayback rate-limited again on 2026-11-08; retry `archive.org/wayback/available` lookups slowly (one every few seconds).
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
- `test_widgets.js` needs arguments: `node scripts/test_widgets.js "$PWD" <outdir> [name,name]`. It takes about 2-3 minutes, so run it in the background.
- After lesson or source edits: `sources.py sync && build_index.py && site_sync.py`. Record new claim checks with `sources.py import FILE LESSON`. The file is a JSON list of `{ref, status, claim, evidence, note}` using the ref number after renumbering.
- `renumber_refs.py` drops non-numeric ref ids, so give a new ref a numeric placeholder id (for example the next free number).
- `fetch_text.py --grep` is a plain substring match (no `\|`). Output is capped at 20,000 characters unless you pass `--max`.
- `check_site.py` fails on stray regex backreferences (`\1`) in page text. Use a function, not a string, for `re.sub` replacements.
- agy: `agy -p "..." --mode accept-edits --model gemini-3.8-flash-high --effort high --add-dir "$PWD" --print-timeout 45m`. It cannot run shell commands. Do not edit `~/.gemini/antigravity-cli/settings.json`.
- Playwright Chromium on Ubuntu 26.04: `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 ~/pw/node_modules/.bin/playwright install chromium`. The CI browser job is pinned to `ubuntu-24.04`.
