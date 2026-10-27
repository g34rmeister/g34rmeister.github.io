# Step 13: Chapter 7 second research pass

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` and `plans/ch7-machine-vision.md` first.

Step 11 lost most facts for 7.2 to 7.5: 20 URLs returned 404 and 25 pages did not contain the quoted words. So this pass has two rounds. Claude fetches and saves every page between them.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only web search, URL reading, file read and file write tools.
- Touch ONLY the output file of your round. Do NOT create lessons. Do NOT commit.
- Never invent a URL. List only URLs that appeared in your search results.

## Round A (T-13a): candidate pages → write ONLY `research_notes/ch7/step-13a.md`
For lessons 7.2 (lighting), 7.3 (image processing), 7.4 (3D sensing) and 7.5 (inspection and measurement), list 10 to 15 URLs each, one per line:

`<lesson> | <URL> | <publisher> | <what the page covers, under 10 words>`

- Prefer pages that are plain HTML documentation, application notes or PDFs: docs.opencv.org tutorials, Edmund Optics knowledge center (edmundoptics.com/knowledge-center), Basler docs (docs.baslerweb.com), Teledyne, Zivid docs (support.zivid.com), Point Cloud Library (pointclouds.org), ROS docs, A3 (automate.org), university course pages, GS1 for barcodes.
- Avoid keyence.com and cognex.com (they block automated reading).
- Each URL must be a specific article, not a home page or search page.

Finish with a summary of at most 3 lines.

## Round B (T-13b): facts from saved pages → write ONLY `research_notes/ch7/step-13b.md`
Input: `docs/handoff/step-13-pages.md` lists, per lesson, each page Claude saved and its cached file (`ch7cache/<name>.txt` inside the cache folder given in your prompt). READ THE CACHED FILE, not the live page. Use only facts stated in those files.

For each of 7.2, 7.3, 7.4 and 7.5, write 12 to 18 facts a beginner lesson needs (how it works, why, typical values, trade-offs), one per line:

`<lesson> | <the fact in one plain sentence> | <URL from the SOURCE URL line of the file> | <3 to 5 words or numbers copied exactly from the file, separated by ", ">`

- The evidence words must appear in that file exactly (spelling, numbers, units, hyphens). Claude's checker searches the same file.
- Use at least 3 different files per lesson. One fact per line.
- Do not add anything the file does not say.

Finish with a summary of at most 3 lines.
