# Step 24: facts for the "How to OSS" chapter and the OSS map page

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` ("Direction") and `docs/handoff/robosstics-plan.md` items 1 and 3 first.

Claude has saved the pages listed in `docs/handoff/oss-map-sources.md` (URL | lessons | publisher | characters | cached file `osscache/<name>.txt` inside the cache folder given in your prompt). Each cached file starts with a `SOURCE URL:` line.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read and file write tools. Do not browse the web.
- READ THE CACHED FILE, not the live page. Use only facts stated in those files.
- Touch ONLY the output file of your task. Do NOT create pages. Do NOT commit.
- Evidence words must appear in the file exactly (spelling, capitals, punctuation). Claude's checker searches the same file.
- The fact sentence must say only what the file says. One fact per line. Never repeat a fact.

## Tasks (run in parallel)
- T-24a: facts for the new chapter "How to Contribute to Open Source" → write ONLY `research_notes/oss-map/step-24a.md`. Use the Open Source Guides, First Timers Only, ROS 2 contributing and developer guide, Nav2, MoveIt, ros2_control and Gazebo files. Cover: what open source and a contribution are; kinds of contributions that are not code (docs, issues, reviews, answering questions); how to find a first issue (labels the projects actually name); how to read a project before contributing (README, CONTRIBUTING, code of conduct, license); the pull request flow as these projects describe it (fork, branch, PR, review, approvals, sign-off/DCO if stated); communication norms; how robotics projects differ (ROS 2 distributions, branches per distribution, REPs or governance if stated, build farm if stated). 30 to 45 facts, line format:
  `oss | <fact> | <URL from the SOURCE URL line> | <3 to 5 words or numbers copied exactly, separated by ", ">`
- T-24b: one block per project for the OSS map page → write ONLY `research_notes/oss-map/step-24b.md`. Projects: ROS 2, MoveIt 2, Nav2, ros2_control, Gazebo, OpenCV, PCL, Universal Robots Client Library, Universal Robots ROS 2 driver, Wireshark. For each: what it is (one fact), its license (only if a file states it), where the code lives, how to start contributing (the page or label it names), and one governance or process fact if stated. Same line format, but start each line with the project name instead of `oss`. Write "NOT FOUND" lines for anything the files do not state, rather than guessing.

Finish with a summary of at most 3 lines: facts written, projects or topics with gaps.
