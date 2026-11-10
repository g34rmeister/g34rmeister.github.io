# Step 47: plain-language rewrites of hard paragraphs (data only)

Branch: `nav-a11y-plain-language`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit any lesson page, script or data file.

You are given ONE part number K (1 to 4) in the prompt. Read `docs/handoff/step-47-candidates-K.json` and write ONLY `docs/handoff/step-47-rewrites-K.json`.

Each candidate is one paragraph or list item from a lesson: `{"id": "4-5#3", "lesson": "4-5", "why": {"longest_sentence": 38, "stiff": [...]}, "html": "..."}`. `why` says what a script flagged: a sentence of 30 or more words, or stiff words. The reader is a newcomer to robotics (first-year student or hobbyist), often reading in a second language.

For each candidate, rewrite the `html` so it is easier to read on first pass:
- Split sentences longer than about 25 words into two or three. One idea per sentence. No sentence over 30 words.
- Everyday words over formal ones (use, help, so, before, about). Active voice. Address the reader as "you" where the lesson already does.
- Replace the flagged stiff words unless the word is the lesson's own technical term.
- Keep it about the same length. Do not pad, do not add an introduction or a summary sentence.

Hard rules (a script checks these and throws away any rewrite that breaks one):
- Same meaning. Add NO facts, numbers, names, examples, causes or claims. Remove none. If you are not sure a plainer word means the same thing, keep the original word.
- Copy every HTML tag exactly: every `<sup><a href="#ref-N">[N]</a></sup>` citation (each citation stays attached to the same statement it followed), every `<code>...</code>` with identical contents, every `<a ...>` with identical attributes and identical link text, every `<strong>`, `<em>`, `<span ...>`.
- Keep every number, unit, acronym, product name, CamelCase name and HTML entity (`&ldquo;`, `&rsquo;`, `&nbsp;` ...) exactly.
- Keep everything inside quotation marks word for word (these are quotes from sources).
- Keep technical terms the lesson teaches (they are the glossary terms); do not swap them for synonyms.
- No em dashes. No new words about safety, law or standards.
- If a paragraph is already clear, or you cannot make it clearer without changing its meaning, leave it out of the output.

Output: a JSON list `[{"id": "4-5#3", "html": "rewritten inner html"}, ...]` with only the paragraphs you changed, in the same order, and nothing else in the file. The `html` value replaces the candidate's `html` exactly, so write valid JSON (escape `"` and `\`).

Known past mistakes to avoid: inventing facts (ports, laws, byte sizes), moving a citation to a different sentence, changing text inside `<code>`, dropping `&nbsp;`.

Finish with one line: how many paragraphs you rewrote and how many you left alone. Do not claim you verified anything.
