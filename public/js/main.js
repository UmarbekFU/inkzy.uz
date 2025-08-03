// Main JavaScript for Umarbek's Personal Website
// Progressive enhancement with accessibility focus

(function() {
    'use strict';

    // Utility functions
    const utils = {
        // Debounce function for performance
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function for scroll events
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Check if element is in viewport
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        // Smooth scroll to element
        scrollToElement: function(element, offset = 0) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        },

        // Get theme preference
        getTheme: function() {
            return localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        },

        // Set theme
        setTheme: function(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    };

    // Theme management
    const themeManager = {
        init: function() {
            const theme = utils.getTheme();
            utils.setTheme(theme);
            
            // Theme toggle button
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', this.toggleTheme.bind(this));
                themeToggle.setAttribute('aria-pressed', theme === 'dark');
            }
        },

        toggleTheme: function() {
            const currentTheme = utils.getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            utils.setTheme(newTheme);
            
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.setAttribute('aria-pressed', newTheme === 'dark');
            }
        }
    };

    // Navigation management
    const navigation = {
        init: function() {
            this.setupMobileMenu();
            this.setupActiveLinks();
            this.setupSmoothScrolling();
        },

        setupMobileMenu: function() {
            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (mobileMenuToggle && navMenu) {
                mobileMenuToggle.addEventListener('click', function() {
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    this.setAttribute('aria-expanded', !isExpanded);
                    navMenu.classList.toggle('active');
                });
            }
        },

        setupActiveLinks: function() {
            const navLinks = document.querySelectorAll('.nav-link');
            const sections = document.querySelectorAll('section[id]');
            
            const updateActiveLink = utils.throttle(() => {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    if (window.pageYOffset >= sectionTop - 200) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });
            }, 100);

            window.addEventListener('scroll', updateActiveLink);
        },

        setupSmoothScrolling: function() {
            const links = document.querySelectorAll('a[href^="#"]');
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        utils.scrollToElement(targetElement, 80);
                    }
                });
            });
        }
    };

    // Form handling
    const formHandler = {
        init: function() {
            this.setupNewsletterForm();
            this.setupContactForm();
        },

        setupNewsletterForm: function() {
            const form = document.getElementById('newsletterForm');
            if (form) {
                form.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
            }
        },

        setupContactForm: function() {
            const form = document.getElementById('contactForm');
            if (form) {
                form.addEventListener('submit', this.handleContactSubmit.bind(this));
            }
        },

        handleNewsletterSubmit: async function(e) {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Subscribing...';
                
                const formData = new FormData(form);
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.get('email'),
                        name: formData.get('name')
                    })
                });

                const result = await response.json();
                
                if (response.ok) {
                    this.showNotification('Successfully subscribed!', 'success');
                    form.reset();
                } else {
                    this.showNotification(result.error || 'Subscription failed', 'error');
                }
            } catch (error) {
                this.showNotification('Network error. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        },

        handleContactSubmit: async function(e) {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                
                const formData = new FormData(form);
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.get('name'),
                        email: formData.get('email'),
                        subject: formData.get('subject'),
                        message: formData.get('message')
                    })
                });

                const result = await response.json();
                
                if (response.ok) {
                    this.showNotification('Message sent successfully!', 'success');
                    form.reset();
                } else {
                    this.showNotification(result.error || 'Failed to send message', 'error');
                }
            } catch (error) {
                this.showNotification('Network error. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        },

        showNotification: function(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.setAttribute('role', 'alert');
            
            document.body.appendChild(notification);
            
            // Trigger reflow for animation
            notification.offsetHeight;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
    };

    // Analytics tracking
    const analytics = {
        init: function() {
            this.trackPageViews();
            this.trackEvents();
        },

        trackPageViews: function() {
            // Send page view to analytics
            if (typeof gtag !== 'undefined') {
                gtag('config', 'GA_MEASUREMENT_ID', {
                    page_title: document.title,
                    page_location: window.location.href
                });
            }
        },

        trackEvents: function() {
            // Track form submissions
            document.addEventListener('submit', function(e) {
                if (e.target.id === 'newsletterForm') {
                    this.trackEvent('newsletter_subscription', 'form_submit');
                } else if (e.target.id === 'contactForm') {
                    this.trackEvent('contact_form', 'form_submit');
                }
            }.bind(this));

            // Track external links
            document.addEventListener('click', function(e) {
                if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
                    this.trackEvent('external_link', 'click', {
                        link_url: e.target.href,
                        link_text: e.target.textContent
                    });
                }
            }.bind(this));
        },

        trackEvent: function(eventName, action, parameters = {}) {
            if (typeof gtag !== 'undefined') {
                gtag('event', action, {
                    event_category: eventName,
                    ...parameters
                });
            }
        }
    };

    // Performance optimizations
    const performance = {
        init: function() {
            this.setupLazyLoading();
            this.setupIntersectionObserver();
        },

        setupLazyLoading: function() {
            const images = document.querySelectorAll('img[data-src]');
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for older browsers
                images.forEach(img => {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                });
            }
        },

        setupIntersectionObserver: function() {
            const animatedElements = document.querySelectorAll('.animate-on-scroll');
            
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animated');
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });

                animatedElements.forEach(el => observer.observe(el));
            } else {
                // Fallback for older browsers
                animatedElements.forEach(el => el.classList.add('animated'));
            }
        }
    };

    // Accessibility enhancements
    const accessibility = {
        init: function() {
            this.setupSkipLinks();
            this.setupFocusManagement();
            this.setupKeyboardNavigation();
        },

        setupSkipLinks: function() {
            const skipLinks = document.querySelectorAll('.skip-link');
            skipLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.focus();
                        target.scrollIntoView();
                    }
                });
            });
        },

        setupFocusManagement: function() {
            // Trap focus in modals
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length > 0) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    modal.addEventListener('keydown', function(e) {
                        if (e.key === 'Tab') {
                            if (e.shiftKey) {
                                if (document.activeElement === firstElement) {
                                    e.preventDefault();
                                    lastElement.focus();
                                }
                            } else {
                                if (document.activeElement === lastElement) {
                                    e.preventDefault();
                                    firstElement.focus();
                                }
                            }
                        }
                    });
                }
            });
        },

        setupKeyboardNavigation: function() {
            // Handle keyboard navigation for custom components
            document.addEventListener('keydown', function(e) {
                // Escape key to close modals
                if (e.key === 'Escape') {
                    const openModal = document.querySelector('.modal.active');
                    if (openModal) {
                        openModal.classList.remove('active');
                    }
                }
            });
        }
    };

    // Initialize everything when DOM is ready
    function init() {
        themeManager.init();
        navigation.init();
        formHandler.init();
        analytics.init();
        performance.init();
        accessibility.init();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for use in other modules
    window.UmarbekApp = {
        utils,
        themeManager,
        navigation,
        formHandler,
        analytics,
        performance,
        accessibility
    };

})(); 