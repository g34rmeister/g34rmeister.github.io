# External & Platform Integrations

---

## 1. Hosting & Deployment
- **GitHub Pages:** Serves static assets directly from the `main` branch.
- **Jekyll Bypass:** `.nojekyll` file placed in root prevents GitHub Pages from filtering underscore directories or modifying asset paths.

---

## 2. Offline & Localized Assets
- **Zero External CDNs:** All core assets (fonts, stylesheets, scripts, icons) are bundled locally in `assets/`.
- **Privacy & GDPR:** No third-party tracking scripts, cookies, or remote analytics pings.

---

## 3. Web Standards & Metadata
- **Structured Data:** Schema.org JSON-LD `Person` graph on `index.html` identifying academic affiliations, social links, and research roles.
- **PWA Manifest:** `site.webmanifest` defines standalone application properties, theme colors, and icons.
- **Search Engine Optimization:** Fully indexable `sitemap.xml` and permissive `robots.txt`.

---

## 4. Thesis Standalone Exporter
- **Script:** `scripts/export_standalone_thesis.ps1`
- **Function:** Automates packaging of all robotics HTML pages, styles, scripts, and media into an isolated directory structure ready for independent repository spin-off.
