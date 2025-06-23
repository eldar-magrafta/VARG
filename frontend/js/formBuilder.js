// formBuilder.js - Build dynamic editable forms for police reports

import { getFieldDefinitions } from './reportParser.js';
import { getAuthToken } from './main.js';

// Build and return the complete form HTML
export function buildReportForm(reportType, parsedData) {
    const fields = getFieldDefinitions(reportType);
    const formTitle = getFormTitle(reportType);
    
    let formHTML = `
        <div class="report-form-container">
            <div class="report-form-header">
                <h3>${formTitle}</h3>
                <div class="form-actions">
                    <button id="saveReportBtn" class="btn-success">💾 Save Report</button>
                    <button id="printReportBtn" class="btn-secondary">🖨️ Print Report</button>
                    <button id="exportReportBtn" class="btn-secondary">📄 Export PDF</button>
                </div>
            </div>
            
            <form id="policeReportForm" class="police-report-form">
    `;
    
    // Generate form sections
    const sections = organizeFieldsIntoSections(reportType, fields);
    
    sections.forEach(section => {
        formHTML += `
            <div class="form-section">
                <h4 class="section-header">${section.title}</h4>
                <div class="form-grid">
        `;
        
        section.fields.forEach(fieldKey => {
            const field = fields[fieldKey];
            const value = parsedData[fieldKey] || '';
            formHTML += generateFieldHTML(fieldKey, field, value);
        });
        
        formHTML += `
                </div>
            </div>
        `;
    });
    
    formHTML += `
            </form>
        </div>
    `;
    
    return formHTML;
}

// Generate HTML for a single form field
function generateFieldHTML(fieldKey, field, value) {
    const required = field.required ? 'required' : '';
    const fieldId = `field_${fieldKey}`;
    
    let inputHTML = '';
    
    switch (field.type) {
        case 'text':
            inputHTML = `
                <input type="text" 
                       id="${fieldId}" 
                       name="${fieldKey}" 
                       value="${escapeHtml(value)}" 
                       ${required} 
                       class="form-input">
            `;
            break;
            
        case 'date':
            inputHTML = `
                <input type="date" 
                       id="${fieldId}" 
                       name="${fieldKey}" 
                       value="${value}" 
                       ${required} 
                       class="form-input">
            `;
            break;
            
        case 'time':
            inputHTML = `
                <input type="time" 
                       id="${fieldId}" 
                       name="${fieldKey}" 
                       value="${value}" 
                       ${required} 
                       class="form-input">
            `;
            break;
            
        case 'textarea':
            const rows = field.rows || 4;
            inputHTML = `
                <textarea id="${fieldId}" 
                          name="${fieldKey}" 
                          rows="${rows}" 
                          ${required} 
                          class="form-textarea">${escapeHtml(value)}</textarea>
            `;
            break;
            
        default:
            inputHTML = `
                <input type="text" 
                       id="${fieldId}" 
                       name="${fieldKey}" 
                       value="${escapeHtml(value)}" 
                       ${required} 
                       class="form-input">
            `;
    }
    
    const requiredIndicator = field.required ? '<span class="required-indicator">*</span>' : '';
    
    return `
        <div class="form-field ${field.type === 'textarea' ? 'form-field-full' : ''}">
            <label for="${fieldId}" class="form-label">
                ${field.label}${requiredIndicator}
            </label>
            ${inputHTML}
        </div>
    `;
}

// Organize fields into logical sections for better form layout
function organizeFieldsIntoSections(reportType, fields) {
    const fieldKeys = Object.keys(fields);
    
    switch (reportType) {
        case 'general':
            return [
                {
                    title: '📋 Basic Information',
                    fields: ['reportHeader', 'incidentDate', 'incidentTime', 'location', 'reportingOfficer', 'badgeNumber', 'incidentType', 'weatherConditions']
                },
                {
                    title: '👥 Incident Details',
                    fields: ['individualsInvolved', 'incidentNarrative', 'officerActions']
                },
                {
                    title: '📄 Documentation',
                    fields: ['evidenceCollected', 'audioTranscript']
                }
            ];
            
        case 'vehicle_accident':
            return [
                {
                    title: '📋 Accident Information',
                    fields: ['reportHeader', 'incidentDate', 'incidentTime', 'location', 'reportingOfficer', 'badgeNumber', 'weatherConditions']
                },
                {
                    title: '🚗 Vehicle & Accident Details',
                    fields: ['vehiclesInvolved', 'accidentSequence', 'injuriesAndMedical']
                },
                {
                    title: '⚖️ Legal & Evidence',
                    fields: ['trafficViolations', 'witnessStatements', 'evidenceAndMeasurements']
                },
                {
                    title: '📄 Documentation',
                    fields: ['incidentNarrative', 'audioTranscript']
                }
            ];
            
        case 'crime':
            return [
                {
                    title: '📋 Crime Information',
                    fields: ['reportHeader', 'incidentDate', 'incidentTime', 'location', 'reportingOfficer', 'badgeNumber', 'crimeClassification', 'caseNumber']
                },
                {
                    title: '🏛️ Crime Details',
                    fields: ['crimeScene', 'incidentNarrative']
                },
                {
                    title: '👥 People Involved',
                    fields: ['victimInformation', 'suspectInformation', 'witnessInformation']
                },
                {
                    title: '⚖️ Investigation & Evidence',
                    fields: ['evidenceCollection', 'chargesAndDisposition', 'investigativeNotes']
                },
                {
                    title: '📄 Documentation',
                    fields: ['audioTranscript']
                }
            ];
            
        case 'lost_property':
            return [
                {
                    title: '📋 Report Information',
                    fields: ['reportHeader', 'incidentDate', 'incidentTime', 'location', 'reportingOfficer', 'badgeNumber']
                },
                {
                    title: '👤 Property Owner',
                    fields: ['propertyOwner']
                },
                {
                    title: '📦 Property Details',
                    fields: ['propertyDescription', 'lossCircumstances', 'incidentNarrative']
                },
                {
                    title: '🔍 Recovery Efforts',
                    fields: ['searchEfforts', 'propertyRecovery', 'followUpActions']
                },
                {
                    title: '📄 Documentation',
                    fields: ['propertyDocumentation', 'audioTranscript']
                }
            ];
            
        default:
            // Default grouping for unknown report types
            return [
                {
                    title: '📋 Report Information',
                    fields: fieldKeys.slice(0, Math.ceil(fieldKeys.length / 2))
                },
                {
                    title: '📄 Additional Details',
                    fields: fieldKeys.slice(Math.ceil(fieldKeys.length / 2))
                }
            ];
    }
}

// Get form title based on report type
function getFormTitle(reportType) {
    const titles = {
        general: '📋 General Incident Report',
        vehicle_accident: '🚗 Vehicle Accident Report',
        crime: '🚨 Crime Report',
        lost_property: '📦 Lost Property Report'
    };
    
    return titles[reportType] || '📋 Police Report';
}

// Set up form event listeners after form is created
export function setupFormEventListeners() {
    const saveBtn = document.getElementById('saveReportBtn');
    const printBtn = document.getElementById('printReportBtn');
    const exportBtn = document.getElementById('exportReportBtn');
    const form = document.getElementById('policeReportForm');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveReport);
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', handlePrintReport);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportReport);
    }
    
    if (form) {
        // Add auto-save functionality
        form.addEventListener('input', debounce(handleAutoSave, 2000));
        
        // Add form validation
        form.addEventListener('submit', handleFormSubmit);
    }
}

// Handle save report - NOW SAVES TO DATABASE
async function handleSaveReport() {
    const formData = getFormData();
    
    if (!formData || Object.keys(formData).length === 0) {
        showNotification('⚠️ No report data to save', 'warning');
        return;
    }
    
    // Convert form data to report text format
    const reportContent = formatFormDataAsReport(formData);
    
    try {
        const authToken = getAuthToken();
        if (!authToken) {
            showNotification('❌ Authentication required', 'error');
            return;
        }
        
        const response = await fetch('/api/reports/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ reportContent })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('✅ Report saved to database successfully!', 'success');
            console.log('📄 Report saved to database:', data.reportId);
        } else {
            showNotification('❌ Failed to save report: ' + (data.error || 'Unknown error'), 'error');
        }
        
    } catch (error) {
        console.error('Error saving report:', error);
        showNotification('❌ Error saving report. Please try again.', 'error');
    }
}

// Convert form data to formatted report text
function formatFormDataAsReport(formData) {
    let reportText = '**POLICE INCIDENT REPORT**\n\n';
    
    // Add each field with proper formatting
    Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value && value.trim()) {
            // Convert field key to readable label
            const label = formatFieldLabel(key);
            reportText += `**${label.toUpperCase()}:**\n${value}\n\n`;
        }
    });
    
    // Add timestamp
    //reportText += `\n**REPORT GENERATED:**\n${new Date().toLocaleString()}\n`;
    
    return reportText;
}

// Convert field keys to readable labels
function formatFieldLabel(fieldKey) {
    const labelMap = {
        'reportHeader': 'Report Type',
        'incidentDate': 'Incident Date',
        'incidentTime': 'Incident Time',
        'location': 'Location',
        'reportingOfficer': 'Reporting Officer',
        'badgeNumber': 'Badge Number',
        'incidentType': 'Incident Classification',
        'weatherConditions': 'Weather/Environmental Conditions',
        'individualsInvolved': 'Individuals Involved',
        'incidentNarrative': 'Incident Narrative',
        'officerActions': 'Officer Actions and Procedures',
        'evidenceCollected': 'Evidence and Documentation',
        'audioTranscript': 'Complete Audio Transcript'
    };
    
    return labelMap[fieldKey] || fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// Handle print report
function handlePrintReport() {
    // Hide form controls for printing
    const formActions = document.querySelector('.form-actions');
    if (formActions) formActions.style.display = 'none';
    
    // Print
    window.print();
    
    // Restore form controls
    setTimeout(() => {
        if (formActions) formActions.style.display = 'flex';
    }, 1000);
}

// Handle export to PDF (placeholder - would need additional library)
function handleExportReport() {
    showNotification('📄 PDF export feature coming soon!', 'info');
    console.log('📄 Export requested - would generate PDF here');
}

// Handle auto-save
function handleAutoSave() {
    const formData = getFormData();
    sessionStorage.setItem('currentReport', JSON.stringify(formData));
    showNotification('💾 Auto-saved', 'info', 2000);
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    handleSaveReport();
}

// Get all form data as an object
function getFormData() {
    const form = document.getElementById('policeReportForm');
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Show notification to user
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Debounce function for auto-save
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}