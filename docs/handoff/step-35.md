# Step 35: find uncited factual claims (report only)

Branch: `main`. Read `CLAUDE.md` first ("Still strict: every claim traces to a checked source"). You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit any lesson or data file. Write ONLY the report file named in your prompt.

Read every lesson in your chapter range completely (`robotics-<chapter>-<n>.html`). Inside `.robotics-article-body`, before the References section, find sentences that state a checkable fact but have NO citation (no `<sup><a href="#ref-N">` in the same sentence or at the end of the same paragraph sentence group).

Checkable facts: numbers with units, dates and years, percentages, prices, named products or standards with a property ("ISO 10218-1 requires ..."), version or release names, "first"/"largest"/"most" claims, historical events, quotes attributed to a person or organisation, and statements of what a specific vendor's product does.

Not facts for this audit (skip them): definitions in the course's own words, instructions to the reader ("Run this command"), worked arithmetic from numbers already given, cross-references to other lessons, sentences inside code blocks, quiz/"Check your understanding" questions, figure captions, widget fallback notes, and general statements of common engineering knowledge without a specific number or name.

For each finding, one line:
`<lesson> | <section heading> | "<the sentence, copied exactly from the page text without HTML, max 45 words>" | kind: <number/date/name/first-claim/quote/vendor/standard/other> | why it needs a source: <short>`

The sentence must be copied exactly (it will be searched for by a script). Do not include sentences that already have a citation. If a lesson has no findings, write nothing for it. End the file with: `Checked lessons: <list>`.

Do not claim you verified anything beyond reading the files.
