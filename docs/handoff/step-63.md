# Step 63: make Chapter 1 newcomer-friendly (add on-ramps, never cut)

Branch: `ch1-newbie`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers, slightly less academic). You cannot run shell commands. Do not try. Use only file read, file edit and file write tools. Do not browse the web. Do NOT commit.

The prompt gives you ONE lesson id `1-N`. You may edit ONLY `robotics-1-N.html`. Do not touch any other file (no CSS, JS, data, scripts, other lessons). Another agent edits the other lessons at the same time.

## Reader
A complete newcomer opening the course for the first time: a first-year student, hobbyist or career changer, often reading in a second language, with school algebra and no robotics, engineering or programming. Today Chapter 1 reads like a reference text for people who already know the field. Make it a friendly first chapter. The content stays; you add the on-ramps that help a beginner through it.

## Inputs
1. `docs/handoff/step-63-findings.json`, key `lessons["1-N"]`: an audit of this lesson with `start_here` (draft box text), `optional_sections` and `findings` (kinds `jargon`, `too-advanced`, `wall`, `no-why`, `needs-example`, `order`, `formula`; each with an HTML `line`, an exact `quote` and a `proposal`). Findings are suggestions. Use your judgment, but address every finding of kind `jargon`, `formula` and `wall` unless it is marked `"safety": true`.
2. The lesson page itself. Its text has been source-checked. It is your ONLY source of facts.
3. `assets/js/glossary-data.js`: checked plain-language definitions. You may use a definition from here to explain a term at its first use on the page.
4. `docs/lessons-index.md` (read only the chapter you need) to name the later lesson that covers a topic in depth.

## What to add (markup is fixed, copy it exactly)
1. **Start here box**, once, as the first element inside `<article class="robotics-article-body">`, before the first `<h2>`:
   ```html
   <div class="article-callout start-here">
       <div class="article-callout-header"><i class="fas fa-flag" aria-hidden="true"></i> Start here</div>
       <p>3 to 5 short sentences: what this lesson is about, why it matters to a beginner, and what is safe to skim on first reading.</p>
       <ul>
           <li>2 to 4 bullets: "You will learn ..." in plain words, taken from the lesson's objectives and sections.</li>
       </ul>
   </div>
   ```
2. **Optional note**, directly after the `<h2>` of each section in `optional_sections` and no others (Claude curated that list):
   ```html
   <p class="optional-note"><i class="fas fa-route" aria-hidden="true"></i> <strong>Optional on first reading.</strong> One or two sentences: what the section adds, and where it comes back, with a link such as <a href="robotics-6-10.html">lesson 6.10</a>.</p>
   ```
   Only name a later lesson if `docs/lessons-index.md` shows that lesson really covers the topic. Do not change the `<h2>` itself.
3. **In plain words**, after a hard definition, formula or dense passage (at most 4 per lesson):
   ```html
   <p class="plain-words"><strong>In plain words:</strong> the same idea again, in everyday words, often with an everyday comparison.</p>
   ```
   For a formula, say what each symbol stands for and walk through it in words, using only numbers that already appear on the page.
4. **Inline help** for jargon at its first use on the page: a short parenthetical or a following clause, e.g. `actuator (the motor or other part that makes the robot move)`. Use the glossary definition or the page's own later explanation. Do not add tooltips or links for glossary terms (a script does that).
5. **Walls**: split a long paragraph into two or three `<p>` paragraphs, or add a short lead sentence that says what the paragraph is about. Keep every word of the original sentences, citation marks included.
6. **Why it matters / examples**: where a finding says `no-why` or `needs-example`, add one sentence on why the topic matters to a beginner, or one everyday comparison (a thermostat, a recipe, a washing machine), inside the existing paragraph or as a `plain-words` box.

## Hard rules
- **No new facts.** Every name, number, date, company, product, standard, statistic or technical claim in your new text must already appear on this page. Comparisons to everyday things are allowed only as comparisons ("like a thermostat"), never as claims about robots. When in doubt, leave it out.
- **Never cut.** Do not delete or shorten any existing sentence, list item, figure, widget, table, citation, heading or reference. Do not reorder sections. You may only add text, add paragraph breaks, and add the inline help from rule 4. The article must end up longer than it was.
- **Citations.** Your new text gets no `<sup>` citation marks. Never move, renumber or edit existing `<sup><a href="#ref-N">` marks or the References list.
- **Safety text stays exact.** Do not edit, split or annotate any passage about enabling devices, lockout/tagout, teach speed, safeguarding, light curtains, safety distances, ISO 10218, ISO 13855, ISO/TS 15066 or collaborative operation modes, and do not add plain-words boxes next to them. Leave safety findings alone; Claude handles them.
- **Style.** Full sentences with articles. No sentence over 25 words in your new text. Everyday words ("use" not "utilize", "lets" not "enables", "about" not "approximately", "through" not "via"). No em dashes, no semicolons joining sentences, no exclamation marks, no "simply", "just", "obviously", "easy". Speak to the reader as "you". American spelling.
- **HTML.** Valid HTML, same indentation as the surrounding lines, HTML entities where the page already uses them (`&rsquo;`, `&ldquo;`). Keep exactly one `<h1>`. Do not touch the `<head>`, navigation, footer, scripts or anything outside `<article>`.
- Do not touch the "Check your understanding", "Key points" or References sections.

Finish with a summary of at most 10 lines: the file changed, how many of each element you added, which findings you skipped and why, any deviation. Do not paste file contents.
