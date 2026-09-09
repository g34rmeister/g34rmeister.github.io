/**
 * Modern Vanilla JS for Gerald Lê Portfolio
 * Replaces jQuery + 5 legacy plugins (~114 KB) with zero-dependency native JS.
 */
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // 1. Remove preload animation block
    window.addEventListener('load', () => {
        setTimeout(() => body.classList.remove('is-preload'), 100);
    });

    // 2. Build Title Bar for Mobile with Hamburger on Left & Centered Brand (Text + Logo)
    const titleBar = document.createElement('div');
    titleBar.id = 'titleBar';
    titleBar.innerHTML = `
        <a href="#navPanel" class="toggle" aria-label="Toggle Navigation">
            <i class="fas fa-bars"></i>
        </a>
        <a href="index.html" class="titleBar-logo" aria-label="Gerald Lê - Home">
            <span class="titleBar-brand-title">Gerald Lê</span>
            <img src="images/logo.svg" alt="GL" class="titleBar-logo-img" />
        </a>
        <div class="titleBar-spacer"></div>
    `;
    body.appendChild(titleBar);

    // 3. Build Mobile Nav Panel with Brand Header & Close Button
    const desktopNavLinks = document.querySelectorAll('#nav ul li a');
    const navPanel = document.createElement('div');
    navPanel.id = 'navPanel';

    const panelHeader = document.createElement('div');
    panelHeader.className = 'navPanel-header';
    panelHeader.innerHTML = `
        <div class="navPanel-brand">
            <img src="images/logo.svg" alt="GL" class="navPanel-logo" />
            <span class="navPanel-title">Gerald Lê</span>
        </div>
        <button type="button" class="navPanel-close" aria-label="Close Navigation">
            <i class="fas fa-times"></i>
        </button>
    `;
    navPanel.appendChild(panelHeader);

    const panelNav = document.createElement('nav');

    desktopNavLinks.forEach(link => {
        // Skip logo/brand link in the mobile text drawer (already in brand header)
        if (link.classList.contains('nav-logo-link') || link.closest('.nav-logo-item')) return;
        const text = link.textContent.trim();
        if (!text) return;

        const a = document.createElement('a');
        a.className = 'link depth-0';
        a.href = link.getAttribute('href') || '#';
        if (link.getAttribute('target')) {
            a.target = link.getAttribute('target');
            a.rel = link.getAttribute('rel') || 'noopener noreferrer';
        }
        a.textContent = text;
        
        // Highlight active page link
        if (link.parentElement && link.parentElement.classList.contains('current')) {
            a.classList.add('active');
        }

        // Close drawer on link click
        a.addEventListener('click', () => {
            closeNav();
        });

        panelNav.appendChild(a);
    });

    navPanel.appendChild(panelNav);

    // 3b. Build Mobile Theme Switch at Bottom of Hamburger Drawer
    const panelFooter = document.createElement('div');
    panelFooter.className = 'navPanel-footer';
    panelFooter.innerHTML = `
        <button type="button" id="mobile-theme-toggle" class="mobile-theme-btn" aria-label="Toggle light or dark theme">
            <span class="mobile-theme-label"><i class="fas fa-adjust"></i> Theme</span>
            <span class="mobile-theme-val" id="mobile-theme-val"><i class="fas fa-moon"></i> Dark</span>
        </button>
    `;
    navPanel.appendChild(panelFooter);

    body.appendChild(navPanel);

    // 4. Build Dimmed Backdrop Scrim
    const backdrop = document.createElement('div');
    backdrop.id = 'navPanel-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    body.appendChild(backdrop);

    // 5. Mobile Drawer State Controller
    function openNav() {
        body.classList.add('navPanel-visible');
    }

    function closeNav() {
        body.classList.remove('navPanel-visible');
    }

    function toggleNav() {
        if (body.classList.contains('navPanel-visible')) {
            closeNav();
        } else {
            openNav();
        }
    }

    // Toggle button handler
    const toggleBtn = titleBar.querySelector('.toggle');
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleNav();
    });

    // Close button inside drawer handler
    const closeBtn = panelHeader.querySelector('.navPanel-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeNav();
        });
    }

    // Close when clicking backdrop
    backdrop.addEventListener('click', () => {
        closeNav();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('navPanel-visible')) {
            closeNav();
        }
    });

    // Touch Swipe-to-Close for Mobile Nav Drawer
    let touchStartX = 0;
    let touchDiffX = 0;
    navPanel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    navPanel.addEventListener('touchmove', (e) => {
        touchDiffX = e.touches[0].clientX - touchStartX;
    }, { passive: true });
    navPanel.addEventListener('touchend', () => {
        if (touchDiffX < -45) {
            closeNav();
        }
        touchStartX = 0;
        touchDiffX = 0;
    });

    // 6. Mesh Aurora Ambient Background Auto-Mount (Pure Organic Aurora)
    function initAurora() {
        if (document.getElementById('aurora-bg')) return;
        const aurora = document.createElement('div');
        aurora.id = 'aurora-bg';
        aurora.setAttribute('aria-hidden', 'true');
        aurora.innerHTML = `
            <div class="aurora-orb aurora-orb-1"></div>
            <div class="aurora-orb aurora-orb-2"></div>
            <div class="aurora-orb aurora-orb-3"></div>
        `;
        body.prepend(aurora);
    }
    initAurora();


    // 8. Scroll-Triggered Staggered Animations
    function initScrollReveal() {
        const revealEls = document.querySelectorAll('.reveal-on-scroll');
        if (!revealEls.length) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        obs.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '0px 0px -40px 0px',
                threshold: 0.08
            });

            revealEls.forEach(el => observer.observe(el));
        } else {
            revealEls.forEach(el => el.classList.add('is-revealed'));
        }
    }
    initScrollReveal();

    // 9. Interactive Portfolio Category Filters
    function initPortfolioFilters() {
        const filterBar = document.querySelector('.project-filter-bar');
        if (!filterBar) return;

        const filterBtns = filterBar.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.content-card[data-category]');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterValue = btn.getAttribute('data-filter');

                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        card.classList.remove('filter-hidden');
                        card.classList.remove('is-revealed');
                        void card.offsetWidth; // force DOM reflow for fresh reveal
                        card.classList.add('is-revealed');
                    } else {
                        card.classList.add('filter-hidden');
                    }
                });
            });
        });
    }
    initPortfolioFilters();

    // 10. Global Toast Notification System
    window.showToast = function(msg) {
        let toast = document.getElementById('copyToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'copyToast';
            toast.className = 'toast-notification';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.innerHTML = `<i class="fas fa-check-circle"></i> <span id="toastMessage"></span>`;
            body.appendChild(toast);
        }
        const label = toast.querySelector('#toastMessage');
        if (label && msg) label.textContent = msg;
        toast.classList.add('show');
        clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // 11. Floating Back-to-Top Button
    function initBackToTop() {
        const btn = document.createElement('button');
        btn.id = 'back-to-top';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = '<span>Back to top</span> <i class="fas fa-arrow-up" aria-hidden="true"></i>';
        body.appendChild(btn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 350) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    initBackToTop();

    // 12. Theme Engine (Light/Dark Mode + System Preference + Persistence)
    function initThemeEngine() {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

        // Mount desktop theme toggle inside #nav if not already present
        const desktopNav = document.getElementById('nav');
        if (desktopNav && !document.getElementById('theme-toggle')) {
            const desktopToggle = document.createElement('button');
            desktopToggle.type = 'button';
            desktopToggle.id = 'theme-toggle';
            desktopToggle.className = 'theme-toggle-switch';
            desktopToggle.setAttribute('role', 'switch');
            desktopToggle.setAttribute('aria-label', 'Toggle light or dark theme');
            desktopToggle.setAttribute('title', 'Toggle light/dark theme');
            desktopToggle.innerHTML = `
                <span class="theme-toggle-track">
                    <i class="fas fa-sun toggle-icon toggle-icon-sun" aria-hidden="true"></i>
                    <i class="fas fa-moon toggle-icon toggle-icon-moon" aria-hidden="true"></i>
                    <span class="toggle-thumb" aria-hidden="true"></span>
                </span>
            `;
            desktopNav.appendChild(desktopToggle);
        }

        function getPreferredTheme() {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                return storedTheme;
            }
            return mediaQuery.matches ? 'light' : 'dark';
        }

        function applyTheme(theme, save = false) {
            root.setAttribute('data-theme', theme);

            if (save) {
                localStorage.setItem('theme', theme);
            }

            // Sync desktop toggle switch accessibility attribute
            const desktopBtn = document.getElementById('theme-toggle');
            if (desktopBtn) {
                desktopBtn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
            }

            // Sync mobile drawer indicator label
            const mobileVal = document.getElementById('mobile-theme-val');
            if (mobileVal) {
                if (theme === 'light') {
                    mobileVal.innerHTML = '<i class="fas fa-sun"></i> Light';
                } else {
                    mobileVal.innerHTML = '<i class="fas fa-moon"></i> Dark';
                }
            }
        }

        // Initialize state
        const initialTheme = getPreferredTheme();
        applyTheme(initialTheme, false);

        // Bind desktop click
        const desktopBtn = document.getElementById('theme-toggle');
        if (desktopBtn) {
            desktopBtn.addEventListener('click', () => {
                const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
                const nextTheme = current === 'light' ? 'dark' : 'light';
                applyTheme(nextTheme, true);
            });
        }

        // Bind mobile click
        const mobileBtn = document.getElementById('mobile-theme-toggle');
        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
                const nextTheme = current === 'light' ? 'dark' : 'light';
                applyTheme(nextTheme, true);
            });
        }

        // React to system preference changes when no explicit choice stored
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'light' : 'dark', false);
            }
        });
    }
    initThemeEngine();
});