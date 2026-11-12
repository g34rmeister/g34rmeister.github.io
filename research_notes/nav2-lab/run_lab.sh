#!/bin/bash
# Clean run of the Chapter 10 lab. Writes run2/ next to this script.
H=$(cd "$(dirname "$0")" && pwd); R=$H/ros-env.sh; O=$H/${RUN_DIR:-run2}; rm -rf $O; mkdir -p $O
T=$O/transcript.md
say(){ echo "$@" >> $T; }
say '# Lab transcript: send a navigation goal to Nav2'
say "Run by Claude on $(date -I), $(lsb_release -ds), ROS 2 $($R bash -c 'echo $ROS_DISTRO') from RoboStack (robostack-lyrical, user space, no sudo), nav2_bringup $($R bash -c 'grep -o "<version>[^<]*" $(ros2 pkg prefix nav2_bringup)/share/nav2_bringup/package.xml | cut -c10-')."
say 'Terminal 1 runs the launch command; everything else runs in terminal 2.'
say ''
say '## Terminal 1'
say '$ ros2 launch nav2_bringup tb3_loopback_simulation_launch.py use_rviz:=False'
setsid $R ros2 launch nav2_bringup tb3_loopback_simulation_launch.py use_rviz:=False > $O/launch.log 2>&1 &
LP=$!
timeout 60 bash -c "until grep -q 'Activating planner_server' $O/launch.log; do sleep 1; done"
say '(selected log lines, timestamps removed)'
grep -o '\[lifecycle_manager_nav2\]: .*\|\[loopback_simulator\]: .*' $O/launch.log | sed 's/\x1b\[[0-9;]*m//g' | head -40 >> $T
say ''
say '## Terminal 2: set the starting pose'
CMD='ros2 topic pub --once /initialpose geometry_msgs/msg/PoseWithCovarianceStamped "{header: {frame_id: map}, pose: {pose: {position: {x: -2.0, y: -0.5}, orientation: {w: 1.0}}}}"'
say "\$ $CMD"; $R bash -c "$CMD" >> $T 2>&1
timeout 90 bash -c "until grep -q 'Managed nodes are active' $O/launch.log; do sleep 1; done"
say ''
say '## Terminal 1 after the pose arrives (selected log lines)'
grep -o '\[loopback_simulator\]: Received initial pose!\|\[lifecycle_manager_nav2\]: .*Managed nodes are active.*' $O/launch.log | sed 's/\x1b\[[0-9;]*m//g' >> $T
say ''
say '## Terminal 2: check the servers'
for n in planner_server controller_server bt_navigator; do say "\$ ros2 lifecycle get /$n"; $R ros2 lifecycle get /$n >> $T 2>&1; done
say '$ ros2 action list'; $R ros2 action list >> $T 2>&1
say '$ ros2 run tf2_ros tf2_echo map base_link   (stopped with Ctrl+C after the first reading)'
timeout 8 $R ros2 run tf2_ros tf2_echo map base_link 2>&1 | grep -v "Waiting for transform" | head -4 >> $T
say ''
say '## Terminal 2: send a goal'
CMD='ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{pose: {header: {frame_id: map}, pose: {position: {x: 1.5, y: -0.5}, orientation: {w: 1.0}}}}" --feedback'
say "\$ $CMD"
timeout 150 $R bash -c "$CMD" > $O/goal.log 2>&1
say '(the goal echo and the first and last feedback messages; the full output is in goal.log)'
awk '/^Feedback:/{n++} n<2' $O/goal.log >> $T
say '... (more feedback messages) ...'
awk '/^Feedback:/{n++} END{print n" feedback messages in total"}' $O/goal.log >> $T
tac $O/goal.log | sed -n '1,/^Feedback:/p' | tac >> $T
say ''
say '$ ros2 run tf2_ros tf2_echo map base_link   (after the goal)'
timeout 8 $R ros2 run tf2_ros tf2_echo map base_link 2>&1 | grep -v "Waiting for transform" | head -4 >> $T
say ''
say '## Terminal 2: the same task from Python (lab/go_to_goal.py)'
say '$ python3 go_to_goal.py'
timeout 150 $R python3 $H/lab/go_to_goal.py >> $T 2>&1
say '$ ros2 run tf2_ros tf2_echo map base_link'
timeout 8 $R ros2 run tf2_ros tf2_echo map base_link 2>&1 | grep -v "Waiting for transform" | head -4 >> $T
say ''
say '## Stop Nav2: Ctrl+C in terminal 1'
kill -INT -$LP 2>/dev/null; sleep 10; kill -9 -$LP 2>/dev/null; sleep 1; pgrep -u $USER -f '[e]nvs/nav2/lib' | xargs -r kill -9
say "Done. Remaining Nav2 processes: $(pgrep -u $USER -fc '[e]nvs/nav2/')"
research_notes/nav2-lab/ros-env.sh ros2 daemon stop
