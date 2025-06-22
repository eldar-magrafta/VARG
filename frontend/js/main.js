// main.js - Modern ES6 Module Entry Point with Fixed Button Handlers
import { checkInputs, updatePreviewLayout } from './fileHandlers.js';
import { handleTelemetryFile } from './telemetryProcessor.js';
import { transcribeVideo } from './transcription.js';
import { generateReport } from './reportGenerator.js';
import { closeRouteMap, showRouteOnMap } from './mapController.js';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚔 Police Body Camera Report Generator initializing...');
    
    initializeEventListeners();
    initializeGlobalFunctions();
    initializeLayoutManagement();
    
    console.log('✅ Police Body Camera Report Generator initialized successfully!');
});

// Set up all event listeners
function initializeEventListeners() {
    // File input event listeners
    document.getElementById('videoFile').addEventListener('change', checkInputs);
    document.getElementById('telemetryFile').addEventListener('change', handleTelemetryFile);
    
    // Button event listeners
    document.getElementById('transcribeBtn').addEventListener('click', transcribeVideo);
    document.getElementById('reportBtn').addEventListener('click', generateReport);
    
    // FIXED: Add proper event listener for showRouteBtn
    const showRouteBtn = document.getElementById('showRouteBtn');
    if (showRouteBtn) {
        showRouteBtn.addEventListener('click', showRouteOnMap);
        console.log('🗺️ Show Route button event listener added');
    }
    
    // Map overlay event listeners
    setupMapOverlayListeners();
    
    // Escape key listener for closing map
    setupKeyboardListeners();
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
        if (e.key === 'Escape' && document.getElementById('mapOverlay').style.display === 'block') {
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