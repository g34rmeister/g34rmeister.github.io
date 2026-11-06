# Step 45: slop audit, batch 3 (lessons 6-8 to 9-6, live site)

### robotics-6-8.html | HYPE
- Text: "Two vital insights emerge from these calculations:"
- Why: "vital" is an inflated adjective; the insights could simply be stated.

### robotics-6-8.html | HYPE
- Text: "The premier algorithmic framework for sensor fusion in robotics is the Kalman filter ."
- Why: "premier" is a superlative with no comparison behind it.

### robotics-6-8.html | HYPE
- Text: "Notice the crucial architectural pattern in handleSensors() : predict() is called continuously at the high odometry rate (e.g. 50 Hz)."
- Why: "crucial" announces importance instead of showing it; the sentence then describes ordinary code.

### robotics-6-8.html | FILLER
- Text: "To develop concrete numerical intuition, examine a one-dimensional robot driving along a hallway."
- Why: stock framing sentence; the lesson can start with the robot and the numbers.

### robotics-6-8.html | CLUMSY
- Text: "Sensor fusion is the mathematical process of combining measurements from multiple disparate sensors such that the resulting state estimate has lower uncertainty than either source alone (Section 04 shows this with numbers)."
- Why: one long sentence stacks a definition, a qualifier and a cross-reference; "disparate" adds nothing a reader needs.

### robotics-6-8.html | CLUMSY
- Text: "the filter derives 98% of its angular estimate from integrated gyroscope velocity, using the accelerometer's gravitational reading for the remaining 2% to gently cancel accumulated gyro drift on every pass without running matrix algebra."
- Why: a 36-word clause packs the weights, the mechanism and the benefit together; split it after "velocity".

### robotics-6-9.html | VAGUE
- Text: "A bigger zone is faster and smoother but stays farther from the point; forum users give the same advice to robots that hesitate at fine points."
- Why: "forum users give the same advice" is an unsourced appeal to crowd opinion, with no concrete reader action.

### robotics-6-9.html | FILLER
- Text: "There is a physical reason to care, and it ties back to this chapter."
- Why: announces a point without making it; the next sentence is the reason.

### robotics-6-9.html | VAGUE
- Text: "The choice of path has a practical side effect that every robot programmer meets."
- Why: "every robot programmer meets" is a generalization with no example; the section then explains a specific case.

### robotics-6-9.html | CLUMSY
- Text: "That is right where the gripper must open, and wasteful everywhere else."
- Why: "That" has no clear referent; it means the stop points, which should be named.

### robotics-6-9.html | PADDING
- Text: "The Modern Robotics code library is built this way."
- Why: restates the preceding sentence ("Any profile can drive any path") without adding information.

### robotics-6-10.html | CLUMSY
- Text: "This lesson works through the complete math for the same arm: where the formulas come from, which targets it can reach, how to write inverse kinematics code that does not break at the edges"
- Why: a long colon-led list of four topics in one sentence; a reader has to hold the list to parse it.

### robotics-6-10.html | FILLER
- Text: "These edge cases are not only academic."
- Why: says the topic matters without saying why; the next sentences show the practical stakes, so the line is redundant.

### robotics-6-10.html | VAGUE
- Text: "Peter Corke's Robotics Toolbox for Python offers a fast C++ numerical IK solver"
- Why: "fast" is unquantified; the README figure given later is the concrete claim the reader needs.

### robotics-6-10.html | VAGUE
- Text: "Treat these two counts as reported figures: they come from summaries of the sources, and a standard robotics textbook is the place to confirm them."
- Why: hedge is honest but wordy; the reader needs the specific source for the counts, not a pointer to "a textbook".

### robotics-7-1.html | PADDING
- Text: "During image acquisition with a global shutter, all sensor pixels start and stop exposing at the same time."
- Why: restates the previous sentence ("exposure occurs simultaneously across the entire detector array").

### robotics-7-1.html | FILLER
- Text: "The focal length of an optical lens is a fundamental parameter that describes how strongly it focuses or diverges light."
- Why: definitional filler; the previous sentence already calls it the most fundamental property, and the next explains its effect.

### robotics-7-1.html | FILLER
- Text: "Controlling this aperture is essential for balancing optical signal intensity against image sharpness."
- Why: "essential for balancing" is a generic trade-off sentence; the following paragraph gives the actual trade-off.

### robotics-7-1.html | HYPE
- Text: "Because every pixel captures the scene during the exact same temporal window, global shutters are essential for dynamic industrial scenes."
- Why: "essential" overstates; the next sentences give a concrete case, so the adjective is not needed.

### robotics-7-1.html | FILLER
- Text: "In machine vision, the choice between global shutter and rolling shutter sensor architectures is one of the most critical decisions an automation engineer makes."
- Why: "one of the most critical decisions" is an inflated opener; the section that follows shows the choice.

### robotics-7-1.html | CLUMSY
- Text: "The mathematical relationship between aperture diameter, area, and throughput governs standard lens iris markings."
- Why: "governs ... markings" is vague about what the reader should learn; the next sentence explains the stop markings directly.

### robotics-7-2.html | CLUMSY
- Text: "Because light from the illumination panel passes straight around the object into the camera aperture, the background appears near saturation (pure white) while the opaque object blocks all transmission, appearing as a deep black profile."
- Why: 37 words, with two clauses joined by "while" and a trailing participle; split into two sentences.

### robotics-7-2.html | PADDING
- Text: "This geometry maximizes optical contrast between the object boundary and its surroundings."
- Why: restates the sentence before it ("creates ... high contrast ... as an opaque silhouette").

### robotics-7-2.html | PADDING
- Text: "When a defect breaks the surface, the contrast is strong."
- Why: repeats the previous sentence ("Darkfield lighting produces high contrast for surface flaws"); the next sentence adds the mechanism.

### robotics-7-2.html | FILLER
- Text: "Inspecting curved, highly reflective objects presents one of the most difficult challenges in machine vision."
- Why: superlative framing with no example; the section that follows is the content.

### robotics-7-2.html | FILLER
- Text: "In industrial factories, ambient lighting is rarely static."
- Why: "rarely" is unquantified and the sentence only sets up the filter topic; the example that follows carries the point.

### robotics-7-3.html | FILLER
- Text: "Understanding output dimensions is essential for memory allocation and coordinate mapping."
- Why: "essential" is generic; the paragraph then explains the output size rule, which is the content.

### robotics-7-3.html | VAGUE
- Text: "The most widely used edge detection pipeline in industrial computer vision is the multi-stage Canny edge detector."
- Why: superlative about industry usage with no citation; either cite it or say "a common choice".

### robotics-7-3.html | CLUMSY
- Text: "The statistics matrix returned by connected component labeling gives physical parameters for every contiguous island of pixels in the image."
- Why: the values are pixel quantities, not physical ones; "physical parameters" is wrong and confusing.

### robotics-7-3.html | CLUMSY
- Text: "Illumination directly dictates the quality of the raw histogram before software equalization is even applied."
- Why: "directly dictates" plus "even applied" is inflated phrasing; the point is that lighting sets histogram quality before equalization.

### robotics-7-3.html | FILLER
- Text: "Binarization is the foundation of many industrial vision tasks."
- Why: "foundation of many" is a generic claim; the next sentence defines binarization, which is the useful content.

### robotics-7-3.html | CLUMSY
- Text: "Before any coordinate shift or pose calculation can occur, the raw image stream must be processed to reveal recognizable geometric features."
- Why: a long lead-in clause delays the main verb; "recognizable" is vague.

### robotics-7-4.html | CLUMSY
- Text: "Structured light and stereo vision qualify as 3D sensing because they calculate depth through deterministic geometry from a calibrated physical baseline, whereas neural network inference predicts 3D structure from 2D images without geometric anchors."
- Why: a 34-word sentence with three stacked modifiers before the contrast; two sentences would read better.

### robotics-7-4.html | FILLER
- Text: "Deploying 3D sensing in a robotic workstation requires integrating hardware acquisition, point cloud filtering, and robot kinematics into an automated pipeline."
- Why: stacked nouns say what a pipeline is without saying what the reader must do; the section that follows is the content.

### robotics-7-4.html | VAGUE
- Text: "Production demands impose strict timing constraints on 3D perception pipelines."
- Why: "strict timing constraints" is vague; the next sentence gives the actual cycle-time numbers, so this line only pre-announces them.

### robotics-7-4.html | PADDING
- Text: "Direct sensing computes distance from a known, calibrated geometry instead."
- Why: repeats the point made in the section's opening paragraph ("depth through deterministic geometry") in new words.

### robotics-7-4.html | FILLER
- Text: "In these unstructured environments, cameras must measure not only horizontal and vertical position, but also true physical depth and three-dimensional spatial orientation."
- Why: "true physical depth" is filler wording; the sentence says the same thing as the section heading.

### robotics-7-5.html | FILLER
- Text: "Both types of inspection errors carry substantial industrial costs."
- Why: says costs matter without a number; the two paragraphs that follow give the costs.

### robotics-7-5.html | CLUMSY
- Text: "Automated inspection reduces manufacturing visual inspection errors, which comprise missing existing defects and false alarms that trigger unnecessary scrap and production waste."
- Why: "errors, which comprise ..." makes the reader unpack a relative clause to learn what the errors are; name the two error types first.

### robotics-7-5.html | CLUMSY
- Text: "No lens passes fine detail perfectly, and how well it keeps the bars apart is measured as contrast."
- Why: "how well it keeps the bars apart" is an awkward stand-in for contrast; say "contrast" and define it.

### robotics-7-5.html | FILLER
- Text: "Lighting matters as much as the lens (see 7.2)."
- Why: a general claim that adds nothing the cross-reference does not already say; the section's lighting content follows.

### robotics-7-6.html | AI-ISM
- Text: "Bridging the gap between ROS 2 message buffers and OpenCV image matrices is the primary role of the cv_bridge library."
- Why: "bridging the gap" is a stock phrase; say what cv_bridge converts.

### robotics-7-6.html | HYPE
- Text: "Understanding the distinction between width × bytes_per_pixel and the step field is vital for robust memory handling."
- Why: "vital" and "robust" are inflated; the example that follows shows why the step field matters.

### robotics-7-6.html | HYPE
- Text: "Furthermore, robust industrial nodes wrap conversion calls inside try...except CvBridgeError blocks."
- Why: "robust industrial nodes" is marketing-style wording; say that the node catches conversion errors.

### robotics-7-6.html | VAGUE
- Text: "Distributing high-resolution image streams across a ROS 2 network introduces significant bandwidth and latency challenges."
- Why: "significant ... challenges" names no size; the next sentence's 180 MB/s figure is the concrete content.

### robotics-7-6.html | VAGUE
- Text: "In a robot cell, the camera is often the robot's main way of seeing what has changed."
- Why: "main way of seeing what has changed" is vague; the sentence could say what the camera detects.

### robotics-7-6.html | HYPE
- Text: "A robust ROS 2 vision architecture separates hardware device drivers from high-level computer vision processing."
- Why: "robust" is used without saying what it guards against; the separation itself is the point.

### robotics-8-1.html | CLUMSY
- Text: "Because current flows in one direction through solid-state switches and optical isolators, understanding how current enters and exits each terminal is necessary when wiring devices to a PLC or robot controller."
- Why: the cause, the requirement and the context are stacked in one sentence; put the "why" after the requirement.

### robotics-8-1.html | CLUMSY
- Text: "Industrial versions of standard Ethernet hardware, such as managed and unmanaged switches, helped by improving speed and determinism and reducing data collisions."
- Why: "helped by ... and ... and" is a stacked, hard-to-parse sentence; the subject is the switches, so the verb "helped" needs a clearer object.

### robotics-8-1.html | FILLER
- Text: "Understanding modern industrial networking begins with these direct current (DC) circuits that interface field devices to programmable logic controllers (PLCs)."
- Why: "Understanding ... begins with" is a throat-clearing opener; the section then explains DC circuits directly.

### robotics-8-2.html | CLUMSY
- Text: "Explicit messages contain explicit descriptions of the requested service, the object class, the instance number, and the attribute identifier."
- Why: "explicit ... explicit" repeats the word for no gain; the list is what the reader needs.

### robotics-8-2.html | CLUMSY
- Text: "Modern manufacturing facilities require supervisory IT systems, diagnostic web pages, and engineering tools to connect to production machinery without disrupting production."
- Why: "without disrupting production" repeats "production" from the same clause; the sentence is also a list-heavy subject before its verb.

### robotics-8-2.html | VAGUE
- Text: "Each category uses a different transport-layer protocol to match its functional requirements."
- Why: "its functional requirements" is vague; name the difference (UDP for cyclic I/O, TCP for explicit messages).

### robotics-8-2.html | VAGUE
- Text: "They differ in how they structure process data, bypass protocol overhead, and achieve real-time response."
- Why: "real-time response" is generic; the lesson does not say what response time each protocol gives in this sentence.

### robotics-8-3.html | CLUMSY
- Text: "Inside the controller memory space, the lower range of general-purpose boolean, integer, and float registers on the robot is reserved for PLC fieldbus interface usage."
- Why: "the lower range of general-purpose ... registers" stacks four modifiers before the verb; state the register range first.

### robotics-8-3.html | CLUMSY
- Text: "When a cell needs to exchange numbers as well as on/off signals (recipe numbers, part counts, error codes), separate wires for each signal stop being practical, so robot controllers also offer network interfaces."
- Why: the parenthetical list and the "so" clause make the main point hard to find; put the conclusion first.

### robotics-8-3.html | VAGUE
- Text: "When developing multi-threaded programs, developers must take precautions with shared network resources."
- Why: "take precautions" names no precaution; the next sentence gives the one that matters (serialize calls with a lock or queue).

### robotics-8-4.html | SAFETY
- Text: "This independence gives automation designers flexibility when laying out manufacturing systems."
- Why: filler; the preceding sentence already says the channel is independent of the medium, and "flexibility" is not defined.

### robotics-8-4.html | SAFETY
- Text: "Lesson 5.4 covers how those safety functions are chosen; this lesson covers how their signals can share a network."
- Why: filler roadmap sentence that repeats the lesson scope already given in the section opener.

### robotics-8-5.html | FILLER
- Text: "Understanding how IO-Link, industrial Ethernet, OPC UA, MQTT, and ROS 2 function together allows integrators to build cohesive automation systems."
- Why: "cohesive automation systems" is a generic closing claim; the summary sentence after it does the work.

### robotics-8-5.html | PADDING
- Text: "Deterministic fieldbuses handle motion, IO-Link connects sensors, OPC UA standardizes machine-to-machine modeling, MQTT streams enterprise telemetry, and ROS 2 delivers advanced perception and path planning."
- Why: a one-line recap of each section just read, with no new information.

### robotics-8-6.html | CLUMSY
- Text: "Placing corporate-accessible components in a DMZ ensures that no direct communication paths are required from the corporate network to the control network."
- Why: a double negative ("no ... are required") makes the claim slower to read; say "the corporate network needs no direct path to the control network".

### robotics-8-6.html | FILLER
- Text: "Once the robot, PLC and other devices share a network, that network also has to be protected against attacks."
- Why: states the obvious and uses a long clause; the section's content (zones, DMZ) follows immediately.

### robotics-9-1.html | FILLER
- Text: "It is a good example of what a robot maker's maintenance checklist looks like."
- Why: praise of the example instead of showing what the checklist contains; the list that follows is the content.

### robotics-9-1.html | PADDING
- Text: "In other words, the maintenance log and the sensor data have to be kept together, so that someone can see which readings came before which failures."
- Why: "In other words" restates the previous sentence ("failure prediction success remains low unless failure data is systematically collected").

### robotics-9-1.html | CLUMSY
- Text: "Universal Robots recommends sending a cobot for a service check at a regional service center at least bi-annually."
- Why: "bi-annually" is ambiguous (twice a year or every two years); write "every six months" or "twice a year".

### robotics-9-2.html | CLUMSY
- Text: "Never change multiple variables at the same time—such as re-teaching points, modifying acceleration rates, swapping cables, and adjusting mechanical stops simultaneously."
- Why: "at the same time" and "simultaneously" say the same thing; drop one and shorten the list.

### robotics-9-2.html | CLUMSY
- Text: "we saw that a robot arm operates as part of an integrated system comprising the manipulator, controller, end effector, part fixtures, and supervisory programmable logic controllers (PLCs)."
- Why: five-item list in a single clause; "integrated system" adds nothing the list does not show.

### robotics-9-2.html | FILLER
- Text: "A troubleshooting task is not finished when the robot begins moving again."
- Why: a generic framing line; the section then describes the documentation step, which is what the reader needs.

### robotics-9-3.html | FILLER
- Text: "This lesson looks at what wears or breaks in that hardware and how to recognize it."
- Why: roadmap sentence that says what the lesson will do rather than what the reader will learn.

### robotics-9-3.html | VAGUE
- Text: "Providing an adequate bend radius increases cable life by allowing the cable to absorb bending energy over a greater length."
- Why: "adequate" gives no value; the reader needs the minimum bend radius or where to find it in the cable datasheet.

### robotics-9-4.html | FILLER
- Text: "Sensors are a common fault point."
- Why: generic opener; the next paragraph states the actual failure cause, so this line adds nothing.

### robotics-9-4.html | PADDING
- Text: "Network faults are the last group."
- Why: roadmap line that only restates the section structure.

### robotics-9-5.html | FILLER
- Text: "Programs, settings and calibration data live on the controller's storage card, so backups matter."
- Why: "so backups matter" is a bland conclusion; the backup steps that follow carry the point.

### robotics-9-5.html | FILLER
- Text: "The load data (mass and center of gravity) matters too."
- Why: "matters too" says importance without a reason; the next sentence gives the collision-detection reason.

### robotics-9-5.html | CLUMSY
- Text: "Having the correct tool load defined in tool data is most important when using collision detection functionality."
- Why: "most important" is vague and the sentence is long; say what goes wrong when the load is wrong.

### robotics-9-6.html | PADDING
- Text: "The recovery script connects to the stand-in server, reads the initial greeting line, and checks safetystatus"
- Why: describes the code that was just shown line by line; the reader can read the script directly.

### robotics-9-6.html | CLUMSY
- Text: "Rather than transmitting binary fieldbus datagrams, the Dashboard Server accepts human-readable text commands and replies with plain text strings."
- Why: "human-readable text" and "plain text strings" say the same thing; drop one.

### robotics-9-6.html | FILLER
- Text: "Communication with the Dashboard Server follows a simple stream format."
- Why: "a simple stream format" is vague; the next sentence says the real rule (newline-terminated commands).

Checked: robotics-6-8.html, robotics-6-9.html, robotics-6-10.html, robotics-7-1.html, robotics-7-2.html, robotics-7-3.html, robotics-7-4.html, robotics-7-5.html, robotics-7-6.html, robotics-8-1.html, robotics-8-2.html, robotics-8-3.html, robotics-8-4.html, robotics-8-5.html, robotics-8-6.html, robotics-9-1.html, robotics-9-2.html, robotics-9-3.html, robotics-9-4.html, robotics-9-5.html, robotics-9-6.html
