/**
 * United Civil Group - Main JavaScript
 * Handles navigation, animations, and interactivity
 */

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contactForm');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    /**
     * Navigation - Scroll Effect
     * Adds background to navbar on scroll
     */
    function handleNavScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /**
     * Navigation - Mobile Toggle
     * Handles mobile menu open/close
     */
    function toggleMobileNav() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    /**
     * Navigation - Close on Link Click
     * Closes mobile menu when a link is clicked
     */
    function closeMobileNavOnClick() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Smooth Scroll
     * Handles smooth scrolling for anchor links
     */
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

            // Close mobile nav if open
            closeMobileNavOnClick();
        }
    }

    /**
     * Scroll Animations
     * Intersection Observer for scroll-triggered animations
     */
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered delay based on element position
                    const delay = index * 100;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);

                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Contact Form Handling
     * Sends form data to Cloudflare Worker which emails via SMTP2GO
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!data.name || !data.email || !data.message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Get Turnstile token
        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!turnstileToken) {
            showNotification('Please complete the verification check.', 'error');
            return;
        }
        data.turnstileToken = turnstileToken;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Sending...</span>';
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
                // Reset Turnstile widget
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
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            // Reset Turnstile on any completion
            if (window.turnstile) {
                turnstile.reset();
            }
        }
    }

    /**
     * Notification System
     * Shows temporary notification messages
     */
    function showNotification(message, type = 'success') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
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

        // Add styles if not already present
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
                .notification-success {
                    border-left: 4px solid #10b981;
                }
                .notification-error {
                    border-left: 4px solid #ef4444;
                }
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
                .notification-success .notification-icon {
                    color: #10b981;
                }
                .notification-error .notification-icon {
                    color: #ef4444;
                }
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
                .notification-close:hover {
                    color: #374151;
                }
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

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    /**
     * Active Navigation Highlight
     * Highlights current section in navigation
     */
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

    /**
     * Counter Animation
     * Animates numbers counting up
     */
    function animateCounters() {
        const counters = document.querySelectorAll('.feature-number');

        counters.forEach(counter => {
            const target = parseInt(counter.innerText.replace(/\D/g, ''));
            const suffix = counter.innerText.replace(/[0-9]/g, '');
            let current = 0;
            const increment = target / 50;
            const duration = 1500;
            const stepTime = duration / 50;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.floor(current) + suffix;
                    setTimeout(updateCounter, stepTime);
                } else {
                    counter.innerText = target + suffix;
                }
            };

            // Start animation when element is in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    /**
     * Parallax Effect
     * Subtle parallax on hero section
     */
    function initParallax() {
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');

        if (hero && heroContent) {
            window.addEventListener('scroll', () => {
                const scrolled = window.scrollY;
                const rate = scrolled * 0.3;

                if (scrolled < hero.offsetHeight) {
                    heroContent.style.transform = `translateY(${rate}px)`;
                    heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight);
                }
            });
        }
    }

    /**
     * Initialize All Functions
     */
    function init() {
        // Event Listeners
        window.addEventListener('scroll', handleNavScroll);
        window.addEventListener('scroll', highlightActiveNav);

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

        // Initialize animations
        initScrollAnimations();
        animateCounters();
        initParallax();

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Initial calls
        handleNavScroll();
        highlightActiveNav();

        // Handle ESC key for mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileNavOnClick();
            }
        });
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
