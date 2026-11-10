# Step 50 / 51: second round of plain-language paragraph rewrites (data only)

Branch: `nav-a11y-plain-language`. Read `CLAUDE.md` first, then `docs/handoff/step-47.md`: ALL of its rules apply here unchanged (same reader, same hard rules, same output format `[{"id": ..., "html": ...}]`, only the entries you changed). You cannot run shell commands. Do not browse the web. Do NOT commit. Do NOT edit any lesson page, script or data file. The prompt names one candidates file and one output file; write ONLY that output file.

`docs/handoff/step-50-candidates.json`: 70 paragraphs whose first rewrite was thrown away. Each has `rejected_because`, the exact reason. Rewrite it again WITHOUT repeating that mistake:
- "citations/protected/tags differ" or "numbers/caps/quotes/entities differ": you changed or dropped something that must be copied exactly. Copy every tag, number, name and quoted phrase from the original.
- "meaning check: ... citation ..." : when you split a sentence, each half that states a sourced fact must keep the citation that followed it. If the original has ONE citation after a sentence with two facts, do NOT split that sentence; shorten its wording instead, or leave the paragraph out.
- "meaning check: ... added/dropped ...": you added a claim or lost a hedge ("can", "about", "often", "X states that"). Keep every hedge and every attribution.
- "still has a N-word sentence": no sentence over 30 words.
- "dropped key term": keep the lesson's technical terms word for word.
If you cannot fix a paragraph within these rules, leave it out. Leaving it out is a good answer.

`docs/handoff/step-51-candidates.json`: 19 paragraphs from "Try it" boxes, answer blocks and figure captions that the first round did not cover. Same rules. Exercise steps must keep the same steps in the same order with the same values; a question must still ask the same thing.

Finish with one line: how many you rewrote and how many you left alone. Do not claim you verified anything.
