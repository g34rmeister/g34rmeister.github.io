# Step 67: site iteration plan (Opus plans and reviews, Gemini 4 Hydrogen drafts)

Branch: `iterate-67` off `main` after PR #30 merges (until then, off `ch1-newbie`).
Read CLAUDE.md first. Loop per `docs/agentic-workflow.md`: Claude writes the ticket, `agy` drafts (file-only: headless agy cannot run shell), Claude runs the scripts and reviews (Opus verdict), at most 2 fix rounds.

## Gap snapshot (2026-11-26, from pages and course-data.js)
- **No "Open source in this lesson" box:** all of Ch1 except 1-4, Ch5, Ch6 except 6-7, Ch9 except 9-6, 11-1, 11-3, 11-4, plus 2-1..2-3, 2-5..2-7, 8-1, 8-2, 8-4.
- **Quiz thin (3 questions):** 2-1..2-4, 2-6..2-8, all of Ch4 except 4-9, 5-1..5-3, 5-5, all of Ch6, 7-x is 4, 10-5.
- **No widget:** 1-2, 1-4, 1-5, 2-2, 2-4, 3-1, 3-3..3-5, 4-3, 4-5, 4-7..4-10, 5-1..5-3, 5-5, 7-2, 8-4, 8-5, 9-1..9-5, 10-2..10-5, all capstones.
- **Thin lessons (≤7 min or ≤5 refs):** 10-1 (4 min, 2 refs), 10-2 (3 min, 3 refs), 3-1..3-4, 8-1, 8-4, 8-5, 9-1..9-5, 11-4.
- Handoff plan items 3 (OSS map), 4.1 (ROS graph = `rosgraph`), 4.2 (MoveJ/MoveL = `movejl`), 4.4 (motion profile = `trapezoid`), 4.6 (PR flow = `prflow`), 6 (Nav2 chapter) and 7 (teaching page) are done. Item 4.5 (ISO 13849 risk graph) and item 8 (PR bot) are still open.

## Waves
| Wave | Work | Who | Needs Gerald? |
|---|---|---|---|
| 1 | T-67a OSS box coverage, T-67b quiz top-up | Gemini (closed-world JSON), Claude verifies and applies | No |
| 2 | Widgets for widget-less lessons, ranked: 10-2 costmap inflation, 4-7 launch/params tree, 9-2 troubleshooting flow, 7-2 lighting angle, 4-8 MoveIt pipeline | Claude specs each, Gemini builds one widget per task in `widgets.js` (separate function, no shared helpers renamed), Claude gates at 320 px and 1280 px | Pick the list |
| 3 | Deepen thin lessons (10-1, 10-2 first, then Ch9, 8-4/8-5, Ch3) | Research-ticket protocol: Gemini lists candidate URLs and grep words, Claude fetches/verifies, Gemini drafts closed-world from verified notes | Yes: okay to expand, and web access for fetching |
| 4 | ISO 13849 risk graph widget (5-4), PR explainer bot, rename follow-ups (item 9) | Claude (safety content stays with Opus) | Yes: decisions in plan items 4.5, 8, 9 |

## Shared rules for every Gemini ticket
- Touch only the files the task lists. Never edit `docs/sources.json`, never mark anything verified.
- Facts come only from the lesson text (Wave 1-2) or verified notes (Wave 3). Missing facts become `TODO-VERIFY` in an HTML comment.
- Known failure log (do not repeat): merge conflict markers left in files; uncited new prose that contradicts the lesson's own cited wording; summary boxes/tooltips paraphrased from general knowledge instead of the lesson (2.4 "four pillars", "all controllers use quaternions"); calling a link open-source without a repo and licence; invented CSS alias classes nobody uses; layout checked only at 320 px.
- End: "Finish with a summary of at most 10 lines: files changed, anything unresolved, any deviation. Do not paste file contents."

## T-67a: OSS box coverage (write only `docs/handoff/step-67-oss.json`)
For each lesson in the "No OSS box" list, read `robotics-<id>.html` and find open-source projects the lesson text already names and uses (not just mentions in passing). Output a JSON array of `{"lesson", "project", "existing_id" (one of the ids in `scripts/site_manifest.json` `ossProjects`, or null if new), "repo_url" (only if the lesson links it), "quote" (exact sentence from the lesson, ≤ 30 words), "html_line"}`. A lesson with no genuine project gets one entry with `"project": null` and a one-line reason. Do not edit the manifest or any page.

## T-67b: Quiz top-up (write only `docs/handoff/step-67-quiz.json`)
For each lesson with 3 questions in the "Quiz thin" list (Ch2, Ch4, Ch5, Ch6, 10-5), read the lesson and its chapter file `assets/js/quiz/ch<N>.js`. Propose 2 new questions per lesson in the same object format (`lesson`, `question`, `choices` (4), `answer` index, `explanation`), plus `"quote"` (exact lesson sentence that states the answer, ≤ 30 words) and `"html_line"`. Rules: the answer must be stated in that lesson; no overlap with existing questions; distractors plausible but clearly wrong per the lesson; plain wording for newcomers; safety numbers copied exactly. Do not edit the quiz files.

## Wave 1 result (2026-11-26, Claude review)
- Ch3 never gets the box on purpose (`OSS_NOTE_SKIP_CHAPTERS = {3}` in `site_sync.py`, Gerald's prose); its T-67a entries were dropped.
- T-67a: 72 entries; accepted the 8 that map to existing projects (2-7, 6-9 UR Client Library; 6-4, 6-6 ros2_control; 6-9 MoveIt 2; 11-4 ROS 2, pymodbus, colcon). All quotes checked (the 9 "misses" were `<code>` tags, text is real). 27 lessons correctly came back `null` (no project used).
- Deferred to Wave 3 (new map rows need a checked repo and licence first): Blockly (2-1), abb_driver and abb_motion_program_exec (2-7), Arduino Servo (6-2), WPILib (6-4, 6-6, 6-9), Arduino PID Library (6-4, 11-3), simple-pid, ODrive (6-4), TurtleBot3 (6-6), robot_localization, FilterPy, PX4 (6-8), Modern Robotics (6-9, 6-10), Robotics Toolbox for Python, Ruckig, open_abb (6-9), PythonRobotics (6-10), PJRC Encoder (11-3).
- T-67b: 62 questions, all quotes found on their pages, all answer indices valid, no near-duplicates of existing questions (similarity > 0.6), 12 random spot-read and accepted. Applied to ch2/4/5/6/10, `version` 2026-11j.

## Review gate (Claude)
- T-67a: grep each quote in its page; reject entries whose quote is missing or whose project is only mentioned in passing; add accepted ones to `ossProjects` in the manifest, run `site_sync.py`.
- T-67b: grep each quote; check answer index against the quote; spot-read 10 at random; append accepted ones to the quiz files, bump `version` in course-data.js, run `site_sync.py` (regenerates `quizCounts`).
- Then the four CI checks, `test_playwright.js`, and a changelog entry listing rejects and why.
