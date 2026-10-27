# Step 5: evidence words for remaining partial refs

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` first. Input: `docs/handoff/step-5-refs.md` (59 refs; each has its source, URLs, a reviewer note and its numbered "Cited for" sentences).

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only web search, URL reading, file read and file write tools.
- Touch ONLY the files listed in your task. Do NOT edit lessons or `docs/sources.json`. Do NOT commit.
- Claude fetches every URL and searches it for your words. A word that is not literally in the source is a failed line, so copy words exactly as the source prints them (same spelling, number format and units).
- Never invent a URL. Never write quotes longer than the grep words.

## Tasks (run in parallel; each reads only its lessons from the input)
- T-5a: refs from lessons 1-x and 2-x → write ONLY `research_notes/partials/step-5a.md`
- T-5b: refs from lessons 3-x, 4-x and 6-x → write ONLY `research_notes/partials/step-5b.md`
- T-5c: refs from lessons 5-x → write ONLY `research_notes/partials/step-5c.md`

For every ref, open its CURRENT source (the URLs listed; prefer the first). For each numbered "Cited for" sentence write exactly one line:

`<lesson>:<ref> | <URL you read> | s<number> | <supported|not-found> | <2 to 4 words or numbers copied from the source that support the sentence's key fact, comma-separated; empty if not-found>`

Example: `5-2:4 | https://docs.arduino.cc/tutorials/generic/secrets-of-arduino-pwm/ | s2 | supported | prescaler, 64, 250 kHz`

- Pick the words that carry the fact: numbers, dates, names, technical terms. Not "the", "robot", "ROS".
- If the page will not open for you, write `unreadable` instead of supported/not-found and leave the words empty.
- If the sentence's key fact is not in the source, write `not-found`. That is a useful answer.

Finish with a summary of at most 5 lines: file changed, counts of supported / not-found / unreadable. Do not paste file contents.
