# Step 37: Good First Issues for Chapters 1–5

### Cross-reference to 5.2 instead of 5.3 for worker impact of automation
- Lesson: 1-2, section "03. From the loom to numerical control"
- Text: "The question of how automation affects workers is still part of the conversation about robots today (see <a href=\"robotics-5-2.html\">Ethics in Robotics</a>)."
- Problem: The cross-reference points to `robotics-5-2.html` (5.2 Robot Safety: Concepts and Hardware) using link text "Ethics in Robotics", but the question of how automation affects workers is specifically covered in lesson 5.3 ("5.3 Economic Impact of Robotics").
- Suggested fix: Update the link target and label to point to lesson 5.3: `<a href="robotics-5-3.html">5.3 Economic Impact of Robotics</a>`.
- Labels: good first issue, consistency

### Malformed table rows placing citation tags directly under tr element
- Lesson: 1-5, section "02. Where the robots are: countries and robot density"
- Text: "<tr><td>1</td><td>China</td><sup><a href=\"#ref-2\">[2]</a></sup><td>354,226</td><td>+20%</td></tr>"
- Problem: Citation tags (`<sup>`) for China and the United States in the 2025 robot installations table are placed directly inside `<tr>` elements instead of within the preceding `<td>` cells, creating invalid HTML table markup.
- Suggested fix: Move each citation tag inside its preceding `<td>` element (for example, `<td>China<sup><a href="#ref-2">[2]</a></sup></td>`).
- Labels: good first issue, formatting

### Incorrect lesson title in cross-reference to lesson 2.3
- Lesson: 1-6, section "12. Motion types and blending"
- Text: "The RAPID example in <a href=\"robotics-2-3.html\">2.3 Robot Programming Languages</a> uses all of these ideas."
- Problem: The link text names the target lesson "2.3 Robot Programming Languages", but the actual title of lesson 2.3 is "2.3 Common Programming Languages".
- Suggested fix: Update the link text to match the lesson title: `<a href="robotics-2-3.html">2.3 Common Programming Languages</a>`.
- Labels: good first issue, consistency

### Inconsistent tool reference in RAPID callout describing lesson 2.3
- Lesson: 1-6, section "12. Motion types and blending"
- Text: "Both use <code>tool0</code>, so the TCP is the bare mounting flange, and because no work object is given, the targets are measured in <code>wobj0</code>, the base frame."
- Problem: The callout states that the RAPID example from lesson 2.3 uses `tool0` where the TCP is the bare mounting flange, but the example in lesson 2.3 defines and uses `PERS tooldata tGripper` with a 150 mm TCP offset.
- Suggested fix: Update the code snippets and explanation to reference `tGripper` (e.g., `MoveJ pHome, v1000, z50, tGripper`) and clarify that `tGripper` defines the active tool frame.
- Labels: good first issue, consistency

### Inconsistent ROS message type notation in hardware abstraction list
- Lesson: 2-4, section "02. What ROS is: hardware abstraction and plumbing"
- Text: "In the other direction, the Nav2 controller publishes velocity commands as <code>geometry_msgs</code> Twist messages on the <code>cmd_vel</code> topic"
- Problem: The text formats the Twist message type inconsistently as `<code>geometry_msgs</code> Twist messages`, unlike the full message type format `<code>sensor_msgs/msg/LaserScan</code>` used in the preceding sentence.
- Suggested fix: Update `<code>geometry_msgs</code> Twist messages` to `<code>geometry_msgs/msg/Twist</code> messages`.
- Labels: good first issue, consistency

### Incorrect lesson cross-reference for TCP definition
- Lesson: 2-5, section "06. Telling the controller about the tool: payload and center of gravity"
- Text: "Two groups of numbers matter: the TCP (where the working point of the tool is, covered in lesson 2.3) and the <strong>payload</strong>"
- Problem: The parenthetical states that TCP is covered in lesson 2.3, but lesson 2.3 only uses `tooldata` in an example without defining TCP; TCP is defined and explained in lessons 1.6 and 2.6.
- Suggested fix: Change "covered in lesson 2.3" to "covered in lesson 2.6" (or "lesson 1.6").
- Labels: good first issue, consistency

### Invalid single-argument set_payload call in URScript example
- Lesson: 2-6, section "07. The program on a UR: PolyScope and URScript"
- Text: "  set_payload(0.5)                                # kg"
- Problem: In URScript, `set_payload(m, cog)` requires two arguments (mass and center of gravity vector), whereas `set_payload_mass(m)` accepts a single mass argument. Calling `set_payload(0.5)` with only a mass parameter is invalid syntax on UR controllers.
- Suggested fix: Replace `set_payload(0.5)` with `set_payload_mass(0.5)` or provide a center of gravity vector (for example, `set_payload(0.5, [0, 0, 0.05])`).
- Labels: good first issue, code

### Variable name mismatch between text and Python script for taught pick point
- Lesson: 2-8, section "08. The math of a frame shift, worked through"
- Text: "P_teach = T(210, 150, 0)    # pick point taught at teach time"
- Problem: The Python script names the taught pick point variable `P_teach`, but the preceding walkthrough text and equations refer to this variable as `P_taught`.
- Suggested fix: Rename `P_teach` to `P_taught` in the script (lines 360 and 363) to match the surrounding text.
- Labels: good first issue, code

### Inaccurate claim that Lesson 4.6 writes README sections
- Lesson: 3-1, section "04. Guiding users: the README file"
- Text: "You will write these exact README sections when you build your own software in <a href=\"robotics-4-6.html\">Lesson 4.6 Writing Your First ROS 2 Package</a>."
- Problem: The sentence states that students will write these exact README sections in Lesson 4.6, but Lesson 4.6 focuses on `package.xml`, `setup.py`, and Python node code without writing a `README.md`.
- Suggested fix: Rephrase to reference the package metadata in `package.xml`, or adjust the sentence to clarify that README creation is covered in project documentation rather than Lesson 4.6.
- Labels: good first issue, wording

### Stray empty paragraph tag between lab steps list and flowchart
- Lesson: 3-4, section "03. Lab Path B: Working locally with Git and running checks"
- Text: "Run the four checks from <code>CLAUDE.md</code> to ensure everything passes:"
- Problem: An empty paragraph tag (`<p>\n                           \n                        </p>`) appears directly after the ordered list for Path B and immediately before the flowchart diagram figure.
- Suggested fix: Remove the empty `<p>` element between the list and the figure.
- Labels: good first issue, formatting

### Outdated file path for Nav2 navigation plugins documentation
- Lesson: 3-5, section "03. How the project is organised"
- Text: "Nav2 lists documented plugins in <code>docs/configuration_and_development/navigation_plugins/index.md</code>."
- Problem: The text refers to `docs/configuration_and_development/navigation_plugins/index.md`, but in the Nav2 documentation repository the navigation plugins list is located at `docs/configuration_and_development/navigation_plugins.md` (as also cited in reference 8).
- Suggested fix: Change the file path to `docs/configuration_and_development/navigation_plugins.md`.
- Labels: good first issue, consistency

### RobotStudio erroneously described as running on Ubuntu Linux VM
- Lesson: 4-3, section "08. Windows on ARM (Snapdragon laptops)"
- Text: "Run heavy Gazebo simulation, URSim and RobotStudio on an x64 lab PC or on a cloud virtual machine running Ubuntu 26.04, which also gets the Tier 1 packages."
- Problem: The sentence implies ABB RobotStudio can run on an Ubuntu 26.04 cloud virtual machine, but RobotStudio is a proprietary Windows desktop application that does not run on Linux.
- Suggested fix: Rephrase to distinguish Linux simulation tools from Windows software: "Run heavy Gazebo simulation and URSim on an x64 lab PC or on a cloud virtual machine running Ubuntu 26.04, and run RobotStudio on an x64 Windows lab PC."
- Labels: good first issue, wording

### Legacy percent formatting used in square driver logger statement
- Lesson: 4-6, section "08. Designing the square driver: a timer-driven state machine"
- Text: "self.get_logger().info('Finished side %d' % self.sides_done)"
- Problem: The Python node code uses legacy `%`-formatting (`'Finished side %d' % self.sides_done`), whereas modern Python and all other ROS 2 code throughout the course consistently use f-strings.
- Suggested fix: Replace the `%`-formatted string with an f-string: `self.get_logger().info(f'Finished side {self.sides_done}')`.
- Labels: good first issue, code

### Outdated section reference for turtlesim circle command in lab
- Lesson: 4-7, section "10. Common mistakes, and what is new in Lyrical"
- Text: "In another sourced terminal, publish the circle command from section 04 to <code>/turtlesim1/turtle1/cmd_vel</code> and check that the second turtle copies the first."
- Problem: Step 4 of the Try It lab refers to "the circle command from section 04", but Section 04 of Lesson 4.7 covers XML and YAML launch files and does not contain a circle command; the command to publish a circular velocity to Turtlesim was introduced in Lesson 4.4, section 03.
- Suggested fix: Update the reference to specify Lesson 4.4 section 03 or print the command inline: `ros2 topic pub /turtlesim1/turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 2.0}, angular: {z: 1.8}}"`.
- Labels: good first issue, lab

Checked lessons: 1-1, 1-2, 1-3, 1-4, 1-5, 1-6, 1-7, 2-1, 2-2, 2-3, 2-4, 2-5, 2-6, 2-7, 2-8, 3-1, 3-2, 3-3, 3-4, 3-5, 4-1, 4-2, 4-3, 4-4, 4-5, 4-6, 4-7, 4-8, 4-9, 5-1, 5-2, 5-3, 5-4, 5-5
