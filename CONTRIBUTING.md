# Contributing to robOSStics

Welcome to robOSStics! This repository hosts the static website at `github.com/g34rmeister/g34rmeister.github.io`. The site provides an open-source learning platform for robotics newcomers. It has no build step.

We want this repository to be a friendly, safe place to make your first pull request. Every improvement helps, whether you fix a single typo or suggest a new lesson.

## Easy Ways to Start

You do not need to be an expert in robotics to contribute. Here are three easy ways to make a first contribution:

1. **Fix a typo:** If you spot a spelling mistake, grammatical error, or confusing sentence, let us know or submit an edit. Clear wording helps every learner.
2. **Suggest or fix a source:** Every factual claim on this site must trace back to a verified source. If you see a missing citation, an outdated link, or a better manual, you can suggest it.
3. **Report a broken link:** Documentation links move or disappear over time. If a reference link leads to a 404 error, reporting it helps keep lessons working.

If you want to take on a larger contribution:

- **Propose a lesson idea:** Have an idea for a robotics topic or a hands-on lab? Please open an issue first. We can discuss the outline, scope, and sources together before you write code or text.

## Editing in Your Browser

You do not need to install Git or Python to fix typos or wording. You can do everything in your web browser:

1. Visit `https://github.com/g34rmeister/g34rmeister.github.io`.
2. Find the file you want to edit. Lesson pages are in the root directory and look like `robotics-1-1.html`.
3. Click the pencil icon near the top right of the file preview to open the editor.
4. Edit the text in your browser.
5. Scroll down to the **Propose changes** section at the bottom of the page.
6. Write a short title and a one-sentence summary explaining what you changed.
7. Click **Propose changes**, then click **Create pull request**.

Maintainers will review your pull request, answer questions, and help you merge it.

A bot comment appears on your pull request a moment after you open it. It lists which lessons or pages you changed and what a reviewer will check. It is a fixed script (`scripts/pr_explain.py`), not an AI, and it updates the comment when you push more commits.

## Working Locally

If you want to make larger changes or test files on your machine, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/g34rmeister/g34rmeister.github.io.git
   cd g34rmeister.github.io
   ```
2. Open the project in your text editor. Because this is a static site with no build step, you can open any HTML file directly in your web browser to see your changes.
3. If you add or edit citations in a lesson file, renumber the references in order of appearance:
   ```bash
   python3 scripts/renumber_refs.py robotics-X-Y.html
   ```
4. If you change a lesson or update sources, regenerate synced files:
   ```bash
   python3 scripts/sources.py sync && python3 scripts/build_index.py && python3 scripts/site_sync.py
   ```
5. Run the four checks from `CLAUDE.md` to ensure everything passes:
   ```bash
   python3 scripts/site_sync.py --check && python3 scripts/check_site.py && python3 scripts/sources.py check && python3 scripts/build_index.py --check
   ```

## The Source Rule

Accuracy is central to this project. Every factual claim must trace to a checked source. We use two files to manage this:

- `docs/sources.json` stores every cited source along with its verification status and per-lesson claim checks.
- `scripts/sources.py` inspects and updates citation records.

When pull requests run, `python3 scripts/sources.py check` ensures that no cited reference is unverified. If you add a new citation or claim, it must be recorded in `docs/sources.json`.

If you are new to the source checking script, do not worry. You can open an issue or pull request with your suggested source URL. Maintainers will check the claims, run the script, and update `docs/sources.json` for you.

## What Not to Do

To keep the site reliable for readers and search engines, please follow these rules:

- **Do not renumber lessons:** URLs must stay stable so existing links do not break. Append new lessons to the end of a chapter instead.
- **Do not hand-edit generated regions:** Several files and page sections are built automatically by `python3 scripts/site_sync.py`. Never edit these parts by hand:
  - `sitemap.xml`
  - Lesson rows on the course hub (`robotics.html`)
  - The chapter list
  - Previous and next lesson navigation links
  - Navigation bars
  - The page set in `site-hygiene.yml`
  - The source-check line in each lesson

Instead, update the underlying data or templates and run `python3 scripts/site_sync.py` to regenerate them.

## Where to Ask Questions

If you get stuck, run into an error, or want feedback before starting, please open an issue:

`https://github.com/g34rmeister/g34rmeister.github.io/issues`

You do not need to select issue labels. Maintainers will label it, answer questions, and help you with your contribution.
