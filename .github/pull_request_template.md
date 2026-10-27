## Summary

What changed and why:

Which lesson(s) or page(s) were touched:

## Checklist

- [ ] Every factual claim traces to a source in `docs/sources.json` (or none was added)
- [ ] If citations were edited, renumbered them with `python3 scripts/renumber_refs.py <file>`
- [ ] If lesson or source data changed, ran sync scripts (`python3 scripts/sources.py sync && python3 scripts/build_index.py && python3 scripts/site_sync.py`)
- [ ] Ran the four checks from `CLAUDE.md`:
  `python3 scripts/site_sync.py --check && python3 scripts/check_site.py && python3 scripts/sources.py check && python3 scripts/build_index.py --check`
- [ ] For larger changes, appended an entry to `CHANGELOG.agents.md`
