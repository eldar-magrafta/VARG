// uiHelpers.js - UI Update Functions
import { formatAddressForReport } from './geocoding.js';

export function showTranscription(transcription) {
    const transcriptionSection = document.getElementById('transcriptionSection');
    const transcriptionDiv = document.getElementById('transcription');
    
    transcriptionDiv.innerHTML = `<div class="transcription-content">${transcription}</div>`;
    transcriptionSection.style.display = 'block';
}

export function showTranscriptionError(errorMessage) {
    const transcriptionSection = document.getElementById('transcriptionSection');
    const transcriptionDiv = document.getElementById('transcription');
    
    transcriptionDiv.innerHTML = `<div class="error">Transcription Error: ${errorMessage}</div>`;
    transcriptionSection.style.display = 'block';
}

// Enhanced showGeminiReport with telemetry status
export function showGeminiReport(report, isWithTranscription = false, isWithTelemetry = false) {
    const resultSection = document.getElementById('resultSection');
    const summaryDiv = document.getElementById('summary');
    
    let statusText = '<div class="report-status">';
    
    if (isWithTranscription && isWithTelemetry) {
        statusText += '<p style="color: #28a745; font-size: 14px; margin: 0 0 5px 0;">✅ Report generated with audio transcription</p>';
        statusText += '<p style="color: #28a745; font-size: 14px; margin: 0 0 10px 0;">✅ Report enhanced with telemetry data & GPS addresses</p>';
    } else if (isWithTranscription) {
        statusText += '<p style="color: #28a745; font-size: 14px; margin: 0 0 5px 0;">✅ Report generated with audio transcription</p>';
        statusText += '<p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">ℹ️ No telemetry data included</p>';
    } else if (isWithTelemetry) {
        statusText += '<p style="color: #ffc107; font-size: 14px; margin: 0 0 5px 0;">📹 Report generated from video analysis only</p>';
        statusText += '<p style="color: #28a745; font-size: 14px; margin: 0 0 10px 0;">✅ Report enhanced with telemetry data & GPS addresses</p>';
    } else {
        statusText += '<p style="color: #ffc107; font-size: 14px; margin: 0 0 10px 0;">📹 Report generated from video analysis only</p>';
    }
    
    statusText += '</div>';
    
    summaryDiv.innerHTML = statusText + `<div class="success">${report.replace(/\n/g, '<br>')}</div>`;
    resultSection.style.display = 'block';
}

export function showError(message) {
    const resultSection = document.getElementById('resultSection');
    const summaryDiv = document.getElementById('summary');
    
    summaryDiv.innerHTML = `<div class="error">${message}</div>`;
    resultSection.style.display = 'block';
}

// Display telemetry preview with enhanced address information
export function showTelemetryPreview(telemetryData, rawContent) {
    const summaryDiv = document.getElementById('telemetrySummary');
    
    let summaryHTML = '<div class="telemetry-summary-grid">';
    
    // Device Information
    if (telemetryData.deviceInfo) {
        summaryHTML += `
            <div class="telemetry-card">
                <h5>📱 Device Information</h5>
                <p><strong>Product:</strong> ${telemetryData.deviceInfo.product}</p>
                <p><strong>Serial:</strong> ${telemetryData.deviceInfo.serialNumber}</p>
                <p><strong>Version:</strong> ${telemetryData.deviceInfo.buildVersion}</p>
            </div>
        `;
    }
    
    // Officer Information
    if (telemetryData.eventData && telemetryData.eventData.events.length > 0) {
        const officerInfo = telemetryData.eventData.events.find(e => e.officer);
        if (officerInfo) {
            summaryHTML += `
                <div class="telemetry-card">
                    <h5>👮 Officer Information</h5>
                    <p><strong>Officer:</strong> ${officerInfo.officer}</p>
                    <p><strong>Department:</strong> ${officerInfo.deptName}</p>
                    <p><strong>Device ID:</strong> ${officerInfo.deviceId}</p>
                </div>
            `;
        }
    }
    
    // Timeline Information
    if (telemetryData.timeline) {
        summaryHTML += `
            <div class="telemetry-card">
                <h5>⏰ Timeline</h5>
                <p><strong>Start:</strong> ${new Date(telemetryData.timeline.startTime).toLocaleString()}</p>
                <p><strong>End:</strong> ${new Date(telemetryData.timeline.endTime).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${telemetryData.timeline.duration}</p>
            </div>
        `;
    }
    
    // GPS Information with Addresses
    if (telemetryData.gpsData) {
        summaryHTML += `
            <div class="telemetry-card">
                <h5>📍 GPS Data</h5>
                <p><strong>Total Updates:</strong> ${telemetryData.gpsData.totalGpsUpdates}</p>
        `;
        
        // Show first location with address
        if (telemetryData.gpsData.firstLocationWithAddress) {
            const firstAddr = telemetryData.gpsData.firstLocationWithAddress.address;
            const cleanFirstAddress = formatAddressForReport(firstAddr);
            summaryHTML += `
                <p><strong>Starting Location:</strong></p>
                <p style="font-size: 12px; margin-left: 10px; color: #495057;">
                    ${cleanFirstAddress}
                </p>
            `;
        } else {
            summaryHTML += `<p><strong>First Location:</strong> ${telemetryData.gpsData.firstLocation.coordinates}</p>`;
        }
        
        // Show last location with address
        if (telemetryData.gpsData.lastLocationWithAddress) {
            const lastAddr = telemetryData.gpsData.lastLocationWithAddress.address;
            const cleanLastAddress = formatAddressForReport(lastAddr);
            summaryHTML += `
                <p><strong>Ending Location:</strong></p>
                <p style="font-size: 12px; margin-left: 10px; color: #495057;">
                    ${cleanLastAddress}
                </p>
            `;
        } else {
            summaryHTML += `<p><strong>Last Location:</strong> ${telemetryData.gpsData.lastLocation.coordinates}</p>`;
        }
        
        summaryHTML += '</div>';
    }
    
    summaryHTML += '</div>';
    
    summaryDiv.innerHTML = summaryHTML;
}