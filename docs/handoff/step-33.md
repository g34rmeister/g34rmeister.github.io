# Step 33: lesson 3.5 "Case Study: Contributing to Nav2"

Branch: `main`. Read `CLAUDE.md` ("Direction") first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Create only the three files named below; edit nothing else.

## Sources (the ONLY allowed sources)

Cached plain text in `research_notes/nav2/cache/`. Each file's URL for the References list:
- `readme.txt`: https://github.com/ros-navigation/navigation2/blob/main/README.md
- `contributing.txt`: https://github.com/ros-navigation/navigation2/blob/main/CONTRIBUTING.md
- LICENSE (already checked; text: "Portions of this repository are available under one of the following licenses * Apache-2.0 * BSD-3-Clause * Apache-2.0 AND BSD-3-Clause. Please see the package.xml file for each package to see the specific license for ... Contributions to existing files should be made under the license of that file."): https://github.com/ros-navigation/navigation2/blob/main/LICENSE
- `getting_involved.txt`: https://github.com/ros-navigation/docs.nav2.org/blob/rolling/docs/community/getting_involved.md
- `about.txt`: https://github.com/ros-navigation/docs.nav2.org/blob/rolling/docs/about_and_contact/index.md
- `plugins.txt`: https://github.com/ros-navigation/docs.nav2.org/blob/rolling/docs/configuration_and_development/navigation_plugins.md
- `concepts_index.txt`, `concepts_servers.txt`, `concepts_env.txt`, `concepts_bt.txt`, `concepts_state.txt`: https://github.com/ros-navigation/docs.nav2.org/blob/rolling/docs/getting_started/navigation_concepts/<index|navigation_servers|environmental_representation|behavior_trees|state_estimation>.md

## 1. `research_notes/nav2/facts.md`

Numbered facts, one per line: `F<n> | <cache file> | "<verbatim quote, copied exactly, max 40 words>"`. Copy the quote character for character from the cache file (it will be checked by a script). 30-50 facts covering: what Nav2 is and what it is used for; the navigation concepts (state estimation / localization, environmental representation / costmaps, navigation servers: planners, controllers, behaviors, behavior trees); how plugins work; licensing (both the LICENSE and CONTRIBUTING wording); DCO sign-off; how to get involved and contribute (issues, pull requests, community channels, roadmap/maintainers as the files say).

## 2. `robotics-3-5.html`

Copy the complete page skeleton of `robotics-3-4.html` exactly (head tags, navbar, masthead, footer, scripts), changing only the title/meta/canonical/og/twitter text to this lesson, and replace the article body. Do not hand-write navigation, prev/next links or the source-check line; `site_sync.py` regenerates them, so keep the same placeholder structure 3-4 uses.

Content (about 900-1,300 words of prose, plain short sentences for robotics newcomers):
- 01 What Nav2 is: what it does for a mobile robot, in the sources' words.
- 02 How a mobile robot navigates (the concepts pages): localization/state estimation, costmaps, planners and controllers, behavior trees. Short, as an introduction for readers who have not met mobile robots; say that this course's Chapter 4 covers ROS 2.
- 03 How the project is organised: packages, plugins (from `plugins.txt`, name only a few as examples), the separate documentation repository.
- 04 Licensing and sign-off: the LICENSE wording and the CONTRIBUTING wording, stated separately and exactly; the DCO `Signed-off-by` line.
- 05 How to get involved: only what `getting_involved.txt` and `contributing.txt` say.
- 06 A first contribution path: link back to 3.2 (fork and pull request) and 3.4; suggest starting with the documentation repository or an issue, only as the sources describe.
- 07 Check your understanding: 3 short questions (no answers needed beyond what the page shows), same markup as 3-4.
- References: one `<li id="ref-N">` per source file used, numbered by first use, cited inline with `<sup><a href="#ref-N">[N]</a></sup>`.

Rules: every factual sentence must come from a fact in `facts.md` (put the fact IDs in an HTML comment at the end of each paragraph, e.g. `<!-- F3 F7 -->`). No numbers, names, versions or claims that are not in the facts. No safety content (do not describe collision monitoring or safety ratings beyond naming them if the sources list them). Exactly one `<h1>`. Balanced tags. Do not claim the lesson is tested.

## 3. `research_notes/nav2/data.json`

`{"lesson": {"id": "3-5", "minutes": N, "title": "Case Study: Contributing to Nav2", "objectives": [3-4 short plain objectives], "keyTerms": [6-8 terms that appear verbatim in the lesson]}, "glossary": {"<term>": "<one beginner sentence from the lesson>", ...}, "quiz": [4 questions in the course-data quiz format with "lesson": "3-5"], "manifest": "<one-line summary>"}`. Glossary entries only for key terms; definitions only from the lesson text. Quiz answers only from the lesson; vary the correct answer position.

## Finish

At most 6 lines: files written, word count you estimate, anything you could not do. Do not claim you verified anything.
