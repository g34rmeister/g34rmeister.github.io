# Good first issues (drafts for Gerald to post)

Each one is small, real (found on 2026-10-28) and needs no course-wide knowledge. Labels: `good first issue`, plus the one in brackets. Do not post these automatically.

## 1. Use https for four reference links [references]
Four references still link over plain `http://`:
- `robotics-2-3.html`: rovart.cimr.pub.ro/docs/OpIntroRAPID.pdf
- `robotics-4-1.html`: www.robotics.stanford.edu/~ang/papers/icraoss09-ROS.pdf
- `robotics-6-4.html`: two brettbeauregard.com blog posts

For each, check whether the same page loads over `https://`. If it does, change the link. If it does not, leave it and say so in the PR. Do not change the reference text.

## 5. Field-of-view calculator for lesson 7.1 [widget, needs a source]
Lesson 7.1 explains focal length, field of view and working distance in words but has no formula, so it has no calculator yet. First step: find a formula in a source the lesson already cites (Edmund Optics, "Understanding Focal Length and Field of View") and propose a sentence plus citation for the lesson in the issue. A maintainer checks the source; only then is the widget built.

## 6. VLAN example widget for lesson 8.6 [widget]
Section 03 of lesson 8.6 gives an example: robot motion traffic on VLAN 20 and HMI traffic on VLAN 30. A small diagram that shows the two VLANs sharing one switch, and what changes when a port is a trunk vs an access port, would help. Show only what the lesson says. Follow the style of the existing widgets in `assets/js/widgets.js`.

## How to work on any of these
Read `CONTRIBUTING.md`. Before opening a PR run:
`python3 scripts/site_sync.py --check && python3 scripts/check_site.py && python3 scripts/sources.py check && python3 scripts/build_index.py --check`
