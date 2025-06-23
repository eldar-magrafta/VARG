// main.js - Modern ES6 Module Entry Point with Authentication Support
import { checkInputs, updatePreviewLayout } from './fileHandlers.js';
import { handleTelemetryFile } from './telemetryProcessor.js';
import { transcribeVideo } from './transcription.js';
import { generateReport } from './reportGenerator.js';
import { closeRouteMap, showRouteOnMap } from './mapController.js';

// Authentication state
let currentUser = null;
let authToken = null;

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚔 Police Body Camera Report Generator initializing...');
    
    // Check if user is already logged in
    checkAuthenticationStatus();
    
    initializeEventListeners();
    initializeGlobalFunctions();
    initializeLayoutManagement();
    
    console.log('✅ Police Body Camera Report Generator initialized successfully!');
});

// Check if user is already authenticated (token in localStorage)
function checkAuthenticationStatus() {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        try {
            authToken = storedToken;
            currentUser = JSON.parse(storedUser);
            showMainApplication();
            console.log('✅ User already logged in:', currentUser.username);
        } catch (error) {
            console.log('Invalid stored auth data, clearing...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            showAuthenticationForm();
        }
    } else {
        showAuthenticationForm();
    }
}

// Show authentication form (login/register)
function showAuthenticationForm() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <h1>Police Body Camera System</h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
            Officer Authentication Required
        </p>
        
        <div class="auth-container">
            <div class="auth-tabs">
                <button id="loginTab" class="auth-tab active" onclick="showLoginForm()">Login</button>
                <button id="registerTab" class="auth-tab" onclick="showRegisterForm()">Register</button>
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
                    <button type="submit" class="auth-btn">✅ Register</button>
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
            
            messageDiv.innerHTML = '<div class="success-message">✅ Login successful!</div>';
            
            // Show main application after brief delay
            setTimeout(() => {
                showMainApplication();
            }, 1000);
            
        } else {
            messageDiv.innerHTML = `<div class="error-message">❌ ${data.error || 'Login failed'}</div>`;
        }
        
    } catch (error) {
        console.error('Login error:', error);
        messageDiv.innerHTML = '<div class="error-message">❌ Network error. Please try again.</div>';
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
            messageDiv.innerHTML = '<div class="success-message">✅ Registration successful! Please login.</div>';
            
            // Auto-switch to login form after brief delay
            setTimeout(() => {
                showLoginForm();
            }, 2000);
            
        } else {
            messageDiv.innerHTML = `<div class="error-message">❌ ${data.error || 'Registration failed'}</div>`;
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        messageDiv.innerHTML = '<div class="error-message">❌ Network error. Please try again.</div>';
    }
}

// Show main application (original functionality)
function showMainApplication() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="user-header">
            <h1>Police Body Camera Report Generator</h1>
            <div class="user-info">
                <span>👮 Welcome, ${currentUser.username}</span>
                <button id="logoutBtn" class="logout-btn">🚪 Logout</button>
            </div>
        </div>
        
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
            Upload body camera footage and generate structured police incident reports using AI
        </p>
        
        <!-- Report Criteria Selection Section (NOW FIRST) -->
        <div class="criteria-section">
            <h3>📋 Report Type & Criteria</h3>
            <p>Select the incident details to customize the police report format</p>
            
            <!-- Report Type Dropdown -->
            <div class="criteria-input">
                <label for="reportType">Report Type:</label>
                <select id="reportType">
                    <option value="general">General Incident Report</option>
                    <option value="vehicle_accident">Vehicle Accident</option>
                    <option value="crime">Crime Report</option>
                    <option value="lost_property">Lost Property Report</option>
                </select>
            </div>
            
            <!-- Time of Day Classification Dropdown -->
            <div class="criteria-input">
                <label for="timeOfDay">Time of Day Classification:</label>
                <select id="timeOfDay">
                    <option value="day_shift">Day Shift (6AM-2PM)</option>
                    <option value="evening_shift">Evening Shift (2PM-10PM)</option>
                    <option value="night_shift">Night Shift (10PM-6AM)</option>
                </select>
            </div>
            
            <!-- Incident Priority Dropdown -->
            <div class="criteria-input">
                <label for="incidentPriority">Incident Priority:</label>
                <select id="incidentPriority">
                    <option value="routine">Routine</option>
                    <option value="priority">Priority</option>
                    <option value="emergency">Emergency</option>
                    <option value="code3">Code 3</option>
                </select>
            </div>
        </div>
        
        <!-- Upload Sections Container (Side by Side) - NOW SECOND -->
        <div class="upload-container">
            <!-- File Upload Section -->
            <div class="upload-section">
                <h3>📹 Upload Body Camera Footage</h3>
                <p>Choose a body camera video file (max 20MB)</p>
                <div class="file-input">
                    <input type="file" id="videoFile" accept="video/*" />
                </div>
                <div class="file-info" id="fileInfo"></div>
            </div>
            
            <!-- Telemetry Data Upload Section -->
            <div class="upload-section">
                <h3>📊 Upload Telemetry Data (Optional)</h3>
                <p>Upload telemetry file from body camera device</p>
                <div class="file-input">
                    <input type="file" id="telemetryFile" accept=".json,.txt" />
                </div>
                <div class="file-info" id="telemetryFileInfo"></div>
            </div>
        </div>
        
        <!-- Preview Sections Container (Side by Side) - CLEAN WITH NO EMBEDDED STYLES -->
        <div class="preview-container">
            <!-- Video Player Section (Left Half) -->
            <div class="video-player-section" id="videoPlayerSection" style="display: none;">
                <h4>🎬 Body Camera Footage Preview</h4>
                <video id="videoPlayer" controls width="100%" style="max-width: 500px; border-radius: 8px;">
                    Your browser does not support the video tag.
                </video>
            </div>
            
            <!-- Telemetry Preview Section (Right Half) -->
            <div class="telemetry-preview-section" id="telemetryPreviewSection" style="display: none;">
                <h4>📋 Telemetry Data Preview</h4>
                <div class="telemetry-summary" id="telemetrySummary"></div>
                
                <!-- Show Route Button -->
                <div style="text-align: center; margin-top: 15px;">
                    <button id="showRouteBtn" onclick="window.showRouteOnMap()" disabled>
                        🗺️ Show Route on Map
                    </button>
                </div>
            </div>
        </div>
        
        <div class="button-group">
            <button id="transcribeBtn" disabled>
                🎤 Fast Audio Transcription
            </button>
            <button id="reportBtn" disabled>
                📋 Generate Police Report
            </button>
        </div>
        
        <!-- Loading Animation -->
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Processing video with AssemblyAI...</p>
        </div>
        
        <!-- Transcription Section -->
        <div class="result-section" id="transcriptionSection" style="display: none;">
            <h3>🎤 Audio Transcription</h3>
            <div id="transcription" class="transcription-box"></div>
        </div>
        
        <!-- Results Section -->
        <div class="result-section" id="resultSection">
            <h3>📋 Generated Police Report</h3>
            <div id="summary"></div>
        </div>
    `;
    
    // Add map overlay to the body (outside container)
    if (!document.getElementById('mapOverlay')) {
        const mapOverlay = document.createElement('div');
        mapOverlay.innerHTML = `
            <div class="map-overlay" id="mapOverlay">
                <div class="map-container">
                    <div class="map-header">
                        <h3>📍 Officer Route Tracking</h3>
                        <button class="map-close-btn" onclick="window.closeRouteMap()">&times;</button>
                    </div>
                    <div id="routeMap"></div>
                    <div class="route-info" id="routeInfo">
                        <h4>Route Information</h4>
                        <p><strong>Loading route data...</strong></p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(mapOverlay);
    }
    
    // Re-initialize all the original functionality
    initializeMainAppListeners();
    initializeLayoutManagement();
}

// Initialize main application event listeners
function initializeMainAppListeners() {
    // File input event listeners
    const videoFile = document.getElementById('videoFile');
    const telemetryFile = document.getElementById('telemetryFile');
    const transcribeBtn = document.getElementById('transcribeBtn');
    const reportBtn = document.getElementById('reportBtn');
    const showRouteBtn = document.getElementById('showRouteBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (videoFile) videoFile.addEventListener('change', checkInputs);
    if (telemetryFile) telemetryFile.addEventListener('change', handleTelemetryFile);
    if (transcribeBtn) transcribeBtn.addEventListener('click', transcribeVideo);
    if (reportBtn) reportBtn.addEventListener('click', generateReport);
    if (showRouteBtn) showRouteBtn.addEventListener('click', showRouteOnMap);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Map overlay event listeners
    setupMapOverlayListeners();
    
    // Escape key listener for closing map
    setupKeyboardListeners();
    
    console.log('✅ Main application event listeners initialized');
}

// Handle logout
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    console.log('👋 User logged out');
    showAuthenticationForm();
}

// Tab switching functions (global for HTML onclick)
window.showLoginForm = function() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('authMessage').innerHTML = '';
};

window.showRegisterForm = function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('authMessage').innerHTML = '';
};

// Set up all event listeners (for when main app is loaded)
function initializeEventListeners() {
    // This will be called after authentication, so elements might not exist yet
    // Moved to initializeMainAppListeners()
}

// Set up map overlay click and touch listeners
function setupMapOverlayListeners() {
    const mapOverlay = document.getElementById('mapOverlay');
    if (mapOverlay) {
        mapOverlay.addEventListener('click', function(e) {
            // Close map when clicking on the overlay background (not the map content)
            if (e.target === this) {
                closeRouteMap();
            }
        });
    }
}

// Set up keyboard listeners
function setupKeyboardListeners() {
    document.addEventListener('keydown', function(e) {
        // Close map with Escape key
        const mapOverlay = document.getElementById('mapOverlay');
        if (e.key === 'Escape' && mapOverlay && mapOverlay.style.display === 'block') {
            closeRouteMap();
        }
    });
}

// Initialize layout management system
function initializeLayoutManagement() {
    // Set up initial layout state
    updatePreviewLayout();
    
    // Set up mutation observer to watch for dynamic changes
    setupLayoutObserver();
    
    console.log('📱 Layout management system initialized');
}

// Set up mutation observer to watch for style changes on preview sections
function setupLayoutObserver() {
    const videoSection = document.getElementById('videoPlayerSection');
    const telemetrySection = document.getElementById('telemetryPreviewSection');
    
    if (!videoSection || !telemetrySection) return;
    
    // Create observer to watch for style attribute changes
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            // Small delay to ensure DOM is updated
            setTimeout(updatePreviewLayout, 10);
        }
    });
    
    // Observe both sections for style changes
    observer.observe(videoSection, { attributes: true, attributeFilter: ['style'] });
    observer.observe(telemetrySection, { attributes: true, attributeFilter: ['style'] });
    
    console.log('👁️ Layout observer set up for dynamic updates');
}

// Make functions available globally for HTML onclick handlers
// This is the ONLY place we use global assignments, and it's intentional for HTML compatibility
function initializeGlobalFunctions() {
    // ENHANCED: Make sure functions are available immediately
    window.showRouteOnMap = showRouteOnMap;
    window.closeRouteMap = closeRouteMap;
    window.updatePreviewLayout = updatePreviewLayout;
    
    // Add debug function to check if functions are working
    window.testRouteFunction = function() {
        console.log('🧪 Route function test - this should work!');
        if (typeof showRouteOnMap === 'function') {
            console.log('✅ showRouteOnMap function is available');
        } else {
            console.error('❌ showRouteOnMap function is NOT available');
        }
    };
    
    console.log('🌐 Global functions registered for HTML compatibility');
    
    // Test the functions immediately
    setTimeout(() => {
        if (window.showRouteOnMap) {
            console.log('✅ showRouteOnMap is globally available');
        } else {
            console.error('❌ showRouteOnMap failed to register globally');
        }
    }, 100);
}

// Additional utility functions for layout management

// Force layout update (can be called externally)
export function forceLayoutUpdate() {
    console.log('🔄 Forcing layout update...');
    updatePreviewLayout();
}

// Check if preview container should be visible
export function isPreviewContainerVisible() {
    const videoSection = document.getElementById('videoPlayerSection');
    const telemetrySection = document.getElementById('telemetryPreviewSection');
    
    if (!videoSection || !telemetrySection) return false;
    
    const videoVisible = videoSection.style.display !== 'none';
    const telemetryVisible = telemetrySection.style.display !== 'none';
    
    return videoVisible || telemetryVisible;
}

// Get current layout state
export function getLayoutState() {
    const videoSection = document.getElementById('videoPlayerSection');
    const telemetrySection = document.getElementById('telemetryPreviewSection');
    
    if (!videoSection || !telemetrySection) return 'unknown';
    
    const videoVisible = videoSection.style.display !== 'none';
    const telemetryVisible = telemetrySection.style.display !== 'none';
    
    if (videoVisible && telemetryVisible) return 'side-by-side';
    if (videoVisible) return 'video-only';
    if (telemetryVisible) return 'telemetry-only';
    return 'hidden';
}

// Get authentication token (for API calls)
export function getAuthToken() {
    return authToken;
}

// Get current user info
export function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
export function isAuthenticated() {
    return authToken !== null && currentUser !== null;
}

// Handle window resize events
window.addEventListener('resize', function() {
    // Update layout on window resize with debouncing
    clearTimeout(window.layoutResizeTimeout);
    window.layoutResizeTimeout = setTimeout(() => {
        updatePreviewLayout();
        console.log('📱 Layout updated after window resize');
    }, 250);
});

// Handle orientation change on mobile devices
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        updatePreviewLayout();
        console.log('Layout updated after orientation change');
    }, 500);
});