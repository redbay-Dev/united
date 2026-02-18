/**
 * United Civil Group - Main JavaScript
 * Multi-page safe: all DOM queries guarded for missing elements
 */
(function() {
    'use strict';

    // ========================================================================
    // Legacy hash redirect handler
    // Catches /#about, /#services etc. and redirects to new pages
    // ========================================================================
    var hashRedirects = {
        '#about': 'about.html',
        '#services': 'services.html',
        '#safety': 'about.html',
        '#contact': 'contact.html',
        '#equipment': 'index.html#equipment',
        '#home': 'index.html'
    };

    function handleLegacyHash() {
        var hash = window.location.hash;
        if (hash && hashRedirects[hash]) {
            var target = hashRedirects[hash];
            // Determine base path
            var base = window.location.pathname.indexOf('/services/') !== -1 ? '..' : '.';
            window.location.replace(base + '/' + target);
        }
    }

    // Run immediately on load
    handleLegacyHash();
    // Also listen for hashchange
    window.addEventListener('hashchange', handleLegacyHash);

    // ========================================================================
    // GSAP & ScrollTrigger Setup
    // ========================================================================
    function initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            return false;
        }
        gsap.registerPlugin(ScrollTrigger);
        gsap.defaults({ ease: 'power3.out', duration: 1 });
        return true;
    }

    // ========================================================================
    // Scroll Progress Indicator
    // ========================================================================
    function updateScrollProgress() {
        var scrollProgress = document.getElementById('scrollProgress');
        if (!scrollProgress) return;
        var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        var scrolled = (window.scrollY / scrollHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
    }

    // ========================================================================
    // Custom Cursor
    // ========================================================================
    function initCustomCursor() {
        var cursor = document.getElementById('cursor');
        var cursorFollower = document.getElementById('cursorFollower');
        if (!cursor || !cursorFollower) return;

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            cursor.style.display = 'none';
            cursorFollower.style.display = 'none';
            return;
        }

        var mouseX = 0, mouseY = 0;
        var cursorX = 0, cursorY = 0;
        var followerX = 0, followerY = 0;

        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        var interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .service-card, .equipment-card, .about-card, .safety-card');
        interactiveElements.forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            el.addEventListener('mouseleave', function() {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });

        document.addEventListener('mousedown', function() { cursorFollower.classList.add('clicking'); });
        document.addEventListener('mouseup', function() { cursorFollower.classList.remove('clicking'); });
    }

    // ========================================================================
    // Magnetic Button Effect
    // ========================================================================
    function initMagneticButtons() {
        document.querySelectorAll('.magnetic').forEach(function(el) {
            el.addEventListener('mousemove', function(e) {
                var rect = el.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = 'translate(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px)';
            });
            el.addEventListener('mouseleave', function() {
                el.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ========================================================================
    // Button Ripple Effect
    // ========================================================================
    function initRippleEffect() {
        document.querySelectorAll('.btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var rect = btn.getBoundingClientRect();
                var ripple = document.createElement('span');
                ripple.className = 'btn-ripple';
                ripple.style.left = (e.clientX - rect.left) + 'px';
                ripple.style.top = (e.clientY - rect.top) + 'px';
                ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
                btn.appendChild(ripple);
                ripple.addEventListener('animationend', function() { ripple.remove(); });
            });
        });
    }

    // ========================================================================
    // 3D Card Tilt Effect
    // ========================================================================
    function initTiltCards() {
        document.querySelectorAll('.service-card, .equipment-card, .about-card, .safety-card, .feature-card').forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
                var rect = this.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var rotateX = (y - rect.height / 2) / 12;
                var rotateY = (rect.width / 2 - x) / 12;
                this.style.transform = 'perspective(1000px) rotateX(' + (-rotateX) + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.03, 1.03, 1.03)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // ========================================================================
    // Counter Animation
    // ========================================================================
    function animateCounters() {
        document.querySelectorAll('[data-count]').forEach(function(counter) {
            var target = parseInt(counter.dataset.count);
            var suffix = counter.dataset.suffix || '';
            var duration = 2000;
            var startTime = null;
            var hasAnimated = false;

            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting && !hasAnimated) {
                        hasAnimated = true;
                        function animate(currentTime) {
                            if (!startTime) startTime = currentTime;
                            var progress = Math.min((currentTime - startTime) / duration, 1);
                            var easeOutQuart = 1 - Math.pow(1 - progress, 4);
                            counter.textContent = Math.floor(easeOutQuart * target) + suffix;
                            if (progress < 1) {
                                requestAnimationFrame(animate);
                            } else {
                                counter.textContent = target + suffix;
                            }
                        }
                        requestAnimationFrame(animate);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    // ========================================================================
    // GSAP Scroll Animations
    // ========================================================================
    function initGSAPAnimations() {
        if (!initGSAP()) return;

        var hero = document.querySelector('.hero');
        var heroBg = document.querySelector('.hero-bg');

        if (hero && heroBg) {
            gsap.to(heroBg, {
                y: 80,
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        }

        document.querySelectorAll('.equipment-icon').forEach(function(icon, index) {
            gsap.to(icon, {
                y: -6,
                duration: 2.5 + (index * 0.2),
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.15
            });
        });
    }

    // ========================================================================
    // Navigation - Scroll Effect
    // ========================================================================
    function handleNavScroll() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ========================================================================
    // Navigation - Mobile Toggle
    // ========================================================================
    function initMobileNav() {
        var navToggle = document.getElementById('navToggle');
        var navMenu = document.getElementById('navMenu');
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close on link click
        navMenu.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                // Don't close if this is a dropdown trigger on mobile
                if (link.classList.contains('nav-dropdown-trigger') && window.innerWidth <= 768) {
                    return;
                }
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ========================================================================
    // Nav Dropdown (mobile tap)
    // ========================================================================
    function initNavDropdown() {
        document.querySelectorAll('.nav-dropdown-trigger').forEach(function(trigger) {
            trigger.addEventListener('click', function(e) {
                // On mobile, toggle dropdown instead of navigating
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    var dropdown = trigger.closest('.nav-dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('open');
                    }
                }
            });
        });
    }

    // ========================================================================
    // Smooth Scroll (only for #hash links on the same page)
    // ========================================================================
    function initSmoothScroll() {
        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) return;
            var href = link.getAttribute('href');
            if (!href || href === '#') return;

            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                var headerOffset = 80;
                var elementPosition = target.getBoundingClientRect().top;
                var offsetPosition = elementPosition + window.scrollY - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
            // If target doesn't exist on this page, let the browser navigate normally
        });
    }

    // ========================================================================
    // Scroll Animations
    // ========================================================================
    function initScrollAnimations() {
        var elements = document.querySelectorAll('.animate-on-scroll');
        if (!elements.length) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        elements.forEach(function(el) { observer.observe(el); });
    }

    // ========================================================================
    // FAQ Accordion
    // ========================================================================
    function initFAQAccordion() {
        document.querySelectorAll('.faq-question').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var item = btn.closest('.faq-item');
                if (!item) return;

                // Close other open items in the same list
                var parent = item.closest('.faq-list');
                if (parent) {
                    parent.querySelectorAll('.faq-item.open').forEach(function(openItem) {
                        if (openItem !== item) openItem.classList.remove('open');
                    });
                }

                item.classList.toggle('open');
            });
        });
    }

    // ========================================================================
    // Contact Form: service pre-select from ?service= query param
    // ========================================================================
    function prefillServiceFromURL() {
        var params = new URLSearchParams(window.location.search);
        var service = params.get('service');
        if (!service) return;

        var select = document.getElementById('service');
        if (!select) return;

        // Map URL params to option values
        var map = {
            'remediation': 'remediation',
            'subdivisions': 'subdivisions',
            'infrastructure': 'infrastructure',
            'earthworks': 'earthworks'
        };

        if (map[service]) {
            select.value = map[service];
        }
    }

    // ========================================================================
    // Contact Form Handling
    // ========================================================================
    function initContactForm() {
        var contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        prefillServiceFromURL();

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            var formData = new FormData(contactForm);
            var data = Object.fromEntries(formData.entries());

            if (!data.name || !data.email || !data.message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            var turnstileEl = document.querySelector('[name="cf-turnstile-response"]');
            var turnstileToken = turnstileEl ? turnstileEl.value : '';
            if (!turnstileToken) {
                showNotification('Please complete the verification check.', 'error');
                return;
            }
            data.turnstileToken = turnstileToken;

            var submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            var originalHTML = submitBtn.textContent;

            try {
                var response = await fetch('https://contact.unitedcivil.com.au/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                var result = await response.json();

                if (result.success) {
                    showNotification('Thank you! Your message has been sent. We\'ll be in touch soon.', 'success');
                    contactForm.reset();

                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'generate_lead', {
                            'event_category': 'Contact',
                            'event_label': 'Contact Form Submission',
                            'value': 1
                        });
                    }

                    if (window.turnstile) { turnstile.reset(); }
                } else {
                    showNotification('Sorry, there was a problem sending your message. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('Sorry, there was a problem sending your message. Please try again.', 'error');
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                if (window.turnstile) { turnstile.reset(); }
            }
        });
    }

    // ========================================================================
    // Notification System
    // ========================================================================
    function showNotification(message, type) {
        type = type || 'success';
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();

        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;

        var content = document.createElement('div');
        content.className = 'notification-content';

        var iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('class', 'notification-icon');
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.setAttribute('fill', 'none');
        iconSvg.setAttribute('stroke', 'currentColor');
        iconSvg.setAttribute('stroke-width', '2');
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', type === 'success'
            ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
        iconSvg.appendChild(path);

        var span = document.createElement('span');
        span.textContent = message;

        content.appendChild(iconSvg);
        content.appendChild(span);
        notification.appendChild(content);

        var closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.addEventListener('click', function() { notification.remove(); });

        var closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        closeSvg.setAttribute('viewBox', '0 0 24 24');
        closeSvg.setAttribute('fill', 'none');
        closeSvg.setAttribute('stroke', 'currentColor');
        closeSvg.setAttribute('stroke-width', '2');
        var closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        closePath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
        closeSvg.appendChild(closePath);
        closeBtn.appendChild(closeSvg);

        notification.appendChild(closeBtn);

        // Inject notification styles if not present
        if (!document.getElementById('notification-styles')) {
            var styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = '.notification{position:fixed;bottom:24px;right:24px;display:flex;align-items:center;gap:12px;padding:16px 20px;background:#fff;border-radius:12px;box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);z-index:9999;animation:slideIn .3s ease;max-width:400px}.notification-success{border-left:4px solid #10b981}.notification-error{border-left:4px solid #ef4444}.notification-content{display:flex;align-items:center;gap:12px}.notification-icon{width:24px;height:24px;flex-shrink:0}.notification-success .notification-icon{color:#10b981}.notification-error .notification-icon{color:#ef4444}.notification span{font-size:14px;color:#374151}.notification-close{background:none;border:none;padding:4px;cursor:pointer;color:#9ca3af;transition:color .2s}.notification-close:hover{color:#374151}.notification-close svg{width:20px;height:20px}@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@media(max-width:480px){.notification{left:16px;right:16px;bottom:16px;max-width:none}}';
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        setTimeout(function() {
            if (notification.parentElement) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(function() { notification.remove(); }, 300);
            }
        }, 5000);
    }

    // ========================================================================
    // Active Navigation Highlight (for pages with sections)
    // ========================================================================
    function highlightActiveNav() {
        var sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        var scrollPosition = window.scrollY + 100;
        sections.forEach(function(section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(function(link) {
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ========================================================================
    // Initialize
    // ========================================================================
    function init() {
        // Bind after components are loaded (nav/footer injected)
        window.addEventListener('componentsLoaded', function() {
            initMobileNav();
            initNavDropdown();
            initCustomCursor();
            initMagneticButtons();
            initRippleEffect();

            // Initialize Lucide icons (some may be in injected content)
            if (window.lucide) { lucide.createIcons(); }
        });

        // These don't depend on nav injection
        initSmoothScroll();
        initScrollAnimations();
        initTiltCards();
        animateCounters();
        initFAQAccordion();
        initContactForm();

        // Scroll handlers
        window.addEventListener('scroll', function() {
            handleNavScroll();
            highlightActiveNav();
            updateScrollProgress();
        }, { passive: true });

        // Initial calls
        handleNavScroll();
        updateScrollProgress();

        // GSAP animations
        setTimeout(function() { initGSAPAnimations(); }, 100);

        // Resize handler
        var resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }, 200);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
