# Step 19: draft Chapter 8 (Industrial Networks) lessons 8.1 to 8.6

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md`, `plans/ch8-industrial-networks.md` and `docs/agentic-workflow.md` first.

Inputs:
- `research_notes/ch8/facts.md`: the ONLY facts you may use. Each line: lesson | fact | source URL | evidence words.
- `docs/handoff/step-18-sources.md`: each source URL with its publisher and cached text file (in the cache folder given in your prompt). Use the cached file for a page's title and for the exact wording of a fact.
- `research_notes/ch8/lab/fake_ur_server.py` and `research_notes/ch8/lab/client.py`: lab code Claude has run and tested with pymodbus 3.16.1.
- Template: `robotics-7-6.html`. Copy its whole structure (head tags, canonical/og/twitter tags, color-scheme, skip link, navbar, drawer, breadcrumbs, `data-build-date`, Contents box, numbered section headings `01.`, `02.` ..., `<pre class="article-code"><code>` blocks, References list with `references-note` paragraph, footer nav, HTML5 UP footer credit, scripts). Replace only the lesson-specific text, ids and URLs.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read, file write and file edit tools. Do not browse the web.
- Create ONLY the file(s) of your task. Do NOT edit any existing file. Do NOT commit.
- Every factual statement (number, name, standard, how a protocol works, a typical value) must come from a fact in `facts.md` and carry its citation `<sup><a href="#ref-N">[N]</a></sup>`. Do not add facts from memory. Teaching explanations that only connect cited facts are fine.
- Numbers: copy them exactly as the fact states them (value and unit). Never round, convert or combine numbers.
- References: one `<li id="ref-N">` per source URL, numbered by first citation in the text (1, 2, 3 ...). Entry format: `Publisher, &ldquo;Page title.&rdquo; <a href="URL" target="_blank" rel="noopener noreferrer">short-url</a>.` Take the title from the cached file's main heading; never invent one.
- Audience: first-year students and career changers. Short sentences, define each term when it first appears, one idea per paragraph.
- Link back instead of repeating: 1.7 (`robotics-1-7.html`: cell PLC, handshake signals, safety signals kept separate), 2.5 (`robotics-2-5.html`: controller and tool I/O), 4.4 (`robotics-4-4.html`: cell safety), 5.7 (`robotics-5-7.html`: IEC 61131-3 SFC, PackML), 3.6 (`robotics-3-6.html`: writing a ROS 2 package). Only name a lesson for something that lesson really teaches.
- Length: about 1,500 to 2,100 words of lesson text, 5 to 8 sections plus References. End with a "Check your understanding" section of 3 questions answered in the lesson (plain list, no answers shown).
- Use `<code>` for function names, register addresses, filters and commands. Keep the Wikipedia-style look of the template; no new CSS or scripts.

Rules from the Chapter 7 review (each was a real problem there):
- Never state the same fact twice, even in different words, to add a citation.
- No sentence starting "For example," unless it gives a concrete example.
- No filler intensifiers: fundamental, critical, crucial, severe, profound, dramatically, completely, seamless, robust.
- Do not promise in a heading or summary more than the section teaches.

## Lab content
- 8.3 lab: "Talk to a Modbus server from Python". Explain that a real UR controller is a Modbus TCP server on port 502 with general-purpose registers 128 to 255 (cite facts). Because no hardware is assumed, students run `fake_ur_server.py`, a stand-in server on port 5020 with holding registers 0 to 255, then `client.py`. Include both files exactly as given (keep their comments), the install command `pip install pymodbus==3.16.1`, and the run steps (start the server in one terminal, run the client in a second). Expected output: `Registers 128-130: [1, 250, 7]`. Then a short exercise: write to register 256, which the stand-in server rejects with exception code 2 (ILLEGAL DATA ADDRESS); pymodbus shows it as an `ExceptionResponse` with `function_code=131` (0x03 + 0x80) and `exception_code=2`. Mention the simulator includes Modbus client functionality (cite) only as a further idea, not as a required step.
- 8.6 lab: "Watch Modbus on the wire". Capture the 8.3 lab traffic in Wireshark: on Linux capture on the loopback interface; on Windows choose the Npcap adapter for loopback traffic capture (cite). Because port 5020 is not the Modbus port, use Analyze → Decode As to decode TCP port 5020 as Modbus/TCP (cite). Display filters: `mbtcp` and `modbus.func_code == 16` (field names from the facts). Students find the write-multiple request and the response, and the transaction identifier pairing them (cite the MBAP facts).

## Tasks (run in parallel, one file each)
- T-19a: `robotics-8-1.html` "8.1 From Wires to Networks"
- T-19b: `robotics-8-2.html` "8.2 Industrial Ethernet Protocols"
- T-19c: `robotics-8-3.html` "8.3 Lab: Connecting a Robot to a PLC"
- T-19d: `robotics-8-4.html` "8.4 Safety over the Network"
- T-19e: `robotics-8-5.html` "8.5 From the Plant Floor to IT"
- T-19f: `robotics-8-6.html` "8.6 Network Design, Security and Diagnostics"
- T-19g: chapter page `robotics-networks.html` (copy `robotics-vision.html`: overview, place in the course, article list with one-line summaries, quiz link, feedback) and `research_notes/ch8/data.json` in the same format as `research_notes/ch7/data.json` (chapter 8, title "Industrial Networks", url `robotics-networks.html`, nav "Networks", icon `fa-network-wired`, 6 lessons with minutes, 4 objectives and 5 to 7 key terms each that appear in that lesson's facts, glossary definitions for every key term written only from facts.md, 12 quiz questions, 2 per lesson, each answerable from one fact). Read the six lesson topics from the plan, not from the drafts (they are being written at the same time).

Breadcrumb for all: Course Home / Chapter 8 · Networks, linking `robotics-networks.html`.

Finish with a summary of at most 5 lines: file written, sections, references, any fact you wanted but could not find. Do not paste file contents.
