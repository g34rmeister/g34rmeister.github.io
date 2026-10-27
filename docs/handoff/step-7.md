# Step 7: evidence words for formerly unreachable refs

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` first. Input: `docs/handoff/step-7-refs.md` (90 refs whose sources used to be blocked).

Each ref lists a "Cached text" file. That is the page text Claude already fetched. The files live in the cache folder given in your prompt (`<cache>/srccache/...`). READ THE CACHED FILE, not the live web page: it is the exact text Claude will search.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read and file write tools.
- Touch ONLY the output file of your task. Do NOT edit lessons or `docs/sources.json`. Do NOT commit.
- Claude searches the cached text for your words. A word that is not literally in the file is a failed line, so copy words exactly (spelling, number format, units, dashes).

## Tasks (run in parallel; each handles only its lessons)
- T-7a: lessons 1-x → write ONLY `research_notes/partials/step-7a.md`
- T-7b: lessons 2-x, 3-x and 4-x → write ONLY `research_notes/partials/step-7b.md`
- T-7c: lessons 5-x and 6-x → write ONLY `research_notes/partials/step-7c.md`

For each numbered "Cited for" sentence write exactly one line:

`<lesson>:<ref> | <URL> | s<number> | <supported|not-found> | <2 to 4 words or numbers copied from the cached text that carry the sentence's key fact, comma-separated; empty if not-found>`

- Pick words that carry the fact: numbers, dates, names, technical terms.
- If the key fact is not in the cached text, write `not-found`. That is a useful answer.

Finish with a summary of at most 4 lines: file changed, counts supported / not-found. Do not paste file contents.
