# Handoff: robOSStics on the Linux Omen machine (near-autonomous)

You are Claude Code running on Gerald's Linux machine ("omen"), working on the robOSStics course site (repo `g34rmeister/g34rmeister.github.io`, GitHub Pages, no build step). Gerald wants you to work through the queue below with as little check-in as possible. Read `CLAUDE.md` and the last ~15 entries of `CHANGELOG.agents.md` first; do not re-audit the site.

## 0. Getting the work onto this machine

Everything is on `main` (`git pull`). The step 27 ticket is `docs/handoff/step-27.md`.

## 1. Setup on Linux (do once, verify each)

- Python: use `python3` (the Windows notes say `py`).
- Browser test: `npm install --no-save --prefix ~/pw playwright@1.56.1 && npx --prefix ~/pw playwright install chromium`, then run `NODE_PATH=~/pw/node_modules node scripts/test_playwright.js`.
- Gemini (agy CLI): find the binary (`which agy` or `~/.local/share/agy/bin/agy`). Headless runs need `--mode accept-edits --add-dir <repo> --print-timeout 45m`. In headless mode any permission prompt is auto-denied (output says `jetski: no output produced ... permission`). On Windows `read_file` got denied mid-run. Before delegating, Gerald should add allow rules to the agy settings file (`~/.gemini/antigravity-cli/settings.json`), next to `trustedWorkspaces`:
  ```json
  "permissions": { "allow": [ "read_file(<repo>/**)", "write_file(<repo>/**)" ] }
  ```
  You must not edit that file yourself (it changes another agent's permissions); ask Gerald. If agy still fails twice, write the code yourself rather than burn turns.
- Gemini cannot run shell commands headless. Every ticket says "You cannot run shell commands. Do not try. Use only file read and file write tools." Quota: about 25 runs per day; prefer one big ticket over many small ones.

## 2. Autonomy rules

You may, without asking:
- Delegate drafting to Gemini, review its output, fix it, run every check, commit.
- Push to `main` when ALL of these pass locally:
  `python3 scripts/site_sync.py --check && python3 scripts/check_site.py && python3 scripts/sources.py check && python3 scripts/build_index.py --check && python3 scripts/test_hygiene.py` plus the browser test. Then confirm CI on GitHub (`curl -s "https://api.github.com/repos/g34rmeister/g34rmeister.github.io/actions/runs?head_sha=$(git rev-parse HEAD)"`; Site Sync, Site Hygiene and pages deploy must all succeed). If CI fails, fix forward immediately.
- Append an entry to `CHANGELOG.agents.md` in every commit that changes the site.

Stop and ask Gerald before:
- Anything about safety content (ISO 10218, ISO 13849, risk graphs, PL/SIL values, e-stop or protective-stop behaviour). Safety text must be exact and from a checked source; do not let Gemini draft it.
- New chapters or lessons, renumbering, deleting pages, changing URLs.
- Adding any citation you have not fetched and checked yourself (`scripts/fetch_text.py URL --grep word ...`; record with `sources.py import`).
- Spending money, API keys, GitHub settings, editing another agent's config, force-pushes.
- Rewriting Gerald's own prose. Chapter 3 and the OSS map are drafts he will rewrite in his own voice; fix errors only.

Known Gemini failure modes (check for each): fabricated URLs and lesson titles, numbers not in the source, padded unsourced prose, false self-reports ("all verified", word counts, edits it never made). Measure files yourself.

Scripted HTML edits: check tag balance afterwards (an unclosed `<pre>` once broke the browser test). Do not use `sed` replacements with `\1`.

## 3. Queue (in order)

1. **Finish step 27, Part A** (`docs/handoff/step-27.md`). Parts B and C are done and on `main`: the progress migration in `learning.js` (reviewed, guarded against data saved after the renumber, browser-tested with old-style, new-style and empty storage) and `test_hygiene.py` reading its page list from `site-hygiene.yml`. Ignore Part B and C in the ticket.
   - Part A widgets: `rosgraph` (4.4), `movejl` (2.3), `threshold` (7.3), `prflow` (3.2), `modbus` (8.3). Delegate to Gemini, then check that each one shows only what its lesson says, works at 320 px width in light and dark, is keyboard-usable, and respects `prefers-reduced-motion`. Bump `widgets.js?v=` on every page that loads it, and add the names to the header comment in `widgets.js`.
2. **More widgets** (same rules; one ticket): a trapezoidal motion-profile slider where a lesson already explains velocity profiles (find it with `grep -il "trapezoid\|velocity profile\|acceleration" robotics-*.html`; if no lesson explains it, skip), a pinhole/field-of-view calculator in 7.1 if its formula is in the lesson, a VLAN/zone diagram in 8.6 if the lesson describes zones and conduits. Never invent the content a widget shows. The safety risk graph is NOT in this queue (ask Gerald).
3. **Hub hero line** explaining the name robOSStics (robotics + OSS). Draft one sentence, put it on the hub, and note it in your final summary so Gerald can reword it.
4. **"Using this in a class" page** (`robotics-teaching.html`, extra page like `robotics-method.html`; register it in `TRAILING_COURSE_PAGES` in `scripts/site_sync.py` and the page list in `site-hygiene.yml`, link from the hub buttons). Content from the course itself only: chapter order, which chapters are optional (Ch6), approximate minutes from `course-data.js`, quizzes as self-checks, the capstones. No pedagogy claims without a checked source.
5. **Issue text for "good first issue"**: write 5-8 small, real issues (typos you find, missing alt text, widget ideas) into `docs/handoff/good-first-issues.md`. Do not create them on GitHub; Gerald will.

## 4. Open decisions (do not decide; list them in your final summary)

- AMR chapter: new Chapter 11, or a lesson folded into Chapter 3.
- PR-explainer GitHub Action: needs an API key.
- Licences still unknown on the OSS map: MoveIt 2, Nav2, Gazebo, UR ROS 2 driver, Wireshark (they show "See the project's repository"; filling them needs a checked source each).

## 5. When you finish or get stuck

Leave a short report at `docs/handoff/omen-report.md`: what shipped (commit hashes), what you reviewed and fixed in Gemini's output, what is left, and the open decisions. Keep it under 40 lines.
