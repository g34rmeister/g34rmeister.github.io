# Step 18: Chapter 8 facts from saved pages

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` and `plans/ch8-industrial-networks.md` first.

Claude has downloaded the candidate pages from step 17. `docs/handoff/step-18-sources.md` lists each page: URL | lessons | publisher | characters | cached file (`ch8cache/<name>.txt` inside the cache folder given in your prompt). Each cached file starts with a `SOURCE URL:` line.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read and file write tools. Do not browse the web in this step.
- READ THE CACHED FILE, not the live page. Use only facts stated in those files.
- Touch ONLY the output file of your task. Do NOT create lessons. Do NOT commit.

## Tasks (run in parallel)
- T-18a: lessons 8.1 and 8.2 → write ONLY `research_notes/ch8/step-18a.md`
- T-18b: lessons 8.3 and 8.4 → write ONLY `research_notes/ch8/step-18b.md`
- T-18c: lessons 8.5 and 8.6 → write ONLY `research_notes/ch8/step-18c.md`

A page listed for one lesson may also be used for another lesson in your task if it covers that topic.

For each lesson, write 15 to 22 facts a beginner lesson needs (definitions, how it works, why, typical values, trade-offs, standard names), one per line:

`<lesson> | <the fact in one plain sentence> | <URL from the SOURCE URL line of the file> | <3 to 5 words or numbers copied exactly from the file, separated by ", ">`

- The evidence words must appear in that file exactly (spelling, numbers, units, hyphens, capitals). Claude's checker searches the same file.
- The fact sentence must say only what the file says. Do not add numbers, causes or comparisons from your own knowledge.
- One fact per line; split compound facts. Do not write the same fact twice.
- Use at least 3 different files per lesson.
- For 8.3, include the facts a hands-on lab needs: the UR Modbus server's port, function codes and general-purpose register addresses, and how a pymodbus client connects, reads and writes registers.
- Prefer facts that teach (how and why) over trivia and marketing claims.

Finish with a summary of at most 3 lines: file changed, facts per lesson, files used.
