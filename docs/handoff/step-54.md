# Step 54: plain-language glossary definitions (data only)

Branch: `writing-polish-3`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit `glossary-data.js`, any page, data file or script. The prompt gives you a part number K. Read `docs/handoff/step-54-candidates-K.json` and write ONLY `docs/handoff/step-54-rewrites-K.json`.

Each candidate is one glossary definition that a script flagged as long (over 22 words) or stiff: `{"id": "g:absolute encoder", "term": "absolute encoder", "lessons": ["6-3"], "words": 24, "stiff": [...], "text": "..."}`. The definition appears on the glossary page and as a tooltip in the lessons listed in `lessons`. Before rewriting, open `robotics-<lesson>.html` for the first listed lesson and search for the term, so your wording agrees with how the lesson explains it. The lesson is the only source of facts you may use, and only to choose words, not to add content.

Rewrite each `text` for a newcomer (first-year student or hobbyist, often reading in a second language):
- One sentence of at most 24 words, or two short sentences if one would be cramped. Start with what the thing is ("A sensor that ...", "The ROS 2 tool that ..."), never with the term itself.
- Everyday words: "gives" not "provides"; "lets" not "enables" or "allows for"; "through" or "with" not "via"; "use" not "utilize/employ/leverage"; "keeps" not "retains"; "about" not "approximately"; "works out" or "finds" not "determines"; "run" or "do" not "perform"; "makes sure" not "ensures".
- Keep every technical name, command, file name, message type, standard number, product name, acronym, symbol and number exactly as written (ROS 2, rclpy, geometry_msgs, PWM, 20 Hz to 20 kHz, Ku ...). Keep text inside parentheses that gives an expansion or a unit.
- Same meaning and same scope. Add no facts, numbers, names, examples or claims. Do not drop a property the original states: if the original says what the thing is, what it does and why it matters, the rewrite says all three in simpler words. Shorten by removing filler words, not content.
- Keep hedges and attributions exactly ("can", "usually", "about", "often", "typically", "X defines").
- Do not replace a technical term with a loose synonym (pose -> position, repeatability -> accuracy, topic -> channel, node -> program, torque -> force).
- No em dashes, no semicolons, no "you", no filler, American spelling.
- If a definition is already clear and flagged only for a harmless word, leave it out. Leaving entries out is a normal, wanted result; do not rewrite for the sake of it.

Output: a JSON list `[{"id": "g:absolute encoder", "text": "new definition"}, ...]` with only the entries you changed, same order, nothing else in the file.

Known past mistakes to avoid (found in earlier rounds of this project): inventing facts, adding a causal claim ("so", "because") the original did not make, changing a number or unit, dropping a hedge, dropping one item from a list to meet the word limit, replacing a technical term with a loose synonym.

Finish with one line: how many you rewrote and how many you left alone. Do not claim you verified anything.
