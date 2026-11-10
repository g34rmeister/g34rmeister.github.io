# Step 52: plain-language quiz wording (data only)

Branch: `nav-a11y-plain-language`. Read `CLAUDE.md` first. You cannot run shell commands. Do not browse the web. Do NOT commit. Do NOT edit any quiz file, lesson page or script. Write ONLY `docs/handoff/step-52-rewrites.json`.

`docs/handoff/step-52-candidates.json` lists quiz questions and explanations flagged as long (over 32 words) or stiff. Each entry: `{"id", "lesson", "field": "question"|"explanation", "question", "choices", "answer": "<text of the correct choice>", "text": "<the string to rewrite>"}`. The quizzes are optional self-checks for newcomers.

Rewrite `text` so a newcomer understands it on first read:
- Everyday words, active voice, no sentence over 28 words; an explanation may be two short sentences.
- A question must still ask exactly the same thing, so the same choice stays the only correct answer and the wrong choices stay wrong. Do not add a hint that gives the answer away, and do not remove a detail the choices depend on.
- An explanation must give the same reason. Add no facts.
- Keep every number, unit, acronym, command, product and standard name, and every technical term exactly.
- Questions about safety, law or standards: keep the meaning exact; change only words that cannot alter it.
- No em dashes. If the text is already clear, leave it out.

Output: a JSON list `[{"id": "...", "text": "new string"}, ...]` with only the entries you changed, and nothing else.

Finish with one line: how many you rewrote and how many you left alone. Do not claim you verified anything.
