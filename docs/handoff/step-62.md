# Step 62: draft lesson 10.5 "Lab: Send a Navigation Goal to Nav2" (closed world)

Branch: `writing-polish-3`. Read `CLAUDE.md` first. You cannot run shell commands. Do not browse the web. Do NOT commit. You may edit ONLY `robotics-10-5.html` (between `<article class="robotics-article-body">` and `</article>`; leave everything outside the article and every generated block such as the oss-note comment markers untouched) and write ONLY one new file, `docs/handoff/step-62-data.json`.

## Why this lesson exists
Chapter 10 (10.1 to 10.4) explains Nav2's frames, costmaps, servers, behavior trees, actions and lifecycle nodes, but the reader never runs Nav2. Lesson 10.4 even says the chapter has no lab yet. This lab is the first time the reader sees those parts work. Readers are newcomers who have done 4.3 and 4.4 (installing ROS 2, Turtlesim) and read 10.1 to 10.4. Many will read it on a laptop without a robot.

## Closed world: your only sources
Everything is in `research_notes/nav2-lab/`:
- `lab-notes.md`: facts Claude checked during the runs. Read this first and follow its instructions about what may and may not be claimed.
- `install-transcript.md`, `run3/transcript.md` (main lab run), `lab/go_to_goal.py`: copy commands, code and output from these files character for character. Never invent, tidy or shorten output except by cutting whole lines and marking the cut with `...`. You may show output from `run2/transcript.md` only where `lab-notes.md` says so.
- `sources/`: reference texts. Each fact about Nav2, ROS 2 or RoboStack that is not about this lab's own run needs a citation to one of these.

| File | Reference to print |
|---|---|
| `nav2_loopback_sim_README.md` | Nav2 developers, &ldquo;Nav2 Loopback Simulation,&rdquo; nav2_loopback_sim README, ros-navigation/navigation2 repository, lyrical branch. https://github.com/ros-navigation/navigation2/blob/lyrical/nav2_loopback_sim/README.md |
| `nav2_bringup_launch_tb3_loopback_simulation_launch.py` | Nav2 developers, tb3_loopback_simulation_launch.py, nav2_bringup package, ros-navigation/navigation2 repository, lyrical branch. https://github.com/ros-navigation/navigation2/blob/lyrical/nav2_bringup/launch/tb3_loopback_simulation_launch.py |
| `nav2_bringup_params_nav2_params.yaml` | Nav2 developers, nav2_params.yaml, nav2_bringup package, ros-navigation/navigation2 repository, lyrical branch. https://github.com/ros-navigation/navigation2/blob/lyrical/nav2_bringup/params/nav2_params.yaml |
| `nav2_bringup_README.md` | Nav2 developers, nav2_bringup README, same repository and branch. https://github.com/ros-navigation/navigation2/blob/lyrical/nav2_bringup/README.md |
| `nav2_simple_commander_README.md` | Nav2 developers, nav2_simple_commander README, same repository and branch. https://github.com/ros-navigation/navigation2/blob/lyrical/nav2_simple_commander/README.md |
| `nav2_simple_commander_nav2_simple_commander_example_nav_to_pose.py` | Nav2 developers, example_nav_to_pose.py, nav2_simple_commander package, same repository and branch. https://github.com/ros-navigation/navigation2/blob/lyrical/nav2_simple_commander/nav2_simple_commander/example_nav_to_pose.py |
| `nav2_simple_commander_robot_navigator.py` | Nav2 developers, robot_navigator.py, nav2_simple_commander package, same repository and branch. https://github.com/ros-navigation/navigation2/blob/lyrical/nav2_simple_commander/nav2_simple_commander/robot_navigator.py |
| `docs_configuring_loopback_sim.md` | Nav2 documentation, the page title as written in the file. https://github.com/ros-navigation/docs.nav2.org/blob/rolling/docs/configuration_and_development/configuration_guide/others/configuring_loopback_sim.md |
| `robostack_micromamba.mdx` | RoboStack, &ldquo;Install RoboStack packages with micromamba.&rdquo; https://robostack.github.io/micromamba.html |
| `robostack_GettingStarted.mdx` | RoboStack, the page title as written in the file. https://robostack.github.io/GettingStarted.html |
| `mamba_micromamba-installation.txt` | mamba developers, &ldquo;Micromamba Installation,&rdquo; mamba documentation. https://mamba.readthedocs.io/en/latest/installation/micromamba-installation.html |

Cite only what you use. Anything no file supports: leave it out, or put `<!-- TODO-VERIFY: ... -->` in the HTML. No numbers, versions, names or URLs from memory.

## Format
Copy the markup patterns of `robotics-4-10.html` exactly (it is a reviewed lab lesson): section headings, paragraphs, lists, `<pre class="article-code"><code>` blocks, the "Try it" callout, the "Check your understanding" list with its show-answer markup, the References list, and citations `<sup><a href="#ref-N">[N]</a></sup>` numbered by first use. Also look at `robotics-10-4.html` for how this chapter links its lessons. Replace every TODO placeholder in the article. One `<h1>` only (outside the article). Escape `<`, `>` and `&` in code. Long single-line output (the `/initialpose` echo) may be cut to its first line plus `...`.

## Content (sections in this order)
1. **Why this lab.** Plain words: 10.1 to 10.4 named the parts; now you run them. Link 10.1 to 10.4 by their page names.
2. **What you need and how to install it.** Linux on x86-64 (that is what was run), several gigabytes of free disk space, no sudo. What RoboStack is, in one or two sentences, cited. Why a user-space install (works without admin rights, does not touch a system ROS install), only as far as the sources say. RoboStack's two cautions from its micromamba page, briefly. The commands from `install-transcript.md`. Say plainly what was tested and what was not (`lab-notes.md`). Point to 4.3 (`robotics-4-3.html`) for the apt route.
3. **What the loopback simulator is.** From its README: what it replaces, what it provides (the transforms and odometry), what it does not provide, why it suits a first run. Tie the transforms to the map, odom and base_link frames from 10.1.
4. **Start Nav2.** Two terminals. The launch command and why `use_rviz:=False` (from `lab-notes.md`). Selected launch lines from the transcript, and what they show: the lifecycle manager configuring then activating servers, which is 10.4's lifecycle in action. Then the pause at "Activating planner_server".
5. **Tell Nav2 where the robot is.** The `/initialpose` command. Why it is needed and what happens if it is late (`lab-notes.md`, with the exact log lines from `run1/launch-late-pose-tail.txt`). Why the lab starts at (-2.0, -0.5), not (0, 0). The "Managed nodes are active" line.
6. **Look before you drive.** `ros2 lifecycle get`, `ros2 action list` (show the list), `tf2_echo map base_link`. Connect each to 10.3 and 10.4. The Node not found advice.
7. **Send a goal from the command line.** The command and its output (goal echo, the first feedback message, the cut, the last feedback message, the result). Explain the feedback fields in one list. The `tf2_echo` reading afterwards, the 0.23 m gap, and the 0.25 m goal tolerance (cite the params file).
8. **The same task from Python.** `go_to_goal.py` verbatim, then its output verbatim. Explain the script top to bottom in plain words, especially the `localizer='robot_localization'` line (`lab-notes.md`, cite robot_navigator.py). Compare with Nav2's own example (cite it): it sets an initial pose and handles cancellation and preemption, which this short script leaves out.
9. **Stop Nav2.** Ctrl+C and `ros2 daemon stop`.
10. **From here to a contribution.** Two or three short paragraphs: this lab used nothing but Nav2's own packages and documentation, so a step that does not match what the reader sees (for example the launch file name in the loopback README) is the kind of documentation issue 3.5 (`robotics-3-5.html`) and 4.10 (`robotics-4-10.html`) show how to report. Do not claim the mismatch has or has not been reported. Link the Open-Source Map entry `robotics-oss-map.html#nav2`.
11. **Try it** box, 4 tasks, each runnable with the same setup and checkable by the reader (for example: send a goal to another free spot and compare the end position with the 0.25 m tolerance; publish the initial pose late on purpose and watch the abort; change the script to print estimated_time_remaining; list the actions again and pick one from 10.3 to read about). Do not give expected outputs you do not have.
12. **Check your understanding** (4 questions with answers) and **References**.

Writing rules: at least 1,500 words of prose, no maximum. Short sentences, everyday words, full sentences with articles. Explain each term on first use (user space, channel, environment, initial pose, goal tolerance, feedback message). No em dashes, no semicolons in prose, American spelling, no praise words. The robot is simulated and nothing here moves hardware: do not add safety, hazard or standards wording.

## `docs/handoff/step-62-data.json`
One JSON object:
- `objectives`: 4 plain sentences starting with a verb.
- `keyTerms`: 5 to 7 terms the lesson explains. Check `assets/js/glossary-data.js`: reuse a term only if its existing definition fits; list new ones under `glossary`.
- `glossary`: `{term: definition}` for each new key term, two sentences, starting with what the thing is.
- `keyPoints`: 4 plain statements.
- `quiz`: 3 questions in the format of `assets/js/quiz/ch10.js` (`"lesson": "10-5"`), each answer stated in the lesson.
- `claims`: one entry per citation: `{"ref": N, "file": "<file in sources/>", "claim": "the lesson sentence", "quote": "verbatim text from that file, 6 to 40 words"}`. A script searches the file for every quote.

Known mistakes from earlier tickets that will be rejected: leaving out a file or command a reader needs to repeat the lab, inventing a version number or output, uncited facts next to cited ones, copying source wording instead of explaining it, a quote that is paraphrased, a citation on the wrong sentence, added causal claims.

Finish with a summary of at most 10 lines: files changed, anything unresolved, any deviation. Do not paste file contents.
