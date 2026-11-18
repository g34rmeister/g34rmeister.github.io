# Step 65: quiz top-up for long lessons with few questions

Branch: `ch1-newbie`. Read `CLAUDE.md` first (quizzes are optional self-checks for newcomers). You cannot run shell commands. Do not try. Use only file read and file edit tools. Do not browse the web. Do NOT commit.

The prompt gives you ONE chapter number `C` and a list of lessons with how many questions to add to each. You may edit ONLY `assets/js/quiz/ch<C>.js`. Do not edit `course-data.js` (Claude bumps the version) or any page. Other agents edit other files at the same time.

## Steps
1. Read the whole quiz file first, so your questions do not repeat existing ones.
2. For each listed lesson, read the lesson text in `robotics-<lesson>.html` (inside `<article class="robotics-article-body">`; the "Check your understanding" section shows what the author thinks matters).
3. Write the requested number of new questions for that lesson and insert them directly after that lesson's last existing question, in the same one-line format:
   `{"lesson": "X-Y", "question": "...", "choices": ["...","...","...","..."], "answer": N, "explanation": "..."},`
   `answer` is the 0-based index of the correct choice. Vary its position across your questions.

## Rules
- **The answer must be stated in the lesson text.** Every fact in the question, the correct choice and the explanation must appear on that lesson page. Nothing from memory. Wrong choices must be plausible but clearly wrong according to the lesson (no trick questions, no "all of the above", no "none of the above").
- Cover sections that the existing questions for that lesson do not cover yet. Prefer understanding over recall: "why", "what happens if", "which one fits this situation", reading a number from a worked example. Avoid questions that hinge on a date, a single statistic or a person's name unless the lesson stresses it.
- Questions about safety may only use the lesson's wording for the safety rule itself.
- One idea per question, under 30 words. Four choices of similar length and form. The explanation is one or two sentences that say why the answer is right, using the lesson's facts.
- Plain words, American spelling, no em dashes. Keep the JSON valid: double quotes, escape inner double quotes as `\"`, a comma after every object except as the file already does it.
- Update the question count in the comment at the top of the file (`(NN questions)`).

At the end of the file, do not add anything after the closing `];`.

Finish with a summary of at most 10 lines: the file changed, questions added per lesson, the section of the lesson each new question is based on. Do not paste file contents.
