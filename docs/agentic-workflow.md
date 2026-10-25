# Agentic workflow (plan, Gemini drafts, checks, Claude reviews)

Same loop as the hackathon `/gd` skill: Claude plans and judges, Gemini (via Antigravity) does the bulk writing, scripts and CI verify, Claude reviews before merge. Goal: spend few Claude tokens on volume work.

Reference: the hackathon repo (CrawfishChowder/GDSCHackathon) ran this with `AGENTS.md` (pointer to CLAUDE.md), `docs/handoff/step-N.md` tickets, and `agy -p ... --mode accept-edits`. Its conventions are folded in below.

## 0. Hackathon conventions carried over
- Tickets live in `docs/handoff/step-N.md`: branch name, "read CLAUDE.md first", a shared rules block, then tasks T-Na, T-Nb with an explicit file list each. Parallel Gemini agents touch ONLY their listed files, so tasks never collide.
- Gemini cannot run shell commands headless. It does not run checks, commit, or create generated files (`site_sync.py` output, `docs/lessons-index.md`). Claude runs the gate and commits.
- Every ticket ends: "Finish with a summary of at most 10 lines: files changed, anything unresolved, any deviation. Do not paste file contents."
- Existing code and content win: Gemini makes small guarded additions, never restructures finished lessons.
- `AGENTS.md` at repo root: one line pointing to CLAUDE.md and `docs/agentic-workflow.md`.

## 1. Plan (Claude)
- Restate the goal in one line. Pick lessons/files from `docs/lessons-index.md`, not by reading pages.
- Write one self-contained task per lesson or small group: files touched, what to produce, constraints, checkable acceptance criteria.
- Large briefs live in the project folder (`plans/antigravity-brief-part-b.md` is the model). Brief template: audience, hard rules, conventions, citation allowlist, lesson template, order of work.

## 2. Draft (Gemini via Antigravity)
- One `use_antigravity` call per independent task, started in parallel. `add_dirs` only what the task needs.
- `mode: accept-edits` for page work, `plan` for read-only analysis. `gemini-3.8-flash-high` default; `-medium`/`-low` for mechanical edits.
- Long output: `write_to_file`. Every prompt ends: "Finish with a summary of at most 10 lines: files changed, commands run, test results, anything unresolved. Do not paste file contents."
- Gemini works on a branch, one PR per chapter pair or smaller, and follows CLAUDE.md. It never marks sources verified in `docs/sources.json`.
- Gemini rules that come from past problems: no invented refs, stats, URLs or quotes (unsure claims get a `TODO-VERIFY` HTML comment); every numeric example has a `scripts/checks/<lesson>.py` whose output matches the page.

## 3. Mechanical gate (scripts, no tokens)
Must pass before Claude looks at a PR:
`python3 scripts/site_sync.py --check && python3 scripts/check_site.py && python3 scripts/sources.py check && python3 scripts/build_index.py --check`
plus the CI workflows `site-hygiene.yml` and `site-sync.yml`, and the lesson's check script.

## 4. Review (Claude)
- Start from Gemini's summary, then `git diff --stat`; read diffs only for lessons that matter.
- Citations: `python3 scripts/sources.py report <lesson>`, `python3 scripts/ref_claims.py <lesson>`, `python3 scripts/fetch_text.py URL --grep word`. Record results with `sources.py import`, then `sources.py sync && build_index.py`.
- Spot-check math/numbers against the check script, theming, one h1, quiz data (`version` bumped).
- At most 2 fix rounds via `antigravity_continue` with what failed and where; then Claude fixes small things or reports the blocker.
- Never accept "done" on Gemini's word alone.

## 5. Merge and record
- CHANGELOG.agents.md entry in every PR. Squash-merge once CI is green and Gerald has approved.
- Gerald approves chapter boundaries (Part B: stop after Ch7 for review before Ch8).

## Token rules
Prefer changelog, CLAUDE.md, `docs/` and `reports/` over re-reading pages. No Claude subagents. Claude citation checks use Sonnet.

## Research protocol for Gemini
Gemini's weak spot is citations: PR #8 shipped invented references (made-up ABB/FANUC documents, URL-less entries, thin Ch5 coverage) and PR #9 had to re-source it. Research tickets therefore make Gemini a collector of verifiable evidence, never a writer of references.

Rules in every research ticket:
1. **Fetch before cite.** Read each source with `python3 scripts/fetch_text.py URL --grep word` (or the allowlist book chapter). If it cannot be fetched, it goes in an "unreachable" list, not the notes as fact.
2. **Evidence format.** Write notes to `research_notes/<topic>/<lesson>.md`. Every claim is one line: claim | source URL (or `book:Author Year, ch./section`) | verbatim quote of at most 25 words | `fetched` / `unreachable` / `from-memory`. `from-memory` claims may not go on a page until Claude checks them.
3. **No guessing.** No invented URLs, DOIs, page numbers, statistics or quotes. Unknown means a `TODO-VERIFY` line. Prefer primary and official sources (standards bodies, vendor manuals, IFR, ROS/MoveIt docs, the allowlist books); no blogs or AI summaries.
4. **Two sources for numbers.** Any statistic, date or specification needs two independent sources or an explicit "single-source" flag.
5. **Gaps are findings.** The notes end with "Could not verify" and "Conflicts between sources".
6. **Reference candidates only.** Gemini proposes refs in the lesson's References list with URLs it actually fetched; it does not touch `docs/sources.json` verification status.

Claude's review of research output (cheap, targeted):
- Run `python3 scripts/sources.py links` for dead URLs, then `sources.py report <lesson>`.
- Spot-check about 3 `fetched` quotes per file with `fetch_text.py --grep`; any miss means distrust the file and send it back (max 2 rounds).
- Resolve every `from-memory` and `TODO-VERIFY` line, then record checks with `sources.py import`.
- Claude uses Sonnet for bulk checking, per the token rules.

Prompt block to paste into research tickets:
> You are collecting evidence, not writing prose. Fetch every source with `python3 scripts/fetch_text.py URL --grep word` before citing it. Output one line per claim: claim | URL or book:chapter | verbatim quote (25 words max) | fetched/unreachable/from-memory. Never invent URLs, quotes, numbers or document titles. Numbers need two sources. End with "Could not verify" and "Conflicts". Finish with a summary of at most 10 lines.
