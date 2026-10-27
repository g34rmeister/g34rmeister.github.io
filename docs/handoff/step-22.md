# Step 22: draft Chapter 9 (Maintenance and Troubleshooting) lessons 9.1 to 9.6

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md`, `plans/ch9-maintenance-troubleshooting.md` and `docs/agentic-workflow.md` first.

Inputs:
- `research_notes/ch9/facts.md`: the ONLY facts you may use. Each line: lesson | fact | source URL | evidence words.
- `docs/handoff/step-21-sources.md`: each source URL with its publisher and cached text file (in the cache folder given in your prompt). Use the cached file for a page's title and for the exact wording of a fact.
- `research_notes/ch9/lab/fake_dashboard_server.py`, `health_check.py` and `recover.py`: lab code Claude has run and tested (Python 3 standard library only).
- Template: `robotics-8-3.html`. Copy its whole structure (head tags, canonical/og/twitter tags, color-scheme, skip link, navbar, drawer, breadcrumbs, `data-build-date`, Contents box, numbered section headings `01.`, `02.` ..., `<pre class="article-code"><code>` blocks, References list with `references-note` paragraph, footer nav, HTML5 UP footer credit, scripts). Replace only the lesson-specific text, ids and URLs.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read, file write and file edit tools. Do not browse the web.
- Create ONLY the file(s) of your task. Do NOT edit any existing file. Do NOT commit.
- Every factual statement (number, name, standard, how a protocol works, a typical value) must come from a fact in `facts.md` and carry its citation `<sup><a href="#ref-N">[N]</a></sup>`. Do not add facts from memory. Teaching explanations that only connect cited facts are fine.
- Numbers: copy them exactly as the fact states them (value and unit). Never round, convert or combine numbers.
- References: one `<li id="ref-N">` per source URL, numbered by first citation in the text (1, 2, 3 ...). Entry format: `Publisher, &ldquo;Page title.&rdquo; <a href="URL" target="_blank" rel="noopener noreferrer">short-url</a>.` Take the title from the cached file's main heading; never invent one.
- Audience: first-year students and career changers. Short sentences, define each term when it first appears, one idea per paragraph.
- Link back instead of repeating, using these EXACT titles and only for what each lesson teaches: 1.6 (`robotics-1-6.html`, "Robot Anatomy and Coordinate Frames": gearboxes, repeatability), 1.7 (`robotics-1-7.html`, "The Industrial Robot Cell"), 2.5 (`robotics-2-5.html`, "End-of-Arm Tooling and I/O"), 4.4 (`robotics-4-4.html`, "Making a Robot Cell Safe": risk assessment, stop categories), 8.1 (`robotics-8-1.html`, "From Wires to Networks": sinking and sourcing), 8.3 (`robotics-8-3.html`, "Lab: Connecting a Robot to a PLC"), 8.6 (`robotics-8-6.html`, "Network Design, Security and Diagnostics": Wireshark). Never write any other lesson title.
- Length: about 1,500 to 2,100 words of lesson text, 5 to 8 sections plus References. End with a "Check your understanding" section of 3 questions answered in the lesson (plain list, no answers shown).
- Use `<code>` for function names, register addresses, filters and commands. Keep the Wikipedia-style look of the template; no new CSS or scripts.

Rules from the Chapter 7 review (each was a real problem there):
- Never state the same fact twice, even in different words, to add a citation.
- No sentence starting "For example," unless it gives a concrete example.
- No filler intensifiers: fundamental, critical, crucial, severe, profound, dramatically, completely, seamless, robust.
- Do not promise in a heading or summary more than the section teaches.

## Lab content
- 9.6 lab: "Check a robot's state from Python". Explain the UR Dashboard Server (port 29999, commands end with a newline, replies as in the facts). Students run `fake_dashboard_server.py`, a stand-in that behaves like a robot that has just had a protective stop, then `health_check.py`, then `recover.py`. Include all three files exactly as given (keep their comments). Note that the server sends a one-line welcome message when a client connects, so the client reads one line first. Run steps: start the server in one terminal, run the scripts in a second. Expected output of `health_check.py`:
```
Welcome: Connected: Dashboard Server stand-in
Robotmode: RUNNING
Safetystatus: PROTECTIVE_STOP
Program state: STOPPED
Disconnected
```
Explain why the robot mode is RUNNING during a protective stop (powered on, brakes released; cite the stop recovery facts). For `recover.py`, show the expected output when run within 5 s of starting the server (the first unlock is refused with the documented message, the second succeeds) and stress the documented warning to inspect the cause before unlocking (link 9.2).
- No other lab code. Do not add code to lessons 9.1 to 9.5.

## Tasks (run in parallel, one file each)
- T-22a: `robotics-9-1.html` "9.1 Preventive Maintenance"
- T-22b: `robotics-9-2.html` "9.2 A Troubleshooting Method"
- T-22c: `robotics-9-3.html` "9.3 Mechanical Problems"
- T-22d: `robotics-9-4.html` "9.4 Electrical and I/O Faults"
- T-22e: `robotics-9-5.html` "9.5 Calibration, Backups and Recovery"
- T-22f: `robotics-9-6.html` "9.6 Lab: Check a Robot's State from Python"
- T-22g: chapter page `robotics-maintenance.html` (copy `robotics-networks.html`: overview, place in the course, article list with one-line summaries, quiz link, feedback) and `research_notes/ch9/data.json` in the same format as `research_notes/ch8/data.json` (chapter 9, title "Maintenance and Troubleshooting", url `robotics-maintenance.html`, nav "Maintenance", icon `fa-screwdriver-wrench`, 6 lessons with minutes, 4 objectives and 5 to 7 key terms each that appear in that lesson's facts, glossary definitions for every key term written only from facts.md, 12 quiz questions, 2 per lesson, each answerable from one fact). Read the six lesson topics from the plan, not from the drafts (they are being written at the same time).

Breadcrumb for all: Course Home / Chapter 9 · Maintenance, linking `robotics-maintenance.html`.

Finish with a summary of at most 5 lines: file written, sections, references, any fact you wanted but could not find. Do not paste file contents.

Note for T-22f (9.6): UR's Dashboard page is not consistent about the 5-second rule. The command table says `unlock protective stop` fails if less than 5 seconds have passed since the protective stop; a note above the table says the 5-second delay applies only to error 163 (TOO_FREQUENT_PROTECTIVE_STOPS). Say both, cite both facts, and tell students the stand-in follows the command table. Do not include anything about logging in to the controller as root.
