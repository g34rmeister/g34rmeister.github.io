/*
	RISE Bot Instructor: interactive widgets
	Any element with data-widget="pwm" | "encoder" | "pid" is turned into a
	small simulator. Plain JS and inline SVG, no libraries. Without JS the
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

	var INIT = { pwm: initPwm, encoder: initEncoder, pid: initPid };

	function boot() {
		Array.prototype.forEach.call(document.querySelectorAll('[data-widget]'), function (el) {
			var fn = INIT[el.getAttribute('data-widget')];
			if (fn) { try { fn(el); } catch (e) { /* keep the static fallback */ } }
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
