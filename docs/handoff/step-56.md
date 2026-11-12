# Step 56: proofreading and clarity audit of the non-lesson pages (report only)

Branch: `writing-polish-3`. Read `CLAUDE.md` first. You cannot run shell commands. Do not browse the web. Do NOT commit. Do NOT edit any page, script or data file. The prompt gives you a part number K and a list of pages. Write ONLY `docs/handoff/step-56-findings-K.json`.

`docs/handoff/step-56-text/<page>.txt` holds each page as plain text, one block per line (for example `robotics-method.txt` for `robotics-method.html`). Menus were removed. Read every page on your list from start to end and report what a careful copy editor would fix.

Report only these kinds:
- `typo`: misspelling, doubled word ("the the"), missing or doubled space or punctuation, wrong capital.
- `grammar`: subject-verb disagreement, sentence fragment used as a sentence, missing word, wrong article, broken parallel list.
- `inconsistent-term`: the same thing written two ways on ONE page ("open source" as a noun versus "open-source" as a noun, "ROS2" and "ROS 2", "set-up" and "setup" as nouns).
- `contradiction`: two statements on the same page, or a statement and a count on the same page, that cannot both be true.
- `stale`: text that describes the site in a way the same page or `CLAUDE.md` shows is out of date (an old site name, a wrong number of chapters, a chapter described with the wrong number).
- `leftover`: placeholder or template text (lorem ipsum, "Untitled", "TODO"), stray markup characters, an unfinished sentence.
- `unclear` (course pages only, see the list in your prompt): one sentence a newcomer would have to read twice, because it is over 35 words, stacks three or more nouns, or uses a term the page never explains. At most 5 per page, the worst ones only.

Do NOT report: style preferences, word choice that is merely formal, British versus American spelling inside quotes or names, anything inside code or commands, reference lists, or facts you merely doubt (you cannot check sources).

Rules:
- `quote` must be copied character for character from the text file, 4 to 25 words, enough to find the place. Never paraphrase a quote.
- `fix` is the corrected wording of that same quote and nothing else. A fix may not add facts, numbers, names or claims, and may not drop any.
- Pages marked "author's own prose" in your prompt are the site owner's personal writing: report only `typo`, `grammar`, `stale` and `leftover` there, and keep every fix minimal. Never rewrite the author's voice.
- At most 12 findings per page; keep the most certain ones. Zero findings for a page is a normal result. Do not invent problems.

Output: a JSON list `[{"page": "robotics-method.html", "kind": "typo", "quote": "...", "fix": "...", "note": "why, under 15 words"}, ...]` and nothing else in the file.

Finish with one line: pages read and findings per kind. Do not claim you verified anything.
