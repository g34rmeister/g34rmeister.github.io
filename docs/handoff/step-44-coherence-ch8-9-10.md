### GAP: Class 1 and Class 3 CIP messaging in Lesson 8.3
- Where: 8.3, section "01. Connecting robots to cell PLCs"
- Text: "On EtherNet/IP networks, Universal Robots controllers only support EtherNet/IP Class 1 implicit I/O messaging and do not support Class 3 explicit messaging."
- Why it matters: Lesson 8.2 introduced implicit and explicit messaging without mention of CIP classes (Class 1 or Class 3), leaving the reader to encounter these terms for the first time without definition.
- Suggested fix: Add a brief clarifying phrase noting that Class 1 designates cyclic implicit I/O connections and Class 3 designates connected explicit messaging, or link back to 8.2.

### REPEAT: Modbus data tables and endianness definition
- Where: 8.3, section "02. Modbus TCP server architecture" (and 8.2, section "05. Modbus TCP: industrial messaging on port 502")
- Text: "The Modbus data model provides four primary tables comprising discrete inputs, coils, input registers, and holding registers."
- Why it matters: This paragraph repeats the description of the four Modbus tables and big-endian representation given in the immediately preceding lesson without expanding upon it.
- Suggested fix: Replace the repetitive table description with a brief cross-reference to Lesson 8.2 and focus directly on the Universal Robots server addressing and register map.

### GAP: Unintroduced "Freedrive" mode in inspection checklist
- Where: 9.1, section "06. A worked checklist: UR's inspection plan"
- Text: "Freedrive: set the correct TCP, payload and center of gravity, move the arm to a stretched-out horizontal position, and check that it holds its position."
- Why it matters: Freedrive mode is presented as an inspection task without explaining what it is (UR's manual lead-through / gravity-compensation mode), unlike Backdrive which is explained in the following item.
- Suggested fix: Add a brief parenthetical or clause explaining that Freedrive is UR's manual lead-through mode where the controller compensates for gravity.

### REPEAT: Maintenance records documentation rationale
- Where: 9.2, section "06. Documenting root causes and repairs" (and 9.1, section "02. Balancing schedules, sensor data, and maintenance records")
- Text: "Manufacturers generate maintenance records documenting equipment faults, failures, root causes, and repairs to speed up troubleshooting and improve failure prediction."
- Why it matters: The exact cited sentence and surrounding explanation about recording symptoms to help the next technician are repeated verbatim from Lesson 9.1 section 02.
- Suggested fix: Reframe section 06 in 9.2 to reference the maintenance log introduced in 9.1 and focus strictly on closing out an active troubleshooting investigation.

### REPEAT: Flat rings replacement rule and joint lid torque
- Where: 9.3, section "01. Joint seals, flat rings, and fastener torques" (and 9.1, section "06. A worked checklist: UR's inspection plan")
- Text: "On a UR arm, the outside seals are called flat rings. If visual inspection reveals wear or damage on any joint flat ring, all flat rings should be replaced because they share the same operating environment."
- Why it matters: The rule that all flat rings must be replaced together and the 0.4 Nm torque for joint lids are explained as new concepts in 9.3 despite having been stated in 9.1's inspection checklist.
- Suggested fix: Note in 9.3 that this expands on the inspection checklist from Lesson 9.1 rather than presenting the rule as if for the first time.

### TONE: Meta-pedagogical academic padding in capstone introduction
- Where: 10.1, section "01. What you will build and why"
- Text: "The project is organised the way teaching-center guidance recommends for project work. The grading criteria and the rubric are published now, at the start, rather than at the end."
- Why it matters: Detailed academic commentary justifying the rubric's lack of a neutral middle level and citing educational research papers interrupts the direct student project brief.
- Suggested fix: Condense this commentary to a simple statement that rubrics are published upfront (as in 10.2 and 10.3) and move pedagogical justifications to course documentation.

Checked: robotics-networks.html, robotics-8-1.html, robotics-8-2.html, robotics-8-3.html, robotics-8-4.html, robotics-8-5.html, robotics-8-6.html, robotics-maintenance.html, robotics-9-1.html, robotics-9-2.html, robotics-9-3.html, robotics-9-4.html, robotics-9-5.html, robotics-9-6.html, robotics-capstone.html, robotics-10-1.html, robotics-10-2.html, robotics-10-3.html, robotics-10-4.html
