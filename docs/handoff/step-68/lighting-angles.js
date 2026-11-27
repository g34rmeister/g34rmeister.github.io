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
