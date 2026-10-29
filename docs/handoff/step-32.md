# Step 32: audit objectives and glossary against the lessons (report only)

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit any lesson, `course-data.js` or `glossary-data.js`. Write ONLY the one report file named in your part.

Your prompt names a part (A or B) and a range of chapters. Read every lesson file in that range (`robotics-<chapter>-<n>.html`) completely.

## Part A: objectives (report: `docs/handoff/step-32-objectives-<range>.md`)

For each lesson, `assets/js/course-data.js` has an `objectives` list. For each objective, decide whether the lesson's text actually teaches it. Report ONLY problems:
- MISSING: the lesson does not cover the objective at all.
- OVERSTATED: the objective promises more than the lesson gives (e.g. "compare" when the lesson only names; a number or source the lesson does not contain; a year or report edition the lesson does not mention).
- MISMATCH: a name, number or term in the objective differs from the lesson's wording.

## Part B: glossary (report: `docs/handoff/step-32-glossary-<range>.md`)

For each lesson's `keyTerms` in `course-data.js`, find the definition in `assets/js/glossary-data.js`. Report ONLY problems:
- CONFLICT: the definition says something the lesson contradicts, or a number/name differs from the lesson.
- OFF: the definition describes a different sense of the term than the lesson uses.
- UNUSED: the key term does not appear in the lesson at all.
Ignore definitions that are just simpler or shorter than the lesson.

## Report format (both parts)

One line per problem:
`<lesson> | <objective or term> | <MISSING/OVERSTATED/MISMATCH/CONFLICT/OFF/UNUSED> | lesson says: "<exact quote copied from the lesson, max 30 words, or NONE>" | suggested fix: <short>`

The quote must be copied exactly from the lesson file text (no paraphrase), so it can be found by search. If there are no problems for a lesson, write nothing for it. End the file with one line: `Checked lessons: <list>`.

Do not claim you verified anything beyond reading the files.
