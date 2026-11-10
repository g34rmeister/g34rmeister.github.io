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

        // The drawer is a modal dialog: named, focus moves in when it opens, Tab stays inside, and
        // closing it (Esc, Close, backdrop) gives focus back to the button that opened it.
        if (drawer) {
            drawer.setAttribute('role', 'dialog');
            drawer.setAttribute('aria-modal', 'true');
            drawer.setAttribute('aria-label', 'Course menu');
        }
        function drawerFocusable() {
            return Array.prototype.filter.call(drawer.querySelectorAll('a[href], button, input'), (n) => n.offsetParent !== null);
        }

        function openDrawer() {
            body.classList.add('thesis-drawer-open');
            if (drawer) drawer.setAttribute('aria-hidden', 'false');
            // While the slide-in transition runs the drawer still counts as hidden, so retry once it has finished.
            if (closeBtn) {
                closeBtn.focus();
                if (document.activeElement !== closeBtn) setTimeout(() => { if (body.classList.contains('thesis-drawer-open')) closeBtn.focus(); }, 250);
            }
        }

        function closeDrawer(returnFocus) {
            const wasOpen = body.classList.contains('thesis-drawer-open');
            body.classList.remove('thesis-drawer-open');
            if (drawer) drawer.setAttribute('aria-hidden', 'true');
            if (wasOpen && returnFocus === true && openBtn && openBtn.offsetParent !== null) openBtn.focus();
        }

        if (openBtn) openBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', () => closeDrawer(true));
        if (backdrop) backdrop.addEventListener('click', () => closeDrawer(true));

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (!body.classList.contains('thesis-drawer-open')) return;
            if (e.key === 'Escape') {
                closeDrawer(true);
            } else if (e.key === 'Tab' && drawer) {
                const items = drawerFocusable();
                if (!items.length) return;
                const first = items[0], last = items[items.length - 1];
                if (!drawer.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
                else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });

        // Close when clicking any drawer link
        if (drawer) {
            drawer.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => closeDrawer(false));
            });

            // Swipe to close rightward (matching right-bound pullout)
            let touchStartX = 0;
            let touchStartY = 0;
            drawer.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            drawer.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                if (touchEndX - touchStartX > 45 && Math.abs(touchEndY - touchStartY) < 90) {
                    closeDrawer(true);
                }
            }, { passive: true });
        }
    }
    initThesisDrawer();

    // The skip link moves keyboard focus to <main>, not just the scroll position.
    function initSkipLink() {
        const skip = document.querySelector('a.skip-link[href="#main"]');
        const main = document.getElementById('main');
        if (!skip || !main) return;
        skip.addEventListener('click', () => {
            if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
            main.focus({ preventScroll: false });
        });
    }
    initSkipLink();

    // 3b. "Chapters" menu in the desktop navbar: a <details> that also closes on Esc,
    // on an outside click and when focus leaves it.
    function initChapterMenu() {
        const menu = document.querySelector('.thesis-nav-links details.nav-menu');
        if (!menu) return;
        const summary = menu.querySelector('summary');
        function close(returnFocus) {
            if (!menu.open) return;
            menu.open = false;
            if (returnFocus && summary) summary.focus();
        }
        menu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.open) {
                e.preventDefault();
                close(true);
            }
        });
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) close(false);
        });
        menu.addEventListener('focusout', (e) => {
            if (e.relatedTarget && !menu.contains(e.relatedTarget)) close(false);
        });
    }
    initChapterMenu();

    // 4. One-Click BibTeX Citation Clipboard Copy & Format Switcher
    function initBibtexCopy() {
        const copyBtn = document.getElementById('btn-copy-bibtex');
        const bibtexPre = document.getElementById('bibtex-code');
        const ieeeDiv = document.getElementById('ieee-cite');
        const formatTabs = document.querySelectorAll('.cite-tab-btn');

        let currentFormat = 'bibtex';
        formatTabs.forEach(t => t.setAttribute('aria-pressed', t.classList.contains('active') ? 'true' : 'false'));

        const rawBibtex = `@misc{le2026risebot,
  author       = {Gerald Lê},
  title        = {robOSStics},
  howpublished = {Honors independent research (CSC 3991), Louisiana State University},
  year         = {2026},
  note         = {Advisor: Felipe Fronchetti},
  url          = {https://g34rmeister.github.io/robotics.html}
}`;

        const rawIeee = `G. Lê, "robOSStics," Honors independent research (CSC 3991), Louisiana State University, Baton Rouge, LA, 2026. [Online]. Available: https://g34rmeister.github.io/robotics.html`;

        // Format Tab Toggling
        formatTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const format = tab.dataset.format;
                currentFormat = format;
                formatTabs.forEach(t => {
                    t.classList.toggle('active', t === tab);
                    t.setAttribute('aria-pressed', t === tab ? 'true' : 'false');
                });
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
            let textToCopy = '';
            if (currentFormat === 'bibtex') {
                textToCopy = (bibtexPre && bibtexPre.innerText) ? bibtexPre.innerText.trim() : rawBibtex;
            } else {
                textToCopy = (ieeeDiv && ieeeDiv.innerText) ? ieeeDiv.innerText.trim() : rawIeee;
            }
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

    // 5. Collapsible HLTV Research Chapters Controller
    function initCollapsibleChapters() {
        const chapterBlocks = document.querySelectorAll('.hltv-chapter-block');
        if (!chapterBlocks.length) return;

        const toggleAllBtn = document.getElementById('hltv-toggle-all');
        const toggleAllText = document.getElementById('hltv-toggle-all-text');
        const toggleAllIcon = document.getElementById('hltv-toggle-all-icon');

        function updateToggleAllState() {
            if (!toggleAllBtn || !toggleAllText || !toggleAllIcon) return;
            const anyExpanded = Array.from(chapterBlocks).some(b => !b.classList.contains('is-collapsed'));
            if (anyExpanded) {
                toggleAllText.textContent = 'Collapse All';
                toggleAllIcon.className = 'fas fa-compress-alt';
                toggleAllBtn.setAttribute('aria-label', 'Collapse all research chapters');
            } else {
                toggleAllText.textContent = 'Expand All';
                toggleAllIcon.className = 'fas fa-expand-alt';
                toggleAllBtn.setAttribute('aria-label', 'Expand all research chapters');
            }
        }

        chapterBlocks.forEach((block, idx) => {
            const header = block.querySelector('.hltv-chapter-header');
            const feedList = block.querySelector('.hltv-feed-list');
            if (!header || !feedList) return;

            const feedId = feedList.id || `chapter-feed-${idx + 1}`;
            feedList.id = feedId;
            header.setAttribute('aria-controls', feedId);
            header.setAttribute('aria-expanded', block.classList.contains('is-collapsed') ? 'false' : 'true');

            function toggleChapter(e) {
                if (e && e.target && e.target.closest('a')) return;
                const isNowCollapsed = block.classList.toggle('is-collapsed');
                header.setAttribute('aria-expanded', isNowCollapsed ? 'false' : 'true');
                updateToggleAllState();
            }

            header.addEventListener('click', toggleChapter);
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleChapter(e);
                }
            });
        });

        if (toggleAllBtn) {
            toggleAllBtn.addEventListener('click', () => {
                const anyExpanded = Array.from(chapterBlocks).some(b => !b.classList.contains('is-collapsed'));
                chapterBlocks.forEach(block => {
                    const header = block.querySelector('.hltv-chapter-header');
                    if (anyExpanded) {
                        block.classList.add('is-collapsed');
                        if (header) header.setAttribute('aria-expanded', 'false');
                    } else {
                        block.classList.remove('is-collapsed');
                        if (header) header.setAttribute('aria-expanded', 'true');
                    }
                });
                updateToggleAllState();
            });
        }
    }
    initCollapsibleChapters();

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

    // 8. Wikipedia-style "Contents" box for article pages, built from the section headings
    function initTableOfContents() {
        const body = document.querySelector('.robotics-article-body');
        if (!body) return;
        const headings = Array.from(body.querySelectorAll('h2.article-section-title'));
        if (headings.length < 2) return;

        const toc = document.createElement('nav');
        toc.className = 'wp-toc';
        toc.id = 'contents';
        toc.setAttribute('aria-labelledby', 'wp-toc-title');
        const title = document.createElement('div');
        title.className = 'wp-toc-title';
        title.id = 'wp-toc-title';
        title.textContent = 'Contents';
        const list = document.createElement('ol');

        headings.forEach((heading, i) => {
            if (!heading.id) heading.id = 'section-' + (i + 1);
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.textContent.trim();
            item.appendChild(link);
            list.appendChild(item);
        });

        toc.append(title, list);
        body.insertBefore(toc, headings[0]);

        // Side copy of the same list for wide screens (CSS shows it from 1200px up):
        // fixed in the left margin below the navbar, scrolls inside itself, and marks the
        // section being read with aria-current="location".
        const side = document.createElement('nav');
        side.className = 'wp-toc-side';
        side.setAttribute('aria-label', 'Contents, follows your reading position');
        const sideTitle = document.createElement('div');
        sideTitle.className = 'wp-toc-title';
        sideTitle.textContent = 'Contents';
        const sideList = list.cloneNode(true);
        side.append(sideTitle, sideList);
        document.body.appendChild(side);

        const sideLinks = Array.from(sideList.querySelectorAll('a'));
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        let current = null;
        let queued = false;
        function updateActive() {
            queued = false;
            if (!side.offsetParent && getComputedStyle(side).display === 'none') return;
            let idx = -1;
            headings.forEach((h, i) => {
                if (h.getBoundingClientRect().top <= 110) idx = i;
            });
            if (idx < 0) idx = 0;
            if (idx === current) return;
            current = idx;
            sideLinks.forEach((a, i) => {
                if (i === idx) a.setAttribute('aria-current', 'location');
                else a.removeAttribute('aria-current');
            });
            const a = sideLinks[idx];
            if (side.scrollHeight > side.clientHeight) {
                const top = a.offsetTop - side.clientHeight / 2;
                side.scrollTo({ top: top, behavior: reduce.matches ? 'auto' : 'smooth' });
            }
        }
        function queue() {
            if (!queued) { queued = true; window.requestAnimationFrame(updateActive); }
        }
        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', queue);
        updateActive();

        // Sections added after load (the "Check yourself" box, which waits for the quiz file) join both
        // lists just before the heading `before`, keeping document order.
        window.roboticsTocAdd = function (heading, label, before) {
            if (!heading.id) return;
            const at = headings.indexOf(before);
            [list, sideList].forEach((ol, which) => {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#' + heading.id;
                link.textContent = label;
                item.appendChild(link);
                const ref = at >= 0 ? ol.children[at] : null;
                ol.insertBefore(item, ref || null);
                if (which === 1) sideLinks.splice(at >= 0 ? at : sideLinks.length, 0, link);
            });
            headings.splice(at >= 0 ? at : headings.length, 0, heading);
            current = null;
            queue();
        };
    }
    initTableOfContents();

    // 9. Keyboard access to scrollable code blocks, tables and display formulas: anything that
    // overflows gets tabindex="0" so it can be scrolled with the arrow keys.
    function initScrollableFocus() {
        const sel = 'pre, table, .katex-display, .cite-view';
        function mark() {
            document.querySelectorAll(sel).forEach((n) => {
                const overflows = n.scrollWidth > n.clientWidth || n.scrollHeight > n.clientHeight;
                const own = n.getAttribute('data-scroll-focus') === '1';
                if (overflows && !n.hasAttribute('tabindex')) {
                    n.setAttribute('tabindex', '0');
                    n.setAttribute('data-scroll-focus', '1');
                } else if (!overflows && own) {
                    n.removeAttribute('tabindex');
                    n.removeAttribute('data-scroll-focus');
                }
            });
        }
        let t = null;
        function later() { clearTimeout(t); t = setTimeout(mark, 150); }
        window.addEventListener('resize', later);
        window.addEventListener('load', later);
        new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ['data-math'] });
        mark();
    }
    initScrollableFocus();

    // 10. Small accessibility and wayfinding helpers that apply to every page.
    function initA11yHelpers() {
        // Font Awesome icons are decoration: the text next to them carries the meaning.
        document.querySelectorAll('i.fas:not([aria-hidden]), i.far:not([aria-hidden]), i.fab:not([aria-hidden])').forEach((i) => i.setAttribute('aria-hidden', 'true'));
        // Breadcrumb bars that site_sync does not generate (hub children, glossary, quiz, map).
        document.querySelectorAll('div.article-breadcrumb-bar').forEach((bar) => {
            bar.setAttribute('role', 'navigation');
            bar.setAttribute('aria-label', 'Breadcrumb');
            bar.querySelectorAll('.article-breadcrumb-divider').forEach((d) => d.setAttribute('aria-hidden', 'true'));
            const last = bar.querySelector('span:last-child:not(.article-breadcrumb-divider)');
            if (last) last.setAttribute('aria-current', 'page');
        });
    }
    initA11yHelpers();

    // 11. "Contents" shortcut on narrow screens, where the side contents panel is hidden: appears once the
    // reader is past the in-page contents list and jumps back to it.
});
