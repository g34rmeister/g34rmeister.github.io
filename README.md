# Gerald Lê — Personal Portfolio & Projects

Personal developer portfolio hosted on GitHub Pages. Built with semantic HTML5, modern CSS variables, and vanilla JavaScript.

🔗 **Live Site:** [https://g34rmeister.github.io](https://g34rmeister.github.io)

## 🛠️ Tech Stack
* **Markup & Styling:** HTML5, CSS3 (JetBrains Mono, Custom Variables, Flexbox/Grid)
* **Scripts:** Vanilla JS (zero-dependency, no jQuery)
* **Icons:** Font Awesome 5 (self-hosted)
* **Fonts:** JetBrains Mono (self-hosted WOFF2: vietnamese, latin-ext, latin)
* **Deployment:** GitHub Pages

## 📁 Repository Structure
* `index.html` - Homepage
* `about.html` - Biography & technical skills
* `affiliations.html` - Academic & work experience
* `portfolio.html` - Software & automation projects
* `project-sample.html` - Sample project case study template
* `resume.html` - Interactive CV viewer (self-hosted PDF)
* `contact.html` - Direct contact channels
* `robotics.html` - RISE Bot Instructor course hub (honors research project)
* `robotics-intro.html` / `robotics-programming.html` / `robotics-ros.html` / `robotics-ethics.html` / `robotics-control.html` - Chapter overview pages (Intro to Robotics, Robot Programming, ROS, Ethics, and an extra Electronics and Control chapter)
* `robotics-<chapter>-<n>.html` - Chapter articles (6, 4, 5, 3 and 8 per chapter); unwritten topics are marked "(This is blank)"
* `robotics-glossary.html` - Glossary of every key term, rendered from `assets/js/glossary-data.js`
* `robotics-method.html` - How This Course Was Made: sources policy, where AI tools helped draft lessons, and the review steps. Every lesson's References heading links to it
* `robotics-quiz.html` - Chapter quizzes (`robotics-quiz.html?chapter=N`), rendered from the course data
* `assets/js/course-data.js` - The course as data: chapters, lessons, learning objectives, key terms and quiz questions. Update it whenever a lesson is added, renamed or rewritten
* `assets/js/glossary-data.js` - One-sentence definitions for every key term in the course data; add one whenever a lesson adds a key term
* `assets/js/widgets.js` - The simulators, mounted on any `<div data-widget="...">`: `pwm` (5.2), `encoder` (5.3), `pid` (5.4), `arm` (two-link arm with MoveJ vs MoveL, 1.6), `blocks` (blocks to RAPID and URScript, 2.1), `odometry` (UMBmark square, 5.6), `fsm` (5.7; wraps the static state diagram inside the mount) and `kalman` (5.8). Pages that use one load `widgets.js`
* `assets/js/learning.js` - Lesson objectives, "mark as complete" progress (stored in the browser), hub progress marks, quizzes, and the `window.RISEBot` hook for the phase 2 AI tutor
* `404.html` - Custom not-found page
* `robots.txt` / `sitemap.xml` / `site.webmanifest` - SEO & crawler metadata
* `assets/` - CSS, JS, fonts, webfonts
* `images/` - WebP imagery & brand logo
* `assets/resume/` - Self-hosted resume PDF
* `scripts/export_standalone_thesis.ps1` - Exports the thesis hub (`robotics*.html` + assets) into a self-contained `dist-thesis/` folder (gitignored build output, safe to delete and regenerate)

## 🧭 SEO, Accessibility & Maintenance Notes
* Page `<head>` blocks share one convention: standardized `<title>`, canonical URL, Open Graph / Twitter Card tags, `theme-color`, and `color-scheme`. Keep them in sync when adding pages, and add the new URL to `sitemap.xml`.
* Footers use `<span data-build-date>` for the "last updated" stamp. `assets/js/main.js` and `assets/js/robotics.js` auto-refresh it from `document.lastModified` at runtime — edit the span text only as a no-JS fallback.
* Every page has exactly one `<h1>` (hero/banner headline). Subpage banners use `<h1>` styled like the old `<h2>` — do not demote them.
* The portfolio filter bar uses `role="group"` with `aria-pressed` on each button (managed by `initPortfolioFilters` in `assets/js/main.js`). Preserve those attributes when editing filters.

## 🤖 Phase 2: plugging in an AI tutor
The course is ready for an interactive tutor without changing the lesson pages:
* `window.RISEBot.getLessonContext()` returns the current chapter and lesson, its objectives and key terms, the lesson's plain text, and the learner's progress. That is the context to send to the model.
* `window.RISEBot.registerTutor((slot, context) => { ... })` shows the empty `#rise-tutor-slot` panel on lesson pages and hands it to the tutor to render its chat UI.
* `document` fires `rise:ready`, `rise:lesson-complete` and `rise:quiz-submitted` (with each answer and the lesson it tests), so a tutor can react, for example by offering help on the lessons behind wrong answers.
* `window.RISEBot.course` is the whole course from `assets/js/course-data.js`.

A GitHub Pages site cannot hold an API key, so the tutor's model calls need a small backend or proxy; the page only talks to that.

## 📄 License
This template is based on [TXT by HTML5 UP](https://html5up.net) and licensed under [Creative Commons Attribution 3.0 (CCA 3.0)](LICENSE.txt).