# Code & Design Conventions

---

## 1. CSS & Design Tokens
- **CSS Custom Properties:** All colors, transitions, and radii must reference CSS variables defined in `:root` (and overridden in `[data-theme="light"]`).
- **LSU Brand Tokens:** Robotics pages use designated LSU variables:
  - `--lsu-purple`: `#461D7C` (Dark: `#805ad5`)
  - `--lsu-gold`: `#FDD023` (Dark: `#f6e05e`)
  - `--lsu-accent`: Secondary highlights
- **Accessibility & Motion:** All animations must obey `@media (prefers-reduced-motion: reduce)` by clamping transition and animation durations to 0.01ms.
- **Cache Busting:** Stylesheet links in HTML include version parameters (`main.css?v=3.4`) which must be incremented whenever CSS changes.

---

## 2. HTML Conventions
- **Semantic Structure:** `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **Accessibility:** All interactive elements must have clear `aria-label`, `role`, or text labels. Toggle switches require `role="switch"` and `aria-checked`.
- **Asset Links:** Always use relative paths (`assets/...`) or canonical GitHub Pages URLs.

---

## 3. JavaScript Patterns
- **Encapsulated Modules:** Functions grouped logically inside a single `DOMContentLoaded` listener.
- **Passive Listeners:** Scroll and resize events must specify `{ passive: true }`.
- **Safe Fallbacks:** Always guard `localStorage`, `navigator.clipboard`, and `IntersectionObserver` calls against missing browser APIs.
