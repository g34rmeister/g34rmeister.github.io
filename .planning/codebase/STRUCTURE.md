# Directory & File Structure

```
.
├── .github/
│   └── workflows/
│       └── site-hygiene.yml       # Automated HTML/CSS/link hygiene checks
├── assets/
│   ├── css/
│   │   ├── fontawesome-all.min.css# FontAwesome 5 core stylesheet
│   │   ├── main.css               # Global styling, theming tokens, navigation
│   │   └── robotics.css           # Robotics thesis styling & LSU palette
│   ├── fonts/
│   │   ├── jetbrains-mono-latin.woff2
│   │   ├── jetbrains-mono-latin-ext.woff2
│   │   └── jetbrains-mono-vietnamese.woff2
│   ├── js/
│   │   ├── main.js                # Core site engine (nav, theme, filters, scroll)
│   │   └── robotics.js            # Thesis engine (theme, bibtex modal, reading time)
│   └── webfonts/                  # FontAwesome woff2 icon files
├── images/                        # Optimized WebP project media & logo.svg
├── scripts/
│   └── export_standalone_thesis.ps1 # Standalone thesis spin-off script
├── .nojekyll                      # Prevents GitHub Pages Jekyll parsing
├── 404.html                       # Custom styled 404 error page
├── about.html                     # Biography, coursework, awards
├── affiliations.html              # University & organization affiliations
├── contact.html                   # Contact information & channels
├── index.html                     # Main landing page & hero
├── portfolio.html                 # Complete project showcase & filters
├── project-sample.html            # Detailed project case study template
├── resume.html                    # Printable & interactive CV
├── robotics.html                  # Robotics & Autonomous Systems landing
├── robotics-agv.html              # Autonomous Ground Vehicle research
├── robotics-arm.html              # SO-100 Robotic Arm manipulation
├── robotics-flight.html           # Autonomous Flight / UAV research
├── robotics-quadruped.html        # Quadruped Robotics locomotion
├── robots.txt                     # Crawler directives
├── site.webmanifest               # PWA configuration manifest
└── sitemap.xml                    # Complete URL map for search engines
```
