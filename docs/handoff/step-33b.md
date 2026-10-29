# Step 33b: revise robotics-3-5.html (Nav2 case study)

You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Edit ONLY `robotics-3-5.html` (and `research_notes/nav2/data.json` if a key term or quiz answer no longer appears in the revised text). Sources: `research_notes/nav2/facts.md` and `research_notes/nav2/cache/` only.

Problems found in review; fix all of them:

1. Copied wording. Most sentences copy the source text word for word without quotation marks, including the projects' "we" ("we use", "we create", "we chat"). Rewrite every sentence in your own plain, short words for a robotics newcomer. No run of 9 or more consecutive words may match the sources unless it is inside quotation marks as a direct quote; keep direct quotes only in section 04 (the LICENSE and CONTRIBUTING wording), at most 4 quotes in the whole lesson. Never write "we" for the Nav2 project; write "the project" or "Nav2".
2. Remove these unsupported sentences (no fact supports them):
   - "This active leadership gives the navigation stack long-term engineering maintenance and development."
   - "Keeping documentation separate allows contributors to fix text and update tutorials without building the C++ navigation code." (keep only that the docs live in their own repository, docs.nav2.org)
   - "Newcomers can attend the Nav2 working group meeting to introduce themselves and see ongoing work." (the source only says the meeting date and time are on the working group calendar)
   - "Improving an unclear explanation, correcting a typo, or updating outdated information in the documentation site is an ideal first contribution." (the source says: if documentation must be updated because of your changes, include it in your pull request; and that reporting bugs is a valuable contribution; say only that)
3. Supported and may stay (reword them): claiming a ticket by commenting on it, ideally with a strategy and timeline; filling out the PR template completely; 1-2 reviewers; `git commit -s -m "..."` adds the sign-off; plugin examples voxel layer, DWB and Smac (they are in plugins.txt).
4. Fix grammar copied from sources: "it's own" -> "its own"; "The goal of recoveries are" -> rephrase.
5. Keep section structure, citations (`<sup><a href="#ref-N">[N]</a></sup>`, numbered by first use), the fact-ID HTML comments, exactly one `<h1>`, balanced tags. Target 800-1,100 words of prose.

Finish with at most 4 lines. Do not claim you verified anything.
