# Step 39: Cross-Lesson Consistency of Terms (Chapters 1–5)

### behavior tree: DRIFT
- 3-5: "Nav2 coordinates these planning, control, and recovery steps through behavior trees.<sup><a href=\"#ref-7\">[7]</a></sup>"
- 6-7: "To achieve modular autonomy, many robotics frameworks use <strong>Behavior Trees (BTs)</strong>."
- Problem: Lesson 3.5 registers the key term in lowercase as `behavior tree` while lesson 6.7 registers `Behavior Tree` in Title Case, resulting in duplicate entries with divergent definitions in `assets/js/glossary-data.js`.
- Suggested fix: Standardize the key term across lesson 3.5, lesson 6.7, and `assets/js/course-data.js` to `Behavior Tree` and consolidate the glossary entry.

### lifecycle node: DRIFT
- 4-2: "ROS 2 introduced <strong>managed nodes</strong>, also called lifecycle nodes, implemented in C++ by the <code>rclcpp_lifecycle</code> package.<sup><a href=\"#ref-16\">[16]</a></sup>"
- 6-7: "ROS 2 addresses this with <strong>managed (lifecycle) nodes</strong>.<sup><a href=\"#ref-15\">[15]</a></sup> Every server in the Nav2 navigation stack is a lifecycle node.<sup><a href=\"#ref-16\">[16]</a></sup>"
- Problem: Lesson 4.2 registers the key term as `lifecycle node` while lesson 6.7 registers `ROS 2 lifecycle node`, causing two duplicate entries in `assets/js/glossary-data.js` for the same managed node state machine.
- Suggested fix: In lesson 6.7 and `assets/js/course-data.js`, standardize the key term to `lifecycle node` to match lesson 4.2 and remove the duplicate glossary entry.

### Quality of Service: GLOSSARY
- 4-2: "ROS 2 solves this by introducing <strong>Quality of Service (QoS)</strong> policies, which let a connection be &ldquo;as reliable as TCP or as best-effort as UDP.&rdquo;"
- 8-5: "MQTT defines three qualities of service for message delivery consisting of At most once, At least once, and Exactly once.<sup><a href=\"#ref-4\">[4]</a></sup>"
- Problem: In `assets/js/glossary-data.js`, `Quality of Service` is defined strictly as MQTT delivery guarantees (QoS 0, 1, 2) from lesson 8.5, conflicting with lesson 4.2 where Quality of Service is introduced as the core communication policy for DDS in ROS 2.
- Suggested fix: In lesson 8.5 and `assets/js/course-data.js`, rename the key term to `MQTT Quality of Service`, and update `Quality of Service` in `assets/js/glossary-data.js` to define the concept generally across DDS and MQTT.

Checked terms: behavior tree, blending (zone), cobot, collaborative application, DDS, degree of freedom, Developer Certificate of Origin, draft pull request, emergency stop, enabling device, end effector, factory acceptance test (FAT), forward kinematics, foundation model, Gazebo, industrial robot, inverse kinematics, launch file, lifecycle node, light curtain, linear interpolation (MoveL), lockout/tagout, mock hardware, MoveIt 2, Nav2, parameter, payload, planning scene, pose_trans, predictive maintenance, Quality of Service, rclpy, remapping, robot density, ROS, ROS driver, ros2_control, rosdep, ROS-Industrial, safety configuration, safety planes, SCARA, singularity, state machine, tf2, tool center point (TCP), URSim, work object (user frame), workspace (work envelope)
