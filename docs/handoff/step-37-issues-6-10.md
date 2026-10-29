# Step 37: Good First Issues for Chapters 6–10

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

### Incorrect chapter cross-reference to 6.1 for test sheets
- Lesson: 10-2, section "09. M5: testing and verification"
- Text: "As in the 6.1 test sheets, record for each test an ID, the expected and actual result, pass or fail, and evidence (a screenshot or log)."
- Problem: The text refers to "the 6.1 test sheets", but lesson 6.1 covers Arduino platform architecture; the FAT-style test sheet format was introduced in lesson 10.1.
- Suggested fix: Change "6.1 test sheets" to "10.1 test sheets" and link to `robotics-10-1.html`.
- Labels: good first issue, consistency

### Incorrect lesson reference to 4.4 for real-cell safety checks in rubric
- Lesson: 10-2, section "11. Grading rubric"
- Text: "As 3, plus a concrete list of real-cell checks tied to 4.4."
- Problem: In the "Robustness and safety awareness" row of the rubric, level 4 refers to checks "tied to 4.4" (which covers ROS 2 Architecture and Computation Graph), whereas section 10 and the capstone prerequisites explicitly state that real-cell safeguards are discussed in lesson 5.4 ("Making a Robot Cell Safe").
- Suggested fix: Change "tied to 4.4" to "tied to 5.4".
- Labels: good first issue, consistency

### Incorrect cross-reference to lesson 5.4 for PID simulation
- Lesson: 10-3, section "07. Milestone 2: open-loop drive, then the PID speed loop"
- Text: "It is an example to test, not proven code: try your gains in the 5.4 simulation first, then run it with the wheel free"
- Problem: The text instructs the reader to "try your gains in the 5.4 simulation first", but lesson 5.4 covers cell safety and has no simulation; the interactive PID simulation widget is in lesson 6.4.
- Suggested fix: Change "5.4 simulation" to "6.4 simulation" and link to `robotics-6-4.html`.
- Labels: good first issue, consistency

Checked lessons: 6-1, 6-2, 6-3, 6-4, 6-5, 6-6, 6-7, 6-8, 6-9, 6-10, 7-1, 7-2, 7-3, 7-4, 7-5, 7-6, 8-1, 8-2, 8-3, 8-4, 8-5, 8-6, 9-1, 9-2, 9-3, 9-4, 9-5, 9-6, 10-1, 10-2, 10-3, 10-4
