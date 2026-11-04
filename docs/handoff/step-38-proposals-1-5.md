# Step 38 Widget Proposals: Chapters 1 to 5

### 1-1: edge-case-classifier
- Shows: A classification tester comparing edge-case machines against ISO 8373 criteria (programmed, actuated, degree of autonomy, locomotion/manipulation/positioning).
- Reader can: Select candidate machines (dishwasher, CNC machine tool, drone, chatbot, self-driving car) to test which ISO criteria they meet and view the classification verdict.
- Lesson text it uses: "each one senses, decides and acts, so it passes the sense, think, act test. It struggles with ISO clause 3.1, though, because a dishwasher does not move itself, handle objects or position anything." / "Under ISO, a drone flown entirely by a pilot looks more like a robotic device, while one that holds its position or flies a route by itself has the autonomy to be a mobile robot."
- Placement: after the paragraph starting "The verdicts below apply the definitions above. They"
- Value (1-3): 2

1-2 | none | Narrative history and timeline with an existing static timeline figure, with no formulas, state machines, or interactive mechanisms.

### 1-3: agv-vs-amr
- Shows: A side-by-side behavioral comparison of an AGV (fixed track navigation) and an AMR (dynamic path planning) encountering an obstacle.
- Reader can: Toggle an obstacle onto the vehicle path to observe an AGV stop and wait versus an AMR compute an alternate route around it.
- Lesson text it uses: "When something blocks its way, an AGV stops and waits, while an AMR plans a route around it." / "AGVs suit high-volume, repetitive routes and need their markers installed and maintained. AMRs need no changes to the building but usually cost more up front, and their travel times are less predictable."
- Placement: after the paragraph starting "The choice between an AGV and an AMR"
- Value (1-3): 3

1-4 | none | Syllabus of prerequisites and safety rules, with kinematics already served by the arm widget in 1.6.

1-5 | none | Survey of application domains and global adoption metrics with an existing overview diagram, with no interactive mechanisms.

### 1-7: cycle-time-positioner
- Shows: Cycle time, bottleneck determination, and robot utilization arithmetic for a single-station cell versus a two-station indexing positioner.
- Reader can: Adjust welding process time, operator unload/load time, and positioner index time to compare single-station cycle time against two-station overlapping cycle time and robot busy percentage.
- Lesson text it uses: "Cycle time is the time between successive good parts leaving the cell. It is set by the bottleneck, the slowest activity in the loop: robot handling, the process itself (machining or welding), or the operator's loading." / "One station: the robot waits while the operator works, so the cycle is about 90 + 60 = 150 s. Two stations: the operator works while the robot welds, so the cycle is about max(90, 60) + 2 = 92 s." / "Result: the robot is now busy about 90 of every 92 s (roughly 98%), and output rises by about 60% with the same robot."
- Placement: after the paragraph starting "Designers shorten cycle time by overlapping work so"
- Value (1-3): 3

2-2 | none | Architectural comparison of commercial programming suites with an existing workflow diagram, with no interactive formulas or state machines.

2-4 | none | High-level conceptual overview of ROS with an existing ROS 1 vs ROS 2 diagram, with topics and QoS treated in dedicated Chapter 4 widgets.

### 2-5: vacuum-cup-sizing
- Shows: Vacuum gripper sizing formulas computing holding force and required cup diameter from part mass, acceleration, safety factor, vacuum level, and cup count.
- Reader can: Adjust part mass, upward acceleration, safety factor, vacuum pressure difference, and number of suction cups to calculate total holding force and minimum cup diameter.
- Lesson text it uses: "The force a cup must supply is larger than the part's weight, because the robot accelerates." / "Robotiq recommends a safety factor of at least 1.5 for smooth parts, 2.0 for porous or oily parts, up to 4.0 when the cup face is vertical, and 2.5 or more for fast swinging or swivelling moves." / "A 2 kg box is picked from above with a horizontal cup. The robot accelerates upward at a = 5 m/s² and the box is smooth, so S = 1.5."
- Placement: after the paragraph starting "Worked example. A 2 kg box is picked"
- Value (1-3): 3

### 2-6: offs-vs-reltool
- Shows: The geometric difference between shifting coordinates in the work object frame (Offs) versus the tool frame (RelTool) as tool tilt changes.
- Reader can: Adjust tool tilt angle and translation offsets (x, y, z) to observe where the target waypoint lands in work object coordinates versus tool coordinates.
- Lesson text it uses: "Offs(p, x, y, z): shifts the point along the axes of the work object. In a work object whose Z points up, Offs(pPick,0,0,100) is 100 mm above the part." / "RelTool(p, x, y, z): shifts the point along the axes of the tool. With the tool pointing down, tool Z points into the table, so the approach is RelTool(pPick,0,0,-100)." / "Because tool axes are usually not aligned with the world, a RelTool offset can move the robot in world Z even when its Z argument is zero, which surprises beginners."
- Placement: after the paragraph starting "Because tool axes are usually not aligned with"
- Value (1-3): 3

### 2-7: pallet-indexing
- Shows: The arithmetic mapping from a single slot index (0 to 8) to row and column coordinates and physical Cartesian offsets on a 3x3 pallet grid.
- Reader can: Drag a slider for slot index i from 0 to 8 to see the evaluated integer division (row = i DIV 3), remainder (col = i MOD 3), and corresponding highlighted cell and offsets.
- Lesson text it uses: "The trick that keeps the program short is to number the slots 0 to 8 and compute the row and column from the number with integer division and remainder:" / "One loop from 0 to 8 visits all nine slots, row by row."
- Placement: after the paragraph starting "The trick that keeps the program short is"
- Value (1-3): 3

### 2-8: vision-frame-shift
- Shows: Planar 2D rigid transform of a taught pick point under part translation and rotation compared against naive unrotated offset errors.
- Reader can: Adjust part rotation angle (degrees) and translations (dx, dy) to inspect the true rigid transform pick pose, the naive offset mistake, and the resulting lever arm position error.
- Lesson text it uses: "All of these work because a shift is a full rigid transform: a translation and a rotation. If the part turns, the pick point must swing around with it, like the end of a lever." / "Rotating (10, 0) by 30° gives (10 cos 30°, 10 sin 30°) = (8.660, 5.000). Adding the part's new position (215, 140) gives P_new = (223.660, 145.000, 30°)." / "The cause is the lever arm: the pick point is 10 mm from the part's reference point, and when the part rotates, that arm swings to a new direction."
- Placement: after the paragraph starting "The common mistake. A beginner sees 'the part'"
- Value (1-3): 3

3-1 | none | Short introductory guide to repository files with an existing static file-tree figure, with no formulas or interactive logic.

3-3 | none | Overview of project governance and release branching with an existing branching diagram, with no interactive mechanisms.

3-4 | none | Practical PR lab tutorial with an existing Path A vs Path B flowchart, with the GitHub workflow already covered by the prflow widget in 3.2.

3-5 | none | Case study on open-source project contribution guidelines and licensing, with GitHub workflows already covered by prflow.

### 4-1: ros-domain-id
- Shows: DDS RTPS port mapping and discovery isolation based on ROS_DOMAIN_ID and participant ID.
- Reader can: Change domain ID (0-101) and participant ID (0-10) to compute multicast and unicast discovery and user data UDP ports.
- Lesson text it uses: "The ports follow the port mapping of the DDS wire protocol (RTPS), with a port base of 7400, a domain gain of 250 and a participant gain of 2:" / "Nodes on the same domain can discover and message each other, while nodes on different domains cannot." / "The documentation recommends choosing a domain ID between 0 and 101 inclusive; the highest ID that can be assigned at all is 232, and IDs above 101 can collide with the Linux ephemeral port range."
- Placement: after the paragraph starting "The ports follow the port mapping of the"
- Value (1-3): 3

4-3 | none | Step-by-step OS installation guide with an existing four-stage flowchart, with no mathematical formulas or state machines.

4-5 | none | Developer toolchain survey with an existing rqt_graph diagram, while computation graphs are covered by rosgraph in 4.4.

### 4-6: square-fsm
- Shows: A timer-driven open-loop state machine (FORWARD -> TURN -> DONE) and the accumulated kinematic drift caused by discrete timer periods.
- Reader can: Step through timer ticks (0.1 s) or run the trajectory, altering linear speed and turn rate to observe state transitions and corner drift.
- Lesson text it uses: "So the node uses a timer that fires 10 times a second (every 0.1 s, well under the 1.0 s timeout) and a small state machine with three states: FORWARD, TURN and DONE." / "The timing is simple kinematics. At 1.0 m/s, a 2.0 m side takes 2.0 s. At 1.0 rad/s, a 90° turn (π/2 rad) takes about 1.57 s." / "The timer only checks the clock every 0.1 s, so a turn that should last 1.57 s actually lasts until the next tick after that, and Turtlesim integrates the motion in its own small time steps. These small errors add up from corner to corner, and the last side will not land exactly on the start point."
- Placement: after the paragraph starting "Do not expect a perfect square. The timer"
- Value (1-3): 3

4-7 | none | Syntax and architecture tutorial for launch files and YAML parameters, with no mathematical formulas or state machines.

4-8 | none | Walkthrough of MoveIt 2 concepts, configuration files (URDF/SRDF), and RViz planning, with no mathematical formulas or state machines.

4-9 | none | Architecture overview of industrial robot drivers with an existing three-layer diagram, with no interactive formulas or state machines.

5-1 | none | Engineering ethics codes and safety standards with an existing collaborative-modes diagram; safety standards are barred from widgets.

5-2 | none | Covers physical safety architectures, stop categories, and regulations; safety mechanisms are barred from widgets.

5-3 | none | Societal, economic, and legal overview with an existing task-framework diagram, with no interactive formulas or state machines.

5-4 | none | Exclusively covers machine safeguarding, risk assessment, PL/SIL, safety distances, and LOTO, all barred from widgets.

5-5 | none | Technology survey on AI perception, predictive maintenance, and foundation models, with no mathematical formulas or state machines.

Checked lessons: 1-1, 1-2, 1-3, 1-4, 1-5, 1-7, 2-2, 2-4, 2-5, 2-6, 2-7, 2-8, 3-1, 3-3, 3-4, 3-5, 4-1, 4-3, 4-5, 4-6, 4-7, 4-8, 4-9, 5-1, 5-2, 5-3, 5-4, 5-5
