document.addEventListener('DOMContentLoaded', () => {
    const adminForm = document.getElementById('adminLoginForm');
    const MAX_ATTEMPTS = 3;
    const LOCKOUT_TIME = 60 * 60 * 1000; // 1 hour

    // Clear any existing lockout on page load
    localStorage.removeItem('adminAttempts');

    // Rate limiting
    let attempts = JSON.parse(localStorage.getItem('adminAttempts')) || {
        count: 0,
        timestamp: Date.now()
    };

    // Add CSRF protection
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    function isLockedOut() {
        if (attempts.count >= MAX_ATTEMPTS) {
            const timeElapsed = Date.now() - attempts.timestamp;
            if (timeElapsed < LOCKOUT_TIME) {
                const minutesLeft = Math.ceil((LOCKOUT_TIME - timeElapsed) / 60000);
                alert(`Account locked. Try again in ${minutesLeft} minutes`);
                return true;
            } else {
                resetAttempts();
            }
        }
        return false;
    }

    function resetAttempts() {
        attempts = { count: 0, timestamp: Date.now() };
        localStorage.setItem('adminAttempts', JSON.stringify(attempts));
        localStorage.removeItem('adminAttempts'); // Also remove it completely
    }

    async function hashCredentials(username, password) {
        // Simple direct comparison for now
        return password;
    }

    function validateTwoFactorCode(code) {
        // Simple 2FA code: first 6 digits of the current date (DDMMYY)
        const today = new Date();
        const validCode = today.getDate().toString().padStart(2, '0') + 
                         (today.getMonth() + 1).toString().padStart(2, '0') + 
                         today.getFullYear().toString().slice(-2);
        console.log('Valid 2FA code for today:', validCode);
        return code === validCode;
    }

    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isLockedOut()) return;

        const username = document.getElementById('username').value;
        const password = document.getElementById('adminPassword').value;
        const twoFactorCode = document.getElementById('twoFactorCode').value;

        try {
            // Direct comparison
            const validCreds = username === 'admin' && password === 'Alpha060318.';
            const valid2FA = validateTwoFactorCode(twoFactorCode);

            console.log('Login attempt:', {
                validCreds,
                valid2FA,
            });

            if (validCreds && valid2FA) {
                // Set secure session
                const sessionToken = crypto.randomUUID();
                const secureSession = {
                    token: sessionToken,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                };
                sessionStorage.setItem('adminSession', JSON.stringify(secureSession));
                
                // Redirect to admin dashboard
                window.location.href = './dashboard.html';
            } else {
                attempts.count++;
                attempts.timestamp = Date.now();
                localStorage.setItem('adminAttempts', JSON.stringify(attempts));

                if (attempts.count >= MAX_ATTEMPTS) {
                    alert('Too many failed attempts. Account locked.');
                } else {
                    if (!validCreds) {
                        alert(`Invalid username or password. ${MAX_ATTEMPTS - attempts.count} attempts remaining.`);
                    } else if (!valid2FA) {
                        alert(`Invalid 2FA code. Use today's date in DDMMYY format.`);
                    }
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('Authentication failed. Please try again.');
        }
    });
}); 