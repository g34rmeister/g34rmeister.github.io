/*
	RISE Bot Instructor: learning features
	Reads window.RISE_COURSE (assets/js/course-data.js) and adds:
	  - "In this lesson" objectives at the top of each lesson
	  - "Mark as complete" progress, shown again on the hub and chapter pages
	  - chapter quizzes on robotics-quiz.html?chapter=N
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
			var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
			if (data && typeof data === 'object') {
				data.completed = data.completed || {};
				data.quizzes = data.quizzes || {};
				return data;
			}
		} catch (e) { /* storage blocked or corrupt: start fresh */ }
		return { completed: {}, quizzes: {} };
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
		if (!Object.keys(p.completed).length) return null;
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

	function initLesson(id) {
		var lesson = getLesson(id);
		var chapter = chapterOfLesson(id);
		var body = document.querySelector('.robotics-article-body');
		if (!lesson || !body) return;

		document.body.setAttribute('data-lesson-id', id);
		addReadingTime(body, lesson.minutes);

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

		if (footerNav) {
			body.insertBefore(panel, footerNav);
			body.insertBefore(slot, footerNav);
		} else {
			body.appendChild(panel);
			body.appendChild(slot);
		}
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
		var actions = document.querySelector('.thesis-masthead-actions');
		var next = nextLesson();
		if (actions && next) {
			actions.insertBefore(el('a', {
				'class': 'btn-read-case course-resume',
				href: lessonUrl(next.id),
				html: '<i class="fas fa-forward" aria-hidden="true"></i> Continue: ' + next.id.replace('-', '.') + ' ' + next.title
			}), actions.firstChild);
			var start = actions.querySelector('a[href="robotics-intro.html"]');
			if (start) start.className = 'btn-secondary-gh';
		}
		course.chapters.forEach(function (ch) {
			var kicker = document.querySelector('#chapter-' + ch.id + '-header .hltv-chapter-kicker');
			if (!kicker) return;
			var cp = chapterProgress(ch);
			if (cp.done || loadProgress().quizzes[ch.id]) {
				kicker.appendChild(el('span', {
					'class': 'chapter-progress-pill',
					text: cp.done + '/' + cp.total + ' done' + quizScoreText(ch.id)
				}));
			}
		});
	}

	function initChapter(chId) {
		markLessonLinks();
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

	function initQuiz() {
		var root = document.getElementById('rise-quiz');
		if (!root) return;
		var params = new URLSearchParams(location.search);
		var ch = getChapter(params.get('chapter'));
		var questions = ch && course.quizzes[ch.id] && course.quizzes[ch.id].slice();
		// Ask questions in lesson order, keeping the data file's order within a lesson
		if (questions) questions = questions
			.map(function (q, i) { return { q: q, i: i }; })
			.sort(function (a, b) { return a.q.lesson.localeCompare(b.q.lesson) || a.i - b.i; })
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
		document.title = 'Chapter ' + ch.id + ' Quiz — RISE Bot Instructor';

		root.innerHTML = '';
		var form = el('form', { 'class': 'quiz-form', novalidate: '' });
		root.appendChild(el('p', {
			text: questions.length + ' questions on ' + ch.title.replace(/^Extra: /, '') + '. Pick one answer for each, then check your answers.'
		}));

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
			fs.appendChild(el('div', { 'class': 'quiz-feedback', 'aria-live': 'polite', hidden: '' }));
			form.appendChild(fs);
		});

		var result = el('p', { 'class': 'quiz-result', 'aria-live': 'polite' });
		var submit = el('button', { type: 'submit', 'class': 'btn-read-case', html: '<i class="fas fa-check-double" aria-hidden="true"></i> Check answers' });
		var reset = el('button', { type: 'button', 'class': 'btn-copy-bibtex', html: '<i class="fas fa-redo" aria-hidden="true"></i> Try again', hidden: '' });
		form.appendChild(el('div', { 'class': 'quiz-actions' }, [submit, reset]));
		form.appendChild(result);
		root.appendChild(form);

		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var score = 0;
			var answers = [];
			questions.forEach(function (q, qi) {
				var fs = form.querySelector('fieldset[data-index="' + qi + '"]');
				var picked = form.querySelector('input[name="q' + qi + '"]:checked');
				var choice = picked ? Number(picked.value) : null;
				var right = choice === q.answer;
				if (right) score++;
				answers.push({ lesson: q.lesson, question: q.question, picked: choice, correct: right });
				fs.classList.remove('is-right', 'is-wrong');
				fs.classList.add(right ? 'is-right' : 'is-wrong');
				var fb = fs.querySelector('.quiz-feedback');
				fb.hidden = false;
				fb.innerHTML = '';
				fb.appendChild(el('strong', { text: right ? 'Correct. ' : (choice === null ? 'Not answered. ' : 'Not quite. ') }));
				fb.appendChild(document.createTextNode(
					(right ? '' : 'The answer is "' + q.choices[q.answer] + '". ') + q.explanation + ' '
				));
				fb.appendChild(el('a', { href: lessonUrl(q.lesson), text: 'Review lesson ' + q.lesson.replace('-', '.') }));
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

			result.textContent = 'You scored ' + score + ' out of ' + questions.length + '.' +
				(score === questions.length ? ' Every answer is right.' : ' Review the lessons linked above and try again.');
			submit.hidden = true;
			reset.hidden = false;
			emit('rise:quiz-submitted', { chapterId: ch.id, score: score, total: questions.length, answers: answers });
		});

		reset.addEventListener('click', function () {
			form.reset();
			Array.prototype.forEach.call(form.querySelectorAll('.quiz-question'), function (fs) {
				fs.classList.remove('is-right', 'is-wrong');
				fs.querySelector('.quiz-feedback').hidden = true;
			});
			result.textContent = '';
			submit.hidden = false;
			reset.hidden = true;
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

	/* ---------- Boot ---------- */

	function boot() {
		var page = currentPage();
		if (page.type === 'lesson') initLesson(page.id);
		else if (page.type === 'hub') initHub();
		else if (page.type === 'chapter') initChapter(page.id);
		else if (page.type === 'quiz') initQuiz();
		else if (page.type === 'glossary') initGlossary();
		if (tutorRenderer) window.RISEBot.registerTutor(tutorRenderer);
		emit('rise:ready', { page: page });
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
