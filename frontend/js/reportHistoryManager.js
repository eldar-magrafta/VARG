// reportHistoryManager.js - Clean Report History Management, with Filtering and Edit Mode
// Manages report history display, editing, updates, and filtering

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

// Extract report type from report content
function extractReportType(reportContent) {
    console.log('🔍 Extracting report type from content...');

    // Find **REPORT TYPE:** and extract text until next **
    const reportTypeStart = reportContent.indexOf('**REPORT TYPE:**');
    if (reportTypeStart === -1) {
        console.log('❌ **REPORT TYPE:** not found');
        return 'general';
    }

    // Start after **REPORT TYPE:**
    const contentStart = reportTypeStart + '**REPORT TYPE:**'.length;

    // Find the next **
    const nextDoubleAsterisk = reportContent.indexOf('**', contentStart);
    if (nextDoubleAsterisk === -1) {
        console.log('❌ Next ** not found');
        return 'general';
    }

    // Extract the text between **REPORT TYPE:** and the next **
    const extractedText = reportContent.substring(contentStart, nextDoubleAsterisk).trim();
    console.log('📋 Extracted text:', `"${extractedText}"`);

    // Map the extracted text to report types
    const lowerText = extractedText.toLowerCase();

    if (lowerText.includes('vehicle') || lowerText.includes('accident')) {
        console.log('✅ Mapped to: vehicle_accident');
        return 'vehicle_accident';
    }
    if (lowerText.includes('crime')) {
        console.log('✅ Mapped to: crime');
        return 'crime';
    }
    if (lowerText.includes('lost') || lowerText.includes('property')) {
        console.log('✅ Mapped to: lost_property');
        return 'lost_property';
    }
    if (lowerText.includes('general') || lowerText.includes('incident')) {
        console.log('✅ Mapped to: general');
        return 'general';
    }

    console.log('✅ Default to: general');
    return 'general';
}

// Build form HTML for report history with read-only fields by default
export function buildHistoryReportForm(formData, reportNumber, actualReportId) {
    return `
        <div class="report-form-view">
            <!-- Hidden field to store the actual database ID -->
            <input type="hidden" id="reportId_${reportNumber}" value="${actualReportId}">
            
            <div class="report-form-grid">
                <div class="report-form-field">
                    <label class="report-form-label" for="reportHeader_${reportNumber}">Report Type:</label>
                    <input type="text" class="report-form-input" id="reportHeader_${reportNumber}" value="${escapeHtml(formData.reportHeader || '')}" readonly>
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="incidentDate_${reportNumber}">Incident Date:</label>
                    <input type="date" class="report-form-input" id="incidentDate_${reportNumber}" value="${formData.incidentDate || ''}" readonly>
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="incidentTime_${reportNumber}">Incident Time:</label>
                    <input type="time" class="report-form-input" id="incidentTime_${reportNumber}" value="${formData.incidentTime || ''}" readonly>
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="reportingOfficer_${reportNumber}">Reporting Officer:</label>
                    <input type="text" class="report-form-input" id="reportingOfficer_${reportNumber}" value="${escapeHtml(formData.reportingOfficer || '')}" readonly>
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="badgeNumber_${reportNumber}">Badge Number:</label>
                    <input type="text" class="report-form-input" id="badgeNumber_${reportNumber}" value="${escapeHtml(formData.badgeNumber || '')}" readonly>
                </div>
                <div class="report-form-field">
                    <label class="report-form-label" for="incidentType_${reportNumber}">Incident Classification:</label>
                    <input type="text" class="report-form-input" id="incidentType_${reportNumber}" value="${escapeHtml(formData.incidentType || '')}" readonly>
                </div>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="location_${reportNumber}">Location:</label>
                <textarea rows="2" class="report-form-textarea" id="location_${reportNumber}" readonly>${escapeHtml(formData.location || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="weatherConditions_${reportNumber}">Weather/Environmental Conditions:</label>
                <textarea rows="2" class="report-form-textarea" id="weatherConditions_${reportNumber}" readonly>${escapeHtml(formData.weatherConditions || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="individualsInvolved_${reportNumber}">Individuals Involved:</label>
                <textarea rows="4" class="report-form-textarea" id="individualsInvolved_${reportNumber}" readonly>${escapeHtml(formData.individualsInvolved || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="incidentNarrative_${reportNumber}">Incident Narrative:</label>
                <textarea rows="6" class="report-form-textarea" id="incidentNarrative_${reportNumber}" readonly>${escapeHtml(formData.incidentNarrative || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="officerActions_${reportNumber}">Officer Actions and Procedures:</label>
                <textarea rows="4" class="report-form-textarea" id="officerActions_${reportNumber}" readonly>${escapeHtml(formData.officerActions || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="evidenceCollected_${reportNumber}">Evidence and Documentation:</label>
                <textarea rows="3" class="report-form-textarea" id="evidenceCollected_${reportNumber}" readonly>${escapeHtml(formData.evidenceCollected || '')}</textarea>
            </div>
            
            <div class="report-form-field report-form-full-width">
                <label class="report-form-label" for="audioTranscript_${reportNumber}">Complete Audio Transcript:</label>
                <textarea rows="6" class="report-form-textarea" id="audioTranscript_${reportNumber}" readonly>${escapeHtml(formData.audioTranscript || '')}</textarea>
            </div>
            
            <div class="report-form-actions">
                <button onclick="updateReport(${reportNumber})" class="report-update-btn" id="updateBtn_${reportNumber}" style="display: none;">💾 Update Report</button>
                <button onclick="cancelEdit(${reportNumber})" class="report-cancel-btn" id="cancelBtn_${reportNumber}" style="display: none;">❌ Cancel</button>
            </div>
        </div>
    `;
}

// Display report history in a modal/overlay with forms and filtering
export function displayReportHistory(reports, currentUser) {
    // Remove existing overlay if present
    const existingOverlay = document.getElementById('reportHistoryOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'reportHistoryOverlay';
    overlay.className = 'modal-overlay';

    // Build filter controls
    const filtersHTML = `
        <div class="report-filters">
            <div class="filter-group">
                <label for="reportTypeFilter">Report Type:</label>
                <select id="reportTypeFilter">
                    <option value="">All Report Types</option>
                    <option value="general">General Incident</option>
                    <option value="vehicle_accident">Vehicle Accident</option>
                    <option value="crime">Crime Report</option>
                    <option value="lost_property">Lost Property</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="dateFromFilter">From Date:</label>
                <input type="date" id="dateFromFilter">
            </div>
            
            <div class="filter-group">
                <label for="dateToFilter">To Date:</label>
                <input type="date" id="dateToFilter">
            </div>
            
            <div class="filter-group">
                <button onclick="clearFilters()" class="clear-filters-btn">Clear Filters</button>
            </div>
        </div>
        
        <div class="filter-results">
            <span id="filterResultsText">Showing all ${reports.length} reports</span>
        </div>
    `;

    let reportsHTML = '';
    if (reports.length === 0) {
        reportsHTML = '<div class="report-history-empty"><p>No reports found.</p></div>';
    } else {
        reports.forEach((report, index) => {
            const date = new Date(report.created_at).toLocaleString();
            const reportDate = new Date(report.created_at).toISOString().split('T')[0]; // YYYY-MM-DD format
            const userReportNumber = reports.length - index; // Reverse numbering: newest gets highest number
            const actualReportId = report.id; // This is the real database ID
            const reportType = extractReportType(report.report_content);

            console.log(`📋 Report #${userReportNumber}:`);
            console.log(`   📄 Content length: ${report.report_content.length} chars`);
            console.log(`   📅 Date: ${reportDate}`);
            console.log(`   🏷️ Detected type: ${reportType}`);
            console.log(`   🆔 DB ID: ${actualReportId}`);
            console.log('---');

            // Parse the report text into form data
            const formData = parseReportText(report.report_content);
            const formHTML = buildHistoryReportForm(formData, userReportNumber, actualReportId);

            reportsHTML += `
                <div class="report-card" data-report-type="${reportType}" data-report-date="${reportDate}">
                    <div class="report-card-header">
                        <div class="report-header-info" onclick="toggleReportCollapse(${userReportNumber})">
                            <h4>Report #${userReportNumber} — ${date}</h4>
                            <span class="report-card-badge">${formatReportType(reportType)}</span>
                        </div>
                        <div class="report-header-controls">
                            <button onclick="event.stopPropagation(); toggleEditMode(${userReportNumber})" class="header-edit-btn" id="headerEditBtn_${userReportNumber}">✏️ Edit</button>
                            <span class="collapse-arrow" id="collapseArrow${userReportNumber}" onclick="toggleReportCollapse(${userReportNumber})">▼</span>
                        </div>
                    </div>
                    <div id="reportContent${userReportNumber}" class="report-content">
                        <div class="report-card-actions">
                            <button onclick="toggleReportForm(${userReportNumber})" class="report-toggle-btn">
                                📄 View as Text
                            </button>
                            <button onclick="exportReportToPDF(${userReportNumber})" class="report-export-btn">
                                📄 Export PDF
                            </button>
                        </div>
                        <div id="reportForm${userReportNumber}" class="report-form-container">
                            ${formHTML}
                        </div>
                        <div id="reportText${userReportNumber}" class="report-text-view" style="display: none;">
                            <div class="report-text-content">${escapeHtml(report.report_content)}</div>
                        </div>
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
                ${filtersHTML}
                <div id="reportsList">
                    ${reportsHTML}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Set up filter event listeners
    setupFilterListeners();

    // Close on background click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    console.log('📋 Report history displayed with', reports.length, 'reports, filtering enabled, and read-only forms');
}

// Set up filter event listeners
function setupFilterListeners() {
    console.log('🔧 Setting up filter event listeners...');

    const reportTypeFilter = document.getElementById('reportTypeFilter');
    const dateFromFilter = document.getElementById('dateFromFilter');
    const dateToFilter = document.getElementById('dateToFilter');

    if (reportTypeFilter) {
        console.log('✅ Report type filter found, adding listener');
        reportTypeFilter.addEventListener('change', (e) => {
            console.log('🔄 Report type filter changed to:', e.target.value);
            applyFilters();
        });
    } else {
        console.error('❌ Report type filter not found!');
    }

    if (dateFromFilter) {
        console.log('✅ Date from filter found, adding listener');
        dateFromFilter.addEventListener('change', (e) => {
            console.log('🔄 Date from filter changed to:', e.target.value);
            applyFilters();
        });
    } else {
        console.error('❌ Date from filter not found!');
    }

    if (dateToFilter) {
        console.log('✅ Date to filter found, adding listener');
        dateToFilter.addEventListener('change', (e) => {
            console.log('🔄 Date to filter changed to:', e.target.value);
            applyFilters();
        });
    } else {
        console.error('❌ Date to filter not found!');
    }

    console.log('🔧 Filter listeners setup complete');
}

// Apply filters to report cards
function applyFilters() {
    console.log('🔍 Applying filters...');

    const reportTypeFilter = document.getElementById('reportTypeFilter').value;
    const dateFromFilter = document.getElementById('dateFromFilter').value;
    const dateToFilter = document.getElementById('dateToFilter').value;

    console.log('🔍 Filter values:');
    console.log(`   📋 Report Type: "${reportTypeFilter}"`);
    console.log(`   📅 Date From: "${dateFromFilter}"`);
    console.log(`   📅 Date To: "${dateToFilter}"`);

    const reportCards = document.querySelectorAll('.report-card');
    let visibleCount = 0;
    const totalCount = reportCards.length;

    console.log(`🔍 Processing ${totalCount} report cards...`);

    reportCards.forEach((card, index) => {
        const cardReportType = card.getAttribute('data-report-type');
        const cardReportDate = card.getAttribute('data-report-date');

        console.log(`🔍 Card #${index + 1}:`);
        console.log(`   🏷️ Card type: "${cardReportType}"`);
        console.log(`   📅 Card date: "${cardReportDate}"`);

        let showCard = true;
        let hideReasons = [];

        // Filter by report type
        if (reportTypeFilter && cardReportType !== reportTypeFilter) {
            showCard = false;
            hideReasons.push(`type mismatch: "${cardReportType}" !== "${reportTypeFilter}"`);
        }

        // Filter by date range
        if (dateFromFilter && cardReportDate < dateFromFilter) {
            showCard = false;
            hideReasons.push(`before from date: "${cardReportDate}" < "${dateFromFilter}"`);
        }

        if (dateToFilter && cardReportDate > dateToFilter) {
            showCard = false;
            hideReasons.push(`after to date: "${cardReportDate}" > "${dateToFilter}"`);
        }

        // Show/hide the card
        if (showCard) {
            card.style.display = 'block';
            visibleCount++;
            console.log(`   ✅ SHOWING card #${index + 1}`);
        } else {
            card.style.display = 'none';
            console.log(`   ❌ HIDING card #${index + 1} - Reasons: ${hideReasons.join(', ')}`);
        }
    });

    console.log(`🔍 Filter results: ${visibleCount}/${totalCount} cards visible`);

    // Update results text
    updateFilterResultsText(visibleCount, totalCount);
}

// Update filter results text
function updateFilterResultsText(visibleCount, totalCount) {
    const resultsText = document.getElementById('filterResultsText');
    if (resultsText) {
        if (visibleCount === totalCount) {
            resultsText.textContent = `Showing all ${totalCount} reports`;
        } else {
            resultsText.textContent = `Showing ${visibleCount} of ${totalCount} reports`;
        }
    }
}

// Clear all filters
window.clearFilters = function() {
    document.getElementById('reportTypeFilter').value = '';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('dateToFilter').value = '';
    applyFilters();
}

// Format report type for display
function formatReportType(reportType) {
    const typeMap = {
        'general': 'General',
        'vehicle_accident': 'Vehicle Accident',
        'crime': 'Crime',
        'lost_property': 'Lost Property'
    };

    return typeMap[reportType] || 'General';
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
        button.innerHTML = '📝 View as Form';
    }

    console.log('🔄 Toggled view for report', reportNumber);
}

// NEW FUNCTION: Toggle report collapse/expand (updated for new structure)
window.toggleReportCollapse = function(reportNumber) {
    const reportContent = document.getElementById(`reportContent${reportNumber}`);
    const collapseArrow = document.getElementById(`collapseArrow${reportNumber}`);

    if (!reportContent || !collapseArrow) {
        console.error('❌ Could not find collapse elements for report', reportNumber);
        return;
    }

    // Toggle the collapsed state
    if (reportContent.style.display === 'none') {
        // Expand
        reportContent.style.display = 'block';
        collapseArrow.innerHTML = '▼';
        collapseArrow.classList.remove('collapsed');
        console.log(`📂 Report ${reportNumber} expanded`);
    } else {
        // Collapse
        reportContent.style.display = 'none';
        collapseArrow.innerHTML = '▶';
        collapseArrow.classList.add('collapsed');
        console.log(`📁 Report ${reportNumber} collapsed`);
    }
};

// NEW FUNCTION: Toggle edit mode (updated for header button)
window.toggleEditMode = function(reportNumber) {
    const fields = [
        'reportHeader', 'incidentDate', 'incidentTime', 'location',
        'reportingOfficer', 'badgeNumber', 'incidentType', 'weatherConditions',
        'individualsInvolved', 'incidentNarrative', 'officerActions',
        'evidenceCollected', 'audioTranscript'
    ];

    const headerEditBtn = document.getElementById(`headerEditBtn_${reportNumber}`);
    const updateBtn = document.getElementById(`updateBtn_${reportNumber}`);
    const cancelBtn = document.getElementById(`cancelBtn_${reportNumber}`);

    // Check if we're currently in edit mode
    const isCurrentlyEditing = headerEditBtn && headerEditBtn.innerHTML.includes('Revert');

    if (isCurrentlyEditing) {
        // REVERT MODE - go back to readonly

        // Restore original values
        if (window.originalValues && window.originalValues[reportNumber]) {
            fields.forEach(field => {
                const element = document.getElementById(`${field}_${reportNumber}`);
                if (element && window.originalValues[reportNumber][field] !== undefined) {
                    element.value = window.originalValues[reportNumber][field];
                }
            });
        }

        // Make fields readonly again
        fields.forEach(field => {
            const element = document.getElementById(`${field}_${reportNumber}`);
            if (element) {
                element.setAttribute('readonly', 'readonly');
            }
        });

        // Change button back to Edit
        headerEditBtn.innerHTML = '✏️ Edit';
        headerEditBtn.className = 'header-edit-btn';

        // Hide action buttons
        if (updateBtn) updateBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';

        console.log(`↩️ Reverted to readonly mode for report ${reportNumber}`);

    } else {
        // EDIT MODE - make fields editable

        // Store original values for revert functionality
        if (!window.originalValues) {
            window.originalValues = {};
        }

        if (!window.originalValues[reportNumber]) {
            window.originalValues[reportNumber] = {};
            fields.forEach(field => {
                const element = document.getElementById(`${field}_${reportNumber}`);
                if (element) {
                    window.originalValues[reportNumber][field] = element.value;
                }
            });
        }

        // Remove readonly attribute
        fields.forEach(field => {
            const element = document.getElementById(`${field}_${reportNumber}`);
            if (element) {
                element.removeAttribute('readonly');
            }
        });

        // Change button to Revert
        headerEditBtn.innerHTML = '↩️ Revert';
        headerEditBtn.className = 'header-revert-btn';

        // Show action buttons
        if (updateBtn) updateBtn.style.display = 'inline-block';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        console.log(`✏️ Edit mode enabled for report ${reportNumber}`);
    }
};

// NEW FUNCTION: Cancel edit mode
window.cancelEdit = function(reportNumber) {
    const fields = [
        'reportHeader', 'incidentDate', 'incidentTime', 'location',
        'reportingOfficer', 'badgeNumber', 'incidentType', 'weatherConditions',
        'individualsInvolved', 'incidentNarrative', 'officerActions',
        'evidenceCollected', 'audioTranscript'
    ];

    const editBtn = document.getElementById(`editBtn_${reportNumber}`);
    const updateBtn = document.getElementById(`updateBtn_${reportNumber}`);
    const cancelBtn = document.getElementById(`cancelBtn_${reportNumber}`);

    // Restore original values
    if (window.originalValues && window.originalValues[reportNumber]) {
        fields.forEach(field => {
            const element = document.getElementById(`${field}_${reportNumber}`);
            if (element && window.originalValues[reportNumber][field] !== undefined) {
                element.value = window.originalValues[reportNumber][field];
            }
        });
    }

    // Make fields readonly again
    fields.forEach(field => {
        const element = document.getElementById(`${field}_${reportNumber}`);
        if (element) {
            element.setAttribute('readonly', 'readonly');
        }
    });

    // Toggle buttons
    editBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    console.log(`❌ Edit mode cancelled for report ${reportNumber}`);
};

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

// Update report function with proper implementation and readonly mode after update
export async function updateReport(reportNumber) {
    try {
        // Get the actual database ID
        const reportIdElement = document.getElementById(`reportId_${reportNumber}`);
        if (!reportIdElement) {
            showGlobalNotification('Error: Could not find report ID', 'error');
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
            showGlobalNotification('❌ Authentication required. Please log in again.', 'error');
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
            showGlobalNotification('Report updated successfully!', 'success');
            console.log('📄 Report updated in database');

            // Update the text view with the new content
            const textDiv = document.getElementById(`reportText${reportNumber}`);
            if (textDiv) {
                const contentDiv = textDiv.querySelector('.report-text-content');
                if (contentDiv) {
                    contentDiv.textContent = reportContent;
                }
            }

            // Exit edit mode and make fields readonly again
            const fields = [
                'reportHeader', 'incidentDate', 'incidentTime', 'location',
                'reportingOfficer', 'badgeNumber', 'incidentType', 'weatherConditions',
                'individualsInvolved', 'incidentNarrative', 'officerActions',
                'evidenceCollected', 'audioTranscript'
            ];

            fields.forEach(field => {
                const element = document.getElementById(`${field}_${reportNumber}`);
                if (element) {
                    element.setAttribute('readonly', 'readonly');
                }
            });

            // Update stored original values
            if (!window.originalValues) {
                window.originalValues = {};
            }
            window.originalValues[reportNumber] = { ...formData };

            // Toggle buttons back to edit mode
            const headerEditBtn = document.getElementById(`headerEditBtn_${reportNumber}`);
            const updateBtn = document.getElementById(`updateBtn_${reportNumber}`);
            const cancelBtn = document.getElementById(`cancelBtn_${reportNumber}`);

            if (headerEditBtn) {
                headerEditBtn.innerHTML = '✏️ Edit';
                headerEditBtn.className = 'header-edit-btn';
            }
            if (updateBtn) updateBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'none';

        } else {
            showGlobalNotification('❌ Failed to update report: ' + (data.error || 'Unknown error'), 'error');
        }

    } catch (error) {
        console.error('❌ Error updating report:', error);
        showGlobalNotification('❌ Error updating report. Please try again.', 'error');
    } finally {
        // Restore button state
        const updateButton = document.querySelector(`button[onclick="updateReport(${reportNumber})"]`);
        if (updateButton) {
            updateButton.innerHTML = '💾 Update Report';
            updateButton.disabled = false;
        }
    }
}

// Export report to PDF
window.exportReportToPDF = async function(reportNumber) {
    try {
        // Get the actual database ID
        const reportIdElement = document.getElementById(`reportId_${reportNumber}`);
        if (!reportIdElement) {
            showGlobalNotification('Error: Could not find report ID', 'error');
            return;
        }

        const actualReportId = reportIdElement.value;
        console.log(`📄 Exporting report PDF with database ID: ${actualReportId}`);

        // Collect the form data
        const formData = collectFormData(reportNumber);

        // Get authentication token
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            showGlobalNotification('❌ Authentication required. Please log in again.', 'error');
            return;
        }

        // Show loading state
        const exportButton = document.querySelector(`button[onclick="exportReportToPDF(${reportNumber})"]`);
        if (exportButton) {
            exportButton.innerHTML = '⏳ Exporting...';
            exportButton.disabled = true;
        }

        // Make API call to download PDF
        const response = await fetch('/api/reports/downloadPDF', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ formData })
        });

        if (response.ok) {
            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `police-report-${actualReportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            showGlobalNotification('✅ PDF exported successfully!', 'success');
            console.log('📄 PDF downloaded successfully');
        } else {
            const errorData = await response.json();
            showGlobalNotification('❌ Failed to export PDF: ' + (errorData.error || 'Unknown error'), 'error');
        }

    } catch (error) {
        console.error('❌ Error exporting PDF:', error);
        showGlobalNotification('❌ Error exporting PDF. Please try again.', 'error');
    } finally {
        // Restore button state
        const exportButton = document.querySelector(`button[onclick="exportReportToPDF(${reportNumber})"]`);
        if (exportButton) {
            exportButton.innerHTML = '📄 Export PDF';
            exportButton.disabled = false;
        }
    }
};

// Use global notification system
function showGlobalNotification(message, type = 'info', duration = 4000) {
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

    // Add to body (not to specific container)
    document.body.appendChild(notification);

    // Auto-remove notification after specified duration
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);

    console.log(`📢 Global notification: ${message} (${type})`);
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}