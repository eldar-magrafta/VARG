// reportHistoryManager.js - Complete Report History Management with Form Display

// Parse report text back to form data
export function parseReportText(reportText) {
    const formData = {};
    
    // Basic parsing - look for key patterns
    const sections = reportText.split(/\*\*([^*]+):\*\*/);
    
    for (let i = 1; i < sections.length; i += 2) {
        const header = sections[i].trim().toUpperCase();
        const content = sections[i + 1] ? sections[i + 1].trim().split('\n\n')[0].trim() : '';
        
        // Map headers to field names
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
        
        const fieldName = fieldMapping[header];
        if (fieldName && content) {
            formData[fieldName] = content;
        }
    }
    
    return formData;
}

// Build form HTML for report history
export function buildHistoryReportForm(formData, reportNumber) {
    return `
        <div style="padding: 24px; background: #f8f9fa;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Report Type:</label>
                    <input type="text" value="${formData.reportHeader || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Incident Date:</label>
                    <input type="date" value="${formData.incidentDate || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Incident Time:</label>
                    <input type="time" value="${formData.incidentTime || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Reporting Officer:</label>
                    <input type="text" value="${formData.reportingOfficer || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Badge Number:</label>
                    <input type="text" value="${formData.badgeNumber || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Incident Classification:</label>
                    <input type="text" value="${formData.incidentType || ''}" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem;">
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Location:</label>
                <textarea rows="2" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.location || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Weather/Environmental Conditions:</label>
                <textarea rows="2" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.weatherConditions || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Individuals Involved:</label>
                <textarea rows="4" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.individualsInvolved || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Incident Narrative:</label>
                <textarea rows="6" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.incidentNarrative || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Officer Actions and Procedures:</label>
                <textarea rows="4" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.officerActions || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Evidence and Documentation:</label>
                <textarea rows="3" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical;">${formData.evidenceCollected || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #1a365d; margin-bottom: 6px; font-size: 0.9rem; text-transform: uppercase;">Complete Audio Transcript:</label>
                <textarea rows="6" style="width: 100%; padding: 10px; border: 2px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; font-family: monospace; resize: vertical;">${formData.audioTranscript || ''}</textarea>
            </div>
            
            <div style="text-align: center; margin-top: 24px;">
                <button onclick="updateReport(${reportNumber})" style="background: linear-gradient(135deg, #38a169 0%, #2f855a 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 12px;">💾 Update Report</button>
                <button onclick="toggleReportForm(${reportNumber})" style="background: linear-gradient(135deg, #718096 0%, #4a5568 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">❌ Cancel</button>
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
            
            // Parse the report text into form data
            const formData = parseReportText(report.report_content);
            const formHTML = buildHistoryReportForm(formData, userReportNumber);
            
            reportsHTML += `
                <div style="margin-bottom: 32px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #1a365d 0%, #3182ce 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="margin: 0; font-size: 1.2rem;">Report #${userReportNumber} - ${date}</h4>
                        <button onclick="toggleReportForm(${userReportNumber})" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                            📝 Edit Form
                        </button>
                    </div>
                    <div id="reportForm${userReportNumber}" style="display: none;">
                        ${formHTML}
                    </div>
                    <div id="reportText${userReportNumber}" style="padding: 20px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
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
    
    if (formDiv.style.display === 'none') {
        formDiv.style.display = 'block';
        textDiv.style.display = 'none';
    } else {
        formDiv.style.display = 'none';
        textDiv.style.display = 'block';
    }
}

// Update report function (placeholder for now)
export function updateReport(reportNumber) {
    alert(`Update functionality for Report #${reportNumber} coming in next step!`);
}