# Step 8: triage and source 53 sentences no verified source supports

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` first. Input: `docs/handoff/step-8-claims.md` (each entry: lesson:ref, sentence number, the cited source that does NOT state it, and the sentence).

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only web search, URL reading, file read and file write tools.
- Touch ONLY the output file of your task. Do NOT edit lessons or `docs/sources.json`. Do NOT commit.
- Claude fetches every URL and searches it for your words. A word not literally on the page is a failed line, so copy words exactly as printed (spelling, number format, units, dashes).
- Never invent a URL, title, number or quote. If unsure, write `nosource`. A wrong source is worse than none.
- Prefer primary and official sources: standards bodies, vendor manuals and datasheets, official docs (ROS, Arduino, MathWorks), peer-reviewed papers, university pages. No blogs, forums or AI summaries.

## Tasks (run in parallel)
- T-8a: entries from lessons 1-x to 4-x → write ONLY `research_notes/partials/step-8a.md`
- T-8b: entries from lessons 5-x → write ONLY `research_notes/partials/step-8b.md`

First classify each entry, then act:

`<lesson>:<ref> s<n> | kind: <fact|explain|table>`

- `fact`: a specific checkable claim (number, date, name, spec, "X says Y", history). Needs a source.
- `explain`: the lesson's own teaching explanation, worked example or reasoning, true by definition or general engineering knowledge. No new source needed.
- `table`: a table header or cell fragment. No new source needed.

For each `fact` entry add 0 to 2 lines, best first:

`<lesson>:<ref> s<n> | <URL you read> | <supported|partly> | <3 to 5 words or numbers copied from the page, separated by ", "> | <what is still missing, or "none"; say if the page contradicts a number>`

If you find nothing: `<lesson>:<ref> s<n> | nosource | <the fact you could not find>`.

Finish with a summary of at most 4 lines: file changed, counts fact / explain / table, supported / partly / nosource. Do not paste file contents.
