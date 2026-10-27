# Step 14: draft Chapter 7 (Machine Vision) lessons 7.1 to 7.6

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md`, `plans/ch7-machine-vision.md` and `docs/agentic-workflow.md` first.

Inputs:
- `research_notes/ch7/facts.md`: the ONLY facts you may use. Each line: lesson | fact | source URL | evidence words.
- `docs/handoff/step-14-sources.md`: each source URL with its page title and cached text file (in the cache folder given in your prompt). Use the cached file if you need the exact wording of a fact.
- Template: `robotics-2-8.html`. Copy its whole structure (head tags, canonical/og/twitter tags, color-scheme, skip link, navbar, drawer, breadcrumbs, `data-build-date`, Contents box, numbered section headings `01.`, `02.` ..., References list with `references-note` paragraph, footer nav, HTML5 UP footer credit, scripts). Replace only the lesson-specific text, ids and URLs.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read, file write and file edit tools.
- Create ONLY the lesson files of your task. Do NOT edit any existing file (course data, glossary, manifest, other lessons, navbars). Do NOT commit.
- Every factual statement (number, name, standard, how a device works, a typical value) must come from a fact in `facts.md` for that lesson (or another Chapter 7 lesson) and carry its citation `<sup><a href="#ref-N">[N]</a></sup>`. Do not add facts from memory. Teaching explanations that only connect cited facts are fine.
- Numbers: copy them exactly as the fact states them (value and unit). Never round, convert or combine numbers.
- References: one `<li id="ref-N">` per source URL, numbered by first citation in the text (1, 2, 3 ...). Entry format: `Publisher, &ldquo;Page title.&rdquo; <a href="URL" target="_blank" rel="noopener noreferrer">short-url</a>.` Take the page title from `step-14-sources.md`. If that title is clearly not a title (code, a cookie banner), open the cached file and use the page's main heading; never invent one.
- Audience: first-year students and career changers. Short sentences, define each term when it first appears, one idea per paragraph. Link back to lesson 2.8 (`robotics-2-8.html`) where it already covers a topic (camera placement, calibration) instead of repeating it.
- Length: about 1,600 to 2,200 words of lesson text, 5 to 8 sections plus References. Each lesson ends with a short "Check your understanding" section of 3 questions answered in the lesson (plain list, no answers shown).
- Use `<code>` for function names, message types and commands. Keep the Wikipedia-style look of the template; no new CSS or scripts.
- File names, titles and h1: `robotics-7-1.html` "7.1 Industrial Cameras and Optics", `robotics-7-2.html` "7.2 Lighting for Machine Vision", `robotics-7-3.html` "7.3 Image Processing Basics", `robotics-7-4.html` "7.4 3D Sensing", `robotics-7-5.html` "7.5 Inspection and Measurement", `robotics-7-6.html` "7.6 Lab: A ROS 2 Camera Pipeline". Breadcrumb: Course Home / Chapter 7 · Vision, linking `robotics-vision.html`.

## Tasks (run in parallel)
- T-14a: write `robotics-7-1.html` and `robotics-7-2.html`
- T-14b: write `robotics-7-3.html` and `robotics-7-4.html`
- T-14c: write `robotics-7-5.html` and `robotics-7-6.html`

Finish with a summary of at most 6 lines: files written, sections per lesson, number of references, any fact you wanted but could not find in `facts.md`. Do not paste file contents.
