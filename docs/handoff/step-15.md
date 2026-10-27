# Step 15: Chapter 7 data, glossary, quiz and chapter page

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` first. The six lessons `robotics-7-1.html` to `robotics-7-6.html` are written and checked. Do NOT edit them.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read, file write and file edit tools.
- Write ONLY the two files below. Do NOT edit `assets/js/course-data.js`, `assets/js/glossary-data.js`, `scripts/site_manifest.json` or any lesson; Claude merges your JSON. Do NOT commit.
- Everything must come from the six lesson pages. No new facts.

## T-15a, file 1: `research_notes/ch7/data.json`
Valid JSON with exactly these keys (look at `assets/js/course-data.js` chapter 6 and lesson 2-8, `scripts/site_manifest.json` and `assets/js/glossary-data.js` for the style):

```
{
  "chapter": {"id": 7, "title": "Machine Vision", "url": "robotics-vision.html",
              "prerequisites": "...", "handsOn": "...", "summary": "...",
              "lessons": [{"id": "7-1", "minutes": <int>, "title": "Industrial Cameras and Optics",
                           "objectives": ["...", "...", "..."], "keyTerms": ["...", "..."]}, ...]},
  "manifest": {"nav": "Vision", "icon": "fa-eye", "blurbs": {"7-1": "<one line>", ...}},
  "glossary": {"<key term>": "<one-sentence definition>", ...},
  "quiz": [{"lesson": "7-1", "question": "...", "choices": ["...", "...", "...", "..."], "answer": <0-3>, "explanation": "..."}, ...]
}
```

- Lesson titles: 7-1 "Industrial Cameras and Optics", 7-2 "Lighting for Machine Vision", 7-3 "Image Processing Basics", 7-4 "3D Sensing", 7-5 "Inspection and Measurement", 7-6 "Lab: A ROS 2 Camera Pipeline".
- minutes: estimate reading time at about 150 words per minute of lesson text.
- 3 to 4 objectives per lesson, each starting with a verb, each taught in the lesson.
- 4 to 7 keyTerms per lesson; every key term must appear in that lesson's text. Give a glossary definition for every key term that is not already a key in `assets/js/glossary-data.js` (check it), matching that file's style.
- quiz: 2 questions per lesson (12 total). Exactly one correct choice, answerable from the lesson alone; the explanation must paraphrase a sentence in the lesson. Avoid "all of the above".

## T-15a, file 2: `robotics-vision.html`
The Chapter 7 overview page. Copy the structure of `robotics-capstone.html` exactly (head tags, navbar, drawer, skip link, `data-build-date`, footer credit, scripts, the "Articles in this chapter" list container and footer nav). Replace only chapter text: title "Chapter 7: Machine Vision", a short introduction (2 to 3 paragraphs drawn from the lessons) and the chapter's place in the course (after Chapter 6, builds on 2.8). Leave the lesson list and footer nav in the same form; Claude's sync script regenerates them.

Finish with a summary of at most 4 lines. Do not paste file contents.
