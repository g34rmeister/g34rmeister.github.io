# Chapter Coherence Audit: Chapters 6 and 7

### CONTRADICTION: Chapter 7 course placement claims to follow Chapter 10
- Where: robotics-vision.html, section "02. Place in the course"
- Text: "Chapter 7 follows the Chapter 10 capstone projects and builds directly on Lesson 2.8 Vision-Guided Picking as well as the ROS 2 programming concepts established in Chapter 4."
- Why it matters: Chapter 7 precedes Chapter 10 and directly follows Chapter 6 Control Systems in the course progression.
- Suggested fix: Replace "follows the Chapter 10 capstone projects" with "follows Chapter 6 Control Systems".

### GAP: Chapter 6 overview omits lessons 6.9 and 6.10 from learning objectives
- Where: robotics-control.html, section "02. What you will learn"
- Text: "Kalman filters: blending a prediction with noisy measurements to get a better estimate."
- Why it matters: Section 02 lists only eight topics ending at Kalman filters, omitting the chapter's final two lessons (6.9 Motion Profiles and Interpolation and 6.10 Kinematics of a 2-Link Arm) from the overview.
- Suggested fix: Add bullet points for motion profiles and 2-link planar arm kinematics to Section 02.

### REPEAT: Blocking delay() versus non-blocking millis() timing
- Where: 6.7, section "04. Non-blocking timing: why delay() is fatal in robotics" (and 6.1, section "08. Sketch structure and non-blocking sensor timing")
- Text: "In introductory microcontroller tutorials, pauses are commonly implemented using the built-in Arduino delay() function. However, using delay() inside autonomous robot code is dangerous. The delay() function is a blocking call:"
- Why it matters: The rationale for avoiding blocking delay() calls, its danger to e-stops and sensors, and the millis() cooperative multitasking pattern are explained from scratch in 6.7 without referencing the coverage already provided in 6.1.
- Suggested fix: Replace the general delay() and millis() explanation in 6.7 with a brief cross-reference to 6.1 Section 08, focusing on state-entry timestamp evaluation.

### REPEAT: HC-SR04 ultrasonic sensor operating principle and timing cycle
- Where: 6.5, section "03. Acoustic ranging: HC-SR04 ultrasonic sensor" (and 6.1, section "08. Sketch structure and non-blocking sensor timing")
- Text: "The classic entry-level distance sensor in mobile robotics is the HC-SR04 ultrasonic rangefinder. The module has two ultrasonic transducers: a transmitter and a receiver."
- Why it matters: The 10-microsecond trigger pulse, 40 kHz burst, speed of sound calculation, and echo timing are explained in full detail in 6.1 and then re-introduced from scratch in 6.5 without building on the prior lesson.
- Suggested fix: In 6.5 Section 03, reference the timing sketch in 6.1 Section 08 and focus on acoustic sensor properties like cone angle, specular reflection, and cycle spacing.

### TONE: Embedded quiz questions in sensor descriptions
- Where: 6.5, section "03. Acoustic ranging: HC-SR04 ultrasonic sensor" (also section "04. Optical distance sensing", section "06. The mathematics of gyroscope drift")
- Text: "According to its datasheet, roughly how wide is the HC-SR04 ultrasonic sensor's measuring angle? The datasheet specifies a measuring angle of about 15 degrees."
- Why it matters: Multiple paragraphs break the expository textbook tone by embedding verbatim quiz questions and bolded answers directly into the narrative.
- Suggested fix: Rephrase question-and-answer pairs into direct declarative statements.

### REPEAT: Contrast definition repeated across multiple lessons in Chapter 7
- Where: 7.3, section "02. Grayscale histograms, contrast, and equalization" (and 7.1, section "02. Pixel size, resolution, and sensor performance", 7.5, section "02. Optical resolution and the Nyquist sampling limit")
- Text: "Contrast is defined as how well black can be distinguished from white at a given resolution, quantified by the difference between maximum and minimum intensities divided by their sum."
- Why it matters: The identical definition and formula for contrast is duplicated verbatim in three separate lessons within the same chapter without referencing the earlier introduction.
- Suggested fix: In 7.3 and 7.5, refer back to 7.1 Section 02 for the definition of contrast rather than repeating it verbatim.

### REPEAT: Nyquist sampling limit defined from scratch in gauging lesson
- Where: 7.5, section "02. Optical resolution and the Nyquist sampling limit" (and 7.1, section "02. Pixel size, resolution, and sensor performance")
- Text: "The Nyquist limit represents the highest spatial frequency a sensor can sample and equals two pixels per line pair. Sampling requires at least one pixel on the bright bar and one pixel on the dark bar."
- Why it matters: The Nyquist criterion requiring two pixels per line pair is explained from scratch in 7.5 with a dedicated diagram without acknowledging that 7.1 Section 02 already taught it.
- Suggested fix: In 7.5 Section 02, reference 7.1's explanation of the Nyquist limit and focus on how it constrains tolerances in dimensional gauging.

### REPEAT: Optical distortion definition and modes
- Where: 7.5, section "04. Optical distortion and software calibration" (and 7.1, section "04. Lens optics: focal length and field of view")
- Text: "Distortion is an optical aberration that misplaces image information geometrically without blurring or discarding information, allowing it to be calibrated and corrected in software."
- Why it matters: The definition of distortion and its classification into barrel and pincushion modes in 7.1 Section 04 are repeated word-for-word in 7.5 Section 04 without cross-referencing.
- Suggested fix: In 7.5 Section 04, replace the duplicate definition with a brief link to 7.1 Section 04 and focus directly on calibration dot targets and software rectification.

Checked:
- robotics-control.html
- robotics-6-1.html
- robotics-6-2.html
- robotics-6-3.html
- robotics-6-4.html
- robotics-6-5.html
- robotics-6-6.html
- robotics-6-7.html
- robotics-6-8.html
- robotics-6-9.html
- robotics-6-10.html
- robotics-vision.html
- robotics-7-1.html
- robotics-7-2.html
- robotics-7-3.html
- robotics-7-4.html
- robotics-7-5.html
- robotics-7-6.html
