# Step 21: Chapter 9 facts from saved pages

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` and `plans/ch9-maintenance-troubleshooting.md` first.

Claude has downloaded the candidate pages from step 20. `docs/handoff/step-21-sources.md` lists each page: URL | lessons | publisher | characters | cached file (`ch9cache/<name>.txt` inside the cache folder given in your prompt). Each cached file starts with a `SOURCE URL:` line.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read and file write tools. Do not browse the web in this step.
- READ THE CACHED FILE, not the live page. Use only facts stated in those files.
- Touch ONLY the output file of your task. Do NOT create lessons. Do NOT commit.

## Tasks (run in parallel)
- T-21a: lessons 9.1 and 9.2 → write ONLY `research_notes/ch9/step-21a.md`
- T-21b: lessons 9.3 and 9.4 → write ONLY `research_notes/ch9/step-21b.md`
- T-21c: lessons 9.5 and 9.6 → write ONLY `research_notes/ch9/step-21c.md`

A page listed for one lesson may also be used for another lesson in your task if it covers that topic.

For each lesson, write 15 to 22 facts a beginner lesson needs (definitions, how it works, why, typical values, trade-offs, standard names), one per line:

`<lesson> | <the fact in one plain sentence> | <URL from the SOURCE URL line of the file> | <3 to 5 words or numbers copied exactly from the file, separated by ", ">`

- The evidence words must appear in that file exactly (spelling, numbers, units, hyphens, capitals). Claude's checker searches the same file.
- The fact sentence must say only what the file says. Do not add numbers, causes or comparisons from your own knowledge.
- One fact per line; split compound facts. Do not write the same fact twice.
- Use at least 3 different files per lesson.
- For 9.6, include the facts the lab needs: the Dashboard Server port, that each command ends with a newline, the exact reply text of robotmode, safetystatus, programState, running, play, close safety popup and unlock protective stop (including the 5 s rule), and the protective stop recovery steps.
- For 9.1 and 9.5, include the inspection intervals and calibration or recovery steps exactly as the manuals state them. For 9.2, include the OSHA lockout/tagout requirements.
- Prefer facts that teach (how and why) over trivia and marketing claims.

Finish with a summary of at most 3 lines: file changed, facts per lesson, files used.
