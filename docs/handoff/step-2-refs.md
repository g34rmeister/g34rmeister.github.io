# Step 2 input: Chapter 5 partial refs

### 5-1:11
- Source: Arduino, “Digital Pins,” Arduino Docs . docs.arduino.cc/learn/microcontrollers/digital-pins/ .
- URLs: https://docs.arduino.cc/learn/microcontrollers/digital-pins/
- Reviewer note: Standard Arduino behaviour
- Cited for:
  - When a digital pin is configured with pinMode(pin, INPUT) and nothing is connected to it, the pin is a floating input . In this high-impedance state it picks up electrical noise from its surroundings and reports seemingly random changes between HIGH and LOW.
  - To prevent floating inputs when connecting mechanical switches or bumpers, roboticists configure the pin as pinMode(pin, INPUT_PULLUP) . This turns on a pull-up resistor inside the microcontroller (between 20 k\(\Omega\) and 50 k\(\Omega\) on most AVR-based boards), which holds the pin at HIGH when the switch is open.
  - When the robot's bumper switch closes, it connects the pin to Ground and the pin reads LOW, so the logic is inverted: LOW means pressed.
  - A beginner mistake in robotics is wiring a DC motor or large hobby servo directly to an Arduino GPIO pin. Arduino's own documentation notes that a pin's current is not enough to run most relays, solenoids or motors, and that short circuits or high-current loads on a pin can damage or destroy the pin or even the whole chip.
  - Even small DC gearmotors need far more than this when running, and much more again when starting or stalled, so they must be fed from a driver circuit, not from a pin.
  - How should you power a DC motor in an Arduino robot? The foundational rule of robot electrical design is: from a separate battery through a motor driver, with grounds connected . Arduino's Servo library documentation gives the same advice for servos, which draw considerable power: use a separate supply and be sure to connect the grounds of the Arduino and the external supply together.
  - The reason is that voltage is not an absolute quantity: it is a difference in electrical potential between two points. When the Arduino sets digital pin 9 HIGH (5 V), that 5 V is measured relative to the Arduino's own Ground pin. If the motor driver's logic does not share that same Ground, it has no reference for deciding whether pin 9 is at 5 V or 0 V. Its control inputs effectively float, pick up noise and can switch unpredictably, just like the floating inputs described in Section 03.

### 5-2:1
- Source: T. Hirzel, “Basics of PWM (Pulse Width Modulation),” Arduino Docs . docs.arduino.cc/learn/microcontrollers/analog-output/ .
- URLs: https://docs.arduino.cc/learn/microcontrollers/analog-output/
- Reviewer note: Standard Arduino text, quote unchecked
- Cited for:
  - Digital microcontroller pins are binary: an output is either fully on (the board's supply voltage, such as 5 V on an Uno or 3.3 V on boards like the MKR family) or fully off (0 V).
  - The standard solution is Pulse Width Modulation (PWM) , "a technique for getting analog results with digital means".
  - Instead of outputting a steady partial voltage, a pin switches rapidly between 0 V and the full supply voltage. Changing the fraction of time the signal stays on simulates voltages between 0 V and the supply.
  - A periodic square wave has two basic variables: its period \(T\) (the duration of one complete cycle in seconds, or frequency \(f = 1/T\) in hertz) and the on-time \(t_{on}\) within each period.
  - The duty cycle \(D\) is the fraction of each period during which the signal is HIGH:
  - As a percentage, a 0% duty cycle is always off, a 50% duty cycle is on for half of each period, and a 100% duty cycle is always on.
  - The effective average voltage \(V_{avg}\) across the load is the duty cycle times the supply voltage \(V_{cc}\):
  - The value runs on a 0 to 255 scale: 255 means always on and 127 means on about half the time.
  - Controlled Variable Average motor voltage, and so motor speed
  - Signal Metric Duty cycle (0% to 100%)

### 5-2:4
- Source: Arduino, “Secrets of Arduino PWM,” Arduino Docs (adapted from an article originally published at arcfn.com). docs.arduino.cc/tutorials/generic/secrets-of-arduino-pwm/ .
- URLs: https://docs.arduino.cc/tutorials/generic/secrets-of-arduino-pwm/
- Reviewer note: (none)
- Cited for:
  - Generating PWM by toggling a pin in software (with loops and short delays) ties up the processor and is disturbed whenever an interrupt runs. Microcontrollers instead generate PWM with hardware timer/counter peripherals : once configured, the timer's output-compare hardware switches the pin by itself on every timer cycle.
  - On the Arduino Uno R3 (ATmega328P) , PWM comes from three hardware timers across six pins. The Arduino core sets the prescaler of all three timers to 64, so each timer counts at \(16\text{ MHz} / 64 = 250\text{ kHz}\).
  - Timer0 (8-bit): Drives PWM on pins 5 and 6 in Fast PWM mode, which counts from 0 to 255 and restarts, giving \(16\text{ MHz} / (64 \times 256) \approx 976.56\text{ Hz}\) (listed by Arduino as 980 Hz).
  - Timer0 also drives millis() and delay() , so changing its settings breaks sketch timekeeping.
  - Timer1 (16-bit): Drives PWM on pins 9 and 10 . The Arduino core puts it in 8-bit Phase-Correct PWM mode, which counts up to 255 and back down to 0 (510 clock steps per cycle), giving \(16\text{ MHz} / (64 \times 510) \approx 490.20\text{ Hz}\) (listed as 490 Hz). Counting up and then down makes the pulses more symmetrical than Fast PWM.
  - Timer2 (8-bit): Drives PWM on pins 3 and 11 , also in Phase-Correct PWM mode with a prescaler of 64, so it too runs at about 490.20 Hz (490 Hz).
  - Why does calling myServo.attach() on an Arduino Uno R3 disable analogWrite() PWM on pins 9 and 10? Because the Servo library takes over Timer1: it switches the timer to normal counting mode with a prescaler of 8 and uses its output-compare interrupt to end each servo pulse, so Timer1 can no longer produce the PWM outputs on pins 9 and 10.
  - If you try to drive a motor driver with analogWrite(9, speed) while the Servo library is in use, pin 9 will not produce the expected PWM signal. So, when an Uno robot uses servos, put the motor PWM lines on pins 3, 5, 6 or 11, which are driven by Timer0 and Timer2.

### 5-2:9
- Source: Pololu Robotics & Electronics, “PWM frequency and noise,” Pololu Forum (reply by Pololu staff), May 2012. forum.pololu.com/t/pwm-frequency-and-noise/4636 .
- URLs: https://forum.pololu.com/t/pwm-frequency-and-noise/4636
- Reviewer note: (none)
- Cited for:
  - Carrier Frequency 490 Hz or 980 Hz on an Uno by default, or ultrasonic (above 20 kHz) with a reconfigured timer
  - When DC motors are driven at the standard Arduino PWM frequencies (490 Hz or 980 Hz), robots often emit an annoying whine at the PWM frequency.
  - Pololu's engineers note that the best way to reduce PWM-related motor whine is an ultrasonic PWM frequency, such as 20 kHz, above the range of human hearing.

### 5-2:15
- Source: Texas Instruments, DRV8833 Dual H-Bridge Motor Driver , datasheet SLVSAR1E, revised July 2015. ti.com/product/DRV8833 .
- URLs: https://www.ti.com/product/DRV8833
- Reviewer note: The 10-30% loss figure not found in extracted text
- Cited for:
  - For a small driver such as the DRV8833, TI notes that conduction (on-resistance) loss usually dominates and switching losses are typically 10% to 30% of it, so check the driver's thermal limits when you raise the frequency.
  - MOSFET drivers such as the DRV8833 instead let the recirculating current flow through the output transistors' body diodes (fast decay) or through the shorted winding (slow decay).

### 5-3:5
- Source: NI, “Incremental Encoder Measurements,” NI-9361 Getting Started manual. ni.com/docs/en-US/bundle/ni-9361-getting-started/page/inc-encoder-measurement.html .
- URLs: https://www.ni.com/docs/en-US/bundle/ni-9361-getting-started/page/inc-encoder-measurement.html
- Reviewer note: (none)
- Cited for:
  - a counter can reload a known value when the index signal appears.
  - The controller looks at which channel leads: when A leads B, the count increments, and when B leads A, it decrements.
  - Forward Rotation: Channel A leads Channel B by 90 degrees, so when Channel A has a rising edge (LOW to HIGH), Channel B is still LOW.
  - Reverse Rotation: Channel B leads Channel A by 90 degrees, so when Channel A has a rising edge, Channel B is already HIGH.
  - The resolution you get from a quadrature encoder depends on the decoding mode used by the counter or software:
  - X1 Decoding: The counter counts one edge of Channel A per cycle, so the counts per revolution (CPR) equal the encoder's pulses per revolution (PPR): \(\text{CPR} = \text{PPR} \times 1\).
  - X2 Decoding: The counter counts both the rising and the falling edges of Channel A, giving two counts per cycle: \(\text{CPR} = \text{PPR} \times 2\).
  - X4 Decoding (Full Quadrature): The counter counts every edge of both Channel A and Channel B. Each cycle contains four state changes (00 → 10 → 11 → 01 → 00), so X4 decoding gives four counts per pulse:

### 5-3:11
- Source: Arduino, “attachInterrupt(),” Arduino Language Reference . docs.arduino.cc/language-reference/en/functions/external-interrupts/attachInterrupt/ .
- URLs: https://docs.arduino.cc/language-reference/en/functions/external-interrupts/attachInterrupt/
- Reviewer note: (none)
- Cited for:
  - If a program tries to catch these transitions by polling the encoder pins with digitalRead() inside loop() , it must check the pins constantly to avoid missing pulses, which leaves almost no time for anything else; any slow step in the loop means missed counts and a position error that builds up.
  - Arduino's documentation names reading a rotary encoder as a good use for hardware interrupts : an interrupt lets the board catch every pulse while the main program gets on with other work.
  - When the chosen edge occurs on an interrupt-capable pin, the processor pauses the main program, runs a short Interrupt Service Routine (ISR) that updates the count, and then resumes. Variables shared with the main program must be declared volatile , and the ISR should be as short and fast as possible.
  - On both the Arduino Uno R3 and the Uno R4 (Minima and WiFi) , attachInterrupt() works only on pins 2 and 3 .
  - Other boards, such as the Nano 33 BLE or the Nano ESP32, allow interrupts on all pins.
  - Processor Interrupt Saturation: Only one ISR runs at a time, and other interrupts wait until it finishes.

### 5-3:12
- Source: P. Stoffregen, “Encoder.h,” Encoder Library for Arduino and Teensy , v1.2, PJRC, 2011–2013. github.com/PaulStoffregen/Encoder .
- URLs: https://github.com/PaulStoffregen/Encoder/blob/master/Encoder.h
- Reviewer note: 16-entry table not located
- Cited for:
  - Some libraries go as far as writing the ISR in assembly language for speed.
  - Widely used Arduino encoder libraries decode X4 with a 16-entry state table: the old and new states of A and B form a 4-bit index whose entry says whether the count changes by 0, +1, −1, or ±2 (when an edge was missed).

### 5-3:17
- Source: Encoder Products Company, “Noise and Signal Distortion Considerations,” EPC White Paper . encoder.com/.../Noise and Signal Distortion Considerations_white paper.pdf .
- URLs: https://www.encoder.com/hubfs/Noise%20and%20Signal%20Distortion%20Considerations_white%20paper_final%20(1).pdf
- Reviewer note: RS-422 wording not located
- Cited for:
  - Industrial encoders reduce noise further with differential (RS-422 line-driver) outputs, which send each channel together with its inverse so that noise picked up equally on both wires cancels at the receiver.

### 5-4:2
- Source: K. J. Åström and R. M. Murray, Feedback Systems: An Introduction for Scientists and Engineers , Princeton University Press, Princeton, NJ, 2008 (electronic edition v2.10c, 2010), Section 1.5 and Chapter 10, “PID Control.” introcontrol.mit.edu/.../Feedback Systems Murray.pdf ; chapter page: cds.calte
- URLs: https://introcontrol.mit.edu/_static/fall21/extras/Feedback%20Systems%20Murray.pdf https://www.cds.caltech.edu/~murray/amwiki/PID_Control.html
- Reviewer note: Not checked line by line
- Cited for:
  - Feedback exists to cope with exactly these disturbances.
  - maintain this target despite changing loads and disturbances, the robot must measure its actual state using feedback sensors (such as quadrature encoders), compute the tracking error , and automatically adjust its actuator commands. The most widely used algorithm for this job is the Proportional-Integral-Derivative (PID) controller: Åström and Murray state that more than 95% of all industrial control problems are solved by PID control, many of them with the derivative term left out (PI control).
  - At any instant in time \(t\), the tracking error \(e(t)\) is defined as the difference between the desired target setpoint \(r(t)\) and the measured process variable \(y(t)\):
  - A PID controller computes its corrective output \(u(t)\) by synthesizing three distinct mathematical actions:
  - proportional to the magnitude of the current error: “the farther the system is from the target, the harder the motor pushes.” Increasing the proportional gain \(K_p\) accelerates system response and shortens rise time. However, pure proportional control inherently leaves a steady-state error (droop/offset). As the robot approaches the setpoint, the error shrinks toward zero, causing the proportional push to become too weak to overcome opposing physical forces such as gearbox friction or gravity.
  - rm (Past Error Accumulation): \(I(t) = K_i \int_0^t e(\tau) \, d\tau\). The integral action accumulates tracking errors over time. Even a microscopic residual steady-state error that lingers over time causes the mathematical integral to steadily grow, progressively increasing the control output until the residual error is driven strictly to zero. However, because integration introduces phase lag into the feedback loop, excessive integral gain \(K_i\) causes severe overshoot and resonant ringing.
  - erivative Term (Future Error Trend): \(D(t) = K_d \frac{de(t)}{dt}\). The derivative action measures the instantaneous rate of change of error. If the robot is rapidly closing the gap toward the target, the derivative of error is strongly negative, generating an immediate opposing braking force that damps kinetic momentum and prevents overshooting. While derivative action stabilizes dynamic oscillations, it inherently acts as a high-pass filter, amplifying high-frequency electrical sensor noise.
  - The standard continuous-time ideal PID equation is formulated as:
  - Digital microcontrollers execute software cyclically at discrete sampling intervals \(\Delta t\) (for example, every 10 milliseconds, or 100 Hz). In discrete time, the continuous integral becomes a numerical running summation, and the continuous derivative becomes a backward difference:
  - Textbook PID equations assume ideal components. Physical actuators have real limits (saturation, finite update rates and electrical noise) that call for a few standard modifications:
  - or reaches physical saturation (such as maximum 100% PWM), the error cannot be reduced immediately. The integral term continues accumulating past physical limits. When the obstacle is removed, the controller remains saturated until the accumulated integral slowly unwinds, causing massive overshoot. Robot software should include an anti-windup measure, such as integrator clamping (bounding the integral term) or conditional integration (halting integration whenever the commanded output saturates).
  - High-Frequency Sensor Noise: Differentiating discrete sensor data (such as encoder tick quantization) amplifies high-frequency noise. Practical controllers therefore filter the derivative term, for example with a first-order low-pass filter:

### 5-4:4
- Source: S. Bennett, “Nicholas Minorsky and the Automatic Steering of Ships,” IEEE Control Systems Magazine , vol. 4, no. 4, Nov. 1984. skoge.folk.ntnu.no/.../1984_Bennett-PID history.pdf .
- URLs: https://skoge.folk.ntnu.no/puublications_others/1984_Bennett-PID%20history.pdf
- Reviewer note: Helmsman wording not cleanly extracted
- Cited for:
  - The first mathematical treatment of what we now call three-term (PID) control was published by the Russian-born engineer Nicolas Minorsky , who later worked in the United States. His 1922 paper, “Directional Stability of Automatically Steered Bodies,” appeared in the Journal of the American Society of Naval Engineers and analysed the automatic steering of ships.
  - Minorsky started from the way a skilled helmsman keeps a ship on course: the helmsman does not only react to how far the ship is off course, but times the rudder to meet and oppose the ship's swing.
  - Minorsky's electrical steering controller (built from potentiometers, a differential gear and a motor-generator set) was tested aboard the battleship USS New Mexico in 1923. The trials kept the ship close to its course, but the equipment was removed afterwards and the US Navy set automatic steering aside until the 1930s, largely because the ship's operating crews opposed it.

### 5-4:6
- Source: K. J. Åström and T. Hägglund, Advanced PID Control , ISA (The Instrumentation, Systems, and Automation Society), Research Triangle Park, NC, 2006, ISBN 978-1-55617-942-6. lup.lub.lu.se/record/535630 .
- URLs: https://lup.lub.lu.se/record/535630
- Reviewer note: Formula not visible in the fetched text
- Cited for:
  - In industrial process automation, the controller is frequently expressed in ISA standard form:
  - where \(T_i = K_p / K_i\) is the integral reset time constant (in seconds) and \(T_d = K_d / K_p\) is the derivative time constant (in seconds).
  - Digital microcontrollers execute software cyclically at discrete sampling intervals \(\Delta t\) (for example, every 10 milliseconds, or 100 Hz). In discrete time, the continuous integral becomes a numerical running summation, and the continuous derivative becomes a backward difference:
  - In real-time software, the PID calculation works best when it runs at a regular interval. If the loop timing jitters, the integral sum and the derivative slope are computed with the wrong \(\Delta t\), so the effective gains change from one pass to the next. Robot loops are therefore usually driven by a hardware timer interrupt, or they measure the elapsed time on every pass.
  - Textbook PID equations assume ideal components. Physical actuators have real limits (saturation, finite update rates and electrical noise) that call for a few standard modifications:
  - or reaches physical saturation (such as maximum 100% PWM), the error cannot be reduced immediately. The integral term continues accumulating past physical limits. When the obstacle is removed, the controller remains saturated until the accumulated integral slowly unwinds, causing massive overshoot. Robot software should include an anti-windup measure, such as integrator clamping (bounding the integral term) or conditional integration (halting integration whenever the commanded output saturates).
  - High-Frequency Sensor Noise: Differentiating discrete sensor data (such as encoder tick quantization) amplifies high-frequency noise. Practical controllers therefore filter the derivative term, for example with a first-order low-pass filter:

### 5-4:17
- Source: PX4 Autopilot, “Controller Diagrams,” PX4 User Guide , GitHub, accessed 21 Oct. 2026. github.com/PX4/PX4-user_guide/.../controller_diagrams.md .
- URLs: https://github.com/PX4/PX4-user_guide/blob/main/en/flight_stack/controller_diagrams.md
- Reviewer note: Details not regrepped
- Cited for:
  - The PX4 drone autopilot uses the same cascaded idea, with a mix of P and PID controllers.

### 5-5:4
- Source: Arduino, “pulseIn(),” Arduino Language Reference , GitHub, accessed 21 Oct. 2026. github.com/arduino/reference-en/.../pulseIn.adoc .
- URLs: https://github.com/arduino/reference-en/blob/master/Language/Functions/Advanced%20IO/pulseIn.adoc
- Reviewer note: (none)
- Cited for:
  - On Arduino the echo is usually timed with pulseIn() , which returns 0 if no echo arrives before its timeout (one second by default), so code should treat 0 as “no reading”, not “distance zero”.

### 5-5:12
- Source: x-io Technologies, “Fusion,” AHRS library README , GitHub, accessed 21 Oct. 2026. github.com/xioTechnologies/Fusion .
- URLs: https://github.com/xioTechnologies/Fusion
- Reviewer note: Bias discussion is the lesson's own
- Cited for:
  - Magnetometers are less reliable references than accelerometers, because nearby magnetic fields and iron (motor currents, steel structures) distort what they read.
  - Every physical MEMS gyroscope has a non-zero zero-rate output bias (\(b_{gyro} \neq 0\)): its reading is not exactly zero when it is not rotating, and that offset also shifts with temperature.
  - The open-source Fusion library, for example, detects stationary periods automatically and slowly updates its gyroscope offset during them.

### 5-6:7
- Source: ROBOTIS, TurtleBot3 , turtlebot3_node/src/odometry.cpp , GitHub, main branch, accessed 21 Oct. 2026. github.com/ROBOTIS-GIT/.../odometry.cpp .
- URLs: https://github.com/ROBOTIS-GIT/turtlebot3/blob/main/turtlebot3_node/src/odometry.cpp
- Reviewer note: Midpoint trig form not located in grep
- Cited for:
  - Midpoint integration evaluates the trigonometry at the average heading halfway through the step, and the ROS 2 driver for the TurtleBot3 teaching robot uses exactly this form:
  - The TurtleBot3 driver does the same when its use_imu option is on: it takes the heading change from the IMU and only the forward distance from the wheels.

### 5-7:5
- Source: Arduino, “Blink Without Delay” (Built-in Examples). docs.arduino.cc/built-in-examples/digital/BlinkWithoutDelay .
- URLs: https://docs.arduino.cc/built-in-examples/digital/BlinkWithoutDelay/
- Reviewer note: (none)
- Cited for:
  - Robot software avoids this with cooperative multitasking : each task checks the clock and returns immediately instead of waiting. Arduino's official Blink Without Delay example shows the pattern, because "Arduino pauses your program during the delay()."

### 5-7:11
- Source: PLCopen, “Sequential Function Chart (SFC) elements,” excerpt of IEC 61131-3 section 2.6. plcopen.org/.../sfc_textual.pdf (Internet Archive copy) . See also PLCopen, “IEC 61131-3: Programming Languages.” plcopen.org/node/211 (Internet Archive copy) .
- URLs: https://web.archive.org/web/2022/https://www.plcopen.org/sites/default/files/downloads/sfc_textual.pdf https://web.archive.org/web/2022/https://plcopen.org/node/211
- Reviewer note: Live PLCopen URLs dead; Internet Archive copies. 'Exactly one initial step' and the qualifier count are corroborated by ref 12 CODESYS help.
- Cited for:
  - PLCopen describes SFC as an additional set of graphical and textual elements, and the standard's SFC definitions are taken from the earlier function-chart standard IEC 848.
  - Steps: Discrete operating states: "a step is either active or inactive." Each SFC network has exactly one initial step, which can be drawn with double lines for its borders.
  - Transitions: Boolean conditions between steps. A transition is enabled when all of its preceding steps are active, and it "clears" when it is enabled and its condition is true; clearing hands activity from the preceding steps to the following ones.
  - Action Blocks and Qualifiers: The standard defines action qualifiers (ten in the PLCopen excerpt, including N, R, S, L, D and P).

### 5-9:3
- Source: Preprint on industrial robot trajectory planning, arXiv:2306.05329, 2023 (statement seen in a search summary; page not opened). arxiv.org/pdf/2306.05329 .
- URLs: https://arxiv.org/pdf/2306.05329
- Reviewer note: (none)
- Cited for:
  - o-rest move of distance D. The axis accelerates at a constant rate a max until it reaches the speed limit v max , cruises at v max , and then decelerates at a max until it stops exactly at the target. Plotted against time, the velocity rises in a straight ramp, stays flat, and falls in a straight ramp: a trapezoid. One survey describes this profile, with its constant-acceleration, constant-velocity and constant-deceleration phases, as the most common one for industrial robot trajectory planning.

### 5-9:6
- Source: United States Patent and Trademark Office, U.S. Patent No. 12,443,187 (motion profile patent; statement seen in a search summary; document not opened). image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12443187 .
- URLs: https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12443187
- Reviewer note: Cited for the jerk definition only
- Cited for:
  - Look at the acceleration plot of a trapezoidal profile. It is a set of rectangles: +a max , then 0, then −a max . At each corner the acceleration changes instantly. Jerk is the rate of change of acceleration, so at those corners the jerk is, in theory, infinite. Engineering sources describe trapezoidal profiles as having effectively infinite jerk at the corners, and give this as the reason S-curve profiles are used.

### 5-9:13
- Source: ABB Robotics tech community, “Does ABB robot support continuous trajectory control?” forum thread (seen in a search summary; not opened). tech-community.robotics.abb.com/t/does-abb-robot-support-continuous-trajectory-control/11270 .
- URLs: https://tech-community.robotics.abb.com/t/does-abb-robot-support-continuous-trajectory-control/11270
- Reviewer note: (none)
- Cited for:
  - ABB's community forum describes z0 as a fly-by point that passes through a 0.3 mm zone without stopping, which matches those values.

### 5-9:17
- Source: ABB Robotics tech community, “Corner Path failure 50024,” forum thread (seen in a search summary; not opened). tech-community.robotics.abb.com/t/corner-path-failure-50024/3188 .
- URLs: https://tech-community.robotics.abb.com/t/corner-path-failure-50024/3188
- Reviewer note: (none)
- Cited for:
  -  zone around a fly-by point, the controller starts on the next segment. The braking ramp of one move overlaps the speeding-up ramp of the next, so the TCP keeps moving and rounds the corner instead of passing through the programmed point. A bigger zone is faster and smoother but stays farther from the point. Users of ABB's community forum report that a "Corner path failure" (event 50024) is commonly caused by a zone point where the robot has to stop anyway, for example because a wait follows it.

### 5-9:19
- Source: Universal Robots forum, “How to create smooth robot motion for extrusion,” forum thread (seen in a search summary; not opened). forum.universal-robots.com/t/how-to-create-smooth-robot-motion-for-extrusion/37075 .
- URLs: https://forum.universal-robots.com/t/how-to-create-smooth-robot-motion-for-extrusion/37075
- Reviewer note: (none)
- Cited for:
  - For processes such as extrusion or dispensing, users recommend movep , which moves at constant tool speed with circular blends.

### 5-9:23
- Source: ABB Robotics tech community, “How do I check if a MoveL instruction can be completed without a singularity or avoid it?” forum thread (seen in a search summary; not opened). tech-community.robotics.abb.com/t/how-do-i-check-if-a-movel-instruction-can-be-completed-without-a-singularity-or-avoid-it/788
- URLs: https://tech-community.robotics.abb.com/t/how-do-i-check-if-a-movel-instruction-can-be-completed-without-a-singularity-or-avoid-it/7883
- Reviewer note: (none)
- Cited for:
  - ose to zero and two wrist axes line up. Holding a constant TCP speed through that region can demand very large joint speeds, so the controller slows, stops or reports an error. Users on ABB's forum recommend two ways through: use SingArea \Wrist , which lets the controller relax the tool orientation so a linear move can pass, or replace the move with a MoveJ. They add that SingArea stays active until SingArea \Off , and that a risky target can be spotted by checking whether axis 5 is close to 0.

### 5-9:24
- Source: ABB Robotics tech community, “SingArea help,” forum thread (seen in a search summary; not opened). tech-community.robotics.abb.com/t/singarea-help/7164 .
- URLs: https://tech-community.robotics.abb.com/t/singarea-help/7164
- Reviewer note: (none)
- Cited for:
  - ose to zero and two wrist axes line up. Holding a constant TCP speed through that region can demand very large joint speeds, so the controller slows, stops or reports an error. Users on ABB's forum recommend two ways through: use SingArea \Wrist , which lets the controller relax the tool orientation so a linear move can pass, or replace the move with a MoveJ. They add that SingArea stays active until SingArea \Off , and that a risky target can be spotted by checking whether axis 5 is close to 0.

### 5-9:25
- Source: RobotStudio forums (ABB), discussion comment 25437 on detecting singularities in RAPID (seen in a search summary; not opened). forums.robotstudio.com/discussion/comment/25437 .
- URLs: https://forums.robotstudio.com/discussion/comment/25437
- Reviewer note: (none)
- Cited for:
  - Forum users also note that RAPID has no error code for catching a singularity, and suggest testing the path in simulation first.
