# Step 6: find sources for 15 unsupported sentences

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` first. Input: `docs/handoff/step-6-claims.md` (15 lesson sentences whose cited source does not state the key fact).

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only web search, URL reading, file read and file write tools.
- Touch ONLY `research_notes/partials/step-6.md`. Do NOT edit lessons or `docs/sources.json`. Do NOT commit.
- Claude fetches every URL and searches it for your words. A word not literally in the page is a failed line, so copy words exactly as the page prints them (spelling, number format, units, dashes).
- Never invent a URL. Prefer primary and official sources: IFR, ISO, vendor pages and manuals (FANUC, iRobot, TEPCO), MathWorks, ISA, peer-reviewed papers, university pages, the PJRC/Arduino library source on GitHub. No blogs, forums or AI summaries.

## T-6a: write ONLY `research_notes/partials/step-6.md`
For each input sentence, open candidate pages and write 0 to 2 lines, best first:

`<lesson>:<ref> s<n> | <URL you read> | <supported|partly> | <3 to 5 words or numbers copied from the page that carry the sentence's key fact, comma-separated> | <what part is still missing, or "none">`

- If you find nothing, write one line: `<lesson>:<ref> s<n> | nosource | <the fact you could not find>`. Claude may then reword the sentence.
- If a number in the sentence is wrong according to a source, say so in the last column (e.g. "page says 2011-04-17 only").

Finish with a summary of at most 5 lines: file changed, counts supported / partly / nosource. Do not paste file contents.
