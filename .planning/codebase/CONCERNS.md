# Architecture Concerns & Technical Debt

---

## 1. Robotics Thesis Decoupling (Priority: High)
- **Current State:** The robotics pages (`robotics-*.html`) share navigation assets, logo, and core scripts with the main portfolio.
- **Goal:** The user wants to spin off the robotics platform into an independent thesis repository.
- **Action Needed:** Execute `scripts/export_standalone_thesis.ps1`, verify zero external dependencies on `main.css`/`main.js`, and create an autonomous thesis repository.

---

## 2. CSS Query Cache Invalidation (Priority: Medium)
- **Current State:** Browsers aggressively cache CSS on static hosts.
- **Mitigation:** Query string `?v=3.4` is implemented across all 13 HTML files. Any future updates to `main.css` or `robotics.css` must increment this version parameter.

---

## 3. Subpixel Rounding Across OS DPIs (Priority: Resolved)
- **Previous Risk:** Absolute manual pixel positioning (`left: 2px`, `translateX(26px)`) drifted on Windows 125% and 175% scaling.
- **Resolution:** Replaced with Two-Slot CSS Grid + 50% relative carrier (`translateX(100%)`), achieving mathematical subpixel centering across all zoom levels.
