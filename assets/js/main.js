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

    // 2. Build Title Bar for Mobile
    const logoEl = document.getElementById('logo');
    const logoHtml = logoEl ? logoEl.innerHTML : 'Khánh Giang "Gerald" Lê';
    
    const titleBar = document.createElement('div');
    titleBar.id = 'titleBar';
    titleBar.innerHTML = `
        <a href="#navPanel" class="toggle" aria-label="Toggle Navigation"></a>
        <span class="title">${logoHtml}</span>
    `;
    body.appendChild(titleBar);

    // 3. Build Mobile Nav Panel
    const desktopNavLinks = document.querySelectorAll('#nav ul li a');
    const navPanel = document.createElement('div');
    navPanel.id = 'navPanel';
    const panelNav = document.createElement('nav');

    desktopNavLinks.forEach(link => {
        // Skip icon-only logo link in the mobile text drawer
        const text = link.textContent.trim();
        if (!text) return;

        const a = document.createElement('a');
        a.className = 'link depth-0';
        a.href = link.getAttribute('href') || '#';
        if (link.getAttribute('target')) a.target = link.getAttribute('target');
        a.textContent = text;
        
        // Highlight active page link
        if (link.parentElement && link.parentElement.classList.contains('current')) {
            a.classList.add('active');
        }

        // Close drawer on link click
        a.addEventListener('click', () => {
            body.classList.remove('navPanel-visible');
        });

        panelNav.appendChild(a);
    });

    navPanel.appendChild(panelNav);
    body.appendChild(navPanel);

    // 4. Mobile Drawer Toggle & Dismiss Handlers
    const toggleBtn = titleBar.querySelector('.toggle');
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        body.classList.toggle('navPanel-visible');
    });

    // Close when clicking outside panel
    document.addEventListener('click', (e) => {
        if (body.classList.contains('navPanel-visible') && !navPanel.contains(e.target) && !titleBar.contains(e.target)) {
            body.classList.remove('navPanel-visible');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('navPanel-visible')) {
            body.classList.remove('navPanel-visible');
        }
    });
});