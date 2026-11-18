# Step 64: split dense sentences (pure rewrite, never shorter)

Branch: `ch1-newbie`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not try. Use only file read and file edit tools. Do not browse the web. Do NOT commit.

The prompt gives you ONE lesson id `X-Y`. You may edit ONLY `robotics-X-Y.html`, and only inside `<article class="robotics-article-body">`. Other agents edit other files at the same time.

An audit (`docs/audit-2026-11-17.md`) found that this lesson has many sentences over 30 words. Newcomers, often reading in a second language, have to read them twice. Your job: find every sentence in the article's paragraphs and list items that is over 30 words (count them), and rewrite it as two or three shorter sentences.

## How
- Keep every fact, name, number, unit, qualifier ("usually", "about", "in most cases"), example and list item. Check word by word before you move on. The rewrite of a sentence must be at least as long as the original (more words is fine: you need subjects and verbs for the new sentences).
- Put the main idea first. Use full sentences with their articles. Split at "which", "while", "whereas", ", and", ";" and long parenthetical asides.
- Citation marks `<sup><a href="#ref-N">[N]</a></sup>` stay attached to the words they support. If a sentence with a citation mark becomes two sentences, put the mark at the end of the sentence that holds the cited claim; if both halves carry the claim, put the same mark after each half (copy it exactly). Never change a ref number, never add a new ref, never touch the References list.
- Keep inline markup (`<code>`, `<em>`, `<strong>`, links, entities like `&rsquo;`) exactly as it was.
- Do not touch: headings, figures, tables, code blocks, widgets (`data-widget`), "Try it" boxes, the "Check your understanding" and "Key points" sections, quotations in quote marks (a quote stays word for word), and anything outside the article.
- **Safety text stays exact.** Skip every sentence about safety requirements, hazards, risk assessment, safeguarding, safety distances, enabling devices, lockout/tagout, force or speed limits for people, standards clauses (ISO 10218, ISO 13849, ISO 13855, ISO/TS 15066, IEC 61508, IEC 62061) and law or regulation. Leave those sentences exactly as they are, even if long.
- Style: everyday words ("use" not "utilize", "lets" not "enables", "about" not "approximately", "through" not "via"). No em dashes, no semicolons joining sentences. American spelling.
- If a long sentence is a list of items, you may turn it into a short lead sentence and keep the list in one sentence; do not drop items.

Finish with a summary of at most 10 lines: the file changed, how many long sentences you found, how many you split, how many you skipped as safety text or quotes. Do not paste file contents.
