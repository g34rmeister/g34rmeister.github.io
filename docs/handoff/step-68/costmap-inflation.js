// Placeholder text: The costmap inflation widget needs JavaScript. With it on, you can adjust inflation_radius and robot_radius, move the robot across the grid, and switch between global and local costmaps.

// Facts used (from robotics-10-2.html):
// - Line 220: "In Nav2 the environmental representation is a costmap: a regular 2D grid of cells, each holding a cost from unknown, free, occupied or inflated."
// - Line 220: "The costmap is searched to compute a global plan, or sampled to compute local control efforts."
// - Line 223-224: "Four dark cells in the middle are occupied by an obstacle, the ring of cells around them is inflated, a few cells at the edge are marked unknown and the rest are free. A circle shows the robot footprint" (legend labels: free, occupied, inflated, unknown, ?, robot).
// - Line 226: "The inflation layer adds cost around obstacles."
// - Line 234: "The inflation layer is one of those rule-based layers. It places a decaying cost around obstacles, which makes it more costly to travel near a collision. Its inflation_radius parameter sets the radius to inflate around lethal obstacles."
// - Line 239: "Nav2 keeps a global and a local view. The planner has access to a global environmental representation, and the controller to a local one. The behavior server subscribes to the local costmap instead of building its own, because costmaps are computationally expensive to duplicate."
// - Line 242: "The costmap also needs the robot's shape. The footprint is set either as a circle of radius robot_radius or, for a non-circular robot, as a list of points called footprint that describes a polygon."

function initCostmapInflation(root) {
	var COLS = 20, ROWS = 12, CELL = 20;
	var GX = 12, GY = 36;
	var W = 560, H = 320;
	var clipId = 'cm-grid-clip-' + Math.random().toString(36).slice(2, 8);

	var viewMode = 'global'; // 'global' | 'local'
	var robotC = 3, robotR = 6;

	var sInfl = slider('inflation_radius (cells)', 'cm-inflation', 0, 5, 0.5, 2.5, '');
	var sRobot = slider('robot_radius (cells)', 'cm-robot', 0.5, 2.5, 0.5, 1.0, '');

	var svg = plotFrame(W, H, 'Top-down 2D costmap grid showing free, inflated, occupied, and unknown cells with a circular robot footprint');
	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

	// Static cell map: 'free' | 'occupied' | 'unknown'
	var baseGrid = [];
	var occupiedCells = [];
	for (var r = 0; r < ROWS; r++) {
		baseGrid[r] = [];
		for (var c = 0; c < COLS; c++) {
			var isWall = (c === 13 && r >= 2 && r <= 8);
			var isObstacle = (c >= 7 && c <= 8 && r >= 5 && r <= 6);
			var isUnknown = ((c >= 18 && r <= 3) || (c === 19 && r >= 4 && r <= 5));
			if (isWall || isObstacle) {
				baseGrid[r][c] = 'occupied';
				occupiedCells.push({ c: c, r: r });
			} else if (isUnknown) {
				baseGrid[r][c] = 'unknown';
			} else {
				baseGrid[r][c] = 'free';
			}
		}
	}

	function nearestOccupiedDist(c, r) {
		var minD = Infinity;
		for (var i = 0; i < occupiedCells.length; i++) {
			var o = occupiedCells[i];
			var d = Math.hypot(c - o.c, r - o.r);
			if (d < minD) minD = d;
		}
		return minD;
	}

	function footprintOverlapsOccupied(rx, ry, radius) {
		for (var i = 0; i < occupiedCells.length; i++) {
			var o = occupiedCells[i];
			var dx = Math.max(o.c - rx, 0, rx - (o.c + 1));
			var dy = Math.max(o.r - ry, 0, ry - (o.r + 1));
			if (Math.hypot(dx, dy) < radius - 1e-6) return true;
		}
		return false;
	}

	function inLocalView(c, r) {
		return Math.abs(c - robotC) <= 4 && Math.abs(r - robotR) <= 3;
	}

	function moveRobot(dc, dr) {
		var nc = Math.max(0, Math.min(COLS - 1, robotC + dc));
		var nr = Math.max(0, Math.min(ROWS - 1, robotR + dr));
		if (nc === robotC && nr === robotR) return;
		robotC = nc;
		robotR = nr;
		draw();
	}

	var btnGlobal = button('Global costmap', function () { viewMode = 'global'; draw(); }, 'Show global costmap view for the planner');
	var btnLocal = button('Local costmap', function () { viewMode = 'local'; draw(); }, 'Show local costmap view for the controller and behavior server');

	var btnLeft = button('← Left', function () { moveRobot(-1, 0); }, 'Move robot one cell left');
	var btnUp = button('↑ Up', function () { moveRobot(0, -1); }, 'Move robot one cell up');
	var btnDown = button('↓ Down', function () { moveRobot(0, 1); }, 'Move robot one cell down');
	var btnRight = button('→ Right', function () { moveRobot(1, 0); }, 'Move robot one cell right');

	var viewButtons = h('div', { 'class': 'widget-buttons' }, [btnGlobal, btnLocal]);
	var moveButtons = h('div', { 'class': 'widget-buttons' }, [btnLeft, btnUp, btnDown, btnRight]);

	function drawLegend() {
		var lx = 424, ly = 36, lw = 124;

		svg.appendChild(s('rect', { 'class': 'd-box', x: lx, y: ly, width: lw, height: 166, rx: 4 }));
		var lTitle = s('text', { 'class': 'd-title', x: lx + 10, y: ly + 20, 'font-size': '13' });
		lTitle.textContent = 'Cell cost';
		svg.appendChild(lTitle);

		// free
		svg.appendChild(s('rect', {
			'class': 'd-box',
			x: lx + 10, y: ly + 32, width: 16, height: 16,
			style: 'stroke: var(--wp-border); stroke-width: 1;'
		}));
		var tFree = s('text', { x: lx + 34, y: ly + 44, 'font-size': '12', style: 'fill: var(--wp-text); font-family: var(--wp-sans);' });
		tFree.textContent = 'free';
		svg.appendChild(tFree);

		// inflated (decaying cost)
		svg.appendChild(s('rect', {
			'class': 'd-box-gold',
			x: lx + 10, y: ly + 58, width: 16, height: 16
		}));
		svg.appendChild(s('rect', {
			x: lx + 10, y: ly + 58, width: 8, height: 16,
			style: 'fill: var(--wp-gold-text); fill-opacity: 0.52;'
		}));
		svg.appendChild(s('rect', {
			x: lx + 18, y: ly + 58, width: 8, height: 16,
			style: 'fill: var(--wp-gold-text); fill-opacity: 0.22;'
		}));
		var tInf = s('text', { x: lx + 34, y: ly + 69, 'font-size': '12', style: 'fill: var(--wp-text); font-family: var(--wp-sans);' });
		tInf.textContent = 'inflated';
		var tInfSub = s('text', { 'class': 'd-muted', x: lx + 34, y: ly + 82, 'font-size': '11' });
		tInfSub.textContent = '(decaying cost)';
		svg.appendChild(tInf);
		svg.appendChild(tInfSub);

		// occupied (lethal)
		svg.appendChild(s('rect', {
			'class': 'd-box',
			x: lx + 10, y: ly + 96, width: 16, height: 16,
			style: 'fill: var(--wp-link); stroke: var(--wp-link); stroke-width: 1;'
		}));
		var tOcc = s('text', { x: lx + 34, y: ly + 107, 'font-size': '12', style: 'fill: var(--wp-text); font-family: var(--wp-sans);' });
		tOcc.textContent = 'occupied';
		var tOccSub = s('text', { 'class': 'd-muted', x: lx + 34, y: ly + 120, 'font-size': '11' });
		tOccSub.textContent = '(lethal)';
		svg.appendChild(tOcc);
		svg.appendChild(tOccSub);

		// unknown
		svg.appendChild(s('rect', {
			'class': 'd-box',
			x: lx + 10, y: ly + 134, width: 16, height: 16,
			style: 'stroke: var(--wp-border); stroke-width: 1;'
		}));
		var tQ = s('text', { 'class': 'd-muted', x: lx + 18, y: ly + 146, 'text-anchor': 'middle', 'font-size': '12' });
		tQ.textContent = '?';
		var tUnk = s('text', { x: lx + 34, y: ly + 146, 'font-size': '12', style: 'fill: var(--wp-text); font-family: var(--wp-sans);' });
		tUnk.textContent = 'unknown';
		svg.appendChild(tQ);
		svg.appendChild(tUnk);

		// Robot footprint legend
		svg.appendChild(s('rect', { 'class': 'd-box', x: lx, y: 212, width: lw, height: 64, rx: 4 }));
		svg.appendChild(s('circle', {
			'class': 'd-strong',
			cx: lx + 20, cy: 234, r: 9,
			style: 'fill: var(--wp-bg); fill-opacity: 0.6;'
		}));
		svg.appendChild(s('circle', {
			cx: lx + 20, cy: 234, r: 2.5,
			style: 'fill: var(--wp-link);'
		}));
		var tRob = s('text', { x: lx + 36, y: 238, 'font-size': '12', style: 'fill: var(--wp-text); font-family: var(--wp-sans);' });
		tRob.textContent = 'robot';
		var tRad = s('text', { 'class': 'd-muted', x: lx + 10, y: 260, 'font-size': '11' });
		tRad.textContent = 'robot_radius';
		svg.appendChild(tRob);
		svg.appendChild(tRad);
	}

	function draw() {
		var inflR = Number(sInfl.input.value);
		var robR = Number(sRobot.input.value);
		sInfl.out.textContent = inflR.toFixed(1);
		sRobot.out.textContent = robR.toFixed(1);

		btnGlobal.setAttribute('aria-pressed', String(viewMode === 'global'));
		btnLocal.setAttribute('aria-pressed', String(viewMode === 'local'));

		svg.replaceChildren();

		// Clip path so the robot circle stays cleanly inside the grid area
		var defs = s('defs', {});
		var clip = s('clipPath', { id: clipId });
		clip.appendChild(s('rect', { x: GX, y: GY, width: COLS * CELL, height: ROWS * CELL }));
		defs.appendChild(clip);
		svg.appendChild(defs);

		// Top heading
		var heading = s('text', { 'class': 'd-title', x: GX, y: 22, 'font-size': '14' });
		heading.textContent = viewMode === 'global'
			? 'Global costmap (planner: global plan)'
			: 'Local costmap (controller & behavior)';
		svg.appendChild(heading);

		// Grid cells
		var centreState = 'free';
		for (var r = 0; r < ROWS; r++) {
			for (var c = 0; c < COLS; c++) {
				var base = baseGrid[r][c];
				var state = base;
				var decay = 0;
				if (base === 'free' && inflR > 0) {
					var dist = nearestOccupiedDist(c, r);
					if (dist <= inflR) {
						state = 'inflated';
						var t = (inflR - dist) / Math.max(inflR - 1, 0.5);
						decay = Math.max(0.16, Math.min(0.55, 0.16 + 0.39 * t));
					}
				}
				if (c === robotC && r === robotR) {
					centreState = state;
				}

				var x = GX + c * CELL;
				var y = GY + r * CELL;
				var dimmed = (viewMode === 'local' && !inLocalView(c, r));
				var cellOpacity = dimmed ? '0.24' : '1';

				var rectAttrs = {
					x: x, y: y, width: CELL, height: CELL,
					style: 'cursor: pointer; opacity: ' + cellOpacity + '; stroke: var(--wp-border); stroke-width: 0.8;'
				};
				if (state === 'occupied') {
					rectAttrs['class'] = 'd-box';
					rectAttrs.style = 'cursor: pointer; opacity: ' + cellOpacity + '; fill: var(--wp-link); stroke: var(--wp-link); stroke-width: 0.8;';
				} else if (state === 'inflated') {
					rectAttrs['class'] = 'd-box';
					rectAttrs.style = 'cursor: pointer; opacity: ' + cellOpacity + '; fill: var(--wp-bg); stroke: var(--wp-border); stroke-width: 0.8;';
				} else {
					rectAttrs['class'] = 'd-box';
				}

				var rect = s('rect', rectAttrs);
				(function (cc, rr) {
					rect.addEventListener('click', function () {
						robotC = cc;
						robotR = rr;
						draw();
					});
				})(c, r);
				svg.appendChild(rect);

				if (state === 'inflated') {
					var overlay = s('rect', {
						x: x, y: y, width: CELL, height: CELL,
						style: 'pointer-events: none; fill: var(--wp-gold-text); fill-opacity: ' + decay.toFixed(2) + '; opacity: ' + cellOpacity + ';'
					});
					svg.appendChild(overlay);
				} else if (state === 'unknown') {
					var qMark = s('text', {
						'class': 'd-muted',
						x: x + CELL / 2, y: y + CELL / 2 + 4,
						'text-anchor': 'middle',
						'font-size': '12',
						style: 'pointer-events: none; opacity: ' + cellOpacity + ';'
					});
					qMark.textContent = '?';
					svg.appendChild(qMark);
				}
			}
		}

		// View frame (global full grid vs local window around robot)
		if (viewMode === 'global') {
			svg.appendChild(s('rect', {
				'class': 'd-strong',
				x: GX, y: GY, width: COLS * CELL, height: ROWS * CELL,
				style: 'pointer-events: none; fill: none;'
			}));
		} else {
			var lc0 = Math.max(0, robotC - 4);
			var lc1 = Math.min(COLS - 1, robotC + 4);
			var lr0 = Math.max(0, robotR - 3);
			var lr1 = Math.min(ROWS - 1, robotR + 3);
			svg.appendChild(s('rect', {
				'class': 'd-strong',
				x: GX + lc0 * CELL, y: GY + lr0 * CELL,
				width: (lc1 - lc0 + 1) * CELL, height: (lr1 - lr0 + 1) * CELL,
				'stroke-dasharray': '5 3',
				style: 'pointer-events: none; fill: none;'
			}));
		}

		// Robot footprint circle
		var rx = robotC + 0.5;
		var ry = robotR + 0.5;
		var footprintHit = footprintOverlapsOccupied(rx, ry, robR);
		var inCollision = (centreState === 'occupied' || footprintHit);

		var robotGroup = s('g', { 'clip-path': 'url(#' + clipId + ')', style: 'pointer-events: none;' });
		var cx = GX + rx * CELL;
		var cy = GY + ry * CELL;
		var rPx = robR * CELL;

		if (inCollision) {
			robotGroup.appendChild(s('circle', {
				cx: cx, cy: cy, r: rPx,
				style: 'fill: var(--wp-gold-soft); fill-opacity: 0.45; stroke: var(--wp-bg); stroke-width: 4.5;'
			}));
			robotGroup.appendChild(s('circle', {
				cx: cx, cy: cy, r: rPx,
				'stroke-dasharray': '5 3',
				style: 'fill: none; stroke: var(--wp-gold-text); stroke-width: 2.5;'
			}));
		} else {
			robotGroup.appendChild(s('circle', {
				'class': 'd-strong',
				cx: cx, cy: cy, r: rPx,
				style: 'fill: var(--wp-bg); fill-opacity: 0.35;'
			}));
		}

		robotGroup.appendChild(s('circle', {
			cx: cx, cy: cy, r: 3,
			style: 'fill: ' + (inCollision ? 'var(--wp-gold-text)' : 'var(--wp-link)') + '; stroke: var(--wp-bg); stroke-width: 1;'
		}));
		svg.appendChild(robotGroup);

		// Bottom instruction inside SVG
		var hint = s('text', { 'class': 'd-muted', x: GX, y: 298, 'font-size': '12' });
		hint.textContent = 'Click any cell or use buttons to move robot';
		svg.appendChild(hint);

		drawLegend();

		// Readout text (only lesson terms)
		var centreDesc;
		if (centreState === 'occupied') {
			centreDesc = 'occupied (in collision)';
		} else if (footprintHit) {
			centreDesc = (centreState === 'inflated' ? 'in inflated cost (decaying cost)' : centreState) +
				', and robot_radius overlaps an occupied cell (in collision)';
		} else if (centreState === 'inflated') {
			centreDesc = 'in inflated cost (decaying cost)';
		} else if (centreState === 'unknown') {
			centreDesc = 'unknown';
		} else {
			centreDesc = 'free';
		}

		var viewDesc = viewMode === 'global'
			? 'Global costmap: used by the planner to compute a global plan.'
			: 'Local costmap: local view used by the controller and subscribed to by the behavior server.';

		readout.textContent = 'Robot centre cell is ' + centreDesc + '. ' +
			'inflation_radius = ' + inflR.toFixed(1) + ' cells, robot_radius = ' + robR.toFixed(1) + ' cells. ' +
			viewDesc;
	}

	sInfl.input.addEventListener('input', draw);
	sRobot.input.addEventListener('input', draw);

	root.replaceChildren(frame('Costmap inflation and robot footprint', [
		h('p', { 'class': 'widget-note', text: 'The inflation layer places a decaying cost around lethal obstacles up to inflation_radius. Nav2 keeps a global view for the planner and a local view for the controller and behavior server.' }),
		viewButtons,
		sInfl.row,
		sRobot.row,
		moveButtons,
		svg,
		readout
	]));

	draw();
}
