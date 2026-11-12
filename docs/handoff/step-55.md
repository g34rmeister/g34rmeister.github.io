# Step 55: lesson summaries and chapter card descriptions (data only)

Branch: `writing-polish-3`. Read `CLAUDE.md` first ("Direction": the site is for robotics newcomers). You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit `scripts/site_manifest.json`, any page, data file or script. Write ONLY `docs/handoff/step-55-rewrites.json`.

`docs/handoff/step-55-candidates.json` lists one-line lesson summaries (`kind: "blurb"`, shown under the lesson title on chapter pages and the course hub) and chapter card descriptions (`kind: "featuredDesc"`) that a script flagged as long (over 24 words) or stiff. For a blurb, open `robotics-<lesson>.html` and read its "In this lesson you will" objectives so the summary matches what the lesson covers.

Rewrite each `text` so a newcomer can tell in one glance what the lesson is about:
- One sentence or sentence fragment, at most 24 words, in the same form as the other summaries ("How ...", "What ...", "Why ...", or a noun phrase). Keep any HTML tags exactly.
- Everyday words: "works with any vendor" not "vendor-agnostic"; "use" not "utilize"; "through" not "via".
- Keep every technical name, product name, acronym, standard number and number exactly as written.
- Same scope. Add no topics, facts or claims. If the original lists more topics than fit in 24 words, keep the list and shorten the words around it; never drop a topic.
- No em dashes, no semicolons, no "you will", American spelling.
- If an entry is already clear, leave it out.

Output: a JSON list `[{"id": "b:1-6", "text": "new summary"}, ...]` with only the entries you changed, nothing else in the file.

Finish with one line: how many you rewrote and how many you left alone. Do not claim you verified anything.
