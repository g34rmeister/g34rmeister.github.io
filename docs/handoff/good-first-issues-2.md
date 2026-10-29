# Good first issues, round 2 (harvested 2026-10-28)

Drafted by Gemini (step 37), quotes checked by script. Issues already fixed by Claude were removed. Post the ones you like; do not create them automatically.

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

### Unclear subordinate clause on Uno USB serial link
- Lesson: 6-1, section "03. GPIO pin functions and input modes"
- Text: "On the Uno R3, pins 0 (RX) and 1 (TX) carry the serial link to the board's USB bridge chip (an ATmega16U2), which some of the processor's pins are reserved for; this USB link is also how sketches are uploaded"
- Problem: The subordinate clause "which some of the processor's pins are reserved for;" is convoluted, ungrammatical, and redundant with the main clause.
- Suggested fix: Rephrase to "On the Uno R3, pins 0 (RX) and 1 (TX) carry the serial link to the board's ATmega16U2 USB bridge chip; this USB link is also how sketches are uploaded and how the Serial Monitor talks to the board."
- Labels: good first issue, wording

### Catechism-style phrasing in Ziegler–Nichols tuning description
- Lesson: 6-4, section "06. Classical tuning methods: Ziegler–Nichols and Cohen–Coon"
- Text: "how is the ultimate gain \(K_u\) determined? The answer:"
- Problem: The sentence is formatted as an in-line catechism or flashcard quiz question and answer rather than standard narrative technical prose.
- Suggested fix: Rephrase into expository prose: "In the Ziegler–Nichols closed-loop tuning method, the ultimate gain \(K_u\) is determined by setting \(K_i\) and \(K_d\) to zero and increasing \(K_p\) until the output sustains continuous, steady oscillations."
- Labels: good first issue, wording

### Missing code tags on OpenCV function cv::connectedComponentsWithStats
- Lesson: 7-5, section "05. Presence verification and flaw detection"
- Text: "The cv::connectedComponentsWithStats function segments a binary image into labeled connected foreground components and computes bounding box geometry and pixel area for each label."
- Problem: The OpenCV function name cv::connectedComponentsWithStats is written as plain text rather than enclosed in code tags.
- Suggested fix: Wrap cv::connectedComponentsWithStats in code tags: `<code>cv::connectedComponentsWithStats</code>`.
- Labels: good first issue, formatting

### Missing code tags on OpenCV constant CC_STAT_AREA
- Lesson: 7-5, section "05. Presence verification and flaw detection"
- Text: "The CC_STAT_AREA statistic output in OpenCV connected components represents the total area in pixels of the labeled component."
- Problem: The constant CC_STAT_AREA is written in plain text without code styling, whereas subsequent sentences in the same section format it in code tags.
- Suggested fix: Wrap CC_STAT_AREA in code tags: `<code>CC_STAT_AREA</code>`.
- Labels: good first issue, formatting

### Unordered list used for review questions in 7.5
- Lesson: 7-5, section "07. Check your understanding"
- Text: "Why do telecentric lenses eliminate parallax and perspective errors in dimensional gauging, and how do they behave when an object moves out of focus?"
- Problem: The review questions are placed in an unordered bulleted list (`<ul class="article-spec-list">`) rather than the numbered ordered list (`<ol class="article-spec-list">`) standard in other lessons.
- Suggested fix: Change `<ul class="article-spec-list">` to `<ol class="article-spec-list">` (and update `</ul>` to `</ol>`).
- Labels: good first issue, formatting

### Repetitive consecutive sentence opening in EtherCAT section
- Lesson: 8-2, section "04. EtherCAT: processing on the fly"
- Text: "In an EtherCAT network, slave devices read incoming data and insert outgoing data on the fly as the frame passes downstream."
- Problem: Consecutive sentences begin with the identical phrase "In an EtherCAT network,", making the paragraph repetitive.
- Suggested fix: Remove the opening clause from the second sentence: "Slave devices read incoming data and insert outgoing data on the fly as the frame passes downstream."
- Labels: good first issue, wording

### Subject-verb agreement error for Modbus Unit Identifier and Slave ID
- Lesson: 8-3, section "02. Modbus TCP server architecture"
- Text: "The Unit Identifier and Slave ID value is ignored in the robot Modbus server."
- Problem: The compound subject "The Unit Identifier and Slave ID" conflicts with the singular "value is ignored".
- Suggested fix: Rephrase to "The Unit Identifier (Slave ID) value is ignored by the robot Modbus server." or "The Unit Identifier and Slave ID values are ignored by the robot Modbus server."
- Labels: good first issue, wording

### Missing spacing between numerical values and unit in IO-Link baud rates
- Lesson: 8-5, section "02. Device-level intelligence with IO-Link"
- Text: "IO-Link features three communication speeds of 4.8kBaud, 38.4kBaud, and 230.4kBaud."
- Problem: Spacing is omitted between numerical figures and the unit "kBaud", inconsistent with unit formatting used throughout the course.
- Suggested fix: Insert spaces before the unit: "IO-Link features three communication speeds of 4.8 kBaud, 38.4 kBaud, and 230.4 kBaud."
- Labels: good first issue, formatting

### Redundant parenthetical standard name in TSN description
- Lesson: 8-6, section "04. Deterministic communication and Time-Sensitive Networking"
- Text: "IEEE Std 802.1AS (IEEE 802.1AS) provides Layer 2 timing and synchronization for time-sensitive applications as a profile of IEEE 1588."
- Problem: The parenthetical abbreviation "(IEEE 802.1AS)" redundantly repeats the exact standard designation given immediately prior.
- Suggested fix: Remove the redundant parenthetical: "IEEE Std 802.1AS provides Layer 2 timing and synchronization for time-sensitive applications as a profile of IEEE 1588."
- Labels: good first issue, wording

### Spelled-out multimeter terminal name V-omega
- Lesson: 9-4, section "02. Measuring DC voltages and testing continuity"
- Text: "When setting up a multimeter for DC voltage measurements, the black probe connects to COM, the red probe connects to V-omega, and probes are removed in reverse order."
- Problem: The multimeter voltage/resistance input jack is referred to informally with the spelled-out string "V-omega" rather than standard jack labeling.
- Suggested fix: Change "V-omega" to the standard jack label "VΩ" or "V/Ω".
- Labels: good first issue, wording

### Unordered list used for review questions in 9.5
- Lesson: 9-5, section "07. Check your understanding"
- Text: "What is the difference between a 4-point and a 5-point method when defining a tool center point (TCP), and why is accurate tool load data required for collision detection?"
- Problem: The review questions are placed in an unordered bulleted list (`<ul class="article-spec-list">`) rather than the numbered ordered list (`<ol class="article-spec-list">`) standard in other lessons.
- Suggested fix: Change `<ul class="article-spec-list">` to `<ol class="article-spec-list">` (and update `</ul>` to `</ol>`).
- Labels: good first issue, formatting

### Stray empty paragraph tag in Dashboard Server stop recovery section
- Lesson: 9-6, section "04. The stop recovery workflow and the five-second rule"
- Text: "The protective stop recovery sequence via Dashboard Server commands consists of sending"
- Problem: An empty paragraph tag (`<p>\n                            \n                        </p>`) appears directly above this sentence immediately below the section heading.
- Suggested fix: Remove the empty `<p>` block preceding this paragraph.
- Labels: good first issue, formatting
