# Testing & Verification Strategy

---

## 1. Automated CI Verification
- **GitHub Actions Workflow:** `.github/workflows/site-hygiene.yml`
- Runs on every push and PR:
  - HTML validity check
  - Dead link / relative path verification
  - Missing asset audits

---

## 2. Browser Automation & Zoom Testing (CDP)
- Headless Microsoft Edge / Chrome using Chrome DevTools Protocol (CDP):
  - Scale tests: 100%, 110%, 125%, 150%, 175%, 200% device scale factors.
  - Pixel measurement: Concentricity checks, bounding rect delta calculation, coordinate verification.
  - Theme toggling validation (verifying attribute switching between `dark` and `light`).

---

## 3. Manual Cross-Browser UAT
- Responsive layout checks across breakpoints:
  - Mobile: ≤ 480px and ≤ 736px
  - Tablet: ≤ 980px
  - Desktop: > 980px
- Theme engine check across OS preferences:
  - macOS Safari, Windows Edge/Chrome, iOS Safari, Android Chrome.
