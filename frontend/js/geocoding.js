// geocoding.js - Address Resolution (Improved & Modular)
import { API_ENDPOINTS, CONSTANTS } from './config.js';

// Generic coordinate parser - handles multiple formats
export function parseCoordinates(coords) {
    try {
        if (Array.isArray(coords)) {
            return createCoordObject(coords[0], coords[1]);
        }
        
        if (typeof coords === 'string') {
            const parts = coords.split(/[,\s]+/).filter(Boolean);
            if (parts.length === 2) {
                return createCoordObject(parts[0], parts[1]);
            }
        }
        
        throw new Error('Invalid coordinate format');
    } catch (error) {
        console.warn('Failed to parse coordinates:', coords, error);
        return null;
    }
}

// Helper to create coordinate object with validation
function createCoordObject(lat, lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid numeric coordinates');
    }
    
    return { latitude, longitude };
}

// Clean and structure OSM response data
export function cleanOSMAddress(data) {
    const addr = data.address || {};
    
    return {
        fullAddress: data.display_name,
        streetNumber: addr.house_number || '',
        streetName: addr.road || '',
        suburb: addr.suburb || '',
        city: addr.city || '',
        country: addr.country || '',
        postcode: addr.postcode || '',
        coordinates: `${data.lat}, ${data.lon}`,
        rawResponse: data
    };
}

// Generic reverse geocoding function
export async function reverseGeocodeOSM(latitude, longitude) {
    const url = `${API_ENDPOINTS.GEOCODING}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=en`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        console.log('Geocoding result:', data.display_name);
        return cleanOSMAddress(data);
        
    } catch (error) {
        console.warn(`Geocoding failed for ${latitude}, ${longitude}:`, error.message);
        return createErrorAddress(latitude, longitude, error.message);
    }
}

// Create standardized error address object
function createErrorAddress(lat, lon, errorMsg) {
    return {
        fullAddress: `Unknown location (${lat}, ${lon})`,
        streetNumber: '',
        streetName: '',
        city: '',
        state: '',
        country: '',
        postcode: '',
        coordinates: `${lat}, ${lon}`,
        error: errorMsg
    };
}

// Format address for police reports
export function formatAddressForReport(addressData) {
    if (!addressData || addressData.error) {
        return `Unknown location (${addressData?.coordinates || 'No coordinates'})`;
    }
    
    const addressParts = [
        buildStreetAddress(addressData),
        addressData.suburb,
        addressData.city,
        addressData.country
    ].filter(Boolean);
    
    const formattedAddress = addressParts.join(', ');
    return `${formattedAddress} (GPS: ${addressData.coordinates})`;
}

// Build street address from components
function buildStreetAddress(addr) {
    if (addr.streetNumber && addr.streetName) {
        return `${addr.streetNumber} ${addr.streetName}`;
    }
    return addr.streetName || '';
}

// Process single location with geocoding
async function processLocationWithAddress(location, delay = 0) {
    if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const coords = parseCoordinates(location.coordinates);
    if (!coords) return null;
    
    console.log(`Geocoding: ${coords.latitude}, ${coords.longitude}`);
    const address = await reverseGeocodeOSM(coords.latitude, coords.longitude);
    
    return {
        ...location,
        coordinates: location.coordinates,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address
    };
}

// Main function - process GPS data with addresses (first and last only)
export async function processGpsDataWithAddresses(gpsData) {
    if (!gpsData?.allLocations?.length) {
        return null;
    }
    
    console.log('🌍 Starting reverse geocoding for GPS locations...');
    
    const locations = gpsData.allLocations;
    
    // Process both locations simultaneously (no delay)
    const [firstLocationWithAddress, lastLocationWithAddress] = await Promise.all([
        processLocationWithAddress(locations[0]),
        processLocationWithAddress(locations[locations.length - 1])
    ]);
    
    return {
        ...gpsData,
        firstLocationWithAddress,
        lastLocationWithAddress,
        totalProcessedLocations: 2
    };
}