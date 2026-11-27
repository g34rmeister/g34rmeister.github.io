// Placeholder text: The launch tree needs JavaScript. With it on, you can inspect the mimic launch tree, test launch arguments, and see which parameter values survive a node restart.

// Facts used (from robotics-4-7.html):
// - L256-287, L289, L301-333, L337-339: turtlesim_mimic_launch.py defines generate_launch_description() returning a LaunchDescription with three Node actions (no launch arguments declared):
//   1) L264-270: package='turtlesim', namespace='turtlesim1', executable='turtlesim_node', name='sim', arguments=['--ros-args', '--log-level', 'info']
//   2) L271-277: package='turtlesim', namespace='turtlesim2', executable='turtlesim_node', name='sim', ros_arguments=['--log-level', 'warn']
//   3) L278-286: package='turtlesim', executable='mimic', name='mimic', remappings=[('/input/pose', '/turtlesim1/turtle1/pose'), ('/output/cmd_vel', '/turtlesim2/turtle1/cmd_vel')]
// - L292, L313, L317, L321, L330, L546: Full node names are /turtlesim1/sim and /turtlesim2/sim (plus mimic), and topics are prefixed by each namespace (e.g. /turtlesim1/turtle1/pose). "Unique namespaces allow the system to start two nodes without node name or topic name conflicts." (L292); "two nodes with the same name and no distinct namespaces clash; unique namespaces avoid node and topic name conflicts." (L546)
// - L295, L315, L323: arguments passes ROS and non-ROS options (needs --ros-args); ros_arguments is for ROS-only options cleanly without --ros-args.
// - L298, L301, L318, L326-329, L345: mimic subscribes to /turtlesim1/turtle1/pose (remapped from /input/pose) and publishes on /turtlesim2/turtle1/cmd_vel (remapped from /output/cmd_vel) so turtlesim2 mimics turtlesim1's movements.
// - L405, L407-415, L420-423: DeclareLaunchArgument('turtlesim_ns', default_value='turtlesim1') with LaunchConfiguration('turtlesim_ns') sets namespace=turtlesim_ns on Node(package='turtlesim', namespace=turtlesim_ns, executable='turtlesim_node', name='sim'). LaunchConfiguration is evaluated during execution of the launch description.
// - L418, L425: Command-line override syntax name:=value, e.g. background_r:=255 (L418); XML <arg name="background_r" default="0" /> (L425).
// - L433, L435-455: IncludeLaunchDescription includes launch_tutorial/launch/example_substitutions_launch.py and passes launch_arguments={'turtlesim_ns': 'turtlesim2', 'use_provided_red': 'True', 'new_background_r': colors['background_r']} where colors = {'background_r': '200'} (L441).
// - L482: "The lifetime of a parameter is tied to the lifetime of the node."
// - L497, L501: ros2 param set /turtlesim background_r 150 changes the background color at once; "A value set this way is lost when the node restarts."
// - L501, L511-515, L522-530: A YAML parameter file (turtlesim.yaml with /turtlesim2/sim: ros__parameters: background_r: 150, background_g: 86, background_b: 255) passed via parameters=[...] is applied at node startup.
// - L535: "Tune a running node with ros2 param set, then save the result with ros2 param dump."

function initLaunchTree(root) {
	var whatIfClash = false;       // Panel 1 what-if toggle
	var subMode = 'defaults';      // Panel 2: 'defaults' | 'bg255' | 'include'
	var paramSource = 'param_set'; // Panel 3: 'param_set' | 'yaml'
	var restarted = false;         // Panel 3 restart state
	var activePanel = 'mimic';     // 'mimic' | 'substitutions' | 'param'

	var svgMimic = plotFrame(560, 315, 'Launch tree diagram for turtlesim_mimic_launch.py');
	var svgSub = plotFrame(560, 192, 'Launch arguments diagram for example_substitutions_launch.py');
	var svgParam = plotFrame(560, 122, 'Parameter lifetime panel comparing ros2 param set and YAML parameter file on node restart');
	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

	var btnWhatIfClash = button('Same namespace for both simulators', function () {
		whatIfClash = !whatIfClash;
		activePanel = 'mimic';
		draw();
	});

	var btnSubDefault = button('defaults', function () {
		subMode = 'defaults';
		activePanel = 'substitutions';
		draw();
	});
	var btnSubBg255 = button('background_r:=255', function () {
		subMode = 'bg255';
		activePanel = 'substitutions';
		draw();
	});
	var btnSubInclude = button('included from a top-level launch file', function () {
		subMode = 'include';
		activePanel = 'substitutions';
		draw();
	});

	var btnParamSet = button('Set with ros2 param set', function () {
		paramSource = 'param_set';
		restarted = false;
		activePanel = 'param';
		draw();
	});
	var btnYaml = button('Loaded from YAML at launch', function () {
		paramSource = 'yaml';
		restarted = false;
		activePanel = 'param';
		draw();
	});
	var btnRestart = button('Restart node', function () {
		restarted = true;
		activePanel = 'param';
		draw();
	});

	function addSvgText(svg, cls, x, y, text, opts) {
		var attrs = { 'class': cls, x: x, y: y };
		if (opts) {
			if (opts.anchor) attrs['text-anchor'] = opts.anchor;
			if (opts.size) attrs['font-size'] = opts.size;
			if (opts.fill) attrs.style = 'fill: ' + opts.fill + ';';
		}
		var el = s('text', attrs);
		el.textContent = text;
		svg.appendChild(el);
		return el;
	}

	function addMarker(defs, id, color) {
		var mk = s('marker', {
			id: id,
			viewBox: '0 0 10 10',
			refX: '9',
			refY: '5',
			markerWidth: '6',
			markerHeight: '6',
			orient: 'auto-start-reverse'
		});
		mk.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', fill: color }));
		defs.appendChild(mk);
	}

	function drawMimicTree() {
		svgMimic.replaceChildren();
		var ns2 = whatIfClash ? 'turtlesim1' : 'turtlesim2';
		var node2Full = '/' + ns2 + '/sim';

		var defs = s('defs', {});
		addMarker(defs, 'lt-arrow', 'var(--wp-link)');
		addMarker(defs, 'lt-arrow-muted', 'var(--wp-text-muted)');
		svgMimic.appendChild(defs);

		// Root launch file box
		svgMimic.appendChild(s('rect', { 'class': 'd-box-gold', x: 90, y: 8, width: 380, height: 50, rx: 4 }));
		addSvgText(svgMimic, 'd-title', 280, 28, 'turtlesim_mimic_launch.py', { anchor: 'middle', size: '14px' });
		addSvgText(svgMimic, 'd-muted', 280, 46, 'LaunchDescription (3 Node actions)', { anchor: 'middle', size: '12px' });

		// Tree edges to the 3 Node actions
		svgMimic.appendChild(s('line', { 'class': 'd-line', x1: 200, y1: 58, x2: 94, y2: 90, 'marker-end': 'url(#lt-arrow-muted)' }));
		svgMimic.appendChild(s('line', { 'class': 'd-line', x1: 280, y1: 58, x2: 280, y2: 90, 'marker-end': 'url(#lt-arrow-muted)' }));
		svgMimic.appendChild(s('line', { 'class': 'd-line', x1: 360, y1: 58, x2: 466, y2: 90, 'marker-end': 'url(#lt-arrow-muted)' }));
		addSvgText(svgMimic, 'd-muted', 132, 74, 'Node', { anchor: 'end', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 287, 78, 'Node', { size: '11px' });
		addSvgText(svgMimic, 'd-muted', 428, 74, 'Node', { size: '11px' });

		// Node 1 (left): /turtlesim1/sim
		svgMimic.appendChild(s('rect', { 'class': whatIfClash ? 'd-box-gold' : 'd-box', x: 8, y: 92, width: 172, height: 104, rx: 4 }));
		addSvgText(svgMimic, 'd-title', 94, 112, '/turtlesim1/sim', { anchor: 'middle', size: '14px', fill: whatIfClash ? 'var(--wp-gold-text)' : null });
		addSvgText(svgMimic, 'd-muted', 94, 131, 'ns: turtlesim1, name: sim', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 94, 148, 'exec: turtlesim_node', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 94, 165, 'arguments (log: info)', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 94, 182, 'pkg: turtlesim', { anchor: 'middle', size: '11px' });

		// Node 2 (center): mimic
		svgMimic.appendChild(s('rect', { 'class': 'd-box', x: 194, y: 92, width: 172, height: 104, rx: 4 }));
		addSvgText(svgMimic, 'd-title', 280, 112, 'mimic', { anchor: 'middle', size: '14px' });
		addSvgText(svgMimic, 'd-muted', 280, 131, 'ns: (none), name: mimic', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 280, 148, 'exec: mimic', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 280, 165, 'remaps /input/pose', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 280, 182, 'remaps /output/cmd_vel', { anchor: 'middle', size: '11px' });

		// Node 3 (right): /turtlesim2/sim (or colliding /turtlesim1/sim in what-if)
		svgMimic.appendChild(s('rect', { 'class': whatIfClash ? 'd-box-gold' : 'd-box', x: 380, y: 92, width: 172, height: 104, rx: 4 }));
		addSvgText(svgMimic, 'd-title', 466, 112, node2Full, { anchor: 'middle', size: '14px', fill: whatIfClash ? 'var(--wp-gold-text)' : null });
		addSvgText(svgMimic, 'd-muted', 466, 131, 'ns: ' + ns2 + ', name: sim', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 466, 148, 'exec: turtlesim_node', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 466, 165, 'ros_arguments (log: warn)', { anchor: 'middle', size: '11px' });
		addSvgText(svgMimic, 'd-muted', 466, 182, 'pkg: turtlesim', { anchor: 'middle', size: '11px' });

		// Pose topic link (Node 1 -> mimic)
		svgMimic.appendChild(s('path', {
			'class': 'd-strong',
			d: 'M 94,196 V 240 H 250 V 201',
			'marker-end': 'url(#lt-arrow)'
		}));
		addSvgText(svgMimic, 'd-title', 166, 258, '/turtlesim1/turtle1/pose', { anchor: 'middle', size: '12px' });
		addSvgText(svgMimic, 'd-muted', 166, 275, 'remapped from /input/pose', { anchor: 'middle', size: '11px' });

		// cmd_vel topic link (mimic -> Node 3)
		if (whatIfClash) {
			svgMimic.appendChild(s('line', {
				'class': 'd-line',
				'stroke-dasharray': '4 4',
				x1: 310, y1: 196, x2: 310, y2: 240
			}));
			addSvgText(svgMimic, 'd-title', 396, 258, '/turtlesim2/turtle1/cmd_vel', { anchor: 'middle', size: '12px', fill: 'var(--wp-gold-text)' });
			addSvgText(svgMimic, 'd-muted', 396, 275, 'no /turtlesim2/sim node', { anchor: 'middle', size: '11px' });
			addSvgText(svgMimic, 'd-title', 280, 296, 'What-if clash: both nodes use /turtlesim1/sim', { anchor: 'middle', size: '11px', fill: 'var(--wp-gold-text)' });
			addSvgText(svgMimic, 'd-muted', 280, 310, 'Unique namespaces avoid name conflicts.', { anchor: 'middle', size: '11px' });
		} else {
			svgMimic.appendChild(s('path', {
				'class': 'd-strong',
				d: 'M 310,196 V 240 H 466 V 201',
				'marker-end': 'url(#lt-arrow)'
			}));
			addSvgText(svgMimic, 'd-title', 396, 258, '/turtlesim2/turtle1/cmd_vel', { anchor: 'middle', size: '12px' });
			addSvgText(svgMimic, 'd-muted', 396, 275, 'remapped from /output/cmd_vel', { anchor: 'middle', size: '11px' });
			addSvgText(svgMimic, 'd-muted', 280, 302, 'Unique namespaces avoid name conflicts.', { anchor: 'middle', size: '12px' });
		}

		svgMimic.setAttribute('aria-label',
			whatIfClash
				? 'What-if collision in turtlesim_mimic_launch.py: both simulator nodes use namespace turtlesim1, clashing on /turtlesim1/sim and its topics. Unique namespaces avoid name conflicts.'
				: 'Launch tree for turtlesim_mimic_launch.py: starts /turtlesim1/sim, mimic, and /turtlesim2/sim. mimic remaps /input/pose to /turtlesim1/turtle1/pose and /output/cmd_vel to /turtlesim2/turtle1/cmd_vel.'
		);
	}

	function drawSubTree() {
		svgSub.replaceChildren();
		var defs = s('defs', {});
		addMarker(defs, 'lt-sub-arrow', 'var(--wp-link)');
		svgSub.appendChild(defs);

		var ns = (subMode === 'include') ? 'turtlesim2' : 'turtlesim1';
		var fullNode = '/' + ns + '/sim';

		// Left box: arguments and substitutions
		svgSub.appendChild(s('rect', { 'class': subMode === 'defaults' ? 'd-box' : 'd-box-gold', x: 8, y: 12, width: 244, height: 146, rx: 4 }));
		if (subMode === 'defaults') {
			addSvgText(svgSub, 'd-title', 130, 34, 'example_substitutions_launch.py', { anchor: 'middle', size: '12px' });
			addSvgText(svgSub, 'd-muted', 130, 58, 'DeclareLaunchArgument:', { anchor: 'middle', size: '11px' });
			addSvgText(svgSub, 'd-muted', 130, 77, "turtlesim_ns = 'turtlesim1'", { anchor: 'middle', size: '11px' });
			addSvgText(svgSub, 'd-muted', 130, 96, 'background_r default: 0 (XML)', { anchor: 'middle', size: '11px' });
			addSvgText(svgSub, 'd-muted', 130, 118, "LaunchConfiguration('turtlesim_ns')", { anchor: 'middle', size: '11px' });
			addSvgText(svgSub, 'd-muted', 130, 142, 'Evaluated at launch execution', { anchor: 'middle', size: '11px' });
		} else if (subMode === 'bg255') {
			addSvgText(svgSub, 'd-title', 130, 34, 'example_substitutions_launch.py', { anchor: 'middle', size: '12px' });
			addSvgText(svgSub, 'd-muted', 130, 58, "turtlesim_ns: 'turtlesim1' (default)", { anchor: 'middle', size: '11px' });
			addSvgText(svgSub, 'd-title', 130, 80, 'CLI: background_r:=255', { anchor: 'middle', size: '12px', fill: 'var(--wp-link)' });
			addSvgText(svgSub, 'd-muted', 130, 106, "LaunchConfiguration('turtlesim_ns')", { anchor: 'middle', size: '11px' });
			addSvgText(svgSub, 'd-muted', 130, 142, 'name:=value overrides default', { anchor: 'middle', size: '11px' });
		} else {
			addSvgText(svgSub, 'd-title', 130, 34, 'IncludeLaunchDescription', { anchor: 'middle', size: '12px' });
			addSvgText(svgSub, 'd-muted', 130, 54, '-> example_substitutions_launch.py', { anchor: 'middle', size: '11px' });
			addSvgText(svgSub, 'd-title', 130, 78, "turtlesim_ns: 'turtlesim2'", { anchor: 'middle', size: '11px', fill: 'var(--wp-link)' });
			addSvgText(svgSub, 'd-muted', 130, 98, "use_provided_red: 'True'", { anchor: 'middle', size: '11px', fill: 'var(--wp-link)' });
			addSvgText(svgSub, 'd-muted', 130, 118, "new_background_r: '200'", { anchor: 'middle', size: '11px', fill: 'var(--wp-link)' });
			addSvgText(svgSub, 'd-muted', 130, 142, "colors = {'background_r': '200'}", { anchor: 'middle', size: '11px' });
		}

		// Arrow
		svgSub.appendChild(s('line', {
			'class': 'd-strong',
			x1: 254, y1: 85, x2: 300, y2: 85,
			'marker-end': 'url(#lt-sub-arrow)'
		}));
		addSvgText(svgSub, 'd-muted', 277, 74, 'Node', { anchor: 'middle', size: '11px' });

		// Right box: resulting turtlesim node
		svgSub.appendChild(s('rect', { 'class': subMode === 'defaults' ? 'd-box' : 'd-box-gold', x: 306, y: 12, width: 246, height: 146, rx: 4 }));
		addSvgText(svgSub, 'd-title', 429, 36, fullNode, { anchor: 'middle', size: '14px', fill: subMode === 'include' ? 'var(--wp-gold-text)' : null });
		addSvgText(svgSub, 'd-muted', 429, 59, 'pkg: turtlesim, name: sim', { anchor: 'middle', size: '11px' });
		addSvgText(svgSub, 'd-muted', 429, 78, 'exec: turtlesim_node', { anchor: 'middle', size: '11px' });
		addSvgText(svgSub, 'd-muted', 429, 97, 'ns: ' + ns + ' (turtlesim_ns)', { anchor: 'middle', size: '11px', fill: subMode === 'include' ? 'var(--wp-link)' : null });
		if (subMode === 'defaults') {
			addSvgText(svgSub, 'd-muted', 429, 119, 'background_r: 0 (default)', { anchor: 'middle', size: '11px' });
			addSvgText(svgSub, 'd-muted', 429, 142, 'Topic prefix: /turtlesim1/...', { anchor: 'middle', size: '11px' });
		} else if (subMode === 'bg255') {
			addSvgText(svgSub, 'd-title', 429, 119, 'background_r: 255 (CLI arg)', { anchor: 'middle', size: '11px', fill: 'var(--wp-link)' });
			addSvgText(svgSub, 'd-muted', 429, 142, 'Topic prefix: /turtlesim1/...', { anchor: 'middle', size: '11px' });
		} else {
			addSvgText(svgSub, 'd-muted', 429, 119, 'new_background_r: 200 (passed)', { anchor: 'middle', size: '11px', fill: 'var(--wp-link)' });
			addSvgText(svgSub, 'd-muted', 429, 142, 'use_provided_red: True (passed)', { anchor: 'middle', size: '11px' });
		}

		// Bottom caption
		if (subMode === 'defaults') {
			addSvgText(svgSub, 'd-muted', 280, 180, 'LaunchConfiguration evaluates at launch.', { anchor: 'middle', size: '12px' });
		} else if (subMode === 'bg255') {
			addSvgText(svgSub, 'd-muted', 280, 180, 'CLI name:=value overrides the argument.', { anchor: 'middle', size: '12px' });
		} else {
			addSvgText(svgSub, 'd-muted', 280, 180, 'IncludeLaunchDescription passes arguments.', { anchor: 'middle', size: '12px' });
		}

		svgSub.setAttribute('aria-label',
			subMode === 'defaults'
				? 'example_substitutions_launch.py with default arguments: turtlesim_ns is turtlesim1 and background_r is 0, starting node /turtlesim1/sim.'
				: (subMode === 'bg255'
					? 'example_substitutions_launch.py with background_r:=255: turtlesim_ns remains turtlesim1, starting node /turtlesim1/sim with background_r 255.'
					: 'example_substitutions_launch.py included from a top-level launch file: passes turtlesim_ns=turtlesim2, use_provided_red=True, and new_background_r=200, starting node /turtlesim2/sim.')
		);
	}

	function drawParamPanel() {
		svgParam.replaceChildren();
		var defs = s('defs', {});
		addMarker(defs, 'lt-param-arrow', restarted ? 'var(--wp-link)' : 'var(--wp-text-muted)');
		svgParam.appendChild(defs);

		// Left box: source of parameter change
		svgParam.appendChild(s('rect', { 'class': 'd-box', x: 8, y: 10, width: 248, height: 102, rx: 4 }));
		if (paramSource === 'param_set') {
			addSvgText(svgParam, 'd-title', 132, 32, 'Set with ros2 param set', { anchor: 'middle', size: '14px' });
			addSvgText(svgParam, 'd-muted', 132, 53, 'ros2 param set /turtlesim', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 132, 71, 'background_r 150', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 132, 95, 'Changes background color at once', { anchor: 'middle', size: '12px' });
		} else {
			addSvgText(svgParam, 'd-title', 132, 32, 'Loaded from YAML at launch', { anchor: 'middle', size: '14px' });
			addSvgText(svgParam, 'd-muted', 132, 53, 'parameters=[turtlesim.yaml]', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 132, 71, '/turtlesim2/sim: background_r: 150', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 132, 95, 'Applied at node startup', { anchor: 'middle', size: '12px' });
		}

		// Arrow
		svgParam.appendChild(s('line', {
			'class': restarted ? 'd-strong' : 'd-line',
			x1: 258, y1: 61, x2: 298, y2: 61,
			'marker-end': 'url(#lt-param-arrow)'
		}));
		addSvgText(svgParam, 'd-muted', 278, 49, restarted ? 'Restart' : 'State', { anchor: 'middle', size: '11px' });

		// Right box: running or post-restart survival
		svgParam.appendChild(s('rect', { 'class': restarted ? 'd-box-gold' : 'd-box', x: 304, y: 10, width: 248, height: 102, rx: 4 }));
		if (!restarted) {
			addSvgText(svgParam, 'd-title', 428, 32, 'Node state: Running', { anchor: 'middle', size: '14px' });
			addSvgText(svgParam, 'd-muted', 428, 54, 'background_r = 150 is active', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 428, 76, 'Parameter lifetime matches', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 428, 95, 'the lifetime of the node.', { anchor: 'middle', size: '12px' });
		} else if (paramSource === 'param_set') {
			addSvgText(svgParam, 'd-title', 428, 32, 'After restart: Value LOST', { anchor: 'middle', size: '14px', fill: 'var(--wp-gold-text)' });
			addSvgText(svgParam, 'd-muted', 428, 54, 'Value set with ros2 param set', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 428, 73, 'is lost when the node restarts.', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 428, 95, 'Save with ros2 param dump.', { anchor: 'middle', size: '12px' });
		} else {
			addSvgText(svgParam, 'd-title', 428, 32, 'After restart: Value SURVIVES', { anchor: 'middle', size: '14px', fill: 'var(--wp-gold-text)' });
			addSvgText(svgParam, 'd-muted', 428, 54, 'YAML file is given at startup,', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 428, 73, 'so launch reapplies', { anchor: 'middle', size: '12px' });
			addSvgText(svgParam, 'd-muted', 428, 95, 'background_r: 150 on restart.', { anchor: 'middle', size: '12px' });
		}

		svgParam.setAttribute('aria-label',
			paramSource === 'param_set'
				? (restarted ? 'After restarting the node, the value set with ros2 param set is lost.' : 'ros2 param set /turtlesim background_r 150 active while the node is running.')
				: (restarted ? 'After restarting the node, the YAML parameter file loaded at launch reapplies background_r: 150.' : 'YAML parameter file turtlesim.yaml applied to /turtlesim2/sim at startup.')
		);
	}

	function draw() {
		btnWhatIfClash.setAttribute('aria-pressed', String(whatIfClash));
		btnSubDefault.setAttribute('aria-pressed', String(subMode === 'defaults'));
		btnSubBg255.setAttribute('aria-pressed', String(subMode === 'bg255'));
		btnSubInclude.setAttribute('aria-pressed', String(subMode === 'include'));
		btnParamSet.setAttribute('aria-pressed', String(paramSource === 'param_set'));
		btnYaml.setAttribute('aria-pressed', String(paramSource === 'yaml'));

		drawMimicTree();
		drawSubTree();
		drawParamPanel();

		if (activePanel === 'mimic') {
			readout.textContent = whatIfClash
				? 'turtlesim_mimic_launch.py (what-if same namespace): resulting nodes /turtlesim1/sim, /turtlesim1/sim, and mimic clash. Unique namespaces allow the system to start two nodes without node name or topic name conflicts.'
				: 'turtlesim_mimic_launch.py: resulting nodes are /turtlesim1/sim, mimic, and /turtlesim2/sim. Unique namespaces allow the system to start two nodes without node name or topic name conflicts.';
		} else if (activePanel === 'substitutions') {
			if (subMode === 'defaults') {
				readout.textContent = 'example_substitutions_launch.py (defaults): resulting node is /turtlesim1/sim (turtlesim_ns=turtlesim1, background_r=0).';
			} else if (subMode === 'bg255') {
				readout.textContent = 'example_substitutions_launch.py (background_r:=255): resulting node is /turtlesim1/sim (turtlesim_ns=turtlesim1, background_r=255).';
			} else {
				readout.textContent = 'example_substitutions_launch.py (included from a top-level launch file): resulting node is /turtlesim2/sim (turtlesim_ns=turtlesim2, use_provided_red=True, new_background_r=200).';
			}
		} else {
			if (paramSource === 'param_set') {
				readout.textContent = restarted
					? 'Parameter lifetime (/turtlesim): after node restart, the value set with ros2 param set is lost when the node restarts (save with ros2 param dump).'
					: 'Parameter lifetime (/turtlesim): ros2 param set /turtlesim background_r 150 changes the background color at once (active until the node restarts).';
			} else {
				readout.textContent = restarted
					? 'Parameter lifetime (/turtlesim2/sim): after node restart, the YAML parameter file passed via parameters=[...] is applied at node startup, so background_r: 150 survives.'
					: 'Parameter lifetime (/turtlesim2/sim): turtlesim.yaml loaded via parameters=[...] applies background_r: 150 at node startup.';
			}
		}
	}

	draw();

	root.replaceChildren(frame('Turtlesim launch trees, arguments, and parameter lifetime', [
		h('p', { 'class': 'widget-note', text: '1. turtlesim_mimic_launch.py (fixed namespaces, no launch arguments):' }),
		h('div', { 'class': 'widget-buttons' }, [btnWhatIfClash]),
		svgMimic,
		h('p', { 'class': 'widget-note', text: '2. example_substitutions_launch.py (launch arguments and substitutions):' }),
		h('div', { 'class': 'widget-buttons' }, [btnSubDefault, btnSubBg255, btnSubInclude]),
		svgSub,
		h('p', { 'class': 'widget-note', text: '3. Parameter persistence across a node restart:' }),
		h('div', { 'class': 'widget-buttons' }, [btnParamSet, btnYaml, btnRestart]),
		svgParam,
		readout
	]));
}
