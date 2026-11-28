/*
	robOSStics: interactive widgets
	Any element with data-widget="pwm" | "encoder" | "pid" | "arm" | "blocks" |
	"odometry" | "fsm" | "kalman" | "rosgraph" | "movejl" | "threshold" | "prflow" |
	"modbus" | "trapezoid" | "zones" | "qos" | "dashboard" | "agv-vs-amr" |
	"cycle-time-positioner" | "vacuum-cup-sizing" | "offs-vs-reltool" |
	"pallet-indexing" | "vision-frame-shift" | "ros-domain-id" | "square-fsm" |
	"stereo-disparity" | "pinhole-projection" | "dlr-ring-recovery" |
	"edge-case-classifier" | "ultrasonic-distance" | "gyro-drift" |
	"jacobian-singularity" | "f-number-aperture" |
	"presence-area-check" | "ethernet-ip-messaging" | "fov" | "vlan" |
	"robot-arm-3d" | "amr-frames-3d" | "arduino-uno-3d" |
	"costmap-inflation" | "launch-tree" | "moveit-pipeline" | "lighting-angles" |
	"troubleshoot-steps" is turned into a small simulator. Plain JS and inline SVG, no libraries. Without JS the
	placeholder's own text is shown instead.
*/
(function () {
	'use strict';

	var SVG = 'http://www.w3.org/2000/svg';

	function h(tag, attrs, children) {
		var node = document.createElement(tag);
		Object.keys(attrs || {}).forEach(function (k) {
			if (k === 'text') node.textContent = attrs[k];
			else node.setAttribute(k, attrs[k]);
		});
		(children || []).forEach(function (c) { if (c) node.appendChild(c); });
		return node;
	}

	function s(tag, attrs) {
		var node = document.createElementNS(SVG, tag);
		Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
		return node;
	}

	function slider(label, id, min, max, step, value, unit) {
		var out = h('output', { 'for': id, text: value + (unit || '') });
		var input = h('input', { type: 'range', id: id, min: min, max: max, step: step, value: value });
		var row = h('div', { 'class': 'widget-control' }, [
			h('label', { 'for': id, text: label }), input, out
		]);
		return { row: row, input: input, out: out, unit: unit || '' };
	}

	function frame(title, children) {
		return h('figure', { 'class': 'rise-widget' }, [
			h('figcaption', { 'class': 'rise-widget-title' }, [
				h('i', { 'class': 'fas fa-sliders-h', 'aria-hidden': 'true' }),
				document.createTextNode(' Try it: ' + title)
			])
		].concat(children));
	}

	function plotFrame(w, hgt, label) {
		var svg = s('svg', { viewBox: '0 0 ' + w + ' ' + hgt, 'class': 'widget-plot lesson-diagram', role: 'img', 'aria-label': label });
		return svg;
	}

	/* ---------- PWM ---------- */

	function initPwm(root) {
		var duty = slider('Duty cycle', 'pwm-duty', 0, 100, 1, 25, '%');
		var volts = slider('Supply voltage', 'pwm-volts', 3, 24, 1, 12, ' V');
		var W = 560, H = 150, top = 20, bottom = 120, periods = 4, left = 40, right = 540;
		var svg = plotFrame(W, H, 'PWM waveform');
		var wave = s('polyline', { 'class': 'plot-line', fill: 'none' });
		var avg = s('line', { 'class': 'plot-ref', x1: left, x2: right });
		var avgLabel = s('text', { 'class': 'plot-label', x: right - 4, 'text-anchor': 'end' });
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: left, y1: bottom, x2: right, y2: bottom }));
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: left, y1: top, x2: left, y2: bottom }));
		var t0 = s('text', { 'class': 'plot-label', x: left - 6, y: bottom + 4, 'text-anchor': 'end' }); t0.textContent = '0 V';
		var tv = s('text', { 'class': 'plot-label', x: left - 6, y: top + 4, 'text-anchor': 'end' });
		svg.appendChild(t0); svg.appendChild(tv);
		svg.appendChild(wave); svg.appendChild(avg); svg.appendChild(avgLabel);
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		function draw() {
			var d = Number(duty.input.value) / 100;
			var v = Number(volts.input.value);
			duty.out.textContent = duty.input.value + '%';
			volts.out.textContent = v + ' V';
			tv.textContent = v + ' V';
			var per = (right - left) / periods, pts = [];
			for (var i = 0; i < periods; i++) {
				var x = left + i * per, xOn = x + per * d;
				if (d === 0) { pts.push([x, bottom], [x + per, bottom]); continue; }
				if (d === 1) { pts.push([x, top], [x + per, top]); continue; }
				pts.push([x, bottom], [x, top], [xOn, top], [xOn, bottom], [x + per, bottom]);
			}
			wave.setAttribute('points', pts.map(function (p) { return p.join(','); }).join(' '));
			var yAvg = bottom - (bottom - top) * d;
			avg.setAttribute('y1', yAvg); avg.setAttribute('y2', yAvg);
			avgLabel.setAttribute('y', yAvg - 5);
			avgLabel.textContent = 'average ' + (d * v).toFixed(2) + ' V';
			readout.textContent = 'V_avg = ' + d.toFixed(2) + ' × ' + v + ' V = ' + (d * v).toFixed(2) +
				' V. On an Arduino this is analogWrite(pin, ' + Math.round(d * 255) + ').';
		}
		[duty, volts].forEach(function (c) { c.input.addEventListener('input', draw); });
		root.replaceChildren(frame('PWM duty cycle', [duty.row, volts.row, svg, readout]));
		draw();
	}

	/* ---------- Quadrature encoder ---------- */

	function initEncoder(root) {
		var ppr = slider('Pulses per revolution (PPR)', 'enc-ppr', 4, 48, 4, 12, '');
		var dia = slider('Wheel diameter', 'enc-dia', 20, 120, 5, 65, ' mm');
		var count = 0, history = [];
		var W = 560, H = 130, left = 40, right = 540, N = 32;
		var svg = plotFrame(W, H, 'Encoder channels A and B');
		var lineA = s('polyline', { 'class': 'plot-line', fill: 'none' });
		var lineB = s('polyline', { 'class': 'plot-line plot-line-b', fill: 'none' });
		var la = s('text', { 'class': 'plot-label', x: left - 6, y: 38, 'text-anchor': 'end' }); la.textContent = 'A';
		var lb = s('text', { 'class': 'plot-label', x: left - 6, y: 98, 'text-anchor': 'end' }); lb.textContent = 'B';
		[la, lb, lineA, lineB].forEach(function (n) { svg.appendChild(n); });
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var back = h('button', { type: 'button', 'class': 'btn-copy-bibtex', text: '◀ Turn back' });
		var fwd = h('button', { type: 'button', 'class': 'btn-copy-bibtex', text: 'Turn forward ▶' });
		var reset = h('button', { type: 'button', 'class': 'btn-copy-bibtex', text: 'Reset' });
		var buttons = h('div', { 'class': 'widget-buttons' }, [back, fwd, reset]);

		// Quadrature sequence for counts 0,1,2,3: A B = 00, 10, 11, 01
		function levels(c) {
			var p = ((c % 4) + 4) % 4;
			return [p === 1 || p === 2 ? 1 : 0, p === 2 || p === 3 ? 1 : 0];
		}
		function trace(idx, y0) {
			var step = (right - left) / N, pts = [], prevY = null;
			for (var i = 0; i < N; i++) {
				var c = history[history.length - N + i];
				var lv = c === undefined ? 0 : levels(c)[idx];
				var y = lv ? y0 - 24 : y0;
				var x = left + i * step;
				if (prevY !== null && prevY !== y) pts.push([x, prevY]);
				pts.push([x, y], [x + step, y]);
				prevY = y;
			}
			return pts.map(function (p) { return p.join(','); }).join(' ');
		}
		function draw() {
			ppr.out.textContent = ppr.input.value;
			dia.out.textContent = dia.input.value + ' mm';
			lineA.setAttribute('points', trace(0, 50));
			lineB.setAttribute('points', trace(1, 110));
			var cpr = Number(ppr.input.value) * 4;
			var revs = count / cpr;
			var dist = revs * Math.PI * Number(dia.input.value);
			var lv = levels(count);
			readout.textContent = 'A=' + lv[0] + ' B=' + lv[1] + ' · count ' + count + ' · CPR = ' + ppr.input.value +
				' × 4 = ' + cpr + ' · ' + revs.toFixed(3) + ' rev · ' + dist.toFixed(1) + ' mm traveled';
		}
		function step(dir) {
			count += dir; history.push(count);
			if (history.length > 200) history.shift();
			draw();
		}
		back.addEventListener('click', function () { step(-1); });
		fwd.addEventListener('click', function () { step(1); });
		reset.addEventListener('click', function () { count = 0; history = []; draw(); });
		[ppr, dia].forEach(function (c) { c.input.addEventListener('input', draw); });
		root.replaceChildren(frame('quadrature encoder', [ppr.row, dia.row, buttons, svg, readout,
			h('p', { 'class': 'widget-note', text: 'Turn forward and A changes before B; turn back and B changes first. Each edge of either channel is one count.' })]));
		history.push(0);
		draw();
	}

	/* ---------- PID playground ---------- */

	// A DC motor turning an arm to 1 rad against a small constant load.
	// Output is clamped to ±12 V like a real motor driver.
	function simulate(Kp, Ki, Kd, antiWindup) {
		var dt = 0.01, T = 6, tau = 0.4, b = 8, umax = 12, load = 0.6, sp = 1;
		var th = 0, w = 0, I = 0, prev = sp, out = [];
		for (var t = 0; t < T; t += dt) {
			var e = sp - th;
			var d = (e - prev) / dt; prev = e;
			var uRaw = Kp * e + Ki * (I + e * dt) + Kd * d;
			var u = Math.max(-umax, Math.min(umax, uRaw));
			if (!antiWindup || u === uRaw) I += e * dt;
			w += ((b * (u - load) - w) / tau) * dt;
			th += w * dt;
			out.push(th);
		}
		return out;
	}

	function initPid(root) {
		var kp = slider('Kp', 'pid-kp', 0, 10, 0.1, 3, '');
		var ki = slider('Ki', 'pid-ki', 0, 5, 0.1, 0, '');
		var kd = slider('Kd', 'pid-kd', 0, 1, 0.01, 0, '');
		var aw = h('input', { type: 'checkbox', id: 'pid-aw' });
		var awRow = h('div', { 'class': 'widget-control widget-check' }, [aw, h('label', { 'for': 'pid-aw', text: 'Clamp the integral (anti-windup)' })]);
		var W = 560, H = 220, left = 44, right = 548, top = 14, bottom = 190, yMax = 2;
		var svg = plotFrame(W, H, 'Step response');
		function y(v) { return bottom - (Math.max(-0.2, Math.min(yMax, v)) / yMax) * (bottom - top); }
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: left, y1: bottom, x2: right, y2: bottom }));
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: left, y1: top, x2: left, y2: bottom }));
		svg.appendChild(s('line', { 'class': 'plot-ref', x1: left, x2: right, y1: y(1), y2: y(1) }));
		var spl = s('text', { 'class': 'plot-label', x: right - 2, y: y(1) - 5, 'text-anchor': 'end' }); spl.textContent = 'setpoint';
		svg.appendChild(spl);
		[0, 1, 2].forEach(function (v) {
			var t = s('text', { 'class': 'plot-label', x: left - 6, y: y(v) + 4, 'text-anchor': 'end' }); t.textContent = v + ' rad';
			svg.appendChild(t);
		});
		[0, 2, 4, 6].forEach(function (sec) {
			var t = s('text', { 'class': 'plot-label', x: left + (right - left) * sec / 6, y: bottom + 16, 'text-anchor': 'middle' }); t.textContent = sec + ' s';
			svg.appendChild(t);
		});
		var line = s('polyline', { 'class': 'plot-line', fill: 'none' });
		svg.appendChild(line);
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var presets = h('div', { 'class': 'widget-buttons' });
		[['P only', 3, 0, 0], ['Too much P', 10, 0, 0], ['PD', 3, 0, 0.2], ['PID', 3, 2, 0.2]].forEach(function (p) {
			var b = h('button', { type: 'button', 'class': 'btn-copy-bibtex', text: p[0] });
			b.addEventListener('click', function () { kp.input.value = p[1]; ki.input.value = p[2]; kd.input.value = p[3]; draw(); });
			presets.appendChild(b);
		});

		function draw() {
			[kp, ki, kd].forEach(function (c) { c.out.textContent = Number(c.input.value).toFixed(c === kd ? 2 : 1); });
			var data = simulate(Number(kp.input.value), Number(ki.input.value), Number(kd.input.value), aw.checked);
			var n = data.length;
			line.setAttribute('points', data.map(function (v, i) {
				return (left + (right - left) * i / (n - 1)).toFixed(1) + ',' + y(v).toFixed(1);
			}).join(' '));
			var max = Math.max.apply(null, data), last = data[n - 1];
			var settle = null;
			for (var i = n - 1; i >= 0; i--) { if (Math.abs(data[i] - 1) > 0.02) { settle = i < n - 1 ? (i + 1) * 0.01 : null; break; } }
			readout.textContent = 'Overshoot ' + Math.max(0, (max - 1) * 100).toFixed(0) + '% · final position ' + last.toFixed(3) +
				' rad (error ' + (1 - last).toFixed(3) + ') · ' +
				(settle === null ? 'does not settle within 2% in 6 s' : 'settles within 2% after ' + settle.toFixed(2) + ' s');
		}
		[kp, ki, kd].forEach(function (c) { c.input.addEventListener('input', draw); });
		aw.addEventListener('change', draw);
		root.replaceChildren(frame('PID tuning', [
			h('p', { 'class': 'widget-note', text: 'A motor turns an arm to 1 rad against a small constant load, with the output limited to ±12 V. Start with P only, then add D and I.' }),
			kp.row, ki.row, kd.row, awRow, presets, svg, readout
		]));
		draw();
	}

	/* ---------- Helpers for the newer widgets ---------- */

	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function button(text, onClick, label) {
		var b = h('button', { type: 'button', 'class': 'btn-copy-bibtex', text: text });
		if (label) b.setAttribute('aria-label', label);
		b.addEventListener('click', onClick);
		return b;
	}

	function pts(list) {
		return list.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
	}

	// Small seeded random generator so "Reset" replays the same noise.
	function rng(seed) {
		return function () {
			seed |= 0; seed = seed + 0x6D2B79F5 | 0;
			var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}

	function gauss(rand) {
		var u = 1 - rand(), v = rand();
		return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	}

	/* ---------- Two-link arm: forward and inverse kinematics, MoveJ vs MoveL ---------- */

	// Same arm as the worked example in lesson 1.6: L1 = 0.4 m, L2 = 0.3 m.
	function initArm(root) {
		var L1 = 0.4, L2 = 0.3, S = 230, C = 200, DEG = Math.PI / 180;
		var t1 = slider('Joint 1 angle θ1', 'arm-t1', -180, 180, 1, 30, '°');
		var t2 = slider('Joint 2 angle θ2', 'arm-t2', -180, 180, 1, 45, '°');
		var svg = plotFrame(400, 400, 'Two-link arm seen from above, with its reachable ring between 0.1 m and 0.7 m');
		svg.setAttribute('class', 'widget-plot widget-plot-square');
		function px(x, y) { return [C + x * S, C - y * S]; }
		svg.appendChild(s('circle', { 'class': 'plot-ref', cx: C, cy: C, r: (L1 + L2) * S, fill: 'none' }));
		svg.appendChild(s('circle', { 'class': 'plot-ref', cx: C, cy: C, r: Math.abs(L1 - L2) * S, fill: 'none' }));
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: 20, y1: C, x2: 380, y2: C }));
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: C, y1: 20, x2: C, y2: 380 }));
		var lx = s('text', { 'class': 'plot-label', x: 378, y: C - 6, 'text-anchor': 'end' }); lx.textContent = 'x';
		var ly = s('text', { 'class': 'plot-label', x: C + 6, y: 30 }); ly.textContent = 'y';
		var lr = s('text', { 'class': 'plot-label', x: C, y: C + (L1 + L2) * S + 14, 'text-anchor': 'middle' }); lr.textContent = 'reach: 0.1 m to 0.7 m';
		[lx, ly, lr].forEach(function (n) { svg.appendChild(n); });
		var trace = s('polyline', { 'class': 'plot-line plot-line-b plot-trace', fill: 'none' });
		var link = s('polyline', { 'class': 'plot-line arm-link', fill: 'none' });
		svg.appendChild(trace); svg.appendChild(link);
		var markA = s('circle', { 'class': 'arm-mark', r: 6 });
		var markB = s('circle', { 'class': 'arm-mark', r: 6 });
		var tA = s('text', { 'class': 'plot-label' }); tA.textContent = 'A';
		var tB = s('text', { 'class': 'plot-label' }); tB.textContent = 'B';
		[markA, markB, tA, tB].forEach(function (n) { svg.appendChild(n); });
		var joints = [0, 1, 2].map(function () { var c = s('circle', { 'class': 'arm-joint', r: 6 }); svg.appendChild(c); return c; });
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var moveOut = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var branch = 1; // +1: θ2 ≥ 0 (solution A in the lesson), -1: θ2 < 0 (solution B)
		var A = [30, 45], B = [-10, 100], anim = null;

		function fk(a, b) {
			var q1 = a * DEG, q2 = b * DEG;
			var ex = L1 * Math.cos(q1), ey = L1 * Math.sin(q1);
			return { elbow: [ex, ey], tip: [ex + L2 * Math.cos(q1 + q2), ey + L2 * Math.sin(q1 + q2)] };
		}
		function ik(x, y, sign) {
			var c2 = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2);
			if (Math.abs(c2) > 1) return null;
			var q2 = sign * Math.acos(c2);
			var q1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(q2), L1 + L2 * Math.cos(q2));
			var a = q1 / DEG;
			if (a > 180) a -= 360; if (a < -180) a += 360;
			return [a, q2 / DEG];
		}
		function setPose(a, b) {
			t1.input.value = Math.round(a); t2.input.value = Math.round(b);
			draw(a, b);
		}
		function draw(a, b) {
			if (a === undefined) { a = Number(t1.input.value); b = Number(t2.input.value); }
			t1.out.textContent = Math.round(a) + '°'; t2.out.textContent = Math.round(b) + '°';
			var k = fk(a, b), p0 = px(0, 0), p1 = px(k.elbow[0], k.elbow[1]), p2 = px(k.tip[0], k.tip[1]);
			link.setAttribute('points', pts([p0, p1, p2]));
			[p0, p1, p2].forEach(function (p, i) { joints[i].setAttribute('cx', p[0]); joints[i].setAttribute('cy', p[1]); });
			var r = Math.sqrt(k.tip[0] * k.tip[0] + k.tip[1] * k.tip[1]);
			readout.textContent = 'θ1 = ' + Math.round(a) + '°, θ2 = ' + Math.round(b) + '° → tool at x = ' + k.tip[0].toFixed(4) +
				' m, y = ' + k.tip[1].toFixed(4) + ' m, ' + r.toFixed(3) + ' m from the base, tool angle φ = ' + Math.round(a + b) + '°' +
				(Math.abs(b) < 1 ? '. Arm fully stretched: a singularity.' : '.');
			[[A, markA, tA], [B, markB, tB]].forEach(function (m) {
				var p = fk(m[0][0], m[0][1]).tip, q = px(p[0], p[1]);
				m[1].setAttribute('cx', q[0]); m[1].setAttribute('cy', q[1]);
				m[2].setAttribute('x', q[0] + 9); m[2].setAttribute('y', q[1] - 8);
			});
		}
		function toWorld(evt) {
			var m = svg.getScreenCTM();
			if (!m) return null;
			var p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY;
			p = p.matrixTransform(m.inverse());
			return [(p.x - C) / S, (C - p.y) / S];
		}
		var dragging = false;
		function pointTo(evt) {
			var w = toWorld(evt);
			if (!w) return;
			var q = ik(w[0], w[1], branch);
			if (!q) { readout.textContent = 'x = ' + w[0].toFixed(3) + ' m, y = ' + w[1].toFixed(3) + ' m is out of reach: |cos θ2| > 1, so there is no solution.'; return; }
			stop(); setPose(q[0], q[1]);
		}
		svg.addEventListener('pointerdown', function (e) { dragging = true; svg.setPointerCapture && svg.setPointerCapture(e.pointerId); pointTo(e); });
		svg.addEventListener('pointermove', function (e) { if (dragging) pointTo(e); });
		svg.addEventListener('pointerup', function () { dragging = false; });
		svg.addEventListener('pointercancel', function () { dragging = false; });

		function stop() { if (anim) { cancelAnimationFrame(anim); anim = null; } }
		function play(kind) {
			stop();
			var path = [], fail = null, N = 60;
			var pa = fk(A[0], A[1]).tip, pb = fk(B[0], B[1]).tip;
			var signA = A[1] >= 0 ? 1 : -1;
			for (var i = 0; i <= N; i++) {
				var u = i / N, q;
				if (kind === 'J') q = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u];
				else {
					q = ik(pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u, signA);
					if (!q) { fail = i; break; }
				}
				path.push(q);
			}
			var tipPts = path.map(function (q) { var t = fk(q[0], q[1]).tip; return px(t[0], t[1]); });
			var len = 0;
			for (var j = 1; j < path.length; j++) {
				var t0 = fk(path[j - 1][0], path[j - 1][1]).tip, t1p = fk(path[j][0], path[j][1]).tip;
				len += Math.hypot(t1p[0] - t0[0], t1p[1] - t0[1]);
			}
			var straight = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
			var msg = kind === 'J'
				? 'MoveJ: both joints start and stop together. The tool travels ' + len.toFixed(3) + ' m on a curve; the straight line is ' + straight.toFixed(3) + ' m.'
				: (fail === null
					? 'MoveL: the tool travels the straight line (' + straight.toFixed(3) + ' m). The controller solves inverse kinematics at every point along the way.'
					: 'MoveL fails: the straight line leaves the reachable ring, so inverse kinematics has no solution partway along. A MoveJ can still get there.');
			if (reduceMotion || !path.length) {
				trace.setAttribute('points', pts(tipPts));
				var last = path[path.length - 1] || A; setPose(last[0], last[1]);
				moveOut.textContent = msg; return;
			}
			var k = 0;
			moveOut.textContent = kind === 'J' ? 'Playing MoveJ…' : 'Playing MoveL…';
			(function frameStep() {
				k = Math.min(path.length - 1, k + 1);
				setPose(path[k][0], path[k][1]);
				trace.setAttribute('points', pts(tipPts.slice(0, k + 1)));
				if (k < path.length - 1) anim = requestAnimationFrame(frameStep);
				else { anim = null; moveOut.textContent = msg; }
			})();
		}
		var sol = h('div', { 'class': 'widget-buttons' }, [
			button('Solution A (θ2 ≥ 0)', function () { branch = 1; flip(); }),
			button('Solution B (θ2 < 0)', function () { branch = -1; flip(); })
		]);
		function flip() {
			var p = fk(Number(t1.input.value), Number(t2.input.value)).tip, q = ik(p[0], p[1], branch);
			if (q) setPose(q[0], q[1]);
		}
		var moves = h('div', { 'class': 'widget-buttons' }, [
			button('Set A here', function () { A = [Number(t1.input.value), Number(t2.input.value)]; trace.setAttribute('points', ''); draw(); }),
			button('Set B here', function () { B = [Number(t1.input.value), Number(t2.input.value)]; trace.setAttribute('points', ''); draw(); }),
			button('Play MoveJ A → B', function () { play('J'); }),
			button('Play MoveL A → B', function () { play('L'); })
		]);
		[t1, t2].forEach(function (c) { c.input.addEventListener('input', function () { stop(); draw(); }); });
		root.replaceChildren(frame('two-link arm', [
			h('p', { 'class': 'widget-note', text: 'The arm from section 10 (L1 = 0.4 m, L2 = 0.3 m). Move the sliders for forward kinematics, or tap or drag inside the ring to place the tool and let inverse kinematics find the angles.' }),
			t1.row, t2.row, sol, svg, readout,
			h('p', { 'class': 'widget-note', text: 'Then compare motion types: pick two poses A and B and play a joint move and a linear move between them.' }),
			moves, moveOut
		]));
		draw();
	}

	/* ---------- Block-based programming: blocks to RAPID and URScript ---------- */

	var TARGETS = [
		['home', 'home', 'pHome', 'p_home'],
		['abovePick', 'above pick', 'Offs(pPick, 0, 0, 100)', 'pose_add(p_pick, p[0, 0, 0.100, 0, 0, 0])'],
		['pick', 'pick', 'pPick', 'p_pick'],
		['aboveDrop', 'above drop', 'Offs(pDrop, 0, 0, 100)', 'pose_add(p_drop, p[0, 0, 0.100, 0, 0, 0])'],
		['drop', 'drop', 'pDrop', 'p_drop']
	];

	function initBlocks(root) {
		var lang = 'rapid';
		var program = [
			{ type: 'move', kind: 'joint', target: 'home', exact: false },
			{ type: 'waitPart' },
			{ type: 'move', kind: 'linear', target: 'abovePick', exact: false },
			{ type: 'move', kind: 'linear', target: 'pick', exact: true },
			{ type: 'grip', close: true },
			{ type: 'wait', secs: 0.3 },
			{ type: 'move', kind: 'linear', target: 'abovePick', exact: false },
			{ type: 'move', kind: 'joint', target: 'aboveDrop', exact: false },
			{ type: 'move', kind: 'linear', target: 'drop', exact: true },
			{ type: 'grip', close: false },
			{ type: 'move', kind: 'joint', target: 'home', exact: true }
		];
		var list = h('ol', { 'class': 'block-program', 'aria-label': 'Program blocks' });
		var code = h('code');
		var pre = h('pre', { 'class': 'article-code block-code' }, [code]);
		var warn = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var tabR = button('RAPID (ABB)', function () { lang = 'rapid'; render(); });
		var tabU = button('URScript (UR)', function () { lang = 'ur'; render(); });
		function target(id) { return TARGETS.filter(function (t) { return t[0] === id; })[0]; }
		function select(options, value, label, onChange) {
			var el = h('select', { 'aria-label': label });
			options.forEach(function (o) {
				var opt = h('option', { value: o[0], text: o[1] });
				if (String(o[0]) === String(value)) opt.selected = true;
				el.appendChild(opt);
			});
			el.addEventListener('change', function () { onChange(el.value); render(); });
			return el;
		}
		function blockUi(b, i) {
			var parts = [];
			if (b.type === 'move') {
				parts.push(h('span', { text: 'Move' }),
					select([['joint', 'joint'], ['linear', 'linear']], b.kind, 'Move type', function (v) { b.kind = v; }),
					h('span', { text: 'to' }),
					select(TARGETS.map(function (t) { return [t[0], t[1]]; }), b.target, 'Target', function (v) { b.target = v; }),
					select([['blend', 'and blend'], ['exact', 'and stop exactly']], b.exact ? 'exact' : 'blend', 'Stop or blend', function (v) { b.exact = v === 'exact'; }));
			} else if (b.type === 'grip') {
				parts.push(select([['close', 'Close'], ['open', 'Open']], b.close ? 'close' : 'open', 'Gripper action', function (v) { b.close = v === 'close'; }),
					h('span', { text: 'gripper' }));
			} else if (b.type === 'wait') {
				var n = h('input', { type: 'number', min: '0.1', max: '5', step: '0.1', value: b.secs, 'aria-label': 'Seconds to wait' });
				n.addEventListener('change', function () { b.secs = Math.max(0.1, Math.min(5, Number(n.value) || 0.1)); render(); });
				parts.push(h('span', { text: 'Wait' }), n, h('span', { text: 's' }));
			} else {
				parts.push(h('span', { text: 'Wait until a part is in position' }));
			}
			var tools = h('span', { 'class': 'block-tools' }, [
				button('↑', function () { if (i > 0) { program.splice(i - 1, 0, program.splice(i, 1)[0]); render(); } }, 'Move block ' + (i + 1) + ' up'),
				button('↓', function () { if (i < program.length - 1) { program.splice(i + 1, 0, program.splice(i, 1)[0]); render(); } }, 'Move block ' + (i + 1) + ' down'),
				button('✕', function () { program.splice(i, 1); render(); }, 'Delete block ' + (i + 1))
			]);
			return h('li', { 'class': 'block block-' + b.type }, [h('span', { 'class': 'block-body' }, parts), tools]);
		}
		function line(b) {
			var t = b.target && target(b.target);
			if (lang === 'rapid') {
				if (b.type === 'move') return (b.kind === 'joint' ? 'MoveJ ' : 'MoveL ') + t[2] + ', ' + (b.kind === 'joint' ? 'v1000' : 'v200') + ', ' + (b.exact ? 'fine' : (b.kind === 'joint' ? 'z50' : 'z10')) + ', tGripper;';
				if (b.type === 'grip') return 'SetDO doGripClose, ' + (b.close ? 1 : 0) + ';';
				if (b.type === 'wait') return 'WaitTime ' + b.secs + ';';
				return 'WaitDI diPartInPosition, 1;';
			}
			if (b.type === 'move') return (b.kind === 'joint' ? 'movej(' : 'movel(') + t[3] + (b.kind === 'joint' ? ', a=1.4, v=1.05' : ', a=1.2, v=0.25') + (b.exact ? '' : (b.kind === 'joint' ? ', r=0.05' : ', r=0.01')) + ')';
			if (b.type === 'grip') return 'set_digital_out(0, ' + (b.close ? 'True' : 'False') + ')';
			if (b.type === 'wait') return 'sleep(' + b.secs + ')';
			return 'while get_digital_in(0) == False:\n    sync()\n  end';
		}
		function render() {
			list.replaceChildren.apply(list, program.map(blockUi));
			var body = program.map(line);
			code.textContent = lang === 'rapid'
				? '! pHome, pPick, pDrop and tGripper are defined as in lesson 2.3\nPROC main()\n' + body.map(function (l) { return '    ' + l; }).join('\n') + '\nENDPROC'
				: 'def block_program():\n  # p_home, p_pick and p_drop are defined as in lesson 2.3\n' + body.map(function (l) { return '  ' + l; }).join('\n') + '\nend';
			tabR.setAttribute('aria-pressed', String(lang === 'rapid'));
			tabU.setAttribute('aria-pressed', String(lang === 'ur'));
			var issues = [];
			program.forEach(function (b, i) {
				var prev = program[i - 1];
				if (b.type === 'grip' && prev && prev.type === 'move' && !prev.exact)
					issues.push('Block ' + (i + 1) + ': the gripper acts right after a blended move, so the robot may not be exactly at the point. Set the move before it to "stop exactly".');
			});
			warn.textContent = issues.length ? issues.join(' ') : 'No problems found. ' + program.length + ' blocks become ' + body.length + ' instructions.';
		}
		var add = h('div', { 'class': 'widget-buttons' }, [
			button('+ Move', function () { program.push({ type: 'move', kind: 'linear', target: 'home', exact: false }); render(); }),
			button('+ Gripper', function () { program.push({ type: 'grip', close: true }); render(); }),
			button('+ Wait', function () { program.push({ type: 'wait', secs: 0.5 }); render(); }),
			button('+ Wait for part', function () { program.push({ type: 'waitPart' }); render(); })
		]);
		root.replaceChildren(frame('blocks to robot code', [
			h('p', { 'class': 'widget-note', text: 'A pick-and-place program as blocks, like the ones in ABB Wizard or a PolyScope program tree. Change a block and watch the generated code update, as Wizard converts blocks into RAPID.' }),
			list, add, h('div', { 'class': 'widget-buttons', role: 'group', 'aria-label': 'Language' }, [tabR, tabU]), pre, warn
		]));
		render();
	}

	/* ---------- Odometry: the UMBmark square with systematic errors ---------- */

	function initOdometry(root) {
		var ed = slider('Wheel diameter mismatch (right vs left)', 'odo-ed', -2, 2, 0.1, 0.5, '%');
		var eb = slider('Wheelbase error', 'odo-eb', -5, 5, 0.5, 0, '%');
		var SIDE = 4, BNOM = 0.3, SC = 62, OX = 70, OY = 300;
		var svg = plotFrame(420, 340, 'Top view of the 4 m square: the path odometry reports, and the real clockwise and counter-clockwise paths');
		svg.setAttribute('class', 'widget-plot widget-plot-square');
		function px(x, y) { return [OX + x * SC, OY - y * SC]; }
		svg.appendChild(s('polyline', { 'class': 'plot-ref', fill: 'none', points: pts([px(0, 0), px(4, 0), px(4, 4), px(0, 4), px(0, 0)]) }));
		var ccw = s('polyline', { 'class': 'plot-line', fill: 'none' });
		var cw = s('polyline', { 'class': 'plot-line plot-line-b', fill: 'none' });
		svg.appendChild(ccw); svg.appendChild(cw);
		var start = px(0, 0);
		svg.appendChild(s('circle', { 'class': 'arm-joint', cx: start[0], cy: start[1], r: 5 }));
		var lab = s('text', { 'class': 'plot-label', x: start[0] - 8, y: start[1] + 16, 'text-anchor': 'end' }); lab.textContent = 'start';
		svg.appendChild(lab);
		var key = s('text', { 'class': 'plot-label', x: 400, y: 20, 'text-anchor': 'end' }); key.textContent = 'dashed: what odometry reports';
		svg.appendChild(key);
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var legend = h('p', { 'class': 'widget-note', text: 'Blue: counter-clockwise run. Gold: clockwise run. Both runs start at the bottom-left corner.' });

		// The controller drives what its encoders say is a perfect square; the real wheels differ.
		function run(dir) {
			var e = Number(ed.input.value) / 100, b = BNOM * (1 + Number(eb.input.value) / 100);
			var x = 0, y = 0, th = dir > 0 ? 0 : Math.PI / 2, out = [px(0, 0)], n = 80;
			function move(dL, dR) {
				for (var i = 0; i < n; i++) {
					var l = dL / n * (1 - e / 2), r = dR / n * (1 + e / 2);
					var dc = (l + r) / 2, dth = (r - l) / b;
					x += dc * Math.cos(th + dth / 2); y += dc * Math.sin(th + dth / 2); th += dth;
				}
				out.push(px(x, y));
			}
			var turn = dir * BNOM * Math.PI / 4;
			for (var side = 0; side < 4; side++) { move(SIDE, SIDE); move(-turn, turn); }
			return { pts: out, err: Math.hypot(x, y) };
		}
		function draw() {
			ed.out.textContent = Number(ed.input.value).toFixed(1) + '%';
			eb.out.textContent = Number(eb.input.value).toFixed(1) + '%';
			var a = run(1), c = run(-1);
			ccw.setAttribute('points', pts(a.pts));
			cw.setAttribute('points', pts(c.pts));
			readout.textContent = 'Odometry says both runs end at the start. Real end-point error: counter-clockwise ' +
				(a.err * 100).toFixed(0) + ' cm, clockwise ' + (c.err * 100).toFixed(0) + ' cm.';
		}
		[ed, eb].forEach(function (c) { c.input.addEventListener('input', draw); });
		root.replaceChildren(frame('UMBmark square', [
			h('p', { 'class': 'widget-note', text: 'A robot with a 0.3 m wheelbase drives a 4 m square by its own odometry, once each way. Add one error at a time: unequal wheel diameters bend the two runs in opposite directions, while a wheelbase error over- or under-turns both the same way.' }),
			ed.row, eb.row, svg, legend, readout
		]));
		draw();
	}

	/* ---------- State machine: the line follower from lesson 6.7 ---------- */

	var FSM = {
		FOLLOW_LINE: { obstacle: ['AVOID_OBSTACLE', 'Record state entry timestamp; command right spin.'], lineLost: ['SEARCH', 'Record state entry timestamp; command arc sweep.'] },
		AVOID_OBSTACLE: { turnDone: ['SEARCH', 'Transition to search mode to locate line.'] },
		SEARCH: { lineFound: ['FOLLOW_LINE', 'Resume closed-loop differential line tracking.'], searchTimeout: ['STOP', 'Halt all motors; lock system in safe state.'] },
		STOP: {}
	};
	var FSM_EVENTS = [
		['obstacle', 'Obstacle closer than 20 cm'],
		['lineLost', 'Both sensors off the tape'],
		['turnDone', '600 ms passed and path clear'],
		['lineFound', 'A sensor sees the tape'],
		['searchTimeout', '5 s without the line'],
		['estop', 'Press the E-stop']
	];

	function initFsm(root) {
		var fig = root.querySelector('figure');
		var state = 'FOLLOW_LINE';
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var log = h('ol', { 'class': 'fsm-log', 'aria-label': 'Transition log' });
		function show(msg) {
			Array.prototype.forEach.call(fig.querySelectorAll('[data-state]'), function (g) {
				g.classList.toggle('d-active', g.getAttribute('data-state') === state);
			});
			readout.textContent = 'Current state: ' + state + '. ' + msg;
		}
		function fire(ev, label) {
			var from = state, t;
			if (ev === 'estop') t = from === 'STOP' ? null : ['STOP', 'Instantly cut PWM to all motors; require manual reset.'];
			else t = FSM[from][ev] || null;
			if (!t) { show('"' + label + '" has no transition from ' + from + ', so nothing happens.'); return; }
			state = t[0];
			var li = h('li', { text: from + ' → ' + state + ' (' + label + '): ' + t[1] });
			log.insertBefore(li, log.firstChild);
			while (log.children.length > 6) log.removeChild(log.lastChild);
			show(t[1]);
		}
		var buttons = h('div', { 'class': 'widget-buttons' }, FSM_EVENTS.map(function (e) {
			return button(e[1], function () { fire(e[0], e[1]); });
		}).concat([button('Manual reset', function () { state = 'FOLLOW_LINE'; log.replaceChildren(); show('Reset by hand; the simulation starts again in FOLLOW_LINE.'); })]));
		root.replaceChildren(frame('state machine', [
			h('p', { 'class': 'widget-note', text: 'Send events to the robot and watch the highlighted state. Events with no row in the transition table are ignored, which is what a well-designed table guarantees.' }),
			fig, buttons, readout, log
		]));
		show('Waiting for an event.');
	}

	/* ---------- Kalman filter: the 1D hallway robot from lesson 6.8 ---------- */

	function initKalman(root) {
		var qs = slider('Filter process noise Q', 'kf-q', 0.001, 0.1, 0.001, 0.01, ' m²');
		var rs = slider('Filter measurement noise R', 'kf-r', 0.005, 0.5, 0.005, 0.05, ' m²');
		var TRUE_Q = 0.01, TRUE_R = 0.05, U = 0.5, STEPS = 20;
		var W = 560, H = 230, left = 46, right = 548, top = 14, bottom = 196, YM = 1;
		var svg = plotFrame(W, H, 'Position error over 20 steps for odometry alone, raw sensor readings and the Kalman estimate');
		function X(k) { return left + (right - left) * k / STEPS; }
		function Y(v) { return top + (bottom - top) * (YM - Math.max(-YM, Math.min(YM, v))) / (2 * YM); }
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: left, y1: Y(0), x2: right, y2: Y(0) }));
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: left, y1: top, x2: left, y2: bottom }));
		[-1, -0.5, 0, 0.5, 1].forEach(function (v) {
			var t = s('text', { 'class': 'plot-label', x: left - 6, y: Y(v) + 4, 'text-anchor': 'end' }); t.textContent = v + ' m'; svg.appendChild(t);
		});
		[0, 5, 10, 15, 20].forEach(function (k) {
			var t = s('text', { 'class': 'plot-label', x: X(k), y: bottom + 16, 'text-anchor': 'middle' }); t.textContent = 'step ' + k; svg.appendChild(t);
		});
		var band = s('polygon', { 'class': 'plot-band' });
		var odo = s('polyline', { 'class': 'plot-line plot-line-c', fill: 'none' });
		var meas = s('polyline', { 'class': 'plot-line plot-line-b', fill: 'none' });
		var est = s('polyline', { 'class': 'plot-line', fill: 'none' });
		[band, odo, meas, est].forEach(function (n) { svg.appendChild(n); });
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var seed = 7, k = 0, world;

		function reset() {
			var rand = rng(seed), truth = 2 + 0.2 * gauss(rand), odoX = 2;
			world = { truth: [truth], odo: [odoX], z: [null] };
			for (var i = 1; i <= STEPS; i++) {
				truth += U + Math.sqrt(TRUE_Q) * gauss(rand);
				odoX += U;
				world.truth.push(truth); world.odo.push(odoX);
				world.z.push(truth + Math.sqrt(TRUE_R) * gauss(rand));
			}
			k = 0; draw();
		}
		function filter() {
			var Q = Number(qs.input.value), R = Number(rs.input.value), x = 2, P = 0.04, out = [{ x: x, P: P }];
			for (var i = 1; i <= STEPS; i++) {
				var xp = x + U, Pp = P + Q, K = Pp / (Pp + R);
				x = xp + K * (world.z[i] - xp); P = (1 - K) * Pp;
				out.push({ x: x, P: P, xp: xp, Pp: Pp, K: K });
			}
			return out;
		}
		function draw() {
			qs.out.textContent = Number(qs.input.value).toFixed(3);
			rs.out.textContent = Number(rs.input.value).toFixed(3);
			var f = filter(), up = [], down = [], e = [], o = [], m = [];
			for (var i = 0; i <= k; i++) {
				var t = world.truth[i], sd = 2 * Math.sqrt(f[i].P);
				up.push([X(i), Y(f[i].x - t + sd)]); down.unshift([X(i), Y(f[i].x - t - sd)]);
				e.push([X(i), Y(f[i].x - t)]); o.push([X(i), Y(world.odo[i] - t)]);
				if (i > 0) m.push([X(i), Y(world.z[i] - t)]);
			}
			band.setAttribute('points', pts(up.concat(down)));
			est.setAttribute('points', pts(e)); odo.setAttribute('points', pts(o)); meas.setAttribute('points', pts(m));
			if (k === 0) { readout.textContent = 'Step 0: x = 2.00 m, P = 0.040 m². Press Step to drive 0.50 m and take a reading.'; return; }
			var c = f[k];
			readout.textContent = 'Step ' + k + ': x_pred = ' + (c.xp - U).toFixed(2) + ' + 0.50 = ' + c.xp.toFixed(2) + ' m, P_pred = ' + c.Pp.toFixed(3) +
				', K = ' + c.K.toFixed(2) + ', z = ' + world.z[k].toFixed(2) + ' m → x = ' + c.x.toFixed(2) + ' m, P = ' + c.P.toFixed(3) +
				' m². Errors now: odometry ' + (world.odo[k] - world.truth[k]).toFixed(2) + ' m, Kalman ' + (c.x - world.truth[k]).toFixed(2) + ' m.';
		}
		var btns = h('div', { 'class': 'widget-buttons' }, [
			button('Step', function () { if (k < STEPS) { k++; draw(); } }),
			button('Run all 20', function () { k = STEPS; draw(); }),
			button('Reset', function () { reset(); }),
			button('New noise', function () { seed++; reset(); })
		]);
		[qs, rs].forEach(function (c) { c.input.addEventListener('input', draw); });
		root.replaceChildren(frame('1D Kalman filter', [
			h('p', { 'class': 'widget-note', text: 'The hallway robot from section 04: it starts at x = 2.00 m with P = 0.04 m², drives 0.50 m per step and reads a wall sensor. The simulated world uses Q = 0.01 and R = 0.05; the sliders set what the filter assumes, so you can see what mis-tuning does.' }),
			qs.row, rs.row, btns, svg,
			h('p', { 'class': 'widget-note', text: 'Each line is an error from the true position. Grey: odometry alone. Gold: raw sensor. Blue: Kalman estimate, with its ±2σ band.' }),
			readout
		]));
		reset();
	}

	/* ---------- ROS graph: Turtlesim nodes and topics from lesson 4.4 ---------- */

	function initRosgraph(root) {
		var W = 380, H = 320;
		var svg = plotFrame(W, H, 'ROS node and topic graph for Turtlesim');
		svg.setAttribute('class', 'widget-plot lesson-diagram');

		var defs = s('defs', {});
		var mk1 = s('marker', { id: 'arrow-ros', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
		mk1.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', 'class': 'd-fill' }));
		var mk2 = s('marker', { id: 'arrow-ros-gold', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
		mk2.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--wp-gold-text)' }));
		defs.appendChild(mk1); defs.appendChild(mk2);
		svg.appendChild(defs);

		var ITEMS = [
			{ id: 'teleop', kind: 'node', label: '/teleop_turtle', sub: 'node', x: 100, y: 15, w: 180, h: 52, rx: 4 },
			{ id: 'cmd_vel', kind: 'topic', label: '/turtle1/cmd_vel', sub: 'geometry_msgs/msg/Twist', x: 80, y: 90, w: 220, h: 52, rx: 16 },
			{ id: 'turtlesim', kind: 'node', label: '/turtlesim', sub: 'node', x: 100, y: 165, w: 180, h: 52, rx: 4 },
			{ id: 'pose', kind: 'topic', label: '/turtle1/pose', sub: 'turtlesim_msgs/msg/Pose', x: 8, y: 250, w: 178, h: 52, rx: 16 },
			{ id: 'color_sensor', kind: 'topic', label: '/turtle1/color_sensor', sub: 'turtlesim_msgs/msg/Color', x: 194, y: 250, w: 178, h: 52, rx: 16 }
		];

		var ARROWS = [
			{ id: 'a-teleop-cmd', from: 'teleop', to: 'cmd_vel', type: 'line', x1: 190, y1: 67, x2: 190, y2: 88 },
			{ id: 'a-cmd-sim', from: 'cmd_vel', to: 'turtlesim', type: 'line', x1: 190, y1: 142, x2: 190, y2: 163 },
			{ id: 'a-sim-pose', from: 'turtlesim', to: 'pose', type: 'path', d: 'M 150,217 C 150,238 97,232 97,248' },
			{ id: 'a-sim-color', from: 'turtlesim', to: 'color_sensor', type: 'path', d: 'M 230,217 C 230,238 283,232 283,248' }
		];

		var arrowEls = {};
		ARROWS.forEach(function (a) {
			var el;
			if (a.type === 'line') {
				el = s('line', { 'class': 'd-line', x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2, 'marker-end': 'url(#arrow-ros)' });
			} else {
				el = s('path', { 'class': 'd-line', d: a.d, fill: 'none', 'marker-end': 'url(#arrow-ros)' });
			}
			svg.appendChild(el);
			arrowEls[a.id] = el;
		});

		var itemEls = {};
		var selected = null;
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		function update() {
			ITEMS.forEach(function (item) {
				var g = itemEls[item.id];
				var isSel = selected === item.id;
				var isConn = false;
				if (selected === 'teleop') isConn = item.id === 'cmd_vel';
				else if (selected === 'cmd_vel') isConn = item.id === 'teleop' || item.id === 'turtlesim';
				else if (selected === 'turtlesim') isConn = item.id === 'cmd_vel' || item.id === 'pose' || item.id === 'color_sensor';
				else if (selected === 'pose' || selected === 'color_sensor') isConn = item.id === 'turtlesim';

				g.classList.toggle('d-active', isSel || isConn);
				g.setAttribute('aria-pressed', isSel ? 'true' : 'false');
			});

			ARROWS.forEach(function (a) {
				var el = arrowEls[a.id];
				var active = false;
				if (selected === 'teleop' && a.id === 'a-teleop-cmd') active = true;
				else if (selected === 'cmd_vel' && (a.id === 'a-teleop-cmd' || a.id === 'a-cmd-sim')) active = true;
				else if (selected === 'turtlesim' && (a.id === 'a-cmd-sim' || a.id === 'a-sim-pose' || a.id === 'a-sim-color')) active = true;
				else if (selected === 'pose' && a.id === 'a-sim-pose') active = true;
				else if (selected === 'color_sensor' && a.id === 'a-sim-color') active = true;

				if (active) {
					el.setAttribute('class', 'd-strong');
					el.setAttribute('style', 'stroke: var(--wp-gold-text);');
					el.setAttribute('marker-end', 'url(#arrow-ros-gold)');
				} else {
					el.setAttribute('class', 'd-line');
					el.removeAttribute('style');
					el.setAttribute('marker-end', 'url(#arrow-ros)');
				}
			});

			if (!selected) {
				readout.textContent = 'Click or select a node (box) or topic (rounded box) to inspect connections.';
			} else if (selected === 'teleop') {
				readout.textContent = 'teleop_turtle publishes /turtle1/cmd_vel';
			} else if (selected === 'cmd_vel') {
				readout.textContent = '/turtle1/cmd_vel [geometry_msgs/msg/Twist]: published by /teleop_turtle, subscribed by /turtlesim';
			} else if (selected === 'turtlesim') {
				readout.textContent = 'turtlesim subscribes to /turtle1/cmd_vel; publishes /turtle1/color_sensor and /turtle1/pose';
			} else if (selected === 'pose') {
				readout.textContent = '/turtle1/pose [turtlesim_msgs/msg/Pose]: published by /turtlesim';
			} else if (selected === 'color_sensor') {
				readout.textContent = '/turtle1/color_sensor [turtlesim_msgs/msg/Color]: published by /turtlesim';
			}
		}

		function select(id) {
			selected = (selected === id) ? null : id;
			update();
		}

		ITEMS.forEach(function (item) {
			var g = s('g', {
				tabindex: '0',
				role: 'button',
				'aria-label': (item.kind === 'node' ? 'Node ' : 'Topic ') + item.label + ' (' + item.sub + ')',
				style: 'cursor: pointer;'
			});
			var rect = s('rect', { 'class': 'd-box', x: item.x, y: item.y, width: item.w, height: item.h, rx: item.rx });
			var t1 = s('text', { 'class': 'd-title', x: item.x + item.w / 2, y: item.y + 23, 'text-anchor': 'middle' });
			t1.textContent = item.label;
			var t2 = s('text', { 'class': 'd-muted', x: item.x + item.w / 2, y: item.y + 41, 'text-anchor': 'middle' });
			t2.textContent = item.sub;
			g.appendChild(rect); g.appendChild(t1); g.appendChild(t2);

			g.addEventListener('click', function () { select(item.id); });
			g.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
					e.preventDefault();
					select(item.id);
				}
			});
			svg.appendChild(g);
			itemEls[item.id] = g;
		});

		var resetBtn = button('Clear selection', function () { selected = null; update(); });
		var wrap = h('figure', { 'class': 'lesson-diagram', style: 'margin: 8px 0; padding: 0; border: 0;' }, [svg]);

		root.replaceChildren(frame('ROS 2 node and topic graph', [
			h('p', { 'class': 'widget-note', text: 'Nodes are boxes; topics are rounded boxes. Click or focus any item (Enter or Space) to highlight its publisher and subscriber connections.' }),
			wrap,
			h('div', { 'class': 'widget-buttons' }, [resetBtn]),
			readout
		]));
		update();
	}

	/* ---------- MoveJ vs MoveL: joint vs linear interpolation from lesson 2.3 ---------- */

	function initMovejl(root) {
		var L1 = 0.4, L2 = 0.3, S = 230, C = 200, DEG = Math.PI / 180;
		var svg = plotFrame(400, 400, 'Two-link arm comparing MoveJ curved path and MoveL straight-line path');
		svg.setAttribute('class', 'widget-plot widget-plot-square');

		function px(x, y) { return [C + x * S, C - y * S]; }

		svg.appendChild(s('circle', { 'class': 'plot-ref', cx: C, cy: C, r: (L1 + L2) * S, fill: 'none' }));
		svg.appendChild(s('circle', { 'class': 'plot-ref', cx: C, cy: C, r: Math.abs(L1 - L2) * S, fill: 'none' }));
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: 20, y1: C, x2: 380, y2: C }));
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: C, y1: 20, x2: C, y2: 380 }));

		var traceJ = s('polyline', { 'class': 'plot-line plot-line-b plot-trace', fill: 'none' });
		var traceL = s('polyline', { 'class': 'plot-line plot-trace', fill: 'none' });
		var link = s('polyline', { 'class': 'plot-line arm-link', fill: 'none' });
		svg.appendChild(traceJ);
		svg.appendChild(traceL);
		svg.appendChild(link);

		var markA = s('circle', { 'class': 'arm-mark', r: 6 });
		var markB = s('circle', { 'class': 'arm-mark', r: 6 });
		var tA = s('text', { 'class': 'plot-label' }); tA.textContent = 'A';
		var tB = s('text', { 'class': 'plot-label' }); tB.textContent = 'B';
		[markA, markB, tA, tB].forEach(function (n) { svg.appendChild(n); });

		var joints = [0, 1, 2].map(function () {
			var c = s('circle', { 'class': 'arm-joint', r: 6 });
			svg.appendChild(c);
			return c;
		});

		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var A = [30, 45], B = [-10, 100];
		var anim = null;
		var jPts = [], lPts = [];

		function fk(a, b) {
			var q1 = a * DEG, q2 = b * DEG;
			var ex = L1 * Math.cos(q1), ey = L1 * Math.sin(q1);
			return { elbow: [ex, ey], tip: [ex + L2 * Math.cos(q1 + q2), ey + L2 * Math.sin(q1 + q2)] };
		}

		function ik(x, y, sign) {
			var c2 = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2);
			if (Math.abs(c2) > 1) return null;
			var q2 = sign * Math.acos(c2);
			var q1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(q2), L1 + L2 * Math.cos(q2));
			var a = q1 / DEG;
			if (a > 180) a -= 360; if (a < -180) a += 360;
			return [a, q2 / DEG];
		}

		function drawPose(a, b) {
			var k = fk(a, b), p0 = px(0, 0), p1 = px(k.elbow[0], k.elbow[1]), p2 = px(k.tip[0], k.tip[1]);
			link.setAttribute('points', pts([p0, p1, p2]));
			[p0, p1, p2].forEach(function (p, i) { joints[i].setAttribute('cx', p[0]); joints[i].setAttribute('cy', p[1]); });
		}

		function setupTargets() {
			[[A, markA, tA], [B, markB, tB]].forEach(function (m) {
				var p = fk(m[0][0], m[0][1]).tip, q = px(p[0], p[1]);
				m[1].setAttribute('cx', q[0]); m[1].setAttribute('cy', q[1]);
				m[2].setAttribute('x', q[0] + 9); m[2].setAttribute('y', q[1] - 8);
			});
		}

		function stop() {
			if (anim) { cancelAnimationFrame(anim); anim = null; }
		}

		function runMove(kind) {
			stop();
			var N = 60, path = [];
			var pa = fk(A[0], A[1]).tip, pb = fk(B[0], B[1]).tip;
			var signA = A[1] >= 0 ? 1 : -1;

			for (var i = 0; i <= N; i++) {
				var u = i / N, q;
				if (kind === 'J') {
					q = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u];
				} else {
					q = ik(pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u, signA);
					if (!q) break;
				}
				path.push(q);
			}

			var tipScreenPts = path.map(function (q) {
				var t = fk(q[0], q[1]).tip;
				return px(t[0], t[1]);
			});

			var straightDist = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
			var curveDist = 0;
			for (var j = 1; j < path.length; j++) {
				var t0 = fk(path[j - 1][0], path[j - 1][1]).tip, t1p = fk(path[j][0], path[j][1]).tip;
				curveDist += Math.hypot(t1p[0] - t0[0], t1p[1] - t0[1]);
			}

			var msg = kind === 'J'
				? 'MoveJ: joint angles interpolate linearly, so the tool tip traces a curved path (' + curveDist.toFixed(3) + ' m; straight line is ' + straightDist.toFixed(3) + ' m).'
				: 'MoveL: tool position interpolates in a straight line (' + straightDist.toFixed(3) + ' m). Inverse kinematics finds the matching joint positions at each step.';

			if (reduceMotion || !path.length) {
				if (kind === 'J') {
					jPts = tipScreenPts;
					traceJ.setAttribute('points', pts(jPts));
				} else {
					lPts = tipScreenPts;
					traceL.setAttribute('points', pts(lPts));
				}
				var last = path[path.length - 1];
				drawPose(last[0], last[1]);
				readout.textContent = msg;
				return;
			}

			var k = 0;
			readout.textContent = kind === 'J' ? 'Running MoveJ A → B…' : 'Running MoveL A → B…';
			(function frameStep() {
				k = Math.min(path.length - 1, k + 1);
				drawPose(path[k][0], path[k][1]);
				if (kind === 'J') {
					jPts = tipScreenPts.slice(0, k + 1);
					traceJ.setAttribute('points', pts(jPts));
				} else {
					lPts = tipScreenPts.slice(0, k + 1);
					traceL.setAttribute('points', pts(lPts));
				}
				if (k < path.length - 1) anim = requestAnimationFrame(frameStep);
				else { anim = null; readout.textContent = msg; }
			})();
		}

		function reset() {
			stop();
			jPts = []; lPts = [];
			traceJ.setAttribute('points', '');
			traceL.setAttribute('points', '');
			drawPose(A[0], A[1]);
			readout.textContent = 'Arm at target A. Press MoveJ or MoveL to trace motion to target B.';
		}

		var btnJ = button('MoveJ', function () { runMove('J'); });
		var btnL = button('MoveL', function () { runMove('L'); });
		var btnReset = button('Reset', reset);

		var controls = h('div', { 'class': 'widget-buttons' }, [btnJ, btnL, btnReset]);
		var legend = h('p', { 'class': 'widget-note', text: 'The gold dashed trace is MoveJ (joint move, curved path); the other dashed trace is MoveL (linear move, straight line). Both stay visible for comparison.' });

		root.replaceChildren(frame('MoveJ vs MoveL motion interpolation', [
			h('p', { 'class': 'widget-note', text: 'Compare MoveJ and MoveL between the same two fixed targets A and B. MoveJ moves the arm without forcing a straight-line path; MoveL moves the tool in a straight line.' }),
			controls,
			svg,
			legend,
			readout
		]));

		setupTargets();
		reset();
	}

	/* ---------- Image thresholding: grayscale to binary from lesson 7.3 ---------- */

	function initThreshold(root) {
		var W_CELLS = 32, H_CELLS = 24, TOTAL = W_CELLS * H_CELLS;
		var CSIZE = 8;
		var W_IMG = W_CELLS * CSIZE, H_IMG = H_CELLS * CSIZE;
		var X_ORIG = 15, X_BIN = 305, Y_TOP = 26;
		var svg = plotFrame(580, 230, 'Original grayscale image next to binary threshold result');

		var raw = [];
		for (var y = 0; y < H_CELLS; y++) {
			for (var x = 0; x < W_CELLS; x++) {
				var bg = Math.round(35 + 45 * (x / (W_CELLS - 1)) + 25 * (y / (H_CELLS - 1)));
				var dx = (x - 15) / 7.5;
				var dy = (y - 11) / 5.5;
				var d = Math.sqrt(dx * dx + dy * dy);
				var val;
				if (d <= 1.0 && d >= 0.35) {
					val = Math.round(180 + 40 * (1 - Math.abs(d - 0.65) / 0.35));
				} else {
					val = bg;
				}
				raw.push(Math.max(0, Math.min(255, val)));
			}
		}

		var tOrig = s('text', { 'class': 'd-title', x: X_ORIG + W_IMG / 2, y: 18, 'text-anchor': 'middle' });
		tOrig.textContent = 'Original grayscale';
		var tBin = s('text', { 'class': 'd-title', x: X_BIN + W_IMG / 2, y: 18, 'text-anchor': 'middle' });
		tBin.textContent = 'Binary result (cv.THRESH_BINARY)';
		svg.appendChild(tOrig); svg.appendChild(tBin);

		svg.appendChild(s('rect', { 'class': 'd-line', x: X_ORIG - 1, y: Y_TOP - 1, width: W_IMG + 2, height: H_IMG + 2, fill: 'none' }));
		svg.appendChild(s('rect', { 'class': 'd-line', x: X_BIN - 1, y: Y_TOP - 1, width: W_IMG + 2, height: H_IMG + 2, fill: 'none' }));

		for (var i = 0; i < TOTAL; i++) {
			var cx = i % W_CELLS, cy = Math.floor(i / W_CELLS);
			var v = raw[i];
			var hex = v.toString(16);
			if (hex.length < 2) hex = '0' + hex;
			svg.appendChild(s('rect', {
				x: X_ORIG + cx * CSIZE,
				y: Y_TOP + cy * CSIZE,
				width: CSIZE,
				height: CSIZE,
				fill: '#' + hex + hex + hex
			}));
		}

		var binCells = [];
		for (var j = 0; j < TOTAL; j++) {
			var bx = j % W_CELLS, by = Math.floor(j / W_CELLS);
			var bRect = s('rect', {
				x: X_BIN + bx * CSIZE,
				y: Y_TOP + by * CSIZE,
				width: CSIZE,
				height: CSIZE,
				fill: '#000000'
			});
			svg.appendChild(bRect);
			binCells.push(bRect);
		}

		var sl = slider('Threshold value', 'thresh-val', 0, 255, 1, 127, '');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		function draw() {
			var th = Number(sl.input.value);
			sl.out.textContent = th;
			var onCount = 0;
			for (var k = 0; k < TOTAL; k++) {
				var on = raw[k] > th;
				if (on) onCount++;
				binCells[k].setAttribute('fill', on ? '#ffffff' : '#000000');
			}
			readout.textContent = 'Threshold: ' + th + ' · On pixels (white, 255): ' + onCount + ' of ' + TOTAL +
				' (' + (onCount * 100 / TOTAL).toFixed(1) + '%) · Background pixels (black, 0): ' + (TOTAL - onCount) + '.';
		}

		sl.input.addEventListener('input', draw);
		root.replaceChildren(frame('image thresholding', [
			h('p', { 'class': 'widget-note', text: 'Binarization converts an 8-bit grayscale image into a 1-bit binary image. In simple thresholding with cv.threshold and cv.THRESH_BINARY, pixels smaller than or equal to the threshold are set to 0 (black background) while all others are set to 255 (white foreground).' }),
			sl.row,
			svg,
			readout
		]));
		draw();
	}

	/* ---------- Pull request workflow from lesson 3.2 ---------- */

	function initPrflow(root) {
		var W = 380, H = 400;
		var svg = plotFrame(W, H, 'Fork and pull request workflow step-through diagram');
		svg.setAttribute('class', 'widget-plot lesson-diagram');

		var defs = s('defs', {});
		var mk1 = s('marker', { id: 'arrow-pr', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
		mk1.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', 'class': 'd-fill' }));
		var mk2 = s('marker', { id: 'arrow-pr-gold', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
		mk2.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--wp-gold-text)' }));
		defs.appendChild(mk1); defs.appendChild(mk2);
		svg.appendChild(defs);

		var gUpstream = s('g', { id: 'pr-upstream' });
		gUpstream.appendChild(s('rect', { 'class': 'd-box', x: 30, y: 15, width: 320, height: 80, rx: 6 }));
		var tU1 = s('text', { 'class': 'd-title', x: 190, y: 36, 'text-anchor': 'middle' }); tU1.textContent = 'Upstream repository';
		var tU2 = s('text', { 'class': 'd-muted', x: 190, y: 53, 'text-anchor': 'middle' }); tU2.textContent = 'official project (GitHub)';
		gUpstream.appendChild(tU1); gUpstream.appendChild(tU2);
		svg.appendChild(gUpstream);

		var gFork = s('g', { id: 'pr-fork' });
		gFork.appendChild(s('rect', { 'class': 'd-box', x: 50, y: 160, width: 280, height: 60, rx: 6 }));
		var tF1 = s('text', { 'class': 'd-title', x: 190, y: 186, 'text-anchor': 'middle' }); tF1.textContent = 'Your fork';
		var tF2 = s('text', { 'class': 'd-muted', x: 190, y: 206, 'text-anchor': 'middle' }); tF2.textContent = 'personal copy (GitHub)';
		gFork.appendChild(tF1); gFork.appendChild(tF2);
		svg.appendChild(gFork);

		var gLocal = s('g', { id: 'pr-local' });
		gLocal.appendChild(s('rect', { 'class': 'd-box', x: 30, y: 285, width: 320, height: 100, rx: 6 }));
		var tL1 = s('text', { 'class': 'd-title', x: 190, y: 310, 'text-anchor': 'middle' }); tL1.textContent = 'Your local clone';
		var tL2 = s('text', { 'class': 'd-muted', x: 190, y: 330, 'text-anchor': 'middle' }); tL2.textContent = 'local computer (Git workspace)';
		gLocal.appendChild(tL1); gLocal.appendChild(tL2);
		svg.appendChild(gLocal);

		var bBranch = s('g', { id: 'badge-branch' });
		bBranch.appendChild(s('rect', { 'class': 'd-box', x: 45, y: 345, width: 130, height: 26, rx: 3 }));
		var tB = s('text', { 'class': 'd-muted', x: 110, y: 362, 'text-anchor': 'middle' }); tB.textContent = 'edit branch';
		bBranch.appendChild(tB);
		svg.appendChild(bBranch);

		var bCommit = s('g', { id: 'badge-commit' });
		bCommit.appendChild(s('rect', { 'class': 'd-box', x: 205, y: 345, width: 130, height: 26, rx: 3 }));
		var tC = s('text', { 'class': 'd-muted', x: 270, y: 362, 'text-anchor': 'middle' }); tC.textContent = 'commits';
		bCommit.appendChild(tC);
		svg.appendChild(bCommit);

		var aFork = s('line', { 'class': 'd-line', x1: 120, y1: 97, x2: 120, y2: 158, 'marker-end': 'url(#arrow-pr)' });
		var lFork = s('text', { 'class': 'd-muted', x: 108, y: 132, 'text-anchor': 'end' }); lFork.textContent = 'fork';

		var aClone = s('line', { 'class': 'd-line', x1: 120, y1: 222, x2: 120, y2: 283, 'marker-end': 'url(#arrow-pr)' });
		var lClone = s('text', { 'class': 'd-muted', x: 108, y: 257, 'text-anchor': 'end' }); lClone.textContent = 'clone';

		var aBranch = s('line', { 'class': 'd-line', x1: 177, y1: 358, x2: 203, y2: 358, 'marker-end': 'url(#arrow-pr)' });

		var aPush = s('line', { 'class': 'd-line', x1: 260, y1: 283, x2: 260, y2: 222, 'marker-end': 'url(#arrow-pr)' });
		var lPush = s('text', { 'class': 'd-muted', x: 272, y: 257, 'text-anchor': 'start' }); lPush.textContent = 'push';

		var aPR = s('line', { 'class': 'd-line', x1: 260, y1: 158, x2: 260, y2: 97, 'marker-end': 'url(#arrow-pr)' });
		var lPR = s('text', { 'class': 'd-muted', x: 272, y: 132, 'text-anchor': 'start' }); lPR.textContent = 'pull request';

		var bReview = s('g', { id: 'badge-review' });
		bReview.appendChild(s('rect', { 'class': 'd-box', x: 80, y: 62, width: 100, height: 24, rx: 3 }));
		var tRev = s('text', { 'class': 'd-muted', x: 130, y: 78, 'text-anchor': 'middle' }); tRev.textContent = 'review';
		bReview.appendChild(tRev);

		var bMerge = s('g', { id: 'badge-merge' });
		bMerge.appendChild(s('rect', { 'class': 'd-box', x: 200, y: 62, width: 100, height: 24, rx: 3 }));
		var tMrg = s('text', { 'class': 'd-muted', x: 250, y: 78, 'text-anchor': 'middle' }); tMrg.textContent = 'merge';
		bMerge.appendChild(tMrg);

		[aFork, lFork, aClone, lClone, aBranch, aPush, lPush, aPR, lPR, bReview, bMerge].forEach(function (el) {
			svg.appendChild(el);
		});

		var STEPS = [
			{
				title: 'Upstream repository',
				note: 'The original project repository is called the upstream repository, where the official codebase lives.',
				box: gUpstream,
				arrow: null
			},
			{
				title: 'Your fork',
				note: 'A fork is a personal copy of the repository hosted on your GitHub account, letting you make changes without affecting the original project.',
				box: gFork,
				arrow: aFork
			},
			{
				title: 'Your local clone',
				note: 'Cloning copies the files from your remote GitHub fork to your local computer so that you can edit files and run tests.',
				box: gLocal,
				arrow: aClone
			},
			{
				title: 'An edit branch',
				note: 'Rather than modifying the main branch directly, you create a dedicated branch for your edits to keep changes isolated.',
				box: bBranch,
				arrow: aBranch
			},
			{
				title: 'Commit changes',
				note: 'Make your edits and commit them to your local edit branch.',
				box: bCommit,
				arrow: aBranch
			},
			{
				title: 'Push to your fork',
				note: 'Push the branch with your commits from your local computer to your fork on GitHub.',
				box: gFork,
				arrow: aPush
			},
			{
				title: 'Open a pull request',
				note: 'Open a pull request from your branch on your fork to the upstream repository to propose your changes.',
				box: gUpstream,
				arrow: aPR
			},
			{
				title: 'Review',
				note: 'Maintainers and community members review open pull requests to evaluate proposed changes and suggest improvements.',
				box: bReview,
				arrow: aPR
			},
			{
				title: 'Merge',
				note: 'Once approved, maintainers merge the pull request into the upstream repository.',
				box: bMerge,
				arrow: null
			}
		];

		var curStep = 0;
		var stepCounter = h('span', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		function highlight(el, active, isArrow) {
			if (!el) return;
			if (isArrow) {
				if (active) {
					el.setAttribute('class', 'd-strong');
					el.setAttribute('style', 'stroke: var(--wp-gold-text); stroke-width: 3;');
					el.setAttribute('marker-end', 'url(#arrow-pr-gold)');
				} else {
					el.setAttribute('class', 'd-line');
					el.removeAttribute('style');
					el.setAttribute('marker-end', 'url(#arrow-pr)');
				}
			} else {
				el.classList.toggle('d-active', active);
			}
		}

		var prevBtn = button('◀ Back', function () { if (curStep > 0) { curStep--; render(); } });
		var nextBtn = button('Next ▶', function () { if (curStep < STEPS.length - 1) { curStep++; render(); } });
		var resetBtn = button('Reset', function () { curStep = 0; render(); });

		function render() {
			var sInfo = STEPS[curStep];
			[gUpstream, gFork, gLocal, bBranch, bCommit, bReview, bMerge].forEach(function (b) { highlight(b, false, false); });
			[aFork, aClone, aBranch, aPush, aPR].forEach(function (a) { highlight(a, false, true); });

			highlight(sInfo.box, true, false);
			if (sInfo.arrow) highlight(sInfo.arrow, true, true);

			stepCounter.textContent = 'Step ' + (curStep + 1) + ' of ' + STEPS.length + ': ' + sInfo.title;
			readout.textContent = sInfo.note;

			prevBtn.disabled = curStep === 0;
			nextBtn.disabled = curStep === STEPS.length - 1;
		}

		var btnRow = h('div', { 'class': 'widget-buttons' }, [prevBtn, nextBtn, resetBtn, stepCounter]);

		root.replaceChildren(frame('fork and pull request workflow', [
			h('p', { 'class': 'widget-note', text: 'Step through the fork, clone, branch, push, and pull request workflow using the controls below.' }),
			btnRow,
			svg,
			readout
		]));
		render();
	}

	/* ---------- Modbus TCP request explorer from lesson 8.3 ---------- */

	function initModbus(root) {
		var CODES = [
			{ code: '0x03', name: 'Read Holding Registers', fn: 'read_holding_registers', kind: 'read' },
			{ code: '0x06', name: 'Write Single Register', fn: 'write_register', kind: 'write_single' },
			{ code: '0x10', name: 'Write Multiple Registers', fn: 'write_registers', kind: 'write_multi' }
		];

		var curCode = CODES[0];
		var addrSlider = slider('Start / Register address', 'modbus-addr', 128, 255, 1, 128, '');
		var qtySlider = slider('Quantity of registers', 'modbus-qty', 1, 8, 1, 3, '');
		var valInput = h('input', { type: 'number', id: 'modbus-val', min: '0', max: '65535', value: '1', style: 'width: 6em; font: inherit; padding: 2px 4px;' });
		var valRow = h('div', { 'class': 'widget-control' }, [
			h('label', { 'for': 'modbus-val', text: 'Value to write (16-bit)' }),
			valInput
		]);

		var svg = plotFrame(560, 70, 'Modbus request fields');
		var codePre = h('pre', { 'class': 'article-code' });
		var codeEl = h('code');
		codePre.appendChild(codeEl);
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var box1 = s('rect', { 'class': 'd-box', x: 10, y: 10, width: 170, height: 50, rx: 4 });
		var t1Title = s('text', { 'class': 'd-title', x: 95, y: 31, 'text-anchor': 'middle' });
		var t1Sub = s('text', { 'class': 'd-muted', x: 95, y: 49, 'text-anchor': 'middle' });

		var box2 = s('rect', { 'class': 'd-box', x: 195, y: 10, width: 160, height: 50, rx: 4 });
		var t2Title = s('text', { 'class': 'd-title', x: 275, y: 31, 'text-anchor': 'middle' });
		var t2Sub = s('text', { 'class': 'd-muted', x: 275, y: 49, 'text-anchor': 'middle' });

		var box3 = s('rect', { 'class': 'd-box', x: 370, y: 10, width: 180, height: 50, rx: 4 });
		var t3Title = s('text', { 'class': 'd-title', x: 460, y: 31, 'text-anchor': 'middle' });
		var t3Sub = s('text', { 'class': 'd-muted', x: 460, y: 49, 'text-anchor': 'middle' });

		[box1, t1Title, t1Sub, box2, t2Title, t2Sub, box3, t3Title, t3Sub].forEach(function (n) { svg.appendChild(n); });

		function update() {
			var addr = Number(addrSlider.input.value);
			var qty = Number(qtySlider.input.value);
			var val = Math.max(0, Math.min(65535, Number(valInput.value) || 0));
			addrSlider.out.textContent = addr;
			qtySlider.out.textContent = qty;

			qtySlider.row.style.display = (curCode.kind === 'read' || curCode.kind === 'write_multi') ? '' : 'none';
			valRow.style.display = (curCode.kind === 'write_single') ? '' : 'none';

			t1Title.textContent = 'Function code: ' + curCode.code;
			t1Sub.textContent = curCode.name;

			t2Title.textContent = (curCode.kind === 'write_single' ? 'Register: ' : 'Start address: ') + addr;
			t2Sub.textContent = 'General-purpose (0-based)';

			var multiVals = [250, 7, 12, 45, 99, 1, 0, 15].slice(0, qty);
			var valsStr = '[' + multiVals.join(', ') + ']';

			if (curCode.kind === 'read') {
				t3Title.textContent = 'Quantity: ' + qty + ' registers';
				t3Sub.textContent = 'Addresses ' + addr + ' to ' + (addr + qty - 1);
				codeEl.textContent = 'rr = client.' + curCode.fn + '(' + addr + ', count=' + qty + ')';
			} else if (curCode.kind === 'write_single') {
				t3Title.textContent = 'Register value: ' + val;
				t3Sub.textContent = '16-bit integer (0–65535)';
				codeEl.textContent = 'client.write_register(' + addr + ', ' + val + ')';
			} else {
				t3Title.textContent = 'Quantity: ' + qty + ' registers';
				t3Sub.textContent = 'Values: ' + valsStr;
				codeEl.textContent = 'client.write_registers(' + addr + ', ' + valsStr + ')';
			}

			var lastAddr = curCode.kind === 'write_single' ? addr : (addr + qty - 1);
			if (lastAddr > 255) {
				readout.textContent = 'Address ' + lastAddr + ' is outside the general-purpose range 128 to 255, so the server answers with exception code 2 (ILLEGAL DATA ADDRESS).';
			} else if (curCode.kind === 'read') {
				readout.textContent = 'Request: read ' + qty + ' register(s) starting at address ' + addr + ' (addresses ' + addr + ' to ' + lastAddr + ').';
			} else if (curCode.kind === 'write_single') {
				readout.textContent = 'Request: write value ' + val + ' into holding register ' + addr + '.';
			} else {
				readout.textContent = 'Request: write ' + qty + ' register(s) starting at address ' + addr + ' with values ' + valsStr + '.';
			}
		}

		var codeButtons = h('div', { 'class': 'widget-buttons', role: 'group', 'aria-label': 'Function code' });
		CODES.forEach(function (c) {
			var b = button(c.code + ' ' + c.name, function () {
				curCode = c;
				Array.prototype.forEach.call(codeButtons.children, function (btn) {
					btn.setAttribute('aria-pressed', String(btn === b));
				});
				if (c.kind === 'write_multi' && Number(qtySlider.input.value) < 2) {
					qtySlider.input.value = 2;
				}
				update();
			});
			b.setAttribute('aria-pressed', String(c === curCode));
			codeButtons.appendChild(b);
		});

		addrSlider.input.addEventListener('input', update);
		qtySlider.input.addEventListener('input', update);
		valInput.addEventListener('input', update);

		root.replaceChildren(frame('Modbus request explorer', [
			h('p', { 'class': 'widget-note', text: 'Select a function code from this lesson and set the address and quantity to inspect the request fields and matching pymodbus code from the lesson.' }),
			codeButtons,
			addrSlider.row,
			qtySlider.row,
			valRow,
			svg,
			codePre,
			readout
		]));
		update();
	}

	/* ---------- Trapezoidal and triangular velocity profiles from lesson 6.9 ---------- */

	function initTrapezoid(root) {
		var dSlider = slider('Distance (D)', 'trap-d', 0.01, 1.0, 0.01, 0.5, ' m');
		var vSlider = slider('Max velocity (v_max)', 'trap-vmax', 0.05, 0.5, 0.01, 0.25, ' m/s');
		var aSlider = slider('Max acceleration (a_max)', 'trap-amax', 0.1, 1.0, 0.05, 0.5, ' m/s²');

		var W = 380, H = 200;
		var left = 45, right = 355, top = 25, bottom = 160;
		var yVmax = top + 15;

		var svg = plotFrame(W, H, 'Velocity against time profile');

		svg.appendChild(s('line', { 'class': 'plot-axis', x1: left, y1: bottom, x2: right + 10, y2: bottom }));
		svg.appendChild(s('line', { 'class': 'plot-axis', x1: left, y1: top - 5, x2: left, y2: bottom }));

		var yAxisLabel = s('text', { 'class': 'plot-label', x: left - 6, y: top, 'text-anchor': 'end' });
		yAxisLabel.textContent = 'v (m/s)';
		var xAxisLabel = s('text', { 'class': 'plot-label', x: right + 10, y: bottom + 16, 'text-anchor': 'end' });
		xAxisLabel.textContent = 't (s)';
		svg.appendChild(yAxisLabel);
		svg.appendChild(xAxisLabel);

		var vMaxLine = s('line', { 'class': 'plot-ref', x1: left, y1: yVmax, x2: right, y2: yVmax });
		var vMaxText = s('text', { 'class': 'plot-label', x: right, y: yVmax - 5, 'text-anchor': 'end' });
		svg.appendChild(vMaxLine);
		svg.appendChild(vMaxText);

		var areaPoly = s('polygon', { 'class': 'plot-band' });
		svg.appendChild(areaPoly);

		var vLine = s('polyline', { 'class': 'plot-line', fill: 'none' });
		svg.appendChild(vLine);

		var t0Label = s('text', { 'class': 'plot-label', x: left, y: bottom + 14, 'text-anchor': 'middle' });
		t0Label.textContent = '0';
		var taLabel = s('text', { 'class': 'plot-label', y: bottom + 14, 'text-anchor': 'middle' });
		var tcLabel = s('text', { 'class': 'plot-label', y: bottom + 14, 'text-anchor': 'middle' });
		var tEndLabel = s('text', { 'class': 'plot-label', x: right, y: bottom + 14, 'text-anchor': 'middle' });
		[t0Label, taLabel, tcLabel, tEndLabel].forEach(function (el) { svg.appendChild(el); });

		var zeroVLabel = s('text', { 'class': 'plot-label', x: left - 6, y: bottom + 4, 'text-anchor': 'end' });
		zeroVLabel.textContent = '0';
		var peakVLabel = s('text', { 'class': 'plot-label', x: left - 6, 'text-anchor': 'end' });
		[zeroVLabel, peakVLabel].forEach(function (el) { svg.appendChild(el); });

		var taLine = s('line', { 'class': 'plot-axis', stroke: 'var(--wp-border)', 'stroke-dasharray': '2 3' });
		var tcLine = s('line', { 'class': 'plot-axis', stroke: 'var(--wp-border)', 'stroke-dasharray': '2 3' });
		svg.appendChild(taLine);
		svg.appendChild(tcLine);

		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		function draw() {
			var D = Number(dSlider.input.value);
			var v_max = Number(vSlider.input.value);
			var a_max = Number(aSlider.input.value);

			dSlider.out.textContent = D.toFixed(2) + ' m';
			vSlider.out.textContent = v_max.toFixed(2) + ' m/s';
			aSlider.out.textContent = a_max.toFixed(2) + ' m/s²';

			var isTrapezoid = D >= (v_max * v_max) / a_max;
			var t_a, t_c, T, v_peak, area;

			if (isTrapezoid) {
				t_a = v_max / a_max;
				v_peak = v_max;
				t_c = (D - (v_max * v_max) / a_max) / v_max;
				T = 2 * t_a + t_c;
				area = v_max * (t_a + t_c);
			} else {
				t_a = Math.sqrt(D / a_max);
				v_peak = Math.sqrt(D * a_max);
				t_c = 0;
				T = 2 * t_a;
				area = 0.5 * T * v_peak;
			}

			function yMap(v) {
				return bottom - (v / v_max) * (bottom - yVmax);
			}
			function xMap(t) {
				return left + (t / T) * (right - left);
			}

			var xTa = xMap(t_a);
			var xTc = xMap(t_a + t_c);
			var yPeak = yMap(v_peak);

			var curvePts = [];
			var bandPts = [];

			if (isTrapezoid) {
				curvePts = [
					[left, bottom],
					[xTa, yVmax],
					[xTc, yVmax],
					[right, bottom]
				];
				bandPts = [
					[left, bottom],
					[xTa, yVmax],
					[xTc, yVmax],
					[right, bottom]
				];
				taLine.style.display = '';
				tcLine.style.display = '';
				taLine.setAttribute('x1', xTa); taLine.setAttribute('y1', yVmax);
				taLine.setAttribute('x2', xTa); taLine.setAttribute('y2', bottom);
				tcLine.setAttribute('x1', xTc); tcLine.setAttribute('y1', yVmax);
				tcLine.setAttribute('x2', xTc); tcLine.setAttribute('y2', bottom);

				taLabel.style.display = '';
				tcLabel.style.display = '';
				taLabel.setAttribute('x', xTa);
				taLabel.textContent = t_a.toFixed(2) + 's';
				tcLabel.setAttribute('x', xTc);
				tcLabel.textContent = (t_a + t_c).toFixed(2) + 's';
			} else {
				curvePts = [
					[left, bottom],
					[xTa, yPeak],
					[right, bottom]
				];
				bandPts = [
					[left, bottom],
					[xTa, yPeak],
					[right, bottom]
				];
				taLine.style.display = '';
				tcLine.style.display = 'none';
				taLine.setAttribute('x1', xTa); taLine.setAttribute('y1', yPeak);
				taLine.setAttribute('x2', xTa); taLine.setAttribute('y2', bottom);

				taLabel.style.display = '';
				tcLabel.style.display = 'none';
				taLabel.setAttribute('x', xTa);
				taLabel.textContent = t_a.toFixed(2) + 's';
			}

			vLine.setAttribute('points', pts(curvePts));
			areaPoly.setAttribute('points', pts(bandPts));

			vMaxText.textContent = 'v_max = ' + v_max.toFixed(2) + ' m/s';
			tEndLabel.textContent = 'T=' + T.toFixed(2) + 's';

			if (!isTrapezoid) {
				peakVLabel.style.display = '';
				peakVLabel.setAttribute('y', yPeak + 4);
				peakVLabel.textContent = v_peak.toFixed(2);
			} else {
				peakVLabel.style.display = 'none';
			}

			var caseName = isTrapezoid ? 'trapezoidal' : 'triangular';
			readout.textContent = 'Profile: ' + caseName + ' · t_a = ' + t_a.toFixed(3) + ' s, t_c = ' + t_c.toFixed(3) +
				' s, T = ' + T.toFixed(3) + ' s · peak velocity = ' + v_peak.toFixed(3) +
				' m/s · area under curve = ' + area.toFixed(3) + ' m (D = ' + D.toFixed(3) + ' m).';
		}

		[dSlider, vSlider, aSlider].forEach(function (c) {
			c.input.addEventListener('input', draw);
		});

		var presetWorked = button('Worked example (0.5 m)', function () {
			dSlider.input.value = 0.5;
			vSlider.input.value = 0.25;
			aSlider.input.value = 0.5;
			draw();
		});
		var presetShort = button('Short move (0.05 m)', function () {
			dSlider.input.value = 0.05;
			vSlider.input.value = 0.25;
			aSlider.input.value = 0.5;
			draw();
		});

		var presets = h('div', { 'class': 'widget-buttons' }, [presetWorked, presetShort]);

		root.replaceChildren(frame('trapezoidal and triangular velocity profiles', [
			h('p', { 'class': 'widget-note', text: 'Adjust distance (D), speed limit (v_max), and acceleration (a_max). If D >= v_max² / a_max the profile reaches cruise speed (trapezoid); shorter moves must brake before reaching v_max (triangle).' }),
			dSlider.row,
			vSlider.row,
			aSlider.row,
			presets,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Network segmentation: zones, conduits, and the DMZ from lesson 8.6 ---------- */

	function initZones(root) {
		var W = 380, H = 455;
		var svg = plotFrame(W, H, 'Interactive network segmentation diagram showing zones, conduits and DMZ');
		svg.setAttribute('class', 'widget-plot lesson-diagram');

		var defs = s('defs', {});
		var mk1 = s('marker', { id: 'arrow-zone', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
		mk1.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', 'class': 'd-fill' }));
		var mk2 = s('marker', { id: 'arrow-zone-gold', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
		mk2.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--wp-gold-text)' }));
		defs.appendChild(mk1); defs.appendChild(mk2);
		svg.appendChild(defs);

		var ITEMS = {
			'zone-corp': {
				label: 'Enterprise (corporate) network',
				note: 'The enterprise corporate network is on the far side of the DMZ, which sits between it and the industrial control network.'
			},
			'zone-dmz': {
				label: 'DMZ (Demilitarized Zone)',
				note: 'A demilitarized zone is a physical and logical subnet that acts as an intermediary so connected devices avoid direct exposure to untrusted networks.'
			},
			'zone-cell': {
				label: 'Cell Security Zone',
				note: 'The Cell Security Zone contains Level 2 area control, Level 1 controller LANs, and Level 0 field basic input/output devices such as sensors and actuators. A robot cell, with its PLC, robot controller and I/O, is one such zone.'
			},
			'dev-office': {
				label: 'Office application',
				note: 'If an enterprise accounting application requires production data, it connects only to a database or reporting server located inside the DMZ. It never touches a robot controller or safety PLC directly.'
			},
			'dev-remote': {
				label: 'Remote user',
				note: 'Remote access into industrial control systems should be routed through hardened intermediary authentication jump boxes in the DMZ using multifactor authentication.'
			},
			'dev-db': {
				label: 'Database / reporting server',
				note: 'Placing corporate-accessible components in a DMZ ensures that no direct communication paths are required from the corporate network to the control network.'
			},
			'dev-jump': {
				label: 'Jump box',
				note: 'A jump box is a computer in the DMZ that a remote user must log in to before reaching the cell.'
			},
			'dev-l2': {
				label: 'Level 2 area control',
				note: 'Level 2 area control is one of the tiers inside the Cell Security Zone.'
			},
			'dev-l1': {
				label: 'Level 1 controller LANs',
				note: 'Level 1 controller LANs are one of the tiers inside the Cell Security Zone.'
			},
			'dev-l0': {
				label: 'Level 0 field basic I/O (Sensors and actuators)',
				note: 'Level 0 holds field basic input/output devices such as sensors and actuators.'
			},
			'cond-push': {
				label: 'Conduit: Push production records',
				note: 'Secure DMZ communication models require control zones to push data to the DMZ: the cell sends its production records to a server in the DMZ.'
			},
			'cond-pull': {
				label: 'Conduit: Pull data from DMZ',
				note: 'Enterprise users pull data from DMZ application servers: an office application reads the records from that server, so nothing in the office ever connects to the robot.'
			},
			'cond-remote': {
				label: 'Conduit: Authenticated remote access',
				note: 'Remote access into industrial control systems should be routed through hardened intermediary authentication jump boxes in the DMZ using multifactor authentication.'
			},
			'cond-direct': {
				label: 'Direct path (not needed)',
				note: 'Placing corporate-accessible components in a DMZ ensures that no direct communication paths are required from the corporate network to the control network. The office only talks to the DMZ.'
			}
		};

		var selected = null;
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var itemEls = {};
		var lineEls = {};

		function makeInteractive(g, id, label) {
			g.setAttribute('tabindex', '0');
			g.setAttribute('role', 'button');
			g.setAttribute('aria-label', label);
			g.style.cursor = 'pointer';
			g.addEventListener('click', function () { select(id); });
			g.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
					e.preventDefault();
					select(id);
				}
			});
			itemEls[id] = g;
			return g;
		}

		function select(id) {
			selected = (selected === id) ? null : id;
			update();
		}

		function update() {
			Object.keys(ITEMS).forEach(function (id) {
				var g = itemEls[id];
				var isSel = (selected === id);
				if (g) {
					g.classList.toggle('d-active', isSel);
					g.setAttribute('aria-pressed', isSel ? 'true' : 'false');
				}
			});

			['cond-push', 'cond-pull', 'cond-remote', 'cond-direct'].forEach(function (cid) {
				var lines = lineEls[cid] || [];
				var isSel = (selected === cid);
				lines.forEach(function (ln) {
					if (cid === 'cond-direct') {
						if (isSel) {
							ln.setAttribute('class', 'd-strong');
							ln.setAttribute('style', 'stroke: #d33; stroke-width: 2.5; stroke-dasharray: 4 4;');
						} else {
							ln.setAttribute('class', 'd-line');
							ln.setAttribute('style', 'stroke: var(--wp-text-muted); stroke-dasharray: 4 4;');
						}
					} else {
						if (isSel) {
							ln.setAttribute('class', 'd-strong');
							ln.setAttribute('style', 'stroke: var(--wp-gold-text); stroke-width: 2.5;');
							ln.setAttribute('marker-end', 'url(#arrow-zone-gold)');
						} else {
							ln.setAttribute('class', 'd-line');
							ln.removeAttribute('style');
							ln.setAttribute('marker-end', 'url(#arrow-zone)');
						}
					}
				});
			});

			if (!selected) {
				readout.textContent = 'Click or select any zone, conduit, or device to inspect its role.';
			} else {
				readout.textContent = ITEMS[selected].note;
			}
		}

		// --- Layer 1: Zones ---
		var gCorp = s('g', {});
		var rCorp = s('rect', { 'class': 'd-box', x: 10, y: 8, width: 360, height: 66, rx: 6, fill: 'var(--wp-bg)' });
		var tCorp = s('text', { 'class': 'd-title', x: 20, y: 24, 'font-size': '12' });
		tCorp.textContent = 'Enterprise (Corporate) Network';
		gCorp.appendChild(rCorp);
		gCorp.appendChild(tCorp);
		makeInteractive(gCorp, 'zone-corp', ITEMS['zone-corp'].label);
		svg.appendChild(gCorp);

		var gDmz = s('g', {});
		var rDmz = s('rect', { 'class': 'd-box', x: 10, y: 122, width: 285, height: 74, rx: 6, fill: 'var(--wp-bg)' });
		var tDmz = s('text', { 'class': 'd-title', x: 20, y: 138, 'font-size': '12' });
		tDmz.textContent = 'DMZ (Demilitarized Zone)';
		gDmz.appendChild(rDmz);
		gDmz.appendChild(tDmz);
		makeInteractive(gDmz, 'zone-dmz', ITEMS['zone-dmz'].label);
		svg.appendChild(gDmz);

		var gCell = s('g', {});
		var rCell = s('rect', { 'class': 'd-box', x: 10, y: 246, width: 360, height: 196, rx: 6, fill: 'var(--wp-bg)' });
		var tCell = s('text', { 'class': 'd-title', x: 20, y: 262, 'font-size': '12' });
		tCell.textContent = 'Cell Security Zone';
		gCell.appendChild(rCell);
		gCell.appendChild(tCell);
		makeInteractive(gCell, 'zone-cell', ITEMS['zone-cell'].label);
		svg.appendChild(gCell);

		// --- Layer 2: Conduits ---
		var gCondDirect = s('g', {});
		var lineDirect = s('line', { 'class': 'd-line', x1: 335, y1: 74, x2: 335, y2: 246, 'stroke-dasharray': '4 4' });
		var hitDirect = s('line', { x1: 335, y1: 74, x2: 335, y2: 246, stroke: 'transparent', 'stroke-width': '16' });
		var badgeDirectRect = s('rect', { 'class': 'd-box', x: 298, y: 148, width: 74, height: 24, rx: 3 });
		var badgeDirectText = s('text', { 'class': 'd-muted', x: 335, y: 164, 'text-anchor': 'middle', 'font-size': '10', 'font-weight': 'bold', fill: '#d33' });
		badgeDirectText.textContent = '✕ no direct path';
		gCondDirect.appendChild(lineDirect);
		gCondDirect.appendChild(hitDirect);
		gCondDirect.appendChild(badgeDirectRect);
		gCondDirect.appendChild(badgeDirectText);
		makeInteractive(gCondDirect, 'cond-direct', ITEMS['cond-direct'].label);
		svg.appendChild(gCondDirect);
		lineEls['cond-direct'] = [lineDirect];

		var gCondPull = s('g', {});
		var linePull = s('line', { 'class': 'd-line', x1: 88, y1: 148, x2: 88, y2: 73, 'marker-end': 'url(#arrow-zone)' });
		var hitPull = s('line', { x1: 88, y1: 148, x2: 88, y2: 73, stroke: 'transparent', 'stroke-width': '16' });
		var badgePullRect = s('rect', { 'class': 'd-box', x: 64, y: 94, width: 48, height: 20, rx: 3 });
		var badgePullText = s('text', { 'class': 'd-muted', x: 88, y: 108, 'text-anchor': 'middle', 'font-size': '10.5' });
		badgePullText.textContent = 'pull';
		gCondPull.appendChild(linePull);
		gCondPull.appendChild(hitPull);
		gCondPull.appendChild(badgePullRect);
		gCondPull.appendChild(badgePullText);
		makeInteractive(gCondPull, 'cond-pull', ITEMS['cond-pull'].label);
		svg.appendChild(gCondPull);
		lineEls['cond-pull'] = [linePull];

		var gCondPush = s('g', {});
		var linePush = s('line', { 'class': 'd-line', x1: 88, y1: 272, x2: 88, y2: 194, 'marker-end': 'url(#arrow-zone)' });
		var hitPush = s('line', { x1: 88, y1: 272, x2: 88, y2: 194, stroke: 'transparent', 'stroke-width': '16' });
		var badgePushRect = s('rect', { 'class': 'd-box', x: 64, y: 215, width: 48, height: 20, rx: 3 });
		var badgePushText = s('text', { 'class': 'd-muted', x: 88, y: 229, 'text-anchor': 'middle', 'font-size': '10.5' });
		badgePushText.textContent = 'push';
		gCondPush.appendChild(linePush);
		gCondPush.appendChild(hitPush);
		gCondPush.appendChild(badgePushRect);
		gCondPush.appendChild(badgePushText);
		makeInteractive(gCondPush, 'cond-push', ITEMS['cond-push'].label);
		svg.appendChild(gCondPush);
		lineEls['cond-push'] = [linePush];

		var gCondRemote = s('g', {});
		var lineRemote1 = s('line', { 'class': 'd-line', x1: 224, y1: 66, x2: 224, y2: 142, 'marker-end': 'url(#arrow-zone)' });
		var hitRemote1 = s('line', { x1: 224, y1: 66, x2: 224, y2: 142, stroke: 'transparent', 'stroke-width': '16' });
		var lineRemote2 = s('line', { 'class': 'd-line', x1: 224, y1: 188, x2: 224, y2: 266, 'marker-end': 'url(#arrow-zone)' });
		var hitRemote2 = s('line', { x1: 224, y1: 188, x2: 224, y2: 266, stroke: 'transparent', 'stroke-width': '16' });
		var badgeRemote1Rect = s('rect', { 'class': 'd-box', x: 195, y: 94, width: 58, height: 20, rx: 3 });
		var badgeRemote1Text = s('text', { 'class': 'd-muted', x: 224, y: 108, 'text-anchor': 'middle', 'font-size': '10' });
		badgeRemote1Text.textContent = 'MFA login';
		var badgeRemote2Rect = s('rect', { 'class': 'd-box', x: 180, y: 215, width: 88, height: 20, rx: 3 });
		var badgeRemote2Text = s('text', { 'class': 'd-muted', x: 224, y: 229, 'text-anchor': 'middle', 'font-size': '10' });
		badgeRemote2Text.textContent = 'remote access';
		gCondRemote.appendChild(lineRemote1);
		gCondRemote.appendChild(hitRemote1);
		gCondRemote.appendChild(lineRemote2);
		gCondRemote.appendChild(hitRemote2);
		gCondRemote.appendChild(badgeRemote1Rect);
		gCondRemote.appendChild(badgeRemote1Text);
		gCondRemote.appendChild(badgeRemote2Rect);
		gCondRemote.appendChild(badgeRemote2Text);
		makeInteractive(gCondRemote, 'cond-remote', ITEMS['cond-remote'].label);
		svg.appendChild(gCondRemote);
		lineEls['cond-remote'] = [lineRemote1, lineRemote2];

		// --- Layer 3: Devices ---
		var gOffice = s('g', {});
		var rOffice = s('rect', { 'class': 'd-box', x: 18, y: 32, width: 140, height: 34, rx: 4 });
		var tOffice = s('text', { 'class': 'd-title', x: 88, y: 53, 'text-anchor': 'middle', 'font-size': '11.5' });
		tOffice.textContent = 'Office application';
		gOffice.appendChild(rOffice); gOffice.appendChild(tOffice);
		makeInteractive(gOffice, 'dev-office', ITEMS['dev-office'].label);
		svg.appendChild(gOffice);

		var gRemote = s('g', {});
		var rRemote = s('rect', { 'class': 'd-box', x: 168, y: 32, width: 112, height: 34, rx: 4 });
		var tRemote = s('text', { 'class': 'd-title', x: 224, y: 53, 'text-anchor': 'middle', 'font-size': '11.5' });
		tRemote.textContent = 'Remote user';
		gRemote.appendChild(rRemote); gRemote.appendChild(tRemote);
		makeInteractive(gRemote, 'dev-remote', ITEMS['dev-remote'].label);
		svg.appendChild(gRemote);

		var gDb = s('g', {});
		var rDb = s('rect', { 'class': 'd-box', x: 18, y: 148, width: 140, height: 40, rx: 4 });
		var tDb1 = s('text', { 'class': 'd-title', x: 88, y: 164, 'text-anchor': 'middle', 'font-size': '11' });
		tDb1.textContent = 'DB / reporting server';
		var tDb2 = s('text', { 'class': 'd-muted', x: 88, y: 179, 'text-anchor': 'middle', 'font-size': '10' });
		tDb2.textContent = 'production records';
		gDb.appendChild(rDb); gDb.appendChild(tDb1); gDb.appendChild(tDb2);
		makeInteractive(gDb, 'dev-db', ITEMS['dev-db'].label);
		svg.appendChild(gDb);

		var gJump = s('g', {});
		var rJump = s('rect', { 'class': 'd-box', x: 168, y: 148, width: 112, height: 40, rx: 4 });
		var tJump1 = s('text', { 'class': 'd-title', x: 224, y: 164, 'text-anchor': 'middle', 'font-size': '11' });
		tJump1.textContent = 'Jump box';
		var tJump2 = s('text', { 'class': 'd-muted', x: 224, y: 179, 'text-anchor': 'middle', 'font-size': '10' });
		tJump2.textContent = 'MFA authentication';
		gJump.appendChild(rJump); gJump.appendChild(tJump1); gJump.appendChild(tJump2);
		makeInteractive(gJump, 'dev-jump', ITEMS['dev-jump'].label);
		svg.appendChild(gJump);

		var gL2 = s('g', {});
		var rL2 = s('rect', { 'class': 'd-box', x: 18, y: 272, width: 344, height: 46, rx: 4 });
		var tL2a = s('text', { 'class': 'd-title', x: 30, y: 291, 'font-size': '12' });
		tL2a.textContent = 'Level 2: Area control';
		var tL2b = s('text', { 'class': 'd-muted', x: 30, y: 308, 'font-size': '10.5' });
		tL2b.textContent = '';
		gL2.appendChild(rL2); gL2.appendChild(tL2a); gL2.appendChild(tL2b);
		makeInteractive(gL2, 'dev-l2', ITEMS['dev-l2'].label);
		svg.appendChild(gL2);

		var gL1 = s('g', {});
		var rL1 = s('rect', { 'class': 'd-box', x: 18, y: 328, width: 344, height: 46, rx: 4 });
		var tL1a = s('text', { 'class': 'd-title', x: 30, y: 347, 'font-size': '12' });
		tL1a.textContent = 'Level 1: Controller LANs';
		var tL1b = s('text', { 'class': 'd-muted', x: 30, y: 364, 'font-size': '10.5' });
		tL1b.textContent = '';
		gL1.appendChild(rL1); gL1.appendChild(tL1a); gL1.appendChild(tL1b);
		makeInteractive(gL1, 'dev-l1', ITEMS['dev-l1'].label);
		svg.appendChild(gL1);

		var gL0 = s('g', {});
		var rL0 = s('rect', { 'class': 'd-box', x: 18, y: 384, width: 344, height: 46, rx: 4 });
		var tL0a = s('text', { 'class': 'd-title', x: 30, y: 403, 'font-size': '12' });
		tL0a.textContent = 'Level 0: Field basic I/O';
		var tL0b = s('text', { 'class': 'd-muted', x: 30, y: 420, 'font-size': '10.5' });
		tL0b.textContent = 'Sensors and actuators';
		gL0.appendChild(rL0); gL0.appendChild(tL0a); gL0.appendChild(tL0b);
		makeInteractive(gL0, 'dev-l0', ITEMS['dev-l0'].label);
		svg.appendChild(gL0);

		var clearBtn = button('Clear selection', function () {
			selected = null;
			update();
		});

		var wrap = h('figure', { 'class': 'lesson-diagram', style: 'margin: 8px 0; padding: 0; border: 0;' }, [svg]);

		root.replaceChildren(frame('network segmentation: zones, conduits, and the DMZ', [
			h('p', { 'class': 'widget-note', text: 'A robot cell, with its PLC, robot controller and I/O, is one Cell Security Zone. Click or focus (Enter or Space) any zone, conduit or device to read what the lesson says about it.' }),
			wrap,
			h('div', { 'class': 'widget-buttons' }, [clearBtn]),
			readout
		]));

		update();
	}

	/* ---------- QoS compatibility calculator from lesson 4.2 ---------- */

	function initQos(root) {
		var pubRel = 'Reliable';
		var pubDur = 'Volatile';
		var subRel = 'Reliable';
		var subDur = 'Volatile';

		var W = 380, H = 120;
		var svg = plotFrame(W, H, 'ROS 2 QoS compatibility diagram between publisher and subscription');
		svg.setAttribute('class', 'widget-plot lesson-diagram');

		var defs = s('defs', {});
		var mk = s('marker', { id: 'arrow-qos', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
		mk.appendChild(s('path', { d: 'M0,0 L10,5 L0,10 z', 'class': 'd-fill' }));
		defs.appendChild(mk);
		svg.appendChild(defs);

		// Publisher box (left)
		var gPub = s('g', {});
		var rPub = s('rect', { 'class': 'd-box', x: 10, y: 15, width: 140, height: 90, rx: 6 });
		var tPubTitle = s('text', { 'class': 'd-title', x: 80, y: 36, 'text-anchor': 'middle' });
		tPubTitle.textContent = 'Publisher';
		var tPubSub = s('text', { 'class': 'd-muted', x: 80, y: 52, 'text-anchor': 'middle' });
		tPubSub.textContent = 'offers QoS';
		var tPubRel = s('text', { 'class': 'd-muted', x: 80, y: 72, 'text-anchor': 'middle' });
		var tPubDur = s('text', { 'class': 'd-muted', x: 80, y: 88, 'text-anchor': 'middle' });
		[rPub, tPubTitle, tPubSub, tPubRel, tPubDur].forEach(function (el) { gPub.appendChild(el); });
		svg.appendChild(gPub);

		// Subscription box (right)
		var gSub = s('g', {});
		var rSub = s('rect', { 'class': 'd-box', x: 230, y: 15, width: 140, height: 90, rx: 6 });
		var tSubTitle = s('text', { 'class': 'd-title', x: 300, y: 36, 'text-anchor': 'middle' });
		tSubTitle.textContent = 'Subscription';
		var tSubSub = s('text', { 'class': 'd-muted', x: 300, y: 52, 'text-anchor': 'middle' });
		tSubSub.textContent = 'requests QoS';
		var tSubRel = s('text', { 'class': 'd-muted', x: 300, y: 72, 'text-anchor': 'middle' });
		var tSubDur = s('text', { 'class': 'd-muted', x: 300, y: 88, 'text-anchor': 'middle' });
		[rSub, tSubTitle, tSubSub, tSubRel, tSubDur].forEach(function (el) { gSub.appendChild(el); });
		svg.appendChild(gSub);

		// Connection link (center)
		var connLine = s('line', { x1: 152, y1: 65, x2: 226, y2: 65 });
		var connCross1 = s('line', { x1: 184, y1: 58, x2: 196, y2: 72, stroke: '#d33', 'stroke-width': '2.5' });
		var connCross2 = s('line', { x1: 184, y1: 72, x2: 196, y2: 58, stroke: '#d33', 'stroke-width': '2.5' });
		var connLabel = s('text', { 'class': 'd-title', x: 190, y: 46, 'text-anchor': 'middle', 'font-size': '12' });
		var connSub = s('text', { 'class': 'd-muted', x: 190, y: 86, 'text-anchor': 'middle', 'font-size': '10' });
		[connLine, connCross1, connCross2, connLabel, connSub].forEach(function (el) { svg.appendChild(el); });

		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		// Toggle buttons
		var btnPubRelReliable = button('Reliable', function () { pubRel = 'Reliable'; update(); });
		var btnPubRelBestEffort = button('Best Effort', function () { pubRel = 'Best Effort'; update(); });

		var btnPubDurTL = button('Transient Local', function () { pubDur = 'Transient Local'; update(); });
		var btnPubDurVol = button('Volatile', function () { pubDur = 'Volatile'; update(); });

		var btnSubRelReliable = button('Reliable', function () { subRel = 'Reliable'; update(); });
		var btnSubRelBestEffort = button('Best Effort', function () { subRel = 'Best Effort'; update(); });

		var btnSubDurTL = button('Transient Local', function () { subDur = 'Transient Local'; update(); });
		var btnSubDurVol = button('Volatile', function () { subDur = 'Volatile'; update(); });

		function makeRow(label, btn1, btn2) {
			return h('div', { 'class': 'widget-buttons', role: 'group', 'aria-label': label }, [
				h('span', { style: 'display: inline-block; min-width: 170px; font-size: 13px; font-weight: 600; line-height: 28px;', text: label + ': ' }),
				btn1, btn2
			]);
		}

		var rowPubRel = makeRow('Offered Reliability', btnPubRelReliable, btnPubRelBestEffort);
		var rowPubDur = makeRow('Offered Durability', btnPubDurTL, btnPubDurVol);
		var rowSubRel = makeRow('Requested Reliability', btnSubRelReliable, btnSubRelBestEffort);
		var rowSubDur = makeRow('Requested Durability', btnSubDurTL, btnSubDurVol);

		var resetBtn = button('Reset to defaults', function () {
			pubRel = 'Reliable';
			pubDur = 'Volatile';
			subRel = 'Reliable';
			subDur = 'Volatile';
			update();
		});

		function update() {
			btnPubRelReliable.setAttribute('aria-pressed', String(pubRel === 'Reliable'));
			btnPubRelBestEffort.setAttribute('aria-pressed', String(pubRel === 'Best Effort'));
			btnPubDurTL.setAttribute('aria-pressed', String(pubDur === 'Transient Local'));
			btnPubDurVol.setAttribute('aria-pressed', String(pubDur === 'Volatile'));

			btnSubRelReliable.setAttribute('aria-pressed', String(subRel === 'Reliable'));
			btnSubRelBestEffort.setAttribute('aria-pressed', String(subRel === 'Best Effort'));
			btnSubDurTL.setAttribute('aria-pressed', String(subDur === 'Transient Local'));
			btnSubDurVol.setAttribute('aria-pressed', String(subDur === 'Volatile'));

			var relCompat = !(pubRel === 'Best Effort' && subRel === 'Reliable');
			var durCompat = !(pubDur === 'Volatile' && subDur === 'Transient Local');
			var isConnected = relCompat && durCompat;

			tPubRel.textContent = 'Rel: ' + pubRel;
			tPubDur.textContent = 'Dur: ' + pubDur;
			tSubRel.textContent = 'Rel: ' + subRel;
			tSubDur.textContent = 'Dur: ' + subDur;

			if (isConnected) {
				connLine.setAttribute('class', 'd-strong');
				connLine.setAttribute('marker-end', 'url(#arrow-qos)');
				connLine.removeAttribute('stroke-dasharray');
				connCross1.setAttribute('display', 'none');
				connCross2.setAttribute('display', 'none');
				connLabel.textContent = 'Connected';
				connLabel.setAttribute('class', 'd-title');
				connLabel.removeAttribute('fill');
				connSub.textContent = '';
			} else {
				connLine.setAttribute('class', 'd-line');
				connLine.removeAttribute('marker-end');
				connLine.setAttribute('stroke-dasharray', '4 3');
				connCross1.removeAttribute('display');
				connCross2.removeAttribute('display');
				connLabel.textContent = 'No connection';
				connLabel.setAttribute('fill', '#d33');
				connSub.textContent = '(incompatible)';
			}

			if (isConnected) {
				var explanation = '';
				if (pubRel === 'Reliable' && subRel === 'Reliable') {
					explanation = 'Both endpoints agree on delivery acknowledgments.';
				} else if (pubRel === 'Reliable' && subRel === 'Best Effort') {
					explanation = 'Publisher offers higher quality than requested; subscriber receives data.';
				} else if (pubRel === 'Best Effort' && subRel === 'Best Effort') {
					explanation = 'Both endpoints accept that some samples may be lost.';
				}
				readout.textContent = 'Connected. ' + explanation;
			} else if (!relCompat && !durCompat) {
				readout.textContent = 'No connection (incompatible QoS): Reliability and Durability incompatible. Reliability: Subscriber demands delivery guarantees that the publisher cannot provide. No connection is made. Durability: Subscriber asks for old (latched) samples, but the publisher keeps none. No communication.';
			} else if (!relCompat) {
				readout.textContent = 'No connection (incompatible QoS): Reliability incompatible. Subscriber demands delivery guarantees that the publisher cannot provide. No connection is made.';
			} else {
				readout.textContent = 'No connection (incompatible QoS): Durability incompatible. Subscriber asks for old (latched) samples, but the publisher keeps none. No communication.';
			}
		}

		var wrap = h('figure', { 'class': 'lesson-diagram', style: 'margin: 8px 0; padding: 0; border: 0;' }, [svg]);

		root.replaceChildren(frame('QoS compatibility rule (Offered vs Requested)', [
			h('p', { 'class': 'widget-note', text: 'Choose the publisher offered policies and subscriber requested policies to check compatibility. Offered quality must meet or exceed requested quality (Offered QoS \u2265 Requested QoS).' }),
			h('p', { 'class': 'widget-note', style: 'font-weight: 700; margin: 8px 0 2px;', text: 'Publisher (Offered QoS):' }),
			rowPubRel,
			rowPubDur,
			h('p', { 'class': 'widget-note', style: 'font-weight: 700; margin: 12px 0 2px;', text: 'Subscription (Requested QoS):' }),
			rowSubRel,
			rowSubDur,
			wrap,
			h('div', { 'class': 'widget-buttons' }, [resetBtn]),
			readout
		]));

		update();
	}

	/* ---------- Pretend Dashboard Server console from lesson 9.6 ---------- */

	function initDashboard(root) {
		var CMDS = [
			{ cmd: 'robotmode', reply: 'Robotmode: followed by the state, which can be NO_CONTROLLER, DISCONNECTED, CONFIRM_SAFETY, BOOTING, POWER_OFF, POWER_ON, IDLE, BACKDRIVE, or RUNNING.' },
			{ cmd: 'safetystatus', reply: 'Safetystatus: followed by the safety state, which can be NORMAL, REDUCED, PROTECTIVE_STOP, RECOVERY, SAFEGUARD_STOP, SYSTEM_EMERGENCY_STOP, ROBOT_EMERGENCY_STOP, VIOLATION, or FAULT.' },
			{ cmd: 'programState', reply: 'STOPPED if no program is running, PLAYING if a program is running, or PAUSED if paused.' },
			{ cmd: 'running', reply: 'Program running: true or Program running: false' },
			{ cmd: 'power on', reply: null },
			{ cmd: 'brake release', reply: 'Brake releasing' }
		];
		var powered = false;
		var cur = null;

		var codeEl = h('code', { text: 'Choose a command.' });
		var codePre = h('pre', { 'class': 'article-code' }, [codeEl]);
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite', text: 'Choose a command to see the reply listed in this lesson.' });

		function show(c) {
			cur = c;
			codeEl.textContent = c.cmd + '\\n';
			if (c.cmd === 'power on') {
				powered = true;
				readout.textContent = 'The lesson does not list a reply for power on. It says this command must be sent before brake release to avoid an error message.';
			} else if (c.cmd === 'brake release' && !powered) {
				readout.textContent = 'The lesson says power on must be sent before brake release to avoid an error message, but it does not give the error text. Send power on first.';
			} else {
				readout.textContent = 'Reply: ' + c.reply;
			}
		}

		var group = h('div', { 'class': 'widget-buttons', role: 'group', 'aria-label': 'Dashboard Server command' });
		CMDS.forEach(function (c) {
			var b = button(c.cmd, function () {
				Array.prototype.forEach.call(group.children, function (btn) {
					btn.setAttribute('aria-pressed', String(btn === b));
				});
				show(c);
			});
			b.setAttribute('aria-pressed', 'false');
			group.appendChild(b);
		});

		root.replaceChildren(frame('Dashboard Server console', [
			h('p', { 'class': 'widget-note', text: 'Pretend server showing the replies listed in this lesson. Each command is sent ending with a newline character, written \\n in Python.' }),
			group,
			codePre,
			readout
		]));
	}

	/* ---------- AGV vs AMR (lesson 1.3) ---------- */

	function initAgvVsAmr(root) {
		var hasObstacle = false;
		var running = false;
		var progress = 0;
		var animId = null;

		var W = 380, H = 190;
		var svg = plotFrame(W, H, 'Comparison of AGV fixed-path navigation and AMR dynamic rerouting');

		var midLine = s('line', { 'class': 'd-line', x1: 20, y1: 95, x2: 360, y2: 95, 'stroke-dasharray': '2 2' });
		svg.appendChild(midLine);

		var tAgvTitle = s('text', { 'class': 'd-title', x: 24, y: 30 });
		tAgvTitle.textContent = 'AGV (Fixed guide path)';
		var agvTrack = s('line', { 'class': 'd-line', x1: 30, y1: 60, x2: 350, y2: 60, 'stroke-dasharray': '5 4' });
		var agvTrackLabel = s('text', { 'class': 'd-muted', x: 30, y: 78 });
		agvTrackLabel.textContent = 'floor marker / guide path';
		svg.appendChild(tAgvTitle);
		svg.appendChild(agvTrack);
		svg.appendChild(agvTrackLabel);

		var tAmrTitle = s('text', { 'class': 'd-title', x: 24, y: 120 });
		tAmrTitle.textContent = 'AMR (Maps surroundings & plans route)';
		var amrPath = s('path', { 'class': 'd-line', fill: 'none', 'stroke-dasharray': '3 3' });
		var amrFloorLabel = s('text', { 'class': 'd-muted', x: 30, y: 178 });
		amrFloorLabel.textContent = 'no physical markers required';
		svg.appendChild(tAmrTitle);
		svg.appendChild(amrPath);
		svg.appendChild(amrFloorLabel);

		var agvObs = s('rect', { 'class': 'd-box', x: 180, y: 51, width: 18, height: 18, rx: 2 });
		var amrObs = s('rect', { 'class': 'd-box', x: 180, y: 141, width: 18, height: 18, rx: 2 });
		var agvObsText = s('text', { 'class': 'd-muted', x: 189, y: 46, 'text-anchor': 'middle' });
		agvObsText.textContent = 'Obstacle';
		var amrObsText = s('text', { 'class': 'd-muted', x: 189, y: 136, 'text-anchor': 'middle' });
		amrObsText.textContent = 'Obstacle';
		[agvObs, amrObs, agvObsText, amrObsText].forEach(function (el) { svg.appendChild(el); });

		var gAgv = s('g', {});
		var rAgv = s('rect', { 'class': 'd-box-gold', x: -16, y: -10, width: 32, height: 20, rx: 3 });
		var tAgvV = s('text', { 'class': 'd-muted', x: 0, y: 4, 'text-anchor': 'middle', 'font-size': '10px' });
		tAgvV.textContent = 'AGV';
		gAgv.appendChild(rAgv);
		gAgv.appendChild(tAgvV);
		svg.appendChild(gAgv);

		var gAmr = s('g', {});
		var rAmr = s('rect', { 'class': 'd-box', x: -16, y: -10, width: 32, height: 20, rx: 3 });
		var cAmr = s('circle', { 'class': 'd-fill', cx: 0, cy: 0, r: 4 });
		var tAmrV = s('text', { 'class': 'd-muted', x: 0, y: -12, 'text-anchor': 'middle', 'font-size': '10px' });
		tAmrV.textContent = 'AMR';
		gAmr.appendChild(rAmr);
		gAmr.appendChild(cAmr);
		gAmr.appendChild(tAmrV);
		svg.appendChild(gAmr);

		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		function updatePositions() {
			agvObs.style.display = hasObstacle ? '' : 'none';
			amrObs.style.display = hasObstacle ? '' : 'none';
			agvObsText.style.display = hasObstacle ? '' : 'none';
			amrObsText.style.display = hasObstacle ? '' : 'none';

			var startX = 50, endX = 330;
			var x = startX + progress * (endX - startX);

			var agvX = x;
			var agvStopped = false;
			if (hasObstacle && agvX >= 155) {
				agvX = 155;
				agvStopped = true;
			}
			gAgv.setAttribute('transform', 'translate(' + agvX + ', 60)');

			var amrX = x;
			var amrY = 150;
			if (hasObstacle) {
				if (amrX > 115 && amrX < 265) {
					var frac = (amrX - 115) / (265 - 115);
					amrY = 150 - Math.sin(frac * Math.PI) * 26;
				}
				amrPath.setAttribute('d', 'M50,150 L115,150 Q190,118 265,150 L330,150');
			} else {
				amrPath.setAttribute('d', 'M50,150 L330,150');
			}
			gAmr.setAttribute('transform', 'translate(' + amrX + ', ' + amrY + ')');

			if (hasObstacle) {
				if (agvStopped) {
					readout.textContent = 'When an obstacle blocks the path: the AGV stops and waits at the floor marker; the AMR detects the blockage, plans a route around it, and continues to its destination.';
				} else {
					readout.textContent = 'Encountering obstacle: AGV proceeds along floor marker toward obstacle; AMR computes alternate route around it.';
				}
			} else {
				readout.textContent = 'Path clear: AGV follows predefined floor guide path; AMR follows its planned trajectory.';
			}
		}

		function step() {
			if (!running) return;
			progress += 0.008;
			if (progress > 1) {
				progress = 1;
				running = false;
				btnRun.setAttribute('aria-pressed', 'false');
				btnRun.textContent = 'Reset';
			}
			updatePositions();
			if (running && !reduceMotion) {
				animId = requestAnimationFrame(step);
			}
		}

		var btnObstacle = button('Place obstacle', function () {
			hasObstacle = !hasObstacle;
			btnObstacle.textContent = hasObstacle ? 'Clear obstacle' : 'Place obstacle';
			btnObstacle.setAttribute('aria-pressed', String(hasObstacle));
			updatePositions();
		});
		btnObstacle.setAttribute('aria-pressed', 'false');

		var btnRun = button('Run', function () {
			if (reduceMotion) {
				progress = (progress >= 1) ? 0 : 1;
				updatePositions();
				return;
			}
			if (progress >= 1) {
				progress = 0;
			}
			running = !running;
			btnRun.setAttribute('aria-pressed', String(running));
			btnRun.textContent = running ? 'Pause' : 'Run';
			if (running) step();
		});

		var btnReset = button('Reset', function () {
			running = false;
			if (animId) cancelAnimationFrame(animId);
			progress = 0;
			btnRun.setAttribute('aria-pressed', 'false');
			btnRun.textContent = 'Run';
			updatePositions();
		});

		var controls = h('div', { 'class': 'widget-buttons' }, [btnObstacle, btnRun, btnReset]);

		root.replaceChildren(frame('AGV vs AMR: responding to an obstacle', [
			h('p', { 'class': 'widget-note', text: 'When something blocks its way, an AGV stops and waits on its fixed marker, while an AMR plans a route around it.' }),
			controls,
			svg,
			readout
		]));

		updatePositions();
	}

	/* ---------- Cycle time with two-station positioner (lesson 1.7) ---------- */

	function initCycleTimePositioner(root) {
		var sWeld = slider('Welding process time', 'ct-weld', 10, 180, 5, 90, ' s');
		var sLoad = slider('Operator unload/load time', 'ct-load', 10, 180, 5, 60, ' s');
		var sIndex = slider('Positioner index time', 'ct-index', 0, 10, 0.5, 2, ' s');

		var W = 380, H = 150;
		var svg = plotFrame(W, H, 'Cycle time comparison between single station and two-station positioner');

		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnWorked = button('Worked example (90s / 60s / 2s)', function () {
			sWeld.input.value = 90;
			sLoad.input.value = 60;
			sIndex.input.value = 2;
			draw();
		});
		var btnOpBottleneck = button('Operator bottleneck (45s weld / 90s load)', function () {
			sWeld.input.value = 45;
			sLoad.input.value = 90;
			sIndex.input.value = 2;
			draw();
		});
		var btnEqual = button('Equal times (60s weld / 60s load)', function () {
			sWeld.input.value = 60;
			sLoad.input.value = 60;
			sIndex.input.value = 2;
			draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnWorked, btnOpBottleneck, btnEqual]);

		function draw() {
			var Tweld = Number(sWeld.input.value);
			var Tload = Number(sLoad.input.value);
			var Tindex = Number(sIndex.input.value);

			sWeld.out.textContent = Tweld + ' s';
			sLoad.out.textContent = Tload + ' s';
			sIndex.out.textContent = Tindex + ' s';

			var T1 = Tweld + Tload;
			var T2 = Math.max(Tweld, Tload) + Tindex;

			var busy1 = (Tweld / T1) * 100;
			var busy2 = (Tweld / T2) * 100;
			var outputGain = ((T1 / T2) - 1) * 100;

			var bottleneck = '';
			if (Tweld > Tload) bottleneck = 'process (welding)';
			else if (Tload > Tweld) bottleneck = "operator's loading";
			else bottleneck = 'tied (welding and loading)';

			var maxT = Math.max(T1, 150);
			var leftX = 24, plotW = 330;

			svg.replaceChildren();

			var tLabel1 = s('text', { 'class': 'd-title', x: leftX, y: 22 });
			tLabel1.textContent = 'One station: ' + T1.toFixed(0) + ' s cycle';
			svg.appendChild(tLabel1);

			var w1Weld = (Tweld / maxT) * plotW;
			var w1Load = (Tload / maxT) * plotW;

			var r1Weld = s('rect', { 'class': 'd-box-gold', x: leftX, y: 30, width: w1Weld, height: 24, rx: 2 });
			var t1Weld = s('text', { 'class': 'd-muted', x: leftX + w1Weld / 2, y: 46, 'text-anchor': 'middle' });
			t1Weld.textContent = 'Weld ' + Tweld + 's';

			var r1Load = s('rect', { 'class': 'd-box', x: leftX + w1Weld, y: 30, width: w1Load, height: 24, rx: 2 });
			var t1Load = s('text', { 'class': 'd-muted', x: leftX + w1Weld + w1Load / 2, y: 46, 'text-anchor': 'middle' });
			t1Load.textContent = 'Wait/Load ' + Tload + 's';

			svg.appendChild(r1Weld);
			svg.appendChild(t1Weld);
			svg.appendChild(r1Load);
			svg.appendChild(t1Load);

			var tLabel2 = s('text', { 'class': 'd-title', x: leftX, y: 84 });
			tLabel2.textContent = 'Two stations: ' + T2.toFixed(1) + ' s cycle (overlapped)';
			svg.appendChild(tLabel2);

			var overlapMax = Math.max(Tweld, Tload);
			var w2Overlap = (overlapMax / maxT) * plotW;
			var w2Index = Math.max(3, (Tindex / maxT) * plotW);

			var r2Overlap = s('rect', { 'class': 'd-box-gold', x: leftX, y: 92, width: w2Overlap, height: 24, rx: 2 });
			var t2Overlap = s('text', { 'class': 'd-muted', x: leftX + w2Overlap / 2, y: 108, 'text-anchor': 'middle' });
			t2Overlap.textContent = 'Overlap max(' + Tweld + ', ' + Tload + ')';

			var r2Index = s('rect', { 'class': 'd-box', x: leftX + w2Overlap, y: 92, width: w2Index, height: 24, rx: 2 });
			var t2Index = s('text', { 'class': 'd-muted', x: leftX + w2Overlap + w2Index + 4, y: 108 });
			t2Index.textContent = 'Index ' + Tindex + 's';

			svg.appendChild(r2Overlap);
			svg.appendChild(t2Overlap);
			svg.appendChild(r2Index);
			svg.appendChild(t2Index);

			readout.textContent = 'One station: ' + Tweld + ' + ' + Tload + ' = ' + T1.toFixed(0) + ' s (robot busy ' +
				busy1.toFixed(0) + '%). Two stations: max(' + Tweld + ', ' + Tload + ') + ' + Tindex + ' = ' +
				T2.toFixed(1) + ' s (robot busy ' + Tweld + '/' + T2.toFixed(1) + ' s = ' + busy2.toFixed(0) +
				'%). Output rises by ' + outputGain.toFixed(0) + '%. Bottleneck: ' + bottleneck + '.';
		}

		[sWeld, sLoad, sIndex].forEach(function (ctrl) {
			ctrl.input.addEventListener('input', draw);
		});

		root.replaceChildren(frame('cycle time and two-station positioner', [
			h('p', { 'class': 'widget-note', text: 'Designers shorten cycle time by overlapping work so the operator loads one station while the robot works on the other.' }),
			sWeld.row,
			sLoad.row,
			sIndex.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Vacuum cup sizing (lesson 2.5) ---------- */

	function initVacuumCupSizing(root) {
		var sMass = slider('Part mass (m)', 'vc-mass', 0.5, 10, 0.5, 2, ' kg');
		var sAccel = slider('Upward acceleration (a)', 'vc-accel', 0, 15, 0.5, 5, ' m/s²');
		var sSafety = slider('Safety factor (S)', 'vc-safety', 1, 4, 0.5, 1.5, '');
		var sPressure = slider('Pressure difference (ΔP)', 'vc-press', 20, 90, 5, 60, ' kPa');
		var sCups = slider('Number of cups (n)', 'vc-cups', 1, 6, 1, 2, '');

		var W = 380, H = 140;
		var svg = plotFrame(W, H, 'Diagram of vacuum gripper suction cups holding a workpiece');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnWorked = button('Worked example (2 kg, a=5, S=1.5, 60 kPa, 2 cups)', function () {
			sMass.input.value = 2;
			sAccel.input.value = 5;
			sSafety.input.value = 1.5;
			sPressure.input.value = 60;
			sCups.input.value = 2;
			draw();
		});

		var btnSmooth = button('Smooth part (S=1.5)', function () {
			sSafety.input.value = 1.5;
			draw();
		});
		var btnPorous = button('Porous / oily part (S=2.0)', function () {
			sSafety.input.value = 2.0;
			draw();
		});
		var btnFast = button('Fast moves (S=2.5)', function () {
			sSafety.input.value = 2.5;
			draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnWorked, btnSmooth, btnPorous, btnFast]);

		function draw() {
			var m = Number(sMass.input.value);
			var a = Number(sAccel.input.value);
			var S = Number(sSafety.input.value);
			var dP_kPa = Number(sPressure.input.value);
			var n = Number(sCups.input.value);

			sMass.out.textContent = m + ' kg';
			sAccel.out.textContent = a + ' m/s²';
			sSafety.out.textContent = S.toFixed(1);
			sPressure.out.textContent = dP_kPa + ' kPa';
			sCups.out.textContent = String(n);

			var g = 9.81;
			var Fh = m * (g + a) * S;
			var dP_Pa = dP_kPa * 1000;
			var Atot_m2 = Fh / dP_Pa;
			var Atot_mm2 = Atot_m2 * 1e6;
			var Acup_mm2 = Atot_mm2 / n;
			var D_mm = 2 * Math.sqrt(Acup_mm2 / Math.PI);

			svg.replaceChildren();

			var barY = 30;
			var bar = s('rect', { 'class': 'd-box', x: 50, y: barY, width: 280, height: 12, rx: 2 });
			svg.appendChild(bar);

			var cupSpacing = 240 / (n + 1);
			var drawRadius = Math.max(6, Math.min(22, D_mm * 0.7));
			for (var i = 1; i <= n; i++) {
				var cx = 70 + i * cupSpacing;
				var stem = s('line', { 'class': 'd-line', x1: cx, y1: barY + 12, x2: cx, y2: 60 });
				var cupPath = s('path', {
					'class': 'd-box-gold',
					d: 'M' + (cx - drawRadius) + ',70 Q' + cx + ',56 ' + (cx + drawRadius) + ',70 Z'
				});
				svg.appendChild(stem);
				svg.appendChild(cupPath);
			}

			var box = s('rect', { 'class': 'd-box', x: 70, y: 70, width: 240, height: 42, rx: 3 });
			var boxText = s('text', { 'class': 'd-title', x: 190, y: 96, 'text-anchor': 'middle' });
			boxText.textContent = 'Part: ' + m + ' kg';
			svg.appendChild(box);
			svg.appendChild(boxText);

			var fLabel = s('text', { 'class': 'd-muted', x: 30, y: 65, 'text-anchor': 'middle' });
			fLabel.textContent = 'F_H=' + Fh.toFixed(0) + 'N';
			var aLabel = s('text', { 'class': 'd-muted', x: 30, y: 85, 'text-anchor': 'middle' });
			aLabel.textContent = 'a=' + a + 'm/s²';
			svg.appendChild(fLabel);
			svg.appendChild(aLabel);

			readout.textContent = 'F_H = ' + m + ' × (' + g + ' + ' + a + ') × ' + S.toFixed(1) +
				' = ' + Fh.toFixed(1) + ' N · Total area = ' + Atot_mm2.toFixed(0) +
				' mm² · ' + n + ' cup' + (n > 1 ? 's' : '') + ': ' + Acup_mm2.toFixed(0) +
				' mm²/cup → D ≈ ' + D_mm.toFixed(1) + ' mm per cup.';
		}

		[sMass, sAccel, sSafety, sPressure, sCups].forEach(function (ctrl) {
			ctrl.input.addEventListener('input', draw);
		});

		root.replaceChildren(frame('vacuum gripper suction cup sizing', [
			h('p', { 'class': 'widget-note', text: 'Holding force F_H = m × (g + a) × S. Total required cup area is F_H divided by the vacuum pressure difference, and solving A = π(D/2)² gives cup diameter D.' }),
			sMass.row,
			sAccel.row,
			sSafety.row,
			sPressure.row,
			sCups.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Offs vs RelTool coordinate frame shifts (lesson 2.6) ---------- */

	function initOffsVsReltool(root) {
		var sTilt = slider('Tool tilt angle (θ)', 'ovr-tilt', -60, 60, 5, 30, '°');
		var sX = slider('Offset X (dx)', 'ovr-x', -100, 100, 5, 0, ' mm');
		var sZ = slider('Offset Z (dz)', 'ovr-z', -100, 100, 5, -100, ' mm');

		var W = 380, H = 240;
		var svg = plotFrame(W, H, 'Comparison of Offs (work object frame) versus RelTool (tool frame)');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnRelApproach = button('RelTool approach (0, 0, -100)', function () {
			sX.input.value = 0;
			sZ.input.value = -100;
			draw();
		});
		var btnOffsApproach = button('Offs approach (0, 0, 100)', function () {
			sX.input.value = 0;
			sZ.input.value = 100;
			draw();
		});
		var btnSurprise = button('Beginner surprise: RelTool(p, 100, 0, 0)', function () {
			sTilt.input.value = 30;
			sX.input.value = 100;
			sZ.input.value = 0;
			draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnRelApproach, btnOffsApproach, btnSurprise]);

		function draw() {
			var deg = Number(sTilt.input.value);
			var dx = Number(sX.input.value);
			var dz = Number(sZ.input.value);

			sTilt.out.textContent = deg + '°';
			sX.out.textContent = dx + ' mm';
			sZ.out.textContent = dz + ' mm';

			var rad = deg * Math.PI / 180;

			var offs_x = dx;
			var offs_z = dz;

			var rel_x = dx * Math.cos(rad) + dz * Math.sin(rad);
			var rel_z = dx * Math.sin(rad) - dz * Math.cos(rad);

			svg.replaceChildren();

			var cx = 190, cy = 150;
			var scale = 0.8;

			var axisX = s('line', { 'class': 'd-line', x1: 50, y1: cy, x2: 330, y2: cy });
			var axisZ = s('line', { 'class': 'd-line', x1: cx, y1: cy + 40, x2: cx, y2: 30 });
			var tWobjX = s('text', { 'class': 'd-muted', x: 332, y: cy + 4 });
			tWobjX.textContent = 'wobj X';
			var tWobjZ = s('text', { 'class': 'd-muted', x: cx + 4, y: 34 });
			tWobjZ.textContent = 'wobj Z (up)';

			svg.appendChild(axisX);
			svg.appendChild(axisZ);
			svg.appendChild(tWobjX);
			svg.appendChild(tWobjZ);

			var ptPick = s('circle', { 'class': 'd-fill', cx: cx, cy: cy, r: 4 });
			var tPick = s('text', { 'class': 'd-title', x: cx + 6, y: cy + 16 });
			tPick.textContent = 'pPick (0,0)';
			svg.appendChild(ptPick);
			svg.appendChild(tPick);

			var toolLen = 45;
			var tzx = cx + toolLen * Math.sin(rad);
			var tzy = cy + toolLen * Math.cos(rad);
			var lineToolZ = s('line', { 'class': 'd-strong', x1: cx, y1: cy, x2: tzx, y2: tzy });
			var labelToolZ = s('text', { 'class': 'd-muted', x: tzx + 4, y: tzy + 4 });
			labelToolZ.textContent = 'Tool Z';
			svg.appendChild(lineToolZ);
			svg.appendChild(labelToolZ);

			var ox_svg = cx + offs_x * scale;
			var oz_svg = cy - offs_z * scale;
			var dotOffs = s('circle', { 'class': 'd-box-gold', cx: ox_svg, cy: oz_svg, r: 6 });
			var lineOffs = s('line', { 'class': 'd-line', 'stroke-dasharray': '3 3', x1: cx, y1: cy, x2: ox_svg, y2: oz_svg });
			var txtOffs = s('text', { 'class': 'd-title', x: ox_svg + 8, y: oz_svg - 4 });
			txtOffs.textContent = 'Offs';
			svg.appendChild(lineOffs);
			svg.appendChild(dotOffs);
			svg.appendChild(txtOffs);

			var rx_svg = cx + rel_x * scale;
			var rz_svg = cy - rel_z * scale;
			var dotRel = s('circle', { 'class': 'd-box', cx: rx_svg, cy: rz_svg, r: 6 });
			var lineRel = s('line', { 'class': 'd-strong', 'stroke-dasharray': '2 2', x1: cx, y1: cy, x2: rx_svg, y2: rz_svg });
			var txtRel = s('text', { 'class': 'd-title', x: rx_svg + 8, y: rz_svg - 4 });
			txtRel.textContent = 'RelTool';
			svg.appendChild(lineRel);
			svg.appendChild(dotRel);
			svg.appendChild(txtRel);

			readout.textContent = 'Tool tilt ' + deg + '° · Offs(p, ' + dx + ', 0, ' + dz + '): world X=' +
				offs_x.toFixed(1) + ' mm, Z=' + offs_z.toFixed(1) + ' mm · RelTool(p, ' + dx + ', 0, ' + dz +
				'): world X=' + rel_x.toFixed(1) + ' mm, Z=' + rel_z.toFixed(1) + ' mm.' +
				(dz === 0 && dx !== 0 && deg !== 0 ? ' (RelTool with zero Z argument moved world Z by ' + rel_z.toFixed(1) + ' mm!)' : '');
		}

		[sTilt, sX, sZ].forEach(function (ctrl) {
			ctrl.input.addEventListener('input', draw);
		});

		root.replaceChildren(frame('Offs (work object) versus RelTool (tool frame)', [
			h('p', { 'class': 'widget-note', text: 'Offs shifts along the work object axes. RelTool shifts along the tool axes. With tool pointing down, tool Z points into the table, so the approach is RelTool(pPick, 0, 0, -100).' }),
			sTilt.row,
			sX.row,
			sZ.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Pallet indexing (lesson 2.7) ---------- */

	function initPalletIndexing(root) {
		var sIndex = slider('Pallet slot index (i)', 'pal-idx', 0, 8, 1, 4, '');

		var W = 380, H = 200;
		var svg = plotFrame(W, H, '3 by 3 pallet slot indexing grid with integer division and remainder');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnPrev = button('◀ Previous slot', function () {
			var cur = Number(sIndex.input.value);
			if (cur > 0) { sIndex.input.value = cur - 1; draw(); }
		});
		var btnNext = button('Next slot ▶', function () {
			var cur = Number(sIndex.input.value);
			if (cur < 8) { sIndex.input.value = cur + 1; draw(); }
		});
		var btnFirst = button('Slot 0 (corner)', function () {
			sIndex.input.value = 0; draw();
		});
		var btnLast = button('Slot 8 (end)', function () {
			sIndex.input.value = 8; draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnPrev, btnNext, btnFirst, btnLast]);

		function draw() {
			var i = Number(sIndex.input.value);
			sIndex.out.textContent = String(i);

			var row = Math.floor(i / 3);
			var col = i % 3;
			var pitchX = 60;
			var pitchY = 60;
			var offX = col * pitchX;
			var offY = row * pitchY;

			svg.replaceChildren();

			var originX = 70, originY = 30;
			var cellW = 75, cellH = 45;

			for (var c = 0; c < 3; c++) {
				var thCol = s('text', { 'class': 'd-muted', x: originX + c * cellW + cellW / 2, y: originY - 8, 'text-anchor': 'middle' });
				thCol.textContent = 'col ' + c;
				svg.appendChild(thCol);
			}

			for (var r = 0; r < 3; r++) {
				var thRow = s('text', { 'class': 'd-muted', x: originX - 10, y: originY + r * cellH + cellH / 2 + 4, 'text-anchor': 'end' });
				thRow.textContent = 'row ' + r;
				svg.appendChild(thRow);

				for (var c2 = 0; c2 < 3; c2++) {
					var slotNum = r * 3 + c2;
					var isSel = (slotNum === i);

					var g = s('g', { 'tabindex': '0', 'role': 'button', 'aria-label': 'Slot ' + slotNum + ', row ' + r + ', col ' + c2 });
					g.style.cursor = 'pointer';

					(function (num) {
						g.addEventListener('click', function () {
							sIndex.input.value = num;
							draw();
						});
						g.addEventListener('keydown', function (e) {
							if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
								e.preventDefault();
								sIndex.input.value = num;
								draw();
							}
						});
					})(slotNum);

					var rect = s('rect', {
						'class': isSel ? 'd-box-gold' : 'd-box',
						x: originX + c2 * cellW,
						y: originY + r * cellH,
						width: cellW - 6,
						height: cellH - 6,
						rx: 3
					});
					var txt = s('text', {
						'class': isSel ? 'd-title' : 'd-text',
						x: originX + c2 * cellW + (cellW - 6) / 2,
						y: originY + r * cellH + (cellH - 6) / 2 + 5,
						'text-anchor': 'middle'
					});
					txt.textContent = 'slot ' + slotNum;

					g.appendChild(rect);
					g.appendChild(txt);
					svg.appendChild(g);
				}
			}

			var tPitch = s('text', { 'class': 'd-muted', x: originX, y: originY + 3 * cellH + 20 });
			tPitch.textContent = 'pitch: PITCH_X = ' + pitchX + ' mm, PITCH_Y = ' + pitchY + ' mm';
			svg.appendChild(tPitch);

			readout.textContent = 'Slot i = ' + i + ' · row = ' + i + ' DIV 3 = ' + row +
				' · col = ' + i + ' MOD 3 = ' + col + ' · Offset from corner = (' +
				col + ' × ' + pitchX + ' mm, ' + row + ' × ' + pitchY + ' mm) = (' +
				offX + ' mm, ' + offY + ' mm).';
		}

		sIndex.input.addEventListener('input', draw);

		root.replaceChildren(frame('pallet grid indexing: DIV and MOD', [
			h('p', { 'class': 'widget-note', text: 'Number slots 0 to 8: integer division computes the row (i DIV 3) and remainder computes the column (i MOD 3).' }),
			sIndex.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Vision frame shift and lever arm (lesson 2.8) ---------- */

	function initVisionFrameShift(root) {
		var sDeg = slider('Part rotation angle (θ)', 'vfs-deg', -180, 180, 5, 30, '°');
		var sDx = slider('Part translation dx', 'vfs-dx', -40, 40, 1, 15, ' mm');
		var sDy = slider('Part translation dy', 'vfs-dy', -40, 40, 1, -10, ' mm');

		var W = 380, H = 220;
		var svg = plotFrame(W, H, 'Rigid transform frame shift versus naive offset error');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnWorked = button('Worked example (dx=+15, dy=-10, θ=30°)', function () {
			sDeg.input.value = 30;
			sDx.input.value = 15;
			sDy.input.value = -10;
			draw();
		});
		var btnZero = button('No rotation (θ=0°)', function () {
			sDeg.input.value = 0;
			draw();
		});
		var btn90 = button('90° turn (dx=0, dy=0, θ=90°)', function () {
			sDeg.input.value = 90;
			sDx.input.value = 0;
			sDy.input.value = 0;
			draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnWorked, btnZero, btn90]);

		function draw() {
			var deg = Number(sDeg.input.value);
			var dx = Number(sDx.input.value);
			var dy = Number(sDy.input.value);

			sDeg.out.textContent = deg + '°';
			sDx.out.textContent = (dx >= 0 ? '+' : '') + dx + ' mm';
			sDy.out.textContent = (dy >= 0 ? '+' : '') + dy + ' mm';

			var rad = deg * Math.PI / 180;

			var T_ref_x = 200, T_ref_y = 150;
			var armLen = 10;

			var T_found_x = T_ref_x + dx;
			var T_found_y = T_ref_y + dy;

			var rot_x = armLen * Math.cos(rad);
			var rot_y = armLen * Math.sin(rad);
			var P_true_x = T_found_x + rot_x;
			var P_true_y = T_found_y + rot_y;

			var P_naive_x = (T_ref_x + armLen) + dx;
			var P_naive_y = T_ref_y + dy;

			var errX = P_true_x - P_naive_x;
			var errY = P_true_y - P_naive_y;
			var errDist = Math.sqrt(errX * errX + errY * errY);

			svg.replaceChildren();

			var scale = 3.5;
			function toSvg(x, y) {
				return [190 + (x - 215) * scale, 110 - (y - 140) * scale];
			}

			var pRefSvg = toSvg(T_ref_x, T_ref_y);
			var ghost = s('circle', { 'class': 'd-line', 'stroke-dasharray': '3 3', cx: pRefSvg[0], cy: pRefSvg[1], r: armLen * scale, fill: 'none' });
			var tRefLabel = s('text', { 'class': 'd-muted', x: pRefSvg[0] - 20, y: pRefSvg[1] + 18 });
			tRefLabel.textContent = 'T_ref (200,150)';
			svg.appendChild(ghost);
			svg.appendChild(tRefLabel);

			var pFoundSvg = toSvg(T_found_x, T_found_y);
			var dotFound = s('circle', { 'class': 'd-fill', cx: pFoundSvg[0], cy: pFoundSvg[1], r: 5 });
			var tFoundLabel = s('text', { 'class': 'd-title', x: pFoundSvg[0] - 10, y: pFoundSvg[1] + 20 });
			tFoundLabel.textContent = 'Part (' + T_found_x + ',' + T_found_y + ')';
			svg.appendChild(dotFound);
			svg.appendChild(tFoundLabel);

			var pTrueSvg = toSvg(P_true_x, P_true_y);
			var leverLine = s('line', { 'class': 'd-strong', x1: pFoundSvg[0], y1: pFoundSvg[1], x2: pTrueSvg[0], y2: pTrueSvg[1] });
			svg.appendChild(leverLine);

			var dotTrue = s('circle', { 'class': 'd-box-gold', cx: pTrueSvg[0], cy: pTrueSvg[1], r: 6 });
			var tTrueLabel = s('text', { 'class': 'd-title', x: pTrueSvg[0] + 8, y: pTrueSvg[1] - 4 });
			tTrueLabel.textContent = 'True P_new (' + P_true_x.toFixed(1) + ',' + P_true_y.toFixed(1) + ')';
			svg.appendChild(dotTrue);
			svg.appendChild(tTrueLabel);

			var pNaiveSvg = toSvg(P_naive_x, P_naive_y);
			var dotNaive = s('circle', { 'class': 'd-box', cx: pNaiveSvg[0], cy: pNaiveSvg[1], r: 6 });
			var tNaiveLabel = s('text', { 'class': 'd-muted', x: pNaiveSvg[0] + 8, y: pNaiveSvg[1] + 14 });
			tNaiveLabel.textContent = 'Naive (' + P_naive_x.toFixed(1) + ',' + P_naive_y.toFixed(1) + ')';
			svg.appendChild(dotNaive);
			svg.appendChild(tNaiveLabel);

			var lineErr = s('line', { 'class': 'd-line', 'stroke-dasharray': '2 2', x1: pTrueSvg[0], y1: pTrueSvg[1], x2: pNaiveSvg[0], y2: pNaiveSvg[1] });
			svg.appendChild(lineErr);

			readout.textContent = 'T_found = (' + T_found_x + ', ' + T_found_y + ', ' + deg +
				'°) · True P_new = (' + P_true_x.toFixed(3) + ', ' + P_true_y.toFixed(3) + ', ' + deg +
				'°) · Naive point = (' + P_naive_x.toFixed(1) + ', ' + P_naive_y.toFixed(1) +
				') · Lever arm position error = ' + errDist.toFixed(2) + ' mm.';
		}

		[sDeg, sDx, sDy].forEach(function (ctrl) {
			ctrl.input.addEventListener('input', draw);
		});

		root.replaceChildren(frame('vision frame shift: lever arm vs naive offset', [
			h('p', { 'class': 'widget-note', text: 'When a part turns, the pick point swings around with it like the end of a lever. A naive "add the offset" ignores rotation and produces position error.' }),
			sDeg.row,
			sDx.row,
			sDy.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- ROS_DOMAIN_ID port calculation (lesson 4.1) ---------- */

	function initRosDomainId(root) {
		var sDomain = slider('ROS_DOMAIN_ID (0 to 101)', 'rdi-domain', 0, 115, 1, 0, '');
		var sPart = slider('Participant ID', 'rdi-part', 0, 10, 1, 0, '');

		var W = 380, H = 160;
		var svg = plotFrame(W, H, 'DDS RTPS UDP port mapping based on ROS_DOMAIN_ID and participant ID');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnD0 = button('Domain 0 (default)', function () {
			sDomain.input.value = 0; sPart.input.value = 0; draw();
		});
		var btnD7 = button('Domain 7 (worked example)', function () {
			sDomain.input.value = 7; sPart.input.value = 0; draw();
		});
		var btnD12 = button('Domain 12 (Try it question)', function () {
			sDomain.input.value = 12; sPart.input.value = 0; draw();
		});
		var btnD102 = button('Domain 102 (ephemeral warning)', function () {
			sDomain.input.value = 102; draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnD0, btnD7, btnD12, btnD102]);

		function draw() {
			var D = Number(sDomain.input.value);
			var P = Number(sPart.input.value);

			sDomain.out.textContent = String(D);
			sPart.out.textContent = String(P);

			var pMultiDisc = 7400 + (250 * D);
			var pMultiUser = 7401 + (250 * D);
			var pUniDisc = 7410 + (250 * D) + (2 * P);
			var pUniUser = 7411 + (250 * D) + (2 * P);

			svg.replaceChildren();

			var cards = [
				{ name: 'Multicast Discovery', formula: '7400 + 250×' + D, port: pMultiDisc, x: 20, y: 16 },
				{ name: 'Multicast User Data', formula: '7401 + 250×' + D, port: pMultiUser, x: 195, y: 16 },
				{ name: 'Unicast Discovery', formula: '7410 + 250×' + D + ' + 2×' + P, port: pUniDisc, x: 20, y: 82 },
				{ name: 'Unicast User Data', formula: '7411 + 250×' + D + ' + 2×' + P, port: pUniUser, x: 195, y: 82 }
			];

			cards.forEach(function (c) {
				var box = s('rect', { 'class': 'd-box', x: c.x, y: c.y, width: 165, height: 56, rx: 4 });
				var tName = s('text', { 'class': 'd-muted', x: c.x + 8, y: c.y + 18, 'font-size': '11px' });
				tName.textContent = c.name;
				var tPort = s('text', { 'class': 'd-title', x: c.x + 8, y: c.y + 38, 'font-size': '16px' });
				tPort.textContent = 'Port ' + c.port;
				var tFormula = s('text', { 'class': 'd-muted', x: c.x + 8, y: c.y + 50, 'font-size': '10px' });
				tFormula.textContent = c.formula;

				svg.appendChild(box);
				svg.appendChild(tName);
				svg.appendChild(tPort);
				svg.appendChild(tFormula);
			});

			var rangeStatus = '';
			if (D <= 101) {
				rangeStatus = 'Recommended range (0-101).';
			} else if (D <= 232) {
				rangeStatus = 'Warning: IDs above 101 can collide with the Linux ephemeral port range.';
			} else {
				rangeStatus = 'Invalid: Highest assignable ID is 232.';
			}

			readout.textContent = 'export ROS_DOMAIN_ID=' + D + ' · Participant ' + P +
				' · Multicast discovery: ' + pMultiDisc + ' · Multicast user: ' + pMultiUser +
				' · Unicast discovery: ' + pUniDisc + ' · Unicast user: ' + pUniUser +
				' · ' + rangeStatus;
		}

		[sDomain, sPart].forEach(function (ctrl) {
			ctrl.input.addEventListener('input', draw);
		});

		root.replaceChildren(frame('ROS_DOMAIN_ID DDS RTPS port mapping', [
			h('p', { 'class': 'widget-note', text: 'DDS wire protocol uses a base port of 7400, a domain gain of 250 and participant gain of 2. IDs between 0 and 101 are recommended.' }),
			sDomain.row,
			sPart.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Square FSM open-loop drift (lesson 4.6) ---------- */

	function initSquareFsm(root) {
		var sSpeed = slider('Forward speed (m/s)', 'sf-spd', 0.5, 2.0, 0.1, 1.0, ' m/s');
		var sTurn = slider('Turn rate (rad/s)', 'sf-trn', 0.5, 2.0, 0.1, 1.0, ' rad/s');

		var W = 380, H = 240;
		var svg = plotFrame(W, H, 'Turtlesim open-loop square state machine and trajectory drift');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var dt = 0.1;
		var sideLength = 2.0;
		var state = 'FORWARD';
		var elapsed = 0.0;
		var sidesDone = 0;
		var posX = 0.0, posY = 0.0, heading = 0.0;
		var pathHistory = [[0.0, 0.0]];
		var running = false;
		var animId = null;

		function reset() {
			running = false;
			if (animId) cancelAnimationFrame(animId);
			state = 'FORWARD';
			elapsed = 0.0;
			sidesDone = 0;
			posX = 0.0; posY = 0.0; heading = 0.0;
			pathHistory = [[0.0, 0.0]];
			btnRun.setAttribute('aria-pressed', 'false');
			btnRun.textContent = 'Run';
			draw();
		}

		function tick() {
			var spd = Number(sSpeed.input.value);
			var trn = Number(sTurn.input.value);

			if (state === 'DONE') {
				running = false;
				btnRun.setAttribute('aria-pressed', 'false');
				btnRun.textContent = 'Run';
				draw();
				return;
			}

			if (state === 'FORWARD' && elapsed >= (sideLength / spd)) {
				state = 'TURN';
				elapsed = 0.0;
			} else if (state === 'TURN' && elapsed >= ((Math.PI / 2) / trn)) {
				sidesDone++;
				state = 'FORWARD';
				elapsed = 0.0;
				if (sidesDone === 4) {
					state = 'DONE';
				}
			}

			if (state === 'FORWARD') {
				posX += spd * Math.cos(heading) * dt;
				posY += spd * Math.sin(heading) * dt;
			} else if (state === 'TURN') {
				heading += trn * dt;
			}

			elapsed += dt;
			pathHistory.push([posX, posY]);
			draw();
		}

		function stepAnim() {
			if (!running) return;
			tick();
			if (running && !reduceMotion) {
				animId = requestAnimationFrame(stepAnim);
			}
		}

		var btnStep = button('Step tick (+0.1 s)', function () {
			tick();
		});

		var btnRun = button('Run', function () {
			if (reduceMotion) {
				while (state !== 'DONE' && pathHistory.length < 500) {
					tick();
				}
				draw();
				return;
			}
			running = !running;
			btnRun.setAttribute('aria-pressed', String(running));
			btnRun.textContent = running ? 'Pause' : 'Run';
			if (running) stepAnim();
		});

		var btnReset = button('Reset', reset);

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnRun, btnStep, btnReset]);

		function draw() {
			sSpeed.out.textContent = Number(sSpeed.input.value).toFixed(1) + ' m/s';
			sTurn.out.textContent = Number(sTurn.input.value).toFixed(1) + ' rad/s';

			svg.replaceChildren();

			var fsmStates = ['FORWARD', 'TURN', 'DONE'];
			fsmStates.forEach(function (st, idx) {
				var isCur = (state === st);
				var bx = 24 + idx * 115;
				var rBox = s('rect', {
					'class': isCur ? 'd-box-gold' : 'd-box',
					x: bx, y: 12, width: 100, height: 32, rx: 4
				});
				var tBox = s('text', {
					'class': isCur ? 'd-title' : 'd-muted',
					x: bx + 50, y: 32, 'text-anchor': 'middle'
				});
				tBox.textContent = st;
				svg.appendChild(rBox);
				svg.appendChild(tBox);
			});

			var originX = 110, originY = 190, scale = 55;

			var idealPts = [
				[originX, originY],
				[originX + sideLength * scale, originY],
				[originX + sideLength * scale, originY - sideLength * scale],
				[originX, originY - sideLength * scale],
				[originX, originY]
			];
			var idealPoly = s('polyline', {
				'class': 'd-line',
				'stroke-dasharray': '3 3',
				points: idealPts.map(function (p) { return p.join(','); }).join(' '),
				fill: 'none'
			});
			svg.appendChild(idealPoly);

			var actualPts = pathHistory.map(function (pt) {
				return (originX + pt[0] * scale).toFixed(1) + ',' + (originY - pt[1] * scale).toFixed(1);
			}).join(' ');
			var actualPoly = s('polyline', {
				'class': 'd-strong',
				points: actualPts,
				fill: 'none'
			});
			svg.appendChild(actualPoly);

			var curSvgX = originX + posX * scale;
			var curSvgY = originY - posY * scale;
			var dotTurtle = s('circle', { 'class': 'd-fill', cx: curSvgX, cy: curSvgY, r: 5 });
			var headLine = s('line', {
				'class': 'd-strong',
				x1: curSvgX, y1: curSvgY,
				x2: curSvgX + 14 * Math.cos(heading),
				y2: curSvgY - 14 * Math.sin(heading)
			});
			svg.appendChild(dotTurtle);
			svg.appendChild(headLine);

			var degHeading = (heading * 180 / Math.PI) % 360;
			readout.textContent = 'State: ' + state + ' · Side: ' + sidesDone + '/4 · Time in state: ' +
				elapsed.toFixed(1) + ' s · Heading: ' + degHeading.toFixed(1) +
				'° · Drift: 0.1 s ticks cause turn overshoot of ~1.7° per corner.';
		}

		[sSpeed, sTurn].forEach(function (ctrl) {
			ctrl.input.addEventListener('input', draw);
		});

		root.replaceChildren(frame('open-loop square state machine (FORWARD / TURN / DONE)', [
			h('p', { 'class': 'widget-note', text: 'A timer checks the clock every 0.1 s. A 90° turn (1.57 s at 1.0 rad/s) lasts until the next tick (1.6 s), causing small open-loop drift corner to corner.' }),
			sSpeed.row,
			sTurn.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Stereo disparity triangulation (lesson 7.4) ---------- */

	function initStereoDisparity(root) {
		var sBase = slider('Baseline (B)', 'sd-base', 50, 250, 10, 120, ' mm');
		var sFocal = slider('Focal length (f)', 'sd-focal', 400, 1200, 50, 800, ' px');
		var sDepth = slider('Object depth (Z)', 'sd-depth', 400, 3000, 50, 1000, ' mm');

		var W = 380, H = 220;
		var svg = plotFrame(W, H, 'Stereo triangulation geometry relating baseline, focal length, depth and disparity');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnDefault = button('Default (B=120 mm, f=800 px, Z=1000 mm)', function () {
			sBase.input.value = 120; sFocal.input.value = 800; sDepth.input.value = 1000; draw();
		});
		var btnClose = button('Close object (Z=500 mm)', function () {
			sDepth.input.value = 500; draw();
		});
		var btnFar = button('Far object (Z=2500 mm)', function () {
			sDepth.input.value = 2500; draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnDefault, btnClose, btnFar]);

		function draw() {
			var B = Number(sBase.input.value);
			var f = Number(sFocal.input.value);
			var Z = Number(sDepth.input.value);

			sBase.out.textContent = B + ' mm';
			sFocal.out.textContent = f + ' px';
			sDepth.out.textContent = Z + ' mm';

			var disparity = (B * f) / Z;

			svg.replaceChildren();

			var cx = 190;
			var camY = 35;
			var bScale = 0.6;
			var leftCamX = cx - (B * bScale) / 2;
			var rightCamX = cx + (B * bScale) / 2;

			var lineB = s('line', { 'class': 'd-strong', x1: leftCamX, y1: camY, x2: rightCamX, y2: camY });
			var tB = s('text', { 'class': 'd-muted', x: cx, y: camY - 8, 'text-anchor': 'middle' });
			tB.textContent = 'Baseline B = ' + B + ' mm';
			svg.appendChild(lineB);
			svg.appendChild(tB);

			[leftCamX, rightCamX].forEach(function (camX, idx) {
				var box = s('rect', { 'class': 'd-box-gold', x: camX - 14, y: camY, width: 28, height: 16, rx: 2 });
				var txt = s('text', { 'class': 'd-muted', x: camX, y: camY + 12, 'text-anchor': 'middle', 'font-size': '10px' });
				txt.textContent = idx === 0 ? 'L' : 'R';
				svg.appendChild(box);
				svg.appendChild(txt);
			});

			var depthY = camY + 20 + (Z / 3000) * 140;
			var dotObj = s('circle', { 'class': 'd-fill', cx: cx, cy: depthY, r: 6 });
			var tObj = s('text', { 'class': 'd-title', x: cx + 10, y: depthY + 4 });
			tObj.textContent = 'Object (Z=' + (Z / 1000).toFixed(2) + ' m)';
			svg.appendChild(dotObj);
			svg.appendChild(tObj);

			var rayL = s('line', { 'class': 'd-line', x1: leftCamX, y1: camY + 16, x2: cx, y2: depthY });
			var rayR = s('line', { 'class': 'd-line', x1: rightCamX, y1: camY + 16, x2: cx, y2: depthY });
			svg.appendChild(rayL);
			svg.appendChild(rayR);

			var axisZ = s('line', { 'class': 'd-line', 'stroke-dasharray': '2 3', x1: cx - 40, y1: camY + 16, x2: cx - 40, y2: depthY });
			svg.appendChild(axisZ);

			readout.textContent = 'disparity = (baseline × f) / depth = (' + B + ' mm × ' + f +
				' px) / ' + Z + ' mm = ' + disparity.toFixed(1) + ' px · depth = ' + (Z / 1000).toFixed(2) +
				' m. (Closer depth increases disparity; far depth approaches zero).';
		}

		[sBase, sFocal, sDepth].forEach(function (ctrl) {
			ctrl.input.addEventListener('input', draw);
		});

		root.replaceChildren(frame('stereo vision: disparity and depth triangulation', [
			h('p', { 'class': 'widget-note', text: 'In stereo vision triangulation, depth Z is inversely proportional to disparity: disparity = (baseline × f) / depth.' }),
			sBase.row,
			sFocal.row,
			sDepth.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Pinhole camera projection matrix K (lesson 7.6) ----------
	   Upgraded to 3D interactive frustum widget: see initPinholeProjection in the 3D engine section below. */

	/* ---------- Device Level Ring (DLR) supervisor & recovery (lesson 8.1) ---------- */

	function initDlrRingRecovery(root) {
		var brokenSeg = -1;

		var W = 380, H = 230;
		var svg = plotFrame(W, H, 'Device Level Ring supervisor behavior unblocking its alternate port upon link break');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnNone = button('Normal (no break)', function () {
			brokenSeg = -1; draw();
		});
		var btnSeg1 = button('Break Seg 1 (Node 1 - Node 2)', function () {
			brokenSeg = 1; draw();
		});
		var btnSeg2 = button('Break Seg 2 (Node 2 - Node 3)', function () {
			brokenSeg = 2; draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnNone, btnSeg1, btnSeg2]);

		function draw() {
			btnNone.setAttribute('aria-pressed', String(brokenSeg === -1));
			btnSeg1.setAttribute('aria-pressed', String(brokenSeg === 1));
			btnSeg2.setAttribute('aria-pressed', String(brokenSeg === 2));

			var hasFault = (brokenSeg !== -1);
			var port2Blocked = !hasFault;

			svg.replaceChildren();

			var NODES = [
				{ id: 'sup', name: 'Ring Supervisor', x: 190, y: 40, isSup: true },
				{ id: 'n1', name: 'Ring Node 1', x: 300, y: 130, isSup: false },
				{ id: 'n2', name: 'Ring Node 2', x: 190, y: 185, isSup: false },
				{ id: 'n3', name: 'Ring Node 3', x: 80, y: 130, isSup: false }
			];

			var SEGS = [
				{ id: 0, x1: 245, y1: 52, x2: 295, y2: 115, label: 'Seg 0' },
				{ id: 1, x1: 295, y1: 145, x2: 235, y2: 180, label: 'Seg 1' },
				{ id: 2, x1: 145, y1: 180, x2: 85, y2: 145, label: 'Seg 2' },
				{ id: 3, x1: 85, y1: 115, x2: 135, y2: 52, label: 'Seg 3' }
			];

			SEGS.forEach(function (seg) {
				var isBroken = (brokenSeg === seg.id);
				var line = s('line', {
					'class': isBroken ? 'd-line' : 'd-strong',
					x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2
				});
				if (isBroken) line.setAttribute('stroke-dasharray', '4 4');
				line.style.cursor = 'pointer';

				(function (sId) {
					line.addEventListener('click', function () {
						brokenSeg = (brokenSeg === sId) ? -1 : sId;
						draw();
					});
				})(seg.id);

				svg.appendChild(line);

				if (isBroken) {
					var mx = (seg.x1 + seg.x2) / 2;
					var my = (seg.y1 + seg.y2) / 2;
					var tBreak = s('text', { 'class': 'd-title', x: mx + 6, y: my + 4 });
					tBreak.textContent = '✕ BREAK';
					svg.appendChild(tBreak);
				}
			});

			NODES.forEach(function (n) {
				var boxW = n.isSup ? 140 : 90;
				var boxH = n.isSup ? 42 : 34;
				var box = s('rect', {
					'class': n.isSup ? 'd-box-gold' : 'd-box',
					x: n.x - boxW / 2, y: n.y - boxH / 2,
					width: boxW, height: boxH, rx: 4
				});
				var txt = s('text', {
					'class': n.isSup ? 'd-title' : 'd-text',
					x: n.x, y: n.y + 4,
					'text-anchor': 'middle',
					'font-size': n.isSup ? '13px' : '12px'
				});
				txt.textContent = n.name;
				svg.appendChild(box);
				svg.appendChild(txt);
			});

			var tPort1 = s('text', { 'class': 'd-muted', x: 260, y: 30, 'font-size': '11px' });
			tPort1.textContent = 'Port 1 (unblocked)';
			var tPort2 = s('text', { 'class': 'd-muted', x: 25, y: 30, 'font-size': '11px' });
			tPort2.textContent = port2Blocked ? 'Port 2 [BLOCKED]' : 'Port 2 (UNBLOCKED)';
			svg.appendChild(tPort1);
			svg.appendChild(tPort2);

			if (hasFault) {
				readout.textContent = 'Cable break on Seg ' + brokenSeg + ' detected: beacon frames cease arriving at opposite supervisor port. Supervisor unblocks Port 2, restoring network path to all nodes within worst-case 2890 µs.';
			} else {
				readout.textContent = 'Normal operation: Ring supervisor transmits beacon frames through both ports. Port 2 is blocked to prevent loops; ring behaves like a line. Network health confirmed.';
			}
		}

		root.replaceChildren(frame('Device Level Ring (DLR) supervisor and fault recovery', [
			h('p', { 'class': 'widget-note', text: "During normal operation, the supervisor blocks one ring port to prevent loops. When a cable breaks, beacon loss triggers unblocking of the port within 2890 µs." }),
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- ISO 8373 edge-case classifier (lesson 1.1) ---------- */

	function initEdgeCaseClassifier(root) {
		var CANDIDATES = [
			{
				name: 'Dishwasher',
				prog: true,
				act: true,
				mech: true,
				auto: true,
				motion: false,
				multipurpose: false,
				verdict: 'Not a robot (ISO 3.1)',
				notes: 'Passes the sense, think, act test. Struggles with ISO clause 3.1 because it does not move itself, handle objects or position anything.'
			},
			{
				name: 'CNC machine tool',
				prog: true,
				act: true,
				mech: true,
				auto: true,
				motion: true,
				multipurpose: false,
				verdict: 'Close to robot; single-job tool',
				notes: 'Programmed, actuated and positions a cutting tool along several axes, but does one kind of job rather than being a multipurpose manipulator (clause 3.6).'
			},
			{
				name: 'Autonomous drone',
				prog: true,
				act: true,
				mech: true,
				auto: true,
				motion: true,
				multipurpose: true,
				verdict: 'Mobile robot',
				notes: 'A drone that holds its position or flies a route by itself has the autonomy to be a mobile robot under ISO 8373.'
			},
			{
				name: 'Piloted drone',
				prog: true,
				act: true,
				mech: true,
				auto: false,
				motion: true,
				multipurpose: true,
				verdict: 'Robotic device',
				notes: 'Flown entirely by a pilot; looks more like a robotic device (such as a teleoperated remote manipulator) than a robot.'
			},
			{
				name: 'Chatbot',
				prog: true,
				act: false,
				mech: false,
				auto: true,
				motion: false,
				multipurpose: false,
				verdict: 'Not a robot',
				notes: 'Has no actuated mechanism. A robot is a physical system situated in the real world, and is not only software residing on a computer.'
			},
			{
				name: 'Self-driving car',
				prog: true,
				act: true,
				mech: true,
				auto: true,
				motion: true,
				multipurpose: false,
				verdict: 'Mobile robot',
				notes: 'Meets clause 3.1 and the mobile robot definition: programmed, actuated, and moves itself with some autonomy across SAE levels.'
			}
		];

		var currentIdx = 0;
		var W = 380, H = 180;
		var svg = plotFrame(W, H, 'ISO 8373 classification criteria and edge-case verdict');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var candButtons = CANDIDATES.map(function (c, idx) {
			return button(c.name, function () {
				currentIdx = idx;
				draw();
			});
		});

		var btnContainer = h('div', { 'class': 'widget-buttons' }, candButtons);

		function draw() {
			candButtons.forEach(function (btn, idx) {
				btn.setAttribute('aria-pressed', String(idx === currentIdx));
			});

			var c = CANDIDATES[currentIdx];
			svg.replaceChildren();

			var tName = s('text', { 'class': 'd-title', x: 190, y: 24, 'text-anchor': 'middle', 'font-size': '13px' });
			tName.textContent = c.name + ' · ISO 8373:2021 criteria check';
			svg.appendChild(tName);

			var CRITERIA = [
				{ label: 'Programmed', pass: c.prog, note: 'Behavior from code' },
				{ label: 'Actuated mech.', pass: c.act && c.mech, note: 'Physical actuator' },
				{ label: 'Autonomy', pass: c.auto, note: 'Operates on its own' },
				{ label: 'Locomotion / pos.', pass: c.motion, note: 'Moves or positions' }
			];

			CRITERIA.forEach(function (crit, i) {
				var bx = 12 + i * 90;
				var box = s('rect', {
					'class': crit.pass ? 'd-box-gold' : 'd-box',
					x: bx, y: 40, width: 80, height: 62, rx: 4
				});
				var tLbl = s('text', { 'class': 'd-muted', x: bx + 40, y: 58, 'text-anchor': 'middle', 'font-size': '11px' });
				tLbl.textContent = crit.label;
				var tBadge = s('text', {
					'class': crit.pass ? 'd-title' : 'd-text',
					x: bx + 40, y: 80, 'text-anchor': 'middle', 'font-size': '13px'
				});
				tBadge.textContent = crit.pass ? 'PASS ✓' : 'FAIL ✗';
				var tSub = s('text', { 'class': 'd-muted', x: bx + 40, y: 94, 'text-anchor': 'middle', 'font-size': '11px' });
				tSub.textContent = crit.pass ? 'Meets test' : 'Not met';
				svg.appendChild(box);
				svg.appendChild(tLbl);
				svg.appendChild(tBadge);
				svg.appendChild(tSub);
			});

			var isRobot = (c.verdict.indexOf('robot') !== -1 && c.verdict.indexOf('Not') === -1);
			var vBox = s('rect', {
				'class': isRobot ? 'd-box-gold' : 'd-box',
				x: 12, y: 116, width: 350, height: 48, rx: 4
			});
			var tVerdict = s('text', { 'class': 'd-title', x: 187, y: 136, 'text-anchor': 'middle', 'font-size': '13px' });
			tVerdict.textContent = 'Verdict: ' + c.verdict;
			var tRule = s('text', { 'class': 'd-muted', x: 187, y: 153, 'text-anchor': 'middle', 'font-size': '11px' });
			tRule.textContent = c.name === 'CNC machine tool' ? 'Clause 3.6 requires multipurpose manipulator; CNC is single-job' :
				(c.name === 'Chatbot' ? 'Physical situatedness required; not software only' :
				(c.name === 'Dishwasher' ? 'Fails clause 3.1 locomotion, manipulation or positioning' :
				(c.name === 'Piloted drone' ? 'Lacks autonomy: robotic device under clause 3.1 notes' : 'Meets ISO 8373 clause 3.1 criteria')));
			svg.appendChild(vBox);
			svg.appendChild(tVerdict);
			svg.appendChild(tRule);

			readout.textContent = c.name + ': ' + c.notes;
		}

		root.replaceChildren(frame('ISO 8373 edge-case machine classification', [
			h('p', { 'class': 'widget-note', text: 'Select candidate edge cases to test against ISO 8373 clause 3.1 criteria (programmed, actuated mechanism, degree of autonomy, locomotion/manipulation/positioning).' }),
			btnContainer,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- HC-SR04 ultrasonic distance calculation (lesson 6.1) ---------- */

	function initUltrasonicDistance(root) {
		var sEcho = slider('Echo pulse duration (t_echo)', 'us-echo', 100, 24000, 50, 1750, ' µs');
		var W = 380, H = 175;
		var svg = plotFrame(W, H, 'HC-SR04 ultrasonic echo time and distance calculation');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btn10 = button('10 cm target (583 µs)', function () { sEcho.input.value = 583; draw(); });
		var btn30 = button('30 cm target (1749 µs)', function () { sEcho.input.value = 1749; draw(); });
		var btn100 = button('100 cm target (5831 µs)', function () { sEcho.input.value = 5831; draw(); });
		var btnMin = button('2 cm min rating (117 µs)', function () { sEcho.input.value = 117; draw(); });
		var btnMax = button('400 cm max rating (23324 µs)', function () { sEcho.input.value = 23324; draw(); });

		var buttons = h('div', { 'class': 'widget-buttons' }, [btn10, btn30, btn100, btnMin, btnMax]);

		function draw() {
			var tEcho = Number(sEcho.input.value);
			sEcho.out.textContent = tEcho + ' µs';

			// Formula from lesson 6.1:
			// speed of sound in dry air at 20 °C = 343 m/s = 0.0343 cm/µs
			// distance_cm = (echo_time_microseconds * 0.0343) / 2.0
			var distCm = (tEcho * 0.0343) / 2.0;
			var rule58Cm = tEcho / 58.0;

			svg.replaceChildren();

			// HC-SR04 sensor body on left
			var body = s('rect', { 'class': 'd-box', x: 18, y: 46, width: 44, height: 64, rx: 4 });
			var tTrig = s('circle', { 'class': 'd-box-gold', cx: 40, cy: 62, r: 12 });
			var tEchoC = s('circle', { 'class': 'd-box', cx: 40, cy: 94, r: 12 });
			var lblSensor = s('text', { 'class': 'd-text', x: 40, y: 124, 'text-anchor': 'middle', 'font-size': '11px' });
			lblSensor.textContent = 'HC-SR04';
			var lblTxRx = s('text', { 'class': 'd-muted', x: 40, y: 38, 'text-anchor': 'middle', 'font-size': '11px' });
			lblTxRx.textContent = 'TX / RX';
			svg.appendChild(body);
			svg.appendChild(tTrig);
			svg.appendChild(tEchoC);
			svg.appendChild(lblSensor);
			svg.appendChild(lblTxRx);

			// Obstacle target position mapping (2 cm -> x=100, 400 cm -> x=340)
			var clampedDist = Math.max(2, Math.min(400, distCm));
			var targetX = 100 + ((clampedDist - 2) / 398) * 240;

			// Acoustic wave lines
			var waveFwd = s('line', {
				'class': 'd-strong',
				x1: 64, y1: 62, x2: targetX, y2: 62
			});
			svg.appendChild(waveFwd);

			var waveRet = s('line', {
				'class': 'd-line',
				'stroke-dasharray': '4 4',
				x1: targetX, y1: 94, x2: 64, y2: 94
			});
			svg.appendChild(waveRet);

			// Target block
			var targetBox = s('rect', {
				'class': 'd-box-gold',
				x: targetX, y: 40, width: 14, height: 76, rx: 2
			});
			var lblTarget = s('text', {
				'class': 'd-title',
				x: targetX + 7, y: 32, 'text-anchor': 'middle', 'font-size': '11px'
			});
			lblTarget.textContent = 'Target';
			svg.appendChild(targetBox);
			svg.appendChild(lblTarget);

			// Dimension line
			var dimLine = s('line', { 'class': 'd-line', x1: 64, y1: 146, x2: targetX, y2: 146 });
			var dMark1 = s('line', { 'class': 'd-line', x1: 64, y1: 140, x2: 64, y2: 152 });
			var dMark2 = s('line', { 'class': 'd-line', x1: targetX, y1: 140, x2: targetX, y2: 152 });
			var tDist = s('text', {
				'class': 'd-title',
				x: (64 + targetX) / 2, y: 142, 'text-anchor': 'middle', 'font-size': '12px'
			});
			tDist.textContent = 'd = ' + distCm.toFixed(1) + ' cm';
			svg.appendChild(dimLine);
			svg.appendChild(dMark1);
			svg.appendChild(dMark2);
			svg.appendChild(tDist);

			// Formula header
			var tForm = s('text', { 'class': 'd-muted', x: 190, y: 18, 'text-anchor': 'middle', 'font-size': '11px' });
			tForm.textContent = 'distance_cm = (echo_time_microseconds × 0.0343) / 2.0';
			svg.appendChild(tForm);

			// Warning text if out of range
			if (distCm < 2.0 || distCm > 400.0) {
				var tWarn = s('text', { 'class': 'd-title', x: 190, y: 168, 'text-anchor': 'middle', 'font-size': '11px' });
				tWarn.textContent = 'Outside rated 2 cm to 400 cm range: readings should not be trusted';
				svg.appendChild(tWarn);
			}

			readout.textContent = 'Echo time t = ' + tEcho + ' µs · Calculated distance = (' + tEcho + ' × 0.0343 cm/µs) / 2.0 = ' +
				distCm.toFixed(1) + ' cm (' + (distCm / 100).toFixed(3) + ' m) · Datasheet formula (t / 58): ' +
				rule58Cm.toFixed(1) + ' cm' +
				(distCm < 2.0 || distCm > 400.0 ? ' · [Outside HC-SR04 2 cm to 400 cm operating range]' : '');
		}

		sEcho.input.addEventListener('input', draw);

		root.replaceChildren(frame('HC-SR04 ultrasonic echo time and distance', [
			h('p', { 'class': 'widget-note', text: 'In dry air at 20 °C sound travels at 343 m/s (0.0343 cm/µs). Because the acoustic pulse travels out and back, distance is half of speed times echo time.' }),
			sEcho.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Gyroscope zero-rate bias drift (lesson 6.5) ---------- */

	function initGyroDrift(root) {
		var sBias = slider('Gyro zero-rate bias (b_gyro)', 'gd-bias', -2.0, 2.0, 0.1, 0.3, ' °/s');
		var sTime = slider('Elapsed time (t)', 'gd-time', 0, 300, 5, 100, ' s');

		var W = 380, H = 185;
		var svg = plotFrame(W, H, 'Accumulated heading drift from integrated gyroscope zero-rate bias');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnEx = button('Lesson example (0.3 °/s, 100 s)', function () {
			sBias.input.value = 0.3; sTime.input.value = 100; draw();
		});
		var btnZero = button('Zero bias (calibrated: 0 °/s)', function () {
			sBias.input.value = 0.0; draw();
		});
		var btnHigh = button('High bias (1.0 °/s, 60 s)', function () {
			sBias.input.value = 1.0; sTime.input.value = 60; draw();
		});
		var btnNeg = button('Negative bias (-0.3 °/s, 100 s)', function () {
			sBias.input.value = -0.3; sTime.input.value = 100; draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnEx, btnZero, btnHigh, btnNeg]);

		function draw() {
			var bias = Number(sBias.input.value);
			var t = Number(sTime.input.value);
			sBias.out.textContent = bias.toFixed(1) + ' °/s';
			sTime.out.textContent = t + ' s';

			// Formula from lesson 6.5:
			// Error_ψ(t) = b_gyro × t
			var errorDeg = bias * t;
			var finalHeading = (errorDeg % 360 + 360) % 360;

			svg.replaceChildren();

			// Compass dial on left
			var cx = 95, cy = 95, cr = 60;
			var dial = s('circle', { 'class': 'd-box', cx: cx, cy: cy, r: cr });
			var crossX = s('line', { 'class': 'd-line', 'stroke-dasharray': '2 3', x1: cx - cr, y1: cy, x2: cx + cr, y2: cy });
			var crossY = s('line', { 'class': 'd-line', 'stroke-dasharray': '2 3', x1: cx, y1: cy - cr, x2: cx, y2: cy + cr });
			svg.appendChild(dial);
			svg.appendChild(crossX);
			svg.appendChild(crossY);

			var tN = s('text', { 'class': 'd-muted', x: cx, y: cy - cr + 14, 'text-anchor': 'middle', 'font-size': '11px' }); tN.textContent = '0° (N)';
			var tE = s('text', { 'class': 'd-muted', x: cx + cr - 6, y: cy + 4, 'text-anchor': 'end', 'font-size': '11px' }); tE.textContent = '90°';
			var tS = s('text', { 'class': 'd-muted', x: cx, y: cy + cr - 6, 'text-anchor': 'middle', 'font-size': '11px' }); tS.textContent = '180°';
			var tW = s('text', { 'class': 'd-muted', x: cx - cr + 6, y: cy + 4, 'text-anchor': 'start', 'font-size': '11px' }); tW.textContent = '270°';
			svg.appendChild(tN); svg.appendChild(tE); svg.appendChild(tS); svg.appendChild(tW);

			// True heading line (straight up, 0°)
			var trueLine = s('line', {
				'class': 'd-line',
				'stroke-dasharray': '3 3',
				x1: cx, y1: cy, x2: cx, y2: cy - 54
			});
			svg.appendChild(trueLine);

			// Drifted heading pointer (clockwise angle from North = errorDeg)
			var rad = (errorDeg - 90) * Math.PI / 180;
			var hx = cx + 52 * Math.cos(rad);
			var hy = cy + 52 * Math.sin(rad);

			var driftLine = s('line', {
				'class': 'd-strong',
				x1: cx, y1: cy, x2: hx, y2: hy
			});
			var driftDot = s('circle', { 'class': 'd-box-gold', cx: hx, cy: hy, r: 4 });
			svg.appendChild(driftLine);
			svg.appendChild(driftDot);

			// Right summary card
			var rBox = s('rect', { 'class': 'd-box', x: 180, y: 22, width: 188, height: 145, rx: 4 });
			svg.appendChild(rBox);

			var tTitle = s('text', { 'class': 'd-title', x: 274, y: 44, 'text-anchor': 'middle', 'font-size': '12px' });
			tTitle.textContent = 'Heading Drift Math';
			var tF1 = s('text', { 'class': 'd-text', x: 274, y: 66, 'text-anchor': 'middle', 'font-size': '11px' });
			tF1.textContent = 'Error_ψ(t) = b_gyro × t';
			var tB = s('text', { 'class': 'd-muted', x: 274, y: 88, 'text-anchor': 'middle', 'font-size': '11px' });
			tB.textContent = 'Bias offset: ' + bias.toFixed(1) + ' °/s';
			var tT = s('text', { 'class': 'd-muted', x: 274, y: 106, 'text-anchor': 'middle', 'font-size': '11px' });
			tT.textContent = 'Elapsed time: ' + t + ' s';
			var tErr = s('text', { 'class': 'd-title', x: 274, y: 130, 'text-anchor': 'middle', 'font-size': '13px' });
			tErr.textContent = 'Error: ' + errorDeg.toFixed(1) + '°';
			var tComp = s('text', { 'class': 'd-muted', x: 274, y: 150, 'text-anchor': 'middle', 'font-size': '11px' });
			tComp.textContent = 'Computed yaw: ' + finalHeading.toFixed(1) + '°';

			svg.appendChild(tTitle);
			svg.appendChild(tF1);
			svg.appendChild(tB);
			svg.appendChild(tT);
			svg.appendChild(tErr);
			svg.appendChild(tComp);

			readout.textContent = 'b_gyro = ' + bias.toFixed(1) + '°/s · t = ' + t + ' s · Accumulated heading error = ' +
				bias.toFixed(1) + '°/s × ' + t + ' s = ' + errorDeg.toFixed(1) + '°' +
				(Math.abs(errorDeg) >= 360 ? ' (' + (errorDeg / 360).toFixed(1) + ' full turns)' : '') +
				'. In the lesson\'s example, after 100 seconds a bias of 0.3°/s produces a 30-degree heading error. Yaw has no gravity reference, so error accumulates indefinitely without external fusion.';
		}

		[sBias, sTime].forEach(function (ctrl) { ctrl.input.addEventListener('input', draw); });

		root.replaceChildren(frame('gyroscope zero-rate bias drift', [
			h('p', { 'class': 'widget-note', text: 'Small zero-rate bias offset in a MEMS gyroscope is integrated along with rotation rate. Integrating a constant offset gives an error that grows linearly with time: Error_ψ(t) = b_gyro × t.' }),
			sBias.row,
			sTime.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Jacobian singularity and joint speeds (lesson 6.10) ---------- */

	function initJacobianSingularity(root) {
		var sTheta2 = slider('Elbow joint angle (θ2)', 'js-theta2', 0, 180, 1, 45, '°');

		var W = 380, H = 195;
		var svg = plotFrame(W, H, '2R planar arm Jacobian determinant and joint speeds near singularity');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btn45 = button('45° (Lesson 1.6 pose)', function () { sTheta2.input.value = 45; draw(); });
		var btn10 = button('10° (82°/s, -192°/s)', function () { sTheta2.input.value = 10; draw(); });
		var btn5 = button('5° (164°/s, -383°/s)', function () { sTheta2.input.value = 5; draw(); });
		var btn1 = button('1° (821°/s, -1915°/s)', function () { sTheta2.input.value = 1; draw(); });
		var btn0 = button('0° (stretched singularity)', function () { sTheta2.input.value = 0; draw(); });
		var btn180 = button('180° (folded singularity)', function () { sTheta2.input.value = 180; draw(); });

		var buttons = h('div', { 'class': 'widget-buttons' }, [btn45, btn10, btn5, btn1, btn0, btn180]);

		var L1 = 0.4, L2 = 0.3; // Links from lesson 1.6 & 6.10

		function draw() {
			var th2Deg = Number(sTheta2.input.value);
			sTheta2.out.textContent = th2Deg + '°';

			var th2Rad = th2Deg * Math.PI / 180;
			var s2 = Math.sin(th2Rad);
			var c2 = Math.cos(th2Rad);

			// Formula from lesson 6.10:
			// det J = L1 · L2 · sin θ2 = 0.12 · sin θ2
			var detJ = L1 * L2 * s2;

			// FK at θ1 = 0
			var tipX = L1 + L2 * c2;
			var tipY = L2 * s2;
			var reachR = Math.sqrt(tipX * tipX + tipY * tipY);

			// Radial velocity components for v_r = 0.1 m/s along tool vector
			var vx = reachR > 0 ? 0.1 * (tipX / reachR) : 0.1;
			var vy = reachR > 0 ? 0.1 * (tipY / reachR) : 0;

			var th1DotDeg = null, th2DotDeg = null;
			if (Math.abs(detJ) > 0.0001) {
				var th1Dot = (L2 * c2 * vx + L2 * s2 * vy) / detJ;
				var th2Dot = (-(L1 + L2 * c2) * vx - L2 * s2 * vy) / detJ;
				th1DotDeg = th1Dot * 180 / Math.PI;
				th2DotDeg = th2Dot * 180 / Math.PI;
			}

			svg.replaceChildren();

			// Arm diagram: shoulder at (60, 135)
			var shX = 60, shY = 135;
			var scale = 250; // px per meter
			var elX = shX + L1 * scale; // Link 1 along x-axis (θ1 = 0)
			var elY = shY;
			var wrX = elX + L2 * scale * c2;
			var wrY = shY - L2 * scale * s2;

			// Draw link 1
			var link1 = s('line', { 'class': 'd-strong', x1: shX, y1: shY, x2: elX, y2: elY });
			// Draw link 2
			var link2 = s('line', { 'class': 'd-strong', x1: elX, y1: elY, x2: wrX, y2: wrY });
			svg.appendChild(link1);
			svg.appendChild(link2);

			// Joint circles
			var jShoulder = s('circle', { 'class': 'd-box', cx: shX, cy: shY, r: 6 });
			var jElbow = s('circle', { 'class': 'd-box', cx: elX, cy: elY, r: 5 });
			var jTool = s('circle', { 'class': 'd-box-gold', cx: wrX, cy: wrY, r: 6 });
			svg.appendChild(jShoulder);
			svg.appendChild(jElbow);
			svg.appendChild(jTool);

			// Labels on links
			var lblSh = s('text', { 'class': 'd-muted', x: shX, y: shY + 18, 'text-anchor': 'middle', 'font-size': '11px' });
			lblSh.textContent = 'Base (0,0)';
			var lblL1 = s('text', { 'class': 'd-muted', x: (shX + elX) / 2, y: shY - 8, 'text-anchor': 'middle', 'font-size': '11px' });
			lblL1.textContent = 'L1 = 0.4 m';
			var lblL2 = s('text', { 'class': 'd-muted', x: wrX + 6, y: wrY - 8, 'font-size': '11px' });
			lblL2.textContent = 'L2 = 0.3 m';
			svg.appendChild(lblSh);
			svg.appendChild(lblL1);
			svg.appendChild(lblL2);

			// Top math header
			var tDet = s('text', { 'class': 'd-title', x: 190, y: 22, 'text-anchor': 'middle', 'font-size': '12px' });
			tDet.textContent = 'det J = L1·L2·sin θ2 = 0.12 · sin(' + th2Deg + '°) = ' + detJ.toFixed(4) + ' m²';
			svg.appendChild(tDet);

			// Status banner
			var statBox = s('rect', {
				'class': (th2Deg === 0 || th2Deg === 180) ? 'd-box-gold' : 'd-box',
				x: 18, y: 152, width: 344, height: 36, rx: 4
			});
			svg.appendChild(statBox);

			var tStat = s('text', { 'class': 'd-title', x: 190, y: 168, 'text-anchor': 'middle', 'font-size': '11px' });
			var tSub = s('text', { 'class': 'd-muted', x: 190, y: 181, 'text-anchor': 'middle', 'font-size': '11px' });

			if (th2Deg === 0) {
				tStat.textContent = 'SINGULARITY (fully stretched, r = 0.7 m): det J = 0';
				tSub.textContent = 'Arm loses radial motion; cannot move outward or inward';
			} else if (th2Deg === 180) {
				tStat.textContent = 'SINGULARITY (fully folded, r = 0.1 m): det J = 0';
				tSub.textContent = 'Arm loses radial motion on inner workspace boundary';
			} else {
				tStat.textContent = 'Radial v = 0.1 m/s: θ̇1 ≈ ' + Math.round(th1DotDeg) + '°/s, θ̇2 ≈ ' + Math.round(th2DotDeg) + '°/s';
				tSub.textContent = 'Joint speeds grow like 1/θ2 as arm approaches singularity';
			}
			svg.appendChild(tStat);
			svg.appendChild(tSub);

			readout.textContent = 'θ2 = ' + th2Deg + '° · Reach r = ' + reachR.toFixed(3) + ' m · det J = ' + detJ.toFixed(4) + ' m².' +
				(th2Deg === 0 ? ' Fully stretched singularity: det J = 0, tool loses the radial direction of motion.' :
				(th2Deg === 180 ? ' Fully folded singularity: det J = 0, inner circle boundary of reach ring.' :
				' For radial speed 0.1 m/s: θ̇1 = ' + Math.round(th1DotDeg) + '°/s, θ̇2 = ' + Math.round(th2DotDeg) + '°/s (grows like 1/θ2 near singularity).'));
		}

		sTheta2.input.addEventListener('input', draw);

		root.replaceChildren(frame('Jacobian singularity and joint speed limits', [
			h('p', { 'class': 'widget-note', text: 'det J = L1·L2·sin θ2 tells whether joints can move the tool in every direction. At θ2 = 0° (fully stretched) or 180° (fully folded), det J = 0: the arm drops from two directions of motion to one.' }),
			sTheta2.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Lens f-number and aperture throughput (lesson 7.1) ---------- */

	function initFNumberAperture(root) {
		var STOPS = [
			{ name: 'f/1.4', val: 1.4, relThroughput: 1.0, relArea: '100% (1/1)', dof: 'Shallow (wide cone)' },
			{ name: 'f/2', val: 2.0, relThroughput: 0.5, relArea: '50% (1/2)', dof: 'Shallow' },
			{ name: 'f/2.8', val: 2.8, relThroughput: 0.25, relArea: '25% (1/4)', dof: 'Moderate' },
			{ name: 'f/4', val: 4.0, relThroughput: 0.125, relArea: '12.5% (1/8)', dof: 'Moderate' },
			{ name: 'f/5.6', val: 5.6, relThroughput: 0.0625, relArea: '6.25% (1/16)', dof: 'Moderate' },
			{ name: 'f/8', val: 8.0, relThroughput: 0.03125, relArea: '3.13% (1/32)', dof: 'Deep (narrow cone)' },
			{ name: 'f/11', val: 11.0, relThroughput: 0.015625, relArea: '1.56% (1/64)', dof: 'Deep' },
			{ name: 'f/16', val: 16.0, relThroughput: 0.0078125, relArea: '0.78% (1/128)', dof: 'Very deep' }
		];

		var curIdx = 5; // Default f/8
		var fLen = 50; // 50 mm focal length lens

		var W = 380, H = 185;
		var svg = plotFrame(W, H, 'Lens aperture diameter, area, and optical light throughput across f-number stops');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var stopButtons = STOPS.map(function (stop, idx) {
			return button(stop.name, function () {
				curIdx = idx;
				draw();
			});
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, stopButtons);

		function draw() {
			stopButtons.forEach(function (btn, idx) {
				btn.setAttribute('aria-pressed', String(idx === curIdx));
			});

			var stop = STOPS[curIdx];
			var diam = fLen / stop.val; // D = f / N

			svg.replaceChildren();

			// Lens barrel on left (center at 95, 95)
			var cx = 95, cy = 95, outerR = 60;
			var barrel = s('circle', { 'class': 'd-box', cx: cx, cy: cy, r: outerR });
			svg.appendChild(barrel);

			// Aperture iris opening
			var apR = outerR * (1.4 / stop.val);
			var irisOpening = s('circle', { 'class': 'd-box-gold', cx: cx, cy: cy, r: apR });
			svg.appendChild(irisOpening);

			// Iris blade lines
			for (var a = 0; a < 6; a++) {
				var ang = a * (Math.PI / 3);
				var bLine = s('line', {
					'class': 'd-line',
					x1: cx + apR * Math.cos(ang),
					y1: cy + apR * Math.sin(ang),
					x2: cx + outerR * Math.cos(ang + 0.4),
					y2: cy + outerR * Math.sin(ang + 0.4)
				});
				svg.appendChild(bLine);
			}

			var lblIris = s('text', { 'class': 'd-title', x: cx, y: cy - outerR - 6, 'text-anchor': 'middle', 'font-size': '13px' });
			lblIris.textContent = stop.name + ' Aperture';
			var lblD = s('text', { 'class': 'd-muted', x: cx, y: cy + outerR + 16, 'text-anchor': 'middle', 'font-size': '11px' });
			lblD.textContent = 'D = f / N = ' + diam.toFixed(1) + ' mm';
			svg.appendChild(lblIris);
			svg.appendChild(lblD);

			// Right comparison card
			var rBox = s('rect', { 'class': 'd-box', x: 180, y: 22, width: 188, height: 145, rx: 4 });
			svg.appendChild(rBox);

			var tH = s('text', { 'class': 'd-title', x: 274, y: 44, 'text-anchor': 'middle', 'font-size': '12px' });
			tH.textContent = 'Optical Throughput';
			var tForm = s('text', { 'class': 'd-muted', x: 274, y: 64, 'text-anchor': 'middle', 'font-size': '11px' });
			tForm.textContent = 'f-number N = f / D (f = 50 mm)';
			var tDiam = s('text', { 'class': 'd-text', x: 274, y: 86, 'text-anchor': 'middle', 'font-size': '11px' });
			tDiam.textContent = 'Aperture diameter: ' + diam.toFixed(1) + ' mm';
			var tArea = s('text', { 'class': 'd-title', x: 274, y: 108, 'text-anchor': 'middle', 'font-size': '12px' });
			tArea.textContent = 'Light throughput: ' + stop.relArea;
			var tDof = s('text', { 'class': 'd-muted', x: 274, y: 128, 'text-anchor': 'middle', 'font-size': '11px' });
			tDof.textContent = 'Depth of field: ' + stop.dof;
			var tStop = s('text', { 'class': 'd-muted', x: 274, y: 148, 'text-anchor': 'middle', 'font-size': '11px' });
			tStop.textContent = 'Each stop: ×√2 f-number, ÷2 light';

			svg.appendChild(tH);
			svg.appendChild(tForm);
			svg.appendChild(tDiam);
			svg.appendChild(tArea);
			svg.appendChild(tDof);
			svg.appendChild(tStop);

			readout.textContent = stop.name + ': Effective aperture diameter D = 50 mm / ' + stop.val + ' = ' + diam.toFixed(1) +
				' mm. Relative aperture area and light throughput = ' + stop.relArea + '. Depth of field is ' + stop.dof.toLowerCase() +
				'. Increasing the f-number by a factor of √2 halves the aperture area and reduces lens light throughput by a factor of two.';
		}

		root.replaceChildren(frame('f-number, aperture diameter, and light throughput', [
			h('p', { 'class': 'widget-note', text: 'The f-number of a lens is the ratio of its focal length to the effective aperture diameter. Increasing the f-number by √2 halves aperture area and cuts light throughput by a factor of 2.' }),
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Connected components presence and area check (lesson 7.5) ---------- */

	function initPresenceAreaCheck(root) {
		var sArea = slider('Observed CC_STAT_AREA', 'pa-area', 0, 7000, 100, 4500, ' px');

		var W = 380, H = 185;
		var svg = plotFrame(W, H, 'Connected component area CC_STAT_AREA classification against tolerance limits');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnNom = button('Nominal gasket (4,500 px)', function () { sArea.input.value = 4500; draw(); });
		var btnTorn = button('Torn gasket (2,500 px)', function () { sArea.input.value = 2500; draw(); });
		var btnMiss = button('Missing part (0 px)', function () { sArea.input.value = 0; draw(); });
		var btnOver = button('Oversize / flash (5,800 px)', function () { sArea.input.value = 5800; draw(); });
		var btnLow = button('Min limit (4,000 px)', function () { sArea.input.value = 4000; draw(); });
		var btnHigh = button('Max limit (5,000 px)', function () { sArea.input.value = 5000; draw(); });

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnNom, btnTorn, btnMiss, btnOver, btnLow, btnHigh]);

		// Lesson 7.5 limits:
		// min_expected_area = 4000 px, max_expected_area = 5000 px (nominal gasket: 4,500 px).
		// Observed component under 3,000 px indicates torn or missing gasket.
		var minArea = 4000, maxArea = 5000;

		function draw() {
			var area = Number(sArea.input.value);
			sArea.out.textContent = area + ' px';

			var isPass = (area >= minArea && area <= maxArea);
			var isTornOrMissing = (area < 3000);

			var verdict = isPass ? 'PASS' : 'REJECT';
			var reason = isPass ? 'Gasket present and within tolerance' :
				(area === 0 ? 'Missing part (0 px detected)' :
				(isTornOrMissing ? 'Torn or missing gasket (< 3,000 px)' :
				(area < minArea ? 'Under minimum area threshold' : 'Oversize component / excess flash')));

			svg.replaceChildren();

			// Left: Part visual representation
			var partBox = s('rect', { 'class': 'd-box', x: 15, y: 25, width: 145, height: 135, rx: 4 });
			svg.appendChild(partBox);

			var tPartH = s('text', { 'class': 'd-muted', x: 87, y: 44, 'text-anchor': 'middle', 'font-size': '11px' });
			tPartH.textContent = 'Inspected Component';
			svg.appendChild(tPartH);

			var cx = 87, cy = 92;
			if (area === 0) {
				var cross1 = s('line', { 'class': 'd-line', x1: cx - 24, y1: cy - 24, x2: cx + 24, y2: cy + 24 });
				var cross2 = s('line', { 'class': 'd-line', x1: cx - 24, y1: cy + 24, x2: cx + 24, y2: cy - 24 });
				var tNo = s('text', { 'class': 'd-title', x: cx, y: cy + 38, 'text-anchor': 'middle', 'font-size': '11px' });
				tNo.textContent = 'No component found';
				svg.appendChild(cross1); svg.appendChild(cross2); svg.appendChild(tNo);
			} else if (isPass) {
				var ringOuter = s('circle', { 'class': 'd-box-gold', cx: cx, cy: cy, r: 32 });
				var ringInner = s('circle', { 'class': 'd-box', cx: cx, cy: cy, r: 18 });
				var tOk = s('text', { 'class': 'd-title', x: cx, y: cy + 46, 'text-anchor': 'middle', 'font-size': '11px' });
				tOk.textContent = 'Intact gasket (4,500 px)';
				svg.appendChild(ringOuter); svg.appendChild(ringInner); svg.appendChild(tOk);
			} else if (area < minArea) {
				var brokenArc = s('path', {
					'class': 'd-strong',
					d: 'M ' + (cx - 28) + ' ' + (cy + 12) + ' A 32 32 0 1 1 ' + (cx + 28) + ' ' + (cy + 12)
				});
				var tTorn = s('text', { 'class': 'd-title', x: cx, y: cy + 46, 'text-anchor': 'middle', 'font-size': '11px' });
				tTorn.textContent = isTornOrMissing ? 'Torn gasket (< 3,000 px)' : 'Under min area';
				svg.appendChild(brokenArc); svg.appendChild(tTorn);
			} else {
				var ringOver = s('circle', { 'class': 'd-box-gold', cx: cx, cy: cy, r: 38 });
				var ringHole = s('circle', { 'class': 'd-box', cx: cx, cy: cy, r: 16 });
				var tOver = s('text', { 'class': 'd-title', x: cx, y: cy + 50, 'text-anchor': 'middle', 'font-size': '11px' });
				tOver.textContent = 'Oversize / excess flash';
				svg.appendChild(ringOver); svg.appendChild(ringHole); svg.appendChild(tOver);
			}

			// Right: Area bar and threshold limits
			var rBox = s('rect', { 'class': 'd-box', x: 172, y: 25, width: 194, height: 135, rx: 4 });
			svg.appendChild(rBox);

			var tRH = s('text', { 'class': 'd-title', x: 269, y: 44, 'text-anchor': 'middle', 'font-size': '12px' });
			tRH.textContent = 'CC_STAT_AREA Evaluation';
			svg.appendChild(tRH);

			// Bar scale: 0 to 7000 px maps to width 160 px (x0 = 188)
			var barX = 188, barW = 162, maxVal = 7000;
			var barY = 66;

			var barBg = s('rect', { 'class': 'd-box', x: barX, y: barY, width: barW, height: 12, rx: 2 });
			// Accept band [4000, 5000]
			var passX = barX + (minArea / maxVal) * barW;
			var passW = ((maxArea - minArea) / maxVal) * barW;
			var barPass = s('rect', { 'class': 'd-box-gold', x: passX, y: barY, width: passW, height: 12, rx: 2 });

			// Indicator marker for observed area
			var curX = barX + (Math.min(maxVal, area) / maxVal) * barW;
			var curMarker = s('line', { 'class': 'd-strong', x1: curX, y1: barY - 4, x2: curX, y2: barY + 16 });
			var curDot = s('circle', { 'class': isPass ? 'd-box-gold' : 'd-box', cx: curX, cy: barY - 6, r: 3 });

			svg.appendChild(barBg);
			svg.appendChild(barPass);
			svg.appendChild(curMarker);
			svg.appendChild(curDot);

			var lblL = s('text', { 'class': 'd-muted', x: passX, y: barY + 22, 'text-anchor': 'middle', 'font-size': '11px' });
			lblL.textContent = '4,000';
			var lblH = s('text', { 'class': 'd-muted', x: passX + passW, y: barY + 22, 'text-anchor': 'middle', 'font-size': '11px' });
			lblH.textContent = '5,000';
			svg.appendChild(lblL);
			svg.appendChild(lblH);

			// Verdict badge box
			var vBadge = s('rect', {
				'class': isPass ? 'd-box-gold' : 'd-box',
				x: 184, y: 104, width: 170, height: 44, rx: 4
			});
			var tVerdict = s('text', { 'class': 'd-title', x: 269, y: 122, 'text-anchor': 'middle', 'font-size': '13px' });
			tVerdict.textContent = verdict + ': ' + (isPass ? 'ACCEPT' : 'REJECT');
			var tSub = s('text', { 'class': 'd-muted', x: 269, y: 138, 'text-anchor': 'middle', 'font-size': '11px' });
			tSub.textContent = isPass ? 'Route part downstream' : 'Trigger robot reject routine';

			svg.appendChild(vBadge);
			svg.appendChild(tVerdict);
			svg.appendChild(tSub);

			readout.textContent = 'Observed CC_STAT_AREA = ' + area + ' px (expected: 4,500 px, tolerance: 4,000–5,000 px) · Verdict: ' +
				verdict + ' (' + reason + '). ' +
				(isPass ? 'Component passes presence check; robot continues regular cycle.' :
				'Observed area violates threshold limits, triggering an immediate robot reject routine.');
		}

		sArea.input.addEventListener('input', draw);

		root.replaceChildren(frame('connected components presence and area check', [
			h('p', { 'class': 'widget-note', text: 'OpenCV connectedComponentsWithStats outputs CC_STAT_AREA (component pixel area). If an expected 4,500 px gasket has an area under 3,000 px, it indicates a torn or missing gasket, triggering a reject routine.' }),
			sArea.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- EtherNet/IP implicit vs explicit messaging (lesson 8.2) ---------- */

	function initEthernetIpMessaging(root) {
		var mode = 'implicit'; // 'implicit' | 'explicit'
		var implicitSub = 'rpi'; // 'rpi' | 'cos'
		var explicitTask = 'fault'; // 'fault' | 'param' | 'firmware'

		var W = 380, H = 205;
		var svg = plotFrame(W, H, 'EtherNet/IP Implicit cyclic UDP versus Explicit acyclic TCP client-server messaging');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnImplicit = button('Implicit (Cyclic UDP I/O)', function () { mode = 'implicit'; draw(); });
		var btnExplicit = button('Explicit (Acyclic TCP Client-Server)', function () { mode = 'explicit'; draw(); });

		var btnSub1 = button('Requested Packet Interval (RPI)', function () { implicitSub = 'rpi'; draw(); });
		var btnSub2 = button('Change-of-State (COS)', function () { implicitSub = 'cos'; draw(); });
		var btnExpFault = button('Read Fault Log', function () { explicitTask = 'fault'; draw(); });
		var btnExpParam = button('Reconfigure Drive Param', function () { explicitTask = 'param'; draw(); });
		var btnExpFw = button('Query Firmware Version', function () { explicitTask = 'firmware'; draw(); });

		var subControls = h('div', { 'class': 'widget-buttons' });

		function draw() {
			btnImplicit.setAttribute('aria-pressed', String(mode === 'implicit'));
			btnExplicit.setAttribute('aria-pressed', String(mode === 'explicit'));

			subControls.replaceChildren();
			if (mode === 'implicit') {
				btnSub1.setAttribute('aria-pressed', String(implicitSub === 'rpi'));
				btnSub2.setAttribute('aria-pressed', String(implicitSub === 'cos'));
				subControls.appendChild(btnSub1);
				subControls.appendChild(btnSub2);
			} else {
				btnExpFault.setAttribute('aria-pressed', String(explicitTask === 'fault'));
				btnExpParam.setAttribute('aria-pressed', String(explicitTask === 'param'));
				btnExpFw.setAttribute('aria-pressed', String(explicitTask === 'firmware'));
				subControls.appendChild(btnExpFault);
				subControls.appendChild(btnExpParam);
				subControls.appendChild(btnExpFw);
			}

			svg.replaceChildren();

			// Header title
			var tH = s('text', { 'class': 'd-title', x: 190, y: 22, 'text-anchor': 'middle', 'font-size': '12px' });
			tH.textContent = mode === 'implicit' ? 'Implicit Messaging (UDP / Lightweight I/O)' : 'Explicit Messaging (TCP / Message Router)';
			svg.appendChild(tH);

			if (mode === 'implicit') {
				// Packet stack diagram
				// Eth, IP and UDP headers, then the I/O payload (no field sizes: the lesson gives none)
				var yP = 38, hP = 36;
				var bEth = s('rect', { 'class': 'd-box', x: 18, y: yP, width: 48, height: hP, rx: 2 });
				var tEth = s('text', { 'class': 'd-muted', x: 42, y: yP + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tEth.textContent = 'Eth';

				var bIp = s('rect', { 'class': 'd-box', x: 68, y: yP, width: 48, height: hP, rx: 2 });
				var tIp = s('text', { 'class': 'd-muted', x: 92, y: yP + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tIp.textContent = 'IP';

				var bUdp = s('rect', { 'class': 'd-box-gold', x: 118, y: yP, width: 50, height: hP, rx: 2 });
				var tUdp = s('text', { 'class': 'd-title', x: 143, y: yP + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tUdp.textContent = 'UDP';

				var bData = s('rect', { 'class': 'd-box-gold', x: 170, y: yP, width: 146, height: hP, rx: 2 });
				var tData = s('text', { 'class': 'd-title', x: 243, y: yP + 18, 'text-anchor': 'middle', 'font-size': '11px' }); tData.textContent = 'Pure I/O Payload';
				var tDataSub = s('text', { 'class': 'd-muted', x: 243, y: yP + 30, 'text-anchor': 'middle', 'font-size': '11px' }); tDataSub.textContent = '(no protocol headers)';

				var bFcs = s('rect', { 'class': 'd-box', x: 318, y: yP, width: 44, height: hP, rx: 2 });
				var tFcs = s('text', { 'class': 'd-muted', x: 340, y: yP + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tFcs.textContent = '';

				svg.appendChild(bEth); svg.appendChild(tEth);
				svg.appendChild(bIp); svg.appendChild(tIp);
				svg.appendChild(bUdp); svg.appendChild(tUdp);
				svg.appendChild(bData); svg.appendChild(tData); svg.appendChild(tDataSub);
				svg.appendChild(bFcs); svg.appendChild(tFcs);

				// Description Card
				var card = s('rect', { 'class': 'd-box', x: 18, y: 88, width: 344, height: 104, rx: 4 });
				svg.appendChild(card);

				var tC1 = s('text', { 'class': 'd-title', x: 28, y: 108, 'font-size': '12px' });
				tC1.textContent = 'Transport: UDP (User Datagram Protocol)';
				var tC2 = s('text', { 'class': 'd-text', x: 28, y: 126, 'font-size': '11px' });
				tC2.textContent = 'Connection established at startup: scanner and adapter';
				var tC3 = s('text', { 'class': 'd-muted', x: 28, y: 144, 'font-size': '11px' });
				tC3.textContent = 'Offsets pre-understood: no protocol decoding headers required';
				var tC4 = s('text', { 'class': 'd-title', x: 28, y: 164, 'font-size': '11px' });
				tC4.textContent = implicitSub === 'cos' ?
					'Mode: Change-of-State (COS) - transmits immediately upon transition' :
					'Mode: Requested Packet Interval (RPI) - regular cyclic production';
				var tC5 = s('text', { 'class': 'd-muted', x: 28, y: 182, 'font-size': '11px' });
				tC5.textContent = 'Purpose: Deterministic real-time I/O control for robotics & PLCs';

				svg.appendChild(tC1); svg.appendChild(tC2); svg.appendChild(tC3); svg.appendChild(tC4); svg.appendChild(tC5);

				readout.textContent = 'Implicit Messaging in EtherNet/IP: Time-critical connected communication that transports I/O data using UDP without embedded protocol headers. Both scanner (PLC) and adapter (robot) understand byte offsets beforehand. Data produced at the Requested Packet Interval (RPI) or on Change of State (COS) for fast cyclic control.';
			} else {
				// Explicit Packet stack diagram
				// Eth (34), IP (34), TCP (36), Encap (44), CIP Router Header (120), Data (42), FCS (34)
				var yP2 = 38, hP2 = 36;
				var bEth2 = s('rect', { 'class': 'd-box', x: 16, y: yP2, width: 34, height: hP2, rx: 2 });
				var tEth2 = s('text', { 'class': 'd-muted', x: 33, y: yP2 + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tEth2.textContent = 'Eth';

				var bIp2 = s('rect', { 'class': 'd-box', x: 52, y: yP2, width: 34, height: hP2, rx: 2 });
				var tIp2 = s('text', { 'class': 'd-muted', x: 69, y: yP2 + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tIp2.textContent = 'IP';

				var bTcp = s('rect', { 'class': 'd-box-gold', x: 88, y: yP2, width: 36, height: hP2, rx: 2 });
				var tTcp = s('text', { 'class': 'd-title', x: 106, y: yP2 + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tTcp.textContent = 'TCP';

				var bEnc = s('rect', { 'class': 'd-box', x: 126, y: yP2, width: 44, height: hP2, rx: 2 });
				var tEnc = s('text', { 'class': 'd-muted', x: 148, y: yP2 + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tEnc.textContent = '';

				var bCip = s('rect', { 'class': 'd-box-gold', x: 172, y: yP2, width: 120, height: hP2, rx: 2 });
				var tCip = s('text', { 'class': 'd-title', x: 232, y: yP2 + 18, 'text-anchor': 'middle', 'font-size': '11px' }); tCip.textContent = 'Message Router';
				var tCipSub = s('text', { 'class': 'd-muted', x: 232, y: yP2 + 30, 'text-anchor': 'middle', 'font-size': '11px' }); tCipSub.textContent = 'Service|Class|Inst|Attr';

				var bData2 = s('rect', { 'class': 'd-box', x: 294, y: yP2, width: 36, height: hP2, rx: 2 });
				var tData2 = s('text', { 'class': 'd-muted', x: 312, y: yP2 + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tData2.textContent = 'Data';

				var bFcs2 = s('rect', { 'class': 'd-box', x: 332, y: yP2, width: 32, height: hP2, rx: 2 });
				var tFcs2 = s('text', { 'class': 'd-muted', x: 348, y: yP2 + 22, 'text-anchor': 'middle', 'font-size': '11px' }); tFcs2.textContent = '';

				svg.appendChild(bEth2); svg.appendChild(tEth2);
				svg.appendChild(bIp2); svg.appendChild(tIp2);
				svg.appendChild(bTcp); svg.appendChild(tTcp);
				svg.appendChild(bEnc); svg.appendChild(tEnc);
				svg.appendChild(bCip); svg.appendChild(tCip); svg.appendChild(tCipSub);
				svg.appendChild(bData2); svg.appendChild(tData2);
				svg.appendChild(bFcs2); svg.appendChild(tFcs2);

				// Description Card
				var card2 = s('rect', { 'class': 'd-box', x: 18, y: 88, width: 344, height: 104, rx: 4 });
				svg.appendChild(card2);

				var tE1 = s('text', { 'class': 'd-title', x: 28, y: 108, 'font-size': '12px' });
				tE1.textContent = 'Transport: TCP (Transmission Control Protocol)';
				var tE2 = s('text', { 'class': 'd-text', x: 28, y: 126, 'font-size': '11px' });
				tE2.textContent = 'Addressed to: Message Router object (request-reply client-server)';
				var tE3 = s('text', { 'class': 'd-muted', x: 28, y: 144, 'font-size': '11px' });
				tE3.textContent = 'Headers: explicit Service, Class ID, Instance ID, Attribute ID';
				var tE4 = s('text', { 'class': 'd-title', x: 28, y: 164, 'font-size': '11px' });
				tE4.textContent = explicitTask === 'fault' ? 'Selected task: Reading fault logs (acyclic diagnostic query)' :
					(explicitTask === 'param' ? 'Selected task: Reconfiguring drive parameters (acyclic setting)' :
					'Selected task: Querying firmware version (acyclic identification)');
				var tE5 = s('text', { 'class': 'd-muted', x: 28, y: 182, 'font-size': '11px' });
				tE5.textContent = 'Features: Reliable delivery through point-to-point connections with error retries';

				svg.appendChild(tE1); svg.appendChild(tE2); svg.appendChild(tE3); svg.appendChild(tE4); svg.appendChild(tE5);

				readout.textContent = 'Explicit Messaging in EtherNet/IP: Request-reply client-server transactions over TCP addressed to the Message Router object. Includes explicit descriptions of requested Service, Object Class, Instance number, and Attribute identifier with TCP error checking and retries for acyclic parameter/diagnostic tasks.';
			}
		}

		var mainButtons = h('div', { 'class': 'widget-buttons' }, [btnImplicit, btnExplicit]);

		root.replaceChildren(frame('EtherNet/IP implicit vs explicit messaging', [
			h('p', { 'class': 'widget-note', text: 'EtherNet/IP separates communications into Implicit messaging (lightweight cyclic UDP for I/O data without embedded headers) and Explicit messaging (acyclic TCP client-server transactions addressed to the Message Router).' }),
			mainButtons,
			subControls,
			svg,
			readout
		]));

		draw();
	}

	/* ---------- Field-of-view calculator from lesson 7.1 ---------- */

	function initFov(root) {
		var sw = slider('Sensor width H', 'fov-h', 3, 36, 0.1, 8.8, ' mm');
		var fl = slider('Focal length f', 'fov-f', 4, 100, 1, 35, ' mm');
		var wd = slider('Working distance WD', 'fov-wd', 50, 2000, 10, 500, ' mm');
		var svg = plotFrame(380, 190, 'Field of view sketch');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		function draw() {
			var H = Number(sw.input.value), f = Number(fl.input.value), D = Number(wd.input.value);
			sw.out.textContent = H + ' mm';
			fl.out.textContent = f + ' mm';
			wd.out.textContent = D + ' mm';
			var afov = 2 * Math.atan(H / (2 * f)) * 180 / Math.PI;
			var fov = 2 * D * Math.tan(afov * Math.PI / 360);
			var a = afov.toFixed(1), fv = Math.round(fov);
			svg.setAttribute('aria-label', 'Field of view sketch, not to scale: sensor width ' + H + ' mm, focal length ' + f +
				' mm, working distance ' + D + ' mm give an angular field of view of ' + a + ' degrees and a field of view of ' + fv + ' mm.');
			svg.replaceChildren();
			var cy = 90, lx = 120, ox = 330;
			// object plane and FOV extent (schematic)
			svg.appendChild(s('line', { 'class': 'd-line', x1: ox, y1: cy - 62, x2: ox, y2: cy + 62 }));
			svg.appendChild(s('line', { 'class': 'd-strong', x1: ox + 14, y1: cy - 60, x2: ox + 14, y2: cy + 60 }));
			// rays through the lens centre to the object plane edges
			svg.appendChild(s('line', { 'class': 'd-line', x1: lx, y1: cy, x2: ox, y2: cy - 60 }));
			svg.appendChild(s('line', { 'class': 'd-line', x1: lx, y1: cy, x2: ox, y2: cy + 60 }));
			svg.appendChild(s('line', { 'class': 'd-line', x1: 50, y1: cy - 18, x2: lx, y2: cy, 'stroke-dasharray': '3 3' }));
			svg.appendChild(s('line', { 'class': 'd-line', x1: 50, y1: cy + 18, x2: lx, y2: cy, 'stroke-dasharray': '3 3' }));
			// sensor
			svg.appendChild(s('rect', { 'class': 'd-box-gold', x: 42, y: cy - 18, width: 8, height: 36 }));
			// lens
			svg.appendChild(s('ellipse', { 'class': 'd-box', cx: lx, cy: cy, rx: 7, ry: 28 }));
			// AFOV arc
			svg.appendChild(s('path', { 'class': 'd-strong', d: 'M ' + (lx + 38) + ' ' + (cy - 12) + ' A 40 40 0 0 1 ' + (lx + 38) + ' ' + (cy + 12) }));
			var t;
			t = s('text', { 'class': 'd-title', x: lx + 46, y: cy + 4, 'font-size': '13' }); t.textContent = 'AFOV ' + a + '°'; svg.appendChild(t);
			t = s('text', { 'class': 'd-title', x: ox + 8, y: cy - 66, 'text-anchor': 'end', 'font-size': '13' }); t.textContent = 'FOV ' + fv + ' mm'; svg.appendChild(t);
			t = s('text', { 'class': 'd-muted', x: 46, y: cy + 36, 'text-anchor': 'middle' }); t.textContent = 'Sensor H'; svg.appendChild(t);
			t = s('text', { 'class': 'd-muted', x: lx, y: cy - 36, 'text-anchor': 'middle' }); t.textContent = 'Lens f'; svg.appendChild(t);
			svg.appendChild(s('line', { 'class': 'd-line', x1: lx, y1: cy + 74, x2: ox, y2: cy + 74 }));
			t = s('text', { 'class': 'd-muted', x: (lx + ox) / 2, y: cy + 90, 'text-anchor': 'middle' }); t.textContent = 'WD ' + D + ' mm (not to scale)'; svg.appendChild(t);
			readout.textContent = 'AFOV = 2·atan(H / 2f) = 2·atan(' + H + ' / ' + (2 * f) + ') = ' + a + '°. FOV = 2·WD·tan(AFOV / 2) = ' +
				fv + ' mm (the same as H·WD / f).';
		}
		[sw, fl, wd].forEach(function (c) { c.input.addEventListener('input', draw); });
		root.replaceChildren(frame('field of view', [
			sw.row, fl.row, wd.row, svg, readout,
			h('p', { 'class': 'widget-note', text: 'Paraxial approximation: confirm with the lens datasheet.' })
		]));
		draw();
	}

	/* ---------- VLANs: access ports and a trunk port from lesson 8.6 ---------- */

	function initVlan(root) {
		var trunk = false;
		var svg = plotFrame(380, 262, 'VLAN diagram');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
		var bAcc = button('Access ports', function () { trunk = false; draw(); });
		var bTrk = button('Trunk port', function () { trunk = true; draw(); });

		function txt(cls, x, y, str, anchor, size) {
			var t = s('text', { 'class': cls, x: x, y: y });
			if (anchor) t.setAttribute('text-anchor', anchor);
			if (size) t.setAttribute('font-size', size);
			t.textContent = str;
			svg.appendChild(t);
		}
		function draw() {
			bAcc.setAttribute('aria-pressed', String(!trunk));
			bTrk.setAttribute('aria-pressed', String(trunk));
			svg.replaceChildren();
			// devices
			svg.appendChild(s('rect', { 'class': 'd-box', x: 10, y: 8, width: 130, height: 40, rx: 4 }));
			txt('d-title', 75, 24, 'Robot controller', 'middle', '12');
			txt('d-muted', 75, 40, 'motion traffic', 'middle');
			svg.appendChild(s('rect', { 'class': 'd-box-gold', x: 240, y: 8, width: 130, height: 40, rx: 4 }));
			txt('d-title', 305, 24, 'HMI', 'middle', '12');
			txt('d-muted', 305, 40, 'display traffic', 'middle');
			// managed switch with two VLANs inside
			svg.appendChild(s('rect', { 'class': 'd-box', x: 40, y: 90, width: 300, height: 80, rx: 4 }));
			txt('d-muted', 190, 105, 'Managed switch', 'middle');
			svg.appendChild(s('rect', { 'class': 'd-box', x: 55, y: 115, width: 130, height: 45, rx: 4 }));
			txt('d-title', 120, 142, 'VLAN 20', 'middle', '13');
			svg.appendChild(s('rect', { 'class': 'd-box-gold', x: 195, y: 115, width: 130, height: 45, rx: 4 }));
			txt('d-title', 260, 142, 'VLAN 30', 'middle', '13');
			// access ports
			svg.appendChild(s('line', { 'class': 'd-strong', x1: 75, y1: 48, x2: 75, y2: 115 }));
			svg.appendChild(s('line', { stroke: 'var(--wp-gold-text)', 'stroke-width': 2.5, fill: 'none', x1: 305, y1: 48, x2: 305, y2: 115 }));
			txt('d-muted', 82, 72, 'access: VLAN 20');
			txt('d-muted', 298, 72, 'access: VLAN 30', 'end');
			if (trunk) {
				svg.appendChild(s('rect', { 'class': 'd-box', x: 110, y: 214, width: 160, height: 38, rx: 4 }));
				txt('d-title', 190, 237, 'Other switch', 'middle', '12');
				svg.appendChild(s('line', { 'class': 'd-strong', x1: 180, y1: 170, x2: 180, y2: 214 }));
				svg.appendChild(s('line', { stroke: 'var(--wp-gold-text)', 'stroke-width': 2.5, fill: 'none', x1: 200, y1: 170, x2: 200, y2: 214 }));
				txt('d-title', 212, 188, 'Trunk port (uplink)', 'start', '12');
				txt('d-muted', 212, 204, 'VLAN 20 + VLAN 30, tagged');
			}
			var label = trunk
				? 'Trunk view. The robot controller is on an access port in VLAN 20 and the HMI on an access port in VLAN 30. An uplink port to another switch is a trunk that carries both VLAN 20 and VLAN 30, tagged.'
				: 'Access ports view. The robot controller is on an access port that carries only VLAN 20 and the HMI on an access port that carries only VLAN 30. The two VLANs are separate broadcast domains on the same switch.';
			svg.setAttribute('aria-label', label);
			readout.textContent = trunk
				? 'A trunk carries several VLANs. If a device can talk a port into becoming a trunk, it can reach VLANs it should not see, so device ports stay static access ports.'
				: 'Each device’s access port carries only its own VLAN. VLAN 20 and VLAN 30 are separate broadcast domains on the same switch.';
		}
		root.replaceChildren(frame('VLANs on one switch', [
			h('div', { 'class': 'widget-buttons' }, [bAcc, bTrk]), svg, readout
		]));
		draw();
	}

/* ==========================================================================
   3D engine for robot-arm-3d (1.3) and amr-frames-3d (10.1). No libraries: a perspective
   camera, painter's sort per solid with back-face culling, and fixed layers (floor, shadows,
   solids, labels). The camera is always above the floor, so nothing drawn on the floor can
   cover a solid, and labels are placed last so they stay readable.
   ========================================================================== */

var DEG2RAD = Math.PI / 180;
var REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

function add3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function scale3(v, k) { return [v[0] * k, v[1] * k, v[2] * k]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function lerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function norm3(v) {
	var len = Math.hypot(v[0], v[1], v[2]);
	return len > 1e-9 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 1];
}
function wrapDeg(a) { a = ((a + 180) % 360 + 360) % 360 - 180; return a; }
function wrapRad(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
function clampN(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function signed(v, digits) { return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(digits); }

function shadeHex(hex, factor) {
	if (!hex || hex.charAt(0) !== '#') return hex;
	var c = hex.slice(1);
	if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
	var num = parseInt(c, 16);
	var r = clampN(Math.round(((num >> 16) & 255) * factor), 0, 255);
	var g = clampN(Math.round(((num >> 8) & 255) * factor), 0, 255);
	var b = clampN(Math.round((num & 255) * factor), 0, 255);
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}

/* True when the widget sits on a dark background (either the dark theme or the OS setting). */
function isDarkWidget(node) {
	var bg = getComputedStyle(node).getPropertyValue('--wp-bg-subtle').trim();
	var m = /^#([0-9a-f]{6})$/i.exec(bg);
	if (!m) return false;
	var n = parseInt(m[1], 16);
	return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 110;
}

function createCamera3D(target, dist, focal, az, el) {
	var cam = { target: target.slice(), dist: dist, focal: focal, azimuth: az, elevation: el,
		minDist: dist * 0.45, maxDist: dist * 2.2, minEl: 5, maxEl: 89 };
	cam.home = { azimuth: az, elevation: el, dist: dist };
	return cam;
}

/* Camera axes in world coordinates. Azimuth turns about world Z; elevation lifts the camera
   above the floor and tilts it down towards the target. */
function cameraBasis(cam) {
	var key = cam.azimuth + ',' + cam.elevation + ',' + cam.dist + ',' + cam.target.join(',');
	if (cam.b && cam.b.key === key) return cam.b;
	var a = cam.azimuth * DEG2RAD, e = cam.elevation * DEG2RAD;
	var ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(e), se = Math.sin(e);
	var forward = [-sa * ce, ca * ce, -se];
	cam.b = {
		key: key,
		right: [ca, sa, 0],
		up: [-sa * se, ca * se, ce],
		forward: forward,
		pos: sub3(cam.target, scale3(forward, cam.dist))
	};
	return cam.b;
}

function projectPoint3D(p, cam, W, H) {
	var b = cameraBasis(cam), d = sub3(p, cam.target);
	var cz = dot3(d, b.forward) + cam.dist;
	if (cz < 0.05) cz = 0.05;
	return { u: W * 0.5 + cam.focal * dot3(d, b.right) / cz, v: H * 0.5 - cam.focal * dot3(d, b.up) / cz, depth: cz };
}

/* The world point on the horizontal plane z = z0 under a viewBox pixel, or null if the ray misses it. */
function unprojectToPlane(u, v, cam, W, H, z0) {
	var b = cameraBasis(cam);
	var dir = add3(b.forward, add3(scale3(b.right, (u - W * 0.5) / cam.focal), scale3(b.up, -(v - H * 0.5) / cam.focal)));
	if (Math.abs(dir[2]) < 1e-6) return null;
	var t = ((z0 || 0) - b.pos[2]) / dir[2];
	return t > 0 ? add3(b.pos, scale3(dir, t)) : null;
}

/* Screen-plane drag (viewBox pixels) to a world displacement at a given depth. */
function screenDeltaToWorld(du, dv, depth, cam) {
	var b = cameraBasis(cam), k = depth / cam.focal;
	return add3(scale3(b.right, du * k), scale3(b.up, -dv * k));
}

function newScene3D(cam, W, H, light) {
	return { cam: cam, W: W, H: H, light: light, floor: [], shadow: [], items: [], labels: [] };
}

function pr3(sc, p) { return projectPoint3D(p, sc.cam, sc.W, sc.H); }

/* layer: 'floor' (drawn first, in order), 'shadow', or default (depth-sorted solids). */
function line3D(sc, p1, p2, attrs, layer) {
	var a = pr3(sc, p1), b = pr3(sc, p2);
	var node = s('line', Object.assign({ x1: a.u.toFixed(1), y1: a.v.toFixed(1), x2: b.u.toFixed(1), y2: b.v.toFixed(1) }, attrs));
	if (layer === 'floor') sc.floor.push(node);
	else sc.items.push({ depth: (a.depth + b.depth) * 0.5 + ((attrs && attrs.depthBias) || 0), nodes: [node] });
}

function polyline3D(sc, points, attrs, layer) {
	if (points.length < 2) return;
	var str = points.map(function (p) { var q = pr3(sc, p); return q.u.toFixed(1) + ',' + q.v.toFixed(1); }).join(' ');
	var node = s('polyline', Object.assign({ points: str, fill: 'none' }, attrs));
	(layer === 'shadow' ? sc.shadow : sc.floor).push(node);
}

function dot3D(sc, p, r, attrs, depthBias) {
	var q = pr3(sc, p);
	sc.items.push({ depth: q.depth + (depthBias || 0), nodes: [s('circle', Object.assign({ cx: q.u.toFixed(1), cy: q.v.toFixed(1), r: r }, attrs))] });
}

/* One face. Returns an SVG node, or null when culled (facing away from the camera). */
function face3D(sc, pts, fill, opts) {
	opts = opts || {};
	var n = norm3(cross3(sub3(pts[1], pts[0]), sub3(pts[2], pts[0])));
	if (opts.cull && dot3(n, sub3(cameraBasis(sc.cam).pos, pts[0])) <= 0) return null;
	var col = fill;
	if (sc.light && fill && fill.charAt(0) === '#' && opts.shade !== false) {
		var diff = Math.max(0, dot3(n, sc.light));
		var viewDir = norm3(sub3(cameraBasis(sc.cam).pos, pts[0]));
		var rim = Math.pow(1 - Math.max(0, dot3(n, viewDir)), 2) * 0.14;
		col = shadeHex(fill, 0.46 + 0.56 * diff + rim + (opts.boost || 0));
	}
	var str = pts.map(function (p) { var q = pr3(sc, p); return q.u.toFixed(1) + ',' + q.v.toFixed(1); }).join(' ');
	var a = { points: str, fill: col };
	if (opts.solid) {
		a.stroke = opts.edge ? (fill && fill.charAt(0) === '#' ? shadeHex(fill, 0.42) : col) : col;
		a['stroke-width'] = opts.edge ? '0.8' : '0.8';
		a['stroke-linejoin'] = 'round';
	}
	return s('polygon', Object.assign(a, opts.attrs || {}));
}

/* A convex solid: its visible faces are pushed as one depth-sorted group. */
function solid3D(sc, faces, fill, centre, opts) {
	opts = opts || {};
	var wire = !!opts.attrs;
	var nodes = [];
	faces.forEach(function (f) {
		var node = face3D(sc, f.pts, f.fill || fill, {
			cull: opts.cull !== undefined ? opts.cull : !wire,
			solid: !wire,
			edge: opts.edge,
			boost: f.boost,
			attrs: opts.attrs,
			shade: opts.shade !== undefined ? opts.shade : !wire
		});
		if (node) nodes.push(node);
	});
	if (nodes.length) sc.items.push({ depth: pr3(sc, centre).depth + (opts.depthBias || 0), nodes: nodes });
}

function boxFaces(center, size, yawRad) {
	var hx = size[0] * 0.5, hy = size[1] * 0.5, hz = size[2] * 0.5;
	var c = Math.cos(yawRad || 0), sn = Math.sin(yawRad || 0);
	function tf(lx, ly, lz) { return [center[0] + lx * c - ly * sn, center[1] + lx * sn + ly * c, center[2] + lz]; }
	var p0 = tf(-hx, -hy, -hz), p1 = tf(hx, -hy, -hz), p2 = tf(hx, hy, -hz), p3 = tf(-hx, hy, -hz);
	var p4 = tf(-hx, -hy, hz), p5 = tf(hx, -hy, hz), p6 = tf(hx, hy, hz), p7 = tf(-hx, hy, hz);
	return {
		faces: [
			{ pts: [p0, p3, p2, p1] }, { pts: [p4, p5, p6, p7], boost: 0.06 },
			{ pts: [p0, p1, p5, p4] }, { pts: [p2, p3, p7, p6] },
			{ pts: [p3, p0, p4, p7] }, { pts: [p1, p2, p6, p5] }
		],
		footprint: [p0, p1, p2, p3]
	};
}

function box3D(sc, center, size, yawRad, fill, opts) {
	var bx = boxFaces(center, size, yawRad);
	solid3D(sc, bx.faces, fill, center, opts);
	if (opts && opts.shadow) shadowPoly3D(sc, bx.footprint);
}

/* Extrude a CCW 2D polygon [[x,y], ...] between zMin and zMax into a 3D solid. */
function extrudePoly3D(sc, poly2d, zMin, zMax, fill, opts) {
	opts = opts || {};
	var n = poly2d.length;
	if (n < 3) return;
	var cx = 0, cy = 0;
	var bot = [], top = [];
	for (var i = 0; i < n; i++) {
		cx += poly2d[i][0]; cy += poly2d[i][1];
		bot.push([poly2d[i][0], poly2d[i][1], zMin]);
		top.push([poly2d[i][0], poly2d[i][1], zMax]);
	}
	var faces = [];
	for (var j = 0; j < n; j++) {
		var k = (j + 1) % n;
		faces.push({ pts: [bot[j], bot[k], top[k], top[j]] });
	}
	faces.push({ pts: top, boost: 0.06 });
	faces.push({ pts: bot.slice().reverse() });
	solid3D(sc, faces, fill, [cx / n, cy / n, (zMin + zMax) * 0.5], opts);
	if (opts.shadow) shadowPoly3D(sc, bot);
}

/* A box whose local axes are given (for parts that follow the tool frame). */
function orientedBox3D(sc, center, half, ax, fill, opts) {
	function tf(a, b, c) { return add3(center, add3(scale3(ax.x, a * half[0]), add3(scale3(ax.y, b * half[1]), scale3(ax.z, c * half[2])))); }
	var p0 = tf(-1, -1, -1), p1 = tf(1, -1, -1), p2 = tf(1, 1, -1), p3 = tf(-1, 1, -1);
	var p4 = tf(-1, -1, 1), p5 = tf(1, -1, 1), p6 = tf(1, 1, 1), p7 = tf(-1, 1, 1);
	solid3D(sc, [{ pts: [p0, p3, p2, p1] }, { pts: [p4, p5, p6, p7] }, { pts: [p0, p1, p5, p4] },
		{ pts: [p2, p3, p7, p6] }, { pts: [p3, p0, p4, p7] }, { pts: [p1, p2, p6, p5] }], fill, center, opts);
}

function taperedCylinder3D(sc, pBase, pTop, rBase, rTop, fill, opts) {
	opts = opts || {};
	var nSeg = opts.segments || 14;
	var zAxis = norm3(sub3(pTop, pBase));
	var upv = Math.abs(zAxis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
	var xAxis = norm3(cross3(upv, zAxis)), yAxis = cross3(zAxis, xAxis);
	var bottom = [], top = [];
	for (var i = 0; i < nSeg; i++) {
		var th = (i / nSeg) * 2 * Math.PI;
		var ux = Math.cos(th), uy = Math.sin(th);
		var dir = add3(scale3(xAxis, ux), scale3(yAxis, uy));
		bottom.push(add3(pBase, scale3(dir, rBase)));
		top.push(add3(pTop, scale3(dir, rTop)));
	}
	var faces = [];
	for (var j = 0; j < nSeg; j++) {
		var k = (j + 1) % nSeg;
		faces.push({ pts: [bottom[j], bottom[k], top[k], top[j]] });
	}
	if (rTop > 1e-4) faces.push({ pts: top, boost: 0.08 });
	if (rBase > 1e-4) faces.push({ pts: bottom.slice().reverse() });
	solid3D(sc, faces, fill, lerp3(pBase, pTop, 0.5), opts);
	if (opts.shadow) {
		if (Math.abs(zAxis[2]) > 0.95) shadowPoly3D(sc, bottom);
		else shadowSegment3D(sc, pBase, pTop, Math.max(rBase, rTop));
	}
}

function cylinder3D(sc, pBase, pTop, radius, fill, opts) {
	taperedCylinder3D(sc, pBase, pTop, radius, radius, fill, opts);
}

/* Shadows: straight down onto the floor, merged into one translucent layer. */
function shadowPoly3D(sc, pts) {
	var str = pts.map(function (p) { var q = pr3(sc, [p[0], p[1], 0]); return q.u.toFixed(1) + ',' + q.v.toFixed(1); }).join(' ');
	sc.shadow.push(s('polygon', { points: str }));
}
function shadowSegment3D(sc, p1, p2, radius) {
	var a = pr3(sc, [p1[0], p1[1], 0]), b = pr3(sc, [p2[0], p2[1], 0]);
	var wpx = 2 * radius * sc.cam.focal / ((a.depth + b.depth) * 0.5);
	sc.shadow.push(s('line', { x1: a.u.toFixed(1), y1: a.v.toFixed(1), x2: b.u.toFixed(1), y2: b.v.toFixed(1),
		'stroke-width': wpx.toFixed(1), 'stroke-linecap': 'round' }));
}

/* Labels are placed after all geometry, nudged so they do not overlap, with a halo. */
function label3D(sc, p, text, opts) {
	opts = opts || {};
	var q = pr3(sc, p);
	sc.labels.push({ u: q.u + (opts.dx || 0), v: q.v + (opts.dy === undefined ? -6 : opts.dy), text: text,
		fill: opts.fill || 'var(--wp-text, #202122)', size: opts.size || 11, mono: opts.mono !== false, weight: opts.weight || '700',
		halo: opts.halo, haloColor: opts.haloColor });
}

/* An RGB tripod (X red, Y green, Z blue) with arrowheads, an origin dot and a frame name. */
function axes3D(sc, origin, R, len, name) {
	R = R || { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
	var o = pr3(sc, origin);
	[['x', 'var(--w3d-x, #d92b2b)'], ['y', 'var(--w3d-y, #2b8a3e)'], ['z', 'var(--w3d-z, #1864ab)']].forEach(function (ax) {
		var tip = add3(origin, scale3(R[ax[0]], len)), t = pr3(sc, tip);
		var du = t.u - o.u, dv = t.v - o.v, l = Math.hypot(du, dv);
		var nodes = [s('line', { x1: o.u.toFixed(1), y1: o.v.toFixed(1), x2: t.u.toFixed(1), y2: t.v.toFixed(1),
			stroke: ax[1], 'stroke-width': '2.5', 'stroke-linecap': 'round' })];
		if (l > 8) {
			var ux = du / l, uy = dv / l, bx = t.u - ux * 7, by = t.v - uy * 7;
			nodes.push(s('polygon', { fill: ax[1], points: [t.u + ux * 2, t.v + uy * 2, bx - uy * 3.5, by + ux * 3.5, bx + uy * 3.5, by - ux * 3.5]
				.map(function (n) { return n.toFixed(1); }).join(' ') }));
		}
		sc.items.push({ depth: (o.depth + t.depth) * 0.5 - 0.001, nodes: nodes });
	});
	sc.items.push({ depth: o.depth - 0.002, nodes: [s('circle', { cx: o.u.toFixed(1), cy: o.v.toFixed(1), r: '3.5',
		fill: 'var(--wp-bg, #fff)', stroke: 'var(--wp-text, #202122)', 'stroke-width': '1.5' })] });
	if (name) label3D(sc, origin, name, { dx: 7, dy: -7 });
}

/* Corner RGB world orientation triad (bottom-left of 3D viewport). */
function drawGizmo3D(sc) {
	var b = cameraBasis(sc.cam);
	var gx = 28, gy = sc.H - 26, len = 18;
	var g = s('g', { 'class': 'w3d-gizmo', 'aria-hidden': 'true' });
	g.appendChild(s('circle', { cx: gx, cy: gy, r: '21', fill: 'var(--w3d-badge-bg, rgba(255,255,255,0.8))',
		stroke: 'var(--w3d-badge-border, #c8ccd1)', 'stroke-width': '1', opacity: '0.88' }));
	var axes = [
		['X', [1, 0, 0], 'var(--w3d-x, #d92b2b)'],
		['Y', [0, 1, 0], 'var(--w3d-y, #2b8a3e)'],
		['Z', [0, 0, 1], 'var(--w3d-z, #1864ab)']
	].map(function (a) {
		var dx = dot3(a[1], b.right), dy = -dot3(a[1], b.up), dz = dot3(a[1], b.forward);
		return { name: a[0], col: a[2], dx: dx, dy: dy, dz: dz };
	}).sort(function (a, b2) { return b2.dz - a.dz; });
	axes.forEach(function (ax) {
		var ex = gx + ax.dx * len, ey = gy + ax.dy * len;
		g.appendChild(s('line', { x1: gx, y1: gy, x2: ex.toFixed(1), y2: ey.toFixed(1), stroke: ax.col, 'stroke-width': '2', 'stroke-linecap': 'round' }));
		var lx = gx + ax.dx * (len + 6.5), ly = gy + ax.dy * (len + 6.5) + 3;
		var tx = s('text', { x: lx.toFixed(1), y: ly.toFixed(1), fill: ax.col, 'font-size': '8.5px', 'font-weight': '700',
			'text-anchor': 'middle', 'font-family': 'var(--wp-mono, monospace)' });
		tx.textContent = ax.name;
		g.appendChild(tx);
	});
	return g;
}

function renderScene3D(svg, sc) {
	var frag = document.createDocumentFragment();
	sc.floor.forEach(function (n) { frag.appendChild(n); });
	if (sc.shadow.length) {
		var g = s('g', { 'class': 'w3d-shadow', 'aria-hidden': 'true' });
		sc.shadow.forEach(function (n) { g.appendChild(n); });
		frag.appendChild(g);
	}
	sc.items.sort(function (a, b) { return b.depth - a.depth; });
	sc.items.forEach(function (it) { it.nodes.forEach(function (n) { frag.appendChild(n); }); });
	var placed = [];
	sc.labels.forEach(function (lb) {
		var wpx = lb.text.length * lb.size * (lb.mono ? 0.62 : 0.56), x = clampN(lb.u, 2, sc.W - wpx - 2), best = null;
		[0, -13, 13, -26, 26, -39].some(function (off) {
			var y = clampN(lb.v + off, lb.size + 2, sc.H - 3), box = [x - 1, y - lb.size, x + wpx + 1, y + 3];
			var hit = placed.some(function (p) { return box[0] < p[2] && box[2] > p[0] && box[1] < p[3] && box[3] > p[1]; });
			if (!best || !hit) best = { y: y, box: box };
			return !hit;
		});
		placed.push(best.box);
		var lattrs = { x: x.toFixed(1), y: best.y.toFixed(1), fill: lb.fill, 'font-size': lb.size + 'px',
			'font-weight': lb.weight, 'font-family': lb.mono ? 'var(--wp-mono, monospace)' : 'var(--wp-sans, sans-serif)', 'class': 'w3d-label' };
		if (lb.halo === false) lattrs.style = 'stroke: none;';
		else if (lb.haloColor) lattrs.style = 'stroke: ' + lb.haloColor + '; stroke-width: 2.5px;';
		var tn = s('text', lattrs);
		tn.textContent = lb.text;
		frag.appendChild(tn);
	});
	if (!sc.noGizmo) frag.appendChild(drawGizmo3D(sc));
	svg.replaceChildren(frag);
}

function floorGrid3D(sc, xMin, xMax, yMin, yMax, step, z0) {
	var attrs = { stroke: 'var(--wp-border-light, #c8ccd1)', 'stroke-width': '1', opacity: '0.7' };
	var z = z0 || 0;
	for (var x = xMin; x <= xMax + 1e-6; x += step) line3D(sc, [x, yMin, z], [x, yMax, z], attrs, 'floor');
	for (var y = yMin; y <= yMax + 1e-6; y += step) line3D(sc, [xMin, y, z], [xMax, y, z], attrs, 'floor');
}

/* Draws at most once per animation frame however many inputs fire. */
function frameScheduler(fn) {
	var pending = false;
	return function () {
		if (pending) return;
		pending = true;
		requestAnimationFrame(function () { pending = false; fn(); });
	};
}

function syncCameraSliders(cam, ctl) {
	if (ctl.az) { ctl.az.input.value = Math.round(cam.azimuth); ctl.az.out.textContent = Math.round(cam.azimuth) + '°'; }
	if (ctl.el) { ctl.el.input.value = Math.round(cam.elevation); ctl.el.out.textContent = Math.round(cam.elevation) + '°'; }
}

function tweenCamera(cam, to, redraw, ctl) {
	if (cam.tween) cancelAnimationFrame(cam.tween);
	var from = { az: cam.azimuth, el: cam.elevation, d: cam.dist };
	var dAz = wrapDeg(to.azimuth - from.az), dEl = to.elevation - from.el, dD = (to.dist || from.d) - from.d;
	var t0 = null, dur = REDUCED_MOTION ? 0 : 380;
	function step(ts) {
		if (t0 === null) t0 = ts;
		var k = dur ? Math.min(1, (ts - t0) / dur) : 1, e = 0.5 - 0.5 * Math.cos(k * Math.PI);
		cam.azimuth = wrapDeg(from.az + dAz * e);
		cam.elevation = from.el + dEl * e;
		cam.dist = from.d + dD * e;
		syncCameraSliders(cam, ctl);
		redraw();
		cam.tween = k < 1 ? requestAnimationFrame(step) : null;
	}
	cam.tween = requestAnimationFrame(step);
}

function zoomCamera(cam, factor) { cam.dist = clampN(cam.dist * factor, cam.minDist, cam.maxDist); }

/* Mouse, touch and keyboard camera control for a 3D SVG.
   ctl: { az, el: camera sliders; onPointerDown(pt, e) -> drag handler {move, up, cursor} or null;
          hover(pt) -> cursor or null; onTap(pt); onKey(e, down) -> true if handled; home: view to reset to } */
function orbitControls(svg, cam, redraw, ctl) {
	var vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
	var pointers = {}, drag = null, pinch = null;
	svg.setAttribute('tabindex', '0');
	svg.style.touchAction = 'none';
	svg.style.cursor = 'grab';
	function toView(e) {
		var r = svg.getBoundingClientRect();
		return { x: (e.clientX - r.left) * W / (r.width || W), y: (e.clientY - r.top) * H / (r.height || H) };
	}
	function changed() { syncCameraSliders(cam, ctl); redraw(); }
	function pinchSpan() { var ids = Object.keys(pointers), a = pointers[ids[0]], b = pointers[ids[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
	svg.addEventListener('pointerdown', function (e) {
		if (e.button) return;
		if (cam.tween) { cancelAnimationFrame(cam.tween); cam.tween = null; }
		var pt = toView(e);
		pointers[e.pointerId] = pt;
		try { svg.setPointerCapture(e.pointerId); } catch (_) { /* not capturable */ }
		var n = Object.keys(pointers).length;
		if (n === 2) {
			if (drag && drag.handler && drag.handler.up) drag.handler.up();
			drag = null;
			pinch = { span: Math.max(10, pinchSpan()), dist: cam.dist };
			return;
		}
		if (n > 2) return;
		var handler = ctl.onPointerDown ? ctl.onPointerDown(pt, e) : null;
		drag = { x: pt.x, y: pt.y, az: cam.azimuth, el: cam.elevation, handler: handler, moved: false };
		svg.style.cursor = handler ? (handler.cursor || 'move') : 'grabbing';
		e.preventDefault();
	});
	svg.addEventListener('pointermove', function (e) {
		var pt = toView(e);
		if (pointers[e.pointerId]) pointers[e.pointerId] = pt;
		if (pinch) {
			if (Object.keys(pointers).length < 2) return;
			cam.dist = clampN(pinch.dist * pinch.span / Math.max(10, pinchSpan()), cam.minDist, cam.maxDist);
			changed();
			return;
		}
		if (!drag) { if (ctl.hover && e.pointerType === 'mouse') svg.style.cursor = ctl.hover(pt) || 'grab'; return; }
		var dx = pt.x - drag.x, dy = pt.y - drag.y;
		if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
		if (drag.handler) { drag.handler.move(pt, e); return; }
		cam.azimuth = wrapDeg(drag.az - dx * 0.5);
		cam.elevation = clampN(drag.el + dy * 0.4, cam.minEl, cam.maxEl);
		changed();
	});
	function end(e) {
		if (!pointers[e.pointerId]) return;
		var pt = toView(e);
		delete pointers[e.pointerId];
		try { svg.releasePointerCapture(e.pointerId); } catch (_) { /* already released */ }
		if (pinch) { if (Object.keys(pointers).length < 2) pinch = null; return; }
		if (drag) {
			if (drag.handler) { if (drag.handler.up) drag.handler.up(pt, e); }
			else if (!drag.moved && e.type === 'pointerup' && ctl.onTap) ctl.onTap(pt, e);
		}
		drag = null;
		svg.style.cursor = 'grab';
	}
	svg.addEventListener('pointerup', end);
	svg.addEventListener('pointercancel', end);
	// Ctrl/Cmd + wheel (and trackpad pinch, which browsers send as Ctrl + wheel) zooms; a plain wheel still scrolls the page.
	svg.addEventListener('wheel', function (e) {
		if (!(e.ctrlKey || e.metaKey)) return;
		e.preventDefault();
		zoomCamera(cam, Math.exp(clampN(e.deltaY, -60, 60) * 0.006));
		changed();
	}, { passive: false });
	svg.addEventListener('keydown', function (e) {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (ctl.onKey && ctl.onKey(e, true)) { e.preventDefault(); return; }
		var k = e.key, step = e.shiftKey ? 15 : 5;
		if (k === 'ArrowLeft') cam.azimuth = wrapDeg(cam.azimuth + step);
		else if (k === 'ArrowRight') cam.azimuth = wrapDeg(cam.azimuth - step);
		else if (k === 'ArrowUp') cam.elevation = clampN(cam.elevation + step, cam.minEl, cam.maxEl);
		else if (k === 'ArrowDown') cam.elevation = clampN(cam.elevation - step, cam.minEl, cam.maxEl);
		else if (k === '+' || k === '=') zoomCamera(cam, 1 / 1.15);
		else if (k === '-' || k === '_') zoomCamera(cam, 1.15);
		else if (k === '0' || k === 'Home') { tweenCamera(cam, cam.home, redraw, ctl); e.preventDefault(); return; }
		else return;
		e.preventDefault();
		changed();
	});
	svg.addEventListener('keyup', function (e) { if (ctl.onKey && ctl.onKey(e, false)) e.preventDefault(); });
	svg.addEventListener('blur', function () { if (ctl.onBlur) ctl.onBlur(); });
	[ctl.az, ctl.el].forEach(function (sl, i) {
		if (!sl) return;
		sl.input.addEventListener('input', function () {
			if (cam.tween) { cancelAnimationFrame(cam.tween); cam.tween = null; }
			if (i === 0) cam.azimuth = Number(sl.input.value); else cam.elevation = Number(sl.input.value);
			sl.out.textContent = sl.input.value + '°';
			redraw();
		});
	});
}

/* "View: Iso Front Side Top  Zoom + −" row. presets: [[label, azimuth, elevation, aria-label, dist]]. */
function viewButtons3D(cam, redraw, ctl, presets) {
	var row = h('div', { 'class': 'widget-buttons w3d-view', role: 'group', 'aria-label': 'Camera view' }, [
		h('span', { 'class': 'w3d-view-label', text: 'View' })
	]);
	presets.forEach(function (p) {
		row.appendChild(button(p[0], function () {
			var goal = { azimuth: p[1], elevation: p[2], dist: p[4] || cam.home.dist };
			tweenCamera(cam, goal, redraw, ctl);
		}, p[3]));
	});
	row.appendChild(button('Zoom +', function () { zoomCamera(cam, 1 / 1.25); redraw(); }, 'Zoom in'));
	row.appendChild(button('Zoom −', function () { zoomCamera(cam, 1.25); redraw(); }, 'Zoom out'));
	return row;
}

/* A button that repeats while held (mouse or touch); Enter or Space runs it once. */
function holdButton(text, fn, label, onRelease) {
	var b = button(text, function (e) { if (e.detail === 0) { fn(true); if (onRelease) onRelease(); } }, label);
	b.classList.add('w3d-hold');
	var t1 = null, t2 = null, held = false;
	function stop() {
		clearTimeout(t1); clearInterval(t2); t1 = t2 = null;
		if (held && onRelease) onRelease();
		held = false;
	}
	b.addEventListener('pointerdown', function (e) {
		if (e.button) return;
		stop();
		held = true;
		fn(false);
		t1 = setTimeout(function () { t2 = setInterval(function () { fn(false); }, 45); }, 300);
	});
	['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (ev) { b.addEventListener(ev, stop); });
	b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
	return b;
}

function checkRow3D(id, text, checked) {
	var input = h('input', { type: 'checkbox', id: id });
	input.checked = !!checked;
	return { input: input, row: h('div', { 'class': 'widget-control widget-check' }, [input, h('label', { 'for': id, text: text })]) };
}


/* ==========================================================================
   Shared 3D Stage Toolbar, Turntable Auto-spin, and Component Inspector
   ========================================================================== */

var ARDUINO_PARTS = [
	{
		id: 1,
		title: 'ATmega328P Microcontroller',
		shortTitle: 'ATmega328P',
		specPill: '8-bit AVR · 16 MHz · 5V Logic',
		pos: [0.85, -0.65, 0.72],
		box: [[0.85, -0.65, 0.32], [3.6, 0.95, 0.40]],
		desc: 'The central processing unit running your Arduino robot program. It executes setup() once at power-up and repeatedly runs loop(), controlling GPIO pins, hardware timers, PWM channels, and ADC conversions.',
		specs: [
			['Architecture', '8-bit AVR RISC (Microchip / Atmel) @ 16 MHz'],
			['Memory', '32 KB Flash (0.5 KB bootloader), 2 KB SRAM, 1 KB EEPROM'],
			['Operating Voltage', '5.0 V nominal (safe operating range: 1.8 V – 5.5 V)'],
			['Pin Current Limits', '20 mA recommended per I/O pin (40 mA absolute maximum)'],
			['Total Current Limit', '200 mA absolute maximum across all I/O pins combined'],
			['Robotics Role', 'Executes real-time sensor polling, motor PWM generation, and kinematic loops']
		]
	},
	{
		id: 2,
		title: 'USB Interface (ATmega16U2)',
		shortTitle: 'USB Interface',
		specPill: 'USB-to-Serial · DFU Bootloader',
		pos: [-1.35, 0.75, 0.58],
		box: [[-1.35, 0.75, 0.18], [0.9, 0.9, 0.22]],
		desc: 'Translates USB communication from your computer into asynchronous serial UART (TX/RX on pins 0 & 1). It also toggles the DTR reset line to automatically restart the ATmega328P when flashing new code.',
		specs: [
			['Chip Type', 'Microchip ATmega16U2 (32-pin QFN package)'],
			['USB Standard', 'USB 2.0 Full Speed (12 Mbps) CDC Serial Profile'],
			['Host Baud Rates', 'Supports standard serial rates from 300 up to 2,000,000 baud'],
			['Firmware Mode', 'Reprogrammable via DFU (can emulate MIDI, joystick, or HID keyboard)'],
			['Robotics Role', 'Streams debugging telemetry to Serial Monitor and receives ROS serial packets']
		]
	},
	{
		id: 3,
		title: '5V Voltage Regulator (NCP1117 / AMS1117)',
		shortTitle: '5V Regulator',
		specPill: 'Linear LDO · 5.0V Output · up to 800 mA',
		pos: [-1.25, -1.55, 0.58],
		box: [[-1.25, -1.55, 0.22], [0.8, 0.75, 0.26]],
		desc: 'Linear low-dropout (LDO) regulator that steps down raw external DC power (from barrel jack or VIN pin) to a stable 5.0 V rail for the microcontroller and onboard logic chips.',
		specs: [
			['Input Voltage', '7 V to 12 V DC recommended (dropout limit: 6.5 V, absolute max: 20 V)'],
			['Output Voltage', '5.0 V regulated ±1% (up to ~800 mA thermally limited)'],
			['Thermal Warning', 'P_loss = (V_in − 5V) × I. High V_in (12V) causes heavy heat dissipation'],
			['Safety Rule', 'Never drive motors, servos, or heavy solenoids from this 5V rail'],
			['Robotics Role', 'Powers onboard logic; motors must use dedicated battery supplies with common GND']
		]
	},
	{
		id: 4,
		title: 'DC Power Barrel Jack',
		shortTitle: 'Barrel Jack',
		specPill: '2.1 mm Center-Positive · 7–12 V DC',
		pos: [-2.60, -1.65, 1.15],
		box: [[-2.60, -1.65, 0.60], [1.5, 1.0, 1.1]],
		desc: 'Standard 2.1 mm barrel socket for powering autonomous mobile robots from untethered battery packs (e.g. 7.4V 2S LiPo, 9V NiMH, or 12V SLA). Protected against reverse polarity by an onboard series diode.',
		specs: [
			['Connector Spec', '2.1 mm center pin ID, 5.5 mm barrel OD, center-positive (+)'],
			['Recommended Supply', '7 V to 12 V DC battery pack or regulated wall adapter'],
			['Polarity Protection', 'Onboard M7 silicon diode prevents reverse-voltage destruction'],
			['Auto-Switching', 'Onboard comparator (LM358) cuts USB power when VIN > 6.6 V'],
			['Robotics Role', 'Main battery connection point for mobile robot controllers during untethered runs']
		]
	},
	{
		id: 5,
		title: 'USB Type-B Port',
		shortTitle: 'USB-B Port',
		specPill: 'Rugged Through-Hole · 5V VBUS · 500 mA Fuse',
		pos: [-2.65, 1.30, 1.18],
		box: [[-2.65, 1.30, 0.62], [1.45, 1.25, 1.15]],
		desc: 'Through-hole metal-shielded USB Type-B female connector used for sketch uploading, serial debugging, and desktop power. Large solder tabs make it mechanically far more durable than fragile micro-USB sockets.',
		specs: [
			['Connector Form', 'Full-size USB Type-B Female with ground shield retention tabs'],
			['VBUS Power', 'Supplies 5.0 V from host computer up to 500 mA'],
			['Polyfuse Protection', '500 mA resettable PTC polyfuse protects host PC USB ports from shorts'],
			['Signal Lines', 'D+ and D− data differential pair with 22 Ω series damping resistors'],
			['Robotics Role', 'Primary programming interface and wired serial tether during lab prototyping']
		]
	},
	{
		id: 6,
		title: 'Digital I/O Headers (Pins 0–13)',
		shortTitle: 'Digital I/O',
		specPill: '14 GPIOs · 5V Logic · 6 Hardware PWM',
		pos: [0.40, 2.30, 0.88],
		box: [[0.40, 2.30, 0.45], [4.7, 0.45, 0.70]],
		desc: 'Two female header blocks exposing 14 digital input/output pins. Pins marked with a tilde (~) support 8-bit hardware pulse-width modulation (PWM) for motor speed and servo position control.',
		specs: [
			['Digital Pins', 'Pins 0 to 13 (5.0 V HIGH, 0.0 V LOW; inputs exceed 3.0 V for HIGH)'],
			['Hardware PWM (~)', 'Pins 3, 5, 6, 9, 10, 11 (approx 490 Hz / 980 Hz for motor speed control)'],
			['Hardware UART', 'Pin 0 (RX) and Pin 1 (TX) shared with USB serial bridge'],
			['External Interrupts', 'Pin 2 (INT0) and Pin 3 (INT1) for microsecond optical encoder pulses'],
			['SPI Bus', 'Pin 10 (SS), Pin 11 (MOSI), Pin 12 (MISO), Pin 13 (SCK / onboard LED)'],
			['Current Limit', '20 mA per pin recommended; absolute maximum 40 mA before silicon damage']
		]
	},
	{
		id: 7,
		title: 'Analog In Headers (Pins A0–A5)',
		shortTitle: 'Analog In',
		specPill: '6 Channels · 10-bit ADC · 0–5V (4.88 mV/LSB)',
		pos: [1.85, -2.30, 0.88],
		box: [[1.85, -2.30, 0.45], [1.6, 0.45, 0.70]],
		desc: '6 dedicated analog input pins connected to the ATmega328P internal 10-bit Successive Approximation Analog-to-Digital Converter (ADC). Can also be configured as standard digital GPIOs (pins 14–19).',
		specs: [
			['ADC Resolution', '10-bit (returns integer 0 to 1023 in analogRead())'],
			['Voltage Range', '0.0 V to 5.0 V standard (reference can be customized via AREF pin)'],
			['Step Size (LSB)', '5.0 V / 1024 = 4.88 mV per analog count'],
			['Conversion Speed', 'Approx 100 microseconds per conversion (~10 kHz sample rate)'],
			['I2C Communication', 'Pin A4 is SDA (data) and Pin A5 is SCL (clock) for IMU/sensor bus'],
			['Robotics Role', 'Reads analog optical distance sensors, potentiometer joints, and battery monitors']
		]
	},
	{
		id: 8,
		title: 'Tactile Reset Push Button',
		shortTitle: 'Reset Button',
		specPill: 'Momentary SPST · Active-LOW to GND',
		pos: [-2.80, 2.15, 0.72],
		box: [[-2.80, 2.15, 0.30], [0.65, 0.65, 0.35]],
		desc: 'Momentary tactile switch wired between the ATmega328P /RESET pin (pin 1) and Ground. Pressing it pulls the reset line LOW, immediately halting robot code execution and restarting the Optiboot bootloader.',
		specs: [
			['Switch Type', 'Normally open SPST momentary tactile push switch'],
			['Electrical State', 'Held at 5.0 V via 10 kΩ pull-up; pressing shorts to GND (0.0 V)'],
			['Debounce & Filter', 'Filtered with a 100 nF capacitor against spurious electrical noise'],
			['Bootloader Action', 'Restarts execution at flash address 0x7E00 to check for new code'],
			['Robotics Role', 'Emergency stop reset during testing and manual recalibration trigger']
		]
	}
];

var ROBOT_ARM_PARTS = [
	{
		id: 'base',
		badge: 'J1',
		title: 'Robot Base & Waist Joint {J1}',
		shortTitle: 'Waist',
		specPill: 'Revolute Waist · Axis: World Z · ±170°',
		pos: [0, 0, 0.22],
		desc: 'The stationary mounting base and primary azimuth joint J1. Rotates the entire arm structure around the vertical world Z axis. Singularity caution: when the wrist center passes directly over this axis, small Cartesian Y movements demand very high J1 joint velocities (shoulder singularity).',
		specs: [
			['Joint Axis', 'World Z (vertical rotation, θ1)'],
			['Joint Range', '−170° to +170° (340° total working envelope)'],
			['Frame Role', '{base} reference frame for Cartesian world kinematics [X, Y, Z]'],
			['Singularity', 'Shoulder singularity occurs when wrist radius r ≈ 0 m']
		]
	},
	{
		id: 'shoulder',
		badge: 'J2',
		title: 'Shoulder Joint {J2} & Lower Arm Link',
		shortTitle: 'Shoulder',
		specPill: 'Revolute Pitch · Length: 0.32 m · −60°..+90°',
		pos: [0, 0, 0.14],
		desc: 'Joint 2 elevates the heavy main arm section in the vertical plane. It bears the highest gravitational torque of any joint on the manipulator. Link 1 has an effective kinematic length of 0.32 m.',
		specs: [
			['Joint Axis', 'Horizontal pitch axis perpendicular to arm plane (θ2)'],
			['Joint Range', '−60° to +90°'],
			['Kinematic Length', 'L1 = 0.32 m (main boom)'],
			['Dynamics', 'Peak holding torque required when arm is horizontal at full extension']
		]
	},
	{
		id: 'elbow',
		badge: 'J3',
		title: 'Elbow Joint {J3} & Forearm Link',
		shortTitle: 'Elbow',
		specPill: 'Revolute Pitch · Length: 0.28 m · −90°..+100°',
		pos: [0.15, 0.15, 0.35],
		desc: 'Joint 3 articulates the forearm (0.28 m link) relative to the lower arm. When θ3 = 0°, the arm is stretched out straight at its reach boundary (boundary singularity), where the kinematic Jacobian loses rank and outward velocity is zero.',
		specs: [
			['Joint Axis', 'Forearm pitch axis parallel to J2 (θ3)'],
			['Joint Range', '−90° to +100°'],
			['Kinematic Length', 'L2 = 0.28 m (forearm)'],
			['Singularity', 'Elbow singularity occurs at θ3 = 0° (maximum radial reach 0.74 m)']
		]
	},
	{
		id: 'wrist',
		badge: 'J4',
		title: 'Wrist Assembly (Pitch {J4} & Roll {J5})',
		shortTitle: 'Wrist',
		specPill: '2-DOF Spherical Wrist · Pitch ±100° · Roll ±180°',
		pos: [0.35, 0.20, 0.30],
		desc: 'Joints 4 and 5 form a compact two-axis wrist. J4 pitches the tool flange up and down to match the approach vector, while J5 spins the tool flange continuously to orient the gripper for grasp acquisition.',
		specs: [
			['Joint 4 (Pitch)', '−100° to +100° (determines tool approach angle φ)'],
			['Joint 5 (Roll)', '−180° to +180° (spins tool frame around tool Z axis)'],
			['Kinematic Length', 'L3 + L4 = 0.18 m combined flange and gripper depth'],
			['Robotics Role', 'Decouples position IK (solved at wrist center) from tool orientation']
		]
	},
	{
		id: 'tool',
		badge: 'TCP',
		title: 'Pneumatic Parallel Gripper & TCP {tool}',
		shortTitle: 'Gripper & TCP',
		specPill: 'Tool Center Point · 2-Finger Grip',
		pos: [0.42, 0.22, 0.18],
		desc: 'The end-effector mounted to the robot tool flange. The Tool Center Point (TCP) is defined at the midpoint between the gripper fingers where workpieces are grasped.',
		specs: [
			['Gripper Stroke', '40 mm parallel opening for palletized cylinders/cubes'],
			['Tool Coordinate Frame', '{tool}: Z points outward along approach, X along finger motion'],
			['Jogging Frames', 'Supports jogging in both fixed {base} and tool-relative {tool} frames'],
			['Trajectory Control', 'MoveL interpolates TCP on a straight line; MoveJ curves in Cartesian space']
		]
	},
	{
		id: 'workpiece',
		badge: 'WP',
		title: 'Assembly Workpiece & Fixture Pedestals',
		shortTitle: 'Workpiece',
		specPill: '42 mm Cyan Payload Cube · Pick & Place Fixtures',
		pos: [0.42, 0.26, 0.12],
		desc: 'Standardized payload block used in pick-and-place automation sequences. The robot descends to the pick pedestal, activates its grasp, elevates along a clear vertical path, and deposits the payload onto the place pedestal.',
		specs: [
			['Workpiece Size', '42 × 42 × 42 mm precision cube'],
			['Pick Pedestal', 'Located at X = +0.42 m, Y = +0.26 m, Z = 0.05 m'],
			['Place Pedestal', 'Located at X = +0.30 m, Y = −0.40 m, Z = 0.07 m'],
			['Safety Margin', 'Clearance height of +0.24 m Z avoids collisions during transfer']
		]
	}
];

var AMR_PARTS = [
	{
		id: 'chassis',
		badge: '1',
		title: 'AMR Chassis & Payload Deck',
		shortTitle: 'Chassis',
		specPill: 'Differential Platform · 0.68 × 0.46 m Footprint',
		pos: [0, 0, 0.25],
		desc: 'Heavy-duty industrial mobile base housing the traction battery, motor drivers, onboard PC, and safety PLC. Low center of gravity provides stability during fast acceleration and emergency stops.',
		specs: [
			['Dimensions', '0.68 m length, 0.46 m width, 0.18 m body height'],
			['Payload Rating', 'Up to 100 kg distributed deck load'],
			['Speed Limits', 'Linear velocity v ≤ 0.55 m/s, angular velocity ω ≤ 1.4 rad/s'],
			['Obstacle Clearance', 'Safety field footprint ROBOT_R = 0.38 m radius buffer']
		]
	},
	{
		id: 'drive',
		badge: '2',
		title: 'Differential Drive Wheels & Casters',
		shortTitle: 'Drive Wheels',
		specPill: '2 Driven Wheels · 2 Passive Casters · Slip Modeling',
		pos: [0, 0.26, 0.16],
		desc: 'Two independent drive wheels on a common lateral axis, supported by front and rear passive swivel casters. Odometry computes position by integrating wheel encoder ticks; tire slip causes dead-reckoning drift over time.',
		specs: [
			['Wheel Radius', 'R = 0.085 m with high-traction polyurethane tires'],
			['Track Gauge', 'L = 0.48 m distance between left and right wheel contacts'],
			['Kinematic Model', 'v = (v_r + v_l)/2, ω = (v_r − v_l)/L'],
			['Drift Source', 'Wheel slip slider introduces 0–25% encoder odometry divergence']
		]
	},
	{
		id: 'lidar',
		badge: '3',
		title: '2D Safety LiDAR Rangefinder {lidar_link}',
		shortTitle: 'LiDAR Puck',
		specPill: '360° Planar Laser · 48 Active Rays · Time-of-Flight',
		pos: [0, 0, 0.44],
		desc: 'Puck-style planar laser scanner mounted on the top deck at Z = +0.315 m. Measures distance to warehouse walls and obstacles using speed-of-light pulse return timing.',
		specs: [
			['Scan Rate', 'Continuous 360° horizontal fan (48 beams simulated)'],
			['Range Limit', 'Up to 6.0 m detection horizon in warehouse envelope'],
			['LiDAR Frame', '{lidar_link} rigid transform from base_link: (0, 0, +0.315 m)'],
			['Active Ray Highlighting', 'Beams hitting obstacles illuminate cyan strike lines']
		]
	},
	{
		id: 'base_link',
		badge: '4',
		title: 'Robot Base Frame {base_link} (REP 105)',
		shortTitle: '{base_link}',
		specPill: 'Rigid Body Frame · Midpoint of Drive Wheel Axis',
		pos: [0, 0, 0.05],
		desc: 'The coordinate frame rigidly attached to the mobile robot body, standard across ROS and ROS 2 (REP 105). X points forward along travel, Y points left, and Z points upward.',
		specs: [
			['Origin Position', 'Center of rotation on ground surface midway between drive wheels'],
			['REP 105 Standard', 'Parent frame is odom; child frames include lidar_link and camera_link'],
			['Velocity Commands', 'cmd_vel Twist message specifies linear X (v) and angular Z (ω) in base_link']
		]
	},
	{
		id: 'odom',
		badge: '5',
		title: 'Odometry Frame {odom} (REP 105)',
		shortTitle: '{odom}',
		specPill: 'Smooth Continuous Dead-Reckoning · Unbounded Drift',
		pos: [0.35, 0.25, 0.10],
		desc: 'World-fixed coordinate frame estimated solely from wheel encoders and IMU integration. Guaranteed to be continuous (never jumps), making it ideal for real-time motor velocity control, but drifts over time.',
		specs: [
			['Continuity', 'Continuous, smooth transform (odom → base_link never teleports)'],
			['Drift Characteristic', 'Error accumulates unbounded as wheels slip or travel long distances'],
			['Ghost AMR Model', 'The gold dashed ghost shows where the odom transform thinks the robot is']
		]
	},
	{
		id: 'map',
		badge: '6',
		title: 'Global Map Frame {map} (REP 105)',
		shortTitle: '{map}',
		specPill: 'Fixed Earth Coordinate System · Discrete AMCL Jumps',
		pos: [0, 0, 0.65],
		desc: 'The global earth-fixed reference frame where warehouse obstacles and navigation goals reside. AMCL (Adaptive Monte Carlo Localization) periodically matches the LiDAR scan against the map, correcting the map → odom transform.',
		specs: [
			['Origin Position', 'Fixed warehouse origin [0, 0, 0]'],
			['Discontinuous Jumps', 'map → odom transform jumps when AMCL publishes localization corrections'],
			['TF Chain', 'Full transform: map → odom → base_link → lidar_link']
		]
	}
];

var PINHOLE_PARTS = [
	{
		id: 'camera',
		badge: '1',
		title: 'Pinhole Camera Chassis & Coordinate Frame {camera}',
		shortTitle: 'Camera Frame',
		specPill: 'Right-Handed Vision Frame: X-Right, Y-Down, Z-Forward',
		pos: [0, -0.09, 0.45],
		desc: 'The physical optical housing and standard computer vision coordinate system. Unlike robotics world coordinates (Z-up), the camera reference frame defines Z along the optical axis, X pointing right, and Y pointing down.',
		specs: [
			['Camera Origin O', 'Perspective projection center at [0, 0, 0.35 m]'],
			['Optical Axis +Z', 'Collinear with lens center line, pointing forward into the 3D scene'],
			['Right-Handed Axes', 'X points right (increasing u column), Y points down (increasing v row)']
		]
	},
	{
		id: 'lens',
		badge: '2',
		title: 'Optical Aperture & Principal Point (cx, cy)',
		shortTitle: 'Lens Aperture',
		specPill: 'Focal Length fx = fy · Principal Point: (320, 240) px',
		pos: [0, 0.06, 0.43],
		desc: 'The ideal pinhole lens through which all light rays converge. The principal point (cx, cy) is where the optical axis pierces the image sensor plane perpendicular to the lens.',
		specs: [
			['Focal Length Range', '400 px to 1200 px (slider adjustable, default 800 px)'],
			['Principal Point', 'Center of 640×480 sensor: cx = 320 px, cy = 240 px'],
			['Intrinsic Matrix K', '[[fx, 0, cx], [0, fy, cy], [0, 0, 1]] projects camera coordinates']
		]
	},
	{
		id: 'sensor',
		badge: '3',
		title: 'Digital Image Sensor Plane',
		shortTitle: 'Sensor Plane',
		specPill: '640 × 480 Resolution · 2D Pixel Grid (u, v)',
		pos: [0, 0.35, 0.56],
		desc: 'The CMOS sensor grid placed at focal distance along the optical axis. In real cameras the image is inverted; the standard virtual image plane model places the sensor in front of the lens so pixel coordinates remain right-side up.',
		specs: [
			['Resolution', '640 columns (u) by 480 rows (v)'],
			['Top-Left Origin', 'Pixel (0, 0) is at the top-left corner of the sensor frame'],
			['Field of View (FOV)', 'Horizontal FOV = 2·arctan(320/fx), Vertical FOV = 2·arctan(240/fy)'],
			['HUD Viewfinder', 'Top-right 2D inset shows the resulting camera frame and active pixel location']
		]
	},
	{
		id: 'target',
		badge: '4',
		title: '3D Scene Target Point P(X, Y, Z)',
		shortTitle: 'Target Point P',
		specPill: 'World Coordinates: [X, Y, Z] meters',
		pos: [0.10, 1.00, 0.42],
		desc: 'A physical object or landmark point in 3D Euclidean space. The projection distance Z sets the scale: objects further away produce smaller image projections according to the 1/Z depth scaling factor.',
		specs: [
			['Normalized Coordinates', 'x\' = X / Z, y\' = Y / Z (rays projected to unit depth plane)'],
			['Depth Sensitivity', 'As Z doubles, projected pixel displacement from center halves (perspective foreshortening)'],
			['Drop Shadow', 'Vertical dashed drop line indicates physical altitude above floor']
		]
	},
	{
		id: 'ray',
		badge: '5',
		title: 'Perspective Projection Ray',
		shortTitle: 'Projection Ray',
		specPill: 'Line of Sight · Collinearity: O → (u, v) → P',
		pos: [0.05, 0.65, 0.33],
		desc: 'The straight line connecting the camera projection center (0, 0, 0), the sensor image pixel (u, v), and the 3D target point P. Pinhole projection reduces 3D depth to 2D image coordinates along this single line of sight.',
		specs: [
			['Pixel u Formula', 'u = fx · (X / Z) + cx'],
			['Pixel v Formula', 'v = fy · (Y / Z) + cy'],
			['Depth Ambiguity', 'Any 3D point along this ray projects to the exact same pixel (u, v) unless stereo or depth sensing is used']
		]
	}
];

function drawHighlightBox3D(sc, center, size, col) {
	col = col || '#00878a';
	var bx = boxFaces(center, size, 0);
	bx.faces.forEach(function (f) {
		var poly = face3D(sc, f.pts, 'none', {
			cull: false,
			shade: false,
			attrs: {
				stroke: col,
				'stroke-width': '2',
				'stroke-dasharray': '4 3',
				opacity: '0.88',
				fill: col,
				'fill-opacity': '0.12'
			}
		});
		if (poly) sc.items.push({ depth: pr3(sc, center).depth - 0.04, nodes: [poly] });
	});
}

function drawCalloutChip3D(sc, part, isAct, isHov, dark, stage) {
	var pr = pr3(sc, part.pos);
	if (pr.depth < 0.1) return;

	var chipGroup = s('g', {
		'class': 'w3d-chip' + (isAct ? ' is-active' : '') + (isHov ? ' is-hover' : ''),
		'aria-pressed': isAct ? 'true' : 'false',
		role: 'button',
		'aria-label': 'Component ' + part.id + ': ' + part.title,
		tabindex: '0',
		style: 'cursor: pointer;'
	});

	var numStr = part.badge || (typeof part.id === 'number' ? String(part.id) : (part.shortTitle ? part.shortTitle.slice(0, 3) : '•'));
	var pw = Math.max(18, numStr.length * 6.4 + 8), ph = isAct ? 19 : 17;
	chipGroup.appendChild(s('rect', {
		x: (pr.u - Math.max(14, pw * 0.6)).toFixed(1), y: (pr.v - 14).toFixed(1),
		width: Math.max(28, pw * 1.2).toFixed(1), height: '28', rx: '14', fill: 'transparent'
	}));

	var baseFill = isAct ? 'var(--lsu-purple, #461d7c)' : (dark ? 'rgba(20,24,28,0.88)' : 'rgba(255,255,255,0.92)');
	var baseStroke = isAct ? 'var(--lsu-gold, #fdd023)' : (isHov ? 'var(--wp-gold, #fdd023)' : (dark ? '#38bdf8' : '#00878a'));
	chipGroup.appendChild(s('rect', {
		x: (pr.u - pw * 0.5).toFixed(1), y: (pr.v - ph * 0.5).toFixed(1),
		width: pw.toFixed(1), height: ph.toFixed(1), rx: (ph * 0.5).toFixed(1),
		fill: baseFill, stroke: baseStroke, 'stroke-width': isAct || isHov ? '2.2' : '1.6'
	}));

	var chipText = s('text', {
		x: pr.u.toFixed(1),
		y: (pr.v + 3.2).toFixed(1),
		fill: isAct ? 'var(--lsu-gold, #fdd023)' : (dark ? '#eaecf0' : '#00878a'),
		'font-size': isAct ? '9.5px' : '8.5px',
		'font-weight': '800',
		'text-anchor': 'middle',
		'font-family': 'var(--wp-mono, monospace)',
		'pointer-events': 'none'
	});
	chipText.textContent = numStr;
	chipGroup.appendChild(chipText);

	chipGroup.addEventListener('click', function (ev) {
		ev.stopPropagation();
		stage.selectPart(part.id);
	});
	chipGroup.addEventListener('keydown', function (ev) {
		if (ev.key === 'Enter' || ev.key === ' ') {
			ev.preventDefault();
			ev.stopPropagation();
			stage.selectPart(part.id);
		}
	});
	chipGroup.addEventListener('pointerenter', function () { stage.hoverPart(part.id); });
	chipGroup.addEventListener('pointerleave', function () { stage.hoverPart(null); });

	sc.items.push({ depth: pr.depth - 0.08, nodes: [chipGroup] });
}

function build3DStage(svg, cam, redraw, ctl, opts) {
	opts = opts || {};
	var presets = opts.presets || [];
	var parts = opts.parts || [];
	var hasTurntable = opts.turntable !== false;
	var hasLabels = opts.labels !== false;
	var hasZoom = opts.zoom !== false;

	var wrap = h('div', {
		'class': 'w3d-canvas-wrap w3d-stage-wrap',
		role: 'region',
		'aria-label': (opts.title || 'Interactive 3D Stage') + '. Drag to orbit; pinch or Ctrl+wheel to zoom.'
	});

	var stage = {
		wrap: wrap,
		svg: svg,
		activePartId: null,
		hoveredPartId: null,
		showLabels: opts.initialLabels !== false,
		turntableRunning: false,
		selectPart: function (id) {
			if (stage.activePartId === id) stage.activePartId = null;
			else stage.activePartId = id;
			updatePartState();
			redraw();
		},
		hoverPart: function (id) {
			if (stage.hoveredPartId === id) return;
			stage.hoveredPartId = id;
			updatePartState();
			redraw();
		},
		stopTurntable: function () {
			if (!stage.turntableRunning) return;
			stage.turntableRunning = false;
			if (btnTurntable) {
				btnTurntable.setAttribute('aria-pressed', 'false');
				btnTurntable.classList.remove('is-active', 'w3d-active');
			}
			if (turntableRaf) { cancelAnimationFrame(turntableRaf); turntableRaf = null; }
		},
		startTurntable: function () {
			if (stage.turntableRunning) return;
			stage.turntableRunning = true;
			if (btnTurntable) {
				btnTurntable.setAttribute('aria-pressed', 'true');
				btnTurntable.classList.add('is-active', 'w3d-active');
			}
			spinTurntable();
		}
	};

	var turntableRaf = null;
	var pausedByDrag = false;
	function spinTurntable() {
		if (!stage.turntableRunning) return;
		cam.azimuth = wrapDeg(cam.azimuth + (opts.spinSpeed || 0.35));
		syncCameraSliders(cam, ctl);
		redraw();
		turntableRaf = requestAnimationFrame(spinTurntable);
	}

	svg.addEventListener('pointerdown', function () {
		if (stage.turntableRunning) {
			pausedByDrag = true;
			if (turntableRaf) { cancelAnimationFrame(turntableRaf); turntableRaf = null; }
		}
	});
	window.addEventListener('pointerup', function () {
		if (pausedByDrag) {
			pausedByDrag = false;
			if (stage.turntableRunning && !turntableRaf) {
				turntableRaf = requestAnimationFrame(spinTurntable);
			}
		}
	});

	// Floating frosted stage toolbar positioned over the 3D canvas
	var toolbar = h('div', {
		'class': 'w3d-stage-toolbar',
		role: 'toolbar',
		'aria-label': (opts.title || '3D') + ' Stage Controls'
	});

	if (presets.length) {
		var presetGroup = h('div', { 'class': 'w3d-toolbar-group w3d-preset-group', role: 'group', 'aria-label': 'Camera Views' });
		presets.forEach(function (p) {
			var b = h('button', {
				type: 'button',
				'class': 'w3d-toolbar-btn w3d-stage-btn btn-copy-bibtex',
				'aria-label': p[3] || ('Switch to ' + p[0] + ' view'),
				title: p[3] || (p[0] + ' view'),
				text: p[0]
			});
			b.addEventListener('click', function () {
				var goal = { azimuth: p[1], elevation: p[2], dist: p[4] || cam.home.dist };
				tweenCamera(cam, goal, redraw, ctl);
			});
			presetGroup.appendChild(b);
		});
		toolbar.appendChild(presetGroup);
	}

	var btnTurntable = null;
	if (hasTurntable) {
		btnTurntable = h('button', {
			type: 'button',
			'class': 'w3d-toolbar-btn w3d-stage-btn btn-copy-bibtex w3d-btn-turntable',
			'aria-pressed': 'false',
			'aria-label': 'Toggle auto-rotate turntable (continuous spin)',
			title: 'Auto-rotate turntable'
		}, [
			h('span', { 'class': 'w3d-icon w3d-spin-icon', 'aria-hidden': 'true', text: '↻' }),
			h('span', { 'class': 'w3d-btn-text', text: ' Rotate' })
		]);
		btnTurntable.addEventListener('click', function () {
			if (stage.turntableRunning) stage.stopTurntable();
			else stage.startTurntable();
		});
		toolbar.appendChild(btnTurntable);
	}

	var btnLabels = null;
	if (hasLabels) {
		btnLabels = h('button', {
			type: 'button',
			'class': 'w3d-toolbar-btn w3d-stage-btn btn-copy-bibtex w3d-btn-labels' + (stage.showLabels ? ' is-active w3d-active' : ''),
			'aria-pressed': stage.showLabels ? 'true' : 'false',
			'aria-label': 'Toggle 3D component callout labels',
			title: 'Toggle 3D component labels'
		}, [
			h('span', { 'class': 'w3d-icon', 'aria-hidden': 'true', text: '🏷' }),
			h('span', { 'class': 'w3d-btn-text', text: ' Labels' })
		]);
		btnLabels.addEventListener('click', function () {
			stage.showLabels = !stage.showLabels;
			btnLabels.setAttribute('aria-pressed', stage.showLabels ? 'true' : 'false');
			if (stage.showLabels) btnLabels.classList.add('is-active', 'w3d-active');
			else btnLabels.classList.remove('is-active', 'w3d-active');
			redraw();
		});
		toolbar.appendChild(btnLabels);
	}

	if (opts.extraButtons) {
		opts.extraButtons.forEach(function (btn) { toolbar.appendChild(btn); });
	}

	if (hasZoom) {
		var zoomGroup = h('div', { 'class': 'w3d-toolbar-group w3d-zoom-group', role: 'group', 'aria-label': 'Zoom and reset' });
		var btnZoomIn = h('button', {
			type: 'button',
			'class': 'w3d-toolbar-btn w3d-stage-btn btn-copy-bibtex',
			'aria-label': 'Zoom in (+)',
			title: 'Zoom in'
		}, [h('span', { text: '+' })]);
		btnZoomIn.addEventListener('click', function () { zoomCamera(cam, 1 / 1.25); redraw(); });

		var btnZoomOut = h('button', {
			type: 'button',
			'class': 'w3d-toolbar-btn w3d-stage-btn btn-copy-bibtex',
			'aria-label': 'Zoom out (−)',
			title: 'Zoom out'
		}, [h('span', { text: '−' })]);
		btnZoomOut.addEventListener('click', function () { zoomCamera(cam, 1.25); redraw(); });

		var btnReset = h('button', {
			type: 'button',
			'class': 'w3d-toolbar-btn w3d-stage-btn btn-copy-bibtex',
			'aria-label': 'Reset camera view (0)',
			title: 'Reset view'
		}, [h('span', { text: '↺' })]);
		btnReset.addEventListener('click', function () { tweenCamera(cam, cam.home, redraw, ctl); });

		zoomGroup.appendChild(btnZoomIn);
		zoomGroup.appendChild(btnZoomOut);
		zoomGroup.appendChild(btnReset);
		toolbar.appendChild(zoomGroup);
	}

	// Frosted Component Details Card (in-flow below chip dock so it never blocks the 3D view or chip clicks)
	var card = h('div', {
		'class': 'w3d-part-card w3d-inspector-card is-hidden',
		role: 'region',
		'aria-label': 'Component Details Inspector',
		'aria-live': 'polite'
	});
	card.setAttribute('hidden', '');

	function getPartData(id) {
		for (var i = 0; i < parts.length; i++) {
			if (parts[i].id === id) return parts[i];
		}
		return null;
	}

	function renderInspectorCard(part) {
		if (!part) {
			card.setAttribute('hidden', '');
			card.classList.add('is-hidden');
			return;
		}
		card.removeAttribute('hidden');
		card.classList.remove('is-hidden');

		var closeBtn = h('button', {
			type: 'button',
			'class': 'w3d-card-close w3d-inspector-close btn-copy-bibtex',
			'aria-label': 'Close component inspector card',
			title: 'Close'
		}, [h('span', { text: '✕' })]);
		closeBtn.addEventListener('click', function () {
			stage.activePartId = null;
			updatePartState();
			redraw();
		});

		var badgeText = part.badge || (typeof part.id === 'number' ? String(part.id) : null);
		var badgeNode = badgeText ? h('span', { 'class': 'w3d-chip-num w3d-spec-badge', text: badgeText }) : null;

		var cardHdr = h('div', { 'class': 'w3d-part-card-header w3d-inspector-header' }, [
			h('div', { 'class': 'w3d-card-title-group', style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;' }, [
				badgeNode,
				h('h4', { 'class': 'w3d-part-card-title w3d-inspector-title', text: part.title })
			]),
			part.specPill ? h('span', { 'class': 'w3d-spec-pill w3d-part-spec', text: part.specPill }) : null,
			closeBtn
		]);

		var specDl = null;
		if (part.specs && part.specs.length) {
			specDl = h('dl', { 'class': 'w3d-part-details w3d-inspector-details' });
			part.specs.forEach(function (sp) {
				specDl.appendChild(h('dt', { 'class': 'w3d-part-detail-key', text: sp[0] }));
				specDl.appendChild(h('dd', { 'class': 'w3d-part-detail-val', text: sp[1] }));
			});
		}

		var cardBody = h('div', { 'class': 'w3d-part-card-body' }, [
			h('p', { 'class': 'w3d-part-card-desc w3d-inspector-desc', text: part.desc }),
			specDl
		]);

		card.replaceChildren(cardHdr, cardBody);
	}

	// Numbered Callout Chips Dock
	var chipDock = null;
	var chipButtons = {};
	if (parts && parts.length && opts.showChipDock !== false) {
		chipDock = h('div', {
			'class': 'w3d-chips-row w3d-chips-bar w3d-chip-dock',
			role: 'group',
			'aria-label': 'Component callout chips'
		});
		parts.forEach(function (p) {
			var badgeTxt = p.badge || (typeof p.id === 'number' ? String(p.id) : null);
			var cBtn = h('button', {
				type: 'button',
				'class': 'w3d-chip btn-copy-bibtex',
				'aria-pressed': 'false',
				'aria-label': (badgeTxt ? ('Component ' + badgeTxt + ': ') : '') + p.title,
				title: p.title
			}, [
				badgeTxt ? h('span', { 'class': 'w3d-chip-num', text: badgeTxt }) : null,
				h('span', { 'class': 'w3d-chip-name', text: p.shortTitle || p.title })
			]);
			cBtn.addEventListener('click', function () { stage.selectPart(p.id); });
			cBtn.addEventListener('mouseenter', function () { stage.hoverPart(p.id); });
			cBtn.addEventListener('mouseleave', function () { stage.hoverPart(null); });
			chipDock.appendChild(cBtn);
			chipButtons[p.id] = cBtn;
		});
	}

	function updatePartState() {
		var part = stage.activePartId ? getPartData(stage.activePartId) : null;
		renderInspectorCard(part);

		Object.keys(chipButtons).forEach(function (idKey) {
			var id = isNaN(Number(idKey)) ? idKey : Number(idKey);
			var b = chipButtons[idKey];
			if (id === stage.activePartId) {
				b.setAttribute('aria-pressed', 'true');
				b.classList.add('is-active', 'w3d-chip-active');
			} else {
				b.setAttribute('aria-pressed', 'false');
				b.classList.remove('is-active', 'w3d-chip-active');
			}
			if (id === stage.hoveredPartId) b.classList.add('is-hover', 'w3d-chip-hover');
			else b.classList.remove('is-hover', 'w3d-chip-hover');
		});
	}

	var viewport = h('div', { 'class': 'w3d-viewport' }, [toolbar, svg]);
	wrap.appendChild(viewport);
	if (chipDock) wrap.appendChild(chipDock);
	wrap.appendChild(card);

	return stage;
}

/* ---------- 3D pinhole camera projection and frustum (lesson 7.6) ---------- */

function initPinholeProjection(root) {
	var sX = slider('3D coordinate X (m)', 'pp-x', -0.25, 0.25, 0.01, 0.10, ' m');
	var sY = slider('3D coordinate Y (m)', 'pp-y', -0.20, 0.20, 0.01, 0.05, ' m');
	var sZ = slider('3D coordinate Z (m)', 'pp-z', 0.40, 2.50, 0.05, 1.00, ' m');
	var sF = slider('Focal length (fx = fy)', 'pp-f', 400, 1200, 50, 800, ' px');
	var az = slider('Camera azimuth', 'pp-az', -180, 180, 1, 35, '°');
	var el = slider('Camera elevation', 'pp-el', 0, 89, 1, 22, '°');

	var narrow = (root.clientWidth || 600) < 500, W = narrow ? 360 : 560, H = narrow ? 320 : 380;
	var svg = plotFrame(W, H, 'Interactive 3D model of a pinhole camera frustum, sensor plane, and projection ray connecting the camera center to 3D points in space. Drag to orbit, pinch or wheel to zoom.');
	svg.classList.add('w3d-canvas');

	var z0 = 0.35;
	var cam = createCamera3D([0, 0.85, z0], 2.3, narrow ? 440 : 490, 35, 22);
	cam.minEl = 0;
	cam.minDist = 1.0;
	cam.maxDist = 5.0;
	var light = norm3([0.35, -0.6, 0.8]);
	var ctl = { az: az, el: el };
	var redraw = frameScheduler(draw);

	var stage = build3DStage(svg, cam, redraw, ctl, {
		title: 'Pinhole Camera Frustum',
		presets: [
			['Iso', 35, 22, 'Isometric view of camera frustum and projection ray', 2.3],
			['Front', 180, 12, 'View facing the camera lens', 2.2],
			['Side', -90, 10, 'Side profile view showing optical axis depth Z', 2.2],
			['Top', 0, 89, 'Top-down view of optical axis and target', 2.3],
			['Camera-view', 0, 0, 'View through the camera lens looking along the optical axis', 2.1]
		],
		parts: PINHOLE_PARTS,
		initialLabels: true
	});

	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
	var status = h('p', { 'class': 'widget-readout', 'aria-live': 'polite', style: 'margin-top:2px;' });

	function draw() {
		var X = Number(sX.input.value);
		var Y = Number(sY.input.value);
		var Z = Number(sZ.input.value);
		var fx = Number(sF.input.value);
		var fy = fx;
		var cx = 320.0, cy = 240.0;

		sX.out.textContent = X.toFixed(2) + ' m';
		sY.out.textContent = Y.toFixed(2) + ' m';
		sZ.out.textContent = Z.toFixed(2) + ' m';
		sF.out.textContent = fx + ' px';

		var x_norm = X / Z;
		var y_norm = Y / Z;
		var u = fx * x_norm + cx;
		var v = fy * y_norm + cy;
		var inBounds = (u >= 0 && u <= 640 && v >= 0 && v <= 480);

		var sc = newScene3D(cam, W, H, light);
		var dark = isDarkWidget(svg);

		// Floor grid
		floorGrid3D(sc, -0.8, 0.8, -0.2, 2.6, 0.2);

		// Camera origin O = [0, 0, z0]
		var O = [0, 0, z0];

		// Industrial GigE machine vision camera body + cooling fins + lens assembly + mounting stand
		var bodyColor = dark ? '#2d333b' : '#33383f';
		var metalColor = dark ? '#444c56' : '#64748b';
		cylinder3D(sc, [0, -0.09, 0], [0, -0.09, z0 - 0.06], 0.018, metalColor, { segments: 10, shadow: true, edge: true });
		box3D(sc, [0, -0.09, 0.012], [0.14, 0.14, 0.024], 0, metalColor, { shadow: true, edge: true });
		box3D(sc, [0, -0.09, z0], [0.15, 0.16, 0.12], 0, bodyColor, { shadow: true, edge: true });
		// Cooling fins & rear GigE connector
		[-0.04, 0, 0.04].forEach(function (fz) {
			box3D(sc, [0, -0.10, z0 + fz], [0.162, 0.10, 0.012], 0, metalColor, { edge: true });
		});
		box3D(sc, [0, -0.185, z0 - 0.01], [0.05, 0.03, 0.045], 0, '#0f172a', { edge: true });
		// C-mount lens barrel & tapered hood
		cylinder3D(sc, [0, -0.01, z0], [0, 0.025, z0], 0.050, metalColor, { segments: 16, edge: true });
		taperedCylinder3D(sc, [0, 0.025, z0], [0, 0.055, z0], 0.048, 0.056, dark ? '#1f242c' : '#24292f', { segments: 16, edge: true });
		cylinder3D(sc, [0, 0.048, z0], [0, 0.056, z0], 0.038, '#0891b2', { segments: 16, shade: false });

		// Camera coordinate frame axes {camera}: X right (red), Y down (green), Z forward into scene (blue)
		var R_cam = { x: [1, 0, 0], y: [0, 0, -1], z: [0, 1, 0] };
		axes3D(sc, O, R_cam, 0.22, '{camera}');

		// Optical axis Z into the scene
		var optEnd = [0, 2.6, z0];
		line3D(sc, O, optEnd, {
			stroke: 'var(--w3d-z, #1864ab)',
			'stroke-width': '1.5',
			'stroke-dasharray': '5 4',
			opacity: '0.65'
		});
		label3D(sc, [0, 2.45, z0], 'optical axis +Z', { fill: 'var(--w3d-z, #1864ab)', size: 10, mono: true, dy: 14 });

		// Sensor plane at distance ds along optical axis
		var ds = 0.35 * (fx / 800);
		var ws = ds * (320 / fx);
		var hs = ds * (240 / fy);

		var cTL = [-ws, ds, z0 + hs]; // u=0, v=0
		var cTR = [ws, ds, z0 + hs];  // u=640, v=0
		var cBR = [ws, ds, z0 - hs];  // u=640, v=480
		var cBL = [-ws, ds, z0 - hs]; // u=0, v=480

		// Frustum wireframe from camera origin O to sensor corners
		var frustumStyle = { stroke: 'var(--wp-link, #461d7c)', 'stroke-width': '1.2', opacity: '0.65' };
		[cTL, cTR, cBR, cBL].forEach(function (corner) {
			line3D(sc, O, corner, frustumStyle);
		});

		// Sensor plane rectangle
		var sensorFill = dark ? '#21262d' : '#f6f8fa';
		var sensorPoly = face3D(sc, [cTL, cTR, cBR, cBL], sensorFill, {
			cull: false,
			shade: false,
			attrs: {
				'fill-opacity': dark ? '0.55' : '0.45',
				stroke: 'var(--wp-link, #461d7c)',
				'stroke-width': '1.5'
			}
		});
		if (sensorPoly) {
			sc.items.push({ depth: pr3(sc, [0, ds, z0]).depth - 0.005, nodes: [sensorPoly] });
		}

		// Crosshairs on sensor plane through principal point (cx, cy)
		line3D(sc, [-ws, ds, z0], [ws, ds, z0], {
			stroke: 'var(--wp-border, #72777d)',
			'stroke-width': '1',
			'stroke-dasharray': '2 2',
			opacity: '0.85'
		});
		line3D(sc, [0, ds, z0 + hs], [0, ds, z0 - hs], {
			stroke: 'var(--wp-border, #72777d)',
			'stroke-width': '1',
			'stroke-dasharray': '2 2',
			opacity: '0.85'
		});
		dot3D(sc, [0, ds, z0], 2.5, { fill: 'var(--wp-text, #202122)' });

		// Labels on sensor plane (placed away from center so chips don't collide)
		label3D(sc, cTL, '(0,0)', { dx: -26, dy: -6, size: 8.5, fill: 'var(--wp-text-muted, #72777d)' });
		label3D(sc, cBR, '640×480', { dx: 8, dy: 12, size: 8.5, fill: 'var(--wp-text-muted, #72777d)' });
		label3D(sc, [0, ds, z0 + hs], 'sensor (f=' + fx + 'px)', { dx: -44, dy: -16, size: 9.5, fill: 'var(--wp-link, #461d7c)', weight: '700' });

		// Pierced point on the sensor plane (u, v)
		var xs = ds * x_norm;
		var zs = z0 - ds * y_norm;
		var pSensor = [xs, ds, zs];

		dot3D(sc, pSensor, inBounds ? 4.5 : 3.5, {
			fill: inBounds ? '#d97706' : '#dc2626',
			stroke: '#ffffff',
			'stroke-width': '1.5'
		}, -0.01);
		label3D(sc, pSensor, '(' + u.toFixed(0) + ', ' + v.toFixed(0) + ')' + (inBounds ? ' px' : ' [out]'), {
			dx: 8,
			dy: 14,
			size: 9.5,
			fill: inBounds ? 'var(--wp-gold-text, #6b5200)' : '#dc2626',
			weight: '700'
		});

		// 3D Target calibration workpiece cube at P(X, Y, Z) mounted on a stand
		var pTarget = [X, Z, z0 - Y];
		cylinder3D(sc, [X, Z, 0], [X, Z, Math.max(0.01, pTarget[2] - 0.03)], 0.010, metalColor, { segments: 8, shadow: true });
		box3D(sc, [X, Z, 0.008], [0.07, 0.07, 0.016], 0, metalColor, { shadow: true });
		box3D(sc, pTarget, [0.06, 0.06, 0.06], 0.3, '#d97706', { shadow: true, edge: true });

		// Target corner marker
		dot3D(sc, pTarget, 5.5, {
			fill: '#fdd023',
			stroke: '#6b5200',
			'stroke-width': '1.8'
		}, -0.02);
		label3D(sc, pTarget, 'P(' + X.toFixed(2) + ', ' + Y.toFixed(2) + ', ' + Z.toFixed(2) + ') m', {
			dx: 10,
			dy: -10,
			size: 10.5,
			fill: 'var(--wp-gold-text, #6b5200)',
			weight: '700'
		});

		// Projection ray: line connecting (0, 0, 0) through (u, v) on sensor plane to (X, Y, Z)
		line3D(sc, O, pTarget, {
			stroke: 'var(--wp-gold-text, #b45309)',
			'stroke-width': '2.5',
			'stroke-linecap': 'round'
		});
		var rayDir = norm3(sub3(pTarget, O));
		line3D(sc, pTarget, add3(pTarget, scale3(rayDir, 0.25)), {
			stroke: 'var(--wp-gold-text, #b45309)',
			'stroke-width': '1.2',
			'stroke-dasharray': '3 3',
			opacity: '0.6'
		});

		// Interactive Component Inspector Highlight
		var sel = stage.activePartId || stage.hoveredPartId;
		if (sel === 'camera') {
			drawHighlightBox3D(sc, [0, -0.09, z0], [0.18, 0.18, 0.15], '#00878a');
		} else if (sel === 'lens') {
			drawHighlightBox3D(sc, [0, 0.035, z0], [0.11, 0.11, 0.11], '#00878a');
		} else if (sel === 'sensor') {
			drawHighlightBox3D(sc, [0, ds, z0], [ws * 2.1, 0.04, hs * 2.1], '#00878a');
		} else if (sel === 'target') {
			drawHighlightBox3D(sc, pTarget, [0.12, 0.12, 0.12], '#d97706');
		} else if (sel === 'ray') {
			line3D(sc, O, pTarget, { stroke: '#00878a', 'stroke-width': '4.5', opacity: '0.75' });
		}

		// Optional 3D callout chips (sync positions dynamically with current focal length & target)
		if (stage.showLabels) {
			var dynPinhole = [
				Object.assign({}, PINHOLE_PARTS[0], { pos: [0, -0.10, z0 + 0.13] }),
				Object.assign({}, PINHOLE_PARTS[1], { pos: [0, 0.04, z0 + 0.09] }),
				Object.assign({}, PINHOLE_PARTS[2], { pos: [-ws, ds, z0 + hs + 0.04] }),
				Object.assign({}, PINHOLE_PARTS[3], { pos: [X, Z, pTarget[2] + 0.07] }),
				Object.assign({}, PINHOLE_PARTS[4], { pos: [X * 0.55, Z * 0.55, z0 - Y * 0.55 - 0.06] })
			];
			dynPinhole.forEach(function (part) {
				drawCalloutChip3D(sc, part, stage.activePartId === part.id, stage.hoveredPartId === part.id, dark, stage);
			});
		}

		renderScene3D(svg, sc);

		// 2D Viewfinder HUD in the top-right corner of SVG (now clear of docked toolbar!)
		var hudW = 114, hudH = 88, hudX = W - hudW - 8, hudY = 8;
		var hudBg = s('rect', {
			x: hudX, y: hudY, width: hudW, height: hudH, rx: '5',
			fill: dark ? 'rgba(22,27,34,0.88)' : 'rgba(255,255,255,0.92)',
			stroke: dark ? '#444c56' : '#c8ccd1',
			'stroke-width': '1'
		});
		var hudTitle = s('text', {
			x: hudX + 5, y: hudY + 11, 'font-size': '8px', 'font-weight': '700', 'font-family': 'var(--wp-mono, monospace)',
			fill: 'var(--wp-text-muted, #72777d)'
		});
		hudTitle.textContent = 'Viewfinder 640×480';
		var hudBox = s('rect', {
			x: hudX + 5, y: hudY + 15, width: 104, height: 58, rx: '2',
			fill: dark ? '#0d1117' : '#f0f3f6', stroke: 'var(--wp-link, #461d7c)', 'stroke-width': '1'
		});
		var hudCx = hudX + 5 + 104 * (cx / 640);
		var hudCy = hudY + 15 + 58 * (cy / 480);
		var hudChX = s('line', {
			x1: hudX + 5, y1: hudCy, x2: hudX + 109, y2: hudCy,
			stroke: 'var(--wp-border, #a2a9b1)', 'stroke-dasharray': '2 2', 'stroke-width': '0.7'
		});
		var hudChY = s('line', {
			x1: hudCx, y1: hudY + 15, x2: hudCx, y2: hudY + 73,
			stroke: 'var(--wp-border, #a2a9b1)', 'stroke-dasharray': '2 2', 'stroke-width': '0.7'
		});
		// Projected 3D cube size scales inversely with Z (perspective foreshortening!)
		var boxHalfPx = clampN((0.03 * fx / Z) * (104 / 640), 1.5, 18);
		var uClamped = Math.max(0, Math.min(640, u));
		var vClamped = Math.max(0, Math.min(480, v));
		var hudPx = hudX + 5 + 104 * (uClamped / 640);
		var hudPy = hudY + 15 + 58 * (vClamped / 480);
		var hudCube = s('rect', {
			x: (hudPx - boxHalfPx).toFixed(1), y: (hudPy - boxHalfPx).toFixed(1),
			width: (boxHalfPx * 2).toFixed(1), height: (boxHalfPx * 2).toFixed(1),
			fill: 'rgba(217,119,6,0.28)', stroke: '#d97706', 'stroke-width': '1'
		});
		var hudDot = s('circle', {
			cx: hudPx.toFixed(1), cy: hudPy.toFixed(1), r: '2.8',
			fill: inBounds ? '#d97706' : '#dc2626', stroke: '#ffffff', 'stroke-width': '1'
		});
		var hudCoord = s('text', {
			x: hudX + 5, y: hudY + 83, 'font-size': '8px', 'font-family': 'var(--wp-mono, monospace)',
			fill: inBounds ? 'var(--wp-text, #202122)' : '#dc2626'
		});
		hudCoord.textContent = 'u=' + u.toFixed(0) + ' v=' + v.toFixed(0) + (inBounds ? ' px' : ' [out]');
		var hudGroup = s('g', { 'class': 'w3d-hud', 'aria-hidden': 'true' });
		hudGroup.appendChild(hudBg);
		hudGroup.appendChild(hudTitle);
		hudGroup.appendChild(hudBox);
		hudGroup.appendChild(hudChX);
		hudGroup.appendChild(hudChY);
		if (inBounds) hudGroup.appendChild(hudCube);
		hudGroup.appendChild(hudDot);
		hudGroup.appendChild(hudCoord);
		svg.appendChild(hudGroup);

		readout.textContent = '[X, Y, Z] = [' + X.toFixed(2) + ', ' + Y.toFixed(2) + ', ' +
			Z.toFixed(2) + '] m · Normalized: x\' = ' + x_norm.toFixed(3) + ', y\' = ' +
			y_norm.toFixed(3) + ' · Pixel: u = ' + fx + '×' + x_norm.toFixed(3) + ' + 320 = ' +
			u.toFixed(1) + ' px, v = ' + fy + '×' + y_norm.toFixed(3) + ' + 240 = ' +
			v.toFixed(1) + ' px ' + (inBounds ? '(inside frame)' : '(outside frame!)') + '.';

		var fovH = (2 * Math.atan(320 / fx) * 180 / Math.PI).toFixed(1);
		var fovV = (2 * Math.atan(240 / fy) * 180 / Math.PI).toFixed(1);
		var msg = 'Camera horizontal FOV: ' + fovH + '°, vertical FOV: ' + fovV + '°. ' +
			(inBounds ? 'Projection ray passes through pixel (' + u.toFixed(1) + ', ' + v.toFixed(1) + ') on the sensor plane.' :
				'⚠️ Target point projects outside the 640×480 sensor frame.');
		if (status.textContent !== msg) status.textContent = msg;
	}

	orbitControls(svg, cam, redraw, Object.assign(ctl, {
		onTap: function (pt) {
			var sc = newScene3D(cam, W, H, light);
			var nearest = null, minDist = 28;
			PINHOLE_PARTS.forEach(function (part) {
				var pr = pr3(sc, part.pos);
				var d = Math.hypot(pt.x - pr.u, pt.y - pr.v);
				if (d < minDist) { minDist = d; nearest = part; }
			});
			stage.selectPart(nearest ? nearest.id : null);
		},
		hover: function (pt) {
			var sc = newScene3D(cam, W, H, light);
			var nearest = null, minDist = 24;
			PINHOLE_PARTS.forEach(function (part) {
				var pr = pr3(sc, part.pos);
				var d = Math.hypot(pt.x - pr.u, pt.y - pr.v);
				if (d < minDist) { minDist = d; nearest = part; }
			});
			stage.hoverPart(nearest ? nearest.id : null);
			return nearest ? 'pointer' : null;
		}
	}));

	[sX, sY, sZ, sF].forEach(function (ctrl) {
		ctrl.input.addEventListener('input', redraw);
	});

	function setParams(x, y, z, f) {
		if (x !== undefined) sX.input.value = x;
		if (y !== undefined) sY.input.value = y;
		if (z !== undefined) sZ.input.value = z;
		if (f !== undefined) sF.input.value = f;
		redraw();
	}

	var btnWorked = button('Worked example ([0.10, 0.05, 1.00] m)', function () {
		setParams(0.10, 0.05, 1.00, 800);
	}, 'Load the lesson worked example point [0.10, 0.05, 1.00] m');

	var btnCenter = button('Optical center ([0.0, 0.0, 1.00] m)', function () {
		setParams(0.00, 0.00, 1.00);
	}, 'Position target point directly on optical axis at [0.0, 0.0, 1.00] m');

	var btnClose = button('Closer point (Z=0.50 m)', function () {
		setParams(undefined, undefined, 0.50);
	}, 'Move target point closer to camera at Z = 0.50 m');

	var buttons = h('div', { 'class': 'widget-buttons', role: 'group', 'aria-label': 'Point presets' }, [btnWorked, btnCenter, btnClose]);

	var hint = h('p', { 'class': 'widget-note w3d-hint', text: 'Drag anywhere to orbit the camera; pinch or Ctrl + scroll to zoom. Use floating toolbar for view presets and auto-rotate turntable.' });

	root.replaceChildren(frame('3D pinhole camera frustum: 3D scene to 2D pixels', [
		h('p', { 'class': 'widget-note', text: 'Intrinsic matrix K projects 3D camera coordinates to 2D pixels: normalized x\'=X/Z, y\'=Y/Z; then u = fx·x\' + cx, v = fy·y\' + cy.' }),
		buttons,
		stage.wrap,
		hint,
		readout,
		status,
		sX.row,
		sY.row,
		sZ.row,
		sF.row,
		az.row,
		el.row
	]));

	draw();
}

/* ---------- 3D articulated robot arm (lesson 1.3) ---------- */

function initRobotArm3D(root) {
	var L0 = 0.14, L1 = 0.32, L2 = 0.28, L3 = 0.10, L4 = 0.08, LT = L3 + L4, REACH = L1 + L2 + LT;
	var LIM = [[-170, 170], [-60, 90], [-90, 100], [-100, 100], [-180, 180]];
	var JNAME = ['J1 waist', 'J2 shoulder', 'J3 elbow', 'J4 wrist pitch', 'J5 wrist roll'];
	var labels = ['Joint 1 Waist θ1', 'Joint 2 Shoulder θ2', 'Joint 3 Elbow θ3', 'Joint 4 Wrist Pitch θ4', 'Joint 5 Wrist Roll θ5'];
	var q = [25, 42, -55, 25, 0];
	var js = q.map(function (v, i) { return slider(labels[i], 'arm3d-j' + (i + 1), LIM[i][0], LIM[i][1], 1, v, '°'); });
	var az = slider('Camera azimuth', 'arm3d-az', -180, 180, 1, 35, '°');
	var el = slider('Camera elevation', 'arm3d-el', 5, 89, 1, 24, '°');
	var cbEnv = checkRow3D('arm3d-env', 'Show the reach envelope in the arm’s plane', true);
	var cbFrames = checkRow3D('arm3d-frames', 'Show joint coordinate frames {J1}–{J4}', false);

	var narrow = (root.clientWidth || 600) < 500, W = narrow ? 360 : 560, H = narrow ? 360 : 380;
	var svg = plotFrame(W, H, 'Interactive 3D model of a five-axis articulated robot arm with its base and tool coordinate frames. Drag the gripper handle to move the tool, or drag elsewhere to orbit the camera.');
	svg.classList.add('w3d-canvas');
	var cam = createCamera3D([0.05, 0, 0.3], 2.1, narrow ? 460 : 500, 35, 24);
	var light = norm3([0.4, -0.5, 0.85]);
	var ctl = { az: az, el: el };
	var redraw = frameScheduler(draw);

	var stage = build3DStage(svg, cam, redraw, ctl, {
		title: 'Articulated Robot Arm',
		presets: [
			['3/4', 35, 24, 'Isometric 3/4 view of the articulated arm', 2.1],
			['Front', 90, 8, 'View from the front of the arm', 2.1],
			['Side', 0, 8, 'View from the side of the arm', 2.1],
			['Top', 0, 89, 'View from above', 2.1]
		],
		parts: ROBOT_ARM_PARTS,
		initialLabels: true
	});

	var trail = [], points = [], anim = null, note = '', jogFrame = 'base', dragging = false;
	var pickPos = [0.42, 0.26, 0.075], placePos = [0.30, -0.40, 0.095];
	var workpiecePos = pickPos.slice(), workpieceHeld = false;
	var readout = h('p', { 'class': 'widget-readout' });
	var program = h('p', { 'class': 'widget-readout' });
	var status = h('p', { 'class': 'widget-readout', 'aria-live': 'polite', style: 'margin-top:2px;' });

	function fk(a) {
		var q1 = a[0] * DEG2RAD, q2 = a[1] * DEG2RAD, q23 = q2 + a[2] * DEG2RAD, phi = q23 + a[3] * DEG2RAD, q5 = a[4] * DEG2RAD;
		var c1 = Math.cos(q1), s1 = Math.sin(q1);
		function at(r, z) { return [r * c1, r * s1, z]; }
		var r1 = L1 * Math.sin(q2), z1 = L0 + L1 * Math.cos(q2);
		var r2 = r1 + L2 * Math.sin(q23), z2 = z1 + L2 * Math.cos(q23);
		var r3 = r2 + L3 * Math.sin(phi), z3 = z2 + L3 * Math.cos(phi);
		var toolZ = [Math.sin(phi) * c1, Math.sin(phi) * s1, Math.cos(phi)];
		var pitchV = [Math.cos(phi) * c1, Math.cos(phi) * s1, -Math.sin(phi)], side = [-s1, c1, 0];
		var toolX = norm3(add3(scale3(pitchV, Math.cos(q5)), scale3(side, Math.sin(q5))));
		return {
			shoulder: [0, 0, L0], elbow: at(r1, z1), wrist: at(r2, z2), flange: at(r3, z3),
			tcp: at(r3 + L4 * Math.sin(phi), z3 + L4 * Math.cos(phi)),
			tool: { x: toolX, y: cross3(toolZ, toolX), z: toolZ },
			rWrist: r2, pitch: phi / DEG2RAD, side: side
		};
	}

	function ik(t, pitchDeg, roll, cur) {
		var yaw0 = Math.atan2(t[1], t[0]) / DEG2RAD, rr = Math.hypot(t[0], t[1]), best = null, why = 'the point is out of reach';
		[[yaw0, rr], [yaw0 + 180, -rr]].forEach(function (c) {
			var y = wrapDeg(c[0]);
			if (Math.abs(y + 360 - cur[0]) < Math.abs(y - cur[0])) y += 360;
			else if (Math.abs(y - 360 - cur[0]) < Math.abs(y - cur[0])) y -= 360;
			var ph = (Math.cos((y - cur[0]) * DEG2RAD) >= 0 ? pitchDeg : -pitchDeg) * DEG2RAD, rw = c[1] - LT * Math.sin(ph), zw = t[2] - L0 - LT * Math.cos(ph);
			var D = (rw * rw + zw * zw - L1 * L1 - L2 * L2) / (2 * L1 * L2);
			if (Math.abs(D) > 1) return;
			[cur[2] <= 0 ? -1 : 1, cur[2] <= 0 ? 1 : -1].forEach(function (sg) {
				var q3 = sg * Math.acos(D);
				var q2 = Math.atan2(rw, zw) - Math.atan2(L2 * Math.sin(q3), L1 + L2 * Math.cos(q3));
				var sol = [y, q2 / DEG2RAD, q3 / DEG2RAD, wrapDeg((ph - q2 - q3) / DEG2RAD), roll];
				for (var k = 0; k < 4; k++) {
					if (sol[k] < LIM[k][0] || sol[k] > LIM[k][1]) { why = JNAME[k] + ' would pass its limit'; return; }
				}
				var cost = 0;
				for (var m = 0; m < 4; m++) cost += Math.abs(sol[m] - cur[m]);
				if (!best || cost < best.cost) best = { q: sol, cost: cost };
			});
		});
		return best ? { q: best.q } : { err: why };
	}

	function setQ(a, mode) {
		for (var i = 0; i < 5; i++) {
			q[i] = a[i];
			js[i].input.value = Math.round(a[i]);
			js[i].out.textContent = Math.round(a[i]) + '°';
		}
		var p = fk(q).tcp, last = trail[trail.length - 1];
		if (!last || Math.hypot(p[0] - last.p[0], p[1] - last.p[1], p[2] - last.p[2]) > 0.004) {
			trail.push({ p: p, mode: mode || 'manual' });
			if (trail.length > 260) trail.shift();
		}
		redraw();
	}

	function stopAnim() { if (anim) { cancelAnimationFrame(anim); anim = null; } }

	function moveTcpTo(target, mode) {
		var f = fk(q), r = ik(target, f.pitch, q[4], q);
		if (r.err) { note = 'Cannot move there: ' + r.err + '.'; redraw(); return false; }
		var dJ1 = Math.abs(r.q[0] - q[0]);
		if (dJ1 > 12) {
			note = 'J1 had to turn ' + Math.round(dJ1) + '° for a ' + Math.round(Math.hypot.apply(null, sub3(target, f.tcp)) * 1000) +
				' mm move: the wrist is close to the J1 axis (a shoulder singularity).';
		} else if (note.indexOf('Cannot') === 0) note = '';
		setQ(r.q, mode);
		return true;
	}

	function jog(axis, sign) {
		stopAnim();
		var f = fk(q), dir = jogFrame === 'tool' ? f.tool[axis] : { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[axis];
		moveTcpTo(add3(f.tcp, scale3(dir, 0.01 * sign)), 'manual');
	}

	function play(targets, mode, done) {
		stopAnim();
		if (!targets.length) return;
		if (mode !== 'manual') trail = [];
		var idx = 0, start = q.slice(), t0 = null, dur = 0, startF = null, endF = null;
		function begin() {
			start = q.slice();
			var goal = targets[idx];
			if (mode === 'movel') {
				startF = fk(start); endF = fk(goal);
				dur = Math.max(0.35, Math.hypot.apply(null, sub3(endF.tcp, startF.tcp)) / 0.35);
			} else {
				var dmax = 0;
				for (var k = 0; k < 5; k++) dmax = Math.max(dmax, Math.abs(goal[k] - start[k]));
				dur = Math.max(0.3, dmax / 90);
			}
			if (REDUCED_MOTION) dur = 0.001;
			t0 = null;
		}
		function step(ts) {
			if (t0 === null) t0 = ts;
			var k = Math.min(1, (ts - t0) / 1000 / dur), e = 0.5 - 0.5 * Math.cos(k * Math.PI), goal = targets[idx];
			if (mode === 'movel') {
				var pos = lerp3(startF.tcp, endF.tcp, e);
				var r = ik(pos, startF.pitch + (endF.pitch - startF.pitch) * e, start[4] + (goal[4] - start[4]) * e, q);
				if (r.err) {
					note = 'MoveL stopped between ' + (idx ? 'P' + idx : 'the start') + ' and P' + (idx + 1) + ': ' + r.err +
						' on the straight line. MoveJ would still get there, along a curved path.';
					anim = null; redraw(); return;
				}
				setQ(r.q, mode);
			} else {
				setQ(start.map(function (v, j) { return v + (goal[j] - v) * e; }), mode);
			}
			var curTcp = fk(q).tcp;
			if (Math.hypot(curTcp[0] - pickPos[0], curTcp[1] - pickPos[1], curTcp[2] - pickPos[2]) < 0.045) {
				workpieceHeld = true;
			}
			if (Math.hypot(curTcp[0] - placePos[0], curTcp[1] - placePos[1], curTcp[2] - placePos[2]) < 0.045) {
				workpieceHeld = false;
				workpiecePos = placePos.slice();
			}
			if (k >= 1) {
				idx++;
				if (idx >= targets.length) { anim = null; if (done) done(); redraw(); return; }
				begin();
			}
			anim = requestAnimationFrame(step);
		}
		begin();
		anim = requestAnimationFrame(step);
	}

	function playProgram(mode) {
		if (!points.length) { note = 'Teach at least one point first: move the arm, then press “Teach point”.'; redraw(); return; }
		note = '';
		play(points.map(function (p) { return p.slice(); }), mode, function () {
			note = (mode === 'movel' ? 'MoveL' : 'MoveJ') + ' finished. The ' + (mode === 'movel' ? 'gold' : 'purple') +
				' trail is the path the TCP took' + (mode === 'movel' ? ': straight between points.' : ': joints move together, so the tool path curves.');
		});
	}

	function updateProgram() {
		program.textContent = points.length ? 'Program: ' + points.map(function (p, i) { return 'P' + (i + 1); }).join(' → ') +
			' (' + points.length + ' of 6 points)' : 'Program: empty. Move the arm and press “Teach point” to record a pose.';
	}

	function draw() {
		var dark = isDarkWidget(svg);
		var C = dark ? { link: '#8f6ad6', knuckle: '#b197e6', base: '#6c4bb0', grip: '#9aa1a8', flange: '#c3c8cd' }
			: { link: '#5b2a9e', knuckle: '#7d52c0', base: '#3d1a6e', grip: '#3f4449', flange: '#6b7176' };
		var f = fk(q), sc = newScene3D(cam, W, H, light);

		floorGrid3D(sc, -0.8, 0.8, -0.8, 0.8, 0.2);
		var floorR = Math.sqrt(REACH * REACH - L0 * L0), ring = [];
		for (var c = 0; c <= 48; c++) ring.push([Math.cos(c / 48 * 2 * Math.PI) * floorR, Math.sin(c / 48 * 2 * Math.PI) * floorR, 0]);
		polyline3D(sc, ring, { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1.5', 'stroke-dasharray': '5 4', opacity: '0.8' });
		label3D(sc, [floorR * Math.cos(-0.6), floorR * Math.sin(-0.6), 0], 'reach ' + REACH.toFixed(2) + ' m', { fill: 'var(--wp-gold-text, #6b5200)', size: 10, weight: '400', dy: 12 });

		if (cbEnv.input.checked) {
			var arc = [], c1 = Math.cos(q[0] * DEG2RAD), s1 = Math.sin(q[0] * DEG2RAD);
			for (var a = -60; a <= 180; a += 8) {
				var ang = a * DEG2RAD, r = REACH * Math.sin(ang), z = L0 + REACH * Math.cos(ang);
				if (z >= 0) arc.push([r * c1, r * s1, z]);
			}
			for (var i2 = 1; i2 < arc.length; i2++) {
				line3D(sc, arc[i2 - 1], arc[i2], { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1.2', 'stroke-dasharray': '3 4', opacity: '0.75' });
			}
		}

		// Bolted base pedestal and tapered CAD links with servo end-caps
		cylinder3D(sc, [0, 0, 0], [0, 0, 0.025], 0.165, dark ? '#334155' : '#475569', { segments: 20, shadow: true, edge: true });
		for (var fb = 0; fb < 6; fb++) {
			var fba = (fb / 6) * Math.PI * 2;
			dot3D(sc, [Math.cos(fba) * 0.145, Math.sin(fba) * 0.145, 0.026], 2.2, { fill: '#94a3b8' });
		}
		taperedCylinder3D(sc, [0, 0, 0.025], [0, 0, L0], 0.135, 0.115, C.base, { segments: 20, shadow: true, edge: true });
		axes3D(sc, [0, 0, 0.002], null, 0.3, '{base}');
		var shAxis = f.side;
		cylinder3D(sc, add3(f.shoulder, scale3(shAxis, -0.085)), add3(f.shoulder, scale3(shAxis, 0.085)), 0.068, C.knuckle, { shadow: true, edge: true });
		cylinder3D(sc, add3(f.shoulder, scale3(shAxis, 0.085)), add3(f.shoulder, scale3(shAxis, 0.10)), 0.052, '#1f2937', { segments: 14 });
		taperedCylinder3D(sc, f.shoulder, f.elbow, 0.056, 0.044, C.link, { shadow: true, edge: true });
		cylinder3D(sc, add3(f.elbow, scale3(shAxis, -0.070)), add3(f.elbow, scale3(shAxis, 0.070)), 0.056, C.knuckle, { shadow: true, edge: true });
		cylinder3D(sc, add3(f.elbow, scale3(shAxis, -0.082)), add3(f.elbow, scale3(shAxis, -0.070)), 0.042, '#1f2937', { segments: 12 });
		taperedCylinder3D(sc, f.elbow, f.wrist, 0.044, 0.034, C.link, { shadow: true, edge: true });
		cylinder3D(sc, add3(f.wrist, scale3(shAxis, -0.048)), add3(f.wrist, scale3(shAxis, 0.048)), 0.042, C.knuckle, { segments: 12, edge: true });
		cylinder3D(sc, f.wrist, f.flange, 0.030, C.knuckle, { segments: 12, shadow: true, edge: true });
		cylinder3D(sc, f.flange, add3(f.flange, scale3(f.tool.z, 0.018)), 0.044, C.flange, { segments: 14, edge: true });
		var gc = add3(f.flange, scale3(f.tool.z, 0.032));
		orientedBox3D(sc, gc, [0.022, 0.044, 0.016], f.tool, C.grip, { edge: true });
		var jawHalfGap = workpieceHeld ? 0.025 : 0.034;
		[-1, 1].forEach(function (sg) {
			orientedBox3D(sc, add3(add3(gc, scale3(f.tool.y, jawHalfGap * sg)), scale3(f.tool.z, 0.034)), [0.012, 0.006, 0.024], f.tool, '#d97706', { edge: true });
		});

		if (cbFrames.input.checked) {
			var c1 = Math.cos(q[0] * DEG2RAD), s1 = Math.sin(q[0] * DEG2RAD);
			var R_j1 = { x: [c1, s1, 0], y: [-s1, c1, 0], z: [0, 0, 1] };
			axes3D(sc, [0, 0, L0], R_j1, 0.10, '{J1}');
			var l1_dir = norm3(sub3(f.elbow, f.shoulder));
			axes3D(sc, f.shoulder, { x: l1_dir, y: f.side, z: cross3(l1_dir, f.side) }, 0.10, '{J2}');
			var l2_dir = norm3(sub3(f.wrist, f.elbow));
			axes3D(sc, f.elbow, { x: l2_dir, y: f.side, z: cross3(l2_dir, f.side) }, 0.10, '{J3}');
			axes3D(sc, f.wrist, f.tool, 0.09, '{J4}');
		}

		cylinder3D(sc, [pickPos[0], pickPos[1], 0], [pickPos[0], pickPos[1], 0.05], 0.065, dark ? '#334155' : '#475569', { segments: 14, shadow: true, edge: true });
		label3D(sc, [pickPos[0], pickPos[1], 0], 'pick pedestal', { dx: 6, dy: 14, size: 9, weight: '400' });

		cylinder3D(sc, [placePos[0], placePos[1], 0], [placePos[0], placePos[1], 0.07], 0.065, dark ? '#334155' : '#475569', { segments: 14, shadow: true, edge: true });
		label3D(sc, [placePos[0], placePos[1], 0], 'place pedestal', { dx: 6, dy: 14, size: 9, weight: '400' });

		var wpCur = workpieceHeld ? add3(f.tcp, [0, 0, -0.022]) : workpiecePos;
		box3D(sc, wpCur, [0.042, 0.042, 0.042], 0, '#06b6d4', { shadow: !workpieceHeld, edge: true });
		label3D(sc, wpCur, 'workpiece', { dx: 8, dy: -8, size: 9, fill: '#0891b2', weight: '700' });

		points.forEach(function (p, i) {
			var tp = fk(p).tcp;
			dot3D(sc, tp, 4.5, { fill: 'var(--wp-gold-soft, #fff8d6)', stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '2' });
			label3D(sc, tp, 'P' + (i + 1), { dx: 6, dy: 12, fill: 'var(--wp-gold-text, #6b5200)', size: 11 });
		});
		for (var t = 1; t < trail.length; t++) {
			var md = trail[t].mode;
			line3D(sc, trail[t - 1].p, trail[t].p, {
				stroke: md === 'movel' ? 'var(--wp-gold-text, #6b5200)' : 'var(--wp-link, #461d7c)',
				'stroke-width': md === 'manual' ? '1.5' : '2.5', 'stroke-dasharray': md === 'manual' ? '3 3' : 'none',
				opacity: (0.25 + 0.75 * t / trail.length).toFixed(2), 'stroke-linecap': 'round'
			});
		}

		axes3D(sc, f.tcp, f.tool, 0.14, '{tool}');
		var tcpPr = pr3(sc, f.tcp);
		if (!anim) {
			sc.items.push({ depth: tcpPr.depth - 0.01, nodes: [s('circle', { cx: tcpPr.u.toFixed(1), cy: tcpPr.v.toFixed(1), r: dragging ? '15' : '12',
				'class': 'w3d-handle' + (dragging ? ' w3d-handle-active' : '') })] });
		}

		// Interactive Component Inspector Highlight
		var sel = stage.activePartId || stage.hoveredPartId;
		if (sel === 'base') {
			drawHighlightBox3D(sc, [0, 0, L0 * 0.5], [0.30, 0.30, L0 * 1.1], '#7d52c0');
		} else if (sel === 'shoulder') {
			drawHighlightBox3D(sc, f.shoulder, [0.22, 0.22, 0.22], '#7d52c0');
		} else if (sel === 'elbow') {
			drawHighlightBox3D(sc, f.elbow, [0.20, 0.20, 0.20], '#7d52c0');
		} else if (sel === 'wrist') {
			drawHighlightBox3D(sc, f.wrist, [0.16, 0.16, 0.16], '#7d52c0');
		} else if (sel === 'tool') {
			drawHighlightBox3D(sc, f.tcp, [0.16, 0.16, 0.16], '#d97706');
		} else if (sel === 'workpiece') {
			drawHighlightBox3D(sc, wpCur, [0.08, 0.08, 0.08], '#06b6d4');
		}

		// Optional 3D callout chips
		if (stage.showLabels) {
			var dynamicParts = [
				{ id: 'base', badge: 'J1', title: 'Base Joint {J1}', shortTitle: 'J1', pos: [0, 0, L0 * 0.45] },
				{ id: 'shoulder', badge: 'J2', title: 'Shoulder Joint {J2}', shortTitle: 'J2', pos: add3(f.shoulder, [0, 0, 0.09]) },
				{ id: 'elbow', badge: 'J3', title: 'Elbow Joint {J3}', shortTitle: 'J3', pos: add3(f.elbow, [0, 0, 0.08]) },
				{ id: 'wrist', badge: 'J4', title: 'Wrist {J4/J5}', shortTitle: 'J4', pos: add3(f.wrist, [0, 0, 0.08]) },
				{ id: 'tool', badge: 'TCP', title: 'Gripper & TCP {tool}', shortTitle: 'TCP', pos: add3(f.tcp, [0, 0, 0.09]) },
				{ id: 'workpiece', badge: 'WP', title: 'Workpiece', shortTitle: 'WP', pos: add3(wpCur, [0, 0, 0.06]) }
			];
			dynamicParts.forEach(function (part) {
				drawCalloutChip3D(sc, part, stage.activePartId === part.id, stage.hoveredPartId === part.id, dark, stage);
			});
		}

		renderScene3D(svg, sc);

		readout.textContent = 'TCP in {base}: X ' + signed(f.tcp[0], 3) + ' m, Y ' + signed(f.tcp[1], 3) + ' m, Z ' + signed(f.tcp[2], 3) +
			' m | tool pitch ' + Math.round(f.pitch) + '°, roll ' + Math.round(q[4]) + '° | ' +
			Math.round(Math.hypot.apply(null, sub3(f.tcp, f.shoulder)) / REACH * 100) + '% of reach';

		var msg;
		if (Math.abs(f.rWrist) < 0.03) {
			msg = '⚠️ Shoulder singularity: the wrist centre is on the J1 axis, so a small sideways move can need a large, fast J1 turn. Try jogging Y here.';
		} else if (Math.abs(q[2]) < 5) {
			msg = '⚠️ Elbow (boundary) singularity: the upper arm and forearm are in line, so the wrist cannot move further out along the arm. The Jacobian loses rank here.';
		} else {
			msg = 'Pose OK. {tool} follows {base} through the joint chain (forward kinematics); dragging the handle or jogging solves it backwards (inverse kinematics).';
		}
		if (note) msg = note + ' ' + (msg.charAt(0) === '⚠' ? msg : '');
		if (status.textContent !== msg.trim()) status.textContent = msg.trim();
	}

	orbitControls(svg, cam, redraw, Object.assign(ctl, {
		hover: function (pt) {
			var p = projectPoint3D(fk(q).tcp, cam, W, H);
			if (Math.hypot(pt.x - p.u, pt.y - p.v) < 18) return 'move';
			var f0 = fk(q);
			var checkPts = [
				{ id: 'base', pos: [0, 0, L0 * 0.5] },
				{ id: 'shoulder', pos: f0.shoulder },
				{ id: 'elbow', pos: f0.elbow },
				{ id: 'wrist', pos: f0.wrist },
				{ id: 'tool', pos: f0.tcp },
				{ id: 'workpiece', pos: workpieceHeld ? add3(f0.tcp, [0, 0, -0.022]) : workpiecePos }
			];
			var nearest = null, minDist = 22;
			checkPts.forEach(function (cp) {
				var pr = projectPoint3D(cp.pos, cam, W, H);
				var d = Math.hypot(pt.x - pr.u, pt.y - pr.v);
				if (d < minDist) { minDist = d; nearest = cp.id; }
			});
			stage.hoverPart(nearest);
			return nearest ? 'pointer' : null;
		},
		onTap: function (pt) {
			var f0 = fk(q);
			var checkPts = [
				{ id: 'base', pos: [0, 0, L0 * 0.5] },
				{ id: 'shoulder', pos: f0.shoulder },
				{ id: 'elbow', pos: f0.elbow },
				{ id: 'wrist', pos: f0.wrist },
				{ id: 'tool', pos: f0.tcp },
				{ id: 'workpiece', pos: workpieceHeld ? add3(f0.tcp, [0, 0, -0.022]) : workpiecePos }
			];
			var nearest = null, minDist = 26;
			checkPts.forEach(function (cp) {
				var pr = projectPoint3D(cp.pos, cam, W, H);
				var d = Math.hypot(pt.x - pr.u, pt.y - pr.v);
				if (d < minDist) { minDist = d; nearest = cp.id; }
			});
			stage.selectPart(nearest);
		},
		onPointerDown: function (pt) {
			var f0 = fk(q), p = projectPoint3D(f0.tcp, cam, W, H);
			if (Math.hypot(pt.x - p.u, pt.y - p.v) > 20) return null;
			stopAnim();
			dragging = true;
			var start = f0.tcp;
			return {
				cursor: 'move',
				move: function (pt2) { moveTcpTo(add3(start, screenDeltaToWorld(pt2.x - pt.x, pt2.y - pt.y, p.depth, cam)), 'manual'); },
				up: function () { dragging = false; redraw(); }
			};
		},
		onKey: function (e, down) {
			if (!down) return false;
			var map = { a: ['y', 1], d: ['y', -1], w: ['x', 1], s: ['x', -1], r: ['z', 1], f: ['z', -1] }, m = map[e.key.toLowerCase()];
			if (!m) return false;
			jog(m[0], m[1]);
			return true;
		}
	}));

	js.forEach(function (sl, i) {
		sl.input.addEventListener('input', function () {
			stopAnim(); note = '';
			var a = q.slice(); a[i] = Number(sl.input.value);
			setQ(a, 'manual');
		});
	});
	cbEnv.input.addEventListener('change', redraw);
	cbFrames.input.addEventListener('change', redraw);

	function preset(text, a, aria) {
		return button(text, function () { note = ''; workpieceHeld = false; workpiecePos = pickPos.slice(); play([a], 'movej'); }, aria);
	}
	var presets = h('div', { 'class': 'widget-buttons' }, [
		preset('Home pose', [0, 20, -20, 0, 0], 'Move the arm to its home pose'),
		preset('Pick pose', [40, 45, -35, -10, 0], 'Move the arm to a pick pose'),
		preset('Place pose', [-45, 40, -30, -10, 90], 'Move the arm to a place pose'),
		preset('Reach limit', [0, 65, 0, 0, 0], 'Stretch the arm out to show the elbow (boundary) singularity'),
		preset('Overhead', [0, -25, 54, -29, 0], 'Put the wrist over the base to show the shoulder singularity')
	]);

	var jogRow = h('div', { 'class': 'widget-buttons w3d-jog', role: 'group', 'aria-label': 'Jog the tool in a straight line' }, [
		h('span', { 'class': 'w3d-view-label', text: 'Jog TCP' })
	]);
	var frameBtn = button('Frame: {base}', function () {
		jogFrame = jogFrame === 'base' ? 'tool' : 'base';
		frameBtn.textContent = 'Frame: {' + jogFrame + '}';
		frameBtn.setAttribute('aria-pressed', jogFrame === 'tool' ? 'true' : 'false');
	}, 'Switch the jog frame between base and tool');
	frameBtn.setAttribute('aria-pressed', 'false');
	jogRow.appendChild(frameBtn);
	[['x', -1], ['x', 1], ['y', -1], ['y', 1], ['z', -1], ['z', 1]].forEach(function (j) {
		var txt = j[0].toUpperCase() + (j[1] > 0 ? '+' : '−');
		jogRow.appendChild(holdButton(txt, function () { jog(j[0], j[1]); }, 'Jog the TCP 1 cm along ' + txt + ' (hold to repeat)'));
	});

	var progRow = h('div', { 'class': 'widget-buttons' }, [
		button('Teach point', function () {
			if (points.length >= 6) points.shift();
			points.push(q.slice()); note = 'Taught P' + points.length + '.'; updateProgram(); redraw();
		}, 'Record the current pose as the next program point'),
		button('Play MoveJ', function () { playProgram('movej'); }, 'Play the taught points with joint interpolation'),
		button('Play MoveL', function () { playProgram('movel'); }, 'Play the taught points with straight-line tool motion'),
		button('Demo program', function () {
			workpieceHeld = false; workpiecePos = pickPos.slice();
			var seed = [30, 30, 70, 80, 0], prog = [];
			[[0.42, 0.26, 0.24, 0], [0.42, 0.26, 0.10, 0], [0.42, 0.26, 0.24, 0], [0.30, -0.40, 0.24, 90], [0.30, -0.40, 0.12, 90]].some(function (c) {
				var r = { err: 1 };
				[180, 165, 150].some(function (pitch) { r = ik([c[0], c[1], c[2]], pitch, c[3], seed); return !r.err; });
				if (r.err) { prog = null; return true; }
				prog.push(r.q); seed = r.q;
				return false;
			});
			points = prog || [[45, 40, -35, -10, 0], [45, 20, -20, -10, 0], [-45, 20, -20, -10, 45], [-45, 42, -32, -10, 90]];
			updateProgram(); note = 'Loaded a pick-and-place (approach, pick, lift, approach, place). Play it as MoveJ, then as MoveL, and compare the trails.'; redraw();
		}, 'Load a five-point pick-and-place program'),
		button('Clear points', function () { points = []; trail = []; note = ''; workpieceHeld = false; workpiecePos = pickPos.slice(); updateProgram(); redraw(); }, 'Delete the taught points and the trail')
	]);

	var hint = h('p', { 'class': 'widget-note w3d-hint', text: 'Drag the ringed gripper to move the tool; drag anywhere else to orbit. Pinch or Ctrl + scroll to zoom. Use floating toolbar for view presets and auto-rotate turntable.' });

	updateProgram();
	root.replaceChildren(frame('3D articulated robot arm: joints, frames and jogging', [
		presets,
		stage.wrap,
		hint,
		readout,
		status,
		jogRow,
		progRow,
		program,
		js[0].row, js[1].row, js[2].row, js[3].row, js[4].row, cbEnv.row, cbFrames.row, az.row, el.row
	]));
	draw();
}

/* ---------- 3D AMR with LiDAR, odometry drift and REP 105 frames (lesson 10.1) ---------- */

function initAmrFrames3D(root) {
	var az = slider('Camera azimuth', 'amr3d-az', -180, 180, 1, 30, '°');
	var el = slider('Camera elevation', 'amr3d-el', 5, 89, 1, 42, '°');
	var slip = slider('Wheel slip / odometry drift', 'amr3d-slip', 0, 25, 1, 12, '%');
	var cbLidar = checkRow3D('amr3d-cblidar', 'Show LiDAR beams and hits', true);
	var cbRviz = checkRow3D('amr3d-cbrviz', 'Also draw the scan at the estimated pose, as RViz would (gold)', false);
	var cbCostmap = checkRow3D('amr3d-cbcost', 'Show Nav2 obstacle inflation buffer (ROBOT_R = 0.38 m)', false);
	var cbAmcl = checkRow3D('amr3d-cbamcl', 'Keep AMCL running (corrects map → odom about once a second while driving)', false);
	var cbFollow = checkRow3D('amr3d-cbfollow', 'Camera follows the robot', false);

	var narrow = (root.clientWidth || 600) < 500, W = narrow ? 360 : 560, H = narrow ? 340 : 380;
	var XB = 2.6, YB = 2.0, ROBOT_R = 0.38, LIDAR_Z = 0.315;
	var svg = plotFrame(W, H, 'Interactive 3D warehouse with a mobile robot, its LiDAR scan, an odometry ghost and the map, odom, base_link and lidar_link frames. Click the floor to send a goal; drag to orbit the camera.');
	svg.classList.add('w3d-canvas');
	var cam = createCamera3D([0, 0, 0.2], 6.4, narrow ? 350 : 470, 30, 42);
	var light = norm3([0.4, -0.5, 0.85]);
	var ctl = { az: az, el: el };
	var redraw = frameScheduler(draw);

	var stage = build3DStage(svg, cam, redraw, ctl, {
		title: '3D AMR and REP 105 Frames',
		presets: [
			['3/4', 30, 42, 'Isometric view of warehouse and robot', 6.4],
			['Low', 30, 14, 'Low view across the floor', 6.0],
			['Top', 0, 89, 'View from above, like RViz', 6.4]
		],
		parts: AMR_PARTS,
		initialLabels: true
	});

	var obstacles = [
		{ type: 'box', minX: 1.2, maxX: 2.0, minY: 0.8, maxY: 1.6, h: 0.8, fill: '#b45309', name: 'shelf' },
		{ type: 'cyl', cx: -1.4, cy: -0.9, r: 0.35, h: 1.0, fill: '#0369a1', name: 'column' },
		{ type: 'box', minX: -0.3, maxX: 1.3, minY: -1.6, maxY: -1.2, h: 0.65, fill: '#c2410c', name: 'pallet rack' }
	];
	var truth, odom, m2o, trailT, trailE, goal, route, blocked, uncert, amclClock, loop, lastTs, cmd, burst, note, wheelAngle;
	var keys = {};

	var tfReadout = h('p', { 'class': 'widget-readout' });
	var poseReadout = h('p', { 'class': 'widget-readout' });
	var status = h('p', { 'class': 'widget-readout', 'aria-live': 'polite', style: 'margin-top:2px;' });

	function reset() {
		truth = { x: 0, y: 0, yaw: 0 }; odom = { x: 0, y: 0, yaw: 0 }; m2o = { x: 0, y: 0, yaw: 0 };
		trailT = [[0, 0]]; trailE = [[0, 0]]; goal = null; route = []; blocked = ''; uncert = 0.03; amclClock = 0;
		cmd = { v: 0, w: 0 }; burst = 0; note = ''; wheelAngle = 0;
	}
	reset();

	function compose(a, b) {
		var c = Math.cos(a.yaw), sn = Math.sin(a.yaw);
		return { x: a.x + b.x * c - b.y * sn, y: a.y + b.x * sn + b.y * c, yaw: wrapRad(a.yaw + b.yaw) };
	}
	function estimate() { return compose(m2o, odom); }

	function collides(x, y) {
		if (Math.abs(x) > XB - ROBOT_R || Math.abs(y) > YB - ROBOT_R) return 'the wall';
		for (var i = 0; i < obstacles.length; i++) {
			var o = obstacles[i];
			if (o.type === 'box') {
				var dx = Math.max(o.minX - x, 0, x - o.maxX), dy = Math.max(o.minY - y, 0, y - o.maxY);
				if (Math.hypot(dx, dy) < ROBOT_R) return 'the ' + o.name;
			} else if (Math.hypot(x - o.cx, y - o.cy) < o.r + ROBOT_R) return 'the ' + o.name;
		}
		return '';
	}

	function amcl() {
		var c = Math.cos(truth.yaw - odom.yaw), sn = Math.sin(truth.yaw - odom.yaw);
		m2o = { yaw: wrapRad(truth.yaw - odom.yaw), x: truth.x - (odom.x * c - odom.y * sn), y: truth.y - (odom.x * sn + odom.y * c) };
		uncert = 0.03; amclClock = 0;
		trailE.push(null, [truth.x, truth.y]);
	}

	function integrate(v, w, dt) {
		var sl = Number(slip.input.value) / 100;
		var o = { x: odom.x + v * dt * Math.cos(odom.yaw + w * dt / 2), y: odom.y + v * dt * Math.sin(odom.yaw + w * dt / 2), yaw: wrapRad(odom.yaw + w * dt) };
		var vt = v * (1 - sl), wt = w * (1 + sl * 0.25);
		var t = { x: truth.x + vt * dt * Math.cos(truth.yaw + wt * dt / 2), y: truth.y + vt * dt * Math.sin(truth.yaw + wt * dt / 2), yaw: wrapRad(truth.yaw + wt * dt) };
		var hit = collides(t.x, t.y);
		if (hit && !collides(truth.x, truth.y)) {
			blocked = 'Stopped: the real robot would hit ' + hit + '.' + (Math.hypot(m2o.x, m2o.y) < 0.01 && driftError() > 0.05 ? ' Its odometry thinks it is somewhere else, so try AMCL.' : '');
			goal = null; route = []; cmd = { v: 0, w: 0 }; burst = 0; keys = {};
			return false;
		}
		odom = o; truth = t;
		wheelAngle += vt * dt / 0.085;
		var e = estimate(), lt = trailT[trailT.length - 1], le = trailE[trailE.length - 1];
		if (!lt || Math.hypot(t.x - lt[0], t.y - lt[1]) > 0.03) { trailT.push([t.x, t.y]); if (trailT.length > 500) trailT.shift(); }
		if (!le || Math.hypot(e.x - le[0], e.y - le[1]) > 0.03) { trailE.push([e.x, e.y]); if (trailE.length > 500) trailE.shift(); }
		uncert = Math.min(0.6, uncert + (Math.abs(v) + Math.abs(w) * 0.2) * dt * (0.02 + sl * 0.6));
		if (cbAmcl.input.checked && (v || w)) { amclClock += dt; if (amclClock >= 1) amcl(); }
		return true;
	}

	function driftError() { var e = estimate(); return Math.hypot(truth.x - e.x, truth.y - e.y); }

	function followGoal() {
		if (!goal) return { v: 0, w: 0 };
		var e = estimate(), dx = goal.x - e.x, dy = goal.y - e.y, d = Math.hypot(dx, dy);
		if (d < 0.04) {
			var miss = Math.round(Math.hypot(goal.x - truth.x, goal.y - truth.y) * 100);
			if (route.length) { goal = route.shift(); return { v: 0, w: 0 }; }
			goal = null;
			note = 'Arrived, according to the estimated pose. The real robot is ' + miss + ' cm from the goal' +
				(miss > 4 ? ': that gap is odometry drift. Run AMCL and send the goal again.' : '.');
			return { v: 0, w: 0 };
		}
		var err = wrapRad(Math.atan2(dy, dx) - e.yaw);
		if (Math.abs(err) > 0.2) return { v: 0, w: clampN(3 * err, -1.4, 1.4) };
		return { v: Math.min(0.55, 1.4 * d), w: clampN(2.5 * err, -1.4, 1.4) };
	}

	function teleopCmd() {
		var v = 0, w = 0;
		if (keys.w) v += 0.5; if (keys.s) v -= 0.35; if (keys.a) w += 1.1; if (keys.d) w -= 1.1;
		if (v || w) return { v: v, w: w };
		return cmd;
	}

	function tick(ts) {
		var dt = lastTs === null ? 0.016 : Math.min(0.05, (ts - lastTs) / 1000);
		lastTs = ts;
		var c = teleopCmd();
		if (!(c.v || c.w) && goal) c = followGoal();
		if (burst > 0) { burst -= dt; if (burst <= 0) { cmd = { v: 0, w: 0 }; } }
		if (c.v || c.w) { if (integrate(c.v, c.w, dt)) blocked = ''; }
		draw();
		if (goal || c.v || c.w || keys.w || keys.s || keys.a || keys.d) loop = requestAnimationFrame(tick);
		else loop = null;
	}
	function run() { if (!loop) { lastTs = null; loop = requestAnimationFrame(tick); } }

	function lidarScan(n) {
		var hits = [];
		for (var b = 0; b < n; b++) {
			var ang = truth.yaw + (b / n) * 2 * Math.PI, dx = Math.cos(ang), dy = Math.sin(ang), best = 6;
			var hitObs = false;
			[[(XB - truth.x) / dx, dx > 0], [(-XB - truth.x) / dx, dx < 0], [(YB - truth.y) / dy, dy > 0], [(-YB - truth.y) / dy, dy < 0]]
				.forEach(function (c) { if (c[1] && c[0] > 0 && c[0] < best) { best = c[0]; hitObs = false; } });
			obstacles.forEach(function (o) {
				var t = Infinity;
				if (o.type === 'box') {
					var t1 = (o.minX - truth.x) / dx, t2 = (o.maxX - truth.x) / dx, t3 = (o.minY - truth.y) / dy, t4 = (o.maxY - truth.y) / dy;
					var tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4)), tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
					if (tmax >= tmin && tmin > 0) t = tmin;
				} else {
					var vx = o.cx - truth.x, vy = o.cy - truth.y, tp = vx * dx + vy * dy, d2 = vx * vx + vy * vy - tp * tp;
					if (tp > 0 && d2 < o.r * o.r) t = tp - Math.sqrt(o.r * o.r - d2);
				}
				if (t < best) { best = t; hitObs = true; }
			});
			hits.push({ rel: ang - truth.yaw, range: best, hitObstacle: hitObs });
		}
		return hits;
	}

	function robotModel(sc, pose, ghost, dark, ledCol) {
		var c = Math.cos(pose.yaw), sn = Math.sin(pose.yaw);
		function wp(lx, ly, lz) { return [pose.x + lx * c - ly * sn, pose.y + lx * sn + ly * c, lz]; }
		if (ghost) {
			box3D(sc, [pose.x, pose.y, 0.11], [0.68, 0.46, 0.18], pose.yaw, 'none', { attrs: {
				fill: 'var(--wp-gold-soft, #fff8d6)', 'fill-opacity': '0.25', stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1.2', 'stroke-dasharray': '4 3' }, depthBias: -0.05 });
			[1, -1].forEach(function (sg) {
				var gh = [pose.x - 0.24 * sn * sg, pose.y + 0.24 * c * sg, 0.08];
				cylinder3D(sc, add3(gh, [-0.02 * sn * sg, 0.02 * c * sg, 0]), add3(gh, [0.02 * sn * sg, -0.02 * c * sg, 0]), 0.085, 'none', {
					attrs: { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1', 'stroke-dasharray': '3 2' }, depthBias: -0.05
				});
			});
			return;
		}
		// Chamfered industrial AMR base chassis + upper payload deck + front depth camera bar
		var bodyPoly = [[0.28, -0.23], [0.34, -0.15], [0.34, 0.15], [0.28, 0.23], [-0.28, 0.23], [-0.34, 0.15], [-0.34, -0.15], [-0.28, -0.23]]
			.map(function (pt) { return [pose.x + pt[0] * c - pt[1] * sn, pose.y + pt[0] * sn + pt[1] * c]; });
		extrudePoly3D(sc, bodyPoly, 0.035, 0.175, dark ? '#6d44b8' : '#461d7c', { shadow: true, edge: true });
		box3D(sc, [pose.x, pose.y, 0.195], [0.54, 0.36, 0.04], pose.yaw, dark ? '#334155' : '#475569', { edge: true });
		// Front & rear safety LED status light strips
		line3D(sc, wp(0.342, -0.13, 0.095), wp(0.342, 0.13, 0.095), { stroke: ledCol || '#06b6d4', 'stroke-width': '3', 'stroke-linecap': 'round' });
		line3D(sc, wp(-0.342, -0.13, 0.095), wp(-0.342, 0.13, 0.095), { stroke: ledCol || '#06b6d4', 'stroke-width': '2.5', 'stroke-linecap': 'round' });
		// Front depth camera visor
		box3D(sc, wp(0.31, 0, 0.19), [0.05, 0.14, 0.03], pose.yaw, '#111827', { edge: true });

		// Drive wheels with rotating hub spokes
		[1, -1].forEach(function (sg) {
			var hub = [pose.x - 0.24 * sn * sg, pose.y + 0.24 * c * sg, 0.085];
			var ax = [-0.028 * sn * sg, 0.028 * c * sg, 0];
			cylinder3D(sc, sub3(hub, ax), add3(hub, ax), 0.085, '#1e2327', { segments: 16, shadow: true, edge: true });
			var rimAx = [-0.031 * sn * sg, 0.031 * c * sg, 0];
			cylinder3D(sc, add3(hub, scale3(ax, 0.4)), add3(hub, rimAx), 0.050, dark ? '#64748b' : '#94a3b8', { segments: 14 });
			var spOut = add3(hub, [-0.032 * sn * sg, 0.032 * c * sg, 0]);
			var spDir = [Math.cos(wheelAngle) * 0.045, 0, Math.sin(wheelAngle) * 0.045];
			var spWorld = [spDir[0] * c, spDir[0] * sn, spDir[2]];
			line3D(sc, sub3(spOut, spWorld), add3(spOut, spWorld), { stroke: '#1e293b', 'stroke-width': '1.6' });
		});

		var fCaster = [pose.x + 0.25 * c, pose.y + 0.25 * sn, 0.035];
		cylinder3D(sc, fCaster, [pose.x + 0.25 * c, pose.y + 0.25 * sn, 0.07], 0.014, '#64748b', { segments: 8 });
		cylinder3D(sc, add3(fCaster, [-0.012 * sn, 0.012 * c, 0]), add3(fCaster, [0.012 * sn, -0.012 * c, 0]), 0.035, '#2d3339', { segments: 10, shadow: true });

		var rCaster = [pose.x - 0.25 * c, pose.y - 0.25 * sn, 0.035];
		cylinder3D(sc, rCaster, [pose.x - 0.25 * c, pose.y - 0.25 * sn, 0.07], 0.014, '#64748b', { segments: 8 });
		cylinder3D(sc, add3(rCaster, [-0.012 * sn, 0.012 * c, 0]), add3(rCaster, [0.012 * sn, -0.012 * c, 0]), 0.035, '#2d3339', { segments: 10, shadow: true });

		// Heading chevron on payload deck
		var tip = wp(0.24, 0, 0.218), l = wp(0.09, 0.10, 0.218), r = wp(0.09, -0.10, 0.218);
		var chev = face3D(sc, [tip, l, r], '#fdd023', { shade: false });
		sc.items.push({ depth: pr3(sc, [pose.x, pose.y, 0.22]).depth - 0.02, nodes: [chev] });

		// LiDAR mast + 360° puck
		taperedCylinder3D(sc, [pose.x, pose.y, 0.215], [pose.x, pose.y, 0.275], 0.040, 0.032, '#64748b', { segments: 12, edge: true });
		cylinder3D(sc, [pose.x, pose.y, 0.275], [pose.x, pose.y, 0.315], 0.07, '#1b1f24', { segments: 16, edge: true });
		cylinder3D(sc, [pose.x, pose.y, 0.315], [pose.x, pose.y, 0.355], 0.064, '#111827', { segments: 16, edge: true });
		cylinder3D(sc, [pose.x, pose.y, 0.328], [pose.x, pose.y, 0.342], 0.066, '#06b6d4', { segments: 16, shade: false });
	}

	function draw() {
		var dark = isDarkWidget(svg);
		if (cbFollow.input.checked) cam.target = [truth.x, truth.y, 0.2];
		else cam.target = [0, 0, 0.2];
		var sc = newScene3D(cam, W, H, light), e = estimate();

		floorGrid3D(sc, -XB, XB, -YB, YB, 0.4);
		// Yellow warehouse safety lane markers on floor
		line3D(sc, [-XB + 0.15, -0.55, 0.002], [XB - 0.15, -0.55, 0.002], { stroke: '#d97706', 'stroke-width': '1.2', 'stroke-dasharray': '8 6', opacity: '0.45' }, 'floor');
		line3D(sc, [-XB + 0.15, 0.55, 0.002], [XB - 0.15, 0.55, 0.002], { stroke: '#d97706', 'stroke-width': '1.2', 'stroke-dasharray': '8 6', opacity: '0.45' }, 'floor');
		var corners = [[-XB, -YB], [XB, -YB], [XB, YB], [-XB, YB]];
		corners.forEach(function (p, i) {
			var nx = corners[(i + 1) % 4];
			line3D(sc, [p[0], p[1], 0], [nx[0], nx[1], 0], { stroke: 'var(--wp-border, #a2a9b1)', 'stroke-width': '2' }, 'floor');
			line3D(sc, [p[0], p[1], 0.4], [nx[0], nx[1], 0.4], { stroke: 'var(--wp-border, #a2a9b1)', 'stroke-width': '1.5' });
			line3D(sc, [p[0], p[1], 0], [p[0], p[1], 0.4], { stroke: 'var(--wp-border, #a2a9b1)', 'stroke-width': '1.5' });
		});

		function pathSegs(list, attrs) {
			var seg = [];
			list.concat([null]).forEach(function (p) {
				if (p) seg.push([p[0], p[1], 0.003]);
				else { polyline3D(sc, seg, attrs); seg = []; }
			});
		}
		pathSegs(trailT, { stroke: 'var(--wp-link, #461d7c)', 'stroke-width': '2', opacity: '0.75', 'stroke-linejoin': 'round' });
		pathSegs(trailE, { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '2', 'stroke-dasharray': '5 4', opacity: '0.9' });

		var ring = [];
		for (var k = 0; k <= 36; k++) ring.push([e.x + Math.cos(k / 36 * 2 * Math.PI) * (uncert + 0.36), e.y + Math.sin(k / 36 * 2 * Math.PI) * (uncert + 0.36), 0.004]);
		polyline3D(sc, ring, { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1', opacity: '0.6' });

		// Detailed warehouse obstacles + optional Nav2 inflation buffer
		obstacles.forEach(function (o) {
			if (o.type === 'box') {
				var cx = (o.minX + o.maxX) / 2, cy = (o.minY + o.maxY) / 2, sx = o.maxX - o.minX, sy = o.maxY - o.minY;
				if (o.name === 'shelf') {
					box3D(sc, [cx, cy, 0.25], [sx, sy, 0.50], 0, o.fill, { shadow: true, edge: true });
					box3D(sc, [cx, cy, 0.54], [sx + 0.04, sy + 0.04, 0.04], 0, '#475569', { edge: true });
					box3D(sc, [cx - 0.16, cy - 0.12, 0.68], [0.28, 0.26, 0.24], 0.1, '#d97706', { edge: true });
					box3D(sc, [cx + 0.16, cy + 0.14, 0.66], [0.24, 0.22, 0.20], -0.1, '#92400e', { edge: true });
				} else {
					box3D(sc, [cx, cy, o.h / 2], [sx, sy, o.h], 0, o.fill, { shadow: true, edge: true });
					box3D(sc, [cx, cy, 0.04], [sx + 0.04, sy + 0.04, 0.06], 0, '#78350f', { edge: true });
				}
				if (cbCostmap.input.checked) {
					var pad = ROBOT_R, ir = [[o.minX - pad, o.minY - pad, 0.004], [o.maxX + pad, o.minY - pad, 0.004],
						[o.maxX + pad, o.maxY + pad, 0.004], [o.minX - pad, o.maxY + pad, 0.004], [o.minX - pad, o.minY - pad, 0.004]];
					polyline3D(sc, ir, { stroke: '#dc2626', 'stroke-width': '1.5', 'stroke-dasharray': '4 3', opacity: '0.75' });
				}
			} else {
				cylinder3D(sc, [o.cx, o.cy, 0], [o.cx, o.cy, 0.12], o.r + 0.03, '#f59f00', { segments: 20, shadow: true, edge: true });
				cylinder3D(sc, [o.cx, o.cy, 0.12], [o.cx, o.cy, o.h], o.r, o.fill, { segments: 20, edge: true });
				if (cbCostmap.input.checked) {
					var cr2 = [];
					for (var ci = 0; ci <= 28; ci++) cr2.push([o.cx + Math.cos(ci / 28 * Math.PI * 2) * (o.r + ROBOT_R), o.cy + Math.sin(ci / 28 * Math.PI * 2) * (o.r + ROBOT_R), 0.004]);
					polyline3D(sc, cr2, { stroke: '#dc2626', 'stroke-width': '1.5', 'stroke-dasharray': '4 3', opacity: '0.75' });
				}
			}
		});

		if (goal || route.length) {
			[goal].concat(route).forEach(function (g, i) {
				if (!g) return;
				var gi = [];
				for (var k2 = 0; k2 <= 24; k2++) gi.push([g.x + Math.cos(k2 / 24 * 2 * Math.PI) * 0.1, g.y + Math.sin(k2 / 24 * 2 * Math.PI) * 0.1, 0.004]);
				polyline3D(sc, gi, { stroke: '#2b8a3e', 'stroke-width': '2.5' });
				line3D(sc, [g.x, g.y, 0], [g.x, g.y, 0.45], { stroke: '#2b8a3e', 'stroke-width': '2' });
				if (i === 0) label3D(sc, [g.x, g.y, 0.45], 'goal', { fill: 'var(--w3d-y, #2b8a3e)', size: 11, mono: false });
			});
		}

		axes3D(sc, [0, 0, 0.004], null, 0.45, '{map}');
		if (Math.hypot(m2o.x, m2o.y) > 0.02 || Math.abs(m2o.yaw) > 0.03) {
			var cm = Math.cos(m2o.yaw), sm = Math.sin(m2o.yaw);
			axes3D(sc, [m2o.x, m2o.y, 0.006], { x: [cm, sm, 0], y: [-sm, cm, 0], z: [0, 0, 1] }, 0.35, '{odom}');
		}

		var drift = driftError();
		var ledCol = blocked ? '#dc2626' : (drift > 0.08 ? '#f59f00' : '#06b6d4');
		if (drift > 0.03) robotModel(sc, e, true, dark);
		robotModel(sc, truth, false, dark, ledCol);
		var cr = Math.cos(truth.yaw), sr = Math.sin(truth.yaw), R = { x: [cr, sr, 0], y: [-sr, cr, 0], z: [0, 0, 1] };
		axes3D(sc, [truth.x, truth.y, 0.005], R, 0.3, '{base_link}');
		axes3D(sc, [truth.x, truth.y, LIDAR_Z], R, 0.2, '{lidar_link}');

		if (cbLidar.input.checked || cbRviz.input.checked) {
			var hits = lidarScan(48), lo = [truth.x, truth.y, LIDAR_Z];
			hits.forEach(function (hb) {
				if (cbLidar.input.checked) {
					var hp = [truth.x + hb.range * Math.cos(truth.yaw + hb.rel), truth.y + hb.range * Math.sin(truth.yaw + hb.rel), LIDAR_Z];
					var isObs = hb.hitObstacle;
					line3D(sc, lo, hp, {
						stroke: isObs ? 'var(--w3d-hit, #0891b2)' : 'var(--w3d-beam, rgba(8,145,178,0.25))',
						'stroke-width': isObs ? '1.5' : '1',
						opacity: isObs ? '0.85' : '0.6'
					});
					dot3D(sc, hp, isObs ? 3.2 : 2.2, {
						fill: isObs ? '#22d3ee' : 'var(--w3d-hit, #0891b2)',
						stroke: isObs ? '#ffffff' : 'none',
						'stroke-width': isObs ? '0.8' : '0'
					}, -0.01);
					if (isObs) {
						line3D(sc, [hp[0], hp[1], hp[2] - 0.035], [hp[0], hp[1], hp[2] + 0.035], {
							stroke: '#22d3ee',
							'stroke-width': '1.5'
						});
					}
				}
				if (cbRviz.input.checked) {
					dot3D(sc, [e.x + hb.range * Math.cos(e.yaw + hb.rel), e.y + hb.range * Math.sin(e.yaw + hb.rel), LIDAR_Z], 2.4,
						{ fill: '#f59f00', stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '0.6' }, -0.012);
				}
			});
		}

		// Interactive Component Inspector Highlight
		var sel = stage.activePartId || stage.hoveredPartId;
		if (sel === 'chassis') {
			drawHighlightBox3D(sc, [truth.x, truth.y, 0.11], [0.72, 0.50, 0.22], '#7c55c4');
		} else if (sel === 'drive') {
			drawHighlightBox3D(sc, [truth.x, truth.y, 0.08], [0.35, 0.58, 0.18], '#7c55c4');
		} else if (sel === 'lidar') {
			drawHighlightBox3D(sc, [truth.x, truth.y, LIDAR_Z], [0.20, 0.20, 0.18], '#06b6d4');
		} else if (sel === 'base_link') {
			drawHighlightBox3D(sc, [truth.x, truth.y, 0.02], [0.45, 0.45, 0.06], '#d92b2b');
		} else if (sel === 'odom') {
			drawHighlightBox3D(sc, [e.x, e.y, 0.11], [0.72, 0.50, 0.22], '#d97706');
		} else if (sel === 'map') {
			drawHighlightBox3D(sc, [0, 0, 0.02], [0.60, 0.60, 0.06], '#2b8a3e');
		}

		// Optional 3D callout chips (spread out radially so numbers 1..6 don't pile at origin)
		if (stage.showLabels) {
			var dynamicParts = [
				{ id: 'chassis', badge: '1', title: 'Chassis', pos: [truth.x - 0.24, truth.y - 0.16, 0.25] },
				{ id: 'drive', badge: '2', title: 'Drive Wheels', pos: [truth.x - 0.02, truth.y + 0.30, 0.16] },
				{ id: 'lidar', badge: '3', title: 'LiDAR {lidar_link}', pos: [truth.x, truth.y, 0.46] },
				{ id: 'base_link', badge: '4', title: '{base_link}', pos: [truth.x + 0.38, truth.y, 0.08] },
				{ id: 'odom', badge: '5', title: '{odom}', pos: [e.x + 0.20, e.y - 0.26, 0.24] },
				{ id: 'map', badge: '6', title: '{map}', pos: [-0.36, 0.36, 0.12] }
			];
			dynamicParts.forEach(function (part) {
				drawCalloutChip3D(sc, part, stage.activePartId === part.id, stage.hoveredPartId === part.id, dark, stage);
			});
		}

		renderScene3D(svg, sc);

		function pose(p) { return '(' + signed(p.x, 2) + ', ' + signed(p.y, 2) + ' m, ' + Math.round(p.yaw / DEG2RAD) + '°)'; }
		tfReadout.textContent = 'TF tree: map → odom ' + pose(m2o) + ' → base_link ' + pose(odom) + ' → lidar_link (0, 0, +' + LIDAR_Z.toFixed(2) + ' m)';
		poseReadout.textContent = 'Estimated pose (map → base_link) ' + pose(e) + ' | true pose ' + pose(truth) + ' | error ' +
			Math.round(drift * 100) + ' cm, ' + Math.abs(Math.round(wrapRad(truth.yaw - e.yaw) / DEG2RAD)) + '°';

		var msg = blocked || note;
		if (!msg) {
			if (drift > 0.03) msg = '⚠️ Odometry drift: the gold ghost is where odometry puts the robot, away from the real one' +
				' (the error is in the line above). Turn on the RViz scan to see it miss the walls, then press “Run AMCL”.';
			else msg = 'Odometry and the real robot agree. Click the floor to send a goal, hold the drive buttons, or raise the wheel slip and drive.';
		}
		if (status.textContent !== msg) status.textContent = msg;
	}

	orbitControls(svg, cam, redraw, Object.assign(ctl, {
		onTap: function (pt) {
			var sc = newScene3D(cam, W, H, light);
			var checkPts = [
				{ id: 'chassis', pos: [truth.x, truth.y, 0.11] },
				{ id: 'drive', pos: [truth.x, truth.y + 0.24, 0.08] },
				{ id: 'lidar', pos: [truth.x, truth.y, LIDAR_Z] },
				{ id: 'base_link', pos: [truth.x, truth.y, 0] },
				{ id: 'odom', pos: [e.x, e.y, 0.11] },
				{ id: 'map', pos: [0, 0, 0] }
			];
			var nearest = null, minDist = 24;
			checkPts.forEach(function (cp) {
				var pr = pr3(sc, cp.pos);
				var d = Math.hypot(pt.x - pr.u, pt.y - pr.v);
				if (d < minDist) { minDist = d; nearest = cp.id; }
			});
			if (nearest) { stage.selectPart(nearest); return; }

			var p = unprojectToPlane(pt.x, pt.y, cam, W, H, 0);
			if (!p || Math.abs(p[0]) > XB || Math.abs(p[1]) > YB) return;
			var hit = collides(p[0], p[1]);
			if (hit) { note = 'That goal is too close to ' + hit + ' for the robot to fit.'; blocked = ''; redraw(); return; }
			goal = { x: p[0], y: p[1] }; route = []; note = ''; blocked = '';
			run();
		},
		hover: function (pt) {
			var sc = newScene3D(cam, W, H, light);
			var checkPts = [
				{ id: 'chassis', pos: [truth.x, truth.y, 0.11] },
				{ id: 'drive', pos: [truth.x, truth.y + 0.24, 0.08] },
				{ id: 'lidar', pos: [truth.x, truth.y, LIDAR_Z] },
				{ id: 'base_link', pos: [truth.x, truth.y, 0] },
				{ id: 'odom', pos: [e.x, e.y, 0.11] },
				{ id: 'map', pos: [0, 0, 0] }
			];
			var nearest = null, minDist = 22;
			checkPts.forEach(function (cp) {
				var pr = pr3(sc, cp.pos);
				var d = Math.hypot(pt.x - pr.u, pt.y - pr.v);
				if (d < minDist) { minDist = d; nearest = cp.id; }
			});
			stage.hoverPart(nearest);
			return nearest ? 'pointer' : null;
		},
		onKey: function (ev, down) {
			var k = ev.key.toLowerCase();
			if ('wasd'.indexOf(k) < 0 || k.length !== 1) return false;
			if (down) { keys[k] = true; goal = null; route = []; note = ''; run(); } else keys[k] = false;
			return true;
		},
		onBlur: function () { keys = {}; }
	}));
	[slip].forEach(function (c) { c.input.addEventListener('input', function () { slip.out.textContent = slip.input.value + '%'; }); });
	[cbLidar, cbRviz, cbCostmap, cbAmcl, cbFollow].forEach(function (c) { c.input.addEventListener('change', redraw); });

	function drive(v, w, label) {
		return holdButton(label, function (once) {
			goal = null; route = []; note = '';
			cmd = { v: v, w: w };
			if (once) burst = 0.5;
			run();
		}, 'Drive: ' + label + ' (hold)', function () { if (burst <= 0) cmd = { v: 0, w: 0 }; });
	}
	var driveRow = h('div', { 'class': 'widget-buttons w3d-jog', role: 'group', 'aria-label': 'Drive the robot' }, [
		h('span', { 'class': 'w3d-view-label', text: 'Drive' }),
		drive(0.5, 0, '▲ Forward'), drive(-0.35, 0, '▼ Back'), drive(0, 1.1, '↶ Left'), drive(0, -1.1, '↷ Right')
	]);
	var actRow = h('div', { 'class': 'widget-buttons' }, [
		button('Delivery circuit', function () {
			var pts = [[1.0, -0.6], [1.0, 0.2], [-0.9, 0.6], [-0.7, -0.4], [0, 0]].map(function (p) { return { x: p[0], y: p[1] }; });
			goal = pts.shift(); route = pts; note = ''; blocked = ''; run();
		}, 'Drive a five-waypoint delivery loop using the estimated pose'),
		button('Run AMCL (correct map → odom)', function () { amcl(); note = 'AMCL matched the scan to the map and moved {odom}: map → odom jumped, odom → base_link did not.'; redraw(); },
			'Match the LiDAR scan to the map and update the map-to-odom transform'),
		button('Reset to origin', function () { reset(); if (loop) { cancelAnimationFrame(loop); loop = null; } redraw(); }, 'Reset the robot, odometry and map-to-odom')
	]);
	var hint = h('p', { 'class': 'widget-note w3d-hint', text: 'Click the floor to send a goal (the robot steers by its estimated pose). Drag to orbit; pinch or Ctrl + scroll to zoom. Use floating toolbar for view presets and auto-rotate turntable.' });

	root.replaceChildren(frame('3D AMR, LiDAR and REP 105 frames', [
		driveRow, actRow, stage.wrap, hint, tfReadout, poseReadout, status,
		slip.row, cbAmcl.row, cbLidar.row, cbRviz.row, cbCostmap.row, cbFollow.row, az.row, el.row
	]));
	draw();
}

/* ---------- 3D Arduino Uno R3 Board Explorer (lesson 6.1) ---------- */

function initArduinoUno3D(root) {
	var az = slider('Camera azimuth', 'uno3d-az', -180, 180, 1, 35, '°');
	var el = slider('Camera elevation', 'uno3d-el', -85, 89, 1, 32, '°');
	var sDist = slider('Zoom distance', 'uno3d-dist', 6, 22, 0.5, 11.5, '');

	var narrow = (root.clientWidth || 600) < 500, W = narrow ? 360 : 560, H = narrow ? 340 : 380;
	var svg = plotFrame(W, H, 'Interactive 3D model of an Arduino Uno R3 microcontroller board with ATmega328P DIP package, USB interface, voltage regulator, DC barrel jack, and pin headers. Drag to orbit, pinch or Ctrl+wheel to zoom, click callout chips to inspect components.');
	svg.classList.add('w3d-canvas');

	var cam = createCamera3D([0, 0, 0], narrow ? 12.5 : 11.5, narrow ? 440 : 500, 35, 32);
	cam.minEl = -85;
	cam.maxEl = 89;
	cam.minDist = 5.0;
	cam.maxDist = 24.0;
	cam.home = { azimuth: 35, elevation: 32, dist: narrow ? 12.5 : 11.5 };
	var light = norm3([0.35, -0.6, 0.85]);
	var ctl = { az: az, el: el };
	var redraw = frameScheduler(draw);

	var stage = build3DStage(svg, cam, redraw, ctl, {
		title: 'Arduino Uno R3',
		presets: [
			['3/4', 35, 32, 'Perspective 3/4 view of Uno R3 board', narrow ? 12.5 : 11.5],
			['Top', 0, 88, 'Top-down plan view of components and pin headers', 11.0],
			['Front', 0, 10, 'Front view of USB, barrel jack, and pin headers', 11.5],
			['Bottom', 0, -75, 'Bottom view of PCB solder points and ground plane', 11.5]
		],
		parts: ARDUINO_PARTS,
		initialLabels: true
	});

	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
	var status = h('p', { 'class': 'widget-readout', 'aria-live': 'polite', style: 'margin-top:2px;' });
	var simMode = 'idle', simTimer = null, simPhase = 0;

	function setSimMode(m) {
		simMode = m;
		if (simTimer) { clearInterval(simTimer); simTimer = null; }
		simPhase = 0;
		if (m !== 'idle') {
			simTimer = setInterval(function () { simPhase = (simPhase + 1) % 20; draw(); }, m === 'serial' ? 120 : (m === 'pwm' ? 80 : 450));
		}
		Array.prototype.forEach.call(simRow.querySelectorAll('button'), function (b) {
			b.setAttribute('aria-pressed', b.dataset.mode === m ? 'true' : 'false');
		});
		draw();
	}

	var simRow = h('div', { 'class': 'widget-buttons', role: 'group', 'aria-label': 'Board activity simulation' }, [
		h('span', { 'class': 'w3d-view-label', text: 'Simulate' })
	]);
	[['idle', 'Power ON'], ['blink', 'Blink (Pin 13)'], ['serial', 'Serial TX/RX'], ['pwm', 'PWM ~9']].forEach(function (item) {
		var b = button(item[1], function () { setSimMode(item[0]); }, 'Simulate ' + item[1] + ' on the Uno R3');
		b.dataset.mode = item[0];
		b.setAttribute('aria-pressed', item[0] === 'idle' ? 'true' : 'false');
		simRow.appendChild(b);
	});

	function draw() {
		var dark = isDarkWidget(svg);
		var sc = newScene3D(cam, W, H, light);
		var topView = cam.elevation >= -2;
		sDist.input.value = cam.dist.toFixed(1);
		sDist.out.textContent = cam.dist.toFixed(1);

		// Workbench drop shadow and subtle grid when looking from above
		if (cam.elevation > 0) {
			floorGrid3D(sc, -5.0, 5.0, -4.0, 4.0, 1.0, -1.8);
			shadowPoly3D(sc, [[-3.43, -2.67, -1.8], [3.15, -2.67, -1.8], [3.43, -2.35, -1.8], [3.43, 1.85, -1.8], [3.15, 2.15, -1.8], [3.15, 2.67, -1.8], [-3.43, 2.67, -1.8]]);
		}

		// 1. Authentic Arduino Uno R3 Notched PCB Slab (Teal)
		var pcbColor = dark ? '#00676a' : '#00878a';
		var pcbHalo = dark ? '#00474a' : '#006366';
		var unoPoly = [[-3.43, -2.67], [3.15, -2.67], [3.43, -2.35], [3.43, 1.85], [3.15, 2.15], [3.15, 2.67], [-3.43, 2.67]];
		extrudePoly3D(sc, unoPoly, -0.08, 0.08, pcbColor, { edge: true });

		// PCB Edge copper trim
		for (var ei = 0; ei < unoPoly.length; ei++) {
			var ep1 = unoPoly[ei], ep2 = unoPoly[(ei + 1) % unoPoly.length];
			line3D(sc, [ep1[0], ep1[1], 0.081], [ep2[0], ep2[1], 0.081], { stroke: '#d97706', 'stroke-width': '1', opacity: '0.45' });
		}

		// 2. Mounting Holes (4 M3 holes with gold annular plating rings)
		var holes = [[-2.00, -2.15], [-2.00, 1.80], [1.90, 2.15], [2.80, -2.15]];
		var holeZ = topView ? 0.083 : -0.083;
		holes.forEach(function (hPos) {
			dot3D(sc, [hPos[0], hPos[1], holeZ], 4.4, { fill: dark ? '#0f172a' : '#334155', stroke: '#d97706', 'stroke-width': '2' });
		});

		// 3. USB-B Metal Connector Box (Callout #5)
		var usbCol = dark ? '#8b949e' : '#cbd5e1';
		box3D(sc, [-2.65, 1.30, 0.62], [1.40, 1.20, 1.10], 0, usbCol, { edge: true });
		var usbOpenPoly = face3D(sc, [
			[-3.36, 0.90, 0.30], [-3.36, 1.70, 0.30], [-3.36, 1.70, 0.94], [-3.36, 0.90, 0.94]
		], '#161b22', { shade: false });
		if (usbOpenPoly) sc.items.push({ depth: pr3(sc, [-3.36, 1.30, 0.62]).depth - 0.02, nodes: [usbOpenPoly] });
		var usbTongue = face3D(sc, [
			[-3.34, 1.05, 0.55], [-3.34, 1.55, 0.55], [-3.34, 1.55, 0.68], [-3.34, 1.05, 0.68]
		], '#ffffff', { shade: false });
		if (usbTongue) sc.items.push({ depth: pr3(sc, [-3.34, 1.30, 0.62]).depth - 0.03, nodes: [usbTongue] });

		// 4. DC Power Barrel Jack (Callout #4)
		box3D(sc, [-2.60, -1.65, 0.60], [1.45, 0.95, 1.05], 0, '#1f2428', { edge: true });
		cylinder3D(sc, [-3.30, -1.65, 0.60], [-3.48, -1.65, 0.60], 0.32, '#374151', { segments: 14, edge: true });
		cylinder3D(sc, [-3.30, -1.65, 0.60], [-3.50, -1.65, 0.60], 0.09, '#cbd5e1', { segments: 8 });

		// 5. Digital Pin Headers (Callout #6)
		box3D(sc, [1.65, 2.30, 0.45], [2.54, 0.35, 0.65], 0, '#161b22', { edge: true });
		if (topView) {
			for (var p1 = 0; p1 < 10; p1++) {
				var isPin13 = (p1 === 5 && simMode === 'blink' && simPhase % 2 === 0);
				var isPin9 = (p1 === 1 && simMode === 'pwm');
				dot3D(sc, [0.50 + p1 * 0.254, 2.30, 0.78], isPin13 || isPin9 ? 2.6 : 1.6, {
					fill: isPin13 ? '#f59f00' : (isPin9 ? '#22d3ee' : '#484f58')
				});
			}
		}
		box3D(sc, [-0.85, 2.30, 0.45], [2.03, 0.35, 0.65], 0, '#161b22', { edge: true });
		if (topView) {
			for (var p2 = 0; p2 < 8; p2++) {
				var isSerialPin = (simMode === 'serial' && p2 <= 1 && simPhase % 2 === 0);
				dot3D(sc, [-1.75 + p2 * 0.254, 2.30, 0.78], isSerialPin ? 2.6 : 1.6, { fill: isSerialPin ? '#f59f00' : '#484f58' });
			}
		}

		// 6. Power and Analog In Headers (Callout #7)
		box3D(sc, [-0.10, -2.30, 0.45], [2.03, 0.35, 0.65], 0, '#161b22', { edge: true });
		if (topView) {
			for (var p3 = 0; p3 < 8; p3++) dot3D(sc, [-1.00 + p3 * 0.254, -2.30, 0.78], 1.6, { fill: '#484f58' });
		}
		box3D(sc, [1.85, -2.30, 0.45], [1.52, 0.35, 0.65], 0, '#161b22', { edge: true });
		if (topView) {
			for (var p4 = 0; p4 < 6; p4++) dot3D(sc, [1.20 + p4 * 0.254, -2.30, 0.78], 1.6, { fill: '#484f58' });
		}

		// 7. ATmega328P DIP-28 Microcontroller (Callout #1)
		box3D(sc, [0.85, -0.65, 0.16], [3.65, 0.92, 0.14], 0, '#111518', { edge: true });
		box3D(sc, [0.85, -0.65, 0.34], [3.55, 0.82, 0.24], 0, '#1f2428', { edge: true });
		if (topView) dot3D(sc, [-0.90, -0.65, 0.47], 3.2, { fill: '#0b0e11' });
		for (var ip = 0; ip < 14; ip++) {
			var px = -0.75 + ip * 0.254;
			line3D(sc, [px, -0.25, 0.30], [px, -0.15, 0.08], { stroke: '#d1d5db', 'stroke-width': '1.2' });
			line3D(sc, [px, -1.05, 0.30], [px, -1.15, 0.08], { stroke: '#d1d5db', 'stroke-width': '1.2' });
		}

		// 8. ATmega16U2 USB Bridge (Callout #2) & 9. 5V Regulator (Callout #3)
		box3D(sc, [-1.35, 0.75, 0.16], [0.75, 0.75, 0.12], 0, '#1e242a', { edge: true });
		box3D(sc, [-1.25, -1.55, 0.20], [0.65, 0.60, 0.16], 0, '#1a1f24', { edge: true });
		box3D(sc, [-1.25, -1.82, 0.14], [0.60, 0.15, 0.06], 0, '#94a3b8', { edge: true });
		line3D(sc, [-1.45, -1.25, 0.08], [-1.45, -1.50, 0.16], { stroke: '#cbd5e1', 'stroke-width': '1.5' });
		line3D(sc, [-1.25, -1.25, 0.08], [-1.25, -1.50, 0.16], { stroke: '#cbd5e1', 'stroke-width': '1.5' });
		line3D(sc, [-1.05, -1.25, 0.08], [-1.05, -1.50, 0.16], { stroke: '#cbd5e1', 'stroke-width': '1.5' });

		// 10. 16 MHz Crystal Oscillator & 11. Reset Push Button (Callout #8)
		box3D(sc, [1.50, 0.30, 0.24], [1.05, 0.42, 0.28], 0, '#cbd5e1', { edge: true });
		box3D(sc, [-2.80, 2.15, 0.24], [0.55, 0.55, 0.18], 0, '#94a3b8', { edge: true });
		cylinder3D(sc, [-2.80, 2.15, 0.33], [-2.80, 2.15, 0.44], 0.15, '#dc2626', { segments: 12, edge: true });

		// 12. ICSP Headers (2x3 gold male pin headers)
		var icspPins = [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.0], [0.12, 0.0], [-0.12, 0.12], [0.12, 0.12]];
		box3D(sc, [2.85, 0.00, 0.14], [0.45, 0.65, 0.10], 0, '#111518');
		icspPins.forEach(function (off) {
			line3D(sc, [2.85 + off[0], off[1], 0.18], [2.85 + off[0], off[1], 0.40], { stroke: '#f59f00', 'stroke-width': '2' });
		});
		box3D(sc, [-1.00, 1.80, 0.14], [0.45, 0.65, 0.10], 0, '#111518');
		icspPins.forEach(function (off) {
			line3D(sc, [-1.00 + off[0], 1.80 + off[1], 0.18], [-1.00 + off[0], 1.80 + off[1], 0.40], { stroke: '#f59f00', 'stroke-width': '2' });
		});

		// 13 & 14. Top-side LEDs & Silkscreen (ONLY visible from top hemisphere, with matching dark PCB halo!)
		if (topView) {
			var onGlow = true;
			var lGlow = (simMode === 'blink' && simPhase % 2 === 0) || (simMode === 'pwm' && (simPhase % 10) < 5);
			var txGlow = simMode === 'serial' && (simPhase % 3 === 0);
			var rxGlow = simMode === 'serial' && (simPhase % 3 === 1);

			dot3D(sc, [1.30, 1.45, 0.10], onGlow ? 3.5 : 2.5, { fill: '#22c55e', stroke: '#bbf7d0', 'stroke-width': '1.2' });
			dot3D(sc, [-0.45, 1.15, 0.10], txGlow ? 3.8 : 2.3, { fill: txGlow ? '#fbbf24' : '#78350f', stroke: txGlow ? '#fef08a' : '#451a03', 'stroke-width': '0.9' });
			dot3D(sc, [-0.45, 0.85, 0.10], rxGlow ? 3.8 : 2.3, { fill: rxGlow ? '#fbbf24' : '#78350f', stroke: rxGlow ? '#fef08a' : '#451a03', 'stroke-width': '0.9' });
			dot3D(sc, [-0.20, 1.45, 0.10], lGlow ? 4.0 : 2.4, { fill: lGlow ? '#fbbf24' : '#78350f', stroke: lGlow ? '#fef08a' : '#451a03', 'stroke-width': '1.0' });

			label3D(sc, [0.85, -0.65, 0.48], 'ATMEGA328P-PU', { size: 8.5, fill: '#eaecf0', mono: true, weight: '700', haloColor: '#1f2428' });
			label3D(sc, [-1.35, 0.75, 0.25], '16U2', { size: 7.5, fill: '#cbd5e1', mono: true, haloColor: '#1e242a' });
			label3D(sc, [1.50, 0.30, 0.40], '16 MHz', { size: 7.5, fill: '#1e293b', mono: true, haloColor: '#cbd5e1' });
			label3D(sc, [0.10, 1.25, 0.10], 'UNO R3', { size: 9.5, fill: '#ffffff', weight: '700', haloColor: pcbHalo });
			label3D(sc, [0.40, 1.92, 0.10], 'DIGITAL (PWM ~)', { size: 7.5, fill: '#f1f5f9', mono: true, haloColor: pcbHalo });
			label3D(sc, [1.85, -1.92, 0.10], 'ANALOG IN', { size: 7.5, fill: '#f1f5f9', mono: true, haloColor: pcbHalo });
			label3D(sc, [-0.10, -1.92, 0.10], 'POWER', { size: 7.5, fill: '#f1f5f9', mono: true, haloColor: pcbHalo });
			label3D(sc, [1.30, 1.63, 0.10], 'ON', { size: 7, fill: '#f1f5f9', mono: true, haloColor: pcbHalo });
			label3D(sc, [-0.20, 1.63, 0.10], 'L', { size: 7, fill: '#f1f5f9', mono: true, haloColor: pcbHalo });
		} else {
			// 15. Underside solder joints and branding when viewed from below
			label3D(sc, [0, 0.3, -0.10], 'MADE IN ITALY · ARDUINO.CC', { size: 9, fill: '#ffffff', mono: true, haloColor: pcbHalo });
			label3D(sc, [0, -0.9, -0.10], 'OPEN-SOURCE HARDWARE', { size: 8, fill: '#e2e8f0', mono: true, haloColor: pcbHalo });
			for (var b1 = 0; b1 < 10; b1++) dot3D(sc, [0.50 + b1 * 0.254, 2.30, -0.084], 1.7, { fill: '#e2e8f0', stroke: '#94a3b8', 'stroke-width': '0.5' });
			for (var b2 = 0; b2 < 8; b2++) dot3D(sc, [-1.75 + b2 * 0.254, 2.30, -0.084], 1.7, { fill: '#e2e8f0', stroke: '#94a3b8', 'stroke-width': '0.5' });
			for (var b3 = 0; b3 < 8; b3++) dot3D(sc, [-1.00 + b3 * 0.254, -2.30, -0.084], 1.7, { fill: '#e2e8f0', stroke: '#94a3b8', 'stroke-width': '0.5' });
			for (var b4 = 0; b4 < 6; b4++) dot3D(sc, [1.20 + b4 * 0.254, -2.30, -0.084], 1.7, { fill: '#e2e8f0', stroke: '#94a3b8', 'stroke-width': '0.5' });
			for (var b5 = 0; b5 < 14; b5++) {
				dot3D(sc, [-0.75 + b5 * 0.254, -0.15, -0.084], 1.7, { fill: '#e2e8f0', stroke: '#94a3b8', 'stroke-width': '0.5' });
				dot3D(sc, [-0.75 + b5 * 0.254, -1.15, -0.084], 1.7, { fill: '#e2e8f0', stroke: '#94a3b8', 'stroke-width': '0.5' });
			}
		}

		// 16. Active Component Highlight Box
		var activePart = null;
		var sel = stage.activePartId || stage.hoveredPartId;
		if (sel) {
			for (var si = 0; si < ARDUINO_PARTS.length; si++) {
				if (ARDUINO_PARTS[si].id === sel) { activePart = ARDUINO_PARTS[si]; break; }
			}
		}
		if (activePart) {
			drawHighlightBox3D(sc, activePart.box[0], activePart.box[1], '#00878a');
		}

		// 17. 3D Numbered Callout Chips (1 to 8, shown on top view)
		if (stage.showLabels && topView) {
			ARDUINO_PARTS.forEach(function (part) {
				var isAct = stage.activePartId === part.id;
				var isHov = stage.hoveredPartId === part.id;
				drawCalloutChip3D(sc, part, isAct, isHov, dark, stage);
			});
		}

		renderScene3D(svg, sc);

		readout.textContent = 'Arduino Uno R3 · ATmega328P 8-bit AVR @ 16 MHz · 14 Digital I/O (6 PWM) · 6 Analog In (10-bit ADC) · 5.0V Logic';

		if (activePart) {
			var partMsg = activePart.title + ': ' + activePart.desc;
			if (status.textContent !== partMsg) status.textContent = partMsg;
		} else {
			var simNote = simMode === 'blink' ? 'Simulating Blink on Pin 13 (built-in amber LED L pulses with D13 HIGH/LOW).'
				: (simMode === 'serial' ? 'Simulating USB Serial UART traffic: ATmega16U2 pulses TX/RX LEDs on pins 0 & 1.'
				: (simMode === 'pwm' ? 'Simulating analogWrite() PWM output on Pin ~9 (490 Hz duty modulation).'
				: 'Explore the Arduino Uno R3 in 3D: click any numbered chip (1–8), switch Simulate modes, or drag to orbit.'));
			if (status.textContent !== simNote) status.textContent = simNote;
		}
	}

	orbitControls(svg, cam, redraw, Object.assign(ctl, {
		onTap: function (pt) {
			var sc = newScene3D(cam, W, H, light);
			var nearest = null, minDist = 28;
			ARDUINO_PARTS.forEach(function (part) {
				var pr = pr3(sc, part.pos);
				var d = Math.hypot(pt.x - pr.u, pt.y - pr.v);
				if (d < minDist) { minDist = d; nearest = part; }
				var prBox = pr3(sc, part.box[0]);
				var dBox = Math.hypot(pt.x - prBox.u, pt.y - prBox.v);
				if (dBox < minDist) { minDist = dBox; nearest = part; }
			});
			stage.selectPart(nearest ? nearest.id : null);
		},
		hover: function (pt) {
			var sc = newScene3D(cam, W, H, light);
			var nearest = null, minDist = 24;
			ARDUINO_PARTS.forEach(function (part) {
				var pr = pr3(sc, part.pos);
				var d = Math.hypot(pt.x - pr.u, pt.y - pr.v);
				if (d < minDist) { minDist = d; nearest = part; }
				var prBox = pr3(sc, part.box[0]);
				var dBox = Math.hypot(pt.x - prBox.u, pt.y - prBox.v);
				if (dBox < minDist) { minDist = dBox; nearest = part; }
			});
			stage.hoverPart(nearest ? nearest.id : null);
			return nearest ? 'pointer' : null;
		}
	}));

	sDist.input.addEventListener('input', function () {
		cam.dist = Number(sDist.input.value);
		sDist.out.textContent = cam.dist.toFixed(1);
		redraw();
	});

	var hint = h('p', { 'class': 'widget-note w3d-hint', text: 'Drag anywhere to orbit in 3D; pinch or Ctrl + scroll to zoom. Use the frosted toolbar to snap views (try Bottom!), auto-spin turntable, or toggle component chips.' });

	root.replaceChildren(frame('3D Arduino Uno Board Explorer', [
		h('p', { 'class': 'widget-note', text: 'Hardware inspection of the classic Arduino Uno R3: 16 MHz ATmega328P microcontroller, USB-serial interface, voltage regulator, power jack, and pin headers.' }),
		simRow,
		stage.wrap,
		hint,
		readout,
		status,
		az.row,
		el.row,
		sDist.row
	]));

	draw();
}

/* ---------- 3D Robot Configuration Explorer: SCARA, Delta, Cartesian (lesson 1.3) ---------- */

var CONFIGS_PARTS = {
	scara: [
		{ id: 'pedestal', badge: '1', title: 'SCARA Pedestal & J1 Shoulder', shortTitle: 'J1 Shoulder', specPill: 'Revolute Z · Horizontal Swing', pos: [0, -0.22, 0.26],
			desc: 'Horizontal-plane rotary shoulder joint J1. Bears vertical rigidity while enabling rapid lateral sweeps across a flat assembly table.',
			specs: [['Motion Type', 'Rotary around vertical Z axis'], ['Stiffness', 'High vertical rigidity for press-fit insertion'], ['Example', 'Epson T6-B (600 mm reach, 22 kg)']] },
		{ id: 'elbow', badge: '2', title: 'J2 Elbow & Forearm Link', shortTitle: 'J2 Elbow', specPill: 'Revolute Z · Planar Reach', pos: [0.12, 0.05, 0.42],
			desc: 'Second horizontal rotary joint J2. Together with J1 it positions the quill anywhere inside a cylindrical/kidney-shaped horizontal footprint.',
			specs: [['Kinematics', '2-link planar R-R arm (L1 = 0.30 m, L2 = 0.26 m)'], ['Compliance', 'Compliant sideways, stiff vertically']] },
		{ id: 'quill', badge: '3', title: 'Z-Quill Stroke & Theta-4 Roll', shortTitle: 'Z/θ4 Quill', specPill: 'Prismatic Z + Revolute Tool', pos: [0.15, 0.18, 0.28],
			desc: 'Ball-screw spline quill providing vertical linear plunge (Z) and tool wrist rotation (θ4) for fast pick-and-place and screw driving.',
			specs: [['Axes', 'Axis 3 (Linear Z plunge) + Axis 4 (Tool roll)'], ['Cycle Time', '0.46 s standard 300 mm cycle (Epson T6-B)']] }
	],
	delta: [
		{ id: 'base', badge: '1', title: 'Overhead Delta Base & 3 Actuators', shortTitle: 'Base Motors', specPill: 'Fixed Frame · Heavy Motors Stationary', pos: [0, 0, 0.68],
			desc: 'All three heavy servo motors remain bolted to the stationary overhead triangle—meaning moving links carry almost zero motor weight.',
			specs: [['Topology', 'Closed-loop 3-arm parallel mechanism'], ['Dynamic Gain', 'Very low moving inertia enables 0.30 s pick cycles']] },
		{ id: 'parallelogram', badge: '2', title: 'Parallel Rod Linkages (6 Push-Rods)', shortTitle: 'Parallel Rods', specPill: 'Parallelogram Constraint · Keeps Plate Level', pos: [0.22, 0.0, 0.42],
			desc: 'Three pairs of lightweight carbon-fiber parallel rods form parallelograms that mechanically lock the lower tool plate parallel to the floor.',
			specs: [['Constraint', 'Always keeps tool plate horizontal (zero pitch/roll)'], ['Example', 'ABB IRB 360 FlexPicker (1–8 kg payload)']] },
		{ id: 'plate', badge: '3', title: 'Moving Tool Plate & Vacuum Head', shortTitle: 'Tool Plate', specPill: '3-DOF Translation · High-Speed Pick', pos: [0, 0, 0.16],
			desc: 'Lightweight end-effector plate driven in X, Y, Z simultaneously by all three kinematic chains.',
			specs: [['Workspace', 'Inverted dome / cylinder below overhead frame'], ['Applications', 'High-speed conveyor sorting & food packaging']] }
	],
	cartesian: [
		{ id: 'xrail', badge: '1', title: 'Overhead X-Axis Bridge Rails', shortTitle: 'X-Axis Rail', specPill: 'Prismatic X · Linear Guide', pos: [0, -0.32, 0.66],
			desc: 'Twin parallel linear rails supporting the traveling Y-axis bridge across the work cell length.',
			specs: [['Joint Type', 'Prismatic linear actuator (belt or ball screw)'], ['Rigidity', 'Uniform stiffness across entire rectangular box']] },
		{ id: 'ybridge', badge: '2', title: 'Traveling Y-Axis Crossbeam', shortTitle: 'Y-Axis Bridge', specPill: 'Prismatic Y · Orthogonal', pos: [0.10, 0, 0.68],
			desc: 'Orthogonal crossbeam carrying the vertical Z carriage across the width of the gantry.',
			specs: [['Kinematics', 'Decoupled X, Y, Z axes (no singularities)'], ['Scalability', 'Spans meters for CNC tending & palletizing']] },
		{ id: 'zram', badge: '3', title: 'Vertical Z-Axis Ram', shortTitle: 'Z-Axis Ram', specPill: 'Prismatic Z · Linear Plunge', pos: [0.12, 0.12, 0.40],
			desc: 'Vertical linear stage lowering the gripper cleanly onto the work table with zero angular coupling.',
			specs: [['Workspace', 'Rectangular cuboid (X × Y × Z)'], ['Repeatability', 'Consistent precision at every corner']] }
	]
};

function initRobotConfigs3D(root) {
	var mode = 'scara';
	var sx = slider('Target X (m)', 'rc3d-x', -0.25, 0.25, 0.01, 0.16, ' m');
	var sy = slider('Target Y (m)', 'rc3d-y', -0.20, 0.25, 0.01, 0.12, ' m');
	var sz = slider('Target Z (m)', 'rc3d-z', 0.04, 0.24, 0.01, 0.14, ' m');
	var az = slider('Camera azimuth', 'rc3d-az', -180, 180, 1, 36, '°');
	var el = slider('Camera elevation', 'rc3d-el', 8, 89, 1, 24, '°');
	var cbEnv = checkRow3D('rc3d-env', 'Show workspace volume envelope', true);

	var narrow = (root.clientWidth || 600) < 500, W = narrow ? 360 : 560, H = narrow ? 340 : 380;
	var svg = plotFrame(W, H, 'Interactive 3D comparison of SCARA, Delta parallel, and Cartesian gantry industrial robot configurations.');
	svg.classList.add('w3d-canvas');
	var cam = createCamera3D([0, 0, 0.28], 1.75, narrow ? 440 : 490, 36, 24);
	var light = norm3([0.4, -0.5, 0.85]);
	var ctl = { az: az, el: el };
	var redraw = frameScheduler(draw);
	var anim = null, note = '';

	var partsProxy = CONFIGS_PARTS.scara.slice();
	var stage = build3DStage(svg, cam, redraw, ctl, {
		title: 'Robot Configurations',
		presets: [
			['3/4', 36, 24, 'Isometric 3/4 view', 1.75],
			['Front', 90, 12, 'Front elevation view', 1.75],
			['Side', 0, 12, 'Side elevation view', 1.75],
			['Top', 0, 89, 'Top-down footprint view', 1.85]
		],
		parts: partsProxy,
		initialLabels: true
	});

	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
	var status = h('p', { 'class': 'widget-readout', 'aria-live': 'polite', style: 'margin-top:2px;' });

	function stopAnim() { if (anim) { cancelAnimationFrame(anim); anim = null; } }

	function setMode(m) {
		stopAnim();
		mode = m;
		note = '';
		partsProxy.length = 0;
		CONFIGS_PARTS[m].forEach(function (p) { partsProxy.push(p); });
		stage.activePartId = null;
		// Update chip dock labels cleanly
		var btns = stage.wrap.querySelectorAll('.w3d-chip-dock button');
		CONFIGS_PARTS[m].forEach(function (p, i) {
			if (btns[i]) {
				btns[i].title = p.title;
				btns[i].setAttribute('aria-label', 'Component ' + p.badge + ': ' + p.title);
				var nm = btns[i].querySelector('.w3d-chip-name');
				if (nm) nm.textContent = p.shortTitle;
				btns[i].setAttribute('aria-pressed', 'false');
				btns[i].classList.remove('is-active', 'w3d-chip-active');
			}
		});
		var card = stage.wrap.querySelector('.w3d-part-card');
		if (card) { card.setAttribute('hidden', ''); card.classList.add('is-hidden'); }
		Array.prototype.forEach.call(modeRow.querySelectorAll('button[data-cfg]'), function (b) {
			b.setAttribute('aria-pressed', b.dataset.cfg === m ? 'true' : 'false');
		});
		draw();
	}

	function runCycle() {
		stopAnim();
		var wps = [[0.18, 0.12, 0.18], [0.18, 0.12, 0.04], [0.18, 0.12, 0.22], [-0.18, 0.12, 0.22], [-0.18, 0.12, 0.04], [-0.18, 0.12, 0.18], [0.16, 0.12, 0.14]];
		var idx = 0, t0 = null, dur = REDUCED_MOTION ? 0.01 : (mode === 'delta' ? 0.30 : (mode === 'scara' ? 0.42 : 0.60));
		var cur = [Number(sx.input.value), Number(sy.input.value), Number(sz.input.value)];
		function step(ts) {
			if (t0 === null) t0 = ts;
			var k = Math.min(1, (ts - t0) / 1000 / dur), e = 0.5 - 0.5 * Math.cos(k * Math.PI), nxt = wps[idx];
			sx.input.value = (cur[0] + (nxt[0] - cur[0]) * e).toFixed(2);
			sy.input.value = (cur[1] + (nxt[1] - cur[1]) * e).toFixed(2);
			sz.input.value = (cur[2] + (nxt[2] - cur[2]) * e).toFixed(2);
			draw();
			if (k >= 1) {
				cur = nxt.slice(); idx++; t0 = null;
				if (idx >= wps.length) { anim = null; note = 'Pick-and-place cycle complete.'; draw(); return; }
			}
			anim = requestAnimationFrame(step);
		}
		note = 'Running ' + mode.toUpperCase() + ' pick-and-place cycle...';
		anim = requestAnimationFrame(step);
	}

	function draw() {
		var tx = Number(sx.input.value), ty = Number(sy.input.value), tz = Number(sz.input.value);
		sx.out.textContent = signed(tx, 2) + ' m';
		sy.out.textContent = signed(ty, 2) + ' m';
		sz.out.textContent = tz.toFixed(2) + ' m';

		var dark = isDarkWidget(svg), sc = newScene3D(cam, W, H, light);
		floorGrid3D(sc, -0.5, 0.5, -0.5, 0.5, 0.1);
		var metal = dark ? '#475569' : '#64748b', purp = dark ? '#8f6ad6' : '#5b2a9e', purpDk = dark ? '#6c4bb0' : '#3d1a6e';

		// Pick & place pads on table
		cylinder3D(sc, [0.18, 0.12, 0], [0.18, 0.12, 0.025], 0.045, '#0891b2', { segments: 12, edge: true });
		cylinder3D(sc, [-0.18, 0.12, 0], [-0.18, 0.12, 0.025], 0.045, '#d97706', { segments: 12, edge: true });

		var dyn = [], reachOk = true;
		if (mode === 'scara') {
			var bx = 0, by = -0.22, L1 = 0.28, L2 = 0.24, zArm = 0.36;
			var dx = tx - bx, dy = ty - by, d2 = dx * dx + dy * dy, dist = Math.sqrt(d2);
			if (dist > L1 + L2 - 0.01) { reachOk = false; var kCl = (L1 + L2 - 0.01) / dist; dx *= kCl; dy *= kCl; d2 = dx * dx + dy * dy; }
			if (dist < Math.abs(L1 - L2) + 0.02) { reachOk = false; var kIn = (Math.abs(L1 - L2) + 0.02) / Math.max(0.001, dist); dx *= kIn; dy *= kIn; d2 = dx * dx + dy * dy; }
			var cosQ2 = clampN((d2 - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1);
			var q2 = Math.acos(cosQ2), q1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(q2), L1 + L2 * cosQ2);
			var ex = bx + L1 * Math.cos(q1), ey = by + L1 * Math.sin(q1);
			var wx = ex + L2 * Math.cos(q1 + q2), wy = ey + L2 * Math.sin(q1 + q2);

			if (cbEnv.input.checked) {
				var outer = [], inner = [];
				for (var a = 0; a <= 36; a++) {
					var ang = (-20 + a * 220 / 36) * DEG2RAD;
					outer.push([bx + (L1 + L2) * Math.cos(ang), by + (L1 + L2) * Math.sin(ang), 0.004]);
					inner.push([bx + Math.abs(L1 - L2) * Math.cos(ang), by + Math.abs(L1 - L2) * Math.sin(ang), 0.004]);
				}
				polyline3D(sc, outer, { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1.5', 'stroke-dasharray': '4 3', opacity: '0.8' });
				polyline3D(sc, inner, { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1', 'stroke-dasharray': '3 3', opacity: '0.6' });
			}
			cylinder3D(sc, [bx, by, 0], [bx, by, zArm + 0.04], 0.075, purpDk, { segments: 16, shadow: true, edge: true });
			// Link 1 arm
			var l1ang = Math.atan2(ey - by, ex - bx);
			box3D(sc, [(bx + ex) / 2, (by + ey) / 2, zArm], [L1 + 0.06, 0.08, 0.06], l1ang, purp, { shadow: true, edge: true });
			cylinder3D(sc, [ex, ey, zArm - 0.03], [ex, ey, zArm + 0.06], 0.048, metal, { segments: 12, edge: true });
			// Link 2 forearm
			var l2ang = Math.atan2(wy - ey, wx - ex);
			box3D(sc, [(ex + wx) / 2, (ey + wy) / 2, zArm + 0.06], [L2 + 0.05, 0.07, 0.055], l2ang, purp, { shadow: true, edge: true });
			// Vertical Z spline quill + tool
			cylinder3D(sc, [wx, wy, tz], [wx, wy, zArm + 0.14], 0.018, '#cbd5e1', { segments: 10, edge: true });
			cylinder3D(sc, [wx, wy, tz], [wx, wy, tz + 0.035], 0.030, '#d97706', { segments: 12, edge: true });
			axes3D(sc, [wx, wy, tz], null, 0.10, '{tool}');
			readout.textContent = 'SCARA 4-axis | J1=' + Math.round(q1 / DEG2RAD) + '°, J2=' + Math.round(q2 / DEG2RAD) + '°, Z=' + tz.toFixed(2) + ' m | Stiff vertically, rapid planar sweep';
			dyn = [
				Object.assign({}, CONFIGS_PARTS.scara[0], { pos: [bx, by, zArm + 0.07] }),
				Object.assign({}, CONFIGS_PARTS.scara[1], { pos: [ex, ey, zArm + 0.09] }),
				Object.assign({}, CONFIGS_PARTS.scara[2], { pos: [wx, wy, tz + 0.08] })
			];
		} else if (mode === 'delta') {
			var zTop = 0.68, Rbase = 0.20, Rplat = 0.07, Lup = 0.22, Lfore = 0.44;
			var px = clampN(tx, -0.22, 0.22), py = clampN(ty, -0.22, 0.22), pz = clampN(tz, 0.04, 0.26);
			if (Math.hypot(px, py) > 0.22) { reachOk = false; var dk = 0.22 / Math.hypot(px, py); px *= dk; py *= dk; }
			if (cbEnv.input.checked) {
				var dr = [];
				for (var da = 0; da <= 36; da++) dr.push([Math.cos(da / 36 * Math.PI * 2) * 0.22, Math.sin(da / 36 * Math.PI * 2) * 0.22, 0.004]);
				polyline3D(sc, dr, { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1.5', 'stroke-dasharray': '4 3', opacity: '0.8' });
			}
			// Overhead delta support frame & fixed motor base
			[0, 120, 240].forEach(function (deg) {
				var ra = deg * DEG2RAD, fx = Math.cos(ra) * 0.42, fy = Math.sin(ra) * 0.42;
				cylinder3D(sc, [fx, fy, 0], [fx, fy, zTop], 0.018, metal, { segments: 8, shadow: true });
				line3D(sc, [fx, fy, zTop], [Math.cos(ra) * Rbase, Math.sin(ra) * Rbase, zTop], { stroke: metal, 'stroke-width': '4' });
			});
			var baseTri = [0, 120, 240].map(function (deg) { return [Math.cos(deg * DEG2RAD) * Rbase, Math.sin(deg * DEG2RAD) * Rbase]; });
			extrudePoly3D(sc, baseTri, zTop - 0.025, zTop + 0.025, purpDk, { edge: true });

			// 3 Delta kinematic chains (upper arm + 2 parallel push-rods to lower moving plate)
			var platTri = [];
			[0, 120, 240].forEach(function (deg) {
				var ra = deg * DEG2RAD, ux = Math.cos(ra), uy = Math.sin(ra), side = [-uy, ux, 0];
				var hip = [ux * Rbase, uy * Rbase, zTop];
				var wristPt = [px + ux * Rplat, py + uy * Rplat, pz + 0.03];
				platTri.push([wristPt[0], wristPt[1]]);
				var toW = sub3(wristPt, hip);
				var radial = toW[0] * ux + toW[1] * uy, dz = toW[2], lat = toW[0] * (-uy) + toW[1] * ux;
				var LfEff = Math.sqrt(Math.max(0.02, Lfore * Lfore - lat * lat));
				var distHW = Math.hypot(radial, dz);
				var cosA = clampN((distHW * distHW + Lup * Lup - LfEff * LfEff) / (2 * distHW * Lup), -1, 1);
				var angBase = Math.atan2(dz, radial) + Math.acos(cosA);
				var elb = [hip[0] + ux * Lup * Math.cos(angBase), hip[1] + uy * Lup * Math.cos(angBase), hip[2] + Lup * Math.sin(angBase)];
				cylinder3D(sc, hip, elb, 0.018, purp, { segments: 10, edge: true });
				cylinder3D(sc, add3(hip, scale3(side, -0.04)), add3(hip, scale3(side, 0.04)), 0.028, '#1f2937', { segments: 10 });
				[-0.026, 0.026].forEach(function (off) {
					line3D(sc, add3(elb, scale3(side, off)), add3(wristPt, scale3(side, off)), { stroke: '#0891b2', 'stroke-width': '2.4', 'stroke-linecap': 'round' });
				});
			});
			extrudePoly3D(sc, platTri, pz + 0.015, pz + 0.035, '#d97706', { shadow: true, edge: true });
			cylinder3D(sc, [px, py, pz], [px, py, pz + 0.015], 0.016, '#1f2937', { segments: 10 });
			axes3D(sc, [px, py, pz], null, 0.09, '{tool}');
			readout.textContent = 'Delta 3-axis parallel | Tool=[' + signed(px, 2) + ', ' + signed(py, 2) + ', ' + pz.toFixed(2) + '] m | Heavy motors fixed overhead';
			dyn = [
				Object.assign({}, CONFIGS_PARTS.delta[0], { pos: [0, 0, zTop + 0.05] }),
				Object.assign({}, CONFIGS_PARTS.delta[1], { pos: [0.20, 0, 0.42] }),
				Object.assign({}, CONFIGS_PARTS.delta[2], { pos: [px, py, pz + 0.06] })
			];
		} else {
			var gx = 0.36, gy = 0.30, gz = 0.66;
			var cx = clampN(tx, -0.25, 0.25), cy = clampN(ty, -0.20, 0.22), cz = clampN(tz, 0.04, 0.24);
			if (cbEnv.input.checked) {
				box3D(sc, [0, 0.01, 0.14], [0.50, 0.42, 0.20], 0, 'none', { attrs: { stroke: 'var(--wp-gold-text, #6b5200)', 'stroke-width': '1', 'stroke-dasharray': '4 3', fill: 'none' } });
			}
			[[-gx, -gy], [gx, -gy], [gx, gy], [-gx, gy]].forEach(function (c) {
				box3D(sc, [c[0], c[1], gz * 0.5], [0.035, 0.035, gz], 0, metal, { shadow: true, edge: true });
			});
			// X rails
			box3D(sc, [0, -gy, gz], [gx * 2 + 0.04, 0.04, 0.04], 0, purpDk, { edge: true });
			box3D(sc, [0, gy, gz], [gx * 2 + 0.04, 0.04, 0.04], 0, purpDk, { edge: true });
			// Traveling Y bridge at x = cx
			box3D(sc, [cx, 0, gz + 0.04], [0.045, gy * 2 + 0.04, 0.045], 0, purp, { shadow: true, edge: true });
			// Z carriage + vertical telescoping quill
			box3D(sc, [cx, cy, gz + 0.05], [0.08, 0.08, 0.08], 0, '#1f2937', { edge: true });
			cylinder3D(sc, [cx, cy, cz + 0.03], [cx, cy, gz + 0.04], 0.020, '#cbd5e1', { segments: 10, shadow: true, edge: true });
			box3D(sc, [cx, cy, cz + 0.015], [0.045, 0.045, 0.03], 0, '#d97706', { edge: true });
			axes3D(sc, [cx, cy, cz], null, 0.10, '{tool}');
			readout.textContent = 'Cartesian Gantry | X=' + signed(cx, 2) + ', Y=' + signed(cy, 2) + ', Z=' + cz.toFixed(2) + ' m | Decoupled orthogonal axes, zero singularities';
			dyn = [
				Object.assign({}, CONFIGS_PARTS.cartesian[0], { pos: [0, -gy, gz + 0.05] }),
				Object.assign({}, CONFIGS_PARTS.cartesian[1], { pos: [cx, -0.10, gz + 0.09] }),
				Object.assign({}, CONFIGS_PARTS.cartesian[2], { pos: [cx, cy, cz + 0.14] })
			];
		}

		if (stage.showLabels) {
			dyn.forEach(function (part) {
				drawCalloutChip3D(sc, part, stage.activePartId === part.id, stage.hoveredPartId === part.id, dark, stage);
			});
		}
		renderScene3D(svg, sc);
		var stMsg = note || (reachOk ? 'Adjust X/Y/Z sliders or press "Run Pick-and-Place" to compare kinematics and workspace envelopes.' : 'Target clamped to configuration reach boundary.');
		if (status.textContent !== stMsg) status.textContent = stMsg;
	}

	orbitControls(svg, cam, redraw, ctl);
	[sx, sy, sz].forEach(function (c) { c.input.addEventListener('input', function () { stopAnim(); note = ''; draw(); }); });
	cbEnv.input.addEventListener('change', draw);

	var modeRow = h('div', { 'class': 'widget-buttons', role: 'group', 'aria-label': 'Robot configuration type' }, [
		h('span', { 'class': 'w3d-view-label', text: 'Robot type' })
	]);
	[['scara', 'SCARA (4-axis)'], ['delta', 'Delta (Parallel)'], ['cartesian', 'Cartesian Gantry']].forEach(function (item) {
		var b = button(item[1], function () { setMode(item[0]); }, 'Switch 3D view to ' + item[1]);
		b.dataset.cfg = item[0];
		b.setAttribute('aria-pressed', item[0] === 'scara' ? 'true' : 'false');
		modeRow.appendChild(b);
	});
	modeRow.appendChild(button('Run Pick-and-Place', runCycle, 'Animate a standard pick-and-place cycle'));

	root.replaceChildren(frame('3D robot configurations: SCARA, Delta & Cartesian', [
		modeRow, stage.wrap, readout, status, sx.row, sy.row, sz.row, cbEnv.row, az.row, el.row
	]));
	draw();
}

/* ---------- 3D Safety Cell & ISO 13855 Light Curtain Distance (lesson 5.4) ---------- */

var SAFETY_CELL_PARTS = [
	{ id: 'curtain', badge: '1', title: 'Optical Safety Light Curtain', shortTitle: 'Light Curtain', specPill: 'ISO 13855 · S = K × T + C', pos: [0.65, 0.72, 0.65],
		desc: 'Row of infrared beams across the open cell entrance. Must be mounted at least distance S from the hazard zone so the robot stops before an operator reaches the arm.',
		specs: [['Approach Speed K', '2000 mm/s (S ≤ 500 mm); 1600 mm/s (S > 500 mm, min 500 mm)'], ['Intrusion C', '8 × (d − 14) mm for resolution d ≤ 40 mm'], ['Total Stopping Time T', 'Sensor response time + robot stopping time']] },
	{ id: 'zone', badge: '2', title: 'Minimum Safety Distance Zone S', shortTitle: 'Safety Distance S', specPill: 'Separation Boundary', pos: [0, 0.55, 0.05],
		desc: 'Minimum distance from the light curtain detection plane to the hazard zone, so the robot has stopped before a hand or body can reach it.',
		specs: [['Worked Example 1', 'T = 0.1157 s, d = 25 mm → C = 88 mm → S = 319.4 mm'], ['Worked Example 2', 'T = 0.300 s, d = 14 mm → C = 0 mm → S = 500.0 mm']] },
	{ id: 'fence', badge: '3', title: 'Perimeter Fence & Interlocked Guard', shortTitle: 'Safety Fence', specPill: 'ISO 13857 · Fixed Perimeter', pos: [-0.90, -0.35, 0.70],
		desc: 'Rigid perimeter fencing enclosing the sides and back of the robot cell so personnel can enter only through the safeguarded front light curtain.',
		specs: [['Side Guards', 'Prevent bypassing the light curtain from the flanks'], ['Status Stack', 'Green = Run mode; Red = Protective stop active']] }
];

function initSafetyCell3D(root) {
	var sT = slider('Total stopping time T (s)', 'sc3d-t', 0.05, 0.50, 0.0001, 0.1157, ' s');
	var sD = slider('Curtain resolution d (mm)', 'sc3d-d', 14, 40, 1, 25, ' mm');
	var sApp = slider('Operator hand test', 'sc3d-app', -0.25, 0.35, 0.02, -0.15, ' m');
	var az = slider('Camera azimuth', 'sc3d-az', -180, 180, 1, 38, '°');
	var el = slider('Camera elevation', 'sc3d-el', 10, 89, 1, 26, '°');

	var narrow = (root.clientWidth || 600) < 500, W = narrow ? 360 : 560, H = narrow ? 340 : 380;
	var svg = plotFrame(W, H, 'Interactive 3D industrial robot cell showing an optical safety light curtain positioned at ISO 13855 minimum safety distance S from the robot hazard zone.');
	svg.classList.add('w3d-canvas');
	var cam = createCamera3D([0, 0.15, 0.40], 2.8, narrow ? 440 : 490, 38, 26);
	var light = norm3([0.4, -0.5, 0.85]);
	var ctl = { az: az, el: el };
	var redraw = frameScheduler(draw);

	var stage = build3DStage(svg, cam, redraw, ctl, {
		title: 'ISO 13855 Robot Safety Cell',
		presets: [
			['3/4', 38, 26, 'Isometric view of robot cell and light curtain', 2.8],
			['Side', 0, 12, 'Side view showing separation distance S', 2.7],
			['Top', 0, 89, 'Top-down floor plan of safety distance S', 2.9]
		],
		parts: SAFETY_CELL_PARTS,
		initialLabels: true
	});

	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
	var status = h('p', { 'class': 'widget-readout', 'aria-live': 'polite', style: 'margin-top:2px;' });

	function calcS(T_s, d_mm) {
		var C = Math.max(0, 8 * (d_mm - 14));
		var K = 2000, S = K * T_s + C, note = 'K = 2000 mm/s (S ≤ 500 mm)';
		if (S > 500) {
			K = 1600;
			S = Math.max(500, 1600 * T_s + C);
			note = S === 500 ? 'S > 500 with K=2000 → K=1600 gives <500, so S clamped to 500 mm floor' : 'Recalculated with K = 1600 mm/s';
		}
		return { S: S, C: C, K: K, note: note };
	}

	function draw() {
		var T_s = Number(sT.input.value), d_mm = Number(sD.input.value), handOffset = Number(sApp.input.value);
		sT.out.textContent = Number(T_s.toFixed(4)) + ' s';
		sD.out.textContent = d_mm + ' mm';
		sApp.out.textContent = (handOffset >= 0 ? 'tripped' : 'clear');

		var res = calcS(T_s, d_mm), S_m = res.S / 1000;
		var dark = isDarkWidget(svg), sc = newScene3D(cam, W, H, light);
		floorGrid3D(sc, -1.2, 1.2, -1.0, 1.6, 0.25);

		// Hazard reach boundary (robot base at [0, -0.30], reach 0.55 m -> front edge at y = +0.25 m)
		var yHaz = 0.25, yCurtain = yHaz + S_m;
		var tripped = handOffset >= 0;
		var beamCol = tripped ? '#dc2626' : '#f59f00';

		// Hazard floor circle
		var hazRing = [];
		for (var i = 0; i <= 36; i++) hazRing.push([Math.cos(i / 36 * Math.PI * 2) * 0.55, -0.30 + Math.sin(i / 36 * Math.PI * 2) * 0.55, 0.004]);
		polyline3D(sc, hazRing, { stroke: '#dc2626', 'stroke-width': '1.8', 'stroke-dasharray': '5 3', opacity: '0.8' });

		// Safety distance S floor zone between yHaz and yCurtain
		var sZonePoly = face3D(sc, [[-0.65, yHaz, 0.005], [0.65, yHaz, 0.005], [0.65, yCurtain, 0.005], [-0.65, yCurtain, 0.005]],
			tripped ? '#dc2626' : '#f59f00', { cull: false, shade: false, attrs: { 'fill-opacity': '0.18', stroke: beamCol, 'stroke-width': '1.5' } });
		if (sZonePoly) sc.floor.push(sZonePoly);
		line3D(sc, [0, yHaz, 0.01], [0, yCurtain, 0.01], { stroke: beamCol, 'stroke-width': '2.5' }, 'floor');
		label3D(sc, [0.05, (yHaz + yCurtain) * 0.5, 0.02], 'S = ' + res.S.toFixed(1) + ' mm', { fill: tripped ? '#dc2626' : 'var(--wp-gold-text, #6b5200)', size: 11, weight: '700' });

		// Perimeter fences (left, right, back)
		var fencePosts = [[-0.85, -0.90], [0, -0.90], [0.85, -0.90], [-0.85, yCurtain], [0.85, yCurtain]];
		fencePosts.forEach(function (fp) {
			box3D(sc, [fp[0], fp[1], 0.55], [0.04, 0.04, 1.10], 0, '#475569', { shadow: true, edge: true });
		});
		[[[-0.85, -0.90], [0.85, -0.90]], [[-0.85, -0.90], [-0.85, yCurtain]], [[0.85, -0.90], [0.85, yCurtain]]].forEach(function (seg) {
			for (var zf = 0.25; zf <= 0.95; zf += 0.35) {
				line3D(sc, [seg[0][0], seg[0][1], zf], [seg[1][0], seg[1][1], zf], { stroke: 'var(--wp-border, #72777d)', 'stroke-width': '1.8' });
			}
		});
		// Signal beacon tower on right post (green OK, red protective stop)
		cylinder3D(sc, [0.85, yCurtain, 1.10], [0.85, yCurtain, 1.24], 0.035, tripped ? '#dc2626' : '#16a34a', { segments: 12, shade: false });

		// Yellow light curtain columns & IR beams
		[-0.65, 0.65].forEach(function (lx) {
			box3D(sc, [lx, yCurtain, 0.55], [0.05, 0.05, 1.10], 0, '#eab308', { shadow: true, edge: true });
		});
		var nBeams = Math.max(4, Math.round(14 - (d_mm - 14) / 3));
		for (var b = 0; b < nBeams; b++) {
			var bz = 0.16 + (b / (nBeams - 1)) * 0.85;
			line3D(sc, [-0.62, yCurtain, bz], [0.62, yCurtain, bz], { stroke: beamCol, 'stroke-width': tripped ? '1.8' : '1.1', opacity: tripped ? '0.9' : '0.65' });
		}

		// Industrial robot arm inside the cell
		var purp = dark ? '#8f6ad6' : '#5b2a9e';
		cylinder3D(sc, [0, -0.30, 0], [0, -0.30, 0.22], 0.11, '#3d1a6e', { segments: 14, shadow: true, edge: true });
		taperedCylinder3D(sc, [0, -0.30, 0.22], [0.08, -0.05, 0.56], 0.055, 0.042, purp, { segments: 12, shadow: true, edge: true });
		taperedCylinder3D(sc, [0.08, -0.05, 0.56], [0.05, 0.22, 0.36], 0.042, 0.030, purp, { segments: 12, shadow: true, edge: true });

		// Human operator standing outside cell & reaching toward curtain
		var opY = yCurtain + 0.32 - handOffset;
		cylinder3D(sc, [-0.22, opY, 0], [-0.22, opY, 0.52], 0.08, '#334155', { segments: 12, shadow: true });
		cylinder3D(sc, [-0.22, opY, 0.52], [-0.22, opY, 0.92], 0.11, '#0284c7', { segments: 12, shadow: true, edge: true });
		cylinder3D(sc, [-0.22, opY, 0.95], [-0.22, opY, 1.12], 0.075, '#f59e0b', { segments: 12, edge: true });
		// Reaching arm & hand
		var handY = yCurtain + 0.04 - handOffset;
		cylinder3D(sc, [-0.22, opY, 0.82], [-0.14, handY, 0.72], 0.032, '#0284c7', { segments: 8, edge: true });
		dot3D(sc, [-0.14, handY, 0.72], 4.5, { fill: tripped ? '#dc2626' : '#f59e0b', stroke: '#ffffff', 'stroke-width': '1.2' });

		if (stage.showLabels) {
			[
				Object.assign({}, SAFETY_CELL_PARTS[0], { pos: [0.65, yCurtain, 1.16] }),
				Object.assign({}, SAFETY_CELL_PARTS[1], { pos: [0, (yHaz + yCurtain) * 0.5, 0.08] }),
				Object.assign({}, SAFETY_CELL_PARTS[2], { pos: [-0.85, -0.35, 1.12] })
			].forEach(function (part) {
				drawCalloutChip3D(sc, part, stage.activePartId === part.id, stage.hoveredPartId === part.id, dark, stage);
			});
		}

		renderScene3D(svg, sc);
		readout.textContent = 'S = ' + res.K + ' × ' + Number(T_s.toFixed(4)) + ' + ' + res.C.toFixed(0) + ' = ' + res.S.toFixed(1) + ' mm (' + res.note + ')';
		var st = tripped ? 'PROTECTIVE STOP: Light curtain beam broken — robot halted before the hand reaches the hazard zone.' : 'Cell running: light curtain stands ' + res.S.toFixed(1) + ' mm clear of the hazard boundary.';
		if (status.textContent !== st) status.textContent = st;
	}

	orbitControls(svg, cam, redraw, ctl);
	[sT, sD, sApp].forEach(function (c) { c.input.addEventListener('input', draw); });

	var preRow = h('div', { 'class': 'widget-buttons' }, [
		button('Worked example 1 (Keyence: 319.4 mm)', function () { sT.input.value = 0.1157; sD.input.value = 25; sApp.input.value = -0.15; draw(); }, 'Load Keyence worked example: T=0.1157 s, d=25 mm'),
		button('Worked example 2 (500.0 mm)', function () { sT.input.value = 0.300; sD.input.value = 14; sApp.input.value = -0.15; draw(); }, 'Load large robot worked example: T=0.300 s, d=14 mm'),
		button('Test Curtain Trip', function () { sApp.input.value = Number(sApp.input.value) >= 0 ? -0.15 : 0.12; draw(); }, 'Toggle operator hand breaking the light curtain beams')
	]);

	root.replaceChildren(frame('3D robot safety cell: ISO 13855 light curtain distance', [
		preRow, stage.wrap, readout, status, sT.row, sD.row, sApp.row, az.row, el.row
	]));
	draw();
}

/* ---------- 3D Coordinate Frames & Euler Rotation Explorer (lesson 1.6) ---------- */

var FRAMES_PARTS = [
	{ id: 'world', badge: '1', title: 'World & Robot Base Frame {world} / {base}', shortTitle: '{world}', specPill: 'Fixed Reference Origin', pos: [0, 0, 0.24],
		desc: 'Fixed global reference frame for the whole work cell. By default {base} coincides with {world}.',
		specs: [['Axes', 'X red (forward), Y green (left), Z blue (up)'], ['Role', 'Root parent of the robot kinematic transform chain']] },
	{ id: 'wobj', badge: '2', title: 'Work Object Frame {wobj} on Fixture', shortTitle: '{wobj}', specPill: 'Fixture-Attached Frame', pos: [0.45, 0.0, 0.18],
		desc: 'User frame attached to the fixture table. If the fixture moves or rotates, re-teaching {wobj} automatically updates every programmed part target without rewriting the robot program.',
		specs: [['Invariance', 'Target P stays fixed relative to the workpiece in {wobj}'], ['RAPID', 'Stored in wobjdata; default wobj0 equals {base}']] },
	{ id: 'tool', badge: '3', title: 'Tool Frame {tool} & Euler RPY Orientation', shortTitle: '{tool}', specPill: 'TCP Orientation (Roll, Pitch, Yaw)', pos: [0.55, 0.10, 0.30],
		desc: 'Coordinate frame at the Tool Center Point (TCP). Rotated using ZYX Euler angles (Yaw, Pitch, Roll); note that at Pitch = ±90°, Roll and Yaw align (gimbal lock), which is one reason ABB controllers store orientations as quaternions.',
		specs: [['Gimbal Lock', 'Occurs at Pitch = ±90°, losing one rotational DOF in Euler representation'], ['Quaternions', 'q1..q4 avoid gimbal lock completely']] }
];

function initFrames3D(root) {
	var wx = slider('Fixture {wobj} X (m)', 'fr3d-wx', 0.25, 0.65, 0.01, 0.45, ' m');
	var wy = slider('Fixture {wobj} Y (m)', 'fr3d-wy', -0.30, 0.30, 0.01, 0.00, ' m');
	var wyaw = slider('Fixture {wobj} Yaw', 'fr3d-wyaw', -90, 90, 1, 0, '°');
	var tRoll = slider('Tool Roll (Rx)', 'fr3d-tr', -180, 180, 1, 180, '°');
	var tPitch = slider('Tool Pitch (Ry)', 'fr3d-tp', -90, 90, 1, 0, '°');
	var tYaw = slider('Tool Yaw (Rz)', 'fr3d-ty', -180, 180, 1, 0, '°');
	var az = slider('Camera azimuth', 'fr3d-az', -180, 180, 1, 35, '°');
	var el = slider('Camera elevation', 'fr3d-el', 10, 89, 1, 28, '°');

	var narrow = (root.clientWidth || 600) < 500, W = narrow ? 360 : 560, H = narrow ? 340 : 380;
	var svg = plotFrame(W, H, 'Interactive 3D coordinate frames explorer showing World, Work Object on a movable fixture, and Tool TCP orientation including gimbal lock.');
	svg.classList.add('w3d-canvas');
	var cam = createCamera3D([0.28, 0, 0.12], 1.75, narrow ? 440 : 490, 35, 28);
	var light = norm3([0.4, -0.5, 0.85]);
	var ctl = { az: az, el: el };
	var redraw = frameScheduler(draw);

	var stage = build3DStage(svg, cam, redraw, ctl, {
		title: '3D Coordinate Frames & RPY',
		presets: [
			['3/4', 35, 28, 'Isometric 3/4 view', 1.75],
			['Top', 0, 89, 'Top-down view of fixture transform', 1.80],
			['Side', 0, 12, 'Side elevation view', 1.75]
		],
		parts: FRAMES_PARTS,
		initialLabels: true
	});

	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
	var status = h('p', { 'class': 'widget-readout', 'aria-live': 'polite', style: 'margin-top:2px;' });

	function rpyRot(rDeg, pDeg, yDeg) {
		var r = rDeg * DEG2RAD, p = pDeg * DEG2RAD, y = yDeg * DEG2RAD;
		var cr = Math.cos(r), sr = Math.sin(r), cp = Math.cos(p), sp = Math.sin(p), cy = Math.cos(y), sy = Math.sin(y);
		return {
			x: [cy * cp, sy * cp, -sp],
			y: [cy * sp * sr - sy * cr, sy * sp * sr + cy * cr, cp * sr],
			z: [cy * sp * cr + sy * sr, sy * sp * cr - cy * sr, cp * cr]
		};
	}

	function draw() {
		var Xw = Number(wx.input.value), Yw = Number(wy.input.value), Yaww = Number(wyaw.input.value);
		var Rr = Number(tRoll.input.value), Rp = Number(tPitch.input.value), Ry = Number(tYaw.input.value);
		wx.out.textContent = Xw.toFixed(2) + ' m';
		wy.out.textContent = signed(Yw, 2) + ' m';
		wyaw.out.textContent = Yaww + '°';
		tRoll.out.textContent = Rr + '°';
		tPitch.out.textContent = Rp + '°';
		tYaw.out.textContent = Ry + '°';

		var dark = isDarkWidget(svg), sc = newScene3D(cam, W, H, light);
		floorGrid3D(sc, -0.3, 0.9, -0.5, 0.5, 0.15);

		// World/Base pedestal & frame
		cylinder3D(sc, [0, 0, 0], [0, 0, 0.08], 0.08, dark ? '#6c4bb0' : '#461d7c', { segments: 14, shadow: true, edge: true });
		axes3D(sc, [0, 0, 0.08], null, 0.22, '{world}/{base}');

		// Movable Fixture table + part
		var yRad = Yaww * DEG2RAD, cy = Math.cos(yRad), sy = Math.sin(yRad);
		var R_wobj = { x: [cy, sy, 0], y: [-sy, cy, 0], z: [0, 0, 1] };
		var wOrigin = [Xw, Yw, 0.08];
		box3D(sc, [Xw, Yw, 0.04], [0.36, 0.24, 0.08], yRad, dark ? '#334155' : '#64748b', { shadow: true, edge: true });
		// Part sitting on fixture in {wobj} frame
		var pLocal = [0.08, 0.05, 0.04];
		var pWorld = [Xw + pLocal[0] * cy - pLocal[1] * sy, Yw + pLocal[0] * sy + pLocal[1] * cy, wOrigin[2] + pLocal[2]];
		box3D(sc, [pWorld[0], pWorld[1], 0.10], [0.08, 0.08, 0.04], yRad, '#0891b2', { edge: true });

		// Transform vector from {world} to {wobj}
		line3D(sc, [0, 0, 0.08], wOrigin, { stroke: '#d97706', 'stroke-width': '1.6', 'stroke-dasharray': '4 3' });
		axes3D(sc, wOrigin, R_wobj, 0.16, '{wobj}');

		// Tool TCP at pWorld with Euler orientation relative to {wobj}
		var R_local = rpyRot(Rr, Rp, Ry);
		function mulW(v) { return [v[0] * cy - v[1] * sy, v[0] * sy + v[1] * cy, v[2]]; }
		var R_tool = { x: mulW(R_local.x), y: mulW(R_local.y), z: mulW(R_local.z) };
		var tcpPos = [pWorld[0], pWorld[1], pWorld[2] + 0.08];
		cylinder3D(sc, add3(tcpPos, scale3(R_tool.z, -0.09)), tcpPos, 0.018, '#d97706', { segments: 10, edge: true });
		axes3D(sc, tcpPos, R_tool, 0.14, '{tool}');

		if (stage.showLabels) {
			[
				Object.assign({}, FRAMES_PARTS[0], { pos: [0, 0, 0.25] }),
				Object.assign({}, FRAMES_PARTS[1], { pos: [Xw, Yw, 0.24] }),
				Object.assign({}, FRAMES_PARTS[2], { pos: [tcpPos[0], tcpPos[1], tcpPos[2] + 0.12] })
			].forEach(function (part) {
				drawCalloutChip3D(sc, part, stage.activePartId === part.id, stage.hoveredPartId === part.id, dark, stage);
			});
		}

		renderScene3D(svg, sc);
		readout.textContent = 'Target P in {wobj}: (+0.08, +0.05, +0.04) m | Target P in {world}: (' + pWorld[0].toFixed(2) + ', ' + signed(pWorld[1], 2) + ', ' + pWorld[2].toFixed(2) + ') m';
		var glock = Math.abs(Math.abs(Rp) - 90) < 3;
		var st = glock ? '⚠️ Gimbal lock at Pitch = ' + Rp + '°: Roll and Yaw rotate around the same vertical axis! Quaternions (q1..q4) avoid this.' :
			'Notice how moving or rotating the fixture shifts {world} coordinates while P stays locked on the blue part inside {wobj}.';
		if (status.textContent !== st) status.textContent = st;
	}

	orbitControls(svg, cam, redraw, ctl);
	[wx, wy, wyaw, tRoll, tPitch, tYaw].forEach(function (c) { c.input.addEventListener('input', draw); });

	var preRow = h('div', { 'class': 'widget-buttons' }, [
		button('Aligned fixture', function () { wx.input.value = 0.45; wy.input.value = 0; wyaw.input.value = 0; tRoll.input.value = 180; tPitch.input.value = 0; tYaw.input.value = 0; draw(); }, 'Reset fixture and tool alignment'),
		button('Shift & rotate fixture', function () { wx.input.value = 0.35; wy.input.value = 0.22; wyaw.input.value = 35; draw(); }, 'Shift and rotate the fixture work object'),
		button('Gimbal lock (Pitch 90°)', function () { tRoll.input.value = 0; tPitch.input.value = 90; tYaw.input.value = 30; draw(); }, 'Demonstrate Euler gimbal lock at 90 degrees pitch')
	]);

	root.replaceChildren(frame('3D coordinate frames: {world}, {wobj} & {tool}', [
		preRow, stage.wrap, readout, status, wx.row, wy.row, wyaw.row, tRoll.row, tPitch.row, tYaw.row, az.row, el.row
	]));
	draw();
}

// ---- costmap-inflation (step 68) ----
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

// ---- launch-tree (step 68) ----
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
// ---- moveit-pipeline (step 68) ----
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

// ---- lighting-angles (step 68) ----
// Placeholder text: The lighting angles simulator needs JavaScript. With it on, you can switch between backlight, ring light, glancing, darkfield, diffuse dome, and coaxial illumination to see light paths and what the camera sees.

// Facts used:
// - Backlight positioning & use (lines 235, 244): light source positioned behind the object shining toward the camera lens; used for checking external boundaries, measuring dimensions or hole diameters, and 2D robotic picking/sorting.
// - Backlight camera view (lines 238, 241): background appears near saturation (pure white); opaque object blocks transmission and appears as a deep black profile (opaque silhouette); front face receives no direct light so surface scratches are cast into uniform shadow.
// - Ring light (lines 252, 255): mounts directly to the camera lens for uniform, shadow-reducing illumination over short working distances; on reflective parts (polished metals, glossy plastics) LEDs produce a bright circular ring of specular reflections (glare) that saturates pixels and obscures underlying features.
// - Directional glancing illumination (line 258): point-source light at a low, grazing angle (sharp angle of incidence) reveals surface topography and texture; raised ridges and surface cracks cast distinct, elongated shadows, turning small height differences into high-contrast edges.
// - Darkfield illumination (lines 261, 264): shallow-angle light strikes a flat, shiny surface so mirror-like reflection bounces away from the lens and a smooth, defect-free surface appears completely black; scratches scatter shallow incident rays upward into the camera aperture as a bright line or spot on a black background.
// - Diffuse dome lights (lines 275, 278): project omnidirectional scattered light (like an overcast sky) from every angle to evenly illuminate curved specular objects, eliminating harsh shadows and specular highlights for reading printed labels, inspecting solder fillets, and detecting dimensional flaws.
// - Coaxial illumination (lines 283, 286, 289, 307): uses a beamsplitter (semi-transparent mirror in front of the lens) to project diffuse light along the camera optical axis onto flat specular surfaces (silicon wafers, polished glass, mirrored metal dies); flat surfaces reflect directly back appearing bright and uniform, while scratches, edge bevels, and engraved markings scatter light away and appear dark (with beamsplitter stray light adding slight haze).
// - Side-view diagram conventions (line 293): camera above the part, gold light sources, and directional rays for backlight, glancing, darkfield, diffuse dome, and coaxial with a beamsplitter.

function initLightingAngles(root) {
	var W = 560, H = 320;
	var svg = plotFrame(W, H, 'Side-view lighting geometry and simulated camera view');

	var MODES = [
		{
			id: 'backlight',
			label: 'Backlight',
			aria: 'Backlight side view and camera silhouette view',
			camLines: [
				'Background: pure white',
				'Part: deep black silhouette',
				'Edge & scratch: in shadow'
			],
			readout: 'Backlight: Light behind the part shines toward the camera lens, showing an opaque silhouette against a near-saturated white background. Maximizes edge contrast for checking external boundaries, measuring dimensions or hole diameters, and 2D robotic picking or sorting, while front-face surface scratches are cast into uniform shadow.'
		},
		{
			id: 'ring',
			label: 'Ring light',
			aria: 'Ring light mounted on lens with circular glare on shiny part',
			camLines: [
				'Lens-mounted front lighting',
				'Uniform over short distances',
				'Shiny part: bright glare ring'
			],
			readout: 'Ring light: Mounts directly to the camera lens to provide uniform, shadow-reducing illumination over short working distances. On reflective parts such as polished metals or glossy plastics, LEDs cause a bright circular glare ring that saturates sensor pixels and obscures underlying features.'
		},
		{
			id: 'glancing',
			label: 'Glancing',
			aria: 'Directional glancing light at a low grazing angle casting a shadow from the raised edge',
			camLines: [
				'Grazing angle across surface',
				'Raised edge casts long shadow',
				'Height steps -> sharp edges'
			],
			readout: 'Glancing illumination: Point-source light at a low, grazing angle reveals surface topography and texture. Small raised ridges, stamped characters, laser etchings, and surface cracks cast distinct, elongated shadows that turn small height differences into high-contrast edges.'
		},
		{
			id: 'darkfield',
			label: 'Darkfield',
			aria: 'Darkfield shallow-angle light where flat reflections miss the lens and the scratch scatters light up',
			camLines: [
				'Smooth flat surface: black',
				'Reflection misses the lens',
				'Scratch: bright line on black'
			],
			readout: 'Darkfield illumination: Shallow-angle light bounces away from the lens on a flat, shiny surface, so a smooth defect-free surface appears completely black. A surface scratch scatters shallow incident rays upward into the camera aperture as a bright line on a black background for flaw detection.'
		},
		{
			id: 'dome',
			label: 'Diffuse dome',
			aria: 'Diffuse dome projecting omnidirectional light from every angle onto the part',
			camLines: [
				'Rays from every angle',
				'No harsh shadows or glare',
				'Even brightness across part'
			],
			readout: 'Diffuse dome: Projects omnidirectional scattered light like an overcast sky, eliminating harsh shadows and specular highlights. Good for reading printed labels, inspecting solder fillets, and detecting subtle dimensional flaws across curved, reflective parts.'
		},
		{
			id: 'coaxial',
			label: 'Coaxial',
			aria: 'Coaxial illumination using a beamsplitter to send light along the camera optical axis',
			camLines: [
				'Flat shiny surface: bright',
				'Scratch & bevel: dark feature',
				'Beamsplitter adds faint haze'
			],
			readout: 'Coaxial illumination: A beamsplitter projects diffuse light along the camera optical axis onto flat specular surfaces (such as silicon wafers, polished glass, or mirrored metal dies). Flat surfaces appear bright and uniform, while surface scratches, edge bevels, and engravings scatter light away and appear dark.'
		}
	];

	var current = MODES[0];
	var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });
	var buttons = h('div', { 'class': 'widget-buttons', role: 'group', 'aria-label': 'Lighting technique' });

	function addEl(parent, tag, attrs, text) {
		var el = s(tag, attrs);
		if (text !== undefined) el.textContent = text;
		parent.appendChild(el);
		return el;
	}

	function drawArrow(parent, x1, y1, x2, y2, kind) {
		if (kind === 'gold') {
			addEl(parent, 'line', {
				x1: x1, y1: y1, x2: x2, y2: y2,
				stroke: 'var(--wp-gold-text)', 'stroke-width': '2',
				'marker-end': 'url(#la-arrow-gold)'
			});
		} else if (kind === 'cam') {
			addEl(parent, 'line', {
				'class': 'd-strong',
				x1: x1, y1: y1, x2: x2, y2: y2,
				'marker-end': 'url(#la-arrow-link)'
			});
		} else {
			addEl(parent, 'line', {
				'class': 'd-line',
				'stroke-dasharray': '4 3',
				x1: x1, y1: y1, x2: x2, y2: y2,
				'marker-end': 'url(#la-arrow-muted)'
			});
		}
	}

	function draw() {
		svg.replaceChildren();
		svg.setAttribute('aria-label', current.aria);

		var defs = addEl(svg, 'defs', {});
		[
			['la-arrow-gold', 'var(--wp-gold-text)'],
			['la-arrow-link', 'var(--wp-link)'],
			['la-arrow-muted', 'var(--wp-text-muted)']
		].forEach(function (spec) {
			var mk = addEl(defs, 'marker', {
				id: spec[0], viewBox: '0 0 10 10', refX: '8', refY: '5',
				markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse'
			});
			addEl(mk, 'path', { d: 'M0,0 L10,5 L0,10 z', fill: spec[1] });
		});

		// Left panel: side-view geometry
		addEl(svg, 'rect', {
			x: 8, y: 10, width: 330, height: 300, rx: 6,
			fill: 'var(--wp-bg)', stroke: 'var(--wp-border)', 'stroke-width': '1'
		});
		addEl(svg, 'text', { 'class': 'd-title', x: 20, y: 30 }, 'Side view');
		addEl(svg, 'text', { 'class': 'd-muted', x: 326, y: 30, 'text-anchor': 'end' }, current.label);

		// Camera and lens above the part
		addEl(svg, 'rect', { 'class': 'd-box', x: 135, y: 36, width: 80, height: 22, rx: 4 });
		addEl(svg, 'text', { 'class': 'd-muted', x: 175, y: 51, 'text-anchor': 'middle' }, 'Camera');
		addEl(svg, 'rect', { 'class': 'd-box', x: 158, y: 58, width: 34, height: 12, rx: 2 });

		// Part with raised edge (left) and surface scratch (right)
		addEl(svg, 'path', {
			'class': 'd-box',
			d: 'M 100,222 L 122,222 L 122,206 L 140,206 L 140,222 L 192,222 L 198,229 L 204,222 L 250,222 L 250,244 L 100,244 Z'
		});
		addEl(svg, 'text', { 'class': 'd-muted', x: 168, y: 239, 'text-anchor': 'middle' }, 'Part');
		addEl(svg, 'text', { 'class': 'd-muted', x: 131, y: 258, 'text-anchor': 'middle' }, 'Raised edge');
		addEl(svg, 'text', { 'class': 'd-muted', x: 204, y: 258, 'text-anchor': 'middle' }, 'Scratch');

		// Light source and ray geometry per mode
		var m = current.id;
		if (m === 'backlight') {
			addEl(svg, 'rect', { 'class': 'd-box-gold', x: 56, y: 274, width: 238, height: 18, rx: 3 });
			addEl(svg, 'text', {
				x: 175, y: 287, 'text-anchor': 'middle',
				'font-size': '12px', 'font-weight': '700', fill: 'var(--wp-gold-text)'
			}, 'Backlight');
			drawArrow(svg, 70, 272, 162, 73, 'gold');
			drawArrow(svg, 280, 272, 188, 73, 'gold');
			drawArrow(svg, 173, 272, 173, 248, 'blocked');
			drawArrow(svg, 238, 272, 238, 248, 'blocked');
		} else if (m === 'ring') {
			addEl(svg, 'rect', { 'class': 'd-box-gold', x: 132, y: 58, width: 24, height: 12, rx: 2 });
			addEl(svg, 'rect', { 'class': 'd-box-gold', x: 194, y: 58, width: 24, height: 12, rx: 2 });
			addEl(svg, 'text', { 'class': 'd-muted', x: 224, y: 68 }, 'Ring light');
			drawArrow(svg, 144, 72, 163, 220, 'gold');
			drawArrow(svg, 206, 72, 187, 220, 'gold');
			drawArrow(svg, 165, 220, 169, 73, 'cam');
			drawArrow(svg, 185, 220, 181, 73, 'cam');
		} else if (m === 'glancing') {
			addEl(svg, 'rect', { 'class': 'd-box-gold', x: 18, y: 196, width: 28, height: 14, rx: 3 });
			addEl(svg, 'text', { 'class': 'd-muted', x: 18, y: 188 }, 'Glancing light');
			addEl(svg, 'path', {
				d: 'M 140,206 L 190,222 L 140,222 Z',
				fill: 'var(--wp-text-muted)', opacity: '0.28'
			});
			addEl(svg, 'text', { 'class': 'd-muted', x: 165, y: 199, 'text-anchor': 'middle' }, 'Shadow');
			drawArrow(svg, 46, 203, 120, 212, 'gold');
			drawArrow(svg, 46, 198, 234, 213, 'gold');
			drawArrow(svg, 122, 208, 171, 73, 'cam');
		} else if (m === 'darkfield') {
			addEl(svg, 'rect', { 'class': 'd-box-gold', x: 18, y: 204, width: 26, height: 12, rx: 3 });
			addEl(svg, 'rect', { 'class': 'd-box-gold', x: 304, y: 204, width: 26, height: 12, rx: 3 });
			addEl(svg, 'text', { 'class': 'd-muted', x: 18, y: 196 }, 'Darkfield lights');
			addEl(svg, 'text', { 'class': 'd-muted', x: 248, y: 192, 'text-anchor': 'middle' }, 'Misses lens');
			drawArrow(svg, 44, 210, 156, 221, 'gold');
			drawArrow(svg, 156, 221, 282, 204, 'blocked');
			drawArrow(svg, 304, 210, 200, 221, 'gold');
			drawArrow(svg, 198, 220, 178, 73, 'cam');
		} else if (m === 'dome') {
			addEl(svg, 'path', {
				'class': 'd-line', 'stroke-width': '3',
				d: 'M 54,238 A 121,132 0 0 1 156,86 M 194,86 A 121,132 0 0 1 296,238'
			});
			addEl(svg, 'path', {
				fill: 'none', stroke: 'var(--wp-gold-text)', 'stroke-width': '2', 'stroke-dasharray': '4 3',
				d: 'M 60,236 A 115,126 0 0 1 156,92 M 194,92 A 115,126 0 0 1 290,236'
			});
			addEl(svg, 'text', { 'class': 'd-muted', x: 20, y: 112 }, 'Diffuse dome');
			drawArrow(svg, 74, 178, 122, 207, 'gold');
			drawArrow(svg, 108, 122, 154, 220, 'gold');
			drawArrow(svg, 242, 122, 194, 220, 'gold');
			drawArrow(svg, 276, 178, 228, 220, 'gold');
			drawArrow(svg, 166, 220, 170, 73, 'cam');
			drawArrow(svg, 184, 220, 180, 73, 'cam');
		} else if (m === 'coaxial') {
			addEl(svg, 'rect', { 'class': 'd-box-gold', x: 18, y: 118, width: 36, height: 28, rx: 3 });
			addEl(svg, 'text', {
				x: 36, y: 136, 'text-anchor': 'middle',
				'font-size': '12px', 'font-weight': '700', fill: 'var(--wp-gold-text)'
			}, 'Light');
			addEl(svg, 'line', {
				x1: 144, y1: 112, x2: 206, y2: 150,
				stroke: 'var(--wp-link)', 'stroke-width': '3'
			});
			addEl(svg, 'text', { 'class': 'd-muted', x: 212, y: 134 }, 'Beamsplitter');
			drawArrow(svg, 54, 124, 162, 124, 'gold');
			drawArrow(svg, 54, 145, 196, 145, 'gold');
			drawArrow(svg, 164, 125, 164, 220, 'gold');
			drawArrow(svg, 198, 146, 198, 220, 'gold');
			drawArrow(svg, 169, 220, 169, 73, 'cam');
			drawArrow(svg, 198, 220, 244, 174, 'blocked');
		}

		// Right panel: simulated top-down camera view inset
		addEl(svg, 'rect', { 'class': 'd-box', x: 348, y: 10, width: 204, height: 300, rx: 6 });
		addEl(svg, 'text', { 'class': 'd-title', x: 450, y: 32, 'text-anchor': 'middle' }, 'Camera view');
		addEl(svg, 'text', { 'class': 'd-muted', x: 450, y: 49, 'text-anchor': 'middle' }, 'Top-down sensor image');

		var bgCol = '#262626', partCol = '#b8b8b8', edgeCol = '#c8c8c8', edgeStroke = '#666666';
		if (m === 'backlight') {
			bgCol = '#ffffff'; partCol = '#000000'; edgeCol = '#000000'; edgeStroke = 'none';
		} else if (m === 'ring') {
			bgCol = '#222222'; partCol = '#a6a6a6'; edgeCol = '#b8b8b8'; edgeStroke = '#707070';
		} else if (m === 'glancing') {
			bgCol = '#222222'; partCol = '#b6b6b6'; edgeCol = '#ffffff'; edgeStroke = '#555555';
		} else if (m === 'darkfield') {
			bgCol = '#000000'; partCol = '#050505'; edgeCol = '#050505'; edgeStroke = '#262626';
		} else if (m === 'dome') {
			bgCol = '#2c2c2c'; partCol = '#d4d4d4'; edgeCol = '#e2e2e2'; edgeStroke = '#9a9a9a';
		} else if (m === 'coaxial') {
			bgCol = '#3b3b3b'; partCol = '#f2f2f2'; edgeCol = '#2b2b2b'; edgeStroke = '#555555';
		}

		addEl(svg, 'rect', {
			x: 366, y: 60, width: 168, height: 146, rx: 3,
			fill: bgCol, stroke: 'var(--wp-border)', 'stroke-width': '1.5'
		});
		addEl(svg, 'rect', {
			x: 388, y: 94, width: 124, height: 78, rx: 2,
			fill: partCol,
			stroke: m === 'backlight' ? '#000000' : (m === 'darkfield' ? '#242424' : '#555555'),
			'stroke-width': '1'
		});

		if (m === 'glancing') {
			// Elongated shadow cast to the right of the raised edge
			addEl(svg, 'rect', { x: 418, y: 94, width: 26, height: 78, fill: '#181818' });
		}
		if (m !== 'backlight' && m !== 'darkfield') {
			addEl(svg, 'rect', {
				x: 406, y: 94, width: 12, height: 78,
				fill: edgeCol, stroke: edgeStroke, 'stroke-width': '1'
			});
		}

		// Surface scratch in camera view
		if (m === 'glancing') {
			addEl(svg, 'path', { d: 'M 476,110 L 488,134 L 480,156', fill: 'none', stroke: '#ffffff', 'stroke-width': '2' });
			addEl(svg, 'path', { d: 'M 473,110 L 485,134 L 477,156', fill: 'none', stroke: '#181818', 'stroke-width': '2.5' });
		} else if (m === 'darkfield') {
			addEl(svg, 'path', { d: 'M 474,110 L 486,134 L 478,156', fill: 'none', stroke: '#ffffff', 'stroke-width': '2.5' });
		} else if (m === 'coaxial') {
			addEl(svg, 'path', { d: 'M 474,110 L 486,134 L 478,156', fill: 'none', stroke: '#262626', 'stroke-width': '2.5' });
		} else if (m === 'dome') {
			addEl(svg, 'path', { d: 'M 474,110 L 486,134 L 478,156', fill: 'none', stroke: '#8c8c8c', 'stroke-width': '2' });
		} else if (m === 'ring') {
			addEl(svg, 'path', { d: 'M 474,110 L 486,134 L 478,156', fill: 'none', stroke: '#7a7a7a', 'stroke-width': '2' });
			addEl(svg, 'circle', {
				cx: 450, cy: 133, r: 34,
				fill: 'none', stroke: '#ffffff', 'stroke-width': '12', opacity: '0.92'
			});
		}

		addEl(svg, 'text', {
			x: 366, y: 226,
			'font-size': '13px', 'font-weight': '700', fill: 'var(--wp-text)'
		}, 'What the camera sees:');
		current.camLines.forEach(function (line, idx) {
			addEl(svg, 'text', { 'class': 'd-muted', x: 366, y: 246 + idx * 19 }, line);
		});

		readout.textContent = current.readout;
	}

	MODES.forEach(function (mode) {
		var b = button(mode.label, function () {
			current = mode;
			Array.prototype.forEach.call(buttons.children, function (btn) {
				btn.setAttribute('aria-pressed', String(btn === b));
			});
			draw();
		});
		b.setAttribute('aria-pressed', String(mode === current));
		buttons.appendChild(b);
	});

	root.replaceChildren(frame('Machine vision lighting angles', [
		h('p', {
			'class': 'widget-note',
			text: 'Pick a lighting setup to see where the light sits, how rays travel to the camera, and which features stand out. Gold: light source and incident rays; solid arrows: light entering the lens.'
		}),
		buttons,
		svg,
		readout
	]));
	draw();
}

// ---- troubleshoot-steps (step 68) ----
// Placeholder text: The troubleshooting steps walkthrough needs JavaScript. With it on, you can step through a fault scenario from hazardous energy control to documenting the repair.

// Facts used (from robotics-9-2.html):
// Step 70 (2026-11-27): 9.2 sections 01-03 were reworded in plain words. The on-screen strings below
// now match the new lesson wording; the quoted lines here are the pre-step-70 originals they came from.
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
				'Pressing an emergency stop does',
				'not isolate the robot. Switching',
				'to manual mode does not either.',
				'An energy isolating device, such',
				'as a main disconnect switch or',
				'shutoff valve, physically blocks',
				'the energy instead.'
			], 12);
			readout.textContent = 'Step 1 of 7 — Control hazardous energy (Sections 01–02): Maintenance and repair need more: the machine has to be cut off from every energy source so it cannot move or release energy while someone works on it. OSHA standard 29 CFR 1910.147 sets out procedures to switch machinery off safely and stop it releasing hazardous energy while it is serviced. Pressing an emergency stop does not isolate the robot. Switching it to manual mode does not isolate it either. The steps must happen in a fixed order: first preparation and shutdown, then machine isolation, lockout application, stored energy relief, and finally verification of isolation. After the locks are on, all energy that is left over or stored and could still be hazardous must be relieved, disconnected, restrained, and made safe. Only the authorized worker who put a lockout device on is allowed to take it off.';
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
					'If you reset a fault without finding its',
					'root cause, the fault is hidden instead of',
					'fixed, and the risk of injury goes up.',
					'UR warns that automatic acknowledgment and',
					'reset of robot stops masks faults that',
					'will lead to a failure condition.'
				], 13);
				readout.textContent = 'Step 2 of 7 — Warning on unverified reset (Section 03): If you reset a robot fault without finding its root cause, the fault is hidden instead of fixed, and the risk that someone gets hurt goes up. UR warns that automatic acknowledgment and reset of robot stops masks faults that will lead to a failure condition.';
			} else {
				drawCard(12, 136, 536, 174, false, 'Cell stopped — choose an action', [
					'Once the cell is properly secured and',
					'safe to inspect, troubleshooting',
					'starts with gathering facts.',
					'Pick one of the two actions above:',
					'• Collect observable symptoms',
					'• Reset the alarm and restart'
				], 13);
				readout.textContent = 'Step 2 of 7 — Gather symptoms (Section 03): Once the cell is properly secured and safe to inspect, troubleshooting starts with gathering facts. Select an action: Collect observable symptoms, or Reset the alarm and restart.';
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
	var INIT = {
		'costmap-inflation': initCostmapInflation,
		'launch-tree': initLaunchTree,
		'moveit-pipeline': initMoveitPipeline,
		'lighting-angles': initLightingAngles,
		'troubleshoot-steps': initTroubleshootSteps,
		pwm: initPwm,
		encoder: initEncoder,
		pid: initPid,
		arm: initArm,
		blocks: initBlocks,
		odometry: initOdometry,
		fsm: initFsm,
		kalman: initKalman,
		rosgraph: initRosgraph,
		movejl: initMovejl,
		threshold: initThreshold,
		prflow: initPrflow,
		modbus: initModbus,
		trapezoid: initTrapezoid,
		zones: initZones,
		qos: initQos,
		dashboard: initDashboard,
		'agv-vs-amr': initAgvVsAmr,
		'cycle-time-positioner': initCycleTimePositioner,
		'vacuum-cup-sizing': initVacuumCupSizing,
		'offs-vs-reltool': initOffsVsReltool,
		'pallet-indexing': initPalletIndexing,
		'vision-frame-shift': initVisionFrameShift,
		'ros-domain-id': initRosDomainId,
		'square-fsm': initSquareFsm,
		'stereo-disparity': initStereoDisparity,
		'pinhole-projection': initPinholeProjection,
		'dlr-ring-recovery': initDlrRingRecovery,
		'edge-case-classifier': initEdgeCaseClassifier,
		'ultrasonic-distance': initUltrasonicDistance,
		'gyro-drift': initGyroDrift,
		'jacobian-singularity': initJacobianSingularity,
		'f-number-aperture': initFNumberAperture,
		'presence-area-check': initPresenceAreaCheck,
		'ethernet-ip-messaging': initEthernetIpMessaging,
		fov: initFov,
		vlan: initVlan,
		'robot-arm-3d': initRobotArm3D,
		'robot-configs-3d': initRobotConfigs3D,
		'safety-cell-3d': initSafetyCell3D,
		'frames-3d': initFrames3D,
		'amr-frames-3d': initAmrFrames3D,
		'arduino-uno-3d': initArduinoUno3D
	};

	/* "Load these values" buttons in lessons: <button data-widget-load="fov" data-values='{"fov-h": 8.8}'>.
	   Each key is the id of one of the widget's inputs (the first argument after the label in slider()).
	   Sets the inputs, fires 'input' so the widget redraws, scrolls the widget into view and focuses it. */
	function loadWidgetValues(btn) {
		var root = document.querySelector('[data-widget="' + btn.getAttribute('data-widget-load') + '"]');
		var values;
		try { values = JSON.parse(btn.getAttribute('data-values') || '{}'); } catch (e) { return; }
		if (!root) return;
		Object.keys(values).forEach(function (id) {
			var input = root.querySelector('[id="' + id + '"]');
			if (!input) return;
			input.value = values[id];
			input.dispatchEvent(new Event('input', { bubbles: true }));
			input.dispatchEvent(new Event('change', { bubbles: true }));
		});
		var target = root.querySelector('figure') || root;
		if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
		target.focus({ preventScroll: true });
	}

	function bootLoadButtons() {
		Array.prototype.forEach.call(document.querySelectorAll('[data-widget-load]'), function (btn) {
			var root = document.querySelector('[data-widget="' + btn.getAttribute('data-widget-load') + '"]');
			if (!root || !root.querySelector('input')) return; // keep it hidden when the widget did not start
			btn.hidden = false;
			btn.addEventListener('click', function () { loadWidgetValues(btn); });
		});
	}

	/* One "Reset controls" button for every widget with sliders, choices or checkboxes: it puts each
	   control back to the value it had when the widget started and fires 'input'/'change' so the widget
	   redraws. It does not rewind a running simulation's own state, which is why the widgets that
	   already have their own Reset button are left alone. */
	function addResetControls(root) {
		var fig = root.querySelector('figure');
		if (!fig) return;
		var controls = Array.prototype.slice.call(fig.querySelectorAll('input[type="range"], input[type="checkbox"], input[type="radio"], select'));
		if (!controls.length) return;
		var hasReset = Array.prototype.some.call(fig.querySelectorAll('button'), function (b) { return /^(reset|default)/i.test(b.textContent.trim()); });
		if (hasReset) return;
		var initial = controls.map(function (c) { return c.type === 'checkbox' || c.type === 'radio' ? c.checked : c.value; });
		var btn = button('Reset controls', function () {
			controls.forEach(function (c, i) {
				if (c.type === 'checkbox' || c.type === 'radio') { if (c.checked === initial[i]) return; c.checked = initial[i]; }
				else { if (c.value === initial[i]) return; c.value = initial[i]; }
				c.dispatchEvent(new Event('input', { bubbles: true }));
				c.dispatchEvent(new Event('change', { bubbles: true }));
			});
		});
		btn.setAttribute('aria-label', 'Reset the controls of this widget to their starting values');
		fig.appendChild(h('div', { 'class': 'widget-buttons widget-reset-row' }, [btn]));
	}

	function boot() {
		Array.prototype.forEach.call(document.querySelectorAll('[data-widget]'), function (el) {
			var fn = INIT[el.getAttribute('data-widget')];
			if (fn) { try { fn(el); addResetControls(el); } catch (e) { /* keep the static fallback */ } }
			// The d-* shape and text classes are styled under .lesson-diagram; make sure every widget SVG has it.
			Array.prototype.forEach.call(el.querySelectorAll('svg'), function (svg) {
				if (svg.classList && !svg.classList.contains('lesson-diagram')) svg.classList.add('lesson-diagram');
				// An image must not contain controls: a plot with focusable parts is a labelled group instead.
				if (svg.getAttribute('role') === 'img' && svg.querySelector('[tabindex]')) svg.setAttribute('role', 'group');
			});
		});
		bootLoadButtons();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
