# Step 9: quiz quality review

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` first. The quizzes are in `assets/js/course-data.js` under `quizzes` (one array per chapter; `answer` is the 0-based index of the correct choice; `lesson` names the lesson page `robotics-<lesson>.html`).

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read and file write tools.
- Touch ONLY the output file of your task. Do NOT edit `course-data.js` or any lesson. Do NOT commit.
- Judge each question ONLY against its lesson page text, not outside knowledge. A student must be able to answer from the lesson.
- Every quote you give must be copied word for word from the lesson page's visible text (no HTML tags, no paraphrase). Claude checks each quote with a script; a quote that is not on the page fails the line.

## Tasks (run in parallel)
- T-9a: chapters 1, 2 and 3 → write ONLY `research_notes/quiz/step-9a.md`
- T-9b: chapters 4, 5 and 6 → write ONLY `research_notes/quiz/step-9b.md`

Write one line per question that has a problem (skip questions that are fine):

`<chapter>#<question index, 0-based> | <lesson> | <problem> | <quote: the lesson sentence that decides the answer, word for word, max 40 words> | <suggested fix in one sentence>`

Problem is one of:
- `not-taught`: the lesson does not state what is needed to answer.
- `wrong-answer`: the lesson supports a different choice than `answer`.
- `two-right`: another choice is also correct according to the lesson.
- `explanation-wrong`: the explanation contradicts the lesson.
- `unclear`: the wording could be read two ways.

For `not-taught`, the quote is the closest lesson sentence, or `none`.

Finish with a summary of at most 4 lines: file changed, questions reviewed, count per problem type. Do not paste file contents.
