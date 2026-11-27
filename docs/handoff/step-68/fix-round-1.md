# Step 68 fix round 1 (Claude review)

Same Shared rules as docs/handoff/step-68.md. Edit ONLY the one file named in your task. File read/write only, no shell.

## F-68b launch-tree.js (robotics-4-7.html) — rework
Rejected because it merges two different launch files from the lesson:
- `turtlesim_mimic_launch.py` (lesson lines ~260-331): fixed namespaces turtlesim1/turtlesim2, the arguments/ros_arguments log levels, mimic remaps. It declares NO launch arguments.
- `example_substitutions_launch.py` included from `example_main_launch.py` (lines ~406-455): declares turtlesim_ns (default turtlesim1), background_r (XML default 0), use_provided_red, new_background_r; the main file passes turtlesim_ns:=turtlesim2, use_provided_red:=True, new_background_r:=200.
Fix:
1. Panel 1 "turtlesim_mimic_launch.py": keep the current tree, but static (no argument buttons change it). Keep the caption "Unique namespaces avoid name conflicts." You may add one toggle "Same namespace for both simulators" that shows the two nodes colliding, labelled as a what-if, citing the lesson sentence about unique namespaces.
2. Panel 2 "example_substitutions_launch.py": a small diagram of that file's one turtlesim node whose namespace and background_r come from its arguments. Buttons: "defaults" (turtlesim_ns=turtlesim1, background_r=0), "background_r:=255" (the lesson's command-line example), "included from example_main_launch.py" (turtlesim_ns=turtlesim2, use_provided_red=True, new_background_r=200). Show only what the lesson says each argument does; if the lesson does not say what use_provided_red does to the colour, do not claim it.
3. Keep the parameter-lifetime panel as is (it is correct).
4. Update `// Facts used:` line numbers. Readout states the resulting node name(s) for the active panel.

## F-68e troubleshoot-steps.js (robotics-9-2.html) — one label
The SVG card at step 4 reads "Joint 3 shows an unexpected high-acceleration moves while carrying a new workpiece" (garbled). Use the lesson's wording: "joint 3 shows an unexpected torque spike during high-acceleration moves while carrying a new workpiece", wrapped over lines that fit the card. Change nothing else.

End: "Finish with a summary of at most 10 lines: files changed, anything unresolved, any deviation. Do not paste file contents."
