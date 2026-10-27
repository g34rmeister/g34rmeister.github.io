## 5-1:11
gap: connecting grounds of external motor or servo power supply and Arduino together
5-1:11 | https://docs.arduino.cc/libraries/servo/ | current | connecting external power supply and Arduino grounds | grounds, external power supply, considerable power
5-1:11 | https://docs.arduino.cc/learn/electronics/stepper-motors/ | current | separate power supply and common ground wiring | ground, power supply, driver

## 5-2:1
gap: none

## 5-2:4
gap: Servo library taking over Timer1 with prescaler 8 and disabling analogWrite on pins 9 and 10
5-2:4 | https://docs.arduino.cc/libraries/servo/ | current | Servo library disables analogWrite on pins 9 and 10 | disables analogWrite, pins 9 and 10, Timer1
5-2:4 | https://github.com/arduino-libraries/Servo/blob/master/src/avr/ServoTimers.h | current | Servo library Timer1 prescaler 8 configuration | _useTimer1, CS11, TCNT1_PRESCALER
5-2:4 | https://github.com/arduino-libraries/Servo/blob/master/src/avr/Servo.cpp | current | Servo library taking over Timer1 compare interrupt | TIMER1_COMPA_vect, OCR1A, TCNT1

## 5-2:9
gap: forum thread citation rather than official documentation explaining ultrasonic PWM eliminates audible motor whine
5-2:9 | https://www.pololu.com/docs/0J44/5.2 | current | ultrasonic PWM frequency eliminates motor whine | 21.77 kHz, ultrasonic, whine

## 5-2:15
gap: switching losses typically 10% to 30% of conduction loss for DRV8833
nosource: switching losses typically 10% to 30% of conduction loss

## 5-3:5
gap: none

## 5-3:11
gap: none

## 5-3:12
gap: none

## 5-3:17
gap: explicit mention of RS-422 standard alongside differential line-driver common-mode noise cancellation
5-3:17 | https://www.encoder.com/resources/technical-bulletins | current | EPC bulletin TB-109 defining RS-422 line-driver differential outputs | TB-109, RS-422, line driver, differential
5-3:17 | https://www.ti.com/lit/ds/symlink/am26lv32.pdf | new | RS-422 quadruple differential line receiver common-mode noise rejection | RS-422, differential line receiver, common-mode

## 5-4:2
gap: none

## 5-4:4
gap: none

## 5-4:6
gap: bibliographic record page does not display the ISA standard form PID equations
5-4:6 | https://www.mathworks.com/help/control/ref/pidstd.html | new | standard form PID controller parameters Kp Ti and Td | pidstd, standard form, Ti, Td
5-4:6 | https://www.cds.caltech.edu/~murray/amwiki/PID_Control.html | new | ideal standard PID controller formulation and parameters | PID, integral time, derivative time, anti-windup

## 5-4:17
gap: none

## 5-5:4
gap: none

## 5-5:12
gap: magnetometer distortion and physical MEMS gyroscope zero-rate bias temperature drift
5-5:12 | https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-696.pdf | new | MEMS gyroscope bias drift and magnetometer aiding in inertial navigation | MEMS, gyroscope, bias, magnetometer
5-5:12 | https://invensense.tdk.com/download-pdf/mpu-6050-datasheet/ | new | MPU-6050 zero-rate output bias and temperature variation specifications | zero-rate output, temperature, gyroscope, MPU-6050

## 5-6:7
gap: Runge-Kutta 2 midpoint integration formula evaluated at half-angle in ROS odometry.cpp
5-6:7 | https://github.com/ros-controls/ros_controllers/blob/noetic-devel/diff_drive_controller/src/odometry.cpp | new | Runge-Kutta 2 midpoint odometry integration in ROS odometry.cpp | integrateRungeKutta2, heading_, 0.5
5-6:7 | https://github.com/ROBOTIS-GIT/turtlebot3/blob/master/turtlebot3_node/src/odometry.cpp | current | TurtleBot3 ROS 2 odometry publisher node | odometry, pose, base_footprint

## 5-7:5
gap: none

## 5-7:11
gap: original live PLCopen URLs are dead (archived copies used)
5-7:11 | https://content.helpme-codesys.com/en/CODESYS%20Development%20System/_cds_edt_sfc_elements.html | new | SFC elements initial step and action qualifiers | initial step, qualifier, SFC
5-7:11 | https://web.archive.org/web/2022/https://www.plcopen.org/sites/default/files/downloads/sfc_textual.pdf | current | SFC textual elements and action qualifiers from IEC 61131-3 | SFC, initial, qualifiers

## 5-9:3
gap: unopened preprint rather than authoritative robotics documentation on trapezoidal trajectory profiles
5-9:3 | https://www.mathworks.com/help/robotics/ref/trapveltraj.html | new | trapezoidal velocity profile constant acceleration phases | trapveltraj, trapezoidal, velocity, acceleration
5-9:3 | https://link.springer.com/book/10.1007/978-3-540-85629-0 | new | standard industrial trajectory planning trapezoidal velocity profiles | trajectory planning, trapezoidal, profile, velocity

## 5-9:6
gap: unopened patent rather than standard textbook or official documentation defining jerk and S-curve rationale
5-9:6 | https://www.mathworks.com/help/robotics/ref/minjerkpolytraj.html | new | jerk definition as acceleration derivative and smooth trajectories | jerk, acceleration, trajectory, derivative
5-9:6 | https://link.springer.com/book/10.1007/978-3-540-85629-0 | new | S-curve profiles with bounded jerk versus trapezoidal infinite jerk | jerk, S-curve, trapezoidal, acceleration

## 5-9:13
gap: forum thread citation rather than official ABB RAPID reference manual defining zonedata and z0
5-9:13 | https://library.abb.com/d/3HAC050917-001 | current | ABB RAPID manual definition of zonedata and z0 constant | zonedata, z0, 0.3, finep

## 5-9:17
gap: forum thread citation rather than official ABB troubleshooting manual documenting event 50024
5-9:17 | https://library.abb.com/d/3HAC020738-001 | current | ABB IRC5 troubleshooting manual event 50024 corner path failure | 50024, Corner path, stop point, zone

## 5-9:19
gap: forum thread citation rather than official Universal Robots manual defining MoveP process motion
5-9:19 | https://www.universal-robots.com/manuals | current | Universal Robots manual MoveP constant tool speed and circular blends | MoveP, constant speed, circular, blends

## 5-9:23
gap: forum thread citation rather than official ABB RAPID manual documenting SingArea and wrist singularity
5-9:23 | https://library.abb.com/d/3HAC050917-001 | current | ABB RAPID manual SingArea instruction and wrist singularity handling | SingArea, Wrist, Off, axis 5

## 5-9:24
gap: forum thread citation rather than official ABB RAPID manual for modal SingArea activation
5-9:24 | https://library.abb.com/d/3HAC050917-001 | current | ABB RAPID manual modal duration of SingArea until SingArea Off | SingArea, Off, Wrist, modal

## 5-9:25
gap: forum thread citation rather than official ABB manual documenting lack of recoverable singularity error code
5-9:25 | https://library.abb.com/d/3HAC050917-001 | current | ABB RAPID manual list of recoverable motion ERRNO codes | ERRNO, SingArea, error handler
