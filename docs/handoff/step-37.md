# Step 37: harvest good first issues (report only)

Branch: `main`. Read `CLAUDE.md` and `CONTRIBUTING.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit any lesson. Write ONLY the report file named in your prompt.

Read every lesson in your range completely. Find small, real problems a newcomer could fix in one pull request. Good kinds:
- a sentence that is unclear, ambiguous or grammatically broken;
- a term used differently in two places (name both places);
- a step in a lab or "Try it" that is missing, out of order, or refers to something not shown;
- a code block whose surrounding text describes it wrongly (variable names, file names, command names that do not match);
- formatting problems visible in the text (doubled words, stray characters, a list that should be numbered);
- a heading that does not match its section's content.

Do NOT report: missing citations, style preferences, things you would like added, safety wording (never suggest changes to safety content), or anything in the References lists.

Write each issue as:
```
### <short title>
- Lesson: <id>, section "<heading>"
- Text: "<exact quote from the page text, max 40 words>"
- Problem: <one or two sentences>
- Suggested fix: <concrete>
- Labels: good first issue, <wording|lab|code|formatting|consistency>
```
The quote must be copied exactly (it will be searched for by a script). Aim for 10-15 real issues for your range; fewer is fine, invented ones are not. End the file with `Checked lessons: <list>`.

Do not claim you verified anything beyond reading the files.
