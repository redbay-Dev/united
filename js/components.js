/**
 * United Civil Group - Component Loader
 * Fetches and injects shared header/footer partials from /includes/.
 * These are first-party HTML files served from the same origin —
 * no user-generated content is injected.
 */
(function () {
    'use strict';

    // Determine base path from current page depth
    function getBasePath() {
        var path = window.location.pathname;
        if (path.indexOf('/services/') !== -1) {
            return '..';
        }
        return '.';
    }

    var BASE = getBasePath();

    /**
     * Fetches a same-origin HTML partial and places it inside the target element.
     * Safe: only loads from our own /includes/ directory, never from external or
     * user-supplied sources.
     */
    function injectComponent(url, targetId) {
        var el = document.getElementById(targetId);
        if (!el) return Promise.resolve();

        return fetch(url)
            .then(function (res) { return res.text(); })
            .then(function (html) {
                html = html.replace(/\{\{BASE\}\}/g, BASE);
                // Using DOM parsing instead of innerHTML for safety
                var doc = new DOMParser().parseFromString(html, 'text/html');
                el.textContent = ''; // clear
                Array.from(doc.body.childNodes).forEach(function (node) {
                    el.appendChild(document.importNode(node, true));
                });
            })
            .catch(function (err) {
                console.warn('Failed to load component: ' + url, err);
            });
    }

    function setActiveNav() {
        var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
        if (currentPath.endsWith('/index.html')) {
            currentPath = currentPath.replace('/index.html', '/');
        }

        var links = document.querySelectorAll('.nav-link, .footer-column a');
        links.forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href) return;

            var a = document.createElement('a');
            a.href = href;
            var linkPath = a.pathname.replace(/\/$/, '') || '/';
            if (linkPath.endsWith('/index.html')) {
                linkPath = linkPath.replace('/index.html', '/');
            }

            if (linkPath === currentPath) {
                link.classList.add('active');
                var parent = link.closest('.nav-dropdown');
                if (parent) {
                    var trigger = parent.querySelector('.nav-dropdown-trigger');
                    if (trigger) trigger.classList.add('active');
                }
            }
        });
    }

    function updateCopyrightYear() {
        var el = document.getElementById('footer-year');
        if (el) {
            el.textContent = new Date().getFullYear();
        }
    }

    Promise.all([
        injectComponent(BASE + '/includes/header.html', 'site-header'),
        injectComponent(BASE + '/includes/footer.html', 'site-footer')
    ]).then(function () {
        setActiveNav();
        updateCopyrightYear();
        window.dispatchEvent(new CustomEvent('componentsLoaded'));
    });

})();
