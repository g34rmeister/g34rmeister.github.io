# Step 36: "Key points" for every lesson (data only)

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit any lesson. Write ONLY the JSON file named in your prompt.

For each lesson in your range, read the whole lesson and write 3 to 5 key points: the ideas a newcomer should keep after reading it.

Rules:
- Each point is one plain sentence, at most 25 words, for a robotics newcomer. Active voice. No jargon the lesson does not explain.
- Only what the lesson itself says. No numbers, names or claims that are not in the lesson text; keep any number exactly as the lesson gives it. No citations.
- Use the lesson's own terms for things (the same word the lesson uses).
- Do not write key points for lessons whose main topic is safety: 5-4, 8-4, 9-2. For other lessons, do not summarise safety requirements, stop behaviour, standards' safety rules or risk values; leave those for the lesson.
- No "This lesson", "You will learn", "In this lesson".

Output: a JSON object `{"1-1": ["point", "point", ...], "1-2": [...], ...}` with every lesson in your range except 5-4, 8-4 and 9-2, and nothing else in the file.

Finish with one line: how many lessons you covered. Do not claim you verified anything.
