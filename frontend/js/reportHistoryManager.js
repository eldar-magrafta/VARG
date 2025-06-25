// reportHistoryManager.js - Clean Report History Management
// Manages report history display, editing, and updates without inline styles

// Parse report text back to form data
export function parseReportText(reportText) {
    const formData = {};
    
    // Improved parsing - handle double asterisks better
    // Split on section headers but avoid splitting on internal double asterisks
    const lines = reportText.split('\n');
    let currentSection = '';
    let currentContent = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this line is a main section header (starts and ends with **)
        if (line.startsWith('**') && line.endsWith(':**') && line.split('**').length === 3) {
            // Save previous section if exists
            if (currentSection && currentContent.trim()) {
                const fieldName = getSectionFieldName(currentSection);
                if (fieldName) {
                    formData[fieldName] = currentContent.trim();
                }
            }
            
            // Start new section
            currentSection = line.replace(/\*\*/g, '').replace(':', '').trim().toUpperCase();
            currentContent = '';
        } else if (line && !line.startsWith('**POLICE INCIDENT REPORT**') && !line.startsWith('**INCIDENT REPORT**')) {
            // Add to current content, preserving internal formatting
            if (currentContent) {
                currentContent += '\n' + line;
            } else {
                currentContent = line;
            }
        }
    }
    
    // Don't forget the last section
    if (currentSection && currentContent.trim()) {
        const fieldName = getSectionFieldName(currentSection);
        if (fieldName) {
            formData[fieldName] = currentContent.trim();
        }
    }
    
    return formData;
}

// Helper function to map section names to field names
function getSectionFieldName(sectionName) {
    const fieldMapping = {
        'REPORT TYPE': 'reportHeader',
        'INCIDENT DATE': 'incidentDate',
        'INCIDENT TIME': 'incidentTime',
        'LOCATION': 'location',
        'REPORTING OFFICER': 'reportingOfficer',
        'BADGE NUMBER': 'badgeNumber',
        'INCIDENT CLASSIFICATION': 'incidentType',
        'WEATHER/ENVIRONMENTAL CONDITIONS': 'weatherConditions',
        'INDIVIDUALS INVOLVED': 'individualsInvolved',
        'INCIDENT NARRATIVE': 'incidentNarrative',
        'OFFICER ACTIONS AND PROCEDURES': 'officerActions',
        'EVIDENCE AND DOCUMENTATION': 'evidenceCollected',
        'COMPLETE AUDIO TRANSCRIPT': 'audioTranscript'
    };
    
    return fieldMapping[sectionName] || null;
}

// Build form HTML for report history
export function buildHistoryReportForm(formData, reportNumber, actualReportId) {
    return `
        <div class="report-form-view">
            <!-- Hidden field to store the actual database ID -->
            <input type="hidden" id="reportId_${reportNumber}" value="${actualReportId}">
            
            <div class="report-form-grid">
                <div class="report-form-field">
                    <label class="report-form-label" for="reportHeader_${reportNumber}">Report Type:</label>
                    <input type="text" class="report-form-input" id="reportHeader_${reportNumber}" value="${escapeHtml(formData.reportHeader || '')}">
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="incidentDate_${reportNumber}">Incident Date:</label>
                    <input type="date" class="report-form-input" id="incidentDate_${reportNumber}" value="${formData.incidentDate || ''}">
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="incidentTime_${reportNumber}">Incident Time:</label>
                    <input type="time" class="report-form-input" id="incidentTime_${reportNumber}" value="${formData.incidentTime || ''}">
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="reportingOfficer_${reportNumber}">Reporting Officer:</label>
                    <input type="text" class="report-form-input" id="reportingOfficer_${reportNumber}" value="${escapeHtml(formData.reportingOfficer || '')}">
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="badgeNumber_${reportNumber}">Badge Number:</label>
                    <input type="text" class="report-form-input" id="badgeNumber_${reportNumber}" value="${escapeHtml(formData.badgeNumber || '')}">
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="incidentType_${reportNumber}">Incident Classification:</label>
                    <input type="text" class="report-form-input" id="incidentType_${reportNumber}" value="${escapeHtml(formData.incidentType || '')}">
                </div>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="location_${reportNumber}">Location:</label>
                <textarea rows="2" class="report-form-textarea" id="location_${reportNumber}">${escapeHtml(formData.location || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="weatherConditions_${reportNumber}">Weather/Environmental Conditions:</label>
                <textarea rows="2" class="report-form-textarea" id="weatherConditions_${reportNumber}">${escapeHtml(formData.weatherConditions || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="individualsInvolved_${reportNumber}">Individuals Involved:</label>
                <textarea rows="4" class="report-form-textarea" id="individualsInvolved_${reportNumber}">${escapeHtml(formData.individualsInvolved || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="incidentNarrative_${reportNumber}">Incident Narrative:</label>
                <textarea rows="6" class="report-form-textarea" id="incidentNarrative_${reportNumber}">${escapeHtml(formData.incidentNarrative || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="officerActions_${reportNumber}">Officer Actions and Procedures:</label>
                <textarea rows="4" class="report-form-textarea" id="officerActions_${reportNumber}">${escapeHtml(formData.officerActions || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="evidenceCollected_${reportNumber}">Evidence and Documentation:</label>
                <textarea rows="3" class="report-form-textarea" id="evidenceCollected_${reportNumber}">${escapeHtml(formData.evidenceCollected || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="audioTranscript_${reportNumber}">Complete Audio Transcript:</label>
                <textarea rows="6" class="report-form-textarea" id="audioTranscript_${reportNumber}">${escapeHtml(formData.audioTranscript || '')}</textarea>
            </div>
            
            <div class="report-form-actions">
                <button onclick="updateReport(${reportNumber})" class="report-update-btn">💾 Update Report</button>
                <button onclick="toggleReportForm(${reportNumber})" class="report-cancel-btn">❌ Cancel</button>
            </div>
        </div>
    `;
}

// Display report history in a modal/overlay with forms
export function displayReportHistory(reports, currentUser) {
    // Remove existing overlay if present
    const existingOverlay = document.getElementById('reportHistoryOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'reportHistoryOverlay';
    overlay.className = 'modal-overlay';
    
    let reportsHTML = '';
    if (reports.length === 0) {
        reportsHTML = '<div class="report-history-empty"><p>No reports found.</p></div>';
    } else {
        reports.forEach((report, index) => {
            const date = new Date(report.created_at).toLocaleString();
            const userReportNumber = index + 1;
            const actualReportId = report.id; // This is the real database ID
            
            // Parse the report text into form data
            const formData = parseReportText(report.report_content);
            const formHTML = buildHistoryReportForm(formData, userReportNumber, actualReportId);
            
            reportsHTML += `
                <div class="report-card">
                    <div class="report-card-header">
                        <h4>Report #${userReportNumber} - ${date}</h4>
                        <div class="report-card-actions">
                            <span class="report-card-badge">DB ID: ${actualReportId}</span>
                            <button onclick="toggleReportForm(${userReportNumber})" class="report-toggle-btn">
                                📄 View as Text
                            </button>
                        </div>
                    </div>
                    <div id="reportForm${userReportNumber}" class="report-form-container">
                        ${formHTML}
                    </div>
                    <div id="reportText${userReportNumber}" class="report-text-view" style="display: none;">
                        <div class="report-text-content">${escapeHtml(report.report_content)}</div>
                    </div>
                </div>
            `;
        });
    }
    
    overlay.innerHTML = `
        <div class="report-history-container">
            <div class="report-history-header">
                <h2>📋 Report History for ${currentUser.username}</h2>
                <button onclick="document.getElementById('reportHistoryOverlay').remove()" class="report-history-close">&times;</button>
            </div>
            <div class="report-history-content">
                ${reportsHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close on background click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    console.log('📋 Report history displayed with', reports.length, 'reports');
}

// Toggle between form and text view
export function toggleReportForm(reportNumber) {
    const formDiv = document.getElementById(`reportForm${reportNumber}`);
    const textDiv = document.getElementById(`reportText${reportNumber}`);
    const button = document.querySelector(`button[onclick="toggleReportForm(${reportNumber})"]`);
    
    if (!formDiv || !textDiv || !button) {
        console.error('❌ Could not find form elements for report', reportNumber);
        return;
    }
    
    if (formDiv.style.display === 'none') {
        // Show form, hide text
        formDiv.style.display = 'block';
        textDiv.style.display = 'none';
        button.innerHTML = '📄 View as Text';
    } else {
        // Show text, hide form
        formDiv.style.display = 'none';
        textDiv.style.display = 'block';
        button.innerHTML = '📝 Edit Form';
    }
    
    console.log('🔄 Toggled view for report', reportNumber);
}

// Collect form data from the editable form
function collectFormData(reportNumber) {
    const formData = {};
    
    // Get all the field values using the unique IDs
    const fields = [
        'reportHeader', 'incidentDate', 'incidentTime', 'location',
        'reportingOfficer', 'badgeNumber', 'incidentType', 'weatherConditions',
        'individualsInvolved', 'incidentNarrative', 'officerActions',
        'evidenceCollected', 'audioTranscript'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(`${field}_${reportNumber}`);
        if (element) {
            formData[field] = element.value;
        }
    });
    
    return formData;
}

// Convert form data back to report text format
function formatFormDataAsReport(formData) {
    let reportText = '**INCIDENT REPORT**\n\n';
    
    // Map form fields to report sections
    const sectionMapping = {
        'reportHeader': 'REPORT TYPE',
        'incidentDate': 'INCIDENT DATE',
        'incidentTime': 'INCIDENT TIME',
        'location': 'LOCATION',
        'reportingOfficer': 'REPORTING OFFICER',
        'badgeNumber': 'BADGE NUMBER',
        'incidentType': 'INCIDENT CLASSIFICATION',
        'weatherConditions': 'WEATHER/ENVIRONMENTAL CONDITIONS',
        'individualsInvolved': 'INDIVIDUALS INVOLVED',
        'incidentNarrative': 'INCIDENT NARRATIVE',
        'officerActions': 'OFFICER ACTIONS AND PROCEDURES',
        'evidenceCollected': 'EVIDENCE AND DOCUMENTATION',
        'audioTranscript': 'COMPLETE AUDIO TRANSCRIPT'
    };
    
    // Add each section with proper formatting
    Object.keys(sectionMapping).forEach(fieldKey => {
        const value = formData[fieldKey];
        if (value && value.trim()) {
            const sectionName = sectionMapping[fieldKey];
            reportText += `**${sectionName}:**\n${value.trim()}\n\n`;
        }
    });
    
    return reportText;
}

// Update report function with proper implementation
export async function updateReport(reportNumber) {
    try {
        // Get the actual database ID
        const reportIdElement = document.getElementById(`reportId_${reportNumber}`);
        if (!reportIdElement) {
            showUpdateNotification('❌ Error: Could not find report ID', 'error');
            return;
        }
        
        const actualReportId = reportIdElement.value;
        console.log(`🔄 Updating report with database ID: ${actualReportId}`);
        
        // Collect the form data
        const formData = collectFormData(reportNumber);
        
        // Convert form data to report text format
        const reportContent = formatFormDataAsReport(formData);
        
        // Get authentication token
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            showUpdateNotification('❌ Authentication required. Please log in again.', 'error');
            return;
        }
        
        // Show loading state
        const updateButton = document.querySelector(`button[onclick="updateReport(${reportNumber})"]`);
        if (updateButton) {
            updateButton.innerHTML = '⏳ Updating...';
            updateButton.disabled = true;
        }
        
        // Make API call to update the report
        const response = await fetch(`/api/reports/update/${actualReportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ reportContent })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Success
            showUpdateNotification('Report updated successfully!', 'success');
            console.log('📄 Report updated in database');
            
            // Update the text view with the new content
            const textDiv = document.getElementById(`reportText${reportNumber}`);
            if (textDiv) {
                const contentDiv = textDiv.querySelector('.report-text-content');
                if (contentDiv) {
                    contentDiv.textContent = reportContent;
                }
            }
            
        } else {
            showUpdateNotification('❌ Failed to update report: ' + (data.error || 'Unknown error'), 'error');
        }
        
    } catch (error) {
        console.error('❌ Error updating report:', error);
        showUpdateNotification('❌ Error updating report. Please try again.', 'error');
    } finally {
        // Restore button state
        const updateButton = document.querySelector(`button[onclick="updateReport(${reportNumber})"]`);
        if (updateButton) {
            updateButton.innerHTML = '💾 Update Report';
            updateButton.disabled = false;
        }
    }
}

// Show update notification without inline styles
function showUpdateNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.update-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `update-notification update-${type}`;
    notification.textContent = message;
    
    // Find a good place to insert the notification
    const reportHistory = document.querySelector('.report-history-content');
    if (reportHistory) {
        reportHistory.insertBefore(notification, reportHistory.firstChild);
    } else {
        document.body.appendChild(notification);
    }
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
