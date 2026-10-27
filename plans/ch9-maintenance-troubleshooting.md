# Chapter 9 brief: Maintenance and Troubleshooting

Status: plan (October 2026). Chapters 7 and 8 drafted and reviewed by Claude, awaiting Gerald's review. Order after this: Chapter 10 mobile robots and AMRs.

## Audience and scope
- First-year students and career changers. Builds on 1.6 (gearboxes, repeatability and ISO 9283), 1.7 (the robot cell), 2.5 (I/O), 4.4 (cell safety, lockout), 8.1 (sinking/sourcing wiring) and 8.3 (Modbus lab). Do not repeat those; link back with their real titles (see "Lesson titles" below).
- Industrial focus: what a technician does to keep a robot cell running, and how to find a fault quickly and safely.

## Lessons
- 9.1 Preventive maintenance: why scheduled maintenance; what robot manuals list (inspection intervals, lubrication or grease changes, backup battery replacement, cable and dress pack checks); keeping a maintenance log.
- 9.2 A troubleshooting method: safety first (lockout/tagout, link 4.4), gather symptoms, read the controller's error log and codes (UR log and error codes, ABB event log, FANUC alarm codes), form and test one hypothesis at a time, record the fix.
- 9.3 Mechanical problems: wear, backlash and repeatability loss (link 1.6), collision damage, brakes, cables and connectors, end effector and vacuum faults.
- 9.4 Electrical and I/O faults: checking 24 V supplies and fuses, using a multimeter on I/O (link 8.1), field devices that do not switch, encoder and communication errors, network faults (link 8.1, 8.6).
- 9.5 Calibration, backups and recovery: zero/mastering or joint calibration after a motor or encoder change, re-teaching a TCP, program and configuration backups, restoring after a failure.
- 9.6 Lab: check a robot's state from Python. Students query a stand-in for the UR Dashboard Server (port 29999) with documented commands such as robot mode and safety status, write a small health-check script, and practice reading the answers as a technician would. No hardware; the code is run and tested by Claude before it goes in the lesson.

## Lesson titles to link (real titles)
1.6 Robot Anatomy and Coordinate Frames; 1.7 The Industrial Robot Cell; 2.5 End-of-Arm Tooling and I/O; 4.4 Making a Robot Cell Safe; 8.1 From Wires to Networks; 8.3 Lab: Connecting a Robot to a PLC; 8.6 Network Design, Security and Diagnostics.

## Primary sources to look for
- Robot vendors: Universal Robots service manuals and support articles (maintenance schedule, log, error codes, Dashboard Server commands), ABB product manuals (maintenance schedule, event log), FANUC public maintenance and alarm documentation, KUKA where public.
- Safety: OSHA lockout/tagout (29 CFR 1910.147) pages, OSHA robotics pages.
- Maintenance practice: NIST or university pages on preventive and predictive maintenance; Fluke application notes on multimeter use.

## Workflow (same as Chapter 8)
Step 20 candidate URLs (Gemini lists, Claude fetches and fills gaps), step 21 facts from cached pages only, step 22 drafting one lesson per run with the real lesson titles given, step 23 Claude review.
Rules from the Chapter 7 and 8 reviews also apply: no repeated facts, no empty "For example", no filler intensifiers, labs run without hardware, cross-references only with real titles and only for what that lesson teaches, no invented numbers or example data presented as fact, objectives no bigger than the lesson.
