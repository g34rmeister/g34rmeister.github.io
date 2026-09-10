# Gerald Lê — Personal Portfolio & Projects

Personal developer portfolio hosted on GitHub Pages. Built with semantic HTML5, modern CSS variables, and vanilla JavaScript.

🔗 **Live Site:** [https://g34rmeister.github.io](https://g34rmeister.github.io)

## 🛠️ Tech Stack
* **Markup & Styling:** HTML5, CSS3 (JetBrains Mono, Custom Variables, Flexbox/Grid)
* **Scripts:** Vanilla JS (zero-dependency, no jQuery)
* **Icons:** Font Awesome 5 (self-hosted)
* **Fonts:** JetBrains Mono (self-hosted WOFF2: vietnamese, latin-ext, latin)
* **Deployment:** GitHub Pages

## 📁 Repository Structure
* `index.html` - Homepage
* `about.html` - Biography & technical skills
* `affiliations.html` - Academic & work experience
* `portfolio.html` - Software & automation projects
* `project-sample.html` - Sample project case study template
* `resume.html` - Interactive CV viewer (Google Docs embed)
* `contact.html` - Direct contact channels
* `robotics.html` - TigerBot thesis fleet hub
* `robotics-agv.html` / `robotics-arm.html` / `robotics-flight.html` / `robotics-quadruped.html` - Thesis chapter deep-dives
* `404.html` - Custom not-found page
* `robots.txt` / `sitemap.xml` / `site.webmanifest` - SEO & crawler metadata
* `assets/` - CSS, JS, fonts, webfonts
* `images/` - WebP imagery & brand logo
* `scripts/export_standalone_thesis.ps1` - Exports the thesis hub (`robotics*.html` + assets) into a self-contained `dist-thesis/` folder (gitignored build output, safe to delete and regenerate)

## 🧭 SEO, Accessibility & Maintenance Notes
* Page `<head>` blocks share one convention: standardized `<title>`, canonical URL, Open Graph / Twitter Card tags, `theme-color`, and `color-scheme`. Keep them in sync when adding pages, and add the new URL to `sitemap.xml`.
* Footers use `<span data-build-date>` for the "last updated" stamp. `assets/js/main.js` and `assets/js/robotics.js` auto-refresh it from `document.lastModified` at runtime — edit the span text only as a no-JS fallback.
* Every page has exactly one `<h1>` (hero/banner headline). Subpage banners use `<h1>` styled like the old `<h2>` — do not demote them.
* The portfolio filter bar uses `role="group"` with `aria-pressed` on each button (managed by `initPortfolioFilters` in `assets/js/main.js`). Preserve those attributes when editing filters.

## 📄 License
This template is based on [TXT by HTML5 UP](https://html5up.net) and licensed under [Creative Commons Attribution 3.0 (CCA 3.0)](LICENSE.txt).