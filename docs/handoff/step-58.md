# Step 58: glossary critic pass (report only)

Branch: `writing-polish-3`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not browse the web. Do NOT commit. Do NOT edit any page, script or data file. The prompt gives you a part number K and a line range of `assets/js/glossary-data.js`. Write ONLY `docs/handoff/step-58-findings-K.json`.

Read the WHOLE file `assets/js/glossary-data.js` once (you need all terms to judge cross-references), then judge only the entries in your line range. Each entry is `"term": "definition"`. A newcomer (first-year student or hobbyist, often reading in a second language) sees the definition in a tooltip, with no other context. Report the entries that fail that reader. Most entries are fine. Report nothing for them.

Kinds:
- `circular`: the definition explains the term with the term itself or a word built from it, and says nothing more.
- `jargon`: the definition depends on a hard technical word that is neither explained in the sentence nor a term in this glossary. Name the word in `note`.
- `not-a-definition`: the text never says what kind of thing the term is (it starts mid-thought, or is a fact about the thing).
- `inconsistent-pair`: two entries for the same or nearly the same thing (for example a spelled-out term and its acronym, or two spellings) whose definitions disagree or do not point at each other. Put the other term in `note`.
- `grammar`: a broken sentence, a missing word, a dangling clause, a semicolon joining two sentences, an em dash.
- `hard-sentence`: a sentence a second-language reader must read twice: three or more nouns stacked with no "of/for/in" between them, or two ideas forced into one clause.
- `thin`: the definition is true but tells the newcomer nothing usable (no purpose, no example, no "used for").

Rules:
- `fix`: give a corrected definition ONLY when it needs no new fact: reordering, splitting into sentences, replacing a word with a plainer one, or pointing to the other entry ("See also X"). There is no maximum length, and a fix may never be shorter than the original minus five words. Keep every name, number, acronym, example and qualifier. If the entry needs a fact you would have to supply yourself (`thin`, most `jargon`), set `fix` to null and say in `note` what is missing. Do not write facts from memory.
- Entries about safety, hazards, standards or law: report `grammar` and `inconsistent-pair` only, with `fix` null.
- At most 40 findings. Keep the most certain. Do not invent problems.

Output: a JSON list `[{"term": "...", "kind": "...", "fix": "..." or null, "note": "under 20 words"}, ...]` and nothing else in the file.

Finish with one line: entries read and findings per kind. Do not claim you verified anything.
