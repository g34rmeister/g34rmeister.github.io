## 3-1:10
gap: none

## 3-1:12
gap: none

## 3-1:28
gap: port base 7400, domain gain 250, and participant gain 2 not in spec landing page
3-1:28 | https://www.omg.org/spec/DDSI-RTPS/2.5/PDF | current | port base 7400 domain gain 250 and participant gain 2 | 7400, 250, PB, DG
3-1:28 | https://docs.ros.org/en/rolling/Concepts/Intermediate/About-Domain-ID.html | new | DDS port mapping formulas using base 7400 and gain 250 | 7400, 250, port, Domain

## 3-2:5
gap: DDS standard created by Object Management Group (OMG) and communicating via RTPS wire protocol
3-2:5 | https://design.ros2.org/articles/ros_on_dds.html | current | DDS standard created by Object Management Group and RTPS protocol | OMG, Object Management Group, RTPS, DDS
3-2:5 | https://www.omg.org/spec/DDS/ | new | Object Management Group DDS specification standard | Object Management Group, DDS, Data Distribution Service
3-2:5 | https://www.omg.org/spec/DDSI-RTPS/ | new | OMG DDSI-RTPS specification defining RTPS wire protocol for DDS | RTPS, wire protocol, DDS, OMG

## 3-2:6
gap: none

## 3-2:16
gap: none

## 3-5:5
gap: RViz visualization versus Gazebo simulation distinction; WheelSlip plugin and Gaussian sensor noise configuration
3-5:5 | https://gazebosim.org/docs/latest/wheel_slip/ | current | WheelSlip plugin configuring lateral and longitudinal wheel slip | WheelSlip, slip_compliance_lateral, wheel
3-5:5 | https://gazebosim.org/docs/latest/sensors/ | current | simulated sensors and Gaussian noise configuration in SDF | sensor, gaussian, noise, lidar
3-5:5 | https://docs.ros.org/en/rolling/Tutorials/Intermediate/RViz/RViz-User-Guide/RViz-User-Guide.html | new | RViz 3D visualizer of ROS topics and robot state | RViz, visualizer, displays, 3D

## 3-5:13
gap: none

## 3-5:22
gap: converting gz.msgs.LaserScan messages to ROS sensor_msgs/msg/LaserScan messages on /scan
3-5:22 | https://gazebosim.org/docs/latest/ros2_interop/ | new | ros_gz_bridge converting gz.msgs.LaserScan to sensor_msgs/msg/LaserScan on /scan | LaserScan, ros_gz_bridge, /scan

## 3-5:23
gap: mobile navigation successor of ROS Navigation Stack with perception, planning, control, and behavior trees
3-5:23 | https://docs.nav2.org/rolling/ | new | Nav2 mobile navigation successor of ROS Navigation Stack using behavior trees | Nav2, behavior trees, perception, navigation

## 3-5:24
gap: robotic manipulation platform for ROS 2 with kinematics, motion planning, and planning around objects
3-5:24 | https://moveit.picknik.ai/main/index.html | new | MoveIt 2 robotic manipulation platform kinematics and motion planning | manipulation, kinematics, motion planning

## 3-5:25
gap: 2D SLAM with pose-graph optimization, localization mode, lifelong mapping, and map serialization
3-5:25 | https://github.com/SteveMacenski/slam_toolbox | new | SLAM Toolbox 2D SLAM pose-graph optimization lifelong mapping and serialization | SLAM Toolbox, pose-graph, lifelong mapping, serialization
3-5:25 | https://joss.theoj.org/papers/10.21105/joss.02783 | new | SLAM Toolbox JOSS paper on 2D pose-graph SLAM | SLAM Toolbox, pose-graph, SLAM
