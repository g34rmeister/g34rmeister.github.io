# Step 30: more quiz questions (Ch7-9), two widgets, phone-sized labels

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do only the part named in your prompt and edit only the files that part names.

## Part A: quiz questions for chapters 7, 8 and 9 (`assets/js/course-data.js` only)

Chapters 7, 8 and 9 have 12 questions each (2 per lesson); other chapters have 3-4 per lesson. Add 2 new questions per lesson for 7-1..7-6, 8-1..8-6 and 9-1..9-6 (36 in total), appended to the end of each chapter's list in `quizzes`, in the exact existing format:
`{"lesson": "7-1", "question": "...", "choices": ["...","...","...","..."], "answer": N, "explanation": "..."}`

Rules:
- Read each lesson first. Every question, correct answer and explanation must come from that lesson's own text; the explanation restates the lesson's sentence closely. Do not use outside knowledge.
- Ask about ideas the lesson explains, not trivia (no reference numbers, no exact page wording games). Do not repeat an existing question.
- Four choices; wrong choices must be clearly wrong according to the lesson, not merely less precise. Vary the position of the correct answer (`answer` is 0-based).
- Do NOT write questions about safety content: lockout/tagout, energy isolation, protective or emergency stops and unlocking, safety networks (PROFIsafe, CIP Safety, FSoE, black channel), safety ratings (SIL, PL). For 8-4 and 9-2, ask about the non-safety parts of the lesson only; if there are none, add questions to another lesson of the same chapter instead and say so.
- Change `version: '2026-10h'` to `version: '2026-10i'`.
- Keep the file valid JavaScript: commas between objects, no trailing comma after the last item if the existing list has none.

## Part B: two widgets and bigger labels (`assets/js/widgets.js`, `robotics-4-2.html`, `robotics-7-5.html`, every `robotics-*.html` that loads widgets.js)

Copy the style of the existing step 27/28 widgets exactly (ES5, helpers `h s frame button slider plotFrame pts`, `d-*` classes, `widget-*` classes, no libraries, no new CSS). Each widget shows ONLY what its lesson says.

1. `qos` in `robotics-4-2.html`, placed after the paragraph or table in section 05 ("The QoS compatibility rule") that gives the compatibility results. Choose the publisher's offered Reliability (Reliable / Best Effort) and Durability (Transient Local / Volatile) and the subscription's requested ones; show "Connected" or "No connection (incompatible QoS)" and which policy breaks it, using exactly the compatibility tables in the lesson. Only the policies and values in those tables. Use toggle buttons with `aria-pressed`.
2. `nyquist` in `robotics-7-5.html`, section 02, after the figure about the Nyquist limit. ONLY if the lesson gives a relation between pixel size (or pixel count and field of view) and the finest resolvable detail: sliders for those inputs and a readout of the result, using the lesson's own relation and units. If the lesson gives no such relation, do not build this widget and say so.
3. Phone-sized labels: `initPrflow` and `initRosgraph` use 620-wide viewBoxes, so labels are about 5 px tall on a 320 px phone. Re-lay each one out vertically in a viewBox no wider than 400, with the same content, behaviour and keyboard handling. Do not change their text.

Placeholders: `<div data-widget="NAME"><p class="widget-note">The ... needs JavaScript. With it on, you can ...</p></div>` between paragraphs inside `.robotics-article-body`; balanced tags. `robotics-4-2.html` and `robotics-7-5.html` do not load widgets.js: add `<script src="assets/js/widgets.js?v=1.4" defer></script>` as in `robotics-6-3.html`, and bump every `widgets.js?v=1.3` to `?v=1.4`. Add the new names to `INIT` and the header comment.

## Finish

At most 8 lines: what you added per lesson, anything skipped and why. Do not claim you tested or verified anything.
