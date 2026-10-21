/*
	RISE Bot Instructor: course data
	One machine-readable description of the course: chapters, lessons, learning
	objectives and chapter quizzes. assets/js/learning.js renders objectives,
	progress and quizzes from it, and a phase 2 AI tutor can read the same data
	(window.RISE_COURSE, or window.RISEBot.course) instead of scraping pages.

	Keep it in sync with the pages: every lesson id matches its file name
	(lesson "1-1" lives in robotics-1-1.html), and every quiz answer must be
	stated in the lesson it points to.
*/
window.RISE_COURSE = {
	id: 'rise-bot-instructor',
	title: 'RISE Bot Instructor',
	author: 'Gerald Lê',
	institution: 'Louisiana State University',
	version: '2026-10',
	chapters: [
		{
			id: 1,
			title: 'Intro to Robotics',
			url: 'robotics-intro.html',
			prerequisites: 'None. This chapter is the starting point.',
			handsOn: 'the Try it boxes ask you to classify real robots and trace the sense, think, act loop.',
			summary: 'What robots are, where they came from, the main types, the skills to learn first, and where robots work.',
			lessons: [
				{"id": "1-1", "minutes": 16, "title": "Definition of Robots", "objectives": ["Define a robot using ISO 8373:2021 and compare it with dictionary, RIA and sense-think-act definitions.", "Explain autonomy as a matter of degree and tell a robot from a robotic device.", "Explain where the words \"robot\" (Josef and Karel Čapek, R.U.R.) and \"robotics\" (Asimov) came from.", "Describe the sense, think, act loop and compare sense-plan-act, reactive and hybrid control architectures."], "keyTerms": ["robot", "ISO 8373", "autonomy", "robotic device", "industrial robot", "R.U.R.", "sensor", "controller", "actuator", "subsumption architecture"]},
				{"id": "1-2", "minutes": 14, "title": "History and Evolution of Robots", "objectives": ["Describe early automata (Hero, al-Jazari, Su Song, Jaquet-Droz) and the stored-program idea behind Jacquard's loom and numerical control.", "Place Unimate, the Stanford Arm, the 1970s European and Japanese firsts, SCARA, cobots and ROS on a timeline.", "Trace how robots went from fixed arms to machines that move around, from Grey Walter's tortoises and Shakey to Kiva and humanoids.", "Quote the current installed base of industrial robots from IFR World Robotics 2026."], "keyTerms": ["automaton", "escapement", "Jacquard loom", "numerical control", "Unimate", "degree of freedom", "Stanford Arm", "SCARA", "cobot", "ROS"]},
				{"id": "1-3", "minutes": 13, "title": "Types of Robots", "objectives": ["Classify an industrial robot by mechanical structure (articulated, SCARA, Cartesian, parallel/delta, cylindrical, polar) separately from its application.", "Read a robot spec sheet and compare payload, reach and repeatability across real models.", "Explain why ISO 10218:2025 speaks of collaborative applications and describe the four collaborative modes.", "Tell AGVs from AMRs by how they navigate, and place service robots and humanoids in the wider robot population."], "keyTerms": ["industrial robot", "articulated robot", "SCARA", "delta robot", "Cartesian robot", "repeatability", "cobot", "collaborative application", "AGV", "AMR", "mobile robot"]},
				{"id": "1-4", "minutes": 12, "title": "Preliminary Requirements", "objectives": ["Apply the basic safety rules for working near an industrial robot: reduced teach speed, the enabling device and lockout/tagout.", "Explain where Python, C++ and vendor robot languages are used, and name the ROS 2 client libraries.", "Compute the forward kinematics of a planar two-link arm and connect it to trigonometry, matrices and derivatives.", "Plan a learning path using free resources, simulators and vendor training, treating assembly as optional enrichment."], "keyTerms": ["enabling device", "lockout/tagout", "Python", "C++", "rclpy", "forward kinematics", "Ohm's law", "Gazebo", "Modbus TCP", "assembly", "TCP", "UDP"]},
				{"id": "1-5", "minutes": 13, "title": "Common Applications of Robotics", "objectives": ["Use IFR World Robotics figures to describe how many industrial robots are installed and operating, and which countries and industries use them most.", "Explain the difference between total robot numbers and robot density, using China and Korea as examples.", "Describe real applications in logistics, car plants, medicine, service, space and agriculture, and say what each case shows about current robot capabilities.", "Explain how robots protect human lives, using the Mars, World Trade Center and Fukushima cases, and why humanoids and AI foundation models are still early applications."], "keyTerms": ["industrial robot", "operational stock", "robot density", "service robot", "teleoperation", "humanoid robot", "foundation model", "Mars rover", "AutoNav", "search and rescue"]},
				{"id": "1-6", "minutes": 14, "title": "Robot Anatomy and Coordinate Frames", "objectives": ["Distinguish joint types, count degrees of freedom with Grübler's formula, and explain why six axes are needed to position and orient a tool.", "Read a robot datasheet, explain how reducers affect precision, and tell pose accuracy from pose repeatability (ISO 9283).", "Explain the tool center point, tool frame and work object, how a TCP is taught with the 4-point method, and why defining frames makes a program reusable.", "Solve forward and inverse kinematics for a two-link arm, recognize singularities, and compare joint, linear and circular moves with blending."], "keyTerms": ["degree of freedom", "Grübler's formula", "reducer", "backlash", "pose repeatability", "tool center point (TCP)", "work object (user frame)", "inverse kinematics", "singularity", "blending (zone)", "end effector", "workspace (work envelope)", "linear interpolation (MoveL)"]}
			]
		},
		{
			id: 2,
			title: 'Robot Programming',
			url: 'robotics-programming.html',
			prerequisites: 'Chapter 1, especially 1.6 Robot Anatomy and Coordinate Frames.',
			handsOn: 'edit short URScript and RAPID programs and compare programming methods.',
			summary: 'How industrial robots are programmed online and offline, in environments like RobotStudio and PolyScope, and in vendor languages.',
			lessons: [
				{
					id: '2-1',
					title: 'Types of Programming', minutes: 5,
					objectives: [
						'Compare online (teach pendant, lead-through) and offline programming.',
						'Explain how block-based programming works and when it fits.',
						'Choose a method for a given job.'
					],
					keyTerms: ['offline programming', 'teach pendant', 'lead-through', 'block-based programming', 'MoveJ', 'MoveL']
				},
				{
					id: '2-2',
					title: 'Common Programming Environments', minutes: 4,
					objectives: [
						'Describe what ABB RobotStudio is used for.',
						'Describe how PolyScope programs are built and where URScript fits in.'
					],
					keyTerms: ['RobotStudio', 'Virtual Controller', 'PolyScope', 'program tree', 'URCaps']
				},
				{
					id: '2-3',
					title: 'Common Programming Languages', minutes: 3,
					objectives: [
						'Read a short URScript and RAPID program.',
						'Compare URScript and RAPID.',
						'Explain what RRL was and name KRL and IRL.'
					],
					keyTerms: ['URScript', 'RAPID', 'movej', 'movel', 'robtarget', 'KRL']
				},
				{
					id: '2-4',
					title: 'Intro to ROS (Vendor-Agnostic)', minutes: 2,
					objectives: [
						'Explain why vendor-neutral middleware like ROS is useful.',
						'Describe what ROS-Industrial adds for manufacturing.',
						'Explain what a vendor ROS driver does, using Universal Robots as the example.'
					],
					keyTerms: ['middleware', 'ROS', 'digital twin', 'ROS-Industrial', 'ROS driver']
				}
			]
		},
		{
			id: 3,
			title: 'Robot Operating System (ROS)',
			url: 'robotics-ros.html',
			prerequisites: 'Chapter 2, and a computer where you can install Ubuntu, WSL 2 or a virtual machine.',
			handsOn: 'install ROS 2, drive Turtlesim, call services, record a bag and read the node graph.',
			summary: 'What ROS is, how ROS 2 differs from ROS 1, installing it, a first Turtlesim example, and the most useful tools.',
			lessons: [
				{
					id: '3-1',
					title: 'Definition and Introduction', minutes: 3,
					objectives: [
						'Explain what ROS is and is not.',
						'Define nodes, topics, services, actions and parameters.',
						'Use ROS_DOMAIN_ID to keep robots apart on a shared network.'
					],
					keyTerms: ['node', 'topic', 'service', 'action', 'parameter', 'SLAM', 'ROS_DOMAIN_ID', 'Willow Garage']
				},
				{
					id: '3-2',
					title: 'ROS 1 vs. ROS 2', minutes: 4,
					objectives: [
						'Explain how ROS 2 discovery with DDS differs from the ROS 1 master.',
						'Choose Quality of Service settings and a middleware for a topic.',
						'Describe launch files and why new projects should use ROS 2.'
					],
					keyTerms: ['roscore', 'DDS', 'QoS', 'launch file', 'Noetic']
				},
				{
					id: '3-3',
					title: 'Installing ROS on Your Local Environment', minutes: 4,
					objectives: [
						'Pick an install route for your operating system.',
						'Install and source ROS 2 on Ubuntu.',
						'Check the install with talker and listener, and fix common errors.'
					],
					keyTerms: ['Lyrical Luth', 'Jazzy Jalisco', 'WSL 2', 'setup.bash']
				},
				{
					id: '3-4',
					title: 'Running Your First Example (Turtlesim)', minutes: 3,
					objectives: [
						'Run Turtlesim and drive the turtle from the keyboard.',
						'Inspect nodes, topics and message types with the ros2 command.',
						'Call a service to spawn a turtle, and remap topics to drive it.'
					],
					keyTerms: ['turtlesim', 'teleop', 'ros2 topic echo', '/turtle1/cmd_vel', 'Twist', '/spawn', 'remapping']
				},
				{
					id: '3-5',
					title: 'ROS Tools', minutes: 3,
					objectives: [
						'Tell RViz (visualization) apart from Gazebo (simulation).',
						'See the running node graph with rqt_graph.',
						'Record and replay topics with ros2 bag.',
						'Name widely used ROS packages and what they do.'
					],
					keyTerms: ['RViz', 'rqt_graph', 'Gazebo', 'ros2 bag', 'Nav2', 'MoveIt 2', 'tf2']
				}
			]
		},
		{
			id: 4,
			title: 'Ethics',
			url: 'robotics-ethics.html',
			prerequisites: 'Chapters 1 and 2.',
			handsOn: 'work through ethical scenarios and safety checklists for real robot cells.',
			summary: 'Ethics in engineering in general, and the specific questions robots raise in hardware and software.',
			lessons: [
				{
					id: '4-1',
					title: 'Ethics in Engineering', minutes: 3,
					objectives: [
						'State the first duty in engineering codes of ethics.',
						'List the core duties shared by the NSPE and IEEE codes.',
						'Name the NSPE Fundamental Canons and the three principles of the IEEE code.'
					],
					keyTerms: ['NSPE Code of Ethics', 'Fundamental Canons', 'IEEE Code of Ethics', 'conflict of interest']
				},
				{
					id: '4-2',
					title: 'Ethics in Robotics (Hardware, Software)', minutes: 3,
					objectives: [
						'Name the main robot safety standards.',
						'Describe hardware safeguards and the software safety layer.',
						'Explain what makes an application collaborative and how people stay safe while teaching a robot.'
					],
					keyTerms: ['ISO 10218', 'emergency stop', 'power and force limiting', 'watchdog timer', 'geofencing']
				},
				{"id": "4-3", "minutes": 6, "title": "Robots and Society", "objectives": ["Summarize what research finds about robots' effects on jobs and wages, including tasks versus whole jobs.", "Explain the privacy risks of robot sensors and how data minimization reduces them.", "Describe who is accountable for autonomous systems and how the EU AI Act and IEEE frameworks address human oversight."], "keyTerms": ["displacement effect", "reinstatement effect", "data minimization", "human in the loop", "EU AI Act", "IEEE 7000"]}
			]
		},
		{
			id: 5,
			title: 'Extra: Electronics and Control Basics',
			url: 'robotics-control.html',
			prerequisites: 'This chapter is optional. Basic C++ (see 1.4) helps; an Arduino Uno kit lets you build the examples.',
			handsOn: 'the PWM, encoder and PID simulators in the lessons, plus Arduino sketches you can run.',
			summary: 'How a microcontroller drives a motor with PWM, measures the result with an encoder, and closes the loop with PID.',
			lessons: [
				{
					id: '5-1',
					title: 'Arduino for Robotics', minutes: 3,
					objectives: [
						'Choose the right Arduino pin type for a job.',
						'Structure a sketch with setup() and loop().',
						'Drive servos and DC motors and read an ultrasonic sensor.'
					],
					keyTerms: ['digital pin', 'PWM pin', 'analog input', 'H-bridge', 'HC-SR04', 'INPUT_PULLUP']
				},
				{
					id: '5-2',
					title: 'Pulse Width Modulation (PWM)', minutes: 4,
					objectives: [
						'Explain duty cycle and frequency.',
						'Compute average voltage from duty cycle.',
						'Compare DC motor PWM with servo PWM.'
					],
					keyTerms: ['duty cycle', 'frequency', 'analogWrite', 'H-bridge', 'flyback diode']
				},
				{
					id: '5-3',
					title: 'Encoders and Shaft Encoders', minutes: 4,
					objectives: [
						'Compare incremental and absolute encoders.',
						'Explain quadrature decoding and CPR = PPR × 4.',
						'Convert ticks to distance and speed.'
					],
					keyTerms: ['incremental encoder', 'absolute encoder', 'quadrature', 'CPR', 'odometry']
				},
				{
					id: '5-4',
					title: 'PID Control', minutes: 4,
					objectives: [
						'Explain what the P, I and D terms each do.',
						'Write a discrete-time PID update and tune it by hand.',
						'Avoid integral windup and derivative kick.'
					],
					keyTerms: ['setpoint', 'error', 'Kp', 'Ki', 'Kd', 'Ziegler–Nichols', 'integral windup']
				},
				{"id": "5-5", "minutes": 7, "title": "Sensors for Robots", "objectives": ["Distinguish proprioceptive from exteroceptive sensors.", "Compare how common robot sensors work and where each fails.", "Explain why robots combine several sensors."], "keyTerms": ["proprioceptive sensor", "exteroceptive sensor", "ultrasonic range finder", "IMU", "gyro drift", "reflectance sensor", "LiDAR"]},
				{"id": "5-6", "minutes": 6, "title": "Odometry", "objectives": ["Compute a differential-drive pose update from encoder ticks.", "Distinguish systematic from non-systematic odometry errors.", "Calibrate wheel diameter and wheelbase."], "keyTerms": ["odometry", "dead reckoning", "pose", "wheelbase", "systematic error", "non-systematic error", "UMBmark"]},
				{"id": "5-7", "minutes": 6, "title": "State Machines", "objectives": ["Identify the states, events, guards, transitions and actions of a robot behavior.", "Write a state-transition table.", "Implement a non-blocking state machine with enum, switch and millis()."], "keyTerms": ["finite state machine", "state", "transition", "guard", "entry action", "millis()", "lifecycle node"]},
				{"id": "5-8", "minutes": 6, "title": "Intro to Kalman Filters", "objectives": ["Explain the predict and update steps of a Kalman filter.", "Compute one step of a 1-D Kalman filter.", "Describe how Q and R change the filter's behavior."], "keyTerms": ["sensor fusion", "Kalman gain", "process noise (Q)", "measurement noise (R)", "innovation", "extended Kalman filter", "complementary filter"]}
			]
		}
	],

	/* One quiz per chapter. answer is the index of the correct choice. */
	quizzes: {
		1: [
			{
				lesson: '1-1',
				question: 'The word "robot" comes from the Czech word robota. What does it mean?',
				choices: ['Machine', 'Forced labor', 'Artificial person', 'Worker that thinks'],
				answer: 1,
				explanation: 'Robota means "forced labor." Karel Čapek made the word famous in his 1920 play R.U.R.'
			},
			{
				lesson: '1-1',
				question: 'In the sense, think, act loop, which part is a motor or gripper?',
				choices: ['Sense', 'Think', 'Act', 'None of them'],
				answer: 2,
				explanation: 'Actuators such as motors and grippers carry out the decision, which is the "act" step.'
			},
			{
				lesson: '1-2',
				question: 'What was Unimate?',
				choices: ['An early clockwork automaton', 'The first industrial robot, put to work at General Motors in 1961', 'The first collaborative robot', 'The first version of ROS'],
				answer: 1,
				explanation: 'Unimate, developed by George Devol and Joseph Engelberger, handled hot die-cast parts at a General Motors plant from 1961.'
			},
			{
				lesson: '1-3',
				question: 'What is the main difference between an AGV and an AMR?',
				choices: ['AGVs fly, AMRs drive', 'AGVs follow guidance built into the facility, AMRs map their surroundings and plan their own path', 'AMRs are always bolted to the floor', 'There is no difference'],
				answer: 1,
				explanation: 'AGVs follow wires, tape, markers or reflectors. AMRs map their surroundings and plan their own path around obstacles.'
			},
			{
				lesson: '1-5',
				question: 'Why can\'t Mars rovers be driven live with a joystick from Earth?',
				choices: ['Rovers have no cameras', 'A radio signal can take up to about 22 minutes to reach Mars one way', 'Joysticks are not allowed by NASA', 'The rovers do not have motors'],
				answer: 1,
				explanation: 'The signal delay is minutes long, so rovers like Perseverance use AutoNav to plan their own paths around hazards.'
			},
			{"lesson": "1-6", "question": "A fixture is moved slightly, and all program targets were defined relative to a work object on that fixture. What is the simplest fix?", "choices": ["Re-teach every target point in the program", "Re-teach the work object so all targets move with it", "Change tool0 to a new tool", "Switch every MoveL to MoveJ"], "answer": 1, "explanation": "Targets are measured relative to the work object, so re-teaching the work object moves every target with it and the program itself does not change."},
			{"lesson": "1-6", "question": "Which move instruction makes the tool center point travel in a straight line in Cartesian space?", "choices": ["MoveJ / movej", "MoveL / movel", "MoveC / movec", "Any move with a zone such as z50"], "answer": 1, "explanation": "A linear move (MoveL / movel) moves the TCP in a straight line, while a joint move interpolates in joint space and the tool follows a curved path."},
			{"lesson": "1-1", "question": "Under ISO 8373:2021, what is a teleoperated remote manipulator that has no autonomy?", "choices": ["A service robot", "A robotic device", "An industrial robot", "A medical robot"], "answer": 1, "explanation": "ISO 8373 calls a mechanism built with robotic technology that does not meet every part of the robot definition a robotic device, and gives a teleoperated remote manipulator as an example."},
			{"lesson": "1-1", "question": "Who suggested the word \"robot\" to Karel Čapek?", "choices": ["Isaac Asimov", "His brother, the painter Josef Čapek", "Joseph Engelberger", "George Devol"], "answer": 1, "explanation": "Karel first thought of \"labori\"; his brother Josef, a painter, suggested \"robots\" instead."},
			{"lesson": "1-1", "question": "In Brooks's subsumption architecture, what happens to the lower layers when higher layers are added?", "choices": ["They are deleted", "They keep running, and higher layers can suppress their outputs", "They are replaced by a global world model", "They only run when the robot is idle"], "answer": 1, "explanation": "Brooks wrote that higher-level layers can subsume lower ones by suppressing their outputs, but lower levels continue to function as higher levels are added."},
			{"lesson": "1-2", "question": "Willow Garage began developing ROS in 2007. When did the first release of ROS come out?", "choices": ["2005", "2007", "2009", "2012"], "answer": 2, "explanation": "Development started in 2007 and Willow Garage released ROS for the first time in 2009."},
			{"lesson": "1-2", "question": "Which 1974 robot does the IFR describe as the first fully electric, microprocessor-controlled industrial robot?", "choices": ["Unimate", "KUKA FAMULUS", "ASEA IRB 6", "Cincinnati Milacron T3"], "answer": 2, "explanation": "The ASEA IRB 6 (Sweden, 1974) was the first fully electric, microprocessor-controlled industrial robot. FAMULUS (1973) was the first with six electromechanically driven axes, and the T3 was the first commercial minicomputer-controlled robot."},
			{"lesson": "1-2", "question": "How many vehicles finished the first DARPA Grand Challenge in March 2004?", "choices": ["None", "One", "Five", "All of them"], "answer": 0, "explanation": "No vehicle finished in 2004; the best, CMU's Sandstorm, covered 7.32 miles. In 2005 Stanford's Stanley won."},
			{"lesson": "1-3", "question": "Which term does the 2025 revision of ISO 10218 use in place of \"collaborative robot\"?", "choices": ["Cobot system", "Collaborative application", "Human-safe robot", "Power-limited manipulator"], "answer": 1, "explanation": "ISO 10218-1/-2:2025 speak of a collaborative application, because only the actual application, not the robot alone, can be confirmed as collaborative."},
			{"lesson": "1-3", "question": "In which robot structure do the arms' links form a closed loop?", "choices": ["Articulated", "SCARA", "Parallel (delta)", "Cartesian"], "answer": 2, "explanation": "The IFR defines parallel or delta robots as arms whose links form a closed-loop structure, like the ABB IRB 360 FlexPicker."},
			{"lesson": "1-3", "question": "How many axes does each arm of ABB's dual-arm YuMi (IRB 14000) have?", "choices": ["4", "6", "7", "14"], "answer": 2, "explanation": "YuMi has 7 axes on each arm, 14 in total, so not every cobot has the six-axis shape."},
			{"lesson": "1-4", "question": "According to OSHA, how fast should a robot move while it is being programmed?", "choices": ["1,000 mm/s or less", "250 mm/s (10 inches per second) or less", "Its full rated speed", "There is no limit if the operator wears PPE"], "answer": 1, "explanation": "OSHA says speeds during programming should be 10 inches per second (250 mm/s) or less."},
			{"lesson": "1-4", "question": "A planar two-link arm has L1 = L2 = 1 m, θ1 = 30° and θ2 = 60°. What is the x-coordinate of its tip?", "choices": ["0 m", "0.5 m", "0.866 m", "1.5 m"], "answer": 2, "explanation": "x = L1·cos θ1 + L2·cos(θ1 + θ2) = 0.866 + cos 90° = 0.866 m (and y = 1.5 m)."},
			{"lesson": "1-4", "question": "How does the lesson recommend treating assembly language?", "choices": ["As the first language to learn", "As required for ROS 2", "As optional enrichment for understanding what the processor does", "As the language most robot jobs ask for"], "answer": 2, "explanation": "Assembly is not a prerequisite; C and C++ dominate embedded work, and assembly is mainly useful for understanding registers, timing and interrupts."},
			{"lesson": "1-5", "question": "Which country had the highest robot density (robots per 10,000 manufacturing employees) in 2024, according to IFR?", "choices": ["China", "Republic of Korea", "Germany", "United States"], "answer": 1, "explanation": "Korea led with 1,220 robots per 10,000 manufacturing employees. China installs by far the most robots, but ranks 22nd for density because its factories also employ very many people."},
			{"lesson": "1-5", "question": "How does the da Vinci surgical system work?", "choices": ["It performs whole operations autonomously", "A surgeon at a console controls the instruments and the robot follows", "It only delivers medicine around the hospital", "It is programmed once and then repeats the same operation on every patient"], "answer": 1, "explanation": "da Vinci is a teleoperated robot: the surgeon controls the instruments from a console, and the robot does not operate on its own."},
			{"lesson": "1-5", "question": "What did the rescue robots at the World Trade Center find in 2001?", "choices": ["Several survivors trapped in voids", "Nothing at all, because they never entered the rubble", "No survivors, but several sets of human remains, some spotted only later on video", "Only structural cracks in nearby buildings"], "answer": 2, "explanation": "The robots found no survivors, but did find several sets of human remains. Some were missed by the people watching live and were spotted only when the video was reviewed."},
			{"lesson": "1-6", "question": "Using Grübler's formula, how many degrees of freedom does a planar four-bar linkage (4 links including ground, 4 revolute joints) have?", "choices": ["0", "1", "2", "3"], "answer": 1, "explanation": "DOF = 3(4 − 1 − 4) + 4 = 1, so a four-bar linkage moves with a single degree of freedom."},
			{"lesson": "1-6", "question": "A datasheet lists \"±0.03 mm (ISO 9283)\" for a robot. What does this figure describe?", "choices": ["Absolute accuracy: how close the robot gets to a commanded position", "Pose repeatability: how tightly repeated moves to the same pose cluster", "The maximum tool speed", "The backlash of the base reducer"], "answer": 1, "explanation": "Datasheets quote pose repeatability. Absolute accuracy is usually worse and can be improved by calibration."},
			{"lesson": "1-6", "question": "For a two-link planar arm, a reachable point inside the workspace (not at its edge) usually has how many inverse kinematics solutions?", "choices": ["None", "Exactly one", "Two, elbow up and elbow down", "Infinitely many"], "answer": 2, "explanation": "cos θ2 gives θ2 = ±value, so there are two solutions, elbow up and elbow down. They merge into one only at the workspace edge, where θ2 = 0."}
		],
		2: [
			{"lesson": "2-1", "question": "In ABB's Wizard Easy Programming, what happens to the blocks a user snaps together on the FlexPendant?", "choices": ["The controller runs the blocks directly with no translation", "They are converted in real time into ABB's RAPID language", "They are uploaded to a cloud service that rewrites them in Python", "They are only a drawing of the program and must be retyped by hand"], "answer": 1, "explanation": "Wizard is built on the Blockly concept, and the blocks are converted in real time into RAPID, which the controller then runs."},
			{
				lesson: '2-1',
				question: 'What is the main advantage of offline programming?',
				choices: ['It needs no computer', 'The robot can keep working while the next program is written in simulation', 'It is always free', 'It does not need any training'],
				answer: 1,
				explanation: 'Offline programming happens in simulation on a computer, so the real robot stays in production.'
			},
			{
				lesson: '2-1',
				question: 'Lead-through programming, where you guide the arm by hand, is the main method for which robots?',
				choices: ['SCARA robots', 'Collaborative robots (cobots)', 'Mars rovers', 'AGVs'],
				answer: 1,
				explanation: 'Lead-through (hand guiding) is the main programming method for cobots.'
			},
			{
				lesson: '2-2',
				question: 'Why can RobotStudio programs move to a real ABB robot with little adjustment?',
				choices: ['They are written in Python', 'RobotStudio runs a Virtual Controller, the same software as the real controller', 'The robot copies the simulation video', 'RobotStudio only supports one robot model'],
				answer: 1,
				explanation: 'RobotStudio is built on ABB\'s Virtual Controller, a copy of the software that runs the real robot controller.'
			},
			{
				lesson: '2-3',
				question: 'In URScript, which command moves the tool center point in a straight line?',
				choices: ['movej', 'movel', 'force_mode', 'set_digital_out'],
				answer: 1,
				explanation: 'movel moves the TCP in a straight line; movej moves in joint space.'
			},
			{
				lesson: '2-4',
				question: 'What problem does ROS solve that vendor languages do not?',
				choices: ['It makes robots cheaper', 'It gives a common layer so skills and code carry over between robot brands', 'It replaces the robot controller hardware', 'It removes the need for safety systems'],
				answer: 1,
				explanation: 'Vendor languages are tied to one brand. ROS adds a common layer, with drivers translating to each robot\'s native interface.'
			}
		],
		3: [
			{
				lesson: '3-1',
				question: 'In ROS, what is a topic?',
				choices: ['A request/response call between nodes', 'A named channel nodes publish messages to and subscribe to', 'A configuration value read at start-up', 'A long-running goal with feedback'],
				answer: 1,
				explanation: 'Topics carry continuous data like sensor readings. Services are request/response, actions are long-running goals, parameters are configuration.'
			},
			{
				lesson: '3-2',
				question: 'How do ROS 2 nodes find each other?',
				choices: ['They register with roscore', 'They discover each other automatically through DDS, with no master', 'Through a cloud server', 'They must be listed by hand in a file'],
				answer: 1,
				explanation: 'ROS 1 needs a central master. ROS 2\'s default DDS middleware lets nodes discover each other automatically.'
			},
			{
				lesson: '3-3',
				question: 'Why do you run "source /opt/ros/lyrical/setup.bash"?',
				choices: ['To download ROS', 'So the ros2 command can be found in that terminal', 'To update Ubuntu', 'To start Turtlesim'],
				answer: 1,
				explanation: 'Sourcing sets up the environment; it must run in every new terminal or be added to ~/.bashrc.'
			},
			{
				lesson: '3-4',
				question: 'In Turtlesim, which topic carries the velocity commands from the teleop node?',
				choices: ['/turtle1/pose', '/turtle1/cmd_vel', '/rosout', '/parameter_events'],
				answer: 1,
				explanation: 'The teleop node publishes on /turtle1/cmd_vel and the simulator subscribes to it.'
			},
			{
				lesson: '3-1',
				question: 'Your class shares one network and every robot hears every other robot. What should you set?',
				choices: ['A different ROS_DOMAIN_ID for each robot', 'A new roscore for each robot', 'A different message type', 'Nothing, ROS 2 cannot be separated'],
				answer: 0,
				explanation: 'Nodes only discover nodes on the same domain. Every node uses domain 0 by default, so set a different ROS_DOMAIN_ID, for example export ROS_DOMAIN_ID=7.'
			},
			{
				lesson: '3-5',
				question: 'What is the difference between RViz and Gazebo?',
				choices: ['They are the same tool', 'RViz displays data already flowing through ROS; Gazebo simulates the robot and its world with physics', 'RViz simulates physics; Gazebo only draws maps', 'Gazebo is for ROS 1 only'],
				answer: 1,
				explanation: 'RViz visualizes existing data and simulates nothing. Gazebo is a physics simulator connected through ros_gz.'
			},
			{
				lesson: '3-5',
				question: 'Which tool records messages on chosen topics so you can replay them later without the robot?',
				choices: ['rqt_graph', 'ros2 bag', 'RViz', 'tf2'],
				answer: 1,
				explanation: 'ros2 bag record saves the messages to a file and ros2 bag play republishes them.'
			}
		],
		4: [
			{"lesson": "4-3", "question": "Acemoglu and Restrepo studied US labor markets from 1990 to 2007. What did they find about one more robot per thousand workers?", "choices": ["It raised employment by 2 percentage points", "It reduced the employment-to-population ratio by 0.2 percentage points and wages by 0.42%", "It had no measurable effect on jobs or wages", "It eliminated 14% of all jobs"], "answer": 1, "explanation": "One more robot per thousand workers reduced the employment-to-population ratio by 0.2 percentage points and wages by 0.42% in the most exposed areas."},
			{"lesson": "4-3", "question": "Which practice best applies data minimization to a robot vacuum's camera?", "choices": ["Upload every image to the cloud in case it is useful later", "Collect only what the task needs, process it on the robot when possible and keep it no longer than necessary", "Share images with labeling contractors without telling users", "Record audio as well, to improve navigation"], "answer": 1, "explanation": "Data minimization means collecting only what the task needs, processing on the robot when possible, keeping data no longer than necessary and telling people what is recorded."},
			{
				lesson: '4-1',
				question: 'According to the NSPE Code of Ethics, what must engineers hold paramount?',
				choices: ['Profit for their employer', 'The safety, health and welfare of the public', 'Finishing on schedule', 'Their own reputation'],
				answer: 1,
				explanation: 'The NSPE code puts the safety, health and welfare of the public first.'
			},
			{
				lesson: '4-1',
				question: 'What should an engineer do about a conflict of interest?',
				choices: ['Ignore it if it is small', 'Disclose it', 'Hide it from the client', 'Ask the robot to decide'],
				answer: 1,
				explanation: 'Engineering codes ask engineers to disclose anything that could bias their judgment.'
			},
			{
				lesson: '4-2',
				question: 'Which standard covers the safety of industrial robots and robot cells?',
				choices: ['ISO 9001', 'ISO 10218', 'IEEE 802.11', 'ISO 13850'],
				answer: 1,
				explanation: 'ISO 10218 Part 1 covers industrial robots and Part 2 covers applications and cells. ISO 13850 covers emergency stop design.'
			},
			{
				lesson: '4-2',
				question: 'What does a watchdog timer do?',
				choices: ['Counts encoder ticks', 'Triggers a safe stop if the main program stops responding', 'Measures how long a program took to write', 'Speeds up the robot when idle'],
				answer: 1,
				explanation: 'A watchdog is part of the software safety layer that does not depend on the "smart" code.'
			}
		],
		5: [
			{
				lesson: '5-1',
				question: 'How should you power a DC motor in an Arduino robot?',
				choices: ['Directly from an Arduino pin', 'From the Arduino\'s 5V pin', 'From a separate battery through a motor driver, with grounds connected', 'From the USB cable'],
				answer: 2,
				explanation: 'Motors need more current than the board can supply. Use a separate battery and a motor driver, and connect the grounds.'
			},
			{
				lesson: '5-2',
				question: 'A motor driver runs at a 25% duty cycle from a 12 V supply. What is the average voltage?',
				choices: ['1.2 V', '3 V', '6 V', '12 V'],
				answer: 1,
				explanation: 'V_avg = D × V_cc = 0.25 × 12 V = 3 V.'
			},
			{
				lesson: '5-3',
				question: 'A quadrature encoder is rated 500 PPR. With 4x decoding, how many counts per revolution does the code see?',
				choices: ['125', '500', '1000', '2000'],
				answer: 3,
				explanation: 'CPR = PPR × 4 = 2000 counts per revolution.'
			},
			{
				lesson: '5-3',
				question: 'What happens to an incremental encoder\'s position when the power goes off?',
				choices: ['It is saved automatically', 'It is forgotten, so the robot has to home again', 'It doubles', 'Nothing, it never measured position'],
				answer: 1,
				explanation: 'Incremental encoders only measure change. Absolute encoders know their position at power-on.'
			},
			{
				lesson: '5-4',
				question: 'A robot is blocked, its integral term keeps growing, and it lurches when released. What is this called?',
				choices: ['Derivative kick', 'Integral windup', 'Backlash', 'Dead zone'],
				answer: 1,
				explanation: 'The integral keeps adding up error while the robot cannot move. Clamp the integral, or stop integrating while the output is at its limit.'
			},
			{"lesson": "5-5", "question": "According to its datasheet, roughly how wide is the HC-SR04 ultrasonic sensor's measuring angle?", "choices": ["About 1°", "About 15°", "About 90°", "A full 360°"], "answer": 1, "explanation": "The HC-SR04 has a measuring angle of about 15°, so it reports the nearest object anywhere in that cone."},
			{"lesson": "5-5", "question": "Why does the heading from a gyroscope slowly wander even when the robot's motion is measured correctly?", "choices": ["The accelerometer overrides it", "Its small bias is integrated along with the rotation rate, so the error keeps growing", "I²C communication loses data", "Gravity pulls the gyroscope off axis"], "answer": 1, "explanation": "Integrating the rate to get an angle also integrates the gyro's small bias, so heading error grows the longer the robot runs."},
			{"lesson": "5-6", "question": "In one update the left wheel travels 0.10 m and the right wheel 0.14 m on a robot with a 0.20 m wheelbase. What is d_theta?", "choices": ["0.04 rad", "0.12 rad", "0.20 rad", "0.70 rad"], "answer": 2, "explanation": "d_theta = (d_R − d_L) / b = (0.14 − 0.10) / 0.20 = 0.20 rad, a left (counterclockwise) turn."},
			{"lesson": "5-6", "question": "Which of these is a non-systematic odometry error?", "choices": ["Unequal wheel diameters", "Wrong wheelbase value in the code", "Wheel slip on a slippery floor", "Limited encoder resolution"], "answer": 2, "explanation": "Wheel slip comes from the robot's interaction with the floor and is unpredictable, so Borenstein and Feng class it as non-systematic."},
			{"lesson": "5-7", "question": "Why does the example state machine time its 600 ms turn with millis() instead of delay(600)?", "choices": ["delay() only works in setup()", "delay() would freeze loop(), so the robot would ignore its sensors and stop button", "millis() makes the motors faster", "delay() cannot count past 255 ms"], "answer": 1, "explanation": "Comparing millis() timestamps keeps loop() running, so every pass still reads the sensors and the stop button."},
			{"lesson": "5-7", "question": "Which are the primary states of a ROS 2 managed (lifecycle) node?", "choices": ["Idle, Listening, Responding, Stopped", "Unconfigured, Inactive, Active, Finalized", "FOLLOW_LINE, AVOID_OBSTACLE, SEARCH, STOP", "Starting, Execute, Held, Aborted"], "answer": 1, "explanation": "ROS 2 lifecycle nodes follow a state machine whose primary states are Unconfigured, Inactive, Active and Finalized."},
			{"lesson": "5-8", "question": "If P_pred = 0.05 and R = 0.05, what is the Kalman gain K?", "choices": ["0.025", "0.1", "0.5", "1.0"], "answer": 2, "explanation": "K = P_pred / (P_pred + R) = 0.05 / 0.10 = 0.5, so the estimate lands halfway between the prediction and the measurement."},
			{"lesson": "5-8", "question": "What happens when the sensor's noise R is small compared with the predicted uncertainty P_pred?", "choices": ["K is close to 0 and the filter ignores the sensor", "K is close to 1 and the filter follows the sensor", "P grows after the update", "The filter stops predicting"], "answer": 1, "explanation": "A small R relative to P_pred pushes K toward 1, so the estimate moves almost all the way to the measurement."}
		]
	}
};
