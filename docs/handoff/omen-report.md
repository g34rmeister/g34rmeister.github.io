# Omen report (2026-10-28)

## Shipped (all checks + browser test local, CI green)
- `cb38752` Step 27 Part A: widgets `rosgraph` (4.4), `movejl` (2.3), `threshold` (7.3), `prflow` (3.2), `modbus` (8.3).
- `d891b13` Step 28: `trapezoid` (6.9), `zones` (8.6); `robotics-teaching.html`; `docs/handoff/good-first-issues.md`.

## Fixed in Gemini's output
- movejl: removed "both joints start and stop together" and "solves IK every frame" (not in 2.3); legend named a colour that is wrong in dark mode.
- modbus: dropped 0x04 (lesson has no code line for it); exception text now the lesson's "ILLEGAL DATA ADDRESS".
- zones: removed invented PLC->Level 2 / robot controller->Level 1 mapping; zone, jump-box, office and direct-path notes rewritten to the lesson's wording.
- rosgraph, threshold, prflow, trapezoid: checked against lessons, no changes (trapezoid reproduces both worked examples).
- Every widget tested at 320 px, light and dark: renders, no overflow, role="img", no console errors, keyboard and reduced motion checked where relevant.

## Skipped / left
- 7.1 field-of-view calculator: the lesson has no formula (issue draft 5 asks for a sourced one).
- Hub name line: already on the hub ("The name is robotics + OSS"); reword it there if wanted.
- prflow and rosgraph labels are tiny on phones (issue draft 3).
- Good-first issues are drafts only; nothing posted on GitHub.

## Setup notes (this machine)
- agy needed a Google sign-in once (`agy` interactively); allow rules are in place.
- Playwright 1.56.1 on Ubuntu 26.04: `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 ~/pw/node_modules/.bin/playwright install chromium`.

## Open decisions (Gerald)
- AMR material: new Chapter 11, or a lesson folded into Chapter 3.
- PR-explainer GitHub Action (needs an API key).
- OSS map licences for MoveIt 2, Nav2, Gazebo, UR ROS 2 driver, Wireshark (each needs a checked source).
- Wording of the teaching page and the hub name line.
