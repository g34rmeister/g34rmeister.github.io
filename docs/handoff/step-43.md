# Step 43: plain-language key points (data only)

Branch: `main`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit `course-data.js` or any lesson. Write ONLY `docs/handoff/step-43-rewrites.json`.

`docs/handoff/step-43-points.json` lists 78 "Key points" (each with its lesson id and index) that read stiffly. For each one, read the lesson and rewrite the point.

Rules:
- One sentence, at most 22 words, in everyday words a newcomer understands on first read. Active voice. Short words over long ones.
- Same meaning as the original and as the lesson. Do not add facts, numbers, names or claims; you may drop a detail if the sentence is clearer without it. Keep technical names the lesson relies on (e.g. RMW_IMPLEMENTATION, ISA/IEC 62443), but explain them in passing if needed.
- Avoid: utilize, facilitate, leverage, optimize, robust, deterministic, paradigm, comprehensive, mechanism, methodology, infrastructure, implementation (unless the lesson's term is exactly that word and the point cannot do without it).
- Points about safety, legal liability or standards: keep the meaning exact and stay close to the lesson's wording; plainer words only where that cannot change the meaning.

Output: a JSON list `[{"lesson": "8-6", "index": 0, "point": "new sentence"}, ...]` with all 78 entries, in the same order, and nothing else.

Finish with one line: how many points you rewrote. Do not claim you verified anything.
