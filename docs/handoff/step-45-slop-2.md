# Step 45: slop audit, lessons 4-1 to 6-7 (live site)

Scope: live pages fetched with `scripts/fetch_text.py` (default cap, or `--max 60000` where the default cut the page). Only the lesson prose was read. Navigation, References and footers were skipped. Nothing was edited or committed.

Safety passages are labelled SAFETY. Only filler or weak writing was reported in them.

### robotics-4-1.html | FILLER
- Text: "In ROS, what is a topic?"
- Why: Rhetorical question that restates the heading and then answers itself in the next sentence.

### robotics-4-1.html | FILLER
- Text: "What happens when a task takes ten seconds, two minutes, or half an hour to complete, such as commanding a robot arm to pick up a bin"
- Why: Rhetorical opener. The next sentence states the point directly, so the question adds nothing.

### robotics-4-1.html | VAGUE
- Text: "Community and integrations: A global network of contributors, plus related Open Robotics platforms such as the Gazebo simulator"
- Why: "A global network of contributors" gives no number, example or source for the community claim.

### robotics-4-2.html | VAGUE
- Text: "Python is the most flexible option: you can use the whole language and its libraries, and the launch system itself is written in Python, so a Python launch file can reach features that XML and YAML do not expose."
- Why: "features" is never named, so the reader cannot tell what the Python launch file can do that XML cannot.

### robotics-4-2.html | HYPE
- Text: "ROS 1 succeeded far beyond those first assumptions."
- Why: "succeeded far beyond" is an inflated verdict. The next sentence gives the concrete list of uses that it should lead into.

### robotics-4-3.html | FILLER
- Text: "Setting up a robotics development environment is an important first milestone."
- Why: "important first milestone" says nothing about the setup itself. The lesson does not need the sentence.

### robotics-4-3.html | PADDING
- Text: "Getting the host right is therefore the first step."
- Why: Restates the previous sentence (the host OS must match the distribution) in different words.

### robotics-4-3.html | CLUMSY
- Text: "The Lyrical platform table lists Windows 11 on amd64 as Tier 1 and has no Windows arm64 entry at all,"
- Why: The sentence runs on for about 40 words with a second clause that repeats the first. Split it at the "and".

### robotics-4-3.html | HYPE
- Text: "a fast tool built on the conda-forge ecosystem to handle binary dependencies on Windows"
- Why: "a fast tool" is an unsupported adjective. Say what it does (for example, installs binary packages) and drop the praise.

### robotics-4-4.html | FILLER
- Text: "Having configured our ROS 2 installation in lesson 4.3 , it is time to move from theory to practice."
- Why: Stock transition that adds no information about the lesson.

### robotics-4-4.html | PADDING
- Text: "Driving demo nodes from the terminal is a good start, but real robotics work means writing your own nodes."
- Why: Restates the lesson's purpose, which the section heading and the following paragraph already give.

### robotics-4-4.html | VAGUE
- Text: "Code structure: the rclpy.node.Node class, timer callbacks and create_publisher / create_subscription calls are the same whatever robot you are programming."
- Why: "the same whatever robot" is an overgeneralisation. The next section shows a case where the pattern changes (the message type and topic names differ per robot).

### robotics-4-5.html | HYPE
- Text: "Together, RViz2, rqt, ros2 bag, Gazebo and these community packages give a single developer or a small team a complete workbench for building, testing and debugging robot software."
- Why: "a complete workbench" is marketing language. The list shows tools, not completeness.

### robotics-4-5.html | FILLER
- Text: "An important milestone came on January 31, 2025"
- Why: "important milestone" is filler. The date and the end-of-life fact are enough on their own.

### robotics-4-6.html | FILLER
- Text: "That drift is the real lesson of open-loop control, and it motivates the feedback version in Section 10."
- Why: "the real lesson" is a stock phrase. The sentence could just say what the drift shows.

### robotics-4-6.html | PADDING
- Text: "Notice how each piece maps to the tutorial pattern"
- Why: Announces an explanation that the following sentence then gives. The signpost adds no content.

### robotics-4-6.html | FILLER
- Text: "The idea that matters is layering."
- Why: Stock phrasing. The next sentence just defines layering, so the claim about importance is redundant.

### robotics-4-7.html | VAGUE
- Text: "Forgetting this is a very common source of confusion."
- Why: "very common" gives no frequency or example. The reader does not learn how often the mistake happens.

### robotics-4-7.html | VAGUE
- Text: "This is the most common trap: the tutorial shows that a third node"
- Why: "the most common" is asserted without a source or count. It should say what the tutorial documents, or drop the superlative.

### robotics-4-7.html | CLUMSY
- Text: "Applying ROS conventions such as names, namespaces and remappings allows the same component to be reused across different configurations."
- Why: Long subject with stacked nouns. The reader has to reach the verb to find out what happens. Say "You can reuse one component in several configurations by changing its names, namespaces and remappings."

### robotics-4-8.html | PADDING
- Text: "Swapping the mock for a real UR changes only the hardware plugin."
- Why: The same sentence closes the "Put together" paragraph and is repeated as a figure caption, so the reader meets the point twice.

### robotics-4-8.html | HYPE
- Text: "MoveIt 2 is the standard ROS 2 framework for this problem."
- Why: "the standard" is an unsourced superlative. "A common ROS 2 framework" or a citation would fit the evidence better.

### robotics-4-9.html | FILLER
- Text: "This lesson connects the two worlds."
- Why: "two worlds" is a figure of speech with no content. The next sentence states the question the lesson answers.

### robotics-4-9.html | VAGUE
- Text: "Use both (the most common case): the vendor program owns safety, I/O and the process sequence"
- Why: "the most common case" has no source or count. The sentence is a judgment that should be marked as one.

### robotics-4-9.html | CLUMSY
- Text: "In the default teach pendant mode , you install the External Control URCap on the robot, enter the ROS PC"
- Why: One sentence holds four steps and a port detail. It is hard to scan. Make the steps a list.

### robotics-4-9.html | SAFETY
- Text: "The more important point is about safety."
- Why: FILLER. "more important" is a stock lead-in. The paragraph states the safety point directly after it, so the sentence can go.

### robotics-5-1.html | FILLER
- Text: "As robots leave fenced cells to work beside people, and mobile robots move through shared spaces, these decisions become central to everyday engineering work."
- Why: "central to everyday engineering work" is filler. It says the decisions matter without saying which decisions or why.

### robotics-5-1.html | SAFETY
- Text: "Researchers stress that many of these values are preliminary."
- Why: VAGUE. "many of these values" does not say how many or which. The sentence needs the specific caveat it refers to.

### robotics-5-1.html | FILLER
- Text: "What should an engineer do about a conflict of interest?"
- Why: Rhetorical question. The answer that follows is a plain statement, so the question adds only a pause.

### robotics-5-2.html | SAFETY
- Text: "Despite robust standards, industrial robots remain heavy machines that can cause severe injury."
- Why: HYPE/VAGUE. "robust standards" is a vague compliment. The sentence should name the standards or drop the adjective.

### robotics-5-2.html | SAFETY
- Text: "The 2025 revision greatly increased the number of safety functions it describes and made functional safety requirements more explicit."
- Why: VAGUE. "greatly increased" gives no count. Give the number of functions added or remove the adverb.

### robotics-5-2.html | SAFETY
- Text: "By combining hardware safety with this kind of governance, engineers can make autonomous machines that serve people without sacrificing their safety or dignity."
- Why: FILLER. Closing line that restates the lesson's theme. It adds no new point.

### robotics-5-2.html | HYPE
- Text: "The deepest ethical boundary in robotics concerns the use of autonomy for lethal force."
- Why: "deepest" is an unsupported superlative. The section then argues a case; it does not show this is the deepest boundary.

### robotics-5-2.html | FILLER
- Text: "The case still shows that people in the images are not always the people who agreed."
- Why: Restates the previous sentence (the workers were not the owners) in different words.

### robotics-5-3.html | HYPE
- Text: "Popular debates on robotics swing between promises of effortless abundance and warnings of permanent mass unemployment."
- Why: "effortless abundance" and "permanent mass unemployment" are caricatures. Neither is attributed, so the sentence reads as rhetoric.

### robotics-5-3.html | FILLER
- Text: "Engineering decisions cannot be separated from their economic and legal consequences."
- Why: Generic claim that could open any ethics lesson. It adds nothing specific to robots or to the section.

### robotics-5-3.html | CLUMSY
- Text: "Acemoglu and Restrepo's decomposition of US data attributes slower employment growth over the last three decades to an acceleration of the displacement effect, especially in manufacturing, together with a weaker reinstatement effect and slower productivity growth than in earlier decades."
- Why: One 40-word sentence carries three causes and a comparison. Split it into a list of the three effects.

### robotics-5-4.html | SAFETY
- Text: "A Nebraska case shows why every person counts."
- Why: FILLER. Slogan-style sentence. The case that follows already shows the point.

### robotics-5-4.html | SAFETY
- Text: "One author argues that once the initial risk and the chosen measures are fixed, the residual risk is effectively determined."
- Why: VAGUE. "effectively determined" is unclear. The reader needs to know whether the claim is that the residual risk is fixed, or only that it is very likely.

### robotics-5-5.html | FILLER
- Text: "The direction is clear even if the details are still moving."
- Why: Stock phrasing that asserts clarity without giving the direction. The next paragraphs explain the trend.

### robotics-5-5.html | HYPE
- Text: "These models are exciting, but they were all released between 2023 and 2026"
- Why: "exciting" is an evaluative word with no support. The dates and status already make the point.

### robotics-5-5.html | FILLER
- Text: "The cure is genuine review, not a rubber stamp."
- Why: Slogan-style closing line. It repeats the point of the paragraph before it.

### robotics-5-5.html | AI-ISM
- Text: "Confusion here is real, not hypothetical:"
- Why: Stock "X is real, not hypothetical" construction. The example that follows is concrete, so the lead-in can go.

### robotics-6-1.html | CLUMSY
- Text: "On the Uno R3, pins 0 (RX) and 1 (TX) carry the serial link to the board's USB bridge chip (an ATmega16U2), which some of the processor's pins are reserved for;"
- Why: The relative clause "which some of the processor's pins are reserved for" attaches to the wrong noun and is hard to parse. Split the sentence and name the reserved pins.

### robotics-6-1.html | HYPE
- Text: "The current limit per GPIO pin is a vital distinction for roboticists."
- Why: "vital" is an inflated adjective. The next sentences give the actual limits, which carry the point.

### robotics-6-1.html | HYPE
- Text: "The foundational rule of robot electrical design is:"
- Why: "foundational rule" is a grand label for a wiring instruction. Say "The rule is:" and let the content carry the weight.

### robotics-6-2.html | CLUMSY
- Text: "Producing a true intermediate voltage at motor currents would need extra analog circuitry, such as a Digital-to-Analog Converter (DAC) followed by a power amplifier, and a linear amplifier turns the voltage it drops into heat."
- Why: Two clauses joined by "and", the second one with a new subject. The sentence is hard to follow on first reading.

### robotics-6-2.html | FILLER
- Text: "The calculation is straightforward:"
- Why: Tells the reader how to feel instead of showing the steps. The worked example below does the job.

### robotics-6-3.html | VAGUE
- Text: "As a rule of thumb, choose an encoder whose resolution in edges per revolution is somewhat finer than the smallest positioning error you can accept"
- Why: "somewhat finer" gives no ratio. The example that follows (360 edges for 1 degree) is the useful part, so state the rule as a multiple.

### robotics-6-3.html | CLUMSY
- Text: "the terms PPR, CPR, LPR (lines per revolution on an optical disk) and"
- Why: The sentence lists several terms, a parenthetical and a quoted word, with an opening "However". It is hard to scan. A short table of the terms would be clearer.

### robotics-6-3.html | PADDING
- Text: "Because the two meanings of CPR differ by a factor of 4, a mix-up makes a robot's computed travel distance wrong by exactly four times."
- Why: Restates the warning that comes right before it in different words. "Wrong by exactly four times" is the only new content.

### robotics-6-4.html | CLUMSY
- Text: "Even a microscopic residual steady-state error that lingers over time causes the mathematical integral to steadily grow, progressively increasing the control output until the residual error is driven strictly to zero."
- Why: "steadily grow, progressively increasing" repeats one idea. "microscopic" and "strictly" add emphasis without content. One clear clause would do.

### robotics-6-4.html | VAGUE
- Text: "Many robotics practitioners avoid integral gain altogether and remove steady-state error with feedforward instead."
- Why: "Many robotics practitioners" is an unquantified group. The source cited is a single controller tuning note.

### robotics-6-4.html | PADDING
- Text: "Feedback exists to cope with exactly these disturbances."
- Why: Restates the list of disturbances in the previous sentences. "exactly" adds emphasis, not information.

### robotics-6-5.html | AI-ISM
- Text: "At the heart of every robotic system lies the fundamental cybernetic loop: Sense, Think, Act ."
- Why: Stock opener ("at the heart of ... lies"). The sense-think-act loop can be introduced without the grand framing.

### robotics-6-5.html | FILLER
- Text: "Understanding the exact physical principles, datasheet limits, and noise characteristics of common robotic sensors is essential for building robust autonomous machines."
- Why: "is essential for building robust autonomous machines" is generic. The sentence does not say what the reader will be able to do with the sensor limits.

### robotics-6-5.html | VAGUE
- Text: "Because no single sensor is free from error, professional robotics systems rely on multi-sensor data fusion"
- Why: "professional robotics systems" is an unidentified group. Name the systems or the field, or drop the qualifier.

### robotics-6-6.html | HYPE
- Text: "because odometry is totally self-contained and needs no outside signals."
- Why: "totally" is an intensifier. The next sentence gives the real limitation, so the claim should be stated plainly.

### robotics-6-6.html | CLUMSY
- Text: "If CPR is the number of counts per wheel revolution (after any gearing and after quadrature decoding, which raises the resolution of an incremental encoder [2] ), the distance rolled by each wheel is:"
- Why: A definition nested inside a conditional, with a parenthetical inside that. Move the decoding note to its own sentence.

### robotics-6-6.html | PADDING
- Text: "Borenstein and Feng describe orientation errors as the main concern because, once incurred, they grow without bound into lateral position errors"
- Why: The clause "grow without bound" is repeated in the next sentence and again in the next paragraph. Keep one statement.

### robotics-6-7.html | CLUMSY
- Text: "The addition form can fail near rollover: if stateStart + duration wraps past zero, the comparison becomes true too early (or, in other layouts of the test, never), so the state ends at the wrong time."
- Why: "in other layouts of the test" is unclear. The reader does not know which layouts. Give the one failure case that matters.

### robotics-6-7.html | PADDING
- Text: "Because PackML machines share this vocabulary, plant supervisory software can read the state of machines from different vendors in the same way, which is the interoperability goal ISA states for the report."
- Why: Repeats the point of the previous paragraph (standard state names let vendors' machines report status the same way). "in the same way" and "interoperability" say it a third time.

### robotics-6-7.html | HYPE
- Text: "As robot capabilities grow, this ad hoc approach rapidly degenerates into fragile"
- Why: "rapidly degenerates" is a dramatic verb for a design problem that the next sentences describe calmly. Use a plainer verb.

Checked: robotics-4-1.html, robotics-4-2.html, robotics-4-3.html, robotics-4-4.html, robotics-4-5.html, robotics-4-6.html, robotics-4-7.html, robotics-4-8.html, robotics-4-9.html, robotics-5-1.html, robotics-5-2.html, robotics-5-3.html, robotics-5-4.html, robotics-5-5.html, robotics-6-1.html, robotics-6-2.html, robotics-6-3.html, robotics-6-4.html, robotics-6-5.html, robotics-6-6.html, robotics-6-7.html
