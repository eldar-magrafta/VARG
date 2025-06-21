// main.js - Modern ES6 Module Entry Point
import { checkInputs } from './fileHandlers.js';
import { handleTelemetryFile } from './telemetryProcessor.js';
import { transcribeVideo } from './transcription.js';
import { generateReport } from './reportGenerator.js';
import { closeRouteMap, showRouteOnMap } from './mapController.js';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚔 Police Body Camera Report Generator initializing...');
    
    initializeEventListeners();
    initializeGlobalFunctions();
    
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

// Make functions available globally for HTML onclick handlers
// This is the ONLY place we use global assignments, and it's intentional for HTML compatibility
function initializeGlobalFunctions() {
    window.showRouteOnMap = showRouteOnMap;
    window.closeRouteMap = closeRouteMap;
    
    console.log('🌐 Global functions registered for HTML compatibility');
}