// authManager.js - Authentication Management Module
// Handles user authentication, session management, and UI state

// Authentication state
let currentUser = null;
let authToken = null;

// Export authentication state getters
export function getCurrentUser() {
    return currentUser;
}

export function getAuthToken() {
    return authToken;
}

export function isAuthenticated() {
    return authToken !== null && currentUser !== null;
}

// Check if user is already authenticated (token in localStorage)
export function checkAuthenticationStatus() {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        try {
            authToken = storedToken;
            currentUser = JSON.parse(storedUser);
            console.log('✅ User already logged in:', currentUser.username);
            return true;
        } catch (error) {
            console.log('Invalid stored auth data, clearing...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            return false;
        }
    }
    return false;
}

// Show authentication form (login/register)
export function showAuthenticationForm() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <h1>Police Body Camera System</h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
            Officer Authentication Required
        </p>
        
        <div class="auth-container">
            <div class="auth-tabs">
                <button id="loginTab" class="auth-tab active" onclick="window.showLoginForm()">Login</button>
                <button id="registerTab" class="auth-tab" onclick="window.showRegisterForm()">Register</button>
            </div>
            
            <!-- Login Form -->
            <div id="loginForm" class="auth-form">
                <h3>👮 Officer Login</h3>
                <form id="loginFormElement">
                    <div class="form-field">
                        <label for="loginUsername">Username:</label>
                        <input type="text" id="loginUsername" required>
                    </div>
                    <div class="form-field">
                        <label for="loginPassword">Password:</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="auth-btn">🔑 Login</button>
                </form>
            </div>
            
            <!-- Register Form -->
            <div id="registerForm" class="auth-form" style="display: none;">
                <h3>👮 New Officer Registration</h3>
                <form id="registerFormElement">
                    <div class="form-field">
                        <label for="registerUsername">Username:</label>
                        <input type="text" id="registerUsername" required>
                    </div>
                    <div class="form-field">
                        <label for="registerEmail">Email:</label>
                        <input type="email" id="registerEmail" required>
                    </div>
                    <div class="form-field">
                        <label for="registerPassword">Password:</label>
                        <input type="password" id="registerPassword" required minlength="6">
                    </div>
                    <button type="submit" class="auth-btn">Register</button>
                </form>
            </div>
            
            <div id="authMessage" class="auth-message"></div>
        </div>
    `;
    
    // Set up authentication form listeners
    setupAuthenticationListeners();
}

// Set up authentication form event listeners
function setupAuthenticationListeners() {
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('authMessage');
    
    try {
        messageDiv.innerHTML = '<div class="loading-message">🔄 Logging in...</div>';
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store authentication data
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            messageDiv.innerHTML = '<div class="success-message">Login successful!</div>';
            
            console.log('✅ User logged in:', currentUser.username);
            
            // Trigger main app display after brief delay
            setTimeout(() => {
                // Dispatch custom event for main app to handle
                document.dispatchEvent(new CustomEvent('authenticationSuccess', {
                    detail: { user: currentUser, token: authToken }
                }));
            }, 1000);
            
        } else {
            messageDiv.innerHTML = `<div class="error-message">${data.error || 'Login failed'}</div>`;
        }
        
    } catch (error) {
        console.error('Login error:', error);
        messageDiv.innerHTML = '<div class="error-message">Network error. Please try again.</div>';
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const messageDiv = document.getElementById('authMessage');
    
    try {
        messageDiv.innerHTML = '<div class="loading-message">🔄 Creating account...</div>';
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            messageDiv.innerHTML = '<div class="success-message">Registration successful! Please login.</div>';
            
            // Auto-switch to login form after brief delay
            setTimeout(() => {
                showLoginForm();
            }, 2000);
            
        } else {
            messageDiv.innerHTML = `<div class="error-message">${data.error || 'Registration failed'}</div>`;
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        messageDiv.innerHTML = '<div class="error-message">Network error. Please try again.</div>';
    }
}

// Handle logout
export function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    console.log('👋 User logged out');
    
    // Dispatch custom event for main app to handle
    document.dispatchEvent(new CustomEvent('authenticationLogout'));
}

// Tab switching functions (global for HTML onclick)
export function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('authMessage').innerHTML = '';
}

export function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('authMessage').innerHTML = '';
}

// Update authentication state (for external use)
export function setAuthenticationState(user, token) {
    currentUser = user;
    authToken = token;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear authentication state (for external use)
export function clearAuthenticationState() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

// Validate current authentication (check if token is still valid)
export async function validateAuthentication() {
    if (!authToken) {
        return false;
    }
    
    try {
        // You can add a token validation endpoint here if needed
        // For now, just check if token exists
        return true;
    } catch (error) {
        console.error('Token validation failed:', error);
        clearAuthenticationState();
        return false;
    }
}

// Get user display name
export function getUserDisplayName() {
    return currentUser ? currentUser.username : 'Unknown User';
}

// Check if user has specific permissions (extensible for future use)
export function hasPermission(permission) {
    if (!currentUser) {
        return false;
    }
    
    // For now, all authenticated users have all permissions
    // This can be extended with role-based access control
    return true;
}

// Get authentication headers for API requests
export function getAuthHeaders() {
    if (!authToken) {
        return {};
    }
    
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}

// Initialize authentication module
export function initializeAuth() {
    console.log('🔐 Authentication module initialized');
    
    // Set up global functions for HTML compatibility
    window.showLoginForm = showLoginForm;
    window.showRegisterForm = showRegisterForm;
    
    // Add event listeners for authentication events
    document.addEventListener('authenticationSuccess', (event) => {
        console.log('🎉 Authentication success event received');
    });
    
    document.addEventListener('authenticationLogout', (event) => {
        console.log('👋 Authentication logout event received');
    });
}