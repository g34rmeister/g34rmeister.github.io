/*
	robOSStics: interactive widgets
	Any element with data-widget="pwm" | "encoder" | "pid" | "arm" | "blocks" |
	"odometry" | "fsm" | "kalman" | "rosgraph" | "movejl" | "threshold" | "prflow" |
	"modbus" is turned into a small simulator. Plain JS and inline SVG, no libraries. Without JS the
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
		var svg = s('svg', { viewBox: '0 0 ' + w + ' ' + hgt, 'class': 'widget-plot', role: 'img', 'aria-label': label });
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
		var W = 620, H = 220;
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
			{ id: 'teleop', kind: 'node', label: '/teleop_turtle', sub: 'node', x: 20, y: 30, w: 145, h: 52, rx: 4 },
			{ id: 'cmd_vel', kind: 'topic', label: '/turtle1/cmd_vel', sub: 'geometry_msgs/msg/Twist', x: 215, y: 30, w: 185, h: 52, rx: 16 },
			{ id: 'turtlesim', kind: 'node', label: '/turtlesim', sub: 'node', x: 450, y: 30, w: 145, h: 52, rx: 4 },
			{ id: 'pose', kind: 'topic', label: '/turtle1/pose', sub: 'turtlesim_msgs/msg/Pose', x: 215, y: 135, w: 185, h: 52, rx: 16 },
			{ id: 'color_sensor', kind: 'topic', label: '/turtle1/color_sensor', sub: 'turtlesim_msgs/msg/Color', x: 430, y: 135, w: 175, h: 52, rx: 16 }
		];

		var ARROWS = [
			{ id: 'a-teleop-cmd', from: 'teleop', to: 'cmd_vel', type: 'line', x1: 165, y1: 56, x2: 213, y2: 56 },
			{ id: 'a-cmd-sim', from: 'cmd_vel', to: 'turtlesim', type: 'line', x1: 400, y1: 56, x2: 448, y2: 56 },
			{ id: 'a-sim-pose', from: 'turtlesim', to: 'pose', type: 'path', d: 'M 480,82 C 480,115 425,135 402,148' },
			{ id: 'a-sim-color', from: 'turtlesim', to: 'color_sensor', type: 'line', x1: 518, y1: 82, x2: 518, y2: 133 }
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
		var W = 620, H = 220;
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
		gUpstream.appendChild(s('rect', { 'class': 'd-box', x: 20, y: 24, width: 205, height: 66, rx: 6 }));
		var tU1 = s('text', { 'class': 'd-title', x: 122, y: 48, 'text-anchor': 'middle' }); tU1.textContent = 'Upstream repository';
		var tU2 = s('text', { 'class': 'd-muted', x: 122, y: 68, 'text-anchor': 'middle' }); tU2.textContent = 'official project (GitHub)';
		gUpstream.appendChild(tU1); gUpstream.appendChild(tU2);
		svg.appendChild(gUpstream);

		var gFork = s('g', { id: 'pr-fork' });
		gFork.appendChild(s('rect', { 'class': 'd-box', x: 395, y: 24, width: 205, height: 66, rx: 6 }));
		var tF1 = s('text', { 'class': 'd-title', x: 497, y: 48, 'text-anchor': 'middle' }); tF1.textContent = 'Your fork';
		var tF2 = s('text', { 'class': 'd-muted', x: 497, y: 68, 'text-anchor': 'middle' }); tF2.textContent = 'personal copy (GitHub)';
		gFork.appendChild(tF1); gFork.appendChild(tF2);
		svg.appendChild(gFork);

		var gLocal = s('g', { id: 'pr-local' });
		gLocal.appendChild(s('rect', { 'class': 'd-box', x: 110, y: 132, width: 400, height: 76, rx: 6 }));
		var tL1 = s('text', { 'class': 'd-title', x: 310, y: 154, 'text-anchor': 'middle' }); tL1.textContent = 'Your local clone';
		var tL2 = s('text', { 'class': 'd-muted', x: 310, y: 172, 'text-anchor': 'middle' }); tL2.textContent = 'local computer (Git workspace)';
		gLocal.appendChild(tL1); gLocal.appendChild(tL2);
		svg.appendChild(gLocal);

		var bBranch = s('g', { id: 'badge-branch' });
		bBranch.appendChild(s('rect', { 'class': 'd-box', x: 150, y: 178, width: 140, height: 22, rx: 3 }));
		var tB = s('text', { 'class': 'd-muted', x: 220, y: 194, 'text-anchor': 'middle' }); tB.textContent = 'edit branch';
		bBranch.appendChild(tB);
		svg.appendChild(bBranch);

		var bCommit = s('g', { id: 'badge-commit' });
		bCommit.appendChild(s('rect', { 'class': 'd-box', x: 330, y: 178, width: 140, height: 22, rx: 3 }));
		var tC = s('text', { 'class': 'd-muted', x: 400, y: 194, 'text-anchor': 'middle' }); tC.textContent = 'commits';
		bCommit.appendChild(tC);
		svg.appendChild(bCommit);

		var aFork = s('line', { 'class': 'd-line', x1: 225, y1: 44, x2: 393, y2: 44, 'marker-end': 'url(#arrow-pr)' });
		var lFork = s('text', { 'class': 'd-muted', x: 310, y: 38, 'text-anchor': 'middle' }); lFork.textContent = 'fork';

		var aClone = s('path', { 'class': 'd-line', d: 'M 465,90 C 465,115 440,120 420,130', fill: 'none', 'marker-end': 'url(#arrow-pr)' });
		var lClone = s('text', { 'class': 'd-muted', x: 485, y: 115, 'text-anchor': 'middle' }); lClone.textContent = 'clone';

		var aBranch = s('line', { 'class': 'd-line', x1: 290, y1: 189, x2: 328, y2: 189, 'marker-end': 'url(#arrow-pr)' });

		var aPush = s('path', { 'class': 'd-line', d: 'M 470,132 C 500,120 535,115 535,92', fill: 'none', 'marker-end': 'url(#arrow-pr)' });
		var lPush = s('text', { 'class': 'd-muted', x: 550, y: 115, 'text-anchor': 'middle' }); lPush.textContent = 'push';

		var aPR = s('line', { 'class': 'd-line', x1: 395, y1: 74, x2: 227, y2: 74, 'marker-end': 'url(#arrow-pr)' });
		var lPR = s('text', { 'class': 'd-muted', x: 310, y: 88, 'text-anchor': 'middle' }); lPR.textContent = 'pull request';

		var bReview = s('g', { id: 'badge-review' });
		bReview.appendChild(s('rect', { 'class': 'd-box', x: 30, y: 62, width: 85, height: 22, rx: 3 }));
		var tRev = s('text', { 'class': 'd-muted', x: 72, y: 77, 'text-anchor': 'middle' }); tRev.textContent = 'review';
		bReview.appendChild(tRev);

		var bMerge = s('g', { id: 'badge-merge' });
		bMerge.appendChild(s('rect', { 'class': 'd-box', x: 125, y: 62, width: 85, height: 22, rx: 3 }));
		var tMrg = s('text', { 'class': 'd-muted', x: 167, y: 77, 'text-anchor': 'middle' }); tMrg.textContent = 'merge';
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
		modbus: initModbus
	};

	function boot() {
		Array.prototype.forEach.call(document.querySelectorAll('[data-widget]'), function (el) {
			var fn = INIT[el.getAttribute('data-widget')];
			if (fn) { try { fn(el); } catch (e) { /* keep the static fallback */ } }
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
