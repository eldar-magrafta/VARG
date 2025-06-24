// reportHistoryManager.js - Complete Report History Management with Proper Update Functionality

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

// Build form HTML for report history - NOW INCLUDES ACTUAL REPORT ID
export function buildHistoryReportForm(formData, reportNumber, actualReportId) {
    return `
        <div style="padding: 24px; background: #f8f9fa;">
            <!-- Hidden field to store the actual database ID -->
            <input type="hidden" id="reportId_${reportNumber}" value="${actualReportId}">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Report Type:</label>
                    <input type="text" id="reportHeader_${reportNumber}" value="${formData.reportHeader || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Incident Date:</label>
                    <input type="date" id="incidentDate_${reportNumber}" value="${formData.incidentDate || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Incident Time:</label>
                    <input type="time" id="incidentTime_${reportNumber}" value="${formData.incidentTime || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Reporting Officer:</label>
                    <input type="text" id="reportingOfficer_${reportNumber}" value="${formData.reportingOfficer || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Badge Number:</label>
                    <input type="text" id="badgeNumber_${reportNumber}" value="${formData.badgeNumber || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Incident Classification:</label>
                    <input type="text" id="incidentType_${reportNumber}" value="${formData.incidentType || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Location:</label>
                <textarea rows="2" id="location_${reportNumber}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.location || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Weather/Environmental Conditions:</label>
                <textarea rows="2" id="weatherConditions_${reportNumber}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.weatherConditions || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Individuals Involved:</label>
                <textarea rows="4" id="individualsInvolved_${reportNumber}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.individualsInvolved || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Incident Narrative:</label>
                <textarea rows="6" id="incidentNarrative_${reportNumber}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.incidentNarrative || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Officer Actions and Procedures:</label>
                <textarea rows="4" id="officerActions_${reportNumber}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.officerActions || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Evidence and Documentation:</label>
                <textarea rows="3" id="evidenceCollected_${reportNumber}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.evidenceCollected || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Complete Audio Transcript:</label>
                <textarea rows="6" id="audioTranscript_${reportNumber}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: monospace; resize: vertical;">${formData.audioTranscript || ''}</textarea>
            </div>
            
            <div style="text-align: center; margin-top: 24px;">
                <button onclick="updateReport(${reportNumber})" style="background: linear-gradient(135deg, #38a169 0%, #2f855a 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 12px;">💾 Update Report</button>
                <button onclick="toggleReportForm(${reportNumber})" style="background: linear-gradient(135deg, #718096 0%, #4a5568 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">❌ Cancel</button>
            </div>
        </div>
    `;
}

// Display report history in a modal/overlay with forms - NOW PASSES ACTUAL REPORT IDS
export function displayReportHistory(reports, currentUser) {
    // Remove existing overlay if present
    const existingOverlay = document.getElementById('reportHistoryOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'reportHistoryOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(26, 54, 93, 0.95);
        backdrop-filter: blur(8px);
        z-index: 1000;
        overflow: auto;
        animation: fadeIn 0.3s ease;
    `;
    
    let reportsHTML = '';
    if (reports.length === 0) {
        reportsHTML = '<p style="text-align: center; color: #666; margin: 40px 0;">No reports found.</p>';
    } else {
        reports.forEach((report, index) => {
            const date = new Date(report.created_at).toLocaleString();
            const userReportNumber = index + 1;
            const actualReportId = report.id; // This is the real database ID
            
            // Parse the report text into form data
            const formData = parseReportText(report.report_content);
            const formHTML = buildHistoryReportForm(formData, userReportNumber, actualReportId);
            
            reportsHTML += `
                <div style="margin-bottom: 32px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #1a365d 0%, #3182ce 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="margin: 0; font-size: 1.2rem;">Report #${userReportNumber} - ${date}</h4>
                        <div style="display: flex; gap: 8px;">
                            <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">internal report ID in the DB: ${actualReportId}</span>
                            <button onclick="toggleReportForm(${userReportNumber})" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                📄 View as plain Text
                            </button>
                        </div>
                    </div>
                    <div id="reportForm${userReportNumber}" style="display: block;">
                        ${formHTML}
                    </div>
                    <div id="reportText${userReportNumber}" style="display: none; padding: 20px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
                        <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #cbd5e0; white-space: pre-wrap; font-family: monospace; font-size: 0.85rem; max-height: 300px; overflow-y: auto;">
${report.report_content}
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    overlay.innerHTML = `
        <div style="position: relative; width: 95%; max-width: 1200px; margin: 2% auto; background: white; border-radius: 16px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1a365d 0%, #3182ce 100%); color: white; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 1.4rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📋 Report History for ${currentUser.username}</h2>
                <button onclick="document.getElementById('reportHistoryOverlay').remove()" style="background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); color: white; font-size: 20px; cursor: pointer; padding: 8px; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">&times;</button>
            </div>
            <div style="padding: 32px; max-height: 75vh; overflow-y: auto;">
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
}

// Toggle between form and text view
export function toggleReportForm(reportNumber) {
    const formDiv = document.getElementById(`reportForm${reportNumber}`);
    const textDiv = document.getElementById(`reportText${reportNumber}`);
    const button = document.querySelector(`button[onclick="toggleReportForm(${reportNumber})"]`);
    
    if (formDiv.style.display === 'none') {
        // Show form, hide text
        formDiv.style.display = 'block';
        textDiv.style.display = 'none';
        if (button) button.innerHTML = '📄 View as plain text';
    } else {
        // Show text, hide form
        formDiv.style.display = 'none';
        textDiv.style.display = 'block';
        if (button) button.innerHTML = '📝 Edit Form';
    }
}

// NEW: Collect form data from the editable form
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

// NEW: Convert form data back to report text format
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

// UPDATED: Update report function with proper implementation
export async function updateReport(reportNumber) {
    try {
        // Get the actual database ID
        const reportIdElement = document.getElementById(`reportId_${reportNumber}`);
        if (!reportIdElement) {
            alert('❌ Error: Could not find report ID');
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
            alert('❌ Authentication required. Please log in again.');
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
            alert('✅ Report updated successfully!');
            console.log('📄 Report updated in database');
            
            // Update the text view with the new content
            const textDiv = document.getElementById(`reportText${reportNumber}`);
            if (textDiv) {
                const contentDiv = textDiv.querySelector('div');
                if (contentDiv) {
                    contentDiv.textContent = reportContent;
                }
            }
            
        } else {
            alert('❌ Failed to update report: ' + (data.error || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('❌ Error updating report:', error);
        alert('❌ Error updating report. Please try again.');
    } finally {
        // Restore button state
        const updateButton = document.querySelector(`button[onclick="updateReport(${reportNumber})"]`);
        if (updateButton) {
            updateButton.innerHTML = '💾 Update Report';
            updateButton.disabled = false;
        }
    }
}