# Step 60: draft lesson 4.10 "Lab: From a Failing Test to a Bug Report" (closed world)

Branch: `writing-polish-3`. Read `CLAUDE.md` first. You cannot run shell commands. Do not browse the web. Do NOT commit. You may edit ONLY `robotics-4-10.html` (between `<article class="robotics-article-body">` and `</article>`; leave everything outside the article and every generated block such as the breadcrumb, navbars, footer nav, JSON-LD and the oss-note comment markers untouched) and write ONLY one new file, `docs/handoff/step-60-data.json`.

## Why this lesson exists
A course review found a gap: Chapter 3 teaches the pull request workflow with a typo-sized change, and Chapter 4 teaches writing ROS 2 packages, but nothing shows a newcomer how to go from "I ran someone's code and a test failed" to a fix and a bug report a maintainer can act on. This lesson is that bridge. Readers are newcomers (first-year students or hobbyists, often reading in a second language) who finished 3.4 (first pull request) and 4.6 (first ROS 2 package).

## Closed world: your only sources
- `research_notes/contrib-bridge/lab-transcript.md` and the files under `research_notes/contrib-bridge/lab/two_link/`: the lab. Claude ran it. Copy code and terminal output from these files character for character. Never invent or tidy output. Do not add commands that are not in the transcript or in a source file below.
- `research_notes/contrib-bridge/sources/`: the reference texts. Each fact in the lesson that is not about the lab itself must come from one of these files and carry a citation.

| File | Reference to print in the References list |
|---|---|
| `CLI.rst` | Open Robotics, &ldquo;Running Tests in ROS 2 from the Command Line,&rdquo; ROS 2 Documentation: Lyrical (source: ros2_documentation, lyrical branch). https://docs.ros.org/en/lyrical/Developer-Tools/Debugging/Testing/CLI.html |
| `Python.rst` | Open Robotics, &ldquo;Writing Basic Tests with Python,&rdquo; ROS 2 Documentation: Lyrical (source: ros2_documentation, lyrical branch). https://docs.ros.org/en/lyrical/Developer-Tools/Debugging/Testing/Python.html |
| `Ament-Lint-For-Clean-Code.rst` | Open Robotics, the page title as written in the file, ROS 2 Documentation: Lyrical (source: ros2_documentation, lyrical branch). https://docs.ros.org/en/lyrical/Developer-Tools/Build/Ament-Lint-For-Clean-Code.html |
| `Reporting-an-issue.rst` | Open Robotics, &ldquo;Reporting an issue,&rdquo; ROS 2 Documentation: Lyrical (source: ros2_documentation, lyrical branch). https://docs.ros.org/en/lyrical/The-ROS2-Project/Contributing/Reporting-an-issue.html |
| `Making-a-PR.rst` | Open Robotics, the page title as written in the file, same wording. https://docs.ros.org/en/lyrical/The-ROS2-Project/Contributing/Making-a-PR.html |
| `Source-Control-Best-Practices.rst` | Open Robotics, the page title as written in the file, same wording. https://docs.ros.org/en/lyrical/The-ROS2-Project/Contributing/Contributing-to-code/Source-Control-Best-Practices.html |
| `Contributing.rst` | Open Robotics, the page title as written in the file, same wording. https://docs.ros.org/en/lyrical/The-ROS2-Project/Contributing.html |
| `colcon-installation.txt` | colcon developers, &ldquo;Installation,&rdquo; colcon documentation. https://colcon.readthedocs.io/en/released/user/installation.html |

Use only the sources you actually cite. Anything you want to say that no file supports: leave it out, or put `<!-- TODO-VERIFY: ... -->` in the HTML. No statistics, dates, version numbers, names or URLs from memory.

## Format
Open `robotics-4-6.html` and copy its markup patterns exactly: section headings (`<h2 class="article-section-title">NN. Title</h2>`), paragraphs, lists, code blocks, the "Try it" box, the "Check your understanding" list, the References list, and inline citations `<sup><a href="#ref-N">[N]</a></sup>` pointing at `<li id="ref-N">`, numbered by first use. Reference links use `target="_blank" rel="noopener noreferrer"`. Replace every TODO placeholder in the article. Keep exactly one `<h1>` (it is outside the article; do not add another). Escape `<`, `>` and `&` inside code blocks.

## Content (sections in this order)
1. **Why this lab.** The bridge described above, in plain words. Link back to `robotics-3-4.html` and `robotics-4-6.html`.
2. **What you need.** Python 3, a virtual environment, and colcon from pip (cite the colcon page). Say plainly that this lab needs NO ROS 2 install because the package is plain Python, and that on a machine with ROS 2 (lesson 4.3, `robotics-4-3.html`) the same colcon commands apply. Say the transcript was produced on Ubuntu 26.04 with Python 3.14 and colcon-core 0.21.3.
3. **The package.** The folder layout and the three files (`setup.py`, `two_link/kinematics.py`, `tests/test_kinematics.py`), verbatim, with one or two sentences on each. Tie the layout rules to `Python.rst` (the `tests` folder, the `test_FOO.py` name pattern, the `extras_require` test dependency). Mention that the arm is the planar two-link arm from `robotics-1-4.html`.
4. **Build and run the tests.** The commands and output from transcript part 1. Explain `colcon test` and `colcon test-result --all --verbose` using `CLI.rst`.
5. **Read the failure.** Walk through the failure message line by line. Then the hand calculation for L1 = 0.5, L2 = 0.3, θ1 = 90°, θ2 = −90°: correct y = 0.5·sin 90° + 0.3·sin(90° − 90°) = 0.5; the buggy line computes 0.5·sin 90° + 0.3·sin(−90°) = 0.2. Show which line of `kinematics.py` is wrong and why the first test still passes.
6. **Fix it and test again.** The one-line fix and transcript part 2. Also the single-test run with `--pytest-args -k` (in the transcript; cite `Python.rst`) and the `--event-handlers console_cohesion+` flag (cite `Python.rst`; say it was not part of the transcript).
7. **In a real ROS 2 package.** What changes: what `Ament-Lint-For-Clean-Code.rst` says about linters, in at most two short paragraphs, only what the file states.
8. **Write the bug report.** What `Reporting-an-issue.rst` says: where to report, what to check first, what to include. Then a worked example report for the `two_link` bug using the headings that file asks for, clearly labelled as an example about this lab's own practice package, not a real issue in any project.
9. **From report to pull request.** What `Making-a-PR.rst`, `Source-Control-Best-Practices.rst` and `Contributing.rst` say a newcomer needs for a first code PR (pick the 4 to 6 points that matter most to a beginner). Link to `robotics-3-2.html`, `robotics-3-5.html` and `robotics-oss-map.html`.
10. **Try it** box with 4 tasks (for example: add a third test for θ1 = 0°, θ2 = 90° and work out the expected values by hand first; break the x line on purpose and predict which tests fail; write the bug report for that second bug; find the issue tracker of one project on the Open-Source Map).
11. **Check your understanding** (4 questions) and **References**.

Writing rules: at least 1,200 words of prose, no maximum. Short sentences, everyday words, full sentences with their articles. Explain every term on first use (virtual environment, test, assertion, linter, stack trace, regression). No em dashes, no semicolons in prose, American spelling. No praise words. Safety note is not needed (nothing here moves a robot); do not add safety, hazard or standards wording.

## `docs/handoff/step-60-data.json`
One JSON object:
- `objectives`: 4 plain sentences starting with a verb.
- `keyTerms`: 5 to 7 terms the lesson explains (lower case unless a proper name). Do not reuse a term that is already a key in `assets/js/glossary-data.js` unless the meaning is the same.
- `glossary`: `{term: definition}` for each key term that is NOT already in `assets/js/glossary-data.js`. Two sentences each, starting with what the thing is.
- `keyPoints`: 4 plain statements.
- `quiz`: 3 questions in the format of `assets/js/quiz/ch4.js` (`{"lesson": "4-10", "question", "choices" (4), "answer" (index), "explanation"}`); each answer must be stated in the lesson.
- `claims`: one entry per citation in the page: `{"ref": N, "file": "CLI.rst", "claim": "the lesson sentence", "quote": "verbatim text from that source file, 6 to 40 words, on one line of the file where possible"}`. A script searches the file for every quote. A quote that is not found rejects the lesson.

Known mistakes from earlier tickets that will be rejected: invented references or URLs, a fact not in the sources, output that differs from the transcript, a quote that is paraphrased, a citation moved to the wrong sentence, added causal claims.

Finish with a summary of at most 10 lines: files changed, anything unresolved, any deviation. Do not paste file contents.
