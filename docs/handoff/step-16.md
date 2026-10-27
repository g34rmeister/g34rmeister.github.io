# Step 16: Chapter 7 citation and length pass

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` first. Inputs: `research_notes/ch7/facts.md` (the ONLY facts allowed), `docs/handoff/step-14-sources.md` (source URL → cached text file in the cache folder given in your prompt).

Problem: in `robotics-7-1.html` to `robotics-7-6.html` only 20 to 28% of sentences carry a citation. Many uncited sentences state technical claims (how a device works, what it is good at, comparisons) that are not in `facts.md`.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read, file edit and file write tools.
- Edit ONLY the six lesson files and write ONLY the log file below. Do NOT touch References entries except to add new ones, and do NOT touch navigation, head tags, scripts or data files. Do NOT commit.
- Never add a fact that is not in `facts.md`. Never change a number that is already cited.

## T-16a: for EVERY sentence in the lesson body (not headings, not code, not References)
Decide one of:
1. **cite**: the sentence states a fact that a `facts.md` line for Chapter 7 supports → add `<sup><a href="#ref-N">[N]</a></sup>` for that line's URL (add a new References entry, numbered by first use, if the URL is not yet listed; renumber later refs so numbering stays by first use).
2. **keep**: the sentence only explains, connects or gives the lesson's own worked example (clearly marked "for example", "imagine", "suppose") without a new factual claim.
3. **cut or soften**: the sentence states a technical claim that no `facts.md` line supports → delete it, or rewrite it so it no longer claims anything beyond the cited facts.

Then:
- Trim `robotics-7-1.html` and `robotics-7-2.html` to at most 2,200 words of lesson text (cut repetition and filler first).
- Expand `robotics-7-6.html` to at least 1,400 words using the 7.6 facts (step-by-step lab: what each node does, the `Image` and `CameraInfo` fields, `image_transport`, `cv_bridge`, a minimal OpenCV node with a short code listing, and how to check it with ROS 2 tools that the facts name). Every factual sentence cited.

## Log: write ONLY `research_notes/ch7/step-16-log.md`
One line per citation you ADD: `<lesson> | ref <N> | <URL> | <the facts.md fact text you relied on, copied exactly>`
One line per sentence you CUT or SOFTEN: `<lesson> | cut|soften | <first 12 words of the original sentence>`

Finish with a summary of at most 6 lines: per lesson, sentences cited/kept/cut, final word count. Do not paste file contents.
