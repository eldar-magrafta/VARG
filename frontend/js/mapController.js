// mapController.js - Modern ES6 Map Functionality
import { 
    getEnhancedTelemetryData, 
    getRouteMap, 
    setRouteMap, 
    getRoutePolyline, 
    setRoutePolyline 
} from './state.js';
import { parseCoordinates } from './geocoding.js';

// Show route on map with GPS data
export function showRouteOnMap() {
    const telemetryData = getEnhancedTelemetryData();
    
    if (!telemetryData || !telemetryData.gpsData) {
        showAlert("No GPS data available to display route.");
        return;
    }

    const gpsData = telemetryData.gpsData;
    const locations = gpsData.allLocations;

    if (locations.length < 1) {
        showAlert("Need at least 1 GPS point to display a route.");
        return;
    }

    const validCoords = extractValidCoordinates(locations);
    
    if (validCoords.length < 1) {
        showAlert("No valid GPS coordinates found to display route.");
        return;
    }

    displayMapOverlay();
    initializeRouteMap();
    renderRouteOnMap(validCoords);
    updateRouteInformation(validCoords, telemetryData.timeline);
}

// Extract and validate coordinates from location data
function extractValidCoordinates(locations) {
    const validCoords = [];
    
    for (const location of locations) {
        const coords = parseCoordinates(location.coordinates);
        if (coords) {
            validCoords.push({
                ...coords,
                time: location.time,
                status: location.status,
            });
        }
    }
    
    return validCoords;
}

// Show the map overlay
function displayMapOverlay() {
    document.getElementById("mapOverlay").style.display = "block";
}

// Initialize the Leaflet map
function initializeRouteMap() {
    let routeMap = getRouteMap();
    
    if (!routeMap) {
        routeMap = L.map("routeMap");
        setRouteMap(routeMap);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(routeMap);
        
        console.log('🗺️ New Leaflet map initialized');
    }

    clearExistingMapLayers(routeMap);
}

// Clear existing markers and polylines from map
function clearExistingMapLayers(routeMap) {
    routeMap.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            routeMap.removeLayer(layer);
        }
    });
}

// Render route and markers on the map
function renderRouteOnMap(validCoords) {
    const routeMap = getRouteMap();
    
    if (validCoords.length > 1) {
        createRoutePolyline(validCoords, routeMap);
        addStartMarker(validCoords[0], routeMap);
        addEndMarker(validCoords[validCoords.length - 1], routeMap);
    } else {
        // Single point - just center the map on it
        routeMap.setView([validCoords[0].latitude, validCoords[0].longitude], 16);
        addStartMarker(validCoords[0], routeMap);
    }
}

// Create and display the route polyline
function createRoutePolyline(validCoords, routeMap) {
    const routeCoords = validCoords.map((coord) => [coord.latitude, coord.longitude]);

    const routePolyline = L.polyline(routeCoords, {
        color: "#007bff",
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
    }).addTo(routeMap);
    
    setRoutePolyline(routePolyline);

    // Fit the map to show the entire route
    routeMap.fitBounds(routePolyline.getBounds(), { padding: [20, 20] });
}

// Add start marker (green)
function addStartMarker(startCoord, routeMap) {
    const startMarker = L.marker([startCoord.latitude, startCoord.longitude], {
        icon: createCustomMarkerIcon('#28a745', 'S')
    }).addTo(routeMap);
    
    startMarker.bindPopup(createMarkerPopup('🟢 Start Point', startCoord));
}

// Add end marker (red)
function addEndMarker(endCoord, routeMap) {
    const endMarker = L.marker([endCoord.latitude, endCoord.longitude], {
        icon: createCustomMarkerIcon('#dc3545', 'E')
    }).addTo(routeMap);
    
    endMarker.bindPopup(createMarkerPopup('🔴 End Point', endCoord));
}

// Create custom marker icon
function createCustomMarkerIcon(backgroundColor, letter) {
    return L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: ${backgroundColor}; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);">${letter}</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

// Create popup content for markers
function createMarkerPopup(title, coord) {
    return `
        <strong>${title}</strong><br>
        Time: ${new Date(coord.time).toLocaleTimeString()}<br>
        Coordinates: ${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}<br>
        Status: ${coord.status}
    `;
}

// Update the route information panel
function updateRouteInformation(validCoords, timeline) {
    const routeInfo = document.getElementById("routeInfo");
    
    if (validCoords.length > 1) {
        routeInfo.innerHTML = createMultiPointRouteInfo(validCoords, timeline);
    } else {
        routeInfo.innerHTML = createSinglePointRouteInfo(validCoords[0]);
    }
}

// Create route info for multiple points
function createMultiPointRouteInfo(validCoords, timeline) {
    const startCoord = validCoords[0];
    const endCoord = validCoords[validCoords.length - 1];
    
    return `
        <h4>📍 Route Information</h4>
        <p><strong>Duration:</strong> ${timeline ? timeline.duration : "Unknown"}</p>
        <p><strong>Start:</strong> ${new Date(startCoord.time).toLocaleTimeString()}</p>
        <p><strong>End:</strong> ${new Date(endCoord.time).toLocaleTimeString()}</p>
        <hr style="margin: 10px 0; border: 1px solid #eee;">
        <p style="font-size: 11px; color: #888;">🟢 Start Point | 🔴 End Point<br>Click markers for details</p>
    `;
}

// Create route info for single point
function createSinglePointRouteInfo(startCoord) {
    return `
        <h4>📍 Location Information</h4>
        <p><strong>Time:</strong> ${new Date(startCoord.time).toLocaleTimeString()}</p>
        <p><strong>Status:</strong> ${startCoord.status}</p>
        <hr style="margin: 10px 0; border: 1px solid #eee;">
        <p style="font-size: 11px; color: #888;">🟢 Single GPS Point<br>Click marker for details</p>
    `;
}

// Close route map overlay
export function closeRouteMap() {
    document.getElementById('mapOverlay').style.display = 'none';
    console.log('🗺️ Route map closed');
}

function showAlert(message) {
    alert(message);
    console.warn('⚠️ Map alert:', message);
}