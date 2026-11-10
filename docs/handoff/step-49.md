# Step 49: plain-language objectives and key points (data only)

Branch: `nav-a11y-plain-language`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit `course-data.js`, any lesson page or any script. Write ONLY `docs/handoff/step-49-rewrites.json`.

`docs/handoff/step-49-candidates.json` lists lesson objectives (shown in the "In this lesson you will" box at the top of each lesson) and key points (the summary box at the end) that a script flagged as long (over 22 words) or stiff. Each entry: `{"id": "4-4#o0", "lesson": "4-4", "kind": "objectives", "title": "<lesson title>", "words": 19, "stiff": [...], "text": "..."}`. For each one, read the matching part of the lesson (`python3` is not available to you; open `robotics-<lesson>.html` and search for the terms) so your wording agrees with how the lesson explains it.

Rewrite each `text` for a newcomer (first-year student or hobbyist, often reading in a second language):
- One sentence, at most 24 words. An objective starts with a plain verb for what the learner will do (Run, Write, Explain, Compare, Choose, Set up, Find, Read, Check). A key point is a plain statement.
- Everyday words: "look at" or "list" not "introspect"; "run" not "execute"; "use" not "utilize/employ/leverage"; "so that" not "enabling"; "with" or "through" not "via"; "set up" not "configure" where it means the same.
- Keep every technical name, command, file name, message type, standard number, product name, acronym and number exactly as written (ROS 2, rclpy, geometry_msgs, colcon, ISO 10218, PL d, 250 mm/s ...). Keep the lesson's glossary terms; do not swap them for synonyms.
- Same meaning and same scope. Add no facts, numbers, names or claims; do not drop a topic the original names (if the original lists four things, keep four unless the sentence would pass 24 words, then keep the list and shorten the rest).
- Entries about safety, law, liability or standards: keep the meaning exact and stay close to the original wording; change only words that cannot alter the meaning.
- No em dashes, no semicolons, no "you will", no filler.
- If an entry is already clear, leave it out.

Output: a JSON list `[{"id": "4-4#o0", "text": "new sentence"}, ...]` with only the entries you changed, same order, nothing else in the file.

Known past mistakes to avoid: inventing facts, changing a number or unit, replacing a technical term with a loose synonym (pose -> position, repeatability -> accuracy, topic -> channel), dropping one item from a list.

Finish with one line: how many you rewrote and how many you left alone. Do not claim you verified anything.
