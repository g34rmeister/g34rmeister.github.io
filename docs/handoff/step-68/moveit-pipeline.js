// Placeholder text: The MoveIt 2 pipeline explorer needs JavaScript. With it on, you can inspect each stage from URDF/xacro to hardware, switch between OMPL and Pilz planners, and compare mock hardware with a real arm.

// Facts used (from robotics-4-8.html):
// - Line 230: URDF (Unified Robot Description Format) is an XML file describing the robot as a tree of links (rigid bodies) connected by joints.
// - Line 240: Universal Robots uses xacro macros so models reuse the same kinematics and configure meshes, DH parameters, and joint limits from YAML files.
// - Line 249: URDF says what the robot is (geometry, kinematics, hard limits); SRDF (Semantic Robot Description Format) represents semantic information about the robot structure.
// - Lines 252, 258: UR's SRDF defines one planning group (ur_manipulator from base_link to tool0) and three named poses (home, up, test_configuration).
// - Line 261: SRDF lists 11 <disable_collisions> pairs stored in MoveIt's Allowed Collision Matrix (ACM) to skip those checks.
// - Line 269: ros2_control's controller manager connects hardware interfaces to controllers.
// - Lines 272, 275: mock_components/GenericSystem mirrors commands to states; use_mock_hardware selects GenericSystem vs the real UR hardware plugin.
// - Line 275: Mock hardware is useful for testing launch files, descriptions, and MoveIt integration without a robot.
// - Line 278: Mock hardware is not a physics simulator (arm can jump instead of accelerating) and does not test TCP pose broadcaster, passthrough trajectory controller, force mode, or GPIO (nor timing, contact, or I/O).
// - Lines 284, 287: joint_trajectory_controller (JTC) accepts FollowJointTrajectory goals and commands hardware; joint_state_broadcaster reports state interfaces on /joint_states for MoveIt and robot_state_publisher.
// - Lines 292, 298-300: move_group is MoveIt's central integrator node reading URDF, SRDF, and *_moveit_config files, listening on /joint_states and TF, and talking to controllers via FollowJointTrajectoryAction.
// - Lines 309, 312, 315: planning scene represents the world and robot state on /planning_scene; FCL checks meshes, primitives, and Octomaps (skipping ACM pairs); KDL plugin solves inverse kinematics.
// - Lines 320, 323: OMPL is the default planner and implements randomized motion planners; handles clutter well, promises nothing about tool path shape, and two plans to the same goal can differ.
// - Lines 326, 333-335, 339, 342: Pilz industrial motion planner generates teach-pendant motions (PTP/MoveJ, LIN/MoveL, CIRC/MoveC) and chains moves with blend_radius; LIN keeps a straight Cartesian path.
// - Lines 347, 370, 372: Planner finds a path (joint configurations); planning adapters (e.g. AddTimeOptimalParameterization) turn it into a timed trajectory sent as a FollowJointTrajectory goal.
// - Lines 350, 394: A real UR can run slower than planned due to speed scaling; swapping mock for a real UR changes only the hardware plugin.

function initMoveitPipeline(root) {
	var W = 560, H = 228;
	var svg = plotFrame(W, H, 'MoveIt 2 motion planning pipeline from URDF/xacro, SRDF, move_group, and planning scene to planner, trajectory, ros2_control, and hardware');

	var defs = s('defs', {});
	var mk = s('marker', { id: 'arrow-moveit-pipe', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
	mk.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', 'class': 'd-fill' }));
	defs.appendChild(mk);
	svg.appendChild(defs);

	var plannerMode = 'ompl';
	var hwMode = 'mock';
	var selected = 'urdf';

	var BOX_W = 118, BOX_H = 68;
	var COLS = [11, 151, 291, 431];
	var ROWS = [16, 144];

	var STAGES = [
		{
			id: 'urdf',
			title: 'URDF / xacro',
			sub1: 'links, joints,',
			sub2: 'hard limits',
			x: COLS[0], y: ROWS[0],
			info: function () {
				return 'URDF / xacro: The URDF XML file describes the robot as a tree of links (rigid bodies) connected by joints, stating its geometry, kinematics, and hard limits. Universal Robots uses xacro macros so models reuse the same kinematics and load meshes, DH parameters, and limits from YAML files.';
			}
		},
		{
			id: 'srdf',
			title: 'SRDF',
			sub1: 'groups, poses,',
			sub2: 'ACM',
			x: COLS[1], y: ROWS[0],
			info: function () {
				return 'SRDF: Adds semantic information on top of the URDF: planning groups (such as ur_manipulator from base_link to tool0), named poses (home, up, test_configuration), and disabled collision pairs. MoveIt stores those pairs in its Allowed Collision Matrix (ACM) and skips checking them.';
			}
		},
		{
			id: 'move_group',
			title: 'move_group',
			sub1: 'central',
			sub2: 'integrator',
			x: COLS[2], y: ROWS[0],
			info: function () {
				return 'move_group: MoveIt\'s central integrator node, pulling the URDF, SRDF, and *_moveit_config files together to provide ROS actions and services. It listens on /joint_states and TF, and talks to the robot\'s controllers through the FollowJointTrajectoryAction interface.';
			}
		},
		{
			id: 'planning_scene',
			title: 'planning scene',
			sub1: 'FCL collisions',
			sub2: '+ KDL IK',
			x: COLS[3], y: ROWS[0],
			info: function () {
				return 'planning scene: Represents the world around the robot and the state of the robot itself, updated on /planning_scene. FCL checks collisions against meshes, primitive shapes, and Octomaps (skipping ACM pairs), while the KDL plugin solves inverse kinematics.';
			}
		},
		{
			id: 'planner',
			title: 'planner: OMPL',
			sub1: 'randomized',
			sub2: 'default',
			x: COLS[0], y: ROWS[1],
			info: function () {
				if (plannerMode === 'ompl') {
					return 'planner (OMPL): OMPL is the default and implements randomized motion planners that search for an obstacle-free path using MoveIt\'s robot model and collision checks. It handles clutter well, but promises nothing about tool path shape and two plans to the same goal can differ (unlike Pilz\'s teach-pendant PTP, LIN, and CIRC moves).';
				}
				return 'planner (Pilz): Pilz works like a teach pendant, generating PTP (MoveJ), LIN (MoveL), and CIRC (MoveC) trajectories and can chain moves with a blend_radius. Unlike OMPL\'s randomized paths, Pilz plans a straight Cartesian trajectory with LIN when path shape matters.';
			}
		},
		{
			id: 'trajectory',
			title: 'trajectory',
			sub1: 'adapters:',
			sub2: 'path \u2192 timed',
			x: COLS[1], y: ROWS[1],
			info: function () {
				return 'trajectory: A planner first finds a path (a list of joint configurations), and planning adapters (such as AddTimeOptimalParameterization) add timing, velocity, and acceleration at every point to respect limits. MoveIt sends that timed trajectory as a FollowJointTrajectory action goal.';
			}
		},
		{
			id: 'ros2_control',
			title: 'ros2_control',
			sub1: 'JTC + state',
			sub2: 'broadcaster',
			x: COLS[2], y: ROWS[1],
			info: function () {
				return 'ros2_control: Its controller manager connects controllers to hardware interfaces. The joint_trajectory_controller (JTC) accepts MoveIt\'s FollowJointTrajectory goal and commands the hardware, while joint_state_broadcaster reports state interfaces on /joint_states for MoveIt and robot_state_publisher.';
			}
		},
		{
			id: 'hardware',
			title: 'mock hardware',
			sub1: 'GenericSystem',
			sub2: 'mirrors state',
			x: COLS[3], y: ROWS[1],
			info: function () {
				if (hwMode === 'mock') {
					return 'mock hardware: Mirrors commands straight into states (mock_components/GenericSystem), testing launch files, descriptions, ROS piping, and MoveIt integration without a robot. It is not a physics simulator and does not test acceleration, timing, contact, the TCP pose broadcaster, passthrough trajectory controller, force mode, or GPIO.';
				}
				return 'real arm: Setting use_mock_hardware:=false swaps only the hardware plugin to the real UR hardware plugin. Unlike mock hardware (which only mirrors commands to test piping, launch files, and MoveIt integration), a real arm exercises real acceleration, timing (including speed scaling), contact, force mode, and I/O.';
			}
		}
	];

	var ARROWS = [
		{ type: 'line', x1: COLS[0] + BOX_W, y1: ROWS[0] + BOX_H / 2, x2: COLS[1] - 2, y2: ROWS[0] + BOX_H / 2 },
		{ type: 'line', x1: COLS[1] + BOX_W, y1: ROWS[0] + BOX_H / 2, x2: COLS[2] - 2, y2: ROWS[0] + BOX_H / 2 },
		{ type: 'line', x1: COLS[2] + BOX_W, y1: ROWS[0] + BOX_H / 2, x2: COLS[3] - 2, y2: ROWS[0] + BOX_H / 2 },
		{ type: 'path', d: 'M ' + (COLS[3] + BOX_W / 2) + ',' + (ROWS[0] + BOX_H) + ' L ' + (COLS[3] + BOX_W / 2) + ',114 L ' + (COLS[0] + BOX_W / 2) + ',114 L ' + (COLS[0] + BOX_W / 2) + ',' + (ROWS[1] - 2) },
		{ type: 'line', x1: COLS[0] + BOX_W, y1: ROWS[1] + BOX_H / 2, x2: COLS[1] - 2, y2: ROWS[1] + BOX_H / 2 },
		{ type: 'line', x1: COLS[1] + BOX_W, y1: ROWS[1] + BOX_H / 2, x2: COLS[2] - 2, y2: ROWS[1] + BOX_H / 2 },
		{ type: 'line', x1: COLS[2] + BOX_W, y1: ROWS[1] + BOX_H / 2, x2: COLS[3] - 2, y2: ROWS[1] + BOX_H / 2 }
	];

	ARROWS.forEach(function (a) {
		var el;
		if (a.type === 'line') {
			el = s('line', { 'class': 'd-line', x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2, 'marker-end': 'url(#arrow-moveit-pipe)' });
		} else {
			el = s('path', { 'class': 'd-line', d: a.d, fill: 'none', 'marker-end': 'url(#arrow-moveit-pipe)' });
		}
		svg.appendChild(el);
	});

	var stageEls = {};
	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

	STAGES.forEach(function (st) {
		var g = s('g', {
			tabindex: '0',
			role: 'button',
			'aria-label': st.title + ', ' + st.sub1 + ' ' + st.sub2,
			style: 'cursor: pointer;'
		});
		var rect = s('rect', { 'class': 'd-box', x: st.x, y: st.y, width: BOX_W, height: BOX_H, rx: 4 });
		var tTitle = s('text', { 'class': 'd-title', x: st.x + BOX_W / 2, y: st.y + 23, 'text-anchor': 'middle', style: 'font-size: 12px;' });
		tTitle.textContent = st.title;
		var tSub1 = s('text', { 'class': 'd-muted', x: st.x + BOX_W / 2, y: st.y + 41, 'text-anchor': 'middle', style: 'font-size: 11px;' });
		tSub1.textContent = st.sub1;
		var tSub2 = s('text', { 'class': 'd-muted', x: st.x + BOX_W / 2, y: st.y + 56, 'text-anchor': 'middle', style: 'font-size: 11px;' });
		tSub2.textContent = st.sub2;

		g.appendChild(rect);
		g.appendChild(tTitle);
		g.appendChild(tSub1);
		g.appendChild(tSub2);

		function activate() {
			selected = st.id;
			update();
		}

		g.addEventListener('click', activate);
		g.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
				e.preventDefault();
				activate();
			}
		});

		svg.appendChild(g);
		stageEls[st.id] = { g: g, title: tTitle, sub1: tSub1, sub2: tSub2, stage: st };
	});

	var btnOmpl = button('Planner: OMPL', function () {
		plannerMode = 'ompl';
		selected = 'planner';
		update();
	}, 'Switch planner to OMPL');

	var btnPilz = button('Planner: Pilz', function () {
		plannerMode = 'pilz';
		selected = 'planner';
		update();
	}, 'Switch planner to Pilz');

	var btnMock = button('Mock hardware', function () {
		hwMode = 'mock';
		selected = 'hardware';
		update();
	}, 'Switch hardware to mock hardware');

	var btnReal = button('Real arm', function () {
		hwMode = 'real';
		selected = 'hardware';
		update();
	}, 'Switch hardware to real arm');

	function update() {
		var p = stageEls.planner;
		if (plannerMode === 'ompl') {
			p.title.textContent = 'planner: OMPL';
			p.sub1.textContent = 'randomized';
			p.sub2.textContent = 'default';
		} else {
			p.title.textContent = 'planner: Pilz';
			p.sub1.textContent = 'PTP, LIN, CIRC';
			p.sub2.textContent = 'teach-pendant';
		}
		p.g.setAttribute('aria-label', p.title.textContent + ', ' + p.sub1.textContent + ' ' + p.sub2.textContent);

		var hw = stageEls.hardware;
		if (hwMode === 'mock') {
			hw.title.textContent = 'mock hardware';
			hw.sub1.textContent = 'GenericSystem';
			hw.sub2.textContent = 'mirrors state';
		} else {
			hw.title.textContent = 'real arm';
			hw.sub1.textContent = 'UR hardware';
			hw.sub2.textContent = 'plugin';
		}
		hw.g.setAttribute('aria-label', hw.title.textContent + ', ' + hw.sub1.textContent + ' ' + hw.sub2.textContent);

		btnOmpl.setAttribute('aria-pressed', plannerMode === 'ompl' ? 'true' : 'false');
		btnPilz.setAttribute('aria-pressed', plannerMode === 'pilz' ? 'true' : 'false');
		btnMock.setAttribute('aria-pressed', hwMode === 'mock' ? 'true' : 'false');
		btnReal.setAttribute('aria-pressed', hwMode === 'real' ? 'true' : 'false');

		var activeStage = null;
		STAGES.forEach(function (st) {
			var isSel = selected === st.id;
			stageEls[st.id].g.classList.toggle('d-active', isSel);
			stageEls[st.id].g.setAttribute('aria-pressed', isSel ? 'true' : 'false');
			if (isSel) activeStage = st;
		});

		readout.textContent = activeStage
			? activeStage.info()
			: 'Click or select a stage box to inspect what it does in MoveIt 2.';
	}

	var wrap = h('figure', { 'class': 'lesson-diagram', style: 'margin: 8px 0; padding: 0; border: 0;' }, [svg]);
	var btnRow = h('div', { 'class': 'widget-buttons' }, [btnOmpl, btnPilz, btnMock, btnReal]);

	root.replaceChildren(frame('MoveIt 2 motion planning pipeline', [
		h('p', { 'class': 'widget-note', text: 'Click or focus any stage (Enter or Space) to read what it does. Switch planner or hardware below.' }),
		wrap,
		btnRow,
		readout
	]));
	update();
}
