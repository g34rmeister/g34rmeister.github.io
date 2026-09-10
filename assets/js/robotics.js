/**
 * Standalone Thesis Research JavaScript Engine (assets/js/robotics.js)
 * Zero-dependency native JS powering:
 *   1. Theme Management (Dark/Light mode syncing with localStorage)
 *   2. Mobile Thesis Drawer Controller
 *   3. Interactive Category Filter & URL Hash Routing
 *   4. One-Click BibTeX Citation Clipboard Copy
 *   5. Reveal on Scroll Observer
 */
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const root = document.documentElement;

    // 1. Remove preload lock
    window.addEventListener('load', () => {
        setTimeout(() => body.classList.remove('is-preload'), 100);
    });

    // 2. Standalone Theme Engine
    function initThesisTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

        function getPreferredTheme() {
            const saved = localStorage.getItem('theme');
            if (saved === 'light' || saved === 'dark') return saved;
            return mediaQuery.matches ? 'light' : 'dark';
        }

        function applyTheme(theme, save = false) {
            root.setAttribute('data-theme', theme);
            if (save) localStorage.setItem('theme', theme);

            const desktopToggle = document.getElementById('thesis-theme-btn');
            if (desktopToggle) {
                desktopToggle.innerHTML = theme === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
                desktopToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
            }

            const mobileLabel = document.getElementById('thesis-drawer-theme-label');
            if (mobileLabel) {
                mobileLabel.innerHTML = theme === 'light' ? '<i class="fas fa-sun"></i> Light' : '<i class="fas fa-moon"></i> Dark';
            }
        }

        const initialTheme = getPreferredTheme();
        applyTheme(initialTheme, false);

        const desktopToggle = document.getElementById('thesis-theme-btn');
        if (desktopToggle) {
            desktopToggle.addEventListener('click', () => {
                const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
                const next = current === 'light' ? 'dark' : 'light';
                applyTheme(next, true);
            });
        }

        const mobileToggle = document.getElementById('thesis-drawer-theme-btn');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
                const next = current === 'light' ? 'dark' : 'light';
                applyTheme(next, true);
            });
        }

        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'light' : 'dark', false);
            }
        });
    }
    initThesisTheme();

    // 3. Mobile Drawer Controller
    function initThesisDrawer() {
        const openBtn = document.getElementById('thesis-mobile-btn');
        const closeBtn = document.getElementById('thesis-drawer-close');
        const backdrop = document.getElementById('thesis-drawer-backdrop');
        const drawer = document.getElementById('thesis-mobile-drawer');

        function openDrawer() {
            body.classList.add('thesis-drawer-open');
            if (drawer) drawer.setAttribute('aria-hidden', 'false');
        }

        function closeDrawer() {
            body.classList.remove('thesis-drawer-open');
            if (drawer) drawer.setAttribute('aria-hidden', 'true');
        }

        if (openBtn) openBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (backdrop) backdrop.addEventListener('click', closeDrawer);

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && body.classList.contains('thesis-drawer-open')) {
                closeDrawer();
            }
        });

        // Close when clicking any drawer link
        if (drawer) {
            drawer.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeDrawer);
            });
        }
    }
    initThesisDrawer();

    // 4. Category Filter Engine & Hash Routing
    function initRoboticsCategoryNav() {
        const catNav = document.querySelector('.robotics-category-nav');
        if (!catNav) return;

        const pills = catNav.querySelectorAll('.cat-pill');
        const groups = document.querySelectorAll('.robotics-category-group');
        if (!pills.length || !groups.length) return;

        function applyFilter(category, updateUrl = true, shouldScroll = false) {
            pills.forEach(p => {
                const isMatch = (p.dataset.category === category) || (!category && p.dataset.category === 'all');
                p.classList.toggle('active', isMatch);
                p.setAttribute('aria-selected', isMatch ? 'true' : 'false');
            });

            groups.forEach(group => {
                const groupCat = group.dataset.category;
                if (!category || category === 'all' || groupCat === category) {
                    group.style.display = '';
                    group.classList.add('is-revealed');
                } else {
                    group.style.display = 'none';
                }
            });

            if (updateUrl && category && category !== 'all') {
                if (history.replaceState) {
                    history.replaceState(null, '', `#cat-${category}`);
                }
            } else if (updateUrl && category === 'all') {
                if (history.replaceState) {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            }

            if (shouldScroll && category && category !== 'all') {
                const targetGroup = document.getElementById(`cat-${category}`);
                if (targetGroup) {
                    targetGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }

        pills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = pill.dataset.category || 'all';
                applyFilter(cat, true, true);
            });
        });

        function checkHash() {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#cat-')) {
                const cat = hash.replace('#cat-', '');
                applyFilter(cat, false, false);
            }
        }

        window.addEventListener('hashchange', checkHash);
        checkHash();
    }
    initRoboticsCategoryNav();

    // 5. One-Click BibTeX Citation Clipboard Copy & Format Switcher
    function initBibtexCopy() {
        const copyBtn = document.getElementById('btn-copy-bibtex');
        const bibtexPre = document.getElementById('bibtex-code');
        const ieeeDiv = document.getElementById('ieee-cite');
        const formatTabs = document.querySelectorAll('.cite-tab-btn');

        let currentFormat = 'bibtex';

        const rawBibtex = `@mastersthesis{le2026autonomous,
  author       = {Gerald Lê},
  title        = {Multi-Modal Autonomous Systems and Embedded Kinematic Architectures},
  school       = {Louisiana State University},
  year         = {2026},
  type         = {Honors Engineering Thesis},
  address      = {Baton Rouge, LA, USA},
  howpublished = {\\url{https://g34rmeister.github.io/robotics.html}},
  note         = {Autonomous Ground Vehicles, 6-DOF Manipulators, Flight Avionics, and Quadruped Locomotion}
}`;

        const rawIeee = `G. Lê, "Multi-Modal Autonomous Systems and Embedded Kinematic Architectures," Undergraduate Honors Thesis, Dept. of Computer Science & Engineering, Louisiana State University, Baton Rouge, LA, 2026. [Online]. Available: https://g34rmeister.github.io/robotics.html`;

        // Format Tab Toggling
        formatTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const format = tab.dataset.format;
                currentFormat = format;
                formatTabs.forEach(t => t.classList.toggle('active', t === tab));
                if (bibtexPre && ieeeDiv) {
                    if (format === 'bibtex') {
                        bibtexPre.style.display = '';
                        ieeeDiv.style.display = 'none';
                        if (copyBtn) copyBtn.querySelector('span').textContent = 'Copy BibTeX';
                    } else {
                        bibtexPre.style.display = 'none';
                        ieeeDiv.style.display = 'block';
                        if (copyBtn) copyBtn.querySelector('span').textContent = 'Copy Citation';
                    }
                }
            });
        });

        if (!copyBtn) return;

        copyBtn.addEventListener('click', async () => {
            const textToCopy = currentFormat === 'bibtex' ? rawBibtex : rawIeee;
            let copied = false;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    copied = true;
                } catch (e) {
                    // Fall back
                }
            }
            if (!copied) {
                try {
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    copied = true;
                } catch (fallbackErr) {
                    console.error('Failed to copy citation:', fallbackErr);
                }
            }

            const origHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> <span>Copied to Clipboard!</span>';
            copyBtn.style.background = 'var(--lsu-gold)';
            copyBtn.style.color = '#240d42';

            setTimeout(() => {
                copyBtn.innerHTML = origHTML;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 2500);
        });
    }
    initBibtexCopy();

    // 6. Reveal-on-Scroll Observer
    function initRevealOnScroll() {
        const elements = document.querySelectorAll('.reveal-on-scroll');
        if (!elements.length) return;

        // Respect users who prefer reduced motion: show content immediately.
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            elements.forEach(el => el.classList.add('is-revealed'));
            return;
        }

        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('is-revealed'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.05
        });

        elements.forEach(el => observer.observe(el));
    }
    initRevealOnScroll();

    // 7. Auto-Inject Build Date ("last updated" footer stamp)
    function initBuildDate() {
        const stamps = document.querySelectorAll('[data-build-date]');
        if (!stamps.length) return;

        let stamp = null;
        try {
            const modified = new Date(document.lastModified);
            if (!isNaN(modified.getTime())) {
                stamp = modified.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }
        } catch (e) {
            stamp = null;
        }
        if (!stamp) return;

        stamps.forEach(el => {
            el.textContent = stamp;
            el.setAttribute('datetime', stamp);
            el.title = 'Auto-generated from document.lastModified at runtime';
        });
    }
    initBuildDate();
});
