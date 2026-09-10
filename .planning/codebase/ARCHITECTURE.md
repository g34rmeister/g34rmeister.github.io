# Codebase Architecture

---

## 1. High-Level Domain Separation

The repository houses two tightly coupled functional domains that are being prepared for structural decoupling:

```
┌─────────────────────────────────────────────────────────────┐
│                 g34rmeister.github.io                       │
├──────────────────────────────┬──────────────────────────────┤
│    Main Portfolio Domain     │   Robotics Thesis Subsystem  │
├──────────────────────────────┼──────────────────────────────┤
│ • index.html (Landing)       │ • robotics.html (Hub)        │
│ • about.html (Bio & Acad)    │ • robotics-arm.html (SO-100) │
│ • portfolio.html (Projects)  │ • robotics-agv.html (AGV)    │
│ • resume.html (CV)           │ • robotics-flight.html (UAV) │
│ • contact.html               │ • robotics-quadruped.html    │
│ • main.css + main.js         │ • robotics.css + robotics.js │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 2. Theme Engine Architecture

### Desktop Switch (Two-Slot CSS Grid + Carrier)
- **Container:** 54px × 28px outer track with 1px border.
- **Grid Layout:** `display: grid; grid-template-columns: 1fr 1fr` produces two identical 26px × 26px cells.
- **Carrier:** 50% width carrier slot translates via `translateX(0)` (Light) and `translateX(100%)` (Dark).
- **Disc:** 22px diameter circle centered via flexbox in the carrier, leaving uniform 2px padding.
- **Icons:** Centered within their respective grid slots (`place-items: center`).
- **Resilience:** Zoom-independent, mathematically eliminates subpixel rounding drift across scales.

### Mobile Theme Switch
- Mounted inside the sliding drawer (`#navPanel`) as an interactive button (`.mobile-theme-btn`).

### Thesis Theme Switch
- Dedicated circular toggle button (`.thesis-theme-toggle`) styled with LSU Purple & Gold tokens.

---

## 3. Robotics & BibTeX Subsystem
- **Citation System:** Native BibTeX modal overlay with syntax highlighting, click-to-copy, and direct .bib download.
- **Reading Time Calculator:** Automatically computes article reading time based on word count.
- **Sticky Sub-navigation:** Contextual floating pill bar for jumping between thesis project categories.
