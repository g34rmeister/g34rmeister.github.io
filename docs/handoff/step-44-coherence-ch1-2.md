# Step 44: Chapter Coherence Audit (Chapters 1 & 2)

### REPEAT: IFR annual installation and operational stock numbers repeated across four lessons
- Where: 1.1, section "11. Robots by the numbers" (and 1.2, section "10. Where robots stand today"; 1.3, section "01. Two ways to sort robots"; 1.5, section "01. Robots at work: the big picture")
- Text: "According to World Robotics 2026, released on 24 September 2026, factories worldwide installed 603,307 industrial robots in 2025, an increase of 11%. The number in operation grew 9% to 5,079,078, about 5.08 million robots."
- Why it matters: Readers encounter the identical set of 2025 IFR installation and operational stock figures repeated four times across five consecutive lessons without progression until lesson 1.5.
- Suggested fix: Keep a single summary sentence in 1.1, 1.2, and 1.3, and consolidate the detailed statistics, national rankings, and density tables in lesson 1.5.

### DANGLING: Forward reference phrasing used for an earlier lesson
- Where: 1.4, section "01. Safety first: before you touch a real robot" (and 1.3, section "08. Cobots: collaborative applications")
- Text: "You will meet its collaborative modes in 1.3 Types of Robots."
- Why it matters: A reader following the course sequentially has already completed lesson 1.3, making a forward-looking promise confusing.
- Suggested fix: Change to "Lesson 1.3 Types of Robots introduced its collaborative modes."

### DANGLING: Promise of building AMR mapping and planning software in the ROS chapter
- Where: 1.3, section "10. Autonomous Mobile Robots (AMRs)"
- Text: "You will build this kind of mapping and planning software yourself in the ROS chapter."
- Why it matters: Chapter 4 focuses on core ROS nodes, Turtlesim, and MoveIt 2 arm motions, but does not build AMR mapping or path planning software.
- Suggested fix: Change to "You will examine this kind of mapping and planning software in Chapter 3's Nav2 case study and use ROS in Chapter 4."

### FLOW: Chapter 1 overview omits lesson 1.7
- Where: intro, section "02. What you will learn"
- Text: "Anatomy: joints, degrees of freedom, coordinate frames and how an arm moves between points."
- Why it matters: The chapter learning summary covers lessons 1.1 through 1.6 but leaves out lesson 1.7 (The Industrial Robot Cell), creating an incomplete overview of the chapter contents.
- Suggested fix: Add a bullet item for lesson 1.7: "Cells: components, safeguarding, PLC handshakes, integrator roles, cycle time and cost."

### CONTRADICTION: Chapter 2 overview claims chapter ends with ROS and omits cell programming lessons
- Where: programming, section "01. Overview" (and section "02. What you will learn")
- Text: "This chapter walks through those tools and ends with ROS, which works across vendors."
- Why it matters: The overview states that Chapter 2 ends with ROS (lesson 2.4) and omits lessons 2.5 through 2.8 from the learning summary, directly contradicting the eight-lesson syllabus.
- Suggested fix: Update overview text and summary bullets to include tooling, pick-and-place, error handling, and vision guidance alongside the vendor tools and ROS.

### FLOW: Lesson 2.4 concludes with an immediate transition to Chapter 4, skipping the rest of Chapter 2
- Where: 2.4, section "11. When to use ROS vs. proprietary vendor languages"
- Text: "In Chapter 4, we begin our hands-on deep dive into the Robot Operating System: examining its core architecture, setting up ROS 2 Lyrical Luth, and writing our first custom publisher and subscriber nodes."
- Why it matters: Transitioning as if moving directly to Chapter 4 disrupts reading flow when four more robot cell programming lessons (2.5 to 2.8) and Chapter 3 follow next.
- Suggested fix: Update the closing sentence to introduce lesson 2.5 (End-of-Arm Tooling and I/O) while noting that hands-on ROS development begins in Chapter 4.

Checked: robotics-intro.html, robotics-1-1.html, robotics-1-2.html, robotics-1-3.html, robotics-1-4.html, robotics-1-5.html, robotics-1-6.html, robotics-1-7.html, robotics-programming.html, robotics-2-1.html, robotics-2-2.html, robotics-2-3.html, robotics-2-4.html, robotics-2-5.html, robotics-2-6.html, robotics-2-7.html, robotics-2-8.html
