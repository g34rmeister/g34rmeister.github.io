# Step 38: widget proposals for lessons without one (report only)

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit any lesson or script. Write ONLY the report file named in your prompt.

Read `assets/js/widgets.js` (its header comment lists the existing widgets) and then each lesson listed in your prompt. For each lesson, propose AT MOST ONE small interactive widget, and only if the lesson contains concrete content that becomes clearer when the reader can change something: a formula with inputs, a step sequence, a comparison of two or three options, a classification the reader can test, a state machine, a coordinate transform.

Rules:
- The widget may show ONLY what the lesson states. Quote the exact lesson text it relies on (copied exactly, max 60 words per quote, up to 3 quotes). A script will search for each quote.
- No safety content: nothing about e-stops, protective stops, safety distances, risk assessment, PL/SIL, lockout/tagout, safety networks or safety functions.
- No widget that duplicates an existing one, or a static figure already in the lesson.
- If a lesson has nothing that fits, write `<lesson> | none | <one-line reason>`.

Format per proposal:
```
### <lesson>: <widget name in kebab-case>
- Shows: <one sentence>
- Reader can: <what the reader changes or clicks>
- Lesson text it uses: "<quote 1>" / "<quote 2>"
- Placement: after the paragraph starting "<first 8 words of that paragraph>"
- Value (1-3): <3 = clearly helps understanding>
```
End with `Checked lessons: <list>`. Do not claim you verified anything.
