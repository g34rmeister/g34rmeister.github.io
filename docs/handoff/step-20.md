# Step 20: Chapter 9 (Maintenance and Troubleshooting) source candidates

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` and `plans/ch9-maintenance-troubleshooting.md` first.

You are finding source pages, not facts and not lessons. Claude downloads every URL you list and saves its text; in the next step facts are taken only from those saved copies. So a good URL matters more than anything you write about it.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only web search, URL reading, file read and file write tools.
- Touch ONLY the output file of your task. Do NOT create lessons. Do NOT commit.
- Only list URLs you actually opened and saw load with real content. Never guess or construct a URL.
- Prefer primary and official sources listed in the brief: robot vendors' own documentation (Universal Robots support articles and service manuals, ABB and FANUC public manuals, KUKA), OSHA pages on lockout/tagout and robotics, NIST and university pages on maintenance, Fluke application notes. Free PDF manuals are good.
- No blogs, forums, Wikipedia, marketing listicles or AI summaries. Vendor technical pages and application notes are fine.
- Skip pages that need a login or are paywalled.

## Tasks (run in parallel)
- T-20a: lessons 9.1 and 9.2 → write ONLY `research_notes/ch9/step-20a.md`
- T-20b: lessons 9.3 and 9.4 → write ONLY `research_notes/ch9/step-20b.md`
- T-20c: lessons 9.5 and 9.6 → write ONLY `research_notes/ch9/step-20c.md`

For each lesson, list 8 to 12 pages that together cover the lesson's topics in the brief. One line per page:

`<lesson> | <URL> | <publisher> | <which lesson topics the page explains, in a few words>`

- At least 3 different publishers per lesson.
- For 9.2 and 9.6, include Universal Robots pages on the Dashboard Server (port 29999, command list with the exact replies) and on reading the robot's log or error codes.
- For 9.1 and 9.5, include at least one robot maker's maintenance schedule and one page on joint calibration, mastering or zeroing.

Finish with a summary of at most 4 lines: file changed, pages per lesson, publishers used. Do not paste file contents.
