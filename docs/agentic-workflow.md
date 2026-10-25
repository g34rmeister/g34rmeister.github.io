# Agentic workflow (plan, Gemini drafts, checks, Claude reviews)

Same loop as the hackathon `/gd` skill: Claude plans and judges, Gemini (via Antigravity) does the bulk writing, scripts and CI verify, Claude reviews before merge. Goal: spend few Claude tokens on volume work.

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
