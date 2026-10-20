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
				{
					id: '1-1',
					title: 'Definition of Robots',
					objectives: [
						'Define a robot and explain why an industrial arm counts as one.',
						'Explain where the word "robot" comes from.',
						'Describe the sense, think, act loop.'
					],
					keyTerms: ['robot', 'R.U.R.', 'sensor', 'controller', 'actuator']
				},
				{
					id: '1-2',
					title: 'History and Evolution of Robots',
					objectives: [
						'Name early automata and the idea of a stored program behind Jacquard\'s loom.',
						'Place Unimate, SCARA, cobots and ROS on a timeline.',
						'Trace how robots went from fixed arms to machines that move around.'
					],
					keyTerms: ['automaton', 'Jacquard loom', 'Unimate', 'cobot']
				},
				{
					id: '1-3',
					title: 'Types of Robots',
					objectives: [
						'Tell apart industrial robots, cobots, mobile robots, SCARA robots and AGVs.',
						'Explain how AGVs differ from autonomous mobile robots (AMRs), and when to pick each.'
					],
					keyTerms: ['industrial robot', 'cobot', 'mobile robot', 'SCARA', 'AGV', 'AMR']
				},
				{
					id: '1-4',
					title: 'Preliminary Requirements',
					objectives: [
						'List the programming languages and math that robotics relies on.',
						'Explain why assembly and networking basics are useful.',
						'Adopt a test, adjust and retry mindset.'
					],
					keyTerms: ['Python', 'C++', 'assembly', 'TCP', 'UDP', 'Modbus TCP']
				},
				{
					id: '1-5',
					title: 'Common Applications of Robotics',
					objectives: [
						'Give examples of robots in production, human interaction and exploration.',
						'Explain how robots protect human lives in dangerous work, using the Mars, World Trade Center and Fukushima cases.'
					],
					keyTerms: ['service robot', 'Mars rover', 'AutoNav', 'search and rescue']
				}
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
					title: 'Types of Programming',
					objectives: [
						'Compare online (teach pendant, lead-through) and offline programming.',
						'Choose a method for a given job.'
					],
					keyTerms: ['offline programming', 'teach pendant', 'lead-through', 'MoveJ', 'MoveL']
				},
				{
					id: '2-2',
					title: 'Common Programming Environments',
					objectives: [
						'Describe what ABB RobotStudio is used for.',
						'Describe how PolyScope programs are built and where URScript fits in.'
					],
					keyTerms: ['RobotStudio', 'Virtual Controller', 'PolyScope', 'program tree', 'URCaps']
				},
				{
					id: '2-3',
					title: 'Common Programming Languages',
					objectives: [
						'Read a short URScript and RAPID program.',
						'Compare URScript and RAPID.',
						'Explain what RRL was and name KRL and IRL.'
					],
					keyTerms: ['URScript', 'RAPID', 'movej', 'movel', 'robtarget', 'KRL']
				},
				{
					id: '2-4',
					title: 'Intro to ROS (Vendor-Agnostic)',
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
					title: 'Definition and Introduction',
					objectives: [
						'Explain what ROS is and is not.',
						'Define nodes, topics, services, actions and parameters.',
						'Use ROS_DOMAIN_ID to keep robots apart on a shared network.'
					],
					keyTerms: ['node', 'topic', 'service', 'action', 'parameter', 'SLAM', 'ROS_DOMAIN_ID', 'Willow Garage']
				},
				{
					id: '3-2',
					title: 'ROS 1 vs. ROS 2',
					objectives: [
						'Explain how ROS 2 discovery with DDS differs from the ROS 1 master.',
						'Choose Quality of Service settings and a middleware for a topic.',
						'Describe launch files and why new projects should use ROS 2.'
					],
					keyTerms: ['roscore', 'DDS', 'QoS', 'launch file', 'Noetic']
				},
				{
					id: '3-3',
					title: 'Installing ROS on Your Local Environment',
					objectives: [
						'Pick an install route for your operating system.',
						'Install and source ROS 2 on Ubuntu.'
					],
					keyTerms: ['Lyrical Luth', 'Jazzy Jalisco', 'WSL 2', 'setup.bash']
				},
				{
					id: '3-4',
					title: 'Running Your First Example (Turtlesim)',
					objectives: [
						'Run Turtlesim and drive the turtle from the keyboard.',
						'Inspect nodes, topics and message types with the ros2 command.',
						'Call a service to spawn a turtle, and remap topics to drive it.'
					],
					keyTerms: ['turtlesim', 'teleop', 'ros2 topic echo', '/turtle1/cmd_vel', 'Twist', '/spawn', 'remapping']
				},
				{
					id: '3-5',
					title: 'ROS Tools',
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
					title: 'Ethics in Engineering',
					objectives: [
						'State the first duty in engineering codes of ethics.',
						'List the core duties shared by the NSPE and IEEE codes.',
						'Name the NSPE Fundamental Canons and the three principles of the IEEE code.'
					],
					keyTerms: ['NSPE Code of Ethics', 'Fundamental Canons', 'IEEE Code of Ethics', 'conflict of interest']
				},
				{
					id: '4-2',
					title: 'Ethics in Robotics (Hardware, Software)',
					objectives: [
						'Name the main robot safety standards.',
						'Describe hardware safeguards and the software safety layer.',
						'Explain what makes an application collaborative and how people stay safe while teaching a robot.'
					],
					keyTerms: ['ISO 10218', 'emergency stop', 'power and force limiting', 'watchdog timer', 'geofencing']
				}
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
					title: 'Arduino for Robotics',
					objectives: [
						'Choose the right Arduino pin type for a job.',
						'Structure a sketch with setup() and loop().',
						'Drive servos and DC motors and read an ultrasonic sensor.'
					],
					keyTerms: ['digital pin', 'PWM pin', 'analog input', 'H-bridge', 'HC-SR04', 'INPUT_PULLUP']
				},
				{
					id: '5-2',
					title: 'Pulse Width Modulation (PWM)',
					objectives: [
						'Explain duty cycle and frequency.',
						'Compute average voltage from duty cycle.',
						'Compare DC motor PWM with servo PWM.'
					],
					keyTerms: ['duty cycle', 'frequency', 'analogWrite', 'H-bridge', 'flyback diode']
				},
				{
					id: '5-3',
					title: 'Encoders and Shaft Encoders',
					objectives: [
						'Compare incremental and absolute encoders.',
						'Explain quadrature decoding and CPR = PPR × 4.',
						'Convert ticks to distance and speed.'
					],
					keyTerms: ['incremental encoder', 'absolute encoder', 'quadrature', 'CPR', 'odometry']
				},
				{
					id: '5-4',
					title: 'PID Control',
					objectives: [
						'Explain what the P, I and D terms each do.',
						'Write a discrete-time PID update and tune it by hand.',
						'Avoid integral windup and derivative kick.'
					],
					keyTerms: ['setpoint', 'error', 'Kp', 'Ki', 'Kd', 'Ziegler–Nichols', 'integral windup']
				}
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
				choices: ['Rovers have no cameras', 'A radio signal takes roughly 3 to 22 minutes to reach Mars one way', 'Joysticks are not allowed by NASA', 'The rovers do not have motors'],
				answer: 1,
				explanation: 'The signal delay is minutes long, so rovers like Perseverance use AutoNav to plan their own paths around hazards.'
			}
		],
		2: [
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
			}
		]
	}
};
