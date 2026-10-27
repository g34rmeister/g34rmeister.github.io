# Step 3 input: Chapter 2 partial refs

### 2-1:7
- Source: ABB Robotics, Operating manual: IRC5 with FlexPendant (RobotWare 6.08), Document ID 3HAC050941-001, Revision G, ABB AB, Västerås, Sweden, 2018. Copy hosted by Texas State University: bpb-us-e1.wpmucdn.com/wp.txstate.edu/dist/3/3147/files/2020/12/ABB-Robot-Operation-Manual.pdf .
- URLs: https://bpb-us-e1.wpmucdn.com/wp.txstate.edu/dist/3/3147/files/2020/12/ABB-Robot-Operation-Manual.pdf
- Reviewer note: The number 'four' not found in fetched text
- Cited for:
  - ABB FlexPendant: Used with ABB IRC5 controllers, the FlexPendant has a touch screen, dedicated hardware buttons (four of which the user can assign), and a joystick that is used to jog the manipulator.
  - Buttons toggle the joystick between motion modes such as axes 1–3, axes 4–6, linear, and reorient.
  - ABB describes its enabling device as a manually operated, constant-pressure push-button that must be pressed only halfway to switch the motors on.
  - and ABB's manual states that in manual reduced speed mode the movement is limited to 250 mm/s.
  - When jogging an industrial arm with a teach pendant, the operator selects a coordinate system and a motion mode. The ABB FlexPendant, for example, offers world, base, tool, and work object coordinate systems, plus axis-by-axis motion modes.

### 2-1:15
- Source: KUKA AG, “LBR iiwa” (sensitive lightweight robot), product page, Augsburg, Germany. kuka.com/en-ch/products/robotics-systems/industrial-robots/lbr-iiwa .
- URLs: https://www.kuka.com/en-ch/products/robotics-systems/industrial-robots/lbr-iiwa
- Reviewer note: Torque sensor wording not located
- Cited for:
  - Joint Torque Sensors: The KUKA LBR iiwa has joint torque sensors in all seven axes,
  - These sensors let the robot detect contact immediately and respond to forces applied by a person.

### 2-1:19
- Source: S. Mellish, “The Ins and Outs of MotoSim EG-VRC,” Yaskawa Motoman blog, 17 June 2020. motoman.com/About/Blog/The-Ins-and-Outs-of-MotoSim-EG-VRC .
- URLs: https://www.motoman.com/About/Blog/The-Ins-and-Outs-of-MotoSim-EG-VRC
- Reviewer note: (none)
- Cited for:
  - Collision detection: The simulation checks the moving robot against the cell. Yaskawa's MotoSim EG-VRC, for example, turns robots red to signal a potential interference so programmers can fix it before the program reaches the factory floor.

### 2-2:6
- Source: ABB Robotics, RobotWare data sheet, ROB0296EN, ABB, December 2014. library.e.abb.com/public/70ed3b221a577355c1257db000533446/ROB0296ENrobotware6.pdf .
- URLs: https://library.e.abb.com/public/70ed3b221a577355c1257db000533446/ROB0296ENrobotware6.pdf
- Reviewer note: Feature names not located in extracted text
- Cited for:
  - That production software is RobotWare, the controller software of ABB robots.
  - Two motion control features of ABB's RobotWare controller software shape how ABB robots move, and because the Virtual Controller is a copy of the real controller software, they are also present in simulation:
  - TrueMove: ABB states that TrueMove “ensures that the motion path followed by the robot is the same as the programmed path,” and describes the result as a speed-independent path that does not require tuning.
  - QuickMove: ABB describes QuickMove as a self-optimizing motion control feature that “keeps cycle times to a minimum by ensuring maximum acceleration at every moment.”

### 2-3:13
- Source: H. Mühe, A. Angerer, A. Hoffmann and W. Reif, “On reverse-engineering the KUKA Robot Language,” arXiv:1009.5004, 2010. Available: arxiv.org/abs/1009.5004 .
- URLs: https://arxiv.org/abs/1009.5004
- Reviewer note: 'Pascal' and 'C_DIS' not in the abstract text
- Cited for:
  - KUKA Robot Language (KRL) is the language of KUKA's robot controllers. Researchers who studied it describe it as an imperative programming language similar to Pascal, with predefined robot-specific structures such as AXIS and POS .
  - Motions can be blended (KUKA calls this approximate positioning) with parameters such as C_DIS .
  - The following table summarizes how the four vendor languages compare, using only details documented in this lesson's sources:

### 2-3:16
- Source: Jožef Stefan Institute, Department for Automatics, Biocybernetics and Robotics, “prof. dr. Bojan Nemec” (staff profile). Available: abr.ijs.si/people/bojan-nemec/ .
- URLs: https://abr.ijs.si/people/bojan-nemec/
- Reviewer note: 'since 1983' not found
- Cited for:
  - Nemec has been a researcher at the Jožef Stefan Institute in Ljubljana, Slovenia, since 1983.

### 2-4:5
- Source: MoveIt Documentation (Rolling), “Concepts” (pages: The move_group node; Motion Planning; Kinematics), PickNik Robotics and MoveIt contributors. Available: moveit.picknik.ai/main/doc/concepts/concepts.html ; see also Motion Planning and Kinematics .
- URLs: https://moveit.picknik.ai/main/doc/concepts/concepts.html https://moveit.picknik.ai/main/doc/concepts/motion_planning.html https://moveit.picknik.ai/main/doc/concepts/kinematics.html
- Reviewer note: (none)
- Cited for:
  - Algorithm Reuse: Large community libraries, such as MoveIt 2 for robot arms and Nav2 for mobile robots, are built as collections of plugins that can be configured for many different robots, so an improvement to the library can benefit every robot that uses it.
  - 3. Capabilities Reusable algorithm libraries Nav2 (mobile robot navigation), MoveIt 2 (arm kinematics and motion planning), and slam_toolbox (mapping).
  - MoveIt 2: MoveIt 2 is the main motion planning framework for robot arms in ROS 2.
  - It keeps a planning scene, a model of the world and the robot's current state. It uses FCL (the Flexible Collision Library) as its primary collision checker, a KDL numerical solver as its default inverse kinematics plugin, and OMPL (the Open Motion Planning Library) for its default planners, with the Pilz industrial motion planner and CHOMP also available.
  - Instead of coding every joint waypoint by hand, a programmer can ask MoveIt to move the tool to a target pose without hitting the table, and MoveIt plans a collision-free joint trajectory.

### 2-4:8
- Source: K. Scott for the ROS 2 Release Team, “ROS 2 Lyrical Luth Released!,” Open Robotics Discourse, 22 May 2026. Available: discourse.openrobotics.org .
- URLs: https://discourse.openrobotics.org/t/ros-2-lyrical-luth-released/55021
- Reviewer note: Support dates corroborated by distributions table in 3-2
- Cited for:
  - Developers today share the same visualization tool (RViz2), data recording tool ( ros2 bag , part of rosbag2), and Gazebo simulator across robot brands.
  - In this curriculum, our target release is ROS 2 Lyrical Luth , the twelfth ROS 2 release, announced on 22 May 2026. It is an LTS release supported until May 2031, with Ubuntu 26.04 as its Tier 1 Linux platform.
  - Its release notes highlight a new events-based executor for C++ nodes, an AsyncNode that lets Python nodes use asyncio , zero-copy buffer support for moving large data to GPUs, and rosbag2 and command-line improvements.
  - 2. Tools Visualization, inspection, debugging, and data logging rviz2 (3D visualization) and ros2 bag (recording and playback), plus launch and command-line introspection tools.

### 2-8:12
- Source: ABB Robotics Tech Community, “Using vision to modify object frame of work object,” forum thread (search summary; page not opened). tech-community.robotics.abb.com/t/using-vision-to-modify-modify-object-frame-of-work-object/9308 .
- URLs: https://tech-community.robotics.abb.com/t/using-vision-to-modify-modify-object-frame-of-work-object/9308
- Reviewer note: Supports modifying oframe from camera data; 'teach only the user frame' is in [11], not here. Together [11]+[14] cover the sentence; no text change needed.
- Cited for:
  - Forum advice adds that the grid should sit at the same height as the features the camera will measure.
  - ABB: a work object has a user frame and an object frame. With Integrated Vision you teach only the user frame, and the program copies the pose found by the camera into the object frame at run time. Targets taught in that work object then follow the part.
