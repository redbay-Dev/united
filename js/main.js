/**
 * United Civil Group - Enhanced JavaScript
 * Modern animations, interactivity, and GSAP-powered effects
 */

(function() {
    'use strict';

    // ========================================================================
    // DOM Elements
    // ========================================================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contactForm');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const scrollProgress = document.getElementById('scrollProgress');
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');

    // ========================================================================
    // GSAP & ScrollTrigger Setup
    // ========================================================================
    function initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP not loaded, falling back to CSS animations');
            return false;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Set default ease
        gsap.defaults({
            ease: 'power3.out',
            duration: 1
        });

        return true;
    }

    // ========================================================================
    // Scroll Progress Indicator
    // ========================================================================
    function updateScrollProgress() {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / scrollHeight) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = `${scrolled}%`;
        }
    }

    // ========================================================================
    // Custom Cursor
    // ========================================================================
    function initCustomCursor() {
        if (!cursor || !cursorFollower) return;

        // Check for touch device
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            cursor.style.display = 'none';
            cursorFollower.style.display = 'none';
            return;
        }

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor animation
        function animateCursor() {
            // Cursor follows immediately
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;

            // Follower lags behind
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effects on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .service-card, .equipment-card, .about-card, .safety-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });

        // Click effect
        document.addEventListener('mousedown', () => {
            cursorFollower.classList.add('clicking');
        });
        document.addEventListener('mouseup', () => {
            cursorFollower.classList.remove('clicking');
        });
    }

    // ========================================================================
    // Magnetic Button Effect
    // ========================================================================
    function initMagneticButtons() {
        const magneticElements = document.querySelectorAll('.magnetic');

        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const strength = 0.3;
                el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ========================================================================
    // Button Ripple Effect
    // ========================================================================
    function initRippleEffect() {
        const buttons = document.querySelectorAll('.btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;

                btn.appendChild(ripple);

                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });
            });
        });
    }

    // ========================================================================
    // 3D Card Tilt Effect
    // ========================================================================
    function initTiltCards() {
        const cards = document.querySelectorAll('.service-card, .equipment-card, .about-card, .safety-card, .feature-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 12;
                const rotateY = (centerX - x) / 12;

                this.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // ========================================================================
    // Enhanced Counter Animation
    // ========================================================================
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');

        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const suffix = counter.dataset.suffix || '';
            const duration = 2000;
            let startTime = null;
            let hasAnimated = false;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAnimated) {
                        hasAnimated = true;

                        function animate(currentTime) {
                            if (!startTime) startTime = currentTime;
                            const progress = Math.min((currentTime - startTime) / duration, 1);

                            // Easing function for smooth animation
                            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                            const current = Math.floor(easeOutQuart * target);

                            counter.textContent = current + suffix;

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

        // Also animate feature-number elements without data attributes (legacy support)
        const legacyCounters = document.querySelectorAll('.feature-number:not([data-count])');
        legacyCounters.forEach(counter => {
            const text = counter.innerText;
            const target = parseInt(text.replace(/\D/g, ''));
            const suffix = text.replace(/[0-9]/g, '');

            if (isNaN(target)) return;

            let hasAnimated = false;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAnimated) {
                        hasAnimated = true;
                        let current = 0;
                        const increment = target / 50;
                        const stepTime = 30;

                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.innerText = Math.floor(current) + suffix;
                                setTimeout(updateCounter, stepTime);
                            } else {
                                counter.innerText = target + suffix;
                            }
                        };

                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    // ========================================================================
    // GSAP Scroll Animations (Safe - no opacity changes that hide content)
    // ========================================================================
    function initGSAPAnimations() {
        if (!initGSAP()) return;

        // Hero section parallax only (no opacity changes)
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        const heroBg = document.querySelector('.hero-bg');

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

        // Equipment icons gentle float animation
        const equipmentIcons = document.querySelectorAll('.equipment-icon');
        equipmentIcons.forEach((icon, index) => {
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
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ========================================================================
    // Navigation - Mobile Toggle
    // ========================================================================
    function toggleMobileNav() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileNavOnClick() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================================================
    // Smooth Scroll
    // ========================================================================
    function smoothScroll(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            closeMobileNavOnClick();
        }
    }

    // ========================================================================
    // Scroll Animations (subtle - content always visible)
    // ========================================================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // ========================================================================
    // Contact Form Handling
    // ========================================================================
    async function handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.email || !data.message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!turnstileToken) {
            showNotification('Please complete the verification check.', 'error');
            return;
        }
        data.turnstileToken = turnstileToken;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://contact.unitedcivil.com.au/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                showNotification('Thank you! Your message has been sent. We\'ll be in touch soon.', 'success');
                contactForm.reset();

                // Track conversion in Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'generate_lead', {
                        'event_category': 'Contact',
                        'event_label': 'Contact Form Submission',
                        'value': 1
                    });
                }

                // Success celebration animation
                if (typeof gsap !== 'undefined') {
                    gsap.to(submitBtn, {
                        scale: 1.1,
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1
                    });
                }

                if (window.turnstile) {
                    turnstile.reset();
                }
            } else {
                showNotification('Sorry, there was a problem sending your message. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('Sorry, there was a problem sending your message. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            if (window.turnstile) {
                turnstile.reset();
            }
        }
    }

    // ========================================================================
    // Notification System
    // ========================================================================
    function showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${type === 'success'
                        ? '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
                        : '<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
                    }
                </svg>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                }
                .notification-success { border-left: 4px solid #10b981; }
                .notification-error { border-left: 4px solid #ef4444; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .notification-icon {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                }
                .notification-success .notification-icon { color: #10b981; }
                .notification-error .notification-icon { color: #ef4444; }
                .notification span {
                    font-size: 14px;
                    color: #374151;
                }
                .notification-close {
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    color: #9ca3af;
                    transition: color 0.2s;
                }
                .notification-close:hover { color: #374151; }
                .notification-close svg {
                    width: 20px;
                    height: 20px;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @media (max-width: 480px) {
                    .notification {
                        left: 16px;
                        right: 16px;
                        bottom: 16px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Animate in with GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.from(notification, {
                x: 100,
                opacity: 0,
                duration: 0.4,
                ease: 'back.out(1.7)'
            });
        }

        setTimeout(() => {
            if (notification.parentElement) {
                if (typeof gsap !== 'undefined') {
                    gsap.to(notification, {
                        x: 100,
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => notification.remove()
                    });
                } else {
                    notification.style.animation = 'slideIn 0.3s ease reverse';
                    setTimeout(() => notification.remove(), 300);
                }
            }
        }, 5000);
    }

    // ========================================================================
    // Active Navigation Highlight
    // ========================================================================
    function highlightActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ========================================================================
    // Smooth Section Reveal on Scroll
    // ========================================================================
    function initSectionReveals() {
        const sections = document.querySelectorAll('.section');

        sections.forEach(section => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(section);
        });
    }

    // ========================================================================
    // Image Lazy Loading with Reveal
    // ========================================================================
    function initImageReveals() {
        const images = document.querySelectorAll('.image-reveal');

        images.forEach(image => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(image);
        });
    }

    // ========================================================================
    // Text Reveal Animation
    // ========================================================================
    function initTextReveals() {
        const textElements = document.querySelectorAll('.text-reveal');

        textElements.forEach(el => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lines = entry.target.querySelectorAll('.text-reveal-line');
                        lines.forEach((line, index) => {
                            setTimeout(() => {
                                line.classList.add('revealed');
                            }, index * 100);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(el);
        });
    }

    // ========================================================================
    // Preloader (Optional - for heavier sites)
    // ========================================================================
    function hidePreloader() {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 500);
        }
    }

    // ========================================================================
    // Initialize All Functions
    // ========================================================================
    function init() {
        // Event Listeners
        window.addEventListener('scroll', () => {
            handleNavScroll();
            highlightActiveNav();
            updateScrollProgress();
        }, { passive: true });

        if (navToggle) {
            navToggle.addEventListener('click', toggleMobileNav);
        }

        navLinks.forEach(link => {
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', smoothScroll);
            }
        });

        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }

        // Initialize enhanced animations
        initScrollAnimations();
        initCustomCursor();
        initMagneticButtons();
        initRippleEffect();
        initTiltCards();
        animateCounters();

        // Initialize GSAP animations last (after DOM is ready)
        setTimeout(() => {
            initGSAPAnimations();
        }, 100);

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Initial calls
        handleNavScroll();
        highlightActiveNav();
        updateScrollProgress();

        // Hide preloader if exists
        hidePreloader();

        // Handle ESC key for mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileNavOnClick();
            }
        });

        // Recalculate on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }, 200);
        });

        console.log('United Civil Group - Enhanced animations loaded');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
