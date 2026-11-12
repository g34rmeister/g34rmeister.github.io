# Design review, 2026-11-11

Reviewed by Claude from browser screenshots of the hub, a chapter page, lessons (top, code, end), the quiz, the glossary and the Open-Source Map, at 1440, 1280 and 375 px, in light and dark. Measurements were taken in Chromium through Playwright. The Wikipedia-style theme is kept; nothing here changes it.

## What was already sound
- One reading column of 680 px, a sticky contents panel from 1200 px, a fixed bottom bar below that.
- Light and dark themes pass axe (WCAG 2.2 AA plus best practices) on every page type tested.
- No horizontal overflow at 375 px on any page tested.
- Quiz, glossary and chapter pages share the lesson layout, so the site reads as one thing.

## Fixed in this PR

| # | Finding | Change |
|---|---|---|
| 1 | Hub chapter list ran edge to edge (stray `.` in `robotics.css` dropped the container rule). | Removed; browser test added (PR #26, included here). |
| 2 | Body text was 15 px, about 92 characters per line in the 680 px column. Comfortable reading is usually put at 60 to 85. | Article text is 16 px (about 85 characters per line); callout text 15 px. |
| 3 | An inline command that wrapped was cut open: the box had no border where the line broke. | `box-decoration-break: clone`, so each part keeps its box. |
| 4 | Lab lessons have 225 code blocks and no way to copy from them; terminal blocks mix `$ commands` with output. | A copy button on every code block. For a terminal block it copies only the commands, without the `$`. Hidden until hover or focus with a mouse; always shown on touch screens. |
| 5 | Breadcrumbs: the first link was underlined and the others were not. | All breadcrumb links underline on hover and focus only. |
| 6 | Phone lesson header repeated Previous and Next, which the bottom bar already has. | Below 1200 px the header keeps only "Chapter N, lesson i of m". |
| 7 | Phone hub: three tall start cards pushed the chapter list about three screens down. | On phones the cards drop their description line and tighten their padding. |
| 8 | Glossary "See lesson N" links were 13 px inside 15 px text. | They inherit the text size. |
| 9 | The chapter plan box had an empty line under its list. | Last list item has no extra margin. |
| 10 | Stale text: Chapter 10's plan box still said a Nav2 lab "is planned but not published yet"; Chapter 4's page did not mention lesson 4.10. | Both updated. |

## Recommended, not done (each needs a decision or more than CSS)

1. **Page weight.** Every course page loads `fontawesome-all.min.css` (59 KB plus its font files) for about 20 icons, `main.css` (60 KB, the portfolio theme) and, on lessons, `course-data.js` (104 KB) and `glossary-data.js` (96 KB). Options: an icon subset or inline SVG; load glossary data on first tooltip; split course data per chapter. Expected saving: roughly 250 KB per first visit. Needs care because `site_sync.py` hashes these files.
2. **Phone navbar.** The top bar scrolls away on phones (it is sticky from tablet width up). With the bottom bar this is defensible, but the search box is then only reachable by scrolling up. A search button in the bottom bar would fix that.
3. **Wide screens.** At 1280 px and up, about 300 px to the right of the column is empty. Candidates: the chapter's lesson list (item 3 of the 2026-11-10 mockups, still waiting for a yes) or key terms for the section in view.
4. **Code blocks.** Commands and their output share one grey box. Styling prompt lines differently (or splitting command and output) would make labs easier to scan. This means touching 225 blocks or adding a small parser, so it was left.
5. **Glossary.** 548 terms in one list with a filter box. A letter index (A to Z jump links) would help browsing on phones.
6. **Hub.** A returning reader sees "Continue" but the three start cards disappear after the first completed lesson; the open-source track is then only in the quick links. A persistent, small "Tracks" line would keep it findable.
7. **Reading progress.** Item 5 of the 2026-11-10 mockups (a progress bar) is still open.

## How to re-run
`npm install playwright@1.56.0 @axe-core/playwright` in a scratch folder with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, then `NODE_PATH=<folder>/node_modules AXE_PATH=<folder>/node_modules/axe-core/axe.min.js node scripts/test_playwright.js` and `node scripts/test_widgets.js "$PWD" <output folder>`.
