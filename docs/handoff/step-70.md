# Step 70: simpler wording for safety content

Branch `iterate-67`. Read CLAUDE.md first. Gerald (2026-11-27): "work on safety stuff so that it is simpler wording wise, I trust you." Step 69 made Ch1, Ch2 and Ch4 beginner-first but kept the safety wording exactly as it was. This step simplifies the safety wording itself while keeping every safety fact exactly as strong and exact as before. Claude reviews every reworded safety sentence by hand against the original.

## Edit only
The lesson pages and sections your task lists, inside the `<article>` body (not the head, navbar, Start-here box, References list, footer, or generated blocks between `<!-- ... -->` markers). Do not edit `assets/js/widgets.js`, quiz files, CSS or `docs/sources.json`. You cannot run shell commands; file read/write only.

## Rules for safety wording (the point of this step)
S1. **You may reword the course's own safety sentences into plain words.** Keep exactly:
   - every number and its unit, written the same way (if both units are given, keep both: "250 mm/s (10 in/s)");
   - every limit word: "at most", "at least", "no more than", "only", "every", "all";
   - the strength of every obligation: must / shall / never / always / do not stay as strong. Never turn "must" into "should", "should" into "must", or a requirement into advice;
   - every condition and exception: if, unless, only when, before, until, except;
   - who does the action (operator, integrator, maintenance technician, the controller) and the order of the steps.
S2. **Quotes** from OSHA, NIOSH, standards and manuals stay word-for-word inside their quotation marks. Put "In plain words: ..." right before or after the quote, restating only what the quote says.
S3. **Formulas and worked numbers** (for example S = K × T + C and its calculation) stay byte-for-byte. Explain each letter in everyday words, one per line (a `<ul>` is fine).
S4. **Procedures:** when the lesson describes steps in a long paragraph, you may turn them into a numbered list (`<ol>`) with the same steps in the same order. Add no step and drop none.
S5. **Jargon:** say the everyday meaning first and give the term in brackets the first time: "switch off the power and lock it so nobody can turn it back on (lockout/tagout)". Expand every acronym on first use in the lesson (PL, SIL, LOTO, E-stop, 3PE, SRP/CS, PLC and so on).
S6. **No new safety advice**, no new numbers, no new examples of accidents. Do not drop any warning or any fact; fine detail (clause numbers, edition history, table subtleties) moves into a `<details class="deeper"><summary>For the curious: <topic></summary> ... </details>` box at the end of the same section, with its `<sup>` citation.
S7. **Citations:** every existing `<sup><a href="#ref-N">` stays, attached to the same claim. If you split a sentence, the citation goes on the part that states the cited fact (repeat it on both parts if both state cited facts).
S8. Sentences: one idea each, about 20 words or fewer. Active voice, "you" where it fits. No semicolon run-ons. Keep qualifiers ("about", "most", "typically", "can").
S9. Keep: exactly one `<h1>`, section numbers and `id`s, figures, tables of numbers, `data-widget` divs, code blocks (byte-for-byte). You may reword a heading to say what the reader gets.
S10. Not shorter: each section you edit ends at least as long as it started.

Known failure log (do not repeat): paraphrasing from general knowledge instead of the lesson; "should" replacing "must"; dropped qualifiers or exceptions when simplifying; summaries that contradict the lesson's own table; leftover conflict markers.

## Log (required)
Write `docs/handoff/step-70/<lesson>.md` per lesson. For every sentence that states a safety rule, number or requirement and that you reworded, one line:
`§NN | OLD: <original sentence> | NEW: <new sentence(s)> | refs: [N]`
Other changes (moved to a details box, heading changes) get one short line each.

## Who does what (Gerald, 2026-11-27: "safety: opus, the rest: gemini")
- **Claude (Opus) rewrites all safety wording** under rules S1-S10: 5-4 (whole), 5-2 §01-05, 5-1 §05-08, 1-4 §01, 1-7 §04, 2-1 §03, 9-2 §01-03, 8-4 §01-06, 5-5 §08, 4-9 §08, 6-1 §07, 11-1 §07. Gemini does not touch these sections.
- **Gemini does the non-safety beginner-first rewrite of Chapter 5** (not covered by step 69), using the step-69 rules (`docs/handoff/step-69.md`) and the log format `docs/handoff/step-69/<lesson>-moved.md`:
  - **T-70g** `robotics-5-1.html` §01-04 and §09-11.
  - **T-70h** `robotics-5-2.html` §06-09 and `robotics-5-5.html` §01-07 and §09-10.
  - **T-70i** `robotics-5-3.html`, the whole lesson.
  Leave every section not listed exactly as it is. If a listed section contains a safety rule, number or requirement, keep that sentence word-for-word (step-69 rule 8).

End: "Finish with a summary of at most 10 lines: files changed, anything unresolved, any deviation. Do not paste file contents."
