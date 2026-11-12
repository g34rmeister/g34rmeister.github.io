# Handoff, 2026-11-11 (Fable session to Opus)

Branch `writing-polish-3`, **nothing committed** (about 135 changed or new files; most are regenerated `?v=` hashes). Gerald has not asked for a commit or PR yet. Read the last two entries of `CHANGELOG.agents.md` first; they describe everything below in detail.

## Finished and checked (all six checks pass; browser tests not run, Playwright is not installed here)
1. Writing polish: 200 glossary definitions, 8 summary lines, 2 page fixes (changelog entry "Writing polish").
2. Soundness work (changelog entry "Course soundness"): open-source track on `robotics-oss.html#oss-track` and the hub; reading-order notes on 4.1, 3.5, 10.4, 1.4; new lesson **4.10** (lab run twice, sources checked and imported); "classes and callbacks" subsection in 4.4.

## DONE since this note was written (Opus, same day): lesson 10.5 published, see the changelog entry "Chapter 10 lab". The notes below are kept for the record.

## Nav2 lab for Chapter 10 (item 3, Gerald approved, he allowed micromamba)
Nothing for this is on any page yet. No lesson has been scaffolded.

**Environment (works):** ROS 2 Lyrical + Nav2 1.5.2 from RoboStack, no sudo, 9.8 GB in `~/.local/share/robosstics-lab` (delete the folder to remove). Run anything with `research_notes/nav2-lab/ros-env.sh <command>` (sets `ROS_DOMAIN_ID=77`, localhost only).

**What was run and what happened** (logs in `research_notes/nav2-lab/run1/`):
- `ros2 launch nav2_bringup tb3_loopback_simulation_launch.py use_rviz:=False` starts Nav2 with the loopback simulator, no display, no Gazebo. Note: the package README writes the file name as `tb3_loopback_simulation.launch.py`; the installed file is `tb3_loopback_simulation_launch.py`.
- Nav2 waits for an initial pose. If none arrives within about 60 s, bringup aborts ("Failed to activate global_costmap because transform from base_link to map did not become available", then "Aborting bringup"); `launch-late-pose-tail.log`. Publish the pose soon after launch:
  `ros2 topic pub --once /initialpose geometry_msgs/msg/PoseWithCovarianceStamped "{header: {frame_id: map}, pose: {pose: {position: {x: -2.0, y: -0.5}, orientation: {w: 1.0}}}}"`
  Then the log shows "Managed nodes are active" and `ros2 lifecycle get /planner_server` prints `active [3]` (it printed `inactive [2]` after the aborted bringup).
- Do NOT start at (0, 0): on the `tb3_sandbox` map that spot is blocked. A goal from there either "succeeded" with no motion or failed with planner error 208.
- From (-2.0, -0.5), this goal succeeded in about 9 s of navigation time with 898 feedback messages (distance_remaining 2.89 down to 0.27):
  `ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{pose: {header: {frame_id: map}, pose: {position: {x: 1.5, y: -0.5}, orientation: {w: 1.0}}}}" --feedback`
  Final transform map to base_link: (1.290, -0.588). That is 0.23 m from the goal; the lesson must explain this with the goal tolerance from `nav2_params.yaml` (not yet read; check the value before writing it).
- `ros2 action list` showed 18 actions including `/navigate_to_pose`, `/compute_path_to_pose`, `/follow_path`, `/spin`, `/backup`.

**Still to do for the lab**
1. Re-run the whole sequence once from a clean start and save a clean transcript (the saved logs come from an exploratory run). Stop Nav2 with Ctrl+C or `kill -INT <launch pid>`. Never use `pkill -f` or `pgrep -f` with a pattern that also appears in your own command line: it killed the shell twice. Use the bracket form, for example `pgrep -f "[e]nvs/nav2/"`.
2. Optional second part: a Python script with `nav2_simple_commander` (`BasicNavigator`, `goToPose`, feedback loop), based on `sources/..._example_nav_to_pose.py`. Run it before writing it up.
3. Scaffold: `python3 scripts/new_lesson.py 10 "Lab: Send a Navigation Goal to Nav2" "<summary>"` (becomes 10-5).
4. Draft with Gemini, closed world, same ticket pattern as `docs/handoff/step-60.md` (sources in `research_notes/nav2-lab/sources/`, plus the transcript). Install instructions for learners: the lesson should say what was run here (RoboStack, user space) and point to 4.3 for the apt install; do not claim the apt route was tested.
5. Review the draft the way 4.10 was reviewed (the "Course soundness" changelog entry lists Gemini's mistake types), then: data into `course-data.js`, glossary, quiz `ch10.js`, bump `version` (now `2026-11e`), add 10-5 to Nav2 in `ossProjects`, `sources.py import`, `renumber_refs.py`, sync, all checks.
6. Remove the "This chapter has no lab yet" paragraph in `robotics-10-4.html` (line near 253) and update the chapter page, the open-source track step 5, `CLAUDE.md` ("Ch10 ... no lab yet", 10-1..10-4) and the changelog.

## Also open
- A second Chapter 4 lesson (build a real ROS 2 package from source) is now possible with the same environment; not started, ask Gerald whether he still wants it.
- For Gerald: `index.html` "CSC 3380 · date TBD"; "human in the loop" vs "human-in-the-loop" glossary entries disagree; long tooltips unchecked in a browser; the seven new docs.ros.org links in 4.10 could not be opened (bot wall), worth a click each.
- Rule Gerald set this session (saved to memory): rewrite tickets give a minimum length only, never a maximum, and iterate for depth.
- One-off scripts from the glossary rounds are in `research_notes/glossary-polish/` (they import `scripts/plain_language.py`).
