# Step 31: quiz questions for chapters 3 and 10

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Edit only `assets/js/course-data.js`.

Chapter 3 has 10 questions for 4 lessons and chapter 10 has 9 for 4 lessons. Add new questions so every lesson 3-1..3-4 and 10-1..10-4 has 4 questions in total (count the existing ones per lesson first), appended to the end of that chapter's list in `quizzes`, in the exact existing format:
`{"lesson": "3-1", "question": "...", "choices": ["...","...","...","..."], "answer": N, "explanation": "..."}`

Rules (same as step 30):
- Read each lesson first. Question, correct answer and explanation come only from that lesson's text; the explanation restates the lesson's sentence closely. No outside knowledge.
- Ask about ideas the lesson explains, not trivia. Do not repeat an existing question. Four choices; wrong ones clearly wrong according to the lesson.
- No questions about safety content (risk assessment, e-stops, protective stops, safety ratings, ISO 10218/13849). For the capstones, ask about what to build, the milestones, the hand-ins and the rubric, not about safety.
- For chapter 3 use the lessons' own terms (fork, upstream, pull request, CONTRIBUTING, license names exactly as written).
- Change `version: '2026-10i'` to `version: '2026-10j'`. Keep the file valid JavaScript.

Finish with at most 4 lines: how many questions you added per lesson.
