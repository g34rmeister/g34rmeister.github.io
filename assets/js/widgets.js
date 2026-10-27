/*
	robOSStics: interactive widgets
	Any element with data-widget="pwm" | "encoder" | "pid" | "arm" | "blocks" |
	"odometry" | "fsm" | "kalman" is turned into a small simulator. Plain JS and inline SVG, no libraries. Without JS the
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

	/* ---------- State machine: the line follower from lesson 5.7 ---------- */

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

	/* ---------- Kalman filter: the 1D hallway robot from lesson 5.8 ---------- */

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

	var INIT = { pwm: initPwm, encoder: initEncoder, pid: initPid, arm: initArm, blocks: initBlocks, odometry: initOdometry, fsm: initFsm, kalman: initKalman };

	function boot() {
		Array.prototype.forEach.call(document.querySelectorAll('[data-widget]'), function (el) {
			var fn = INIT[el.getAttribute('data-widget')];
			if (fn) { try { fn(el); } catch (e) { /* keep the static fallback */ } }
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
