# Step 12: apply the readability fixes from step 10

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` first. Input: `research_notes/readability/step-10a.md` and `step-10b.md` (one line per issue: lesson | issue | quote | suggested fix). Skip the 4-1 line about "Annex I" (its quote is not on the page).

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read, file edit and file write tools.
- Edit ONLY the lesson files of your task, and ONLY the sentence each issue quotes (or the sentence right before it, if a definition must come first). Do NOT touch the References list, headings, navigation, scripts, quizzes or data files. Do NOT commit.
- Keep every number, unit, `<sup>` citation, link, `<code>` element and `<strong>`/`<em>` term exactly as it is. A script compares these before and after; any change to them fails the edit.
- Definitions you add must be short (one clause), plain, and textbook-standard (for example "SCARA (Selective Compliance Assembly Robot Arm)"). Do not add new facts, dates, numbers, names or claims. If a term cannot be defined that way, leave the sentence and list it in your summary.
- Match the surrounding style: plain English, short sentences, the HTML entities the file already uses (`&rsquo;`, `&ldquo;`).

## Tasks (run in parallel)
- T-12a: issues for lessons 1-x, 2-x and 3-x (from `step-10a.md`)
- T-12b: issues for lessons 4-x, 5-x and 6-x (from `step-10b.md`)

Finish with a summary of at most 6 lines: files changed, issues fixed, issues skipped and why. Do not paste file contents.
