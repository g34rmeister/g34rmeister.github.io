# Step 2: Chapter 5 partial refs (find what is unsupported, propose sources)

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` first. Input: `docs/handoff/step-2-refs.md` (26 refs: each with its source, URLs, a reviewer note and the exact lesson sentences that cite it).

## Shared rules
- You cannot run shell commands in this environment. Do not try (no python, no curl). Use your built-in web search, URL reading and file write tools only.
- Touch ONLY the file listed in your task. Do NOT edit lessons or `docs/sources.json`. Do NOT commit.
- You are proposing, not verifying. Claude fetches every URL and checks it. Do NOT write quotes and do NOT mark anything "fetched" or "verified".
- Never invent a URL. Only list URLs that appeared in your search results or that you opened. An invented URL fails the ticket.
- Prefer primary and official sources: vendor and standards documentation (Arduino, ROS/Nav2, MathWorks, TI, ST, Pololu, IEC/PLCopen), textbooks' official pages, peer-reviewed papers. No blogs, forums or AI summaries.

## T-2a: write ONLY `research_notes/partials/step-2.md`
For every ref in the input, write one block:

```
## <lesson>:<ref>
gap: <the specific fact(s) in the cited sentences that the listed source probably does not state, in under 25 words; or "none" if you think the source covers everything>
<lesson>:<ref> | <URL> | current or new | <which gap it should support> | <2 to 4 distinctive words or numbers to grep for, comma-separated>
```

- Give 0 to 3 candidate lines per ref, best first. "current" means a different page or file of the same publisher as the existing source; "new" means a different source.
- If the gap is a number or a specific claim you cannot find any source for, write `nosource: <the fact>` on its own line instead of candidates. That is a useful answer: Claude may reword the sentence.
- Grep words must be words that would literally appear in the source text (numbers, names, technical terms), not paraphrases.

Finish with a summary of at most 6 lines: file changed, count of refs with gap "none", with candidates, with nosource. Do not paste file contents.
