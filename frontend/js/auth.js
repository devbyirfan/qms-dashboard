document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 QMS Login Page Loaded');
    
    // Form submission
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }
        
        // Show loading state
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.classList.add('loading');
        loginBtn.querySelector('.btn-text').textContent = 'Logging in...';
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Login successful
                loginBtn.querySelector('.btn-text').textContent = 'Success!';
                loginBtn.querySelector('.btn-icon').innerHTML = '<i class="fas fa-check"></i>';
                
                // Save auth token
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('userInfo', JSON.stringify(result.user));
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = 'http://localhost:5000/dashboard';
                }, 1000);
            } else {
                // Login failed
                showError(result.message || 'Invalid username or password');
                resetButton();
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Server error. Please try again.');
            resetButton();
        }
    });
    
    // Remember me functionality
    const rememberMeCheckbox = document.getElementById('rememberMe');
    if (localStorage.getItem('rememberMe') === 'true') {
        rememberMeCheckbox.checked = true;
    }
    
    // Auto-fill if remembered
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername && rememberMeCheckbox.checked) {
        document.getElementById('username').value = savedUsername;
    }
    
    // Save username if remember me is checked
    rememberMeCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('savedUsername');
        }
    });
    
    // Input animations
    document.querySelectorAll('.input-wrapper input').forEach(input => {
        input.addEventListener('input', function() {
            if (this.value) {
                this.closest('.input-group').classList.add('focused');
            } else {
                this.closest('.input-group').classList.remove('focused');
            }
        });
    });
    
    // Floating label effect
    document.querySelectorAll('.input-wrapper input').forEach(input => {
        if (input.value) {
            input.closest('.input-group').classList.add('focused');
        }
    });
});

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.classList.add('show');
    
    // Shake animation
    const loginForm = document.getElementById('loginForm');
    loginForm.style.animation = 'shake 0.5s';
    setTimeout(() => {
        loginForm.style.animation = '';
    }, 500);
}

// Reset button state
function resetButton() {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.classList.remove('loading');
    loginBtn.querySelector('.btn-text').textContent = 'Login';
    loginBtn.querySelector('.btn-icon').innerHTML = '<i class="fas fa-arrow-right"></i>';
}

// Shake animation keyframes
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;
document.head.appendChild(style);