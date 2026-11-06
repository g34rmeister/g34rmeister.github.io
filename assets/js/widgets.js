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
	"presence-area-check" | "ethernet-ip-messaging" | "fov" | "vlan" is turned into a small simulator. Plain JS and inline SVG, no libraries. Without JS the
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

	/* ---------- Pinhole camera projection matrix K (lesson 7.6) ---------- */

	function initPinholeProjection(root) {
		var sX = slider('3D coordinate X (m)', 'pp-x', -0.25, 0.25, 0.01, 0.10, ' m');
		var sY = slider('3D coordinate Y (m)', 'pp-y', -0.20, 0.20, 0.01, 0.05, ' m');
		var sZ = slider('3D coordinate Z (m)', 'pp-z', 0.40, 2.50, 0.05, 1.00, ' m');
		var sF = slider('Focal length (fx = fy)', 'pp-f', 400, 1200, 50, 800, ' px');

		var W = 380, H = 210;
		var svg = plotFrame(W, H, 'Pinhole projection of 3D camera coordinates to 2D image pixel coordinates');
		var readout = h('p', { 'class': 'widget-readout', 'aria-live': 'polite' });

		var btnWorked = button('Worked example ([0.10, 0.05, 1.00] m)', function () {
			sX.input.value = 0.10; sY.input.value = 0.05; sZ.input.value = 1.00; sF.input.value = 800; draw();
		});
		var btnCenter = button('Optical center ([0.0, 0.0, 1.00] m)', function () {
			sX.input.value = 0.0; sY.input.value = 0.0; sZ.input.value = 1.00; draw();
		});
		var btnClose = button('Closer point (Z=0.50 m)', function () {
			sZ.input.value = 0.50; draw();
		});

		var buttons = h('div', { 'class': 'widget-buttons' }, [btnWorked, btnCenter, btnClose]);

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

			svg.replaceChildren();

			var sensorW = 224, sensorH = 168;
			var originX = 78, originY = 20;

			var frameBox = s('rect', { 'class': 'd-box', x: originX, y: originY, width: sensorW, height: sensorH, rx: 4 });
			svg.appendChild(frameBox);

			var cxSvg = originX + (cx / 640) * sensorW;
			var cySvg = originY + (cy / 480) * sensorH;
			var chX = s('line', { 'class': 'd-line', 'stroke-dasharray': '2 3', x1: originX, y1: cySvg, x2: originX + sensorW, y2: cySvg });
			var chY = s('line', { 'class': 'd-line', 'stroke-dasharray': '2 3', x1: cxSvg, y1: originY, x2: cxSvg, y2: originY + sensorH });
			var tCenter = s('text', { 'class': 'd-muted', x: cxSvg + 4, y: cySvg - 4, 'font-size': '10px' });
			tCenter.textContent = '(cx, cy)';
			svg.appendChild(chX);
			svg.appendChild(chY);
			svg.appendChild(tCenter);

			var uSvg = originX + (u / 640) * sensorW;
			var vSvg = originY + (v / 480) * sensorH;

			var inBounds = (u >= 0 && u <= 640 && v >= 0 && v <= 480);
			var dot = s('circle', {
				'class': inBounds ? 'd-box-gold' : 'd-box',
				cx: Math.max(originX, Math.min(originX + sensorW, uSvg)),
				cy: Math.max(originY, Math.min(originY + sensorH, vSvg)),
				r: 6
			});
			var tPoint = s('text', { 'class': 'd-title', x: originX + sensorW + 10, y: 100 });
			tPoint.textContent = 'u = ' + u.toFixed(1) + ' px';
			var tPointV = s('text', { 'class': 'd-title', x: originX + sensorW + 10, y: 120 });
			tPointV.textContent = 'v = ' + v.toFixed(1) + ' px';

			svg.appendChild(dot);
			svg.appendChild(tPoint);
			svg.appendChild(tPointV);

			var tBounds = s('text', { 'class': 'd-muted', x: originX, y: originY + sensorH + 14 });
			tBounds.textContent = '640 × 480 image frame (optical center at 320, 240)';
			svg.appendChild(tBounds);

			readout.textContent = '[X, Y, Z] = [' + X.toFixed(2) + ', ' + Y.toFixed(2) + ', ' +
				Z.toFixed(2) + '] m · Normalized: x\' = ' + x_norm.toFixed(3) + ', y\' = ' +
				y_norm.toFixed(3) + ' · Pixel: u = ' + fx + '×' + x_norm.toFixed(3) + ' + 320 = ' +
				u.toFixed(1) + ' px, v = ' + fy + '×' + y_norm.toFixed(3) + ' + 240 = ' +
				v.toFixed(1) + ' px ' + (inBounds ? '(inside frame)' : '(outside frame!)') + '.';
		}

		[sX, sY, sZ, sF].forEach(function (ctrl) {
			ctrl.input.addEventListener('input', draw);
		});

		root.replaceChildren(frame('pinhole projection: 3D camera frame to 2D pixels', [
			h('p', { 'class': 'widget-note', text: 'Intrinsic matrix K projects 3D camera coordinates to 2D pixels: normalized x\'=X/Z, y\'=Y/Z; then u = fx·x\' + cx, v = fy·y\' + cy.' }),
			sX.row,
			sY.row,
			sZ.row,
			sF.row,
			buttons,
			svg,
			readout
		]));

		draw();
	}

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

	var INIT = {
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
		vlan: initVlan
	};

	function boot() {
		Array.prototype.forEach.call(document.querySelectorAll('[data-widget]'), function (el) {
			var fn = INIT[el.getAttribute('data-widget')];
			if (fn) { try { fn(el); } catch (e) { /* keep the static fallback */ } }
			// The d-* shape and text classes are styled under .lesson-diagram; make sure every widget SVG has it.
			Array.prototype.forEach.call(el.querySelectorAll('svg'), function (svg) {
				if (svg.classList && !svg.classList.contains('lesson-diagram')) svg.classList.add('lesson-diagram');
			});
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
