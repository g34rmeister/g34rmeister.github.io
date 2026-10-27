# Step 11: Chapter 7 (Machine Vision) research

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` and `plans/ch7-machine-vision.md` first.

You are collecting evidence, not writing lessons. Claude fetches every URL you give and keeps a fact only if your evidence words are literally on the page.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only web search, URL reading, file read and file write tools.
- Touch ONLY the output file of your task. Do NOT create lessons. Do NOT commit.
- Never invent a URL, number, name or quote. Only list URLs you opened. Unsure means leave it out.
- Prefer primary and official sources (see the brief). No blogs, forums, Wikipedia or AI summaries.
- Numbers need the exact form printed on the page (units, decimals, dashes).

## Tasks (run in parallel)
- T-11a: lessons 7.1 and 7.2 → write ONLY `research_notes/ch7/step-11a.md`
- T-11b: lessons 7.3 and 7.4 → write ONLY `research_notes/ch7/step-11b.md`
- T-11c: lessons 7.5 and 7.6 → write ONLY `research_notes/ch7/step-11c.md`

For each lesson, collect 12 to 20 facts a beginner lesson needs (definitions, how it works, typical values, trade-offs, standard names). One line per fact:

`<lesson> | <the fact in one plain sentence> | <URL you opened> | <3 to 5 words or numbers copied exactly from the page, separated by ", ">`

- One fact per line; split compound facts.
- Prefer facts that teach (how and why) over trivia.
- Include at least 2 different publishers per lesson.

Finish with a summary of at most 4 lines: file changed, facts per lesson, publishers used. Do not paste file contents.
