# Step 53: proofreading audit (report only)

Branch: `nav-a11y-plain-language`. Read `CLAUDE.md` first. You cannot run shell commands. Do not browse the web. Do NOT commit. Do NOT edit any lesson page, script or data file. The prompt gives you a part number K and a list of chapters. Write ONLY `docs/handoff/step-53-findings-K.json`.

`docs/handoff/step-53-text/<lesson>.txt` holds each lesson as plain text (for example `4-4.txt`). Read every lesson of your chapters from start to the References heading and report real errors a careful copy editor would fix. Many paragraphs were reworded yesterday by splitting long sentences, so look hard for damage from that.

Report only these kinds:
- `typo`: misspelling, doubled word ("the the"), missing or doubled space or punctuation, wrong capital.
- `grammar`: subject-verb disagreement, sentence fragment, missing word, wrong article, broken parallel list.
- `broken-split`: a sentence that no longer makes sense alone, a pronoun ("It", "This", "They") whose referent is now unclear, or three or more sentences in a row starting with the same word.
- `inconsistent-term`: the same thing written two ways inside ONE lesson (e.g. "teach pendant" and "teach-pendant", "ROS2" and "ROS 2", "set-up" and "setup" as nouns).
- `contradiction`: two statements in the same lesson that cannot both be true (different numbers for the same quantity, a step order that disagrees with its example).
- `leftover`: placeholder text, TODO, stray markup characters, an unfinished sentence.

Do NOT report: style preferences, long sentences, word choice, British versus American spelling, anything inside code blocks or commands, anything in the References list, citation numbers, or factual claims you merely doubt (you cannot check sources).

Rules:
- `quote` must be copied character for character from the text file, 4 to 20 words, enough to find the place. Never paraphrase a quote. Do not include the line-number prefix.
- `fix` is the corrected wording of that same quote and nothing else. A fix may not add facts, numbers or names.
- Lessons 1-7 and 5-1 to 5-5 are safety and legal text, and 3-1 to 3-4 are the author's own prose: report only `typo` and `grammar` there, and keep the fix minimal.
- At most 10 findings per lesson; keep the most certain ones. If a lesson is clean, report nothing for it. Zero findings for a lesson is a normal result. Do not invent problems.

Output: a JSON list `[{"lesson": "4-4", "kind": "typo", "quote": "...", "fix": "...", "note": "why, under 15 words"}, ...]` and nothing else in the file.

Finish with one line: lessons read and findings per kind. Do not claim you verified anything.
