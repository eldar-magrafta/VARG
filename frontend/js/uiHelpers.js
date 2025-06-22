// uiHelpers.js - UI Update Functions with Enhanced Form Display
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

// Enhanced showGeminiReport with structured form display
export function showGeminiReport(report, isWithTranscription = false, isWithTelemetry = false, reportType = 'general') {
    const resultSection = document.getElementById('resultSection');
    const summaryDiv = document.getElementById('summary');
    
    // Import form building modules
    import('./reportParser.js').then(({ parseGeminiResponse }) => {
        import('./formBuilder.js').then(({ buildReportForm, setupFormEventListeners }) => {
            
            // Parse the Gemini response into structured data
            const parsedData = parseGeminiResponse(report, reportType);
            
            // Build the editable form
            const formHTML = buildReportForm(reportType, parsedData);
            
            // Create status header
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
            
            // Display status and form
            summaryDiv.innerHTML = statusText + formHTML;
            resultSection.style.display = 'block';
            
            // Set up form event listeners after DOM is updated
            setTimeout(() => {
                setupFormEventListeners();
            }, 100);
            
            console.log(`✅ ${reportType} report form displayed with ${Object.keys(parsedData).length} parsed fields`);
        });
    }).catch(error => {
        console.error('❌ Error loading form modules:', error);
        // Fallback to basic display if modules fail to load
        showBasicReport(report, isWithTranscription, isWithTelemetry, resultSection, summaryDiv);
    });
}

// Fallback function for basic report display if form modules fail
function showBasicReport(report, isWithTranscription, isWithTelemetry, resultSection, summaryDiv) {
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
    statusText += '<div class="basic-report-notice" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 12px; border-radius: 8px; margin-bottom: 16px; color: #856404;">';
    statusText += '<strong>⚠️ Enhanced Form Mode Unavailable</strong><br>';
    statusText += 'Displaying basic text format. The structured form feature could not be loaded.';
    statusText += '</div>';
    
    summaryDiv.innerHTML = statusText + `<div class="success">${report.replace(/\n/g, '<br>')}</div>`;
    resultSection.style.display = 'block';
    
    console.log('⚠️ Displayed basic report format due to module loading error');
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

// Additional utility functions for enhanced UI interactions

// Show loading state for specific operations
export function showOperationLoading(operation, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const loadingHTML = `
        <div class="operation-loading">
            <div class="spinner"></div>
            <p>${operation}</p>
        </div>
    `;
    
    element.innerHTML = loadingHTML;
    element.style.display = 'block';
}

// Hide loading state
export function hideOperationLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.display = 'none';
}

// Show success notification
export function showSuccessNotification(message, duration = 4000) {
    showNotification(message, 'success', duration);
}

// Show error notification
export function showErrorNotification(message, duration = 6000) {
    showNotification(message, 'error', duration);
}

// Show warning notification
export function showWarningNotification(message, duration = 5000) {
    showNotification(message, 'warning', duration);
}

// Show info notification
export function showInfoNotification(message, duration = 4000) {
    showNotification(message, 'info', duration);
}

// Generic notification function
export function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add close button for longer notifications
    if (duration > 5000) {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'notification-close';
        closeBtn.onclick = () => notification.remove();
        notification.appendChild(closeBtn);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove notification
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Clear all notifications
export function clearAllNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    });
}

// Show confirmation dialog
export function showConfirmation(message, onConfirm, onCancel = null) {
    const confirmed = confirm(message);
    if (confirmed && onConfirm) {
        onConfirm();
    } else if (!confirmed && onCancel) {
        onCancel();
    }
    return confirmed;
}

// Enhanced error display with details
export function showDetailedError(mainMessage, details = null, suggestedActions = null) {
    const resultSection = document.getElementById('resultSection');
    const summaryDiv = document.getElementById('summary');
    
    let errorHTML = `<div class="detailed-error">`;
    errorHTML += `<div class="error-main">${mainMessage}</div>`;
    
    if (details) {
        errorHTML += `<div class="error-details">`;
        errorHTML += `<h4>Error Details:</h4>`;
        errorHTML += `<p>${details}</p>`;
        errorHTML += `</div>`;
    }
    
    if (suggestedActions) {
        errorHTML += `<div class="error-actions">`;
        errorHTML += `<h4>Suggested Actions:</h4>`;
        if (Array.isArray(suggestedActions)) {
            errorHTML += `<ul>`;
            suggestedActions.forEach(action => {
                errorHTML += `<li>${action}</li>`;
            });
            errorHTML += `</ul>`;
        } else {
            errorHTML += `<p>${suggestedActions}</p>`;
        }
        errorHTML += `</div>`;
    }
    
    errorHTML += `</div>`;
    
    summaryDiv.innerHTML = errorHTML;
    resultSection.style.display = 'block';
}

// Show system status information
export function showSystemStatus(status, message) {
    const statusIndicator = document.getElementById('systemStatus') || createStatusIndicator();
    
    statusIndicator.className = `system-status status-${status}`;
    statusIndicator.textContent = message;
    statusIndicator.style.display = 'block';
    
    // Auto-hide success status after 3 seconds
    if (status === 'success') {
        setTimeout(() => {
            statusIndicator.style.display = 'none';
        }, 3000);
    }
}

// Create system status indicator if it doesn't exist
function createStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'systemStatus';
    indicator.className = 'system-status';
    document.body.appendChild(indicator);
    return indicator;
}

// Utility function to escape HTML to prevent XSS
export function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to format file sizes
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to format timestamps
export function formatTimestamp(timestamp, options = {}) {
    const date = new Date(timestamp);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        ...options
    };
    
    return date.toLocaleString('en-US', defaultOptions);
}