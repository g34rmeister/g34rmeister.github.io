# Step 45: slop audit, batch 4

Source: live pages at https://g34rmeister.github.io/ via scripts/fetch_text.py. Text read is the prose only; navigation, References and footer were skipped.

### robotics-10-1 | CLUMSY
- Text: "The final grade uses a four-level analytic rubric with no neutral middle level, a format documented in an engineering-technology capstone program where each project was rated from “Not Acceptable” to “Exemplary”."
- Why: One sentence stacks the grading format, its source and the rating scale. The reader has to work out who documented what before getting to the point.

### robotics-10-1 | CLUMSY
- Text: "From version 2026.1, RobotStudio uses user-based licensing tied to a Robotics One account (node-locked licenses are the exception), and ABB's comparison lists an “Education” license type alongside Freemium, Trial, Enterprise, Node-Locked and Partner."
- Why: Three clauses and a parenthesis in one sentence. The one fact a student needs (whether an Education tier exists) is buried in a list of license names.

### robotics-10-1 | VAGUE
- Text: "The project is organised the way teaching-center guidance recommends for project work."
- Why: Names no source and no practice. The reader cannot tell which guidance is meant or what it recommends beyond the next sentences.

### robotics-10-1 | VAGUE
- Text: "The rubric is kept short on purpose: capstone researchers note that rubrics must balance depth against simplicity, and that very detailed rubrics can narrow student creativity."
- Why: "capstone researchers" is unnamed. The claim is generic, and the number after it is what gives it weight.

### robotics-10-2 | VAGUE
- Text: "This structure (a plan, working subsystems, an integrated demo, test evidence and a written report) mirrors capstones described in the engineering education literature, where students wrote specifications, planned milestones, gave oral presentations and wrote a final report."
- Why: "the engineering education literature" is an appeal to authority with no named source. The sentence also repeats the milestone table that sits just above it.

### robotics-10-2 | FILLER
- Text: "Complex project work is easier to manage, and to grade fairly, when it is split into milestones such as a plan, a prototype and a progress briefing."
- Why: A general truth that the milestone table in section 04 shows in more detail. It adds no information of its own.

### robotics-10-2 | FILLER
- Text: "This page is a project brief, not a lecture."
- Why: Announces the genre of the page instead of giving the reader anything. The same sentence appears on 10.3.

### robotics-10-2 | VAGUE
- Text: "Teaching guidance on project work recommends sharing the criteria and rubric when the project starts, not at the end, so you know what "good" looks like while you still have time to aim for it."
- Why: "Teaching guidance" is unnamed, so the reader cannot check it. The reason clause is generic and could be attached to any rubric.

### robotics-10-3 | CLUMSY
- Text: "A speed loop usually needs little or no derivative gain, and the quantized speed reading from Section 06—which changes in discrete integer steps rather than continuous values due to digital encoder resolution—makes the derivative term noisy."
- Why: A dash-wrapped aside sits in the middle of the subject, so the point (derivative gain is noisy) arrives late. The aside also restates what "quantized" means.

### robotics-10-3 | CLUMSY
- Text: "The hardware below is one tested-on-paper combination; any similar parts work if you redo the numbers."
- Why: "Tested-on-paper" does not say what was tested or how. "Any similar parts work" overclaims for a build that the same section says needs its numbers redone.

### robotics-10-3 | FILLER
- Text: "This page is a project brief, not a lecture."
- Why: Same genre announcement as 10.2. It tells the reader what kind of page this is, not what to do.

### robotics-10-3 | VAGUE
- Text: "Project-based learning guidance recommends splitting complex work into milestones and collecting individual evidence, such as contribution statements or progress notes, alongside the team result."
- Why: "Project-based learning guidance" is unnamed. The reader cannot tell what source is behind the milestone advice.

### robotics-10-3 | CLUMSY
- Text: "The rubric uses four levels with no neutral middle, following an engineering-technology capstone that rated projects from 1 ("Not Acceptable") to 4 ("Exemplary")."
- Why: Repeats the grading-format sentence from 10.1 in a different form. The reader has to parse the level scale inside a sentence about the rubric's design.

### robotics-control | CLUMSY
- Text: "If motors are a robot’s muscles, then PWM is the throttle, encoders are its sense of where its limbs are, and PID control is the reflex that connects the two."
- Why: Three analogies (muscles, throttle, reflex) in one sentence, and none of them is carried through the chapter. It adds an image without a claim.

### robotics-control | FILLER
- Text: "This chapter builds up the pieces that solve that problem, one article at a time."
- Why: Roadmap sentence. The article list that follows says the same thing.

### robotics-ethics | FILLER
- Text: "Learning robotics also means learning to ask who is responsible when an automated system makes a decision, and how to design machines that work safely alongside people."
- Why: A stock "learning X means learning to" frame. The chapter list below names the real topics, so this sentence adds nothing.

### robotics-ethics | VAGUE
- Text: "Ethics in engineering: the responsibilities engineers carry in general."
- Why: "In general" stands in for the actual responsibilities. The item names the topic and leaves out the content.

### robotics-intro | FILLER
- Text: "Before writing a single line of robot code, it helps to agree on what a robot actually is, where robots came from, and what kinds exist today."
- Why: "Actually" and "agree on" add nothing. The sentence previews the chapter without making a claim.

### robotics-intro | FILLER
- Text: "This chapter sets up the rest of the course: definitions, history, the main types of robots, the skills worth having before you start, and the places robots are used."
- Why: Roadmap that repeats the "What you will learn" list directly below it.

### robotics-maintenance | FILLER
- Text: "Next, the chapter investigates physical failure modes across mechanical, electrical, and sensor subsystems."
- Why: Says what the chapter will do rather than what the reader will learn. "Investigates" inflates a list of topics.

### robotics-maintenance | FILLER
- Text: "Finally, we cover axis recalibration, TCP verification, and controller disaster recovery before concluding with software diagnostics."
- Why: Roadmap sentence. It also switches from "the chapter" to "we" within the same overview.

### robotics-maintenance | CLUMSY
- Text: "Technicians learn to update axis revolution counters at physical synchronization marks, calibrate tool centers, manage joint replacement mismatches, and automate system backups using flash storage images and magic files."
- Why: Five stacked gerund phrases with jargon and no connecting logic. A reader has to hold the whole list in mind to see how the items relate.

### robotics-maintenance | VAGUE
- Text: "Chapter 9 addresses what technicians and engineers do to keep industrial robot cells operating reliably and how to diagnose and resolve faults when equipment stops."
- Why: "Operating reliably" and "diagnose and resolve faults" are generic. The following paragraphs name the actual topics.

### robotics-method | FILLER
- Text: "Software moves fast."
- Why: A platitude. The next sentence gives the real limit (release names and install steps may change).

### robotics-method | CLUMSY
- Text: "His advisor's feedback asked for more hands-on work, visuals and photos, and a quiz, which is why lessons have Try it boxes, diagrams, simulators and chapter quizzes."
- Why: "Which" points at the whole clause, and the lesson features listed do not include photos, which the advisor asked for. The sentence reads as more complete than it is.

### robotics-method | CLUMSY
- Text: "Gemini read every lesson and reported problems only: objectives and glossary entries that do not match the lessons, uncited factual sentences, terms used inconsistently between lessons, and small fixes for new contributors."
- Why: "Problems only" conflicts with the final item, which is a list of fixes. The four-item list in one sentence is hard to hold.

### robotics-method | CLUMSY
- Text: "Since late October 2026, Claude also publishes routine changes directly, under rules Gerald set: only after every check below passes locally, and never for safety content, new chapters, renumbered lessons or Gerald’s own wording, which wait for his approval."
- Why: The "which" could attach to the last item or to the whole exception list. The rule is clear once read twice, but it should be split into two sentences.

### robotics-networks | CLUMSY
- Text: "As machine complexity grew, serial fieldbuses replaced bundles of point-to-point wires, and industrial Ethernet expanded this capability by running multiple communication protocols across shared physical media in line, star, and ring configurations."
- Why: "This capability" has no clear referent. The sentence packs two developments and a topology list into one clause chain.

### robotics-networks | CLUMSY
- Text: "Finally, we examine plant-floor integration via IO-Link, OPC UA with the VDMA 40010 Robotics companion specification, MQTT telemetry, and industrial security under ISA/IEC 62443, ending with a hands-on Wireshark diagnostic capture."
- Why: Five topics strung together with commas and a trailing participle. It reads as a table of contents in prose.

### robotics-networks | FILLER
- Text: "From protocol foundations, the chapter moves into hands-on cell integration and plant-level connectivity."
- Why: Roadmap that the article list below repeats. No new information.

### robotics-oss | FILLER
- Text: "We then explore how robotics open-source projects manage development and quality."
- Why: "Explore" announces the section without making a claim. The sentences that follow carry the content.

### robotics-oss | CLUMSY
- Text: "We then walk through the standard GitHub workflow: forking a repository, cloning locally, connecting the upstream remote, creating feature branches, keeping code in sync to prevent merge conflicts, opening draft pull requests for early feedback, and following public communication norms."
- Why: A seven-step workflow packed into one sentence. A numbered list would be easier to follow and to check.

### robotics-oss | VAGUE
- Text: "Contributing to open-source projects helps you build practical experience, publish work that demonstrates your skills, and solve problems you encounter in your own robotics work."
- Why: Benefits stated in general terms. No example shows what a contribution actually gets the reader.

### robotics-oss | VAGUE
- Text: "Robotics software requires strict stability and testing."
- Why: "Strict" is undefined. The next sentence gives the specifics, so this one adds nothing.

### robotics-ros | FILLER
- Text: "This chapter introduces ROS, explains how ROS 2 differs from ROS 1, walks through installing it, runs a first example, and tours the tools you will use most."
- Why: Roadmap sentence that restates the "What you will learn" list below it.

### robotics-ros | VAGUE
- Text: "ROS (Robot Operating System) is a set of software libraries and tools for building robot applications that work across different robots."
- Why: "Work across different robots" says little. The definition would be more useful if it said what the shared layer provides (messages, drivers, tools).

### robotics-vision | FILLER
- Text: "Chapter 7 steps back to examine the vision system itself, covering the entire pipeline from physical photons to robot motion."
- Why: "Steps back to examine" and "the entire pipeline" are inflated framing. The section list that follows gives the actual scope.

### robotics-vision | CLUMSY
- Text: "Tailored illumination geometries—including backlighting, darkfield, glancing, diffuse dome, coaxial, and strobed lighting—create sharp optical contrast before any image processing algorithm runs."
- Why: A dash-wrapped list of six lighting types sits between the subject and its verb. The reader reaches "create" after losing track of the subject.

### robotics-vision | CLUMSY
- Text: "While Chapter 2 treated the vision sensor primarily as an external component providing coordinate offsets, this chapter equips you to specify optics, design lighting, process images, filter 3D point clouds, and integrate real-time camera streams into industrial robot cells."
- Why: The main clause comes after a long contrast clause, and the closing list has five verbs. Split into two sentences, it would be clearer.

### robotics-glossary | clean
### robotics-quiz | clean
### robotics-10-4 | clean
### robotics-capstone | clean
### robotics-oss-map | clean
### robotics-programming | clean
### robotics-teaching | clean

Note (not slop): the robotics-vision overview says "Chapter 7 follows the Chapter 10 capstone projects", but Chapter 10 comes after Chapter 7 in the course order. Factual slip, not a writing finding.

Note (coverage): robotics-10-3 was truncated by fetch_text's default 20,000-character limit. The full page was re-fetched with --max 60000, and the text after the T4 test line was read. The glossary and quiz content is rendered client-side and is not in fetch_text output, so only their frames were checked. The quiz frame lists six chapter quizzes; chapters 3, 7, 8 and 9 are not in the fetched text.

Checked: robotics-10-1, robotics-10-2, robotics-10-3, robotics-10-4, robotics-capstone, robotics-control, robotics-ethics, robotics-glossary, robotics-intro, robotics-maintenance, robotics-method, robotics-networks, robotics-oss, robotics-oss-map, robotics-programming, robotics-quiz, robotics-ros, robotics-teaching, robotics-vision
