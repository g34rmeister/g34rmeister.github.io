### FLOW: Overview narrative omits Chapter 3 capstone case study
- Where: robotics-oss.html, section "01. Overview"
- Text: "Finally, in a hands-on lab, you submit your first pull request to the robOSStics repository by fixing a typo or updating a source link directly in your browser or locally."
- Why it matters: The overview summary narrative covers lessons 3.1 to 3.4 and concludes that 3.4 is the final hands-on lab ("Finally..."), omitting lesson 3.5 (Case Study: Contributing to Nav2) entirely from the narrative.
- Suggested fix: Add a concluding sentence summarizing lesson 3.5 as the case study of contributing to a major open-source robotics project.

### DANGLING: Quiz references research not covered in the lesson
- Where: robotics-3-4.html, section "07. Check your understanding"
- Text: "What are three easy ways to make a first contribution to robOSStics without prior robotics expertise, and what share of casual open-source contributions consists of documentation according to Igor Steinmacher's research?"
- Why it matters: Question 1 quizzes the reader on Igor Steinmacher's research, but Steinmacher is neither discussed nor cited anywhere in lesson 3.4 (his research was introduced in lesson 3.2).
- Suggested fix: Cross-reference lesson 3.2, briefly summarize the statistic in 3.4, or replace the clause with a question on 3.4's Git lab workflow.

### CONTRADICTION: Conflicting guidance on direct messaging maintainers
- Where: robotics-3-2.html, section "05. Communication norms: public collaboration and reproduction", and robotics-3-5.html, section "05. How to get involved"
- Text: "The project also hosts a Community Slack where contributors discuss topics in public channels or send direct messages to maintainers."
- Why it matters: Lesson 3.2 states that open-source communication should strictly remain in public channels rather than via private messages to maintainers, but lesson 3.5 invites contributors to send direct messages to maintainers on Slack.
- Suggested fix: Clarify in lesson 3.5 that public Slack channels should always be used first for contributor discussions, with direct messages reserved for maintainer-initiated private coordination.

### FLOW: Chapter learning objectives omit lessons 4.6 through 4.9
- Where: robotics-ros.html, section "02. What you will learn"
- Text: "Tools: RViz, Gazebo and popular ROS packages."
- Why it matters: The chapter learning objectives bullet list covers only lessons 4.1 to 4.5, omitting lessons 4.6 (package creation), 4.7 (launch and parameters), 4.8 (MoveIt 2), and 4.9 (ROS-Industrial and vendor drivers).
- Suggested fix: Add bullet points covering package development (4.6), launch/parameters (4.7), MoveIt 2 arm motion planning (4.8), and industrial vendor drivers (4.9) to section 02.

### DANGLING: Premature cross-reference for custom package creation
- Where: robotics-4-3.html, section "11. Essential developer utilities: rosdep and colcon"
- Text: "Before you begin creating custom packages in lesson 4.4, two developer tools must be installed:"
- Why it matters: The text directs the reader to lesson 4.4 for creating custom packages, whereas the formal syllabus and dedicated package creation lesson is lesson 4.6 (Writing Your First ROS 2 Package).
- Suggested fix: Update the reference to cite lesson 4.6 (or cite both 4.4 and 4.6).

### REPEAT: Package creation and build workflows taught twice from scratch
- Where: robotics-4-4.html, section "07. Python package layout: package.xml and setup.py", and robotics-4-6.html, section "02. Anatomy of a ROS 2 Python package"
- Text: "ROS code is organised into packages, which you create from the workspace's src directory with ros2 pkg create, choosing either the ament_cmake or ament_python build type."
- Why it matters: Lesson 4.4 teaches custom workspace layout, ros2 pkg create, package.xml, setup.py, setup.cfg, and colcon build, which lesson 4.6 re-explains from scratch as if the learner has never created or built a package.
- Suggested fix: Keep lesson 4.4 focused on interacting with Turtlesim via CLI tools and topics/services, reserving custom package creation and colcon building for lesson 4.6.

### FLOW: Chapter learning objectives omit lessons 5.4 and 5.5
- Where: robotics-ethics.html, section "02. What you will learn"
- Text: "Robots and society: jobs and automation, privacy and accountability for autonomous decisions."
- Why it matters: The chapter learning objectives list covers only lessons 5.1 through 5.3, omitting lessons 5.4 (Making a Robot Cell Safe) and 5.5 (AI in Robotics: Uses and Limits).
- Suggested fix: Add bullet points summarizing cell safety engineering (5.4) and AI capabilities and limits in robotics (5.5) to section 02.

### REPEAT: Verbatim duplication of Roomba privacy case study
- Where: robotics-5-2.html, section "06. Sensor privacy and data harvesting", and robotics-5-3.html, section "06. Privacy: robots as mobile surveillance platforms"
- Text: "Images taken in 2020 by development versions of iRobot's Roomba J7 series, including one of a woman on the toilet, had been sent to Scale AI"
- Why it matters: Both lessons present nearly identical accounts of the 2022 Roomba/Scale AI leak and recommend identical technical mitigations (edge computing, lens covers, discarding raw video), producing duplicate narrative across adjacent lessons.
- Suggested fix: Focus sensor privacy and the Roomba case study in lesson 5.3 where societal privacy issues belong, and refocus lesson 5.2 section 06 on machine-level sensor integrity.

### REPEAT: Stop categories and teach-mode safeguards explained twice
- Where: robotics-5-2.html, section "02. Hardware safeguards and emergency stops", and robotics-5-4.html, section "06. Emergency stops and teach mode"
- Text: "Stops are grouped into categories: Stop category 0: An uncontrolled stop that removes power from the actuators immediately. Stop category 1: A controlled stop, with power kept until the machine has stopped and then removed."
- Why it matters: Lesson 5.4 defines Stop categories 0, 1, and 2, teach-mode enabling devices, and the 250 mm/s speed limit from scratch, duplicating explanations already provided in lesson 5.2 without cross-referencing them.
- Suggested fix: Condense section 06 in 5.4 to reference the stop categories and enabling device definitions established in 5.2, focusing 5.4 on cell integration specifics.

### FLOW: Practical cell safety lesson ignores preceding hardware/software safety lesson
- Where: robotics-5-4.html, section "01. From principles to a working safety plan"
- Text: "Lesson 5.1 introduced the standards behind industrial robot safety (ISO 10218:2025, ISO/TS 15066 and the EU Machinery Regulation) and the accident data that explain why they exist. This lesson is the practical sequel."
- Why it matters: Lesson 5.4 frames itself as the direct sequel exclusively to 5.1, skipping any mention of lesson 5.2 which already introduced hardware safeguards, emergency stops, enabling switches, and functional safety PL ratings.
- Suggested fix: Frame lesson 5.4 as building upon both lessons 5.1 and 5.2.

### DANGLING: Safety configuration attributed solely to practical cell safety lesson
- Where: robotics-5-5.html, section "01. Why this lesson exists"
- Text: "The safety-rated controller and its safety configuration (the speed limits, safety planes, stop functions and safeguard inputs you met in 5.4) stay conventional and deterministic."
- Why it matters: Safety planes, speed limits, and controller safety systems were first introduced in lesson 5.2 section 05, but the text states the reader met them in 5.4.
- Suggested fix: Update the reference to cite both lesson 5.2 and lesson 5.4 (e.g., "you met in 5.2 and 5.4").

Checked: robotics-oss.html, robotics-3-1.html, robotics-3-2.html, robotics-3-3.html, robotics-3-4.html, robotics-3-5.html, robotics-ros.html, robotics-4-1.html, robotics-4-2.html, robotics-4-3.html, robotics-4-4.html, robotics-4-5.html, robotics-4-6.html, robotics-4-7.html, robotics-4-8.html, robotics-4-9.html, robotics-ethics.html, robotics-5-1.html, robotics-5-2.html, robotics-5-3.html, robotics-5-4.html, robotics-5-5.html
