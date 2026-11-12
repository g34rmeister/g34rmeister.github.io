/*
	robOSStics: learning features
	Reads window.RISE_COURSE (assets/js/course-data.js) and adds:
	  - "In this lesson" objectives at the top of each lesson
	  - "Mark as complete" progress, shown again on the hub and chapter pages
	  - chapter quizzes on robotics-quiz.html?chapter=N, and the same questions
	    as "Check yourself" boxes at the end of each lesson (the questions live in
	    assets/js/quiz/ch<N>.js, loaded on demand by loadQuiz())
	  - a search box in the navbar and drawer on every course page
	  - a lesson search box on the hub
	  - reading time, key terms linked to the glossary, a "Continue" button on
	    the hub, and a plan box on each chapter page
	  - the glossary page (robotics-glossary.html, from assets/js/glossary-data.js)
	  - window.RISEBot, the hook a phase 2 AI tutor plugs into

	Progress lives in this browser only (localStorage). Every feature degrades
	to the plain article when storage or the course data is missing.
*/
(function () {
	'use strict';

	var course = window.RISE_COURSE;
	if (!course) return;

	var STORAGE_KEY = 'rise-progress-v1';
	var tutorRenderer = null;

	/* ---------- Course lookups ---------- */

	function allLessons() {
		var list = [];
		course.chapters.forEach(function (ch) {
			ch.lessons.forEach(function (l) { list.push(l); });
		});
		return list;
	}

	function getChapter(id) {
		id = Number(id);
		return course.chapters.filter(function (ch) { return ch.id === id; })[0] || null;
	}

	function getLesson(id) {
		return allLessons().filter(function (l) { return l.id === id; })[0] || null;
	}

	function chapterOfLesson(id) {
		return getChapter(String(id).split('-')[0]);
	}

	function lessonUrl(id) { return 'robotics-' + id + '.html'; }

	function currentPage() {
		var file = location.pathname.split('/').pop() || 'index.html';
		var m = file.match(/^robotics-(\d+-\d+)\.html$/);
		if (m && getLesson(m[1])) return { type: 'lesson', id: m[1] };
		if (file === 'robotics-quiz.html') return { type: 'quiz' };
		if (file === 'robotics-glossary.html') return { type: 'glossary' };
		if (file === 'robotics.html') return { type: 'hub' };
		var ch = course.chapters.filter(function (c) { return c.url === file; })[0];
		if (ch) return { type: 'chapter', id: ch.id };
		return { type: 'other' };
	}

	/* ---------- Progress storage ---------- */

	function loadProgress() {
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				var data = JSON.parse(raw);
				if (data && typeof data === 'object') {
					data.completed = data.completed || {};
					data.quizzes = data.quizzes || {};
					// Chapters 7-10 and lessons 4.6-4.9 exist only under the new numbering,
					// so progress that mentions them was saved after the renumber.
					var newStyle = Object.keys(data.completed).some(function (id) {
						return /^(7|8|9|10)-|^4-[6-9]$/.test(id);
					}) || Object.keys(data.quizzes).some(function (ch) { return Number(ch) >= 7; });
					if (newStyle && !data.migrated) { data.migrated = 2; saveProgress(data); }
					if (!data.migrated || Number(data.migrated) < 2) {
						// On 2026-10-27 chapters were renumbered:
						// old chapter 3 -> 4, old 4 -> 5, old 5 -> 6, old 6 -> 10.
						// Compute from copies so ids are not remapped twice.
						var chMap = { '3': '4', '4': '5', '5': '6', '6': '10' };
						var oldCompleted = data.completed;
						var newCompleted = {};
						Object.keys(oldCompleted).forEach(function (id) {
							var parts = id.split('-');
							var newCh = chMap[parts[0]] || parts[0];
							newCompleted[newCh + '-' + parts.slice(1).join('-')] = oldCompleted[id];
						});
						data.completed = newCompleted;

						var oldQuizzes = data.quizzes;
						var newQuizzes = {};
						Object.keys(oldQuizzes).forEach(function (ch) {
							var newCh = chMap[String(ch)] || ch;
							newQuizzes[newCh] = oldQuizzes[ch];
						});
						data.quizzes = newQuizzes;

						data.migrated = 2;
						saveProgress(data);
					}
					if (Number(data.migrated) < 3) {
						// On 2026-11-10 the capstones (old chapter 10) and mobile robots (old chapter 11) swapped numbers.
						var swap = { '10': '11', '11': '10' };
						var c3 = {}, q3 = {};
						Object.keys(data.completed).forEach(function (id) {
							var parts = id.split('-');
							c3[(swap[parts[0]] || parts[0]) + '-' + parts.slice(1).join('-')] = data.completed[id];
						});
						Object.keys(data.quizzes).forEach(function (ch) { q3[swap[String(ch)] || ch] = data.quizzes[ch]; });
						data.completed = c3;
						data.quizzes = q3;
						data.migrated = 3;
						saveProgress(data);
					}
					return data;
				}
			}
		} catch (e) { /* storage blocked or corrupt: start fresh */ }
		return { completed: {}, quizzes: {}, migrated: 3 };
	}

	function saveProgress(p) {
		try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
	}

	function isComplete(id) { return !!loadProgress().completed[id]; }

	function setComplete(id, done) {
		var p = loadProgress();
		if (done) p.completed[id] = new Date().toISOString();
		else delete p.completed[id];
		saveProgress(p);
		emit('rise:lesson-complete', { lessonId: id, complete: done });
	}

	function chapterProgress(ch) {
		var p = loadProgress();
		var done = ch.lessons.filter(function (l) { return p.completed[l.id]; }).length;
		return { done: done, total: ch.lessons.length };
	}

	function emit(name, detail) {
		try { document.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) { /* old browser */ }
	}

	var glossary = window.RISE_GLOSSARY || {};

	function termSlug(t) {
		return 'term-' + String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	function addReadingTime(body, minutes) {
		var meta = document.querySelector('.robotics-article-meta-bar');
		if (!meta) return;
		var words = body.textContent.split(/\s+/).filter(Boolean).length;
		var mins = minutes || Math.max(1, Math.round(words / 200));
		meta.appendChild(el('span', { 'class': 'article-meta-item reading-time', html: '<i class="far fa-clock" aria-hidden="true"></i> ' + mins + ' min read' }));
	}

	function nextLesson() {
		var p = loadProgress(), lessons = allLessons();
		for (var i = 0; i < lessons.length; i++) {
			if (!p.completed[lessons[i].id]) return lessons[i];
		}
		return null;
	}

	/* ---------- Small DOM helper ---------- */

	function el(tag, attrs, children) {
		var node = document.createElement(tag);
		Object.keys(attrs || {}).forEach(function (k) {
			if (k === 'text') node.textContent = attrs[k];
			else if (k === 'html') node.innerHTML = attrs[k];
			else node.setAttribute(k, attrs[k]);
		});
		(children || []).forEach(function (c) { if (c) node.appendChild(c); });
		return node;
	}

	/* ---------- Lesson pages ---------- */

	function initLesson(id, done) {
		var lesson = getLesson(id);
		var chapter = chapterOfLesson(id);
		var body = document.querySelector('.robotics-article-body');
		if (!lesson || !body) { done(); return; }

		document.body.setAttribute('data-lesson-id', id);
		addReadingTime(body, lesson.minutes);
		addCitationBacklinks(body);

		if (lesson.objectives && lesson.objectives.length) {
			var box = el('div', { 'class': 'article-callout learning-objectives', role: 'note' }, [
				el('div', { 'class': 'article-callout-header', html: '<i class="fas fa-bullseye" aria-hidden="true"></i> In this lesson you will' }),
				el('ul', {}, lesson.objectives.map(function (o) { return el('li', { text: o }); }))
			]);
			var terms = (lesson.keyTerms || []).filter(function (t) { return glossary[t]; });
			if (terms.length) {
				var tp = el('p', { 'class': 'lesson-key-terms' }, [el('strong', { text: 'Key terms: ' })]);
				terms.forEach(function (t, i) {
					if (i) tp.appendChild(document.createTextNode(', '));
					tp.appendChild(el('a', { href: 'robotics-glossary.html#' + termSlug(t), title: glossary[t], text: t }));
				});
				box.appendChild(tp);
			}
			body.insertBefore(box, body.firstChild);
		}

		// "Key points" summary after the self-check list, else just before the References heading (from course-data.js keyPoints).
		if (lesson.keyPoints && lesson.keyPoints.length) {
			var refsHeading = null;
			Array.prototype.forEach.call(body.querySelectorAll('h2'), function (h) {
				if (!refsHeading && /References\s*$/.test(h.textContent)) refsHeading = h;
			});
			var kp = el('div', { 'class': 'article-callout key-points', role: 'note' }, [
				el('div', { 'class': 'article-callout-header', html: '<i class="fas fa-clipboard-list" aria-hidden="true"></i> Key points' }),
				el('ul', {}, lesson.keyPoints.map(function (k) { return el('li', { text: k }); }))
			]);
			// Directly after the list under "Check your understanding" when that section exists.
			var checkList = null;
			Array.prototype.forEach.call(body.querySelectorAll('h2'), function (h) {
				if (checkList || !/Check your understanding\s*$/.test(h.textContent)) return;
				for (var sib = h.nextElementSibling; sib && sib.tagName !== 'H2'; sib = sib.nextElementSibling) {
					if (sib.tagName === 'OL' || sib.tagName === 'UL') { checkList = sib; break; }
				}
			});
			if (checkList) checkList.parentNode.insertBefore(kp, checkList.nextSibling);
			else if (refsHeading) body.insertBefore(kp, refsHeading);
		}

		var footerNav = body.querySelector('.article-footer-nav');
		var status = el('p', { 'class': 'lesson-complete-status', 'aria-live': 'polite' });
		var btn = el('button', { type: 'button', 'class': 'btn-copy-bibtex lesson-complete-btn' });
		var isLast = chapter.lessons[chapter.lessons.length - 1].id === id;

		function render() {
			var done = isComplete(id);
			btn.setAttribute('aria-pressed', done ? 'true' : 'false');
			btn.innerHTML = done
				? '<i class="fas fa-check" aria-hidden="true"></i> Completed'
				: '<i class="far fa-circle" aria-hidden="true"></i> Mark lesson as complete';
			var cp = chapterProgress(chapter);
			status.textContent = 'Chapter ' + chapter.id + ': ' + cp.done + ' of ' + cp.total + ' lessons complete.';
		}
		btn.addEventListener('click', function () {
			setComplete(id, !isComplete(id));
			render();
		});
		render();

		var panel = el('div', { 'class': 'lesson-complete-panel' }, [
			btn,
			status,
			el('a', {
				'class': 'lesson-quiz-link',
				href: 'robotics-quiz.html?chapter=' + chapter.id,
				html: '<i class="fas fa-question-circle" aria-hidden="true"></i> ' +
					(isLast ? 'Finished the chapter? Take the Chapter ' + chapter.id + ' quiz' : 'Chapter ' + chapter.id + ' quiz')
			})
		]);

		// Phase 2: the AI tutor mounts here. Hidden until a tutor registers.
		var slot = el('aside', {
			id: 'rise-tutor-slot',
			'class': 'rise-tutor-slot',
			'data-lesson-id': id,
			'aria-label': 'AI tutor',
			hidden: ''
		});

		addNextReadingTime();
		addLessonBottomBar(chapter);

		if (footerNav) {
			body.insertBefore(panel, footerNav);
			body.insertBefore(slot, footerNav);
		} else {
			body.appendChild(panel);
			body.appendChild(slot);
		}

		// The inline self-check needs this chapter's quiz file; the lesson reads fine without it if the file fails to load.
		loadQuiz(chapter.id, function () {
			var check = selfCheck(id);
			if (check) placeSelfCheck(body, check, panel);
			// Math first: auto-render only sees delimiters inside one text node, and the glossary splits text nodes.
			renderMath(body, function () { glossaryPopups(body, lesson); done(); });
		});
	}

	/* ---------- Lessons: LaTeX in the text (\( ... \) and \[ ... \]) is drawn by the vendored KaTeX ---------- */

	var KATEX_DIR = 'assets/vendor/katex/';

	// True when text outside <code>/<pre> holds a math delimiter, so pages without formulas load nothing.
	function hasMath(body) {
		var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false), n;
		while ((n = walker.nextNode())) {
			if (n.nodeValue.indexOf('\\(') === -1 && n.nodeValue.indexOf('\\[') === -1) continue;
			if (n.parentNode.closest && n.parentNode.closest('code,pre,script,style')) continue;
			return true;
		}
		return false;
	}

	function loadScript(src, done) {
		var s = document.createElement('script');
		s.src = src;
		s.onload = function () { done(true); };
		s.onerror = function () { done(false); };
		document.head.appendChild(s);
	}

	// A chapter's quiz questions are a separate file, injected as a script tag (works from file://). The query is the
	// course `version`, so bumping it in course-data.js refreshes cached question files. done(true) once
	// course.quizzes[chId] exists; done(false) if the file is missing or fails to load.
	function loadQuiz(chId, done) {
		course.quizzes = course.quizzes || {};
		if (course.quizzes[chId]) { done(true); return; }
		loadScript('assets/js/quiz/ch' + chId + '.js?v=' + encodeURIComponent(course.version || ''), function (ok) {
			done(!!(ok && course.quizzes[chId]));
		});
	}

	function renderMath(body, done) {
		if (!hasMath(body)) { done(); return; }
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = KATEX_DIR + 'katex.min.css';
		document.head.appendChild(link);
		loadScript(KATEX_DIR + 'katex.min.js', function (ok) {
			if (!ok) { done(); return; }
			loadScript(KATEX_DIR + 'contrib/auto-render.min.js', function (ok2) {
				if (ok2 && window.renderMathInElement) {
					window.renderMathInElement(body, {
						delimiters: [
							{ left: '\\[', right: '\\]', display: true },
							{ left: '\\(', right: '\\)', display: false }
						],
						throwOnError: false
					});
				}
				document.documentElement.setAttribute('data-math', ok2 ? 'ready' : 'failed');
				done();
			});
		});
	}

	/* ---------- Lessons: key terms at first use open a short definition ---------- */

	var GLOSSARY_SKIP = 'h1,h2,h3,h4,h5,h6,a,code,pre,kbd,figure,table,button,label,select,textarea,sup,svg,script,style,' +
		'.article-callout,.learning-objectives,.wp-toc,[data-widget],[id^="ref-"],.glossary-term,' +
		'.article-footer-nav,.lesson-complete-panel,.rise-tutor-slot,.katex';

	function escapeRegExp(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

	// Plain text nodes in normal paragraphs and list items, before the References heading.
	function glossaryTextNodes(body, stop) {
		var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
		var out = [], n;
		while ((n = walker.nextNode())) {
			var parent = n.parentNode;
			if (!n.nodeValue.trim() || !parent.closest) continue;
			if (stop && (stop.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING)) break;
			if (parent.closest(GLOSSARY_SKIP) || !parent.closest('p,li')) continue;
			out.push(n);
		}
		return out;
	}

	var glossaryPop = null, glossaryOpener = null;

	function closeGlossaryPop(returnFocus) {
		if (!glossaryPop) return;
		var opener = glossaryOpener;
		glossaryPop.hidden = true;
		glossaryOpener = null;
		if (opener) {
			opener.setAttribute('aria-expanded', 'false');
			if (returnFocus) opener.focus();
		}
	}

	function openGlossaryPop(opener) {
		var term = opener.getAttribute('data-term');
		if (!glossaryPop) {
			glossaryPop = el('div', { 'class': 'glossary-pop', role: 'dialog', tabindex: '-1', hidden: '' });
			document.body.appendChild(glossaryPop);
			glossaryPop.addEventListener('keydown', function (e) {
				if (e.key === 'Escape') { e.stopPropagation(); closeGlossaryPop(true); }
			});
			glossaryPop.addEventListener('focusout', function (e) {
				if (e.relatedTarget && !glossaryPop.contains(e.relatedTarget) && e.relatedTarget !== glossaryOpener) closeGlossaryPop(false);
			});
			document.addEventListener('click', function (e) {
				if (glossaryPop.hidden) return;
				if (glossaryPop.contains(e.target) || (e.target.closest && e.target.closest('.glossary-term'))) return;
				closeGlossaryPop(false);
			});
			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && !glossaryPop.hidden) closeGlossaryPop(true);
			});
		}
		closeGlossaryPop(false);
		glossaryPop.innerHTML = '';
		glossaryPop.setAttribute('aria-label', 'Definition of ' + term);
		glossaryPop.appendChild(el('strong', { text: term }));
		glossaryPop.appendChild(el('p', { text: glossary[term] }));
		glossaryPop.appendChild(el('a', { href: 'robotics-glossary.html#' + termSlug(term), text: 'Glossary' }));
		glossaryPop.hidden = false;
		var r = opener.getBoundingClientRect();
		var w = Math.min(320, document.documentElement.clientWidth - 16);
		glossaryPop.style.width = w + 'px';
		var left = Math.max(8, Math.min(r.left, document.documentElement.clientWidth - w - 8));
		var h = glossaryPop.offsetHeight;
		var top = r.bottom + 6;
		if (top + h > window.innerHeight - 8 && r.top - 6 - h > 8) top = r.top - 6 - h;
		glossaryPop.style.left = (left + window.pageXOffset) + 'px';
		glossaryPop.style.top = (top + window.pageYOffset) + 'px';
		glossaryOpener = opener;
		opener.setAttribute('aria-expanded', 'true');
		glossaryPop.focus();
	}

	function glossaryPopups(body, lesson) {
		if (!body.closest || !Element.prototype.closest) return;
		var refsHeading = null;
		Array.prototype.forEach.call(body.querySelectorAll('h2'), function (h) {
			if (!refsHeading && /References\s*$/.test(h.textContent)) refsHeading = h;
		});
		var terms = (lesson.keyTerms || []).filter(function (t) { return glossary[t]; })
			.sort(function (a, b) { return b.length - a.length; }); // longest first, so "force sensor" beats "sensor"
		terms.forEach(function (term) {
			var re = new RegExp('(^|[^A-Za-z0-9])(' + escapeRegExp(term) + '(?:e?s)?)(?![A-Za-z0-9])', 'i');  // whole word, plural allowed
			var nodes = glossaryTextNodes(body, refsHeading);
			for (var i = 0; i < nodes.length; i++) {
				var m = re.exec(nodes[i].nodeValue);
				if (!m) continue;
				var node = nodes[i], start = m.index + m[1].length;
				var tail = node.splitText(start);
				tail.splitText(m[2].length);
				var span = el('span', {
					'class': 'glossary-term', role: 'button', tabindex: '0', 'aria-expanded': 'false',
					'aria-haspopup': 'dialog', 'data-term': term, title: 'Definition'
				});
				span.appendChild(document.createTextNode(tail.nodeValue));
				tail.parentNode.replaceChild(span, tail);
				span.addEventListener('click', function (e) {
					var t = e.currentTarget;
					if (glossaryOpener === t) closeGlossaryPop(false); else openGlossaryPop(t);
				});
				span.addEventListener('keydown', function (e) {
					if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); }
				});
				break;
			}
		});
	}

	// Wikipedia-style "^" after each reference: one link back to every place the reference is cited.
	function addCitationBacklinks(body) {
		var uses = {};
		Array.prototype.forEach.call(body.querySelectorAll('sup > a[href^="#ref-"]'), function (a) {
			var n = a.getAttribute('href').slice(5), sup = a.parentNode;
			(uses[n] = uses[n] || []).push(sup);
			if (!sup.id) sup.id = 'cite-' + n + '-' + uses[n].length;
		});
		Object.keys(uses).forEach(function (n) {
			var li = document.getElementById('ref-' + n);
			if (!li || li.querySelector('.ref-backlinks')) return;
			var wrap = el('span', { 'class': 'ref-backlinks' });
			uses[n].forEach(function (sup, k) {
				wrap.appendChild(el('a', {
					href: '#' + sup.id,
					// The label starts with the visible number so speech-input users can say what they see (WCAG 2.5.3).
					'aria-label': (uses[n].length > 1 ? (k + 1) + ' of ' + uses[n].length + ': back' : 'Back') + ' to where reference ' + n + ' is cited',
					title: 'Back to the text',
					html: uses[n].length > 1 ? '&uarr;' + (k + 1) : '&uarr;'
				}));
			});
			li.appendChild(wrap);
		});
	}

	/* ---------- Lessons: "Check yourself" questions from the chapter quiz ---------- */

	// Goes just before the References heading, so the quiz comes before the source list; without one it stays before the complete panel.
	// The box arrives after the quiz file loads: keep a reader who is at or below the References where they were.
	function placeSelfCheck(body, check, panel) {
		var refs = null;
		Array.prototype.forEach.call(body.querySelectorAll('h2'), function (h) {
			if (!refs && /References\s*$/.test(h.textContent)) refs = h;
		});
		if (!refs) { body.insertBefore(check, panel); return; }
		var before = refs.getBoundingClientRect().top;
		body.insertBefore(check, refs);
		// A page opened at #ref-N or #references may still be scrolling smoothly to it, so aim at the target again
		// (instantly) instead of trusting a measured shift; otherwise keep the reader's place by the measured shift.
		var target = null;
		try { target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; } catch (e) { target = null; }
		var atOrAfterRefs = target && (target === refs || (refs.compareDocumentPosition(target) & 4));
		if (atOrAfterRefs && !placeSelfCheck.userScrolled) {
			target.scrollIntoView({ behavior: 'instant', block: 'start' });
		} else if (before < window.innerHeight) {
			var shift = refs.getBoundingClientRect().top - before;
			if (shift) window.scrollBy({ top: shift, behavior: 'instant' });
		}
		if (window.roboticsTocAdd) window.roboticsTocAdd(check, 'Check yourself', refs);
	}

	['wheel', 'touchmove', 'keydown'].forEach(function (ev) {
		window.addEventListener(ev, function () { placeSelfCheck.userScrolled = true; }, { passive: true, once: true });
	});

	function selfCheck(id) {
		var chapter = chapterOfLesson(id);
		var qs = ((chapter && course.quizzes[chapter.id]) || []).filter(function (q) { return q.lesson === id; });
		if (!qs.length) return null;
		var box = el('section', { 'class': 'article-callout self-check', id: 'check-yourself', 'aria-labelledby': 'check-yourself-title' }, [
			el('h2', { 'class': 'article-callout-header', id: 'check-yourself-title', html: '<i class="fas fa-clipboard-check" aria-hidden="true"></i> Check yourself' }),
			el('p', { text: 'Pick an answer to see if you got it. These questions also appear in the Chapter ' + chapter.id + ' quiz.' })
		]);
		qs.forEach(function (q, qi) {
			var name = 'sc' + qi;
			var fb = el('div', { 'class': 'quiz-feedback', 'aria-live': 'polite', hidden: '' });
			var fs = el('fieldset', { 'class': 'quiz-question' }, [el('legend', { text: (qi + 1) + '. ' + q.question })]);
			q.choices.forEach(function (c, ci) {
				var input = el('input', { type: 'radio', name: name, id: name + '-' + ci, value: String(ci) });
				input.addEventListener('change', function () {
					var right = ci === q.answer;
					fs.classList.remove('is-right', 'is-wrong');
					fs.classList.add(right ? 'is-right' : 'is-wrong');
					fb.hidden = false;
					fb.innerHTML = '';
					fb.appendChild(el('strong', { text: right ? 'Correct. ' : 'Not quite. ' }));
					fb.appendChild(document.createTextNode(right ? q.explanation : 'Have another look at the lesson and try again.'));
				});
				fs.appendChild(el('label', { 'class': 'quiz-choice', 'for': name + '-' + ci }, [input, el('span', { text: ' ' + c })]));
			});
			fs.appendChild(fb);
			box.appendChild(fs);
		});
		return box;
	}

	/* ---------- Search: one index for the hub box and the navbar ---------- */

	var searchIndex = null;

	// Lower case, punctuation to spaces (keeping "." so "4.4" works), so a word matches only at the start of a word:
	// "pid" finds "PID control" but not "rapid".
	function searchNorm(t) { return ' ' + String(t).toLowerCase().replace(/[^a-z0-9.]+/g, ' ') + ' '; }

	function buildSearchIndex() {
		if (searchIndex) return searchIndex;
		searchIndex = {
			lessons: allLessons().map(function (l) {
				var head = searchNorm([l.id.replace('-', '.'), l.title].join(' '));
				return { l: l, head: head, text: head + searchNorm([].concat(l.objectives || [], l.keyTerms || []).join(' ')) };
			}),
			terms: Object.keys(glossary).map(function (t) {
				return { term: t, name: searchNorm(t), text: searchNorm(t + ' ' + glossary[t]) };
			})
		};
		return searchIndex;
	}

	// Every word must appear; title (or term name) matches come first, then course order.
	function searchCourse(query) {
		var words = searchNorm(query).split(' ').filter(Boolean);
		var out = { lessons: [], terms: [] };
		if (!words.length) return out;
		var idx = buildSearchIndex();
		function has(text, w) { return text.indexOf(' ' + w) !== -1; }
		function rank(list, headKey) {
			var strong = [], weak = [];
			list.forEach(function (x) {
				if (!words.every(function (w) { return has(x.text, w); })) return;
				(words.every(function (w) { return has(x[headKey], w); }) ? strong : weak).push(x);
			});
			return strong.concat(weak);
		}
		out.lessons = rank(idx.lessons, 'head').map(function (x) { return x.l; });
		out.terms = rank(idx.terms, 'name').map(function (x) { return x.term; });
		return out;
	}

	function lessonLabel(l) { return l.id.replace('-', '.') + ' ' + l.title; }

	// Hub box ("Find a lesson"): lessons only, same matching as the navbar search.
	function initSearch() {
		var section = document.querySelector('#fleet-grid .hltv-feed-section-header');
		if (!section) return;
		var input = el('input', { type: 'search', id: 'lesson-search', 'class': 'lesson-search-input', placeholder: 'Search lessons and key terms, e.g. PID, MoveIt, safety', autocomplete: 'off' });
		var results = el('ol', { 'class': 'lesson-search-results', 'aria-live': 'polite' });
		var wrap = el('div', { 'class': 'lesson-search' }, [
			el('label', { 'for': 'lesson-search', 'class': 'lesson-search-label', html: '<i class="fas fa-search" aria-hidden="true"></i> Find a lesson' }),
			input, results
		]);
		section.appendChild(wrap);
		input.addEventListener('input', function () {
			results.innerHTML = '';
			if (!input.value.trim()) return;
			var hits = searchCourse(input.value).lessons;
			if (!hits.length) { results.appendChild(el('li', { text: 'No lessons match. Try a shorter word, or the glossary.' })); return; }
			hits.slice(0, 12).forEach(function (l) {
				results.appendChild(el('li', {}, [el('a', { href: lessonUrl(l.id), text: lessonLabel(l) })]));
			});
		});
	}

	/* ---------- Navbar and drawer search (markup generated by scripts/site_sync.py) ---------- */

	function initNavSearch() {
		var boxes = document.querySelectorAll('.nav-search');
		if (!boxes.length) return;
		var lastFocus = null;

		Array.prototype.forEach.call(boxes, function (box) {
			var input = box.querySelector('.nav-search-input');
			var list = box.querySelector('.nav-search-results');
			var status = box.querySelector('.nav-search-status');
			if (!input || !list) return;
			var options = [], active = -1, uid = input.id.replace('-input', '');
			box.hidden = false;

			function setActive(i) {
				if (options[active]) options[active].classList.remove('is-active');
				active = i;
				if (options[i]) {
					options[i].classList.add('is-active');
					input.setAttribute('aria-activedescendant', options[i].id);
					if (options[i].scrollIntoView && !list.hidden) options[i].scrollIntoView({ block: 'nearest' });
				} else {
					input.removeAttribute('aria-activedescendant');
				}
			}

			function close() {
				list.hidden = true;
				input.setAttribute('aria-expanded', 'false');
				setActive(-1);
			}

			function option(href, kind, label) {
				var a = el('a', { href: href, role: 'option', id: uid + '-opt-' + options.length, tabindex: '-1', 'aria-selected': 'false' }, [
					el('span', { 'class': 'nav-search-kind', text: kind }),
					el('span', { 'class': 'nav-search-label', text: label })
				]);
				options.push(a);
				a.insertBefore(document.createTextNode(' '), a.lastChild);
				list.appendChild(el('li', { role: 'presentation' }, [a]));
			}

			function render() {
				var q = input.value.trim();
				list.innerHTML = '';
				options = [];
				active = -1;
				input.removeAttribute('aria-activedescendant');
				if (!q) { close(); status.textContent = ''; return; }
				var hits = searchCourse(q);
				hits.lessons.slice(0, 6).forEach(function (l) { option(lessonUrl(l.id), 'Lesson', lessonLabel(l)); });
				hits.terms.slice(0, 4).forEach(function (t) { option('robotics-glossary.html#' + termSlug(t), 'Glossary', t); });
				if (!options.length) {
					list.appendChild(el('li', { role: 'presentation', 'class': 'nav-search-empty', text: 'No matches. Try a shorter word.' }));
					status.textContent = 'No results';
				} else {
					var total = hits.lessons.length + hits.terms.length;
					status.textContent = options.length + (options.length === 1 ? ' result' : ' results') +
						(total > options.length ? ' shown of ' + total : '') + '. Use the up and down arrow keys, then Enter.';
				}
				list.hidden = false;
				input.setAttribute('aria-expanded', 'true');
			}

			input.addEventListener('input', render);
			input.addEventListener('focus', function () { if (input.value.trim() && list.hidden) render(); });
			input.addEventListener('keydown', function (e) {
				if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
					if (list.hidden) render();
					if (!options.length) return;
					e.preventDefault();
					var n = options.length;
					setActive(e.key === 'ArrowDown' ? (active + 1) % n : (active - 1 + n) % n);
				} else if (e.key === 'Enter') {
					var pick = options[active] || options[0];
					if (pick && !list.hidden) { e.preventDefault(); window.location.href = pick.getAttribute('href'); }
				} else if (e.key === 'Escape') {
					e.preventDefault();
					close();
					// Back to the control the "/" shortcut came from; otherwise stay in the box, so focus is never dropped.
					if (lastFocus && document.contains(lastFocus) && lastFocus !== input) lastFocus.focus();
					lastFocus = null;
				}
			});
			// Keep focus in the input when a result is pressed; the link still opens on click.
			list.addEventListener('mousedown', function (e) { e.preventDefault(); });
			box.addEventListener('focusout', function (e) {
				if (!e.relatedTarget || !box.contains(e.relatedTarget)) close();
			});
			document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
			box._searchInput = input;
		});

		// "/" focuses the search (the drawer's, when the navbar row is replaced by the drawer button).
		document.addEventListener('keydown', function (e) {
			if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
			var t = e.target, tag = t && t.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
			var target = null;
			Array.prototype.forEach.call(boxes, function (box) {
				if (!target && box._searchInput && !box.classList.contains('nav-search-drawer') && box.offsetParent !== null) target = box._searchInput;
			});
			if (!target) {
				var toggle = document.getElementById('thesis-mobile-btn');
				if (toggle && toggle.offsetParent !== null) {
					toggle.click();
					Array.prototype.forEach.call(boxes, function (box) {
						if (box.classList.contains('nav-search-drawer')) target = box._searchInput;
					});
				}
			}
			if (!target) return;
			e.preventDefault();
			lastFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
			target.focus();
			target.select();
		});
	}

	/* ---------- Hub and chapter pages: progress marks ---------- */

	function markLessonLinks() {
		var p = loadProgress();
		var links = document.querySelectorAll('main a[href^="robotics-"]');
		Array.prototype.forEach.call(links, function (a) {
			if (a.closest('.article-footer-nav')) return;
			var m = (a.getAttribute('href') || '').match(/^robotics-(\d+-\d+)\.html$/);
			if (!m || !p.completed[m[1]] || a.querySelector('.lesson-done-mark')) return;
			a.classList.add('is-complete');
			var mark = el('span', { 'class': 'lesson-done-mark', title: 'Completed' }, [
				el('i', { 'class': 'fas fa-check', 'aria-hidden': 'true' }),
				el('span', { 'class': 'sr-only', text: ' (completed)' })
			]);
			var title = a.querySelector('.hltv-row-title') || a.querySelector('strong') || a;
			title.appendChild(mark);
		});
	}

	function quizScoreText(chId) {
		var q = loadProgress().quizzes[chId];
		return q ? ' · quiz best ' + q.best + '/' + q.total : '';
	}

	function initHub() {
		markLessonLinks();
		initSearch();
		// With progress, the one primary button becomes "Continue: <next lesson>"
		// (or a pointer to the capstones once every lesson is done).
		var start = document.querySelector('.thesis-masthead-actions a[href="robotics-intro.html"]');
		var started = Object.keys(loadProgress().completed).length > 0;
		if (start && started) {
			var next = nextLesson();
			start.classList.add('course-resume');
			if (next) {
				start.setAttribute('href', lessonUrl(next.id));
				start.innerHTML = '<i class="fas fa-forward" aria-hidden="true"></i> ';
				start.appendChild(document.createTextNode('Continue: ' + next.id.replace('-', '.') + ' ' + next.title));
				// Where that lesson sits, under the button: "Chapter 1 · 13 min · lesson 4 of 7".
				var nch = chapterOfLesson(next.id);
				if (nch) {
					var pos = nch.lessons.map(function (l) { return l.id; }).indexOf(next.id) + 1;
					start.parentNode.appendChild(el('p', {
						'class': 'hub-resume-meta',
						text: 'Chapter ' + nch.id + (next.minutes ? ' \u00b7 ' + next.minutes + ' min' : '') + ' \u00b7 lesson ' + pos + ' of ' + nch.lessons.length
					}));
				}
			} else {
				start.setAttribute('href', 'robotics-capstone.html');
				start.innerHTML = '<i class="fas fa-flag-checkered" aria-hidden="true"></i> ';
				start.appendChild(document.createTextNode('All lessons complete: try a capstone project'));
			}
		}
		// The "where to start" cards are for first-time visitors; a returning reader gets the Continue button instead.
		var startCards = document.querySelector('.hub-start');
		if (startCards && started) startCards.hidden = true;

		// Only the chapter in progress starts open (Chapter 1 for a new visitor), unless the link points into another one.
		var upNext = nextLesson();
		var openCh = upNext ? chapterOfLesson(upNext.id) : null;
		var hashEl = null;
		try { hashEl = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; } catch (e) { hashEl = null; }
		course.chapters.forEach(function (ch) {
			var header = document.getElementById('chapter-' + ch.id + '-header');
			var kicker = header && header.querySelector('.hltv-chapter-kicker');
			if (!kicker) return;
			var cp = chapterProgress(ch);
			kicker.appendChild(el('span', {
				'class': 'chapter-progress-pill',
				text: (cp.done ? cp.done + ' of ' + cp.total + ' done' : cp.total + ' lessons') + quizScoreText(ch.id)
			}));
			var block = header.closest('.hltv-chapter-block');
			if (!block || ch === openCh || (hashEl && block.contains(hashEl))) return;
			block.classList.add('is-collapsed');
			header.setAttribute('aria-expanded', 'false');
		});
	}

	/* ---------- Lesson and chapter pages: reading time on the Next card, and a bottom bar on small screens ---------- */

	function nextCard() {
		var cards = document.querySelectorAll('.article-footer-nav a.article-nav-card');
		return cards.length ? cards[cards.length - 1] : null;
	}

	function addNextReadingTime() {
		var card = nextCard();
		var m = card && (card.getAttribute('href') || '').match(/^robotics-(\d+-\d+)\.html$/);
		var lesson = m && getLesson(m[1]);
		var dir = card && card.querySelector('.article-nav-dir');
		if (lesson && lesson.minutes && dir && !dir.querySelector('.article-nav-time')) {
			dir.appendChild(el('span', { 'class': 'article-nav-time', text: ' \u00b7 ' + lesson.minutes + ' min' }));
		}
	}

	// Below 1200px there is no side contents panel: a fixed bar gives the chapter, the contents list and the next page.
	function addLessonBottomBar(chapter) {
		if (document.querySelector('.lesson-bottom-bar')) return;
		var card = nextCard();
		var bar = el('nav', { 'class': 'lesson-bottom-bar', 'aria-label': 'Lesson shortcuts' }, [
			el('a', { href: chapter.url, 'class': 'lesson-bottom-link', 'aria-label': 'Chapter ' + chapter.id + ' overview', html: '<span aria-hidden="true">&larr;</span> Ch. ' + chapter.id })
		]);
		// The contents list is built by robotics.js after this runs, so link to it and fall back to the top of the page.
		var toc = el('a', { href: '#contents', 'class': 'lesson-bottom-link', text: 'Contents' });
		toc.addEventListener('click', function (e) {
			var list = document.getElementById('contents');
			e.preventDefault();
			if (!list) { window.scrollTo(0, 0); return; }
			list.scrollIntoView({ block: 'start' });
			list.setAttribute('tabindex', '-1');
			list.focus({ preventScroll: true });
		});
		bar.appendChild(toc);
		if (card) {
			var target = card.querySelector('.article-nav-target');
			var label = (target ? target.textContent : card.textContent).replace(/\s+/g, ' ').trim();
			var next = el('a', { href: card.getAttribute('href'), 'class': 'lesson-bottom-next' }, [
				el('span', { 'class': 'lesson-bottom-next-label', text: 'Next: ' + label }),
				el('span', { 'aria-hidden': 'true', text: ' \u2192' })
			]);
			bar.appendChild(next);
		}
		document.body.appendChild(bar);
		document.body.classList.add('has-bottom-bar');
	}

	function initChapter(chId) {
		markLessonLinks();
		addNextReadingTime();
		var ch = getChapter(chId);
		var cbody = document.querySelector('.robotics-article-body');
		if (ch && cbody) {
			var mins = ch.lessons.reduce(function (sum, l) { return sum + (l.minutes || 0); }, 0);
			var items = [];
			if (mins) items.push(el('li', { text: 'Time: about ' + mins + ' minutes of reading, plus the Try it activities and the quiz.' }));
			if (ch.prerequisites) items.push(el('li', { text: 'Before you start: ' + ch.prerequisites }));
			if (ch.handsOn) items.push(el('li', { text: 'Hands-on: ' + ch.handsOn }));
			if (items.length) {
				cbody.insertBefore(el('div', { 'class': 'article-callout', role: 'note' }, [
					el('div', { 'class': 'article-callout-header', html: '<i class="fas fa-route" aria-hidden="true"></i> Plan for this chapter' }),
					el('ul', {}, items)
				]), cbody.firstChild);
			}
		}
		var meta = document.querySelector('.robotics-article-meta-bar');
		if (!ch || !meta) return;
		var cp = chapterProgress(ch);
		meta.appendChild(el('span', {
			'class': 'article-meta-item chapter-progress-pill',
			text: cp.done + ' of ' + cp.total + ' lessons complete' + quizScoreText(ch.id)
		}));
	}

	/* ---------- Quiz page ---------- */

	// Compare lesson ids like "6-2" and "6-10" by number, so 6.10 comes after 6.9
	function lessonOrder(a, b) {
		var x = a.split('-').map(Number), y = b.split('-').map(Number);
		return x[0] - y[0] || x[1] - y[1];
	}

	function initQuiz(done) {
		var root = document.getElementById('rise-quiz');
		if (!root) { done(); return; }
		var ch = getChapter(new URLSearchParams(location.search).get('chapter'));
		if (!ch) { renderQuiz(root, null); done(); return; }
		loadQuiz(ch.id, function (ok) {
			if (ok) renderQuiz(root, ch);
			else {
				var picker = document.getElementById('quiz-chapter-picker');
				if (picker) picker.hidden = false;
				root.replaceChildren(el('p', { 'class': 'quiz-load-error', role: 'alert', text: 'The quiz questions for Chapter ' + ch.id + ' could not be loaded. Check your connection, reload the page, or pick a chapter below.' }));
			}
			done();
		});
	}

	function renderQuiz(root, ch) {
		var questions = ch && course.quizzes[ch.id] && course.quizzes[ch.id].slice();
		// Ask questions in lesson order, keeping the data file's order within a lesson
		if (questions) questions = questions
			.map(function (q, i) { return { q: q, i: i }; })
			.sort(function (a, b) { return lessonOrder(a.q.lesson, b.q.lesson) || a.i - b.i; })
			.map(function (x) { return x.q; });
		var picker = document.getElementById('quiz-chapter-picker');

		if (!ch || !questions) {
			root.innerHTML = '';
			if (picker) picker.hidden = false;
			return;
		}
		if (picker) picker.hidden = true;

		var headline = document.querySelector('.robotics-article-headline');
		if (headline) headline.textContent = 'Chapter ' + ch.id + ' Quiz: ' + ch.title.replace(/^Extra: /, '');
		document.title = 'Chapter ' + ch.id + ' Quiz — robOSStics';

		root.innerHTML = '';
		var form = el('form', { 'class': 'quiz-form', novalidate: '' });
		root.appendChild(el('p', {
			text: questions.length + ' questions on ' + ch.title.replace(/^Extra: /, '') + '. Pick one answer for each; you see straight away whether it is right. With a keyboard, move between choices with the arrow keys and press Enter to check.'
		}));
		var progress = el('p', { 'class': 'quiz-progress', 'aria-live': 'polite', text: '0 of ' + questions.length + ' answered.' });

		var picks = questions.map(function () { return null; });

		questions.forEach(function (q, qi) {
			var name = 'q' + qi;
			var fs = el('fieldset', { 'class': 'quiz-question', 'data-index': qi });
			fs.appendChild(el('legend', { text: (qi + 1) + '. ' + q.question }));
			q.choices.forEach(function (c, ci) {
				var id = name + '-' + ci;
				fs.appendChild(el('label', { 'class': 'quiz-choice', 'for': id }, [
					el('input', { type: 'radio', name: name, id: id, value: String(ci) }),
					el('span', { text: ' ' + c })
				]));
			});
			fs.appendChild(el('div', { 'class': 'quiz-feedback', tabindex: '-1', hidden: '' }));
			form.appendChild(fs);
		});

		var result = el('p', { 'class': 'quiz-result', 'aria-live': 'polite' });
		var retry = el('button', { type: 'button', 'class': 'btn-read-case', html: '<i class="fas fa-redo" aria-hidden="true"></i> Retry missed questions', hidden: '' });
		var restart = el('button', { type: 'button', 'class': 'btn-copy-bibtex', html: '<i class="fas fa-undo" aria-hidden="true"></i> Start over', hidden: '' });
		form.appendChild(el('div', { 'class': 'quiz-actions' }, [retry, restart]));
		form.appendChild(result);
		root.appendChild(form);
		root.appendChild(progress); // after the form, so that sticky bottom keeps it in view while scrolling
		form.addEventListener('submit', function (e) { e.preventDefault(); });

		function questionBox(qi) { return form.querySelector('fieldset[data-index="' + qi + '"]'); }

		function tally() {
			var answered = 0, correct = 0;
			picks.forEach(function (p, i) {
				if (p === null) return;
				answered++;
				if (p === questions[i].answer) correct++;
			});
			return { answered: answered, correct: correct };
		}

		function clearQuestion(qi) {
			var fs = questionBox(qi);
			picks[qi] = null;
			fs.classList.remove('is-right', 'is-wrong');
			var fb = fs.querySelector('.quiz-feedback');
			fb.hidden = true;
			fb.innerHTML = '';
			Array.prototype.forEach.call(fs.querySelectorAll('input'), function (inp) {
				inp.checked = false;
				inp.disabled = false;
			});
		}

		function finish(t) {
			var score = t.correct;
			var answers = questions.map(function (q, i) {
				return { lesson: q.lesson, question: q.question, picked: picks[i], correct: picks[i] === q.answer };
			});
			var p = loadProgress();
			var prev = p.quizzes[ch.id];
			p.quizzes[ch.id] = {
				last: score,
				best: Math.max(score, prev ? prev.best : 0),
				total: questions.length,
				at: new Date().toISOString()
			};
			saveProgress(p);
			result.textContent = 'Final score: ' + score + ' out of ' + questions.length + '.' +
				(score === questions.length ? ' Every answer is right.' : ' Use the lesson links under the missed questions, or retry them.');
			retry.hidden = score === questions.length;
			restart.hidden = false;
			emit('rise:quiz-submitted', { chapterId: ch.id, score: score, total: questions.length, answers: answers });
		}

		function update(announce) {
			var t = tally();
			progress.textContent = (announce ? announce + ' ' : '') + t.answered + ' of ' + questions.length + ' answered, ' + t.correct + ' correct.';
			if (t.answered === questions.length) finish(t);
			else { result.textContent = ''; retry.hidden = true; restart.hidden = t.answered === 0; }
		}

		// Check one question. Called when a choice is clicked, or on Enter/Space after moving with the arrow keys.
		function commit(input) {
			var fs = input.closest('.quiz-question');
			var qi = Number(fs.getAttribute('data-index'));
			if (picks[qi] !== null) return;
			var q = questions[qi];
			var choice = Number(input.value);
			var right = choice === q.answer;
			picks[qi] = choice;
			Array.prototype.forEach.call(fs.querySelectorAll('input'), function (inp) { inp.disabled = true; });
			fs.classList.add(right ? 'is-right' : 'is-wrong');
			var fb = fs.querySelector('.quiz-feedback');
			fb.hidden = false;
			fb.innerHTML = '';
			fb.appendChild(el('strong', { text: right ? '✓ Correct. ' : '✗ Not quite. ' }));
			fb.appendChild(document.createTextNode(
				(right ? '' : 'The answer is "' + q.choices[q.answer] + '". ') + q.explanation + ' '
			));
			fb.appendChild(el('a', { href: lessonUrl(q.lesson), text: 'Review lesson ' + q.lesson.replace('-', '.') }));
			// Keep keyboard focus inside the question now that its radios are locked
			fb.focus({ preventScroll: true });
			update(); // the feedback box has focus, so a screen reader reads the result there
		}

		// Arrow keys move between the choices of a radio group and select as they go. That must not
		// count as an answer, or a keyboard user could never look through the choices first.
		var arrowNav = false;
		form.addEventListener('keydown', function (e) {
			var input = e.target;
			if (!input || input.type !== 'radio') return;
			arrowNav = e.key.indexOf('Arrow') === 0;
			if (e.key === 'Enter' || e.key === ' ') {
				var picked = input.closest('.quiz-question').querySelector('input:checked');
				if (picked && !picked.disabled) { e.preventDefault(); commit(picked); }
			}
		});
		form.addEventListener('pointerdown', function () { arrowNav = false; });
		form.addEventListener('click', function (e) {
			var input = e.target;
			if (!input || input.type !== 'radio' || input.disabled) return;
			if (arrowNav && e.detail === 0) return; // the click a browser fires for an arrow-key move
			commit(input);
		});

		retry.addEventListener('click', function () {
			var first = -1;
			picks.forEach(function (p, i) {
				if (p !== questions[i].answer) { clearQuestion(i); if (first < 0) first = i; }
			});
			update('Retrying the missed questions.');
			if (first >= 0) {
				var r = form.querySelector('input[name="q' + first + '"]');
				if (r) r.focus();
			}
		});

		restart.addEventListener('click', function () {
			questions.forEach(function (q, i) { clearQuestion(i); });
			update('Started over.');
			var r = form.querySelector('input[name="q0"]');
			if (r) r.focus();
		});
	}

	/* ---------- Glossary page ---------- */

	function initGlossary() {
		var root = document.getElementById('rise-glossary');
		if (!root) return;
		var terms = Object.keys(glossary).sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
		var where = {};
		allLessons().forEach(function (l) {
			(l.keyTerms || []).forEach(function (t) { (where[t] = where[t] || []).push(l); });
		});
		var filter = el('input', { type: 'search', 'class': 'glossary-filter', placeholder: 'Filter terms', 'aria-label': 'Filter glossary terms' });
		var dl = el('dl', { 'class': 'glossary-list' });
		var rows = terms.map(function (t) {
			var dt = el('dt', { id: termSlug(t), text: t });
			var dd = el('dd', {}, [document.createTextNode(glossary[t] + ' ')]);
			(where[t] || []).forEach(function (l, i) {
				dd.appendChild(document.createTextNode(i ? ', ' : 'See '));
				dd.appendChild(el('a', { href: lessonUrl(l.id), text: 'lesson ' + l.id.replace('-', '.') }));
			});
			if ((where[t] || []).length) dd.appendChild(document.createTextNode('.'));
			dl.appendChild(dt); dl.appendChild(dd);
			return { term: t.toLowerCase() + ' ' + glossary[t].toLowerCase(), dt: dt, dd: dd };
		});
		filter.addEventListener('input', function () {
			var q = filter.value.trim().toLowerCase();
			rows.forEach(function (r) {
				var show = !q || r.term.indexOf(q) !== -1;
				r.dt.hidden = !show; r.dd.hidden = !show;
			});
		});
		root.replaceChildren(el('p', { text: terms.length + ' terms used in the course. Each one links to the lessons that use it.' }), filter, dl);
		if (location.hash) {
			var target = document.getElementById(location.hash.slice(1));
			if (target) target.scrollIntoView();
		}
	}

	/* ---------- Phase 2 hook: window.RISEBot ---------- */

	function lessonText() {
		var body = document.querySelector('.robotics-article-body');
		if (!body) return '';
		var copy = body.cloneNode(true);
		Array.prototype.forEach.call(
			copy.querySelectorAll('.article-footer-nav, .lesson-complete-panel, .rise-tutor-slot, .learning-objectives, .wp-toc, script'),
			function (n) { n.remove(); }
		);
		return copy.textContent.replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
	}

	function getLessonContext() {
		var page = currentPage();
		var lesson = page.type === 'lesson' ? getLesson(page.id) : null;
		var chapter = lesson ? chapterOfLesson(page.id)
			: page.type === 'chapter' ? getChapter(page.id) : null;
		return {
			course: { id: course.id, title: course.title },
			page: page.type,
			chapter: chapter ? { id: chapter.id, title: chapter.title } : null,
			lesson: lesson ? {
				id: lesson.id,
				title: lesson.title,
				objectives: lesson.objectives.slice(),
				keyTerms: (lesson.keyTerms || []).slice(),
				url: lessonUrl(lesson.id)
			} : null,
			text: lesson ? lessonText() : '',
			progress: loadProgress()
		};
	}

	window.RISEBot = {
		course: course,
		getChapter: getChapter,
		getLesson: getLesson,
		getLessonContext: getLessonContext,
		getProgress: loadProgress,
		/*
			A tutor calls registerTutor(function (slot, context) { ... }).
			On lesson pages the slot (#rise-tutor-slot) is shown and handed to it
			with the lesson context. Listen for 'rise:lesson-complete' and
			'rise:quiz-submitted' on document to react to the learner.
		*/
		registerTutor: function (render) {
			tutorRenderer = render;
			var slot = document.getElementById('rise-tutor-slot');
			if (slot && typeof render === 'function') {
				slot.hidden = false;
				render(slot, getLessonContext());
			}
		}
	};

	/* ---------- "Suggest an edit" link in the meta bar ---------- */

	var REPO_EDIT = 'https://github.com/g34rmeister/g34rmeister.github.io/edit/main/';

	function addEditLink(page) {
		var meta = document.querySelector('.robotics-article-meta-bar');
		if (!meta || meta.querySelector('.edit-link')) return;
		var file = (location.pathname.split('/').pop() || 'robotics.html').replace(/\.html?$/, '') + '.html';
		// Glossary definitions and quiz questions live in data files, not in the page.
		if (page.type === 'glossary') file = 'assets/js/glossary-data.js';
		else if (page.type === 'quiz') {
			var qc = new URLSearchParams(location.search).get('chapter');
			file = /^\d+$/.test(qc || '') ? 'assets/js/quiz/ch' + qc + '.js' : 'assets/js/quiz/';
		}
		var a = el('a', {
			href: REPO_EDIT + file, target: '_blank', rel: 'noopener noreferrer',
			title: 'Opens this page in GitHub’s editor (free account needed). Lesson 3.4 walks through it.',
			html: '<i class="fas fa-pen" aria-hidden="true"></i> Suggest an edit'
		});
		meta.appendChild(el('span', { 'class': 'article-meta-item edit-link' }, [a]));
	}

	/* ---------- Print: "Show answer" blocks print open ---------- */

	var openedForPrint = [];
	window.addEventListener('beforeprint', function () {
		Array.prototype.forEach.call(document.querySelectorAll('details.check-answer:not([open])'), function (d) {
			d.setAttribute('open', '');
			openedForPrint.push(d);
		});
	});
	window.addEventListener('afterprint', function () {
		openedForPrint.forEach(function (d) { d.removeAttribute('open'); });
		openedForPrint = [];
	});

	/* ---------- Boot ---------- */

	function boot() {
		var page = currentPage();
		function ready() {
			if (tutorRenderer) window.RISEBot.registerTutor(tutorRenderer);
			emit('rise:ready', { page: page });
		}
		addEditLink(page);
		initNavSearch();
		if (page.type === 'lesson') { initLesson(page.id, ready); return; }
		if (page.type === 'quiz') { initQuiz(ready); return; }
		if (page.type === 'hub') initHub();
		else if (page.type === 'chapter') initChapter(page.id);
		else if (page.type === 'glossary') initGlossary();
		ready();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
