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

    // 2. Build Title Bar for Mobile with Hamburger on Left & Centered GL Logo
    const titleBar = document.createElement('div');
    titleBar.id = 'titleBar';
    titleBar.innerHTML = `
        <a href="#navPanel" class="toggle" aria-label="Toggle Navigation">
            <i class="fas fa-bars"></i>
        </a>
        <a href="index.html" class="titleBar-logo" aria-label="Gerald Lê - Home">
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
        // Skip icon-only logo link in the mobile text drawer
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
});