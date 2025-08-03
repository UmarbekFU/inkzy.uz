document.addEventListener('DOMContentLoaded', () => {
    initPortfolioProtection();
    initMobileMenu();
    initNewsletterForm();
    initBottomNavigation();
    initThemeToggle();
});

// Portfolio protection functionality
function initPortfolioProtection() {
    const portfolioLink = document.getElementById('portfolioLink');
    const modal = document.getElementById('portfolioModal');
    const closeModal = document.getElementById('closeModal');
    const submitPassword = document.getElementById('submitPassword');
    const passwordInput = document.getElementById('portfolioPassword');

    if (!portfolioLink || !modal || !closeModal || !submitPassword || !passwordInput) return;

    portfolioLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        passwordInput.focus();
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        passwordInput.value = '';
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitPassword.click();
        }
    });

    submitPassword.addEventListener('click', () => {
        const password = passwordInput.value;
        // Replace 'antifragile' with your actual secret word
        if (password === 'antifragile') {
            sessionStorage.setItem('portfolioAccess', 'true');
            window.location.href = './portfolio.html';
        } else {
            passwordInput.value = '';
            passwordInput.placeholder = 'Wrong secret word. Try again.';
            passwordInput.classList.add('error');
            setTimeout(() => {
                passwordInput.classList.remove('error');
                passwordInput.placeholder = 'Secret word';
            }, 2000);
        }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            passwordInput.value = '';
        }
    });

    // Close modal with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            passwordInput.value = '';
        }
    });
}

// CSRF Protection
function addCSRFToken() {
    const token = Math.random().toString(36).slice(2) + Date.now();
    sessionStorage.setItem('csrfToken', token);
    return token;
}

function validateCSRFToken(token) {
    return token === sessionStorage.getItem('csrfToken');
}

// Add to all forms
document.querySelectorAll('form').forEach(form => {
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    csrfInput.value = addCSRFToken();
    form.appendChild(csrfInput);
});

// Input Sanitization
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Use for all user inputs
document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', (e) => {
        e.target.value = sanitizeInput(e.target.value);
    });
});

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;

    if (!mobileMenuToggle || !mainNav || !mobileMenuOverlay) return;

    function toggleMobileMenu() {
        const isOpen = mainNav.classList.contains('active');
        
        if (isOpen) {
            // Close menu
            mainNav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            body.classList.remove('menu-open');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuOverlay.setAttribute('aria-hidden', 'true');
        } else {
            // Open menu
            mainNav.classList.add('active');
            mobileMenuToggle.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            body.classList.add('menu-open');
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
            mobileMenuOverlay.setAttribute('aria-hidden', 'false');
        }
    }

    // Event listeners
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    mobileMenuOverlay.addEventListener('click', toggleMobileMenu);

    // Close menu with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // Close menu when clicking on navigation links
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
}

// Newsletter form functionality
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const nameInput = form.querySelector('#name');
        const emailInput = form.querySelector('#email');
        
        // Basic validation
        if (!nameInput.value.trim() || !emailInput.value.trim()) {
            showFormMessage(form, 'Please fill in all fields.', 'error');
            return;
        }
        
        if (!isValidEmail(emailInput.value)) {
            showFormMessage(form, 'Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        form.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Success
            showFormMessage(form, 'Thank you! Your message has been sent.', 'success');
            form.reset();
            
        } catch (error) {
            // Error
            showFormMessage(form, 'Sorry, something went wrong. Please try again.', 'error');
        } finally {
            // Remove loading state
            form.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

function showFormMessage(form, message, type) {
    // Remove existing messages
    const existingMessages = form.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message form-message-${type}`;
    messageElement.textContent = message;
    
    // Add to form
    form.appendChild(messageElement);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initBottomNavigation() {
    const bottomNav = document.getElementById('bottomNav');
    if (!bottomNav) return;

    let isVisible = false;
    let scrollTimeout;

    function checkScrollPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

        // Show navigation when user scrolls to 95% of the page (even later)
        if (scrollPercentage > 0.95 && !isVisible) {
            bottomNav.classList.add('show');
            isVisible = true;
        } else if (scrollPercentage <= 0.95 && isVisible) {
            bottomNav.classList.remove('show');
            isVisible = false;
        }
    }

    // Throttle scroll events for better performance
    function throttledCheckScroll() {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
            checkScrollPosition();
            scrollTimeout = null;
        }, 100);
    }

    window.addEventListener('scroll', throttledCheckScroll);
    
    // Initial check
    checkScrollPosition();
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Listen for system theme changes
    const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    systemThemeMedia.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
    
    // Theme toggle button
    themeToggle?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    darkModeToggle?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}