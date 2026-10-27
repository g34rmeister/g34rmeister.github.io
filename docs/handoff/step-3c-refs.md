# Step 3 input: Chapter 3 partial refs

### 3-1:10
- Source: Open Robotics, “Understanding nodes,” ROS 2 Documentation: Lyrical Luth , 2026. Available: docs.ros.org/en/lyrical/ROS-Framework/nodes/Working-with-nodes/Understanding-ROS2-Nodes/Understanding-ROS2-Nodes.html .
- URLs: https://docs.ros.org/en/lyrical/ROS-Framework/nodes/Working-with-nodes/Understanding-ROS2-Nodes/Understanding-ROS2-Nodes.html
- Reviewer note: (none)
- Cited for:
  - The basic participant in this graph is the node : a unit of computation that should do one logical thing.

### 3-1:12
- Source: Open Robotics, “Understanding topics,” ROS 2 Documentation: Lyrical Luth , 2026. Available: docs.ros.org/en/lyrical/ROS-Framework/interfaces/topics/Understanding-ROS2-Topics/Understanding-ROS2-Topics.html .
- URLs: https://docs.ros.org/en/lyrical/ROS-Framework/interfaces/topics/Understanding-ROS2-Topics/Understanding-ROS2-Topics.html
- Reviewer note: (none)
- Cited for:
  - In ROS, what is a topic? A topic is a named channel that nodes publish messages to and subscribe to; any number of other nodes can subscribe to the information a node publishes.
  - The diagram below illustrates how three decoupled nodes communicate across two named topics to guide an autonomous robot. Publishing and subscribing to named topics is exactly the mechanism described in the ROS documentation; the node names are our own example.

### 3-1:28
- Source: Object Management Group, DDS Interoperability Wire Protocol (DDSI-RTPS) , Version 2.5, OMG document formal/22-04-01, April 2022. www.omg.org/spec/DDSI-RTPS/ .
- URLs: https://www.omg.org/spec/DDSI-RTPS/
- Reviewer note: Values match the DDSI-RTPS default port mapping from background knowledge; not shown in fetched text
- Cited for:
  - The ports follow the port mapping of the DDS wire protocol (RTPS), with a port base of 7400, a domain gain of 250 and a participant gain of 2:

### 3-2:5
- Source: Open Robotics, “Different ROS 2 middleware vendors,” ROS 2 Documentation: Lyrical Luth , 2026. Available: docs.ros.org/en/lyrical/ROS-Framework/client-libraries/About-Different-Middleware-Vendors.html .
- URLs: https://docs.ros.org/en/lyrical/ROS-Framework/client-libraries/About-Different-Middleware-Vendors.html
- Reviewer note: OMG/RTPS wording not in the text obtained
- Cited for:
  - Instead, it is built on the Data Distribution Service (DDS) , an industry standard created by the Object Management Group (OMG) and implemented by several vendors.
  - DDS implementations talk to each other with the RTPS wire protocol.
  - The main RMW implementations for Lyrical Luth are:
  - rmw_fastrtps_cpp: Built on eProsima Fast DDS (Apache 2 license). It is the default RMW in Lyrical Luth, is packaged with the binary releases, and has Tier 1 support.
  - rmw_cyclonedds_cpp: Built on Eclipse Cyclone DDS (Eclipse Public License 2.0). It is fully supported, packaged with the binary releases, and Tier 1 in Lyrical.
  - rmw_connextdds: Built on RTI Connext DDS, which uses a commercial or research license. Support is included in the ROS binaries, but Connext itself is installed separately. In Lyrical it is Tier 1 on all architectures except arm64.
  - The documentation describes Zenoh as a more lightweight alternative to DDS whose low wire overhead and flexible routing suit challenging network conditions; a Zenoh router is used to help nodes find each other.

### 3-2:6
- Source: Object Management Group, DDS Interoperability Wire Protocol (DDSI-RTPS) , Version 2.5, OMG document formal/22-04-01, April 2022. www.omg.org/spec/DDSI-RTPS/ .
- URLs: https://www.omg.org/spec/DDSI-RTPS/
- Reviewer note: (none)
- Cited for:
  - DDS implementations talk to each other with the RTPS wire protocol.

### 3-2:16
- Source: Open Robotics, “Managing node lifecycles,” ROS 2 Documentation: Lyrical Luth , 2026. Available: docs.ros.org/en/lyrical/ROS-Framework/nodes/Working-with-nodes/Managed-Nodes.html .
- URLs: https://docs.ros.org/en/lyrical/ROS-Framework/nodes/Working-with-nodes/Managed-Nodes.html
- Reviewer note: (none)
- Cited for:
  - An ordinary node starts working as soon as it is created. In a complex cell, that can cause startup races: a planner may begin sending commands before a motor driver is ready. Hardware drivers for cameras, lidars and motors in particular need to be started, configured and shut down in a controlled order.
  - ROS 2 introduced managed nodes , also called lifecycle nodes, implemented in C++ by the rclcpp_lifecycle package.
  - A supervisor can therefore bring every sensor driver to Inactive first and only activate the cell once each driver reports that its hardware is ready, so hardware is only used when it is ready and is released safely on shutdown.

### 3-5:5
- Source: Open Robotics, “Feature Comparison” (Gazebo Classic vs. Gazebo Sim), Gazebo Jetty Documentation . Available: gazebosim.org/docs/latest/comparison/ .
- URLs: https://gazebosim.org/docs/latest/comparison/
- Reviewer note: Not checked line by line
- Cited for:
  - Gazebo: A robot simulator with physics engines and simulated sensors such as cameras, lidars and IMUs.
  - What is the difference between RViz and Gazebo? RViz displays data already flowing through ROS; Gazebo simulates the robot and its world with physics.
  - While RViz2 visualizes data, Gazebo creates the virtual world the robot lives in.
  - Gazebo is an open-source robot simulator. Current Gazebo (Gazebo Sim) ships physics engine plugins for DART and Bullet, plus its own simple TPE engine; the ODE and Simbody engines used by Gazebo Classic are not supported in the new Gazebo.
  - Wheeled robots can be given wheel slip with the WheelSlip plugin.
  - Simulated sensors include cameras, depth and RGBD cameras, GPU lidars, IMUs, contact sensors, air pressure and thermal cameras.
  - Sensor readings can include Gaussian noise, so algorithms are tested on imperfect data, as on a real robot.

### 3-5:13
- Source: Open Robotics, “Setting up Turtlesim,” ROS 2 Documentation: Lyrical . Available: docs.ros.org/en/lyrical/Get-Started/Introducing-Turtlesim/Introducing-Turtlesim.html .
- URLs: https://docs.ros.org/en/lyrical/Get-Started/Introducing-Turtlesim/Introducing-Turtlesim.html
- Reviewer note: (none)
- Cited for:
  - In rqt it is under Plugins > Services > Service Caller ; you pick a service such as /spawn , fill in the request fields and click Call .

### 3-5:22
- Source: Open Navigation and Nav2 contributors, “Nav2,” Nav2 Documentation . Available: docs.nav2.org .
- URLs: https://docs.nav2.org/rolling/
- Reviewer note: (none)
- Cited for:
  - z.msgs.LaserScan messages are converted into ROS sensor_msgs/msg/LaserScan messages on /scan . Any ROS node subscribed to /scan (for example a navigation stack) receives them just as it would from a real lidar driver, which is what lets you test the same code in simulation first.   10. Essential community packages   Robotics engineers rarely write core autonomy algorithms from scratch. Instead, they build on well-tested community packages such as these:   Package Domain Primary Capability   Nav2

### 3-5:23
- Source: PickNik Robotics and MoveIt contributors, “MoveIt 2 Documentation.” Available: moveit.picknik.ai/main/index.html .
- URLs: https://moveit.picknik.ai/main/index.html
- Reviewer note: (none)
- Cited for:
  - Mobile Navigation Successor of the ROS Navigation Stack: perception, planning, control, localization and behaviors, with navigation logic built from behavior trees.   MoveIt 2

### 3-5:24
- Source: S. Macenski and I. Jambrecic, “SLAM Toolbox: SLAM for the dynamic world,” Journal of Open Source Software , vol. 6, no. 61, p. 2783, 2021, doi: 10.21105/joss.02783 . Project README: github.com/SteveMacenski/slam_toolbox .
- URLs: https://doi.org/10.21105/joss.02783 https://github.com/SteveMacenski/slam_toolbox
- Reviewer note: (none)
- Cited for:
  - Arm Manipulation The robotic manipulation platform for ROS 2: kinematics, motion planning and planning around objects.   slam_toolbox

### 3-5:25
- Source: ros2_control developers, “Welcome to the ros2_control documentation,” ros2_control Documentation: Jazzy . Available: control.ros.org/jazzy/index.html .
- URLs: https://control.ros.org/jazzy/index.html
- Reviewer note: (none)
- Cited for:
  - Mapping & Localization 2D Simultaneous Localization and Mapping (SLAM) with pose-graph optimization, a localization mode, lifelong mapping and map serialization.   ros2_control
