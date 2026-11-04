# Step 39: Cross-Lesson Consistency of Terms (Chapters 6–10)

### hardware interrupt: DRIFT
- 6-3: "Arduino's documentation names reading a rotary encoder as a good use for hardware interrupts: an interrupt lets the board catch every pulse while the main program gets on with other work."
- 10-3: "Connect encoder channels A and B to pins 2 and 3, the two interrupt pins on an Uno."
- Problem: Lesson 6.3 establishes "hardware interrupt" as its key term for counting encoder pulses on Arduino pins 2 and 3, whereas Lesson 10.3 introduces the same mechanism under the key term "interrupt". This drift causes two separate definitions for the same microcontroller feature in the course glossary.
- Suggested fix: In 10-3 keyTerms in course-data.js, rename "interrupt" to "hardware interrupt", and remove the redundant "interrupt" entry from glossary-data.js.

### ROS 2 lifecycle node: DRIFT
- 4-2: "ROS 2 introduced managed nodes, also called lifecycle nodes, implemented in C++ by the rclcpp_lifecycle package."
- 6-7: "Every server in the Nav2 navigation stack is a lifecycle node. A lifecycle node follows a state machine with four primary states and six transition states:"
- Problem: Lesson 4.2 lists "lifecycle node" in its key terms, whereas Lesson 6.7 lists "ROS 2 lifecycle node" for the exact same four-state managed node architecture. This naming variation produces duplicate entries in the glossary.
- Suggested fix: In 6-7 keyTerms in course-data.js, change "ROS 2 lifecycle node" to "lifecycle node", and remove the "ROS 2 lifecycle node" entry from glossary-data.js.

### Behavior Tree: DRIFT
- 3-5: "Nav2 coordinates these planning, control, and recovery steps through behavior trees. Behavior trees arrange tasks into a hierarchy, creating a scalable, human-understandable framework for multi-step applications."
- 6-7: "In ROS 2, the Nav2 stack coordinates navigation with behavior trees run by its BT Navigator, using the BehaviorTree.CPP library."
- Problem: Lesson 3.5 introduces the navigation task model as "behavior tree" (lowercase), while Lesson 6.7 introduces the same Nav2 model under the capitalized key term "Behavior Tree". This casing drift created two separate definitions in the course glossary.
- Suggested fix: In 6-7 keyTerms in course-data.js, change "Behavior Tree" to lowercase "behavior tree" to match Lesson 3.5, and remove the duplicate capitalized entry from glossary-data.js.

### Quality of Service: GLOSSARY
- 4-2: "A frequent cause is a QoS incompatibility, because a connection is only made if the publisher and subscription have compatible QoS profiles."
- 8-5: "MQTT defines three qualities of service for message delivery consisting of At most once, At least once, and Exactly once."
- Problem: Lesson 8.5 lists "Quality of Service" in its key terms, but glossary-data.js defines "Quality of Service" exclusively as MQTT message delivery guarantees (QoS 0, 1, 2), while Lesson 4.2 defines "Quality of Service (QoS)" for ROS 2 / DDS policies. A learner looking up "Quality of Service" in the glossary receives only the MQTT definition.
- Suggested fix: In glossary-data.js, update the "Quality of Service" entry to clarify that the term encompasses both MQTT delivery guarantees and ROS 2 / DDS communication policies, or rename 8-5's key term to "MQTT Quality of Service".

### Ziegler-Nichols: GLOSSARY
- 6-4: "The best-known heuristic method is the Ziegler–Nichols closed-loop tuning method (sometimes called the ultimate-gain method), introduced by John G. Ziegler and Nathaniel B. Nichols in 1942."
- 6-4: "In the Ziegler–Nichols closed-loop tuning method, how is the ultimate gain (Ku) determined?"
- Problem: The key term in course-data.js is spelled with an ASCII hyphen ("Ziegler-Nichols"), but Lesson 6.4 text, section headers, and quiz use a Unicode en-dash ("Ziegler–Nichols"). This caused duplicate entries in glossary-data.js under both punctuation variants.
- Suggested fix: In glossary-data.js, remove the duplicate "Ziegler–Nichols" (en-dash) entry and retain the ASCII hyphen "Ziegler-Nichols" entry matching course-data.js.

### gyroscope drift: GLOSSARY
- 6-5: "In mobile robotics, why does the heading from a gyroscope slowly wander even when the robot's motion is measured correctly? The fundamental cause is that its small bias is integrated along with the rotation rate, so the error keeps growing."
- 6-5: "Integrating the constant bias offset b_gyro gives an error that grows linearly with time, so the computed heading keeps getting worse for as long as the robot runs:"
- Problem: Lesson 6.5 designates "gyroscope drift" as its key term, but glossary-data.js defines both "gyroscope drift" and an orphaned duplicate "gyro drift" (which appears in no lesson's key terms).
- Suggested fix: In glossary-data.js, remove the orphaned "gyro drift" entry and retain "gyroscope drift".

### ultrasonic rangefinder: GLOSSARY
- 6-5: "The classic entry-level distance sensor in mobile robotics is the HC-SR04 ultrasonic rangefinder."
- 6-5: "The sensor operates on the acoustic Time-of-Flight principle:"
- Problem: Lesson 6.5 designates the closed-compound "ultrasonic rangefinder" as its key term, but glossary-data.js defines both "ultrasonic rangefinder" and an orphaned open-compound duplicate "ultrasonic range finder".
- Suggested fix: In glossary-data.js, remove the orphaned open-compound "ultrasonic range finder" entry and retain "ultrasonic rangefinder".

Checked terms: absolute encoder, acoustic whine, acyclic communication, adaptive thresholding, analytic rubric, Arduino Uno, atan2, ATmega328P, attached object, average voltage, backdrive mode, backlighting, barrel distortion, Behavior Tree, BiSS, black channel principle, brake solenoid, cable carrier, cable retraction system, Canny edge detector, carrier frequency, cascaded control, cell monitor, CIP Safety, CMOS battery, coaxial illumination, collision object, common ground, ComputeIK, connector stage, continuity testing, Controller Manager, cooperative multitasking, CPR, cross-polarization, cv_bridge, cyclic communication, Dashboard Server, Data Matrix ECC 200, datafs, dead reckoning, dead zone, demilitarized zone, derivative kick, derivative term, Device Level Ring, differential drive, diffuse dome light, dimensional gauging, disparity, Dual Robot Calibration, duty cycle, elbow-up / elbow-down, energy isolating device, ESD vacuum, EtherCAT, EtherNet/IP, Euclidean cluster extraction, exception response, explicit messaging, extended Kalman filter, exteroceptive sensor, FailSafe over EtherCAT, F-device, feed-forward, fieldbus, fine calibration, finite state machine, flat ring, flight record, flyback protection, f-number, galvanic isolation, generator stage, GenICam, global shutter, GSDML, guard condition, gyroscope drift, hardware interrupt, heading error, histogram equalization, holding register, homing, HSV color space, IEC 61131-3 SFC, IEEE 802.1AS, ILLEGAL DATA ADDRESS, image moments, image_transport, implicit messaging, IMU, incremental encoder, INPUT_PULLUP, integer_to_binary_list, integral term, integral windup, interrupt, innovation, IO-Link, I/O list, ISA/IEC 62443, Jacobian, jerk, Kalman filter, Kalman gain, L298N, law of cosines, LiPo battery, Lost Link Counter, magic files, maintenance log, mbtcp, measurement noise (R), midpoint integration, millis(), ModbusTcpClient, MoveIt Task Constructor, MQTT, MTC stage, non-systematic error, numerical inverse kinematics, Nyquist limit, odometry, optical triangulation, Otsu binarization, PackML, PassThrough filter, PID control, pincushion distortion, pinMode, plumb_bob, point cloud, PPR, predict step, presence verification, preventive maintenance, process noise (Q), Program Correction by Key Waypoints, programState, PROFINET RT, PROFIsafe, proportional term, proprioceptive sensor, protective stop, pulse stretcher, pulse width modulation, quadrature decoding, Quality of Service, quintic time scaling, RANSAC, reactive maintenance, read_port_register, reflectance sensor, revolution counter, robot_localization, robotmode, rolling shutter, rotary encoder, ROS 2 lifecycle node, S-curve profile, SafeMove, Safety Control Board, Safety Network Number, sample time, sensor fusion, sensor_msgs/CameraInfo, sensor_msgs/Image, sequence chart, servo pulse timing, setpoint, sinking, sourcing, spherical wrist, stall current, state transition table, StatisticalOutlierRemoval, stored energy, stress loop, strobe mode, Support File, systematic error, TB6612FNG, telecentric lens, template matching, time parameterization, time scaling, time-of-flight, Timer1, Time-Sensitive Networking, TimeSynchronizer, torque wrench, trapezoidal velocity profile, TRIAC, triangular profile, UMBmark, ultrasonic rangefinder, unlock protective stop, update step, VDMA 40010, VLAN, VoxelGrid filter, wheelbase, Working Counter, Ziegler-Nichols
