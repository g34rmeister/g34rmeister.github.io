# robOSStics improvement plan (handoff)

Updated 2026-10-27 from Gerald's plan, reconciled with what is actually on the branches, and re-ranked for the new direction below. For Claude Code in plan mode: pick items by number; each item is one PR.

**Before any item:** read `CLAUDE.md` (including "Direction"), `CHANGELOG.agents.md` and `docs/lessons-index.md`, not the pages. Append a changelog entry in every PR. Run the four checks from CLAUDE.md before pushing. Keep the Wikipedia theming. New citations must be checked and recorded with `sources.py import` (CI fails otherwise).

## Direction (new)

The site becomes **an open-source platform for robotics newcomers**, and a little less of an academic course.

- **Goal:** a bridge from "I can program a bit" to "I use and contribute to open-source robotics" (ROS 2, MoveIt, Nav2, ros2_control, Gazebo, OpenCV, PCL, pymodbus and similar). Industrial context stays, because it is what makes the site different.
- **Lighter on academics:**
  - Learning objectives stay, but short and plain; no Bloom-verb audit.
  - Quizzes and "Try it" checks stay as optional self-checks, not assessment.
  - Lessons can be shorter (about 800 to 1,500 words is fine).
  - The college syllabus page (old item 5) drops to a small optional page.
  - Stop working through the remaining partial/unreachable refs one by one; fix them only when a lesson is touched anyway.
- **Sources:** official project documentation, READMEs, CONTRIBUTING guides, maintainers' talks and vendor manuals count as primary sources. Papers and paywalled standards are optional.
- **Stays strict (non-negotiable):**
  - Every factual claim still traces to a checked source. The `sources.py check` CI gate stays, so nothing hallucinated gets in.
  - Safety content (4.4, 8.4, 9.2 lockout/tagout) stays exact.
  - Lab code must be run before it is published.
- **Contribution is a first-class path:** each chapter should point to at least one real open-source project, and say how a newcomer can start contributing to it.

## Actual state (what the old plan did not know)

- `main` (f4f7274): 42 lessons, Ch1 to Ch6.
- **PR #20 (rename to robOSStics)** is on `origin/claude/project-thread-85hgog`, not merged. It replaces "RISE Bot Instructor" with "robOSStics" in 62 files: all 42 lessons, the hub, chapter pages, the JS data files, CLAUDE.md, CHANGELOG and README.
- **Branch `gemini/ch7-and-reviews` (local, 10 commits ahead of main, not pushed).** It adds:
  - Ch7 Machine Vision (7-1..7-6, `robotics-vision.html`), Ch8 Industrial Networks (8-1..8-6, `robotics-networks.html`) and Ch9 Maintenance and Troubleshooting (9-1..9-6, `robotics-maintenance.html`): 60 lessons in total.
  - Quiz fix 4#2, a readability pass, and the Ch7-9 data in `course-data.js` (version `2026-10f`), the glossary and the manifest.
  - Tested labs: 8.3 Modbus, 8.6 Wireshark (steps not run), 9.6 Dashboard Server.
- Every Ch7-9 citation is checked in `docs/sources.json`; all four checks pass.
- Ch7-9 pages still say "RISE Bot Instructor" (8 to 12 times per page), because they were built from pre-rename templates.
- Widget and animation counts in the old plan are still right: 8 widgets, none in Ch3/Ch4/Ch6, no `@keyframes`, 5-2 and 5-3 have no figure.

## Ranked items

### 0. Land the two branches (do first, small)
1. Merge PR #20 into `main`.
2. Merge `main` into `gemini/ch7-and-reviews` and resolve conflicts. Most are name swaps; for the generated regions, re-run `site_sync.py` instead of hand-merging. CHANGELOG: keep both entries.
3. Apply the same rename to the 21 new pages and the Ch7-9 entries:
   ```
   sed -i 's/RISE Bot Instructor/robOSStics/g' robotics-7-*.html robotics-8-*.html robotics-9-*.html robotics-vision.html robotics-networks.html robotics-maintenance.html
   ```
   Check the result with `git grep "RISE Bot"`.
4. Run all four checks, push, and open the Ch7-9 PR. Gerald has to review Chapters 7, 8 and 9 before this PR merges.

### 1. Collaboration chapter (scaffold only; Gerald writes the text)
The core of the new direction.

**Decision needed (Gerald), now with a new wrinkle:** Ch7-9 sit after Ch6, so a collaboration chapter at position 6 lands mid-course. Options:
- **A:** Rewrite 6-1..6-3 in place as collaboration lessons; move the capstones into "Practice projects" boxes at the end of Ch2 (6-1 sim cell after 2-8), Ch3 (6-2 after 3-9) and Ch5 (6-3 after 5-10). URLs survive.
- **B:** Keep 6-1..6-3 as projects and add collaboration lessons as 6-4+.
- **C (recommended for the OSS direction):** make collaboration the **last** chapter, Ch10 (`robotics-collaborate.html`, 10-1..10-4). The course then ends on "now go contribute". Capstones stay as they are; AMRs move to Ch11, or become a "contributing to Nav2" case study inside Ch10.

**Steps once decided:**
- Add the chapter to `course-data.js` (title, objectives, quiz key) and the manifest; create the chapter page and lesson shells with headings and empty References.
- Planned lessons: GitHub basics; how to contribute to open source; traditional vs robotics OSS (ROS 2 governance, REPs, distributions, build farm); the human factor.
- Seed refs: firsttimersonly.com and opensource.guide/how-to-contribute (main source for the "how to contribute" lesson). Check both with `fetch_text.py` before citing.
- Run `site_sync.py`.

### 2. The site as a contribution playground (pairs with item 1)
- Add `CONTRIBUTING.md` (fix a typo, suggest a source, report a broken link), `.github/pull_request_template.md`, and issue templates (typo, broken source, content idea).
- Add a "Suggest an edit on GitHub" link to every lesson footer. Generate it in `site_sync.py` so it stays in sync; it links to `github.com/g34rmeister/g34rmeister.github.io/edit/main/<file>`.
- Label a few real issues `good first issue`. The 72 unreachable refs in `docs/sources.json` are ready-made candidates ("find a working source for ref N").
- Checks: the `site-hygiene.yml` footer check must still pass; update the shared-footer test if it compares exact markup.

### 3. "Robotics OSS map" page (new, fits the direction)
- A page `robotics-oss-map.html` (via the manifest and `site_sync.py`, not a lesson). One row per project the course uses: ROS 2, MoveIt 2, Nav2, ros2_control, Gazebo, OpenCV, PCL, cv_bridge/vision_opencv, pymodbus, Wireshark, UR Client Library.
- Each row shows what it is, which lessons use it, its license, and where to start contributing: the CONTRIBUTING file, the good-first-issue label link, and how it is governed.
- Every row must come from the project's own repo or docs (cache with `fetch_text.py`; record in `sources.json` like a lesson).
- Each lesson that uses a project links to its row.

### 4. Interactive widgets where there are none
Reuse the pattern (`data-widget="..."` plus a function in `widgets.js`, no libraries). Ranked:
1. 3-1 ROS graph: nodes and topics as boxes; publish and watch the message reach every subscriber; toggle a second subscriber; change QoS to show a dropped message.
2. 2-6 MoveJ vs MoveL on the existing 2-link arm drawing.
3. 5-10 two-link IK mode for `arm` (elbow up/down, unreachable zone).
4. 5-9 trapezoidal vs S-curve motion profile.
5. 4-4 ISO 13849 risk graph (PLr), using only the rule cited in the lesson.
6. Git branch/PR visualizer for the collaboration chapter (after item 1).

Checks: browser layout tests pass at 375px, no console errors, and each widget has a text fallback and keyboard controls.

### 5. Animations where motion explains the idea
- Where: 3-1 pub/sub, 5-3 quadrature A/B waveform (also fixes its missing figure), 5-2 PWM duty cycle (missing figure), 2-5 gripper I/O handshake, 1-3 SCARA/delta motion.
- How: inline SVG plus CSS `@keyframes` in `robotics.css`, paused by default with a play button; all motion inside `@media (prefers-reduced-motion: no-preference)`. No GIFs or video.
- Checks: the `check_site.py` assets check; every figure has a `<figcaption>` and alt text.

### 6. Content
- **Ch10 or Ch11 Mobile robots and AMRs** (the last approved topic), written OSS-first around Nav2, using the same loop as Ch7-9 (see "How the Ch7-9 loop really worked" below).
- Fill 5-10 and 6-2 to more refs only if those lessons are touched anyway.
- Leave the old "43 partial refs" sweep unless a lesson is being edited.

### 7. "Using this in a class" page (was the syllabus item, demoted)
- One short optional page: outcomes per chapter, a sample 6-week module built from the `course-data.js` minutes, and how quizzes, Try-it checks, labs and a contribution PR can be used as assessment.
- No Bloom-verb rewrite and no credit-hour framing. QTI export only if someone asks.

### 8. PR explainer bot (stretch)
- A GitHub Action on `pull_request` that posts one plain-language comment (what changed, which lesson, what a reviewer checks). It could use `anthropics/claude-code-action` with a prompt in `.github/pr-explainer.md`.
- **Decision needed (Gerald):** an `ANTHROPIC_API_KEY` secret and a cost per PR. Fork PRs cannot read secrets unless the workflow uses `pull_request_target`, which needs a security review first.
- A real bot comment can then serve as the CI example in the collaboration chapter.

### 9. Rename follow-ups (small)
- Hub hero: one line explaining the name (robotics + OSS, a bridge into open-source robotics).
- Rewrite the hub intro and `robotics-method.html` for the new direction: platform rather than course; "how this was made" stays.
- Optional: internal identifiers `RISE_COURSE`, `RISE_GLOSSARY`, `window.RISEBot` and `rise:*` events (touches `site_sync.py`, `check_site.py` and all JS). Users never see them, so low priority.
- Update the thesis citation text if the official title changes.

## Decisions waiting on Gerald
1. Collaboration chapter placement: A, B or C (item 1). C is recommended.
2. Where AMRs go: Ch11, or folded into the collaboration chapter as a Nav2 case study.
3. PR bot: API key and cost (item 8).
4. Review of Ch7, Ch8 and Ch9 before their PR merges.

## How the Ch7-9 loop really worked (read before more Gemini drafting)
- **Gemini via `agy -p` headless:** about a third of runs fail on permission denials (any shell, or file reads outside `--add-dir`); rerun them one at a time. Quota is about 25 runs a day.
- **Source finding:**
  - Gemini's URLs were often 404 or bot-walled (Ch8: 13 of 23 dead). Claude's own web searches found the real pages faster.
  - Cache every page with `fetch_text.py --max 400000` (the default cuts at 20,000 characters).
  - Check the status line, not just the size: Jina fallback output can be an empty shell.
- **Facts:**
  - Gemini extracting facts from cached text only gives 95-100% word-match verification.
  - Still check word distance and meaning: a few facts overstated their source.
- **Drafting:**
  - Give Gemini the **exact titles** of linked lessons, or it invents them (Ch8: every lesson).
  - Expect 50-65% unsourced elaboration in every draft. Claude cuts it and adds sourced sections; budget for that.
  - Never trust Gemini's word counts or edit logs. Measure the files.
- **Labs:** write and run the code first (Ch8 caught a pymodbus 3.16 address-offset bug), then give Gemini the files to embed word for word.
