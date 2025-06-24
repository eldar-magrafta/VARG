// main.js - Clean Main Application Entry Point
// Handles app initialization, authentication flow, and main UI management

import { checkInputs, updatePreviewLayout } from './fileHandlers.js';
import { handleTelemetryFile } from './telemetryProcessor.js';
import { transcribeVideo } from './transcription.js';
import { generateReport } from './reportGenerator.js';
import { closeRouteMap, showRouteOnMap } from './mapController.js';
import { initializeModalManager } from './ui/modalManager.js';
import { 
    checkAuthenticationStatus, 
    showAuthenticationForm, 
    handleLogout,
    getCurrentUser,
    getAuthToken,
    isAuthenticated,
    initializeAuth
} from './auth/authManager.js';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚔 Police Body Camera Report Generator initializing...');
    
    initializeApplication();
});

// Main application initialization
async function initializeApplication() {
    try {
        initializeAuth();
        initializeModalManager();
        
        const isLoggedIn = checkAuthenticationStatus();
        
        if (isLoggedIn) {
            showMainApplication();
        } else {
            showAuthenticationForm();
        }
        
        setupAuthenticationEvents();
        initializeGlobalFunctions();
        initializeLayoutManagement();
        
        console.log('✅ Police Body Camera Report Generator initialized successfully!');
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        showInitializationError(error);
    }
}

function setupAuthenticationEvents() {
    document.addEventListener('authenticationSuccess', (event) => {
        console.log('🎉 Authentication successful, showing main app');
        showMainApplication();
    });
    
    document.addEventListener('authenticationLogout', (event) => {
        console.log('👋 User logged out, showing auth form');
        showAuthenticationForm();
    });
}

function showMainApplication() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('❌ No current user found');
        showAuthenticationForm();
        return;
    }
    
    const container = document.querySelector('.container');
    container.innerHTML = createMainApplicationHTML(currentUser);
    
    ensureMapOverlayExists();
    initializeMainAppListeners();
    initializeLayoutManagement();
    
    console.log('✅ Main application displayed for:', currentUser.username);
}

// Create main application HTML
function createMainApplicationHTML(currentUser) {
    return `
        <div class="user-header">
            <h1>Police Body Camera Report Generator</h1>
            <div class="user-info">
                <span>👮 Welcome, ${currentUser.username}</span>
                <button id="reportHistoryBtn" class="report-history-btn">📋 All Report History</button>
                <button id="logoutBtn" class="logout-btn">🚪 Logout</button>
            </div>
        </div>
        
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
            Upload body camera footage and generate structured police incident reports using AI
        </p>
        
        <!-- Report Criteria Selection Section -->
        <div class="criteria-section">
            <h3>📋 Report Type & Criteria</h3>
            <p>Select the incident details to customize the police report format</p>
            
            <div class="criteria-input">
                <label for="reportType">Report Type:</label>
                <select id="reportType">
                    <option value="general">General Incident Report</option>
                    <option value="vehicle_accident">Vehicle Accident</option>
                    <option value="crime">Crime Report</option>
                    <option value="lost_property">Lost Property Report</option>
                </select>
            </div>
            
            <div class="criteria-input">
                <label for="timeOfDay">Time of Day Classification:</label>
                <select id="timeOfDay">
                    <option value="day_shift">Day Shift (6AM-2PM)</option>
                    <option value="evening_shift">Evening Shift (2PM-10PM)</option>
                    <option value="night_shift">Night Shift (10PM-6AM)</option>
                </select>
            </div>
            
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
        
        <!-- Upload Sections Container -->
        <div class="upload-container">
            <div class="upload-section">
                <h3>📹 Upload Body Camera Footage</h3>
                <p>Choose a body camera video file (max 20MB)</p>
                <div class="file-input">
                    <input type="file" id="videoFile" accept="video/*" />
                </div>
                <div class="file-info" id="fileInfo"></div>
            </div>
            
            <div class="upload-section">
                <h3>📊 Upload Telemetry Data (Optional)</h3>
                <p>Upload telemetry file from body camera device</p>
                <div class="file-input">
                    <input type="file" id="telemetryFile" accept=".json,.txt" />
                </div>
                <div class="file-info" id="telemetryFileInfo"></div>
            </div>
        </div>
        
        <!-- Preview Sections Container -->
        <div class="preview-container">
            <div class="video-player-section" id="videoPlayerSection" style="display: none;">
                <h4>🎬 Body Camera Footage Preview</h4>
                <video id="videoPlayer" controls width="100%">
                    Your browser does not support the video tag.
                </video>
            </div>
            
            <div class="telemetry-preview-section" id="telemetryPreviewSection" style="display: none;">
                <h4>📋 Telemetry Data Preview</h4>
                <div class="telemetry-summary" id="telemetrySummary"></div>
                
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
}

// Ensure map overlay exists in the DOM
function ensureMapOverlayExists() {
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
    const reportHistoryBtn = document.getElementById('reportHistoryBtn');
    
    if (videoFile) videoFile.addEventListener('change', checkInputs);
    if (telemetryFile) telemetryFile.addEventListener('change', handleTelemetryFile);
    if (transcribeBtn) transcribeBtn.addEventListener('click', transcribeVideo);
    if (reportBtn) reportBtn.addEventListener('click', generateReport);
    if (showRouteBtn) showRouteBtn.addEventListener('click', showRouteOnMap);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (reportHistoryBtn) reportHistoryBtn.addEventListener('click', showReportHistory);
    
    console.log('✅ Main application event listeners initialized');
}

// Show report history
async function showReportHistory() {
    try {
        const authToken = getAuthToken();
        if (!authToken) {
            console.error('❌ No auth token available');
            return;
        }
        
        const response = await fetch('/api/reports/history', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Import and use the report history manager
            const { displayReportHistory } = await import('./reportHistoryManager.js');
            displayReportHistory(data.reports, getCurrentUser());
        } else {
            showNotification('Failed to load report history: ' + (data.error || 'Unknown error'), 'error');
        }
        
    } catch (error) {
        console.error('Error fetching report history:', error);
        showNotification('Error loading report history. Please try again.', 'error');
    }
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
function initializeGlobalFunctions() {
    // Map functions
    window.showRouteOnMap = showRouteOnMap;
    window.closeRouteMap = closeRouteMap;
    window.updatePreviewLayout = updatePreviewLayout;
    
    // Report history functions (will be set when module loads)
    setupReportHistoryGlobalFunctions();
    
    console.log('🌐 Global functions registered for HTML compatibility');
}

// Set up global functions for report history
async function setupReportHistoryGlobalFunctions() {
    try {
        const { toggleReportForm, updateReport } = await import('./reportHistoryManager.js');
        window.toggleReportForm = toggleReportForm;
        window.updateReport = updateReport;
    } catch (error) {
        console.error('Error setting up report history functions:', error);
    }
}

// Save current report to database
window.saveCurrentReport = async function() {
    const summaryDiv = document.getElementById('summary');
    if (!summaryDiv || !summaryDiv.textContent.trim()) {
        showNotification('No report to save.', 'warning');
        return;
    }
    
    // Extract report content
    const reportElements = summaryDiv.querySelectorAll('.success, .police-report-form');
    let reportContent = '';
    
    if (reportElements.length > 0) {
        reportElements.forEach(element => {
            if (element.classList.contains('success')) {
                reportContent += element.textContent.trim();
            } else if (element.classList.contains('police-report-form')) {
                // Extract form data if needed
                const formData = new FormData(element);
                for (let [key, value] of formData.entries()) {
                    reportContent += `${key}: ${value}\n`;
                }
            }
        });
    } else {
        reportContent = summaryDiv.textContent.trim();
    }
    
    if (!reportContent) {
        showNotification('No valid report content found.', 'warning');
        return;
    }
    
    try {
        const authToken = getAuthToken();
        if (!authToken) {
            showNotification('Authentication required. Please log in again.', 'error');
            return;
        }
        
        const response = await fetch('/api/reports/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ reportContent })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('✅ Report saved successfully!', 'success');
        } else {
            showNotification('Failed to save report: ' + (data.error || 'Unknown error'), 'error');
        }
        
    } catch (error) {
        console.error('Error saving report:', error);
        showNotification('Error saving report. Please try again.', 'error');
    }
};

// Show initialization error
function showInitializationError(error) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <h1>System Error</h1>
        <div class="error">
            <h3>❌ Application Failed to Initialize</h3>
            <p>The police body camera system encountered an error during startup.</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <button onclick="location.reload()" class="btn-primary">
                🔄 Reload Application
            </button>
        </div>
    `;
}

// Simple notification function (until full notification system loads)
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
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
        console.log('📱 Layout updated after orientation change');
    }, 500);
});

// Export utility functions for other modules
export { getCurrentUser, getAuthToken, isAuthenticated };