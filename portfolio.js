document.addEventListener('DOMContentLoaded', () => {
    const passwordScreen = document.getElementById('passwordScreen');
    const portfolioContent = document.getElementById('portfolioContent');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submitPassword');
    const passwordForm = document.getElementById('passwordForm');
    const attemptsLeft = document.getElementById('attemptsLeft');

    // Enhanced security configuration
    const SECURITY_CONFIG = {
        MAX_ATTEMPTS: 5,
        LOCKOUT_TIME: 30 * 60 * 1000, // 30 minutes
        SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
        ACCESS_CODES: [
            'please', // Default access code
            'umarbek2024', // Alternative code
            'portfolio-access', // Another option
            'antifragile' // Philosophy-inspired code
        ],
        HASH_SALT: 'umarbek_portfolio_2024'
    };

    // Rate limiting and security state
    let securityState = JSON.parse(localStorage.getItem('portfolioSecurityState')) || {
        attempts: { count: 0, timestamp: Date.now() },
        lastAccess: null,
        sessionId: null
    };

    // Check if user is locked out
    function isLockedOut() {
        if (securityState.attempts.count >= SECURITY_CONFIG.MAX_ATTEMPTS) {
            const timeElapsed = Date.now() - securityState.attempts.timestamp;
            if (timeElapsed < SECURITY_CONFIG.LOCKOUT_TIME) {
                const minutesLeft = Math.ceil((SECURITY_CONFIG.LOCKOUT_TIME - timeElapsed) / 60000);
                passwordInput.placeholder = `Account locked. Try again in ${minutesLeft} minutes`;
                passwordInput.disabled = true;
                submitButton.disabled = true;
                attemptsLeft.textContent = `Locked out for ${minutesLeft} more minutes`;
                return true;
            } else {
                // Reset attempts after lockout period
                resetSecurityState();
            }
        }
        return false;
    }

    function resetSecurityState() {
        securityState.attempts = { count: 0, timestamp: Date.now() };
        securityState.sessionId = generateSessionId();
        localStorage.setItem('portfolioSecurityState', JSON.stringify(securityState));
        passwordInput.disabled = false;
        submitButton.disabled = false;
        passwordInput.placeholder = 'Enter access code';
        attemptsLeft.textContent = '';
    }

    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function hashPassword(password) {
        // Simple hash function - in production, use a proper cryptographic hash
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36) + SECURITY_CONFIG.HASH_SALT;
    }

    function validateAccessCode(password) {
        const hashedInput = hashPassword(password);
        return SECURITY_CONFIG.ACCESS_CODES.some(code => {
            const hashedCode = hashPassword(code);
            return hashedInput === hashedCode;
        });
    }

    function checkSessionValidity() {
        if (!securityState.lastAccess || !securityState.sessionId) return false;
        
        const sessionAge = Date.now() - securityState.lastAccess;
        return sessionAge < SECURITY_CONFIG.SESSION_DURATION;
    }

    // Initialize page state
    function initializePage() {
        if (isLockedOut()) {
            passwordScreen.classList.add('show');
            portfolioContent.classList.add('hide');
            return;
        }

        // Check if user has valid session
        if (checkSessionValidity()) {
            showPortfolio();
        } else {
            // Clear expired session
            securityState.lastAccess = null;
            securityState.sessionId = null;
            localStorage.setItem('portfolioSecurityState', JSON.stringify(securityState));
            
            passwordScreen.classList.add('show');
            portfolioContent.classList.add('hide');
            passwordInput.focus();
        }
    }

    function showPortfolio() {
        passwordScreen.classList.remove('show');
        portfolioContent.classList.remove('hide');
        portfolioContent.classList.add('show');
        
        // Update session
        securityState.lastAccess = Date.now();
        localStorage.setItem('portfolioSecurityState', JSON.stringify(securityState));
        
        initPortfolioAnimations();
    }

    function handlePassword(event) {
        event.preventDefault();
        
        if (isLockedOut()) return;

        const password = passwordInput.value.trim();
        
        if (validateAccessCode(password)) {
            resetSecurityState();
            showPortfolio();
            
            // Log successful access (for analytics)
            console.log('Portfolio accessed successfully');
        } else {
            securityState.attempts.count++;
            securityState.attempts.timestamp = Date.now();
            localStorage.setItem('portfolioSecurityState', JSON.stringify(securityState));

            passwordInput.value = '';
            passwordInput.classList.add('error');
            
            if (securityState.attempts.count >= SECURITY_CONFIG.MAX_ATTEMPTS) {
                passwordInput.placeholder = 'Too many attempts. Account locked.';
                passwordInput.disabled = true;
                submitButton.disabled = true;
                attemptsLeft.textContent = `Account locked for ${Math.ceil(SECURITY_CONFIG.LOCKOUT_TIME / 60000)} minutes`;
            } else {
                const attemptsLeftCount = SECURITY_CONFIG.MAX_ATTEMPTS - securityState.attempts.count;
                passwordInput.placeholder = `Incorrect code. ${attemptsLeftCount} attempts remaining`;
                attemptsLeft.textContent = `${attemptsLeftCount} attempts remaining`;
            }
            
            // Remove error class after animation
            setTimeout(() => {
                passwordInput.classList.remove('error');
            }, 500);
        }
    }

    // Event listeners
    passwordForm.addEventListener('submit', handlePassword);
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePassword(e);
        }
    });

    // Focus management
    passwordInput.addEventListener('focus', () => {
        if (!isLockedOut()) {
            passwordInput.classList.remove('error');
        }
    });

    // Initialize page
    initializePage();

    function initPortfolioAnimations() {
        // Animate portfolio header
        gsap.from('.portfolio-header', {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        // Animate portfolio items with stagger
        gsap.from('.portfolio-item', {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            delay: 0.3
        });

        // Animate back link
        gsap.from('.back-link', {
            x: -20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.5
        });
    }

    // Security monitoring
    function logSecurityEvent(event, details = {}) {
        const logEntry = {
            timestamp: Date.now(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            sessionId: securityState.sessionId
        };
        
        // In production, send this to a secure logging service
        console.log('Security Event:', logEntry);
    }

    // Monitor for suspicious activity
    let rapidAttempts = 0;
    let lastAttemptTime = 0;
    
    function checkForSuspiciousActivity() {
        const now = Date.now();
        if (now - lastAttemptTime < 1000) { // Less than 1 second between attempts
            rapidAttempts++;
            if (rapidAttempts > 3) {
                logSecurityEvent('suspicious_rapid_attempts', { count: rapidAttempts });
                // Could implement additional security measures here
            }
        } else {
            rapidAttempts = 0;
        }
        lastAttemptTime = now;
    }

    // Enhanced password handling with security monitoring
    const originalHandlePassword = handlePassword;
    function enhancedHandlePassword(event) {
        checkForSuspiciousActivity();
        logSecurityEvent('password_attempt', { 
            timestamp: Date.now(),
            inputLength: passwordInput.value.length 
        });
        return originalHandlePassword(event);
    }

    // Replace the event listener with enhanced version
    passwordForm.removeEventListener('submit', handlePassword);
    passwordForm.addEventListener('submit', enhancedHandlePassword);
}); 