/*
	robOSStics: Chapter 10 quiz questions (8 questions).
	Loaded on demand by assets/js/learning.js (the lesson pages of this chapter and
	robotics-quiz.html?chapter=10); adds its array to window.RISE_COURSE.quizzes[10].
	answer is the index of the correct choice, and the answer must be stated in the
	lesson the question points to. When you change questions, bump `version` in
	course-data.js (it is the cache-busting query on this file).
*/
window.RISE_COURSE = window.RISE_COURSE || {};
window.RISE_COURSE.quizzes = window.RISE_COURSE.quizzes || {};
window.RISE_COURSE.quizzes[10] = [
	{"lesson": "10-1", "question": "Which statement about the odom frame is correct?", "choices": ["It never drifts", "It is continuous but can drift without bound", "It can jump at any time", "It is attached to the robot base"], "answer": 1, "explanation": "REP 105 says the pose in the odom frame is continuous, but it can drift over time without any bounds."},
	{"lesson": "10-1", "question": "In Nav2, which system provides the map to odom transform?", "choices": ["The odometry system", "The URDF", "A positioning system such as localization or SLAM", "The controller server"], "answer": 2, "explanation": "The map to odom transform comes from a positioning system (localization, mapping or SLAM); odometry provides odom to base_link."},
	{"lesson": "10-2", "question": "What is a costmap in Nav2?", "choices": ["A list of waypoints", "A regular 2D grid of cells holding a cost", "A 3D mesh of the building", "A table of motor currents"], "answer": 1, "explanation": "A costmap is a regular 2D grid of cells, each unknown, free, occupied or inflated."},
	{"lesson": "10-2", "question": "Which of these is an example use of a costmap filter?", "choices": ["Fusing wheel encoders with an IMU", "A speed restriction area", "Smoothing a planned path", "Activating a lifecycle node"], "answer": 1, "explanation": "Nav2 lists keep-out zones, speed restriction areas and preferred lanes as uses of costmap filters."},
	{"lesson": "10-3", "question": "What is the general task of a Nav2 controller?", "choices": ["To build the map", "To compute a valid control effort to follow the global plan", "To compute a path to the goal pose", "To start and stop the other servers"], "answer": 1, "explanation": "The controller computes control efforts to follow the path that the planner computed."},
	{"lesson": "10-3", "question": "What does the route server plan through?", "choices": ["The local costmap", "A predefined navigation graph", "The behavior tree", "The odom frame"], "answer": 1, "explanation": "The route server computes a route through a predefined navigation graph, not the free-space costmap."},
	{"lesson": "10-4", "question": "Which action does a client application use to ask Nav2 to drive to a position?", "choices": ["FollowPath", "ComputeRoute", "NavigateToPose", "ClearCostmap"], "answer": 2, "explanation": "A client reaches the BT Navigator through a NavigateToPose action."},
	{"lesson": "10-4", "question": "In which state is a lifecycle node right after its constructor has run?", "choices": ["Active", "Inactive", "Unconfigured", "Finalized"], "answer": 2, "explanation": "A node starts unconfigured; configuring moves it to inactive and activating moves it to active."}
];
