// state.js - Modern ES6 Module State Management
// All state variables for the application

// Map-related state
let routeMap = null;
let routePolyline = null;

// Telemetry data state  
let enhancedTelemetryData = null;

// Route Map getters and setters
export function getRouteMap() {
    return routeMap;
}

export function setRouteMap(map) {
    routeMap = map;
}

export function getRoutePolyline() {
    return routePolyline;
}

export function setRoutePolyline(polyline) {
    routePolyline = polyline;
}

// Telemetry data getters and setters
export function getEnhancedTelemetryData() {
    return enhancedTelemetryData;
}

export function setEnhancedTelemetryData(data) {
    enhancedTelemetryData = data;
    console.log('📊 Enhanced telemetry data updated in state');
}

// Clear all state (useful for cleanup)
export function clearAllState() {
    routeMap = null;
    routePolyline = null;
    enhancedTelemetryData = null;
    console.log('🧹 All state cleared');
}