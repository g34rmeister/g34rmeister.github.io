"""Check a Gemini research-notes file: do the quotes really appear at the cited URLs?

  python3 scripts/verify_notes.py research_notes/<topic>/<lesson>.md

Claim lines use `claim | URL or book:... | "quote" | fetched|unreachable|from-memory`.
For each `fetched` line with a URL, the page is read with fetch_text.py and the quote must
appear in it (case, spacing and punctuation differences ignored). Lines that are malformed,
marked from-memory, or whose quote is missing are listed. Exit 1 if any problem is found,
so a miss means the file goes back to Gemini (see docs/agentic-workflow.md).
"""
from pathlib import Path
import re
import subprocess
import sys

FETCH = Path(__file__).resolve().parent / "fetch_text.py"
STATUSES = {"fetched", "unreachable", "from-memory"}


def norm(text):
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def fetch(url, cache):
    if url not in cache:
        run = subprocess.run([sys.executable, str(FETCH), url, "--max", "400000"],
                             capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=120)
        cache[url] = norm(run.stdout) if run.returncode == 0 else None
    return cache[url]


def main(path):
    problems, cache, checked = [], {}, 0
    for n, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        parts = [p.strip() for p in line.strip().lstrip("-* ").split("|")]
        if len(parts) != 4 or parts[3].lower() not in STATUSES:
            continue
        claim, source, quote, status = parts[0], parts[1], parts[2].strip('"“” '), parts[3].lower()
        if status == "from-memory":
            problems.append(f"line {n}: from-memory, not allowed on a page until Claude checks it: {claim[:70]}")
        elif status == "fetched":
            if not source.startswith("http"):
                continue
            if len(quote.split()) > 25:
                problems.append(f"line {n}: quote longer than 25 words")
            page = fetch(source, cache)
            checked += 1
            if page is None:
                problems.append(f"line {n}: could not fetch {source}")
            elif norm(quote) not in page:
                problems.append(f"line {n}: quote NOT found at {source}: \"{quote[:70]}\"")
    print(f"{checked} fetched quotes checked, {len(problems)} problem(s)")
    for p in problems:
        print("  " + p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]) if len(sys.argv) == 2 else print(__doc__) or 2)
