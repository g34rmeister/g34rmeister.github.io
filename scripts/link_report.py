#!/usr/bin/env python3
"""Compare two snapshots of docs/sources.json and list links that newly stopped working.

Used by .github/workflows/link-check.yml: it copies sources.json, runs
`sources.py links --all` (which rewrites the HTTP status of every cited URL), and then
runs this script to print a Markdown report. Only links that loaded before (HTTP < 400)
and now fail (HTTP >= 400 or no answer) are reported; bot walls (403/429, or a detected
bot challenge) are not counted, because they say nothing about whether the page exists.

Usage: python3 scripts/link_report.py OLD_sources.json NEW_sources.json > report.md
Exit code 0 always; an empty report (no lines after the header) means nothing broke.
"""
import json
import sys

BOT_WALL = {403, 429}


def ok(entry):
    code = entry.get('http')
    return isinstance(code, int) and 0 < code < 400


def broken(entry):
    code = entry.get('http')
    if entry.get('blocked') or code in BOT_WALL:
        return False
    return code is not None and (code == 0 or code >= 400)


def main():
    old = json.load(open(sys.argv[1], encoding='utf-8'))['sources']
    new = json.load(open(sys.argv[2], encoding='utf-8'))['sources']
    rows = []
    for url, entry in sorted(new.items()):
        before = old.get(url, {})
        if ok(before) and broken(entry):
            lessons = sorted({c.split('#')[0] for c in entry.get('citedBy', [])})
            rows.append((url, before.get('http'), entry.get('http'), ', '.join(lessons)))
    print('<!-- robosstics-link-check -->')
    print('### Cited links that stopped working')
    print()
    if not rows:
        print('None this week.')
        return
    print('Each link below loaded at the last check and fails now. Fix the reference (new URL, archived copy, '
          'or a replacement source checked with `scripts/fetch_text.py`) and record it with `sources.py import`.')
    print()
    print('| Lessons | Link | Before | Now |')
    print('|---|---|---|---|')
    for url, b, n, lessons in rows:
        print(f'| {lessons} | {url} | {b} | {n} |')


if __name__ == '__main__':
    main()
