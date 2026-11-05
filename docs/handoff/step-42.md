# Step 42: plain-language glossary definitions (data only)

Branch: `main`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit `glossary-data.js` or any lesson. Write ONLY `docs/handoff/step-42-definitions.json`.

`docs/handoff/step-42-terms.json` lists 91 glossary definitions that are hard for a newcomer, each with the lessons that use the term. For each term, read how those lessons explain it, then write a new definition.

Rules:
- One or two plain sentences, at most 35 words. Say what the thing is or does first, in everyday words; add one concrete detail the lessons give if it helps.
- Keep every fact true to the lessons: do not add numbers, names, standards or properties the lessons do not state. You may drop details (port numbers, chip internals) that a newcomer does not need, but keep any number the lessons treat as essential.
- Use the lessons' own words for technical terms. Explain a technical word in passing if the definition needs it.
- No "utilize", "facilitate", "leverage", "paradigm", "mathematical model", "deterministic" unless the lesson uses that word and the definition cannot do without it.
- Safety terms: keep the meaning exact; if a term is about safety functions or standards, copy the lesson's wording closely rather than simplifying.

Output: a JSON object `{"<term exactly as in the list>": "<new definition>", ...}` with all 91 terms and nothing else.

Finish with one line: how many definitions you wrote. Do not claim you verified anything.
