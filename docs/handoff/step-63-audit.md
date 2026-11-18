# Step 63 audit: Chapter 1 for a complete newcomer

Report only. Machine-readable findings: `docs/handoff/step-63-findings.json` (7 lessons, with start-here text, optional sections and quoted findings).

## Verdict
Chapter 1 is accurate and well sourced but reads like a short reference book, not a first week. Lessons 1.1 to 1.3 are approachable once jargon is glossed. Lessons 1.4, 1.6 and 1.7 hit a newcomer with formulas, standards numbers and vendor vocabulary before any on-ramp. Almost every lesson opens with statistics or definitions instead of a reason to care. The fix is additive: start-here boxes, optional labels, plain glosses next to jargon, and analogies. Nothing needs cutting.

## Three biggest problems per lesson
- 1.1: (1) The ISO definition and clause detail (lines 228-253) arrive with no plain restatement. (2) Sections 06-07 (dates, Asimov) and 10 (control architectures) are optional but unmarked; 10 pulls in PWM, PID, A*, STRIPS. (3) Terms such as manipulator, axes, encoder and microcontroller are used before any gloss.
- 1.2: (1) A history list dense with names, dates and money (walls at lines 225, 228, 236, 271). (2) The 1970s table and cobot/ROS/DARPA bullets use unexplained terms (direct-drive, gantry, Hough transform). (3) Never says why history helps a beginner.
- 1.3: (1) Spec-sheet numbers (payload, reach, repeatability) appear at line 265 but are defined only at line 305. (2) Collaborative modes (safety) use enabling device and risk assessment before they are explained. (3) Four statistics open the lesson instead of a reason to care.
- 1.4: (1) Opens by naming physics, linear algebra and differential equations, which scares newcomers. (2) The two-link formula and the Jacobian paragraph come before joints and frames exist. (3) Networking (IP, TCP, Modbus, EtherNet/IP, OPC UA) and Linux/ROS release tables are far beyond week one.
- 1.5: (1) Statistics walls (lines 222-227, 305, 411). (2) Jargon: operational stock, palletizing, sonar, high-centered, foundation model. (3) Emotional case studies (World Trade Center, Fukushima) with no framing or skip signal.
- 1.6: (1) Grubler's formula, the arc-minute calculation, ISO 9283 statistics and the 4-point derivation each show formulas without a plain walkthrough. (2) Vendor syntax (robtarget, confdata, zonedata, CNT) dominates sections 08 and 12. (3) No stated reason a beginner needs joints and frames; frames lack an everyday analogy.
- 1.7: (1) The ISO 13855 formula S = K x T + C and the handshake detail are safety-adjacent and unglossed (add plain notes only). (2) The 11-part cell list uses integrator, PLC, HMI, fieldbus and EOAT before they are explained. (3) Sections 06-10 (certification, FAT/SAT, cell types, cost) are optional detail for a first read.

## Ordering problems
- 1.1 sections 09-10 point forward to Ch.6 (PWM, encoders, PID, state machines) before the terms exist; use "you do not need these yet".
- 1.1 and 1.2 use "six-axis", "degree of freedom" and "prismatic" before 1.6 (and 1.3 line 246) explains them.
- 1.3 uses payload, reach, repeatability (line 265) before defining them (line 305); uses enabling device (line 339) before 1.4 and 1.7.
- 1.4 uses pendant, enabling device and lockout before explaining them in the same lesson and previews forward kinematics before 1.6 teaches joints and frames.
- 1.7 uses integrator (line 225), PLC and HMI (lines 250-260) before sections 05-06 define them.
- "TCP" means tool center point in 1.6 and Transmission Control Protocol in 1.4; add a one-line warning.
- Statistics (603,307 robots, density) repeat in 1.1, 1.2, 1.3 and 1.5; keep one full version in 1.5.

## Hardest lessons (most to least)
1. 1.6 Robot Anatomy and Coordinate Frames (formulas, vendor syntax)
2. 1.7 The Industrial Robot Cell (standards, safety formula, protocols)
3. 1.4 Preliminary Requirements (math, networking, version detail)
4. 1.3 Types of Robots (spec sheets, collaborative modes)
5. 1.2 and 1.5 (dense but readable as stories)
6. 1.1 Definition of Robots (easiest; mostly needs glosses)

## Safety notes
Findings marked `"safety": true` (1.3, 1.4, 1.7) propose plain notes next to the exact text only (enabling device, lockout/tagout, teach speed, collaborative modes, light curtain, ISO 13855). No safety wording should be edited.
## Caveats
Glossary gaps seen: manipulator, end-effector (only "end effector"), integrator, HMI, cycle time, FAT, revolute, prismatic, kinematics, quaternion, Jacobian. No later lesson covers Denavit-Hartenberg, SAE levels or Hero of Alexandria, so those optional blocks have no "covered again" pointer.
