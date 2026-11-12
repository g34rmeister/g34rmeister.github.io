# Step 57: glossary and lesson summaries, round 2: clearer and deeper, never shorter (data only)

Branch: `writing-polish-3`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit `glossary-data.js`, `site_manifest.json`, any page, data file or script. The prompt gives you a part number K. Read `docs/handoff/step-57-candidates-K.json` and write ONLY `docs/handoff/step-57-rewrites-K.json`.

Round 1 (step 54/55) gave you a maximum length, and most of your rewrites were rejected because you cut content to fit. This round has NO maximum length. There is only a minimum: `min_words`. The goal is text a newcomer understands on first reading and learns something from. Longer is fine. Shorter than `min_words` is an automatic reject.

Each candidate: `{"id": "g:sinking", "kind": "glossary" | "blurb", "term": "...", "lessons": ["8-1"], "task": "clarify" | "deepen", "min_words": 24, "text": "..."}`.
- `glossary` text is shown on the glossary page and as a tooltip on the term in the listed lessons.
- `blurb` text is the summary under a lesson title on chapter pages.

**Before writing anything for a candidate, open `robotics-<lesson>.html` for the first lesson in `lessons` and read the passage that explains the term (for a blurb: the objectives and section headings).** That lesson is your only source of facts. Its text has been source-checked. Your memory has not, so nothing from your own knowledge may be added, even if you are sure it is true.

## Task `clarify`
The text is hard to read (a long sentence, stacked nouns or stiff words) but its content is right.
- Keep every fact, example, qualifier, list item, name and number of the original. Check this word by word before you write the entry.
- Make it easier by splitting into two or three full sentences, using everyday words and putting the main idea first. Do not compress. Never build noun stacks ("PC micro-ROS Agent", "steady oscillation gain", "robot tree of links and joints"): write "a micro-ROS Agent on the PC", "the gain at which the system oscillates steadily".
- You may add one short explanation of a hard word, or one example, if and only if the lesson gives it. Then add `evidence`.

## Task `deepen`
The definition is correct but thin: it names the thing without telling a newcomer what it does or why it matters.
- Keep the original's meaning as the first sentence (reword only if unclear). Then add one or two sentences from the lesson: what it is used for, how it works, a concrete example or a typical value, or how it differs from the nearby term learners confuse it with.
- Every added statement needs `evidence`.

## Evidence
`"evidence": [{"lesson": "8-1", "quote": "..."}]`. Each quote is copied character for character from the visible text of that lesson page, 6 to 30 words, with no HTML tags and no citation marks like [3] inside it (pick a stretch of text that has none). A script searches the lesson for every quote, and a rewrite with a quote that is not found is rejected. Every new number, name, acronym or claim in your text must be inside one of your quotes. If the lesson does not give you anything to add, leave the candidate out. That is a normal result.

## Rules for all text
- A glossary definition starts with what the thing is ("A sensor that ...", "The ROS 2 tool that ..."), not with the term. A blurb keeps the form of the original ("How ...", "Why ...", "Build ...", or a topic list after a colon) and may be two sentences.
- Full sentences with their articles ("the", "a"). No sentence over 28 words.
- Everyday words: "gives" or "has" not "provides"; "lets" not "enables"; "through" or "with" not "via"; "use" not "utilize"; "keeps" not "retains"; "about" not "approximately"; "does" or "runs" not "performs". But never use "giving" as a filler verb ("a library giving classes"): write "a library with classes for".
- Keep every technical name, command, file name, message type, standard number, product name, acronym, symbol and number exactly as written. Keep parentheses that give an expansion or unit. Do not replace a technical term with a loose synonym (pose -> position, repeatability -> accuracy, topic -> channel, node -> program, torque -> force, frame -> coordinate system).
- Keep hedges and attributions exactly ("can", "usually", "about", "often", "typically", "exactly one", "such as" before an open list, "X defines"). "such as A and B" must not become "A and B".
- Do not add wording about safety, hazards, risk, standards, law or certification. If the best addition is safety content, leave the candidate out.
- No praise words (premier, powerful, popular, widely used) unless the original has them.
- No em dashes, no semicolons, no "you", American spelling.

Output: a JSON list with only the entries you changed, same order, nothing else in the file:
`[{"id": "g:sinking", "text": "new text", "evidence": [{"lesson": "8-1", "quote": "..."}]}, ...]` (`evidence` may be `[]` for a `clarify` entry that adds nothing).

Mistakes from round 1 that will be rejected again: dropping an example or qualifier ("exactly one state", "or appear to", "small", "real or simulated", "suction cups"), dropping a list item, noun stacks, wrong new wording ("requests a server", "the interval where"), swapping "in which" for "where" as the only change, turning the sitemap into "sitemaps".

Finish with one line: how many you rewrote per task and how many you left out. Do not claim you verified anything.
