// Placeholder text: The troubleshooting steps walkthrough needs JavaScript. With it on, you can step through a fault scenario from hazardous energy control to documenting the repair.

// Facts used (from robotics-9-2.html):
// - Line 215: "When a cell stops, the first temptation is to walk in and clear the problem. That is exactly when people get hurt."
// - Line 218 (safety, verbatim): "Maintenance and repair need more: the machine has to be cut off from every energy source so it cannot move or release energy while someone works on it."
// - Line 221 (safety, verbatim): "OSHA standard 29 CFR 1910.147 establishes procedures to disable machinery and prevent the release of hazardous electrical, mechanical, hydraulic, pneumatic, chemical, and thermal energy during servicing."
// - Line 229 (safety, verbatim): "Pressing an emergency stop or switching the robot to manual mode does not isolate it. Push buttons, selector switches, and control circuit devices are not considered energy isolating devices under OSHA standards."
// - Line 232 (safety, verbatim): "An energy isolating device, such as a main disconnect switch or a shutoff valve, physically blocks the energy instead."
// - Line 255 (safety, verbatim): "The required sequence for applying energy control begins with preparation and shutdown, followed by machine isolation, lockout application, stored energy relief, and verification of isolation."
// - Line 258 (safety, verbatim): "1. Preparation and shutdown: Know which energy sources the machine has and shut it down normally."
// - Line 259 (safety, verbatim): "2. Machine isolation: Operate every energy isolating device so the machine is cut off."
// - Line 260 (safety, verbatim): "3. Lockout application: Put a lock (or tag) on each isolating device."
// - Line 261 (safety, verbatim): "4. Stored energy relief: After applying lockout devices, all potentially hazardous residual or stored energy must be relieved, disconnected, restrained, and rendered safe."
// - Line 262 (safety, verbatim): "5. Verification of isolation: Before starting work, confirm that the machine really is isolated and de-energized."
// - Line 265 (safety, verbatim): "Energy control procedures must enforce that only the authorized worker who applied a lockout device is permitted to remove it."
// - Line 276: "Once the cell is properly secured and ready for diagnostic inspection, troubleshooting begins by gathering facts."
// - Line 279 (safety, verbatim): "Resetting robot faults without identifying the root cause masks fault detection and increases the risk of personnel injury."
// - Line 282 (safety, verbatim): "UR warns that automatic acknowledgment and reset of robot stops masks faults that will lead to a failure condition."
// - Line 285: "Instead of resetting the fault, a methodical technician begins by collecting observable symptoms. What was the robot doing when it stopped? What step in the program was executing? Did the gripper drop the part? Are pneumatic pressure regulators showing normal line pressure?"
// - Line 288: "Safety Control Board diagnostic LEDs show normal communication with a slow green flash and a hardware or safety error with permanent red."
// - Line 296: "The UR Support File is automatically generated inside the robot controller and bundles log files, robot programs, and flight reports. UR's Log Viewer is a program for reading it on a computer."
// - Line 299: "A controller log entry records the message description, error category, error code, error source, and timestamp."
// - Line 309: "Universal Robots error code numbers ranging from 1 to 255 apply exclusively to CB3 and earlier robot controllers. In contrast, Universal Robots error code numbers higher than 256 designate faults on e-Series and newer controllers."
// - Line 312: "So always look a code up in the list for your controller."
// - Line 320: "Flight record diagnostics plot joint position, velocity, acceleration, motor current, and torque at the exact moment a fault occurs."
// - Line 323: "UR describes this flight record view as intended for expert-level users, to be used when advised. For a beginner, the point is that the data exists and can be sent to the robot maker's support team."
// - Line 328: "1. Define the problem clearly: State the exact symptoms, error codes, affected joints, and operating conditions under which the fault appeared."
// - Line 329: "2. Formulate a single hypothesis: Propose one clear, testable explanation that accounts for all observed evidence. For example, suppose joint 3 shows an unexpected torque spike during high-acceleration moves while carrying a new workpiece. You might hypothesize that the configured tool center point (TCP) payload mass is lower than the actual physical payload."
// - Line 330: "3. Change only one variable at a time: Test the hypothesis by modifying a single parameter or swapping a single component. If testing payload settings, update the payload mass in the installation settings and re-run the program at reduced speed. Never change multiple variables at once, such as re-teaching points, modifying acceleration rates, swapping cables, and adjusting mechanical stops. Changing multiple variables prevents knowing which adjustment solved the problem and risks introducing new secondary faults."
// - Line 331: "4. Verify the outcome: Observe system behavior during test runs. Check the log again. If the fault recurs, discard the hypothesis, formulate a new one based on the new observations, and repeat the cycle."
// - Line 336: "The final phase of the troubleshooting method, after the robot is moving again, is documenting the intervention in the plant maintenance management system."
// - Line 339: "As 9.1 explained, maintenance records of faults, root causes and repairs speed up later troubleshooting and improve failure prediction."
// - Line 342: "Record the symptom, the cause you found and the fix."

function initTroubleshootSteps(root) {
	var W = 560, H = 320;
	var svg = plotFrame(W, H, 'Seven-step robot cell troubleshooting workflow from hazardous energy control to documenting the repair');

	var STEPS = [
		{
			id: 'loto',
			short1: '1. Lockout &',
			short2: 'tagout',
			title: 'Control hazardous energy (Sections 01–02)',
			x: 12, y: 10, w: 118, h: 44
		},
		{
			id: 'symptoms',
			short1: '2. Gather',
			short2: 'symptoms',
			title: 'Gather symptoms (Section 03)',
			x: 152, y: 10, w: 118, h: 44
		},
		{
			id: 'logs',
			short1: '3. Controller',
			short2: 'logs & codes',
			title: 'Read controller logs and error codes (Section 04)',
			x: 292, y: 10, w: 118, h: 44
		},
		{
			id: 'flight',
			short1: '4. Flight',
			short2: 'report & fault',
			title: 'Analyze flight report and define problem (Section 05)',
			x: 432, y: 10, w: 116, h: 44
		},
		{
			id: 'hypothesis',
			short1: '5. Formulate a',
			short2: 'single hypothesis',
			title: 'Formulate a single hypothesis (Section 05)',
			x: 12, y: 78, w: 160, h: 44
		},
		{
			id: 'test',
			short1: '6. Change one',
			short2: 'variable & verify',
			title: 'Change one variable and verify outcome (Section 05)',
			x: 200, y: 78, w: 160, h: 44
		},
		{
			id: 'document',
			short1: '7. Document',
			short2: 'cause & fix',
			title: 'Document root causes and repairs (Section 06)',
			x: 388, y: 78, w: 160, h: 44
		}
	];

	var curStep = 0;
	var symptomChoice = null; // null | 'collect' | 'reset'

	var progressLine = h('p', { 'class': 'widget-note' });
	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

	var prevBtn = button('◀ Back', function () {
		if (curStep > 0) {
			curStep--;
			render();
		}
	});
	var nextBtn = button('Next ▶', function () {
		if (curStep < STEPS.length - 1) {
			curStep++;
			render();
		}
	});
	var resetBtn = button('Reset', function () {
		curStep = 0;
		symptomChoice = null;
		render();
	});

	var collectBtn = button('Collect observable symptoms', function () {
		symptomChoice = 'collect';
		render();
	});
	var alarmResetBtn = button('Reset the alarm and restart', function () {
		symptomChoice = 'reset';
		render();
	});
	var choiceRow = h('div', {
		'class': 'widget-buttons',
		role: 'group',
		'aria-label': 'Action at gather symptoms step'
	}, [collectBtn, alarmResetBtn]);

	function addSvgText(parent, cls, x, y, text, extraAttrs) {
		var el = s('text', Object.assign({ 'class': cls, x: x, y: y }, extraAttrs || {}));
		el.textContent = text;
		parent.appendChild(el);
		return el;
	}

	function drawCard(x, y, w, hgt, isGold, titleText, lines, lineSize) {
		svg.appendChild(s('rect', {
			'class': isGold ? 'd-box-gold' : 'd-box',
			x: x, y: y, width: w, height: hgt, rx: 4
		}));
		addSvgText(svg, 'd-title', x + 12, y + 22, titleText, {
			style: 'font-size: ' + (w > 300 ? 14 : 13) + 'px;'
		});
		lines.forEach(function (line, idx) {
			addSvgText(svg, 'd-muted', x + 12, y + 44 + idx * 20, line, {
				style: 'font-size: ' + lineSize + 'px; fill: var(--wp-text);'
			});
		});
	}

	function render() {
		var st = STEPS[curStep];
		progressLine.textContent = 'Step ' + (curStep + 1) + ' of ' + STEPS.length + ' — ' + st.title;

		prevBtn.disabled = curStep === 0;
		nextBtn.disabled = curStep === STEPS.length - 1;

		choiceRow.style.display = (curStep === 1) ? '' : 'none';
		collectBtn.setAttribute('aria-pressed', String(symptomChoice === 'collect'));
		alarmResetBtn.setAttribute('aria-pressed', String(symptomChoice === 'reset'));

		svg.replaceChildren();

		var defs = s('defs', {});
		var mk = s('marker', {
			id: 'arrow-ts',
			viewBox: '0 0 10 10',
			refX: '9',
			refY: '5',
			markerWidth: '5',
			markerHeight: '5',
			orient: 'auto-start-reverse'
		});
		mk.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--wp-text-muted)' }));
		var mkGold = s('marker', {
			id: 'arrow-ts-gold',
			viewBox: '0 0 10 10',
			refX: '9',
			refY: '5',
			markerWidth: '5',
			markerHeight: '5',
			orient: 'auto-start-reverse'
		});
		mkGold.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--wp-gold-text)' }));
		defs.appendChild(mk);
		defs.appendChild(mkGold);
		svg.appendChild(defs);

		var connectors = [
			{ type: 'line', x1: 130, y1: 32, x2: 150, y2: 32 },
			{ type: 'line', x1: 270, y1: 32, x2: 290, y2: 32 },
			{ type: 'line', x1: 410, y1: 32, x2: 430, y2: 32 },
			{ type: 'path', d: 'M 490 54 L 490 66 L 92 66 L 92 76' },
			{ type: 'line', x1: 172, y1: 100, x2: 198, y2: 100 },
			{ type: 'line', x1: 360, y1: 100, x2: 386, y2: 100 }
		];
		connectors.forEach(function (c, idx) {
			var active = idx === curStep - 1;
			var attrs = {
				'class': active ? 'd-strong' : 'd-line',
				'marker-end': active ? 'url(#arrow-ts-gold)' : 'url(#arrow-ts)'
			};
			if (active) attrs.style = 'stroke: var(--wp-gold-text);';
			if (c.type === 'line') {
				attrs.x1 = c.x1; attrs.y1 = c.y1; attrs.x2 = c.x2; attrs.y2 = c.y2;
				svg.appendChild(s('line', attrs));
			} else {
				attrs.d = c.d;
				svg.appendChild(s('path', attrs));
			}
		});

		STEPS.forEach(function (step, idx) {
			var isCur = idx === curStep;
			var g = s('g', {
				tabindex: '0',
				role: 'button',
				'aria-label': 'Step ' + (idx + 1) + ': ' + step.title,
				'aria-pressed': String(isCur),
				style: 'cursor: pointer;'
			});
			g.appendChild(s('rect', {
				'class': isCur ? 'd-box-gold' : 'd-box',
				x: step.x, y: step.y, width: step.w, height: step.h, rx: 4,
				style: isCur ? 'stroke-width: 2.5;' : ''
			}));
			addSvgText(g, 'd-title', step.x + step.w / 2, step.y + 18, step.short1, {
				'text-anchor': 'middle',
				style: 'font-size: 12px;'
			});
			addSvgText(g, 'd-muted', step.x + step.w / 2, step.y + 34, step.short2, {
				'text-anchor': 'middle',
				style: 'font-size: 11px;'
			});
			g.addEventListener('click', function () {
				curStep = idx;
				render();
			});
			g.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
					e.preventDefault();
					curStep = idx;
					render();
				}
			});
			svg.appendChild(g);
		});

		if (curStep === 0) {
			drawCard(12, 136, 262, 174, false, 'OSHA 29 CFR 1910.147 sequence', [
				'1. Preparation and shutdown',
				'2. Machine isolation',
				'3. Lockout application',
				'4. Stored energy relief',
				'5. Verification of isolation'
			], 12);
			drawCard(286, 136, 262, 174, true, 'Energy isolating devices', [
				'Pressing an emergency stop or',
				'switching the robot to manual',
				'mode does not isolate it.',
				'An energy isolating device, such',
				'as a main disconnect switch or',
				'shutoff valve, physically blocks',
				'the energy instead.'
			], 12);
			readout.textContent = 'Step 1 of 7 — Control hazardous energy (Sections 01–02): Maintenance and repair need more: the machine has to be cut off from every energy source so it cannot move or release energy while someone works on it. OSHA standard 29 CFR 1910.147 establishes procedures to disable machinery and prevent the release of hazardous electrical, mechanical, hydraulic, pneumatic, chemical, and thermal energy during servicing. Pressing an emergency stop or switching the robot to manual mode does not isolate it. The required sequence for applying energy control begins with preparation and shutdown, followed by machine isolation, lockout application, stored energy relief, and verification of isolation. After applying lockout devices, all potentially hazardous residual or stored energy must be relieved, disconnected, restrained, and rendered safe. Energy control procedures must enforce that only the authorized worker who applied a lockout device is permitted to remove it.';
		} else if (curStep === 1) {
			if (symptomChoice === 'collect') {
				drawCard(12, 136, 262, 174, true, 'Collect observable symptoms', [
					'• What was the robot doing?',
					'• What program step executed?',
					'• Did gripper drop the part?',
					'• Normal pneumatic line',
					'  pressure on regulators?'
				], 12);
				drawCard(286, 136, 262, 174, false, 'Safety Control Board LEDs', [
					'Slow green flash:',
					'  normal communication',
					'Permanent red:',
					'  hardware or safety error',
					'Scenario condition:',
					'  high-accel with new workpiece'
				], 12);
				readout.textContent = 'Step 2 of 7 — Gather symptoms (Section 03): Correct choice. Instead of resetting the fault, a methodical technician begins by collecting observable symptoms. What was the robot doing when it stopped? What step in the program was executing? Did the gripper drop the part? Are pneumatic pressure regulators showing normal line pressure? Safety Control Board diagnostic LEDs show normal communication with a slow green flash and a hardware or safety error with permanent red.';
			} else if (symptomChoice === 'reset') {
				drawCard(12, 136, 536, 174, true, 'Warning: unverified reset', [
					'Resetting robot faults without identifying',
					'the root cause masks fault detection and',
					'increases the risk of personnel injury.',
					'UR warns that automatic acknowledgment and',
					'reset of robot stops masks faults that',
					'will lead to a failure condition.'
				], 13);
				readout.textContent = 'Step 2 of 7 — Warning on unverified reset (Section 03): Resetting robot faults without identifying the root cause masks fault detection and increases the risk of personnel injury. UR warns that automatic acknowledgment and reset of robot stops masks faults that will lead to a failure condition.';
			} else {
				drawCard(12, 136, 536, 174, false, 'Cell stopped — choose an action', [
					'Once the cell is properly secured and',
					'ready for diagnostic inspection,',
					'troubleshooting begins by gathering facts.',
					'Pick one of the two actions above:',
					'• Collect observable symptoms',
					'• Reset the alarm and restart'
				], 13);
				readout.textContent = 'Step 2 of 7 — Gather symptoms (Section 03): Once the cell is properly secured and ready for diagnostic inspection, troubleshooting begins by gathering facts. Select an action: Collect observable symptoms, or Reset the alarm and restart.';
			}
		} else if (curStep === 2) {
			drawCard(12, 136, 262, 174, false, 'UR Support File & Log Viewer', [
				'Automatically generated inside',
				'the robot controller; bundles:',
				'• log files',
				'• robot programs',
				'• flight reports',
				"Read with UR's Log Viewer."
			], 12);
			drawCard(286, 136, 262, 174, false, 'Log entry & error code list', [
				'• message description',
				'• error category & error code',
				'• error source & timestamp',
				'1–255: CB3 and earlier',
				'>256: e-Series and newer',
				'Look up in your controller list.'
			], 12);
			readout.textContent = "Step 3 of 7 — Read controller logs and error codes (Section 04): The UR Support File is automatically generated inside the robot controller and bundles log files, robot programs, and flight reports. UR's Log Viewer is a program for reading it on a computer. A controller log entry records the message description, error category, error code, error source, and timestamp. Universal Robots error code numbers ranging from 1 to 255 apply exclusively to CB3 and earlier robot controllers, while numbers higher than 256 designate faults on e-Series and newer controllers. Always look a code up in the list for your controller.";
		} else if (curStep === 3) {
			drawCard(12, 136, 262, 174, false, 'Flight record diagnostics', [
				'Plots at exact fault moment:',
				'• joint position',
				'• velocity and acceleration',
				'• motor current and torque',
				'Data can be sent to the robot',
				"maker's support team."
			], 12);
			drawCard(286, 136, 262, 174, true, '1. Define the problem clearly', [
				'State symptoms, error codes,',
				'joints, and conditions:',
				'joint 3 shows an unexpected',
				'torque spike during',
				'high-acceleration moves while',
				'carrying a new workpiece.'
			], 12);
			readout.textContent = "Step 4 of 7 — Flight reports and defining the problem (Section 05): Flight record diagnostics plot joint position, velocity, acceleration, motor current, and torque at the exact moment a fault occurs. UR describes this flight record view as intended for expert-level users, to be used when advised, and the data can be sent to the robot maker's support team. Define the problem clearly: joint 3 shows an unexpected torque spike during high-acceleration moves while carrying a new workpiece.";
		} else if (curStep === 4) {
			drawCard(12, 136, 536, 174, false, '2. Formulate a single hypothesis', [
				'Propose one clear, testable explanation',
				'that accounts for all observed evidence.',
				'Scenario hypothesis:',
				'The configured tool center point (TCP)',
				'payload mass is lower than the actual',
				'physical payload.'
			], 13);
			readout.textContent = 'Step 5 of 7 — Formulate a single hypothesis (Section 05): Propose one clear, testable explanation that accounts for all observed evidence. For this fault scenario, hypothesize that the configured tool center point (TCP) payload mass is lower than the actual physical payload.';
		} else if (curStep === 5) {
			drawCard(12, 136, 262, 174, false, '3. Change only one variable', [
				'Update the payload mass in the',
				'installation settings and re-run',
				'the program at reduced speed.',
				'Never change multiple',
				'variables at once.'
			], 12);
			drawCard(286, 136, 262, 174, false, '4. Verify the outcome', [
				'Observe system behavior',
				'during test runs.',
				'Check the log again.',
				'If the fault recurs, discard',
				'hypothesis and repeat.'
			], 12);
			readout.textContent = 'Step 6 of 7 — Change one variable and verify (Section 05): Test the hypothesis by modifying a single parameter or swapping a single component. Update the payload mass in the installation settings and re-run the program at reduced speed. Never change multiple variables at once, because doing so prevents knowing which adjustment solved the problem and risks introducing new secondary faults. Observe system behavior during test runs and check the log again; if the fault recurs, discard the hypothesis and repeat the cycle.';
		} else {
			drawCard(12, 136, 536, 174, false, 'Document root causes and repairs', [
				'After the robot is moving again, document',
				'the intervention in the plant maintenance',
				'management system:',
				'• Record the symptom, the cause you found,',
				'  and the fix.',
				'Speeds up later troubleshooting.'
			], 13);
			readout.textContent = 'Step 7 of 7 — Document root causes and repairs (Section 06): The final phase of the troubleshooting method, after the robot is moving again, is documenting the intervention in the plant maintenance management system. Record the symptom, the cause you found, and the fix. Maintenance records of faults, root causes and repairs speed up later troubleshooting and improve failure prediction.';
		}
	}

	var navRow = h('div', { 'class': 'widget-buttons' }, [prevBtn, nextBtn, resetBtn]);

	render();

	root.replaceChildren(frame('robot cell troubleshooting method', [
		progressLine,
		navRow,
		choiceRow,
		svg,
		readout
	]));
}
