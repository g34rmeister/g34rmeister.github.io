# Step 23: contribution files for robOSStics

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` (especially "Direction", "Rules", "Checks") and `docs/handoff/robosstics-plan.md` item 2 first.

The site is becoming an open-source platform for robotics newcomers. The repository itself should be the safest place for a newcomer to make a first real contribution. Write the files that make that easy.

## Rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only file read and file write tools. Do not browse the web.
- Create ONLY the files listed below. Do NOT edit any existing file. Do NOT commit.
- Describe only the workflow that really exists in this repository: the commands, scripts and rules named in `CLAUDE.md`. Never invent a command, script, label, file or policy. If something does not exist yet (for example issue labels), say "maintainers will label it" rather than naming one.
- The repository is `github.com/g34rmeister/g34rmeister.github.io`; the site is a static GitHub Pages site with no build step.
- Plain, friendly English for someone who has never opened a pull request. Short sentences. No filler (fundamental, crucial, seamless, robust, leverage).

## Files
1. `CONTRIBUTING.md`: welcome; three easy first contributions (fix a typo, suggest or fix a source, report a broken link) and one bigger one (propose a lesson idea); how to edit a page on GitHub in the browser; how to work locally (clone, edit, run the four checks from CLAUDE.md with `python3`); the source rule (every fact needs a checked source; how `docs/sources.json` and `scripts/sources.py` are used, in plain words); what not to do (no renumbering lessons, no hand-editing generated regions: list them as CLAUDE.md does); where to ask questions (open an issue). About 500 to 800 words.
2. `.github/pull_request_template.md`: short checklist: what changed and why, which lesson(s), sources added and checked, the four checks run, changelog entry for larger changes.
3. `.github/ISSUE_TEMPLATE/typo.md`, `.github/ISSUE_TEMPLATE/broken-source.md`, `.github/ISSUE_TEMPLATE/content-idea.md`: GitHub issue templates with YAML front matter (`name`, `about`, `title`, `labels: []`) and a few prompts each. For broken-source: lesson, reference number, what is wrong (dead link, page says something else), a replacement source if known.
4. `.github/ISSUE_TEMPLATE/config.yml`: `blank_issues_enabled: true`.

Finish with a summary of at most 4 lines: files written, anything in the brief you could not ground in CLAUDE.md.
