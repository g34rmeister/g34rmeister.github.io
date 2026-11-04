# Step 39: cross-lesson consistency of terms (report only)

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit any file except the report named in your prompt.

Use `docs/lessons-index.md` to find key terms that appear in more than one lesson (also check `assets/js/glossary-data.js` for each term's course-wide definition). For the terms in your assigned set, read every lesson that uses the term and compare how each one defines or describes it. Report ONLY real problems:
- CONTRADICTION: two lessons say incompatible things (different numbers, opposite claims, different definitions).
- DRIFT: the same thing is called by different names without saying they are the same (e.g. "TCP" vs "tool point" vs "end point"), so a newcomer could think they are different things.
- GLOSSARY: the glossary definition disagrees with how the lessons use the term.

Ignore: one lesson being more detailed than another; wording differences that mean the same thing; vendor-specific differences the lessons explain.

Format, one block per problem:
```
### <term>: <CONTRADICTION|DRIFT|GLOSSARY>
- <lesson A>: "<exact quote, max 40 words>"
- <lesson B>: "<exact quote, max 40 words>"
- Problem: <one or two sentences>
- Suggested fix: <which lesson to change and how, minimal>
```
Quotes must be copied exactly (a script will search for them). Never suggest changes to safety content; report safety-term conflicts with "SAFETY" in the heading and no suggested fix. End with `Checked terms: <list>`. Do not claim you verified anything.
