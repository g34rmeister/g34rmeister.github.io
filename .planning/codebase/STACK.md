# Technology Stack

**Repository:** `g34rmeister.github.io`  
**Author:** Gerald Lê — Computer Science @ LSU  
**Architecture:** Zero-dependency Static Web Platform

---

## 1. Core Platform
- **Runtime:** Static Client-Side Web Application (zero server requirements, zero bundler overhead)
- **Hosting:** GitHub Pages with `.nojekyll` asset routing
- **Markup:** Semantic HTML5
- **Styling:** Vanilla Modern CSS3
  - CSS Custom Properties (`:root` design tokens, dynamic dark/light theme variables)
  - CSS Grid (pixel-perfect 2-column theme toggle track, responsive portfolio grids)
  - CSS Flexbox (navigation headers, interactive modals, floating actions)
  - Backdrop Filter blur effects (`backdrop-filter: blur(12px)`)
- **Scripting:** Vanilla ECMAScript (ES6+)
  - Event-driven DOM interaction
  - `IntersectionObserver` for scroll-reveal performance
  - Window `matchMedia` for system preference detection (`prefers-color-scheme`, `prefers-reduced-motion`)
  - Client-side persistence via `localStorage`
  - Native Clipboard API for BibTeX citation copying

---

## 2. Typography & Iconography
- **Typography:**
  - Primary Code/Header Font: `JetBrains Mono` (served locally via `assets/fonts/jetbrains-mono-*.woff2`)
  - Body / System Fallbacks: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Icon Suite:**
  - FontAwesome 5.15.4 Free (`assets/css/fontawesome-all.min.css`, local `assets/webfonts/`)
  - Vector Brand Icons (`images/logo.svg`)

---

## 3. Automation & Deployment
- **Packaging Utility:** PowerShell standalone thesis exporter (`scripts/export_standalone_thesis.ps1`)
- **CI/CD:** GitHub Actions workflow (`.github/workflows/site-hygiene.yml`)
- **Metadata & SEO:** Schema.org JSON-LD graph, `site.webmanifest`, `robots.txt`, `sitemap.xml`
