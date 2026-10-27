# Step 25: draft Chapter 3, "How to Contribute to Open Source"

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` (especially "Direction") and `docs/handoff/robosstics-plan.md` item 1 first. Gerald will rewrite these drafts in his own voice, so keep them clear, accurate and plain rather than polished.

Inputs:
- `research_notes/oss-map/facts.md`: the ONLY facts you may use. Each line: oss | fact | source URL | evidence words.
- `docs/handoff/oss-map-sources.md`: each source URL with its publisher and cached file (`osscache/<name>.txt` in the cache folder given in your prompt). Use the cached file for page titles and exact wording.
- `CONTRIBUTING.md` in this repository: the real contribution steps for robOSStics (for lesson 3.4 only). Cite it as `https://github.com/g34rmeister/g34rmeister.github.io/blob/main/CONTRIBUTING.md`.
- Templates: `robotics-9-2.html` for 3.1 to 3.3, `robotics-9-6.html` for 3.4, `robotics-maintenance.html` for the chapter page. Copy the whole structure (head tags, canonical/og/twitter, color-scheme, skip link, navbar, drawer, breadcrumbs, `data-build-date`, Contents box, numbered `01.` section headings, References list with the `references-note` paragraph, footer nav, HTML5 UP footer credit, scripts). Replace only lesson-specific text, ids and URLs.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read, file write and file edit tools. Do not browse the web.
- Create ONLY the files of your task. Do NOT edit existing files. Do NOT commit.
- Every factual statement carries a citation `<sup><a href="#ref-N">[N]</a></sup>` to a fact in `facts.md` (or, in 3.4, to CONTRIBUTING.md). Teaching sentences that only connect cited facts are fine. Do NOT add facts from memory: no extra numbers, project names, rules, commands, labels, URLs or history beyond the facts and CONTRIBUTING.md.
- Never state the same fact twice. No "For example," without a real example. No filler (fundamental, crucial, seamless, robust, leverage, journey).
- References: one `<li id="ref-N">` per source URL, numbered by first citation. Format: `Publisher, &ldquo;Page title.&rdquo; <a href="URL" target="_blank" rel="noopener noreferrer">short-url</a>.`
- Audience: someone who can program a little, has never contributed to open source, and has just finished Chapters 1 and 2. Short sentences, define each term when it first appears.
- Length: about 900 to 1,400 words of lesson text, 4 to 7 sections plus References, ending with a 3-question "Check your understanding".
- Cross-links: use only these EXACT titles, and only for what the lesson teaches: 1.7 "The Industrial Robot Cell" (`robotics-1-7.html`); 2.4 "Intro to ROS (Vendor-Agnostic)" (`robotics-2-4.html`); 4.1 "Definition and Introduction" (`robotics-4-1.html`, what ROS is); 4.6 "Writing Your First ROS 2 Package" (`robotics-4-6.html`); 4.8 "Moving an Arm with MoveIt 2" (`robotics-4-8.html`); 6.x Control chapter is `robotics-control.html`. The ROS chapter (Chapter 4) comes right after this one; say so where useful. Never write any other lesson title.
- Breadcrumb: Course Home / Chapter 3 · Open Source, linking `robotics-oss.html`.

## Tasks (run in parallel, one file each)
- T-25a: `robotics-3-1.html` "3.1 What Open Source Is": what a license does and why a project without one is not open source; that open-source work is public; the files every project has (README, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE) and what each is for, with the ROS 2 package examples from the facts.
- T-25b: `robotics-3-2.html` "3.2 Your First Contribution": contributions that are not code (with the Steinmacher figure), finding a first issue (the labels and aggregator sites the facts name), the fork / clone / upstream / branch / pull request flow, draft PRs, keeping up to date with upstream, and communication norms (public, context and reproduction steps, comment before you start).
- T-25c: `robotics-3-3.html` "3.3 How Robotics Projects Work": ROS 2 specifics (branches per distribution, rolling first then backport, no breaking changes in a released distribution, DCO sign-off, one approval, squash and merge, the build farm, REP 2004 quality categories), and how MoveIt 2, ros2_control, Gazebo and Nav2 differ (approvals, small PRs, no force-push after review, DCO with `git commit -s`, branch policy, who leads Nav2).
- T-25d: `robotics-3-4.html` "3.4 Lab: Your First Pull Request" based on CONTRIBUTING.md: pick a small real change (a typo, a wording fix, a broken source), make it in the browser (the exact steps in CONTRIBUTING.md), or locally with the four checks, open the pull request using the repository's template, and respond to review. No code blocks except the commands CONTRIBUTING.md lists.
- T-25e: chapter page `robotics-oss.html` (copy `robotics-maintenance.html`) and `research_notes/oss-map/data.json` in the same format as `research_notes/ch9/data.json`: chapter 3, title "How to Contribute to Open Source", url `robotics-oss.html`, nav "Open Source", icon `fa-code-branch`; 4 lessons (ids 3-1..3-4, minutes 12 to 15) with 4 short plain objectives and 5 key terms each, glossary definitions only from facts.md, 8 quiz questions (2 per lesson), each answerable from one fact. Read the lesson topics from this ticket, not from the drafts.

Finish with a summary of at most 5 lines: file written, sections, references, any fact you wanted but could not find.
