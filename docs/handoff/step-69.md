# Step 69: beginner-first rewrite of the starting chapters (pilot 1-1 approved 2026-11-27; rollout to Ch1, Ch2, Ch4)

Branch `iterate-67`. Read CLAUDE.md first. Gerald (2026-11-27): the way standards are worded in the starting chapters is too hard for beginners; make Chapters 1-2 easier. Pilot on robotics-1-1.html; the same rules then go to 1-2..1-7 and 2-1..2-8.

## Edit only
`robotics-<lesson>.html`, inside the `<article>` body sections (not the head, navbar, Start-here box, References list, footer, or generated blocks between `<!-- ... -->` markers). You cannot run shell commands; file read/write only.

## Rules
1. **Plain first.** Every section opens with 2-4 short sentences in everyday words: what the idea is and why a beginner should care, before any standard number, quote or jargon. Use a concrete example from the lesson (the welding arm, the vacuum cleaner, etc.).
2. **Standards in plain words.** On first mention, say what the document is for ("ISO 8373, the international standard that fixes the vocabulary of robotics"), then use the short name. No clause numbers, edition years or "replaced the 2012 edition" in the main text.
3. **Fold away the detail, do not delete it.** Clause numbers, edition history, cross-references between definitions, and fine distinctions between organisations (e.g. ISO vs IFR categories) move into a box at the end of the same section:
   `<details class="deeper"><summary>For the curious: <short topic></summary> <p>...</p></details>`
   Move the citation `<sup>` with the sentence it supports. Every existing `<sup><a href="#ref-N">` must still be present after the edit, attached to the same claim.
4. **Quotes from standards** stay word-for-word, but keep them short, and put the plain explanation right before the quote ("In everyday words, ...; the standard puts it this way:"). Then the "each word is a test" style breakdowns may stay, written simply.
5. **Sentences:** one idea each, about 20 words or fewer; split long ones. Expand every acronym on its first use in the lesson. Prefer "you" and active voice. No new jargon.
6. **No new facts.** Every fact must already be in the lesson. Do not drop any fact either: move it to a details box instead. Do not change numbers, dates, names or quotes.
7. **Length:** the rewritten lesson must not be shorter than the original (Gerald: no maximum, depth is welcome); easier is not shorter. Add explanation and examples, not cuts.
8. **Safety content** (enabling devices, speeds, safety distances, standards' safety requirements): keep the wording and numbers exactly; you may add a plain lead-in sentence before it.
9. Keep: exactly one `<h1>`, section headings and their numbers, figures, widgets (`data-widget` divs), code blocks, and the Wikipedia-style markup classes already used.
10. Known failure log (do not repeat): paraphrasing facts from general knowledge instead of the lesson; summaries that contradict the lesson's own wording; leftover conflict markers; dropping qualifiers ("about", "most") when simplifying.

11. **Friendlier headings:** you may reword a section heading so it says what the reader gets ("What counts as a robot" instead of "The standard definition: ISO 8373"), keeping its number and any `id` attribute. Do not rename the References heading.
12. **Code, commands and output blocks** (`<pre>`, `<code>` inside them) stay byte-for-byte; explain them in prose around them instead. Same for tables of numbers.
13. Avoid long run-on sentences joined with semicolons; split them.

## Output
Edit the lesson in place. Then write `docs/handoff/step-69/<lesson>-moved.md`: one line per moved or reworded passage: section | what changed | refs kept (e.g. [3], [8], [9]).
End: "Finish with a summary of at most 10 lines: files changed, anything unresolved, any deviation. Do not paste file contents."
