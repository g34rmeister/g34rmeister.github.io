# Step 10: reading level and consistency review

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` first. Lessons are `robotics-<c>-<n>.html`; the glossary data is `assets/js/glossary-data.js`; each lesson's key terms are in `assets/js/course-data.js`.

Audience: first-year students and career changers with no robotics background.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read and file write tools.
- Touch ONLY the output file of your task. Do NOT edit lessons or data files. Do NOT commit.
- Every quote must be copied word for word from the lesson page's visible text (no HTML tags). Claude checks each quote with a script; a quote that is not on the page fails the line.
- Do not suggest changes to facts, numbers or citations. Only wording and order.

## Tasks (run in parallel)
- T-10a: lessons 1-x, 2-x and 3-x → write ONLY `research_notes/readability/step-10a.md`
- T-10b: lessons 4-x, 5-x and 6-x → write ONLY `research_notes/readability/step-10b.md`

Write one line per problem, at most 8 per lesson, most important first:

`<lesson> | <issue> | <quote, word for word, max 40 words> | <suggested rewrite or fix in one sentence>`

Issue is one of:
- `undefined-term`: a technical term is used before the lesson (or an earlier lesson) explains it.
- `hard-sentence`: a sentence a beginner would have to read twice (too many clauses, stacked jargon). Do NOT flag a sentence only for being long.
- `inconsistent-term`: the same thing is named two different ways in the course (quote one, name the other in the fix).
- `jump`: a step in an explanation is skipped.

Finish with a summary of at most 4 lines: file changed, lessons reviewed, count per issue type. Do not paste file contents.
