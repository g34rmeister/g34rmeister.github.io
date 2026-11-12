# Lab transcript: send a navigation goal to Nav2
Run by Claude on 2026-11-11, Ubuntu 26.04.1 LTS, ROS 2 lyrical from RoboStack (robostack-lyrical, user space, no sudo), nav2_bringup 1.5.2.
Terminal 1 runs the launch command; everything else runs in terminal 2.

## Terminal 1
$ ros2 launch nav2_bringup tb3_loopback_simulation_launch.py use_rviz:=False
(selected log lines, timestamps removed)
[loopback_simulator]: 
[loopback_simulator]: Configuring
[lifecycle_manager_nav2]: Creating
[lifecycle_manager_nav2]: Creating and initializing lifecycle publishers
[lifecycle_manager_nav2]: Creating and initializing lifecycle service clients
[loopback_simulator]: Activating
[loopback_simulator]: Sim clock publisher started (resolution: 0.010s, speed: 1.00x)
[loopback_simulator]: Creating bond (loopback_simulator) to lifecycle manager.
[loopback_simulator]: Loopback simulator activated
[lifecycle_manager_nav2]: Creating and initializing lifecycle service servers
[lifecycle_manager_nav2]: Starting managed nodes bringup...
[lifecycle_manager_nav2]: Configuring map_server
[lifecycle_manager_nav2]: Configuring controller_server
[lifecycle_manager_nav2]: Configuring smoother_server
[loopback_simulator]: Map server returned empty/invalid map (0x0, res=0.000), will retry
[lifecycle_manager_nav2]: Configuring planner_server
[lifecycle_manager_nav2]: Configuring route_server
[lifecycle_manager_nav2]: Configuring behavior_server
[lifecycle_manager_nav2]: Configuring velocity_smoother
[lifecycle_manager_nav2]: Configuring collision_monitor
[lifecycle_manager_nav2]: Configuring bt_navigator
[loopback_simulator]: Map server returned empty/invalid map (0x0, res=0.000), will retry
[lifecycle_manager_nav2]: Configuring waypoint_follower
[lifecycle_manager_nav2]: Configuring docking_server
[lifecycle_manager_nav2]: Configuring following_server
[lifecycle_manager_nav2]: Activating map_server
[loopback_simulator]: Laser scan will be populated using map data
[lifecycle_manager_nav2]: Server map_server connected with bond.
[lifecycle_manager_nav2]: Activating controller_server
[lifecycle_manager_nav2]: Server controller_server connected with bond.
[lifecycle_manager_nav2]: Activating smoother_server
[lifecycle_manager_nav2]: Server smoother_server connected with bond.
[lifecycle_manager_nav2]: Activating planner_server

## Terminal 2: set the starting pose
$ ros2 topic pub --once /initialpose geometry_msgs/msg/PoseWithCovarianceStamped "{header: {frame_id: map}, pose: {pose: {position: {x: -2.0, y: -0.5}, orientation: {w: 1.0}}}}"
publisher: beginning loop
publishing #1: geometry_msgs.msg.PoseWithCovarianceStamped(header=std_msgs.msg.Header(stamp=builtin_interfaces.msg.Time(sec=0, nanosec=0), frame_id='map'), pose=geometry_msgs.msg.PoseWithCovariance(pose=geometry_msgs.msg.Pose(position=geometry_msgs.msg.Point(x=-2.0, y=-0.5, z=0.0), orientation=geometry_msgs.msg.Quaternion(x=0.0, y=0.0, z=0.0, w=1.0)), covariance=array([0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
       0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
       0., 0.])))


## Terminal 1 after the pose arrives (selected log lines)
[loopback_simulator]: Received initial pose!
[lifecycle_manager_nav2]: Managed nodes are active

## Terminal 2: check the servers
$ ros2 lifecycle get /planner_server
Node not found
$ ros2 lifecycle get /controller_server
active [3]
$ ros2 lifecycle get /bt_navigator
active [3]
$ ros2 action list
/assisted_teleop
/backup
/compute_and_track_route
/compute_path_through_poses
/compute_path_to_pose
/compute_route
/dock_robot
/drive_on_heading
/follow_gps_waypoints
/follow_object
/follow_path
/follow_waypoints
/navigate_through_poses
/navigate_to_pose
/smooth_path
/spin
/undock_robot
/wait
$ ros2 run tf2_ros tf2_echo map base_link   (stopped with Ctrl+C after the first reading)
At time 12.400043765
- Translation: [-2.000, -0.500, 0.010]
- Rotation: in Quaternion (xyzw) [0.000, 0.000, 0.000, 1.000]
- Rotation: in RPY (radian) [0.000, -0.000, 0.000]

## Terminal 2: send a goal
$ ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{pose: {header: {frame_id: map}, pose: {position: {x: 1.5, y: -0.5}, orientation: {w: 1.0}}}}" --feedback
(the goal echo and the first and last feedback messages; the full output is in goal.log)
Waiting for an action server to become available...
Sending goal:
     pose:
  header:
    stamp:
      sec: 0
      nanosec: 0
    frame_id: map
  pose:
    position:
      x: 1.5
      y: -0.5
      z: 0.0
    orientation:
      x: 0.0
      y: 0.0
      z: 0.0
      w: 1.0
behavior_tree: ''

Goal accepted with ID: 80243a0de4074849b72744d20669e5f7

Feedback:
    current_pose:
  header:
    stamp:
      sec: 20
      nanosec: 480072615
    frame_id: map
  pose:
    position:
      x: -2.0
      y: -0.5
      z: 0.01
    orientation:
      x: 0.0
      y: 0.0
      z: 0.0
      w: 1.0
navigation_time:
  sec: 0
  nanosec: 0
estimated_time_remaining:
  sec: 0
  nanosec: 0
number_of_recoveries: 0
distance_remaining: 0.0
position_tracking_error: 0.0
heading_tracking_error: 0.0

... (more feedback messages) ...
909 feedback messages in total
Feedback:
    current_pose:
  header:
    stamp:
      sec: 29
      nanosec: 550130706
    frame_id: map
  pose:
    position:
      x: 1.2786842814866448
      y: -0.5914692497653269
      z: 0.01
    orientation:
      x: 0.0
      y: 0.0
      z: 0.018585854331627693
      w: 0.9998272680912255
navigation_time:
  sec: 9
  nanosec: 80059349
estimated_time_remaining:
  sec: 1
  nanosec: 148031688
number_of_recoveries: 0
distance_remaining: 0.2664209008216858
position_tracking_error: 0.009302062913775444
heading_tracking_error: -0.012572391889989376

Result:
    error_code: 0
error_msg: ''

Goal finished with status: SUCCEEDED

$ ros2 run tf2_ros tf2_echo map base_link   (after the goal)
At time 31.77976
- Translation: [1.292, -0.591, 0.010]
- Rotation: in Quaternion (xyzw) [0.000, 0.000, 0.018, 1.000]
- Rotation: in RPY (radian) [0.000, -0.000, 0.036]

## Terminal 2: the same task from Python (lab/go_to_goal.py)
$ python3 go_to_goal.py
[INFO] [1794447005.585167577] [basic_navigator]: Nav2 is ready for use!
[INFO] [1794447005.585782045] [basic_navigator]: Navigating to goal: -2.0 -0.5...
 0 s: 3.33 m to go
 1 s: 3.20 m to go
 2 s: 2.95 m to go
 3 s: 2.70 m to go
 4 s: 2.65 m to go
 5 s: 2.60 m to go
 6 s: 2.32 m to go
 7 s: 1.85 m to go
 8 s: 1.42 m to go
 9 s: 0.92 m to go
10 s: 0.52 m to go
11 s: 0.25 m to go
12 s: 0.15 m to go
13 s: 0.15 m to go
14 s: 0.07 m to go
Goal succeeded!
$ ros2 run tf2_ros tf2_echo map base_link
At time 56.230141789
- Translation: [-1.961, -0.517, 0.010]
- Rotation: in Quaternion (xyzw) [0.000, 0.000, -0.110, -0.994]
- Rotation: in RPY (radian) [-0.000, -0.000, 0.221]

## Stop Nav2: Ctrl+C in terminal 1
Done. Remaining Nav2 processes: 0
