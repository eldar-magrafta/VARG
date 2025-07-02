// telemetryProcessor.js - Telemetry Data Processing with Layout Management
import { readFileAsText, updatePreviewLayout } from './fileHandlers.js';
import { processGpsDataWithAddresses } from './geocoding.js';
import { setEnhancedTelemetryData } from './state.js';
import { showTelemetryPreview } from './uiHelpers.js';

// Handle telemetry file upload and parsing with geocoding
export async function handleTelemetryFile() {
    const telemetryInput = document.getElementById('telemetryFile');
    const telemetryFileInfo = document.getElementById('telemetryFileInfo');
    const telemetryPreviewSection = document.getElementById('telemetryPreviewSection');
    const showRouteBtn = document.getElementById('showRouteBtn');

    if (telemetryInput.files.length === 0) {
        telemetryFileInfo.innerHTML = '';
        telemetryPreviewSection.style.display = 'none';
        showRouteBtn.disabled = true;
        updatePreviewLayout(); // Update layout when telemetry is hidden
        return;
    }

    const file = telemetryInput.files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    telemetryFileInfo.innerHTML = `Selected: ${file.name} (${sizeMB} MB)`;

    try {
        // Read and parse the telemetry file
        const fileContent = await readFileAsText(file);
        let telemetryData = parseTelemetryData(fileContent);

        console.log(telemetryData);

        // Show initial preview
        showTelemetryPreview(telemetryData, fileContent);
        telemetryPreviewSection.style.display = 'block';
        updatePreviewLayout(); // Update layout when telemetry is shown
        telemetryFileInfo.innerHTML += '<div class="success-message">Telemetry data loaded successfully</div>';

        // Enable Show Route button IMMEDIATELY if GPS data is available
        if (telemetryData.gpsData && telemetryData.gpsData.allLocations.length > 0) {
            showRouteBtn.disabled = false;
            console.log(`📍 Route button enabled - ${telemetryData.gpsData.allLocations.length} GPS points available`);
        } else {
            showRouteBtn.disabled = true;
            telemetryFileInfo.innerHTML += '<div class="warning-message">No GPS data found in telemetry file</div>';
        }

        // Store basic telemetry data globally IMMEDIATELY (before geocoding)
        setEnhancedTelemetryData(telemetryData);

        // Process GPS data with reverse geocoding IN THE BACKGROUND (don't wait for it)
        if (telemetryData.gpsData) {
            // Don't await this - let it happen in background
            processGpsDataWithAddresses(telemetryData.gpsData).then(enhancedGpsData => {
                if (enhancedGpsData) {
                    // Update the stored data with address information when ready
                    const currentData = { ...telemetryData, gpsData: enhancedGpsData };
                    setEnhancedTelemetryData(currentData);
                    
                    // Update preview with address information
                    showTelemetryPreview(currentData, fileContent);
                    
                    console.log('🌍 Address geocoding completed and preview updated');
                }
            }).catch(error => {
                console.warn('Geocoding failed, but GPS coordinates are still available for mapping:', error);
            });
        }

    } catch (error) {
        console.error('Error parsing telemetry file:', error);
        telemetryFileInfo.innerHTML += '<div class="error-message">Error parsing telemetry file: ' + error.message + '</div>';
        telemetryPreviewSection.style.display = 'none';
        showRouteBtn.disabled = true;
        updatePreviewLayout(); // Update layout when telemetry is hidden due to error
    }
}

// Parse telemetry data and extract key information
export function parseTelemetryData(fileContent) {
    try {
        // Handle both JSON array format and line-delimited JSON
        let data;
        if (fileContent.trim().startsWith('[')) {
            // Standard JSON array
            data = JSON.parse(fileContent);
        } else {
            // Line-delimited JSON - split by lines and parse each
            data = fileContent.trim().split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line));
        }
        
        if (!Array.isArray(data)) {
            throw new Error('Telemetry data must be an array');
        }
        
        // Extract key information
        const deviceInfo = extractDeviceInfo(data);
        const gpsData = extractGpsData(data);
        const eventData = extractEventData(data);
        const timeline = extractTimeline(data);
        
        return {
            deviceInfo,
            gpsData,
            eventData,
            timeline,
        };
        
    } catch (error) {
        throw new Error('Invalid JSON format: ' + error.message);
    }
}

// Extract device information
export function extractDeviceInfo(data) {
    const deviceEntry = data.find(entry => entry.devinfo);
    if (!deviceEntry) return null;
    
    return {
        product: deviceEntry.devinfo.Product,
        serialNumber: deviceEntry.devinfo.SerialNo,
        buildVersion: deviceEntry.devinfo.BuildVersion,
        version: deviceEntry.devinfo.Version
    };
}

// Extract GPS location data
export function extractGpsData(data) {
    const gpsEntries = data.filter(entry => entry.update && entry.update.GpsLocation);
    if (gpsEntries.length === 0) return null;
    
    const locations = gpsEntries.map(entry => ({
        time: entry.Time,
        coordinates: entry.update.GpsLocation.Location,
        quality: entry.update.GpsLocation.Quality,
        status: entry.update.GpsLocation.Status
    }));
    
    const firstLocation = locations[0];
    const lastLocation = locations[locations.length - 1];
    
    return {
        totalGpsUpdates: locations.length,
        firstLocation,
        lastLocation,
        allLocations: locations
    };
}

// Extract event information
export function extractEventData(data) {
    const eventEntries = data.filter(entry => entry.checkpoint || (entry.update && entry.update.EventState));
    if (eventEntries.length === 0) return null;
    
    const events = eventEntries.map(entry => {
        if (entry.checkpoint) {
            return {
                time: entry.Time,
                type: 'checkpoint',
                officer: entry.checkpoint.Config?.Officer,
                deptName: entry.checkpoint.Config?.DeptName,
                reason: entry.checkpoint.Config?.Reason,
                deviceId: entry.checkpoint.Config?.DeviceId
            };
        } else if (entry.update.EventState) {
            return {
                time: entry.Time,
                type: 'event_state',
                status: entry.update.EventState.Status,
                reason: entry.update.EventState.Details?.Reason,
                requester: entry.update.EventState.Details?.Requester,
                reid: entry.update.EventState.REID
            };
        }
    }).filter(Boolean);
    
    return {
        totalEvents: events.length,
        events
    };
}

// Extract timeline information
export function extractTimeline(data) {
    const timeEntries = data.filter(entry => entry.Time).map(entry => ({
        time: entry.Time,
        type: getEntryType(entry)
    }));
    
    if (timeEntries.length === 0) return null;
    
    const startTime = timeEntries[0].time;
    const endTime = timeEntries[timeEntries.length - 1].time;
    
    return {
        startTime,
        endTime,
        duration: calculateDuration(startTime, endTime),
        totalEntries: timeEntries.length
    };
}

// Helper function to determine entry type
function getEntryType(entry) {
    if (entry.devinfo) return 'device_info';
    if (entry.checkpoint) return 'checkpoint';
    if (entry.update?.GpsLocation) return 'gps_update';
    if (entry.update?.EventState) return 'event_state';
    if (entry.update?.SystemStats) return 'system_stats';
    return 'other';
}

// Calculate duration between times in HH:MM:SS format
function calculateDuration(startTime, endTime) {
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        
        // Convert milliseconds to total seconds
        const totalSeconds = Math.floor(diffMs / 1000);
        
        // Calculate hours, minutes, and seconds
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        // Format with leading zeros (HH:MM:SS)
        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = minutes.toString().padStart(2, '0');
        const secondsStr = seconds.toString().padStart(2, '0');
        
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
        
    } catch (error) {
        return 'Unknown';
    }
}