// reportParser.js - Simple and reliable parsing for police reports

// Base fields common to all report types
const BASE_FIELDS = {
    reportHeader: { label: 'Report Type', type: 'text', required: true },
    incidentDate: { label: 'Incident Date', type: 'date', required: true },
    incidentTime: { label: 'Incident Time', type: 'time', required: true },
    location: { label: 'Location', type: 'textarea', required: true },
    reportingOfficer: { label: 'Reporting Officer', type: 'text', required: true },
    badgeNumber: { label: 'Badge Number', type: 'text', required: true },
    incidentNarrative: { label: 'Incident Narrative', type: 'textarea', required: true, rows: 8 },
    audioTranscript: { label: 'Complete Audio Transcript', type: 'textarea', required: false, rows: 10 }
};

// Report type specific field definitions
const REPORT_FIELDS = {
    general: {
        ...BASE_FIELDS,
        incidentType: { label: 'Incident Classification', type: 'text', required: true },
        individualsInvolved: { label: 'Individuals Involved', type: 'textarea', required: true, rows: 6 },
        officerActions: { label: 'Officer Actions & Procedures', type: 'textarea', required: true, rows: 4 },
        evidenceCollected: { label: 'Evidence & Documentation', type: 'textarea', required: false, rows: 4 },
        weatherConditions: { label: 'Weather/Environmental Conditions', type: 'text', required: true }
    },
    
    vehicle_accident: {
        ...BASE_FIELDS,
        
    },
    
    crime: {
        ...BASE_FIELDS,
        
    },
    
    lost_property: {
        ...BASE_FIELDS,
       
    }
};

// Simple section-based parsing - much more reliable
function extractSections(text) {
    const sections = {};
    
    // Split the text by lines starting with **SECTION**:
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this line is a section header (starts with ** and ends with **)
        if (line.startsWith('**') && line.endsWith('**') && line.includes(':')) {
            // Save previous section if it exists
            if (currentSection) {
                sections[currentSection] = currentContent.join('\n').trim();
            }
            
            // Start new section
            currentSection = line.replace(/\*\*/g, '').replace(':', '').trim();
            currentContent = [];
        } else if (currentSection && line.length > 0) {
            // Add content to current section
            currentContent.push(line);
        }
    }
    
    // Don't forget the last section
    if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
    }
    
    return sections;
}

// Parse Gemini response text into structured data
export function parseGeminiResponse(responseText, reportType) {
    console.log(`📋 Parsing ${reportType} report response...`);
    
    const sections = extractSections(responseText);
    console.log('📋 Found sections:', Object.keys(sections));
    
    const fields = REPORT_FIELDS[reportType] || REPORT_FIELDS.general;
    const parsedData = {};
    
    // Initialize all fields with empty values
    Object.keys(fields).forEach(fieldKey => {
        parsedData[fieldKey] = '';
    });
    
    parseReports(sections, parsedData, reportType);
    
    console.log(`✅ Successfully parsed ${Object.keys(parsedData).length} fields`);
    console.log('📋 Parsed data keys:', Object.keys(parsedData).filter(k => parsedData[k]));
    
    return parsedData;
}

// Simple, direct mapping for general reports
function parseGeneralReport(sections, data) {
    console.log('sections is:', sections);
    // Direct mapping with exact section names from the response
    data.reportHeader = sections['REPORT TYPE'] || 'General Incident Report';
    data.incidentDate = cleanDate(sections['INCIDENT DATE'] || 'N/A');
    data.incidentTime = cleanTime(sections['INCIDENT TIME'] || '');
    data.location = sections['LOCATION'] || '';
    data.reportingOfficer = sections['REPORTING OFFICER'] || '';
    data.badgeNumber = sections['BADGE NUMBER'] || '';
    data.incidentType = sections['INCIDENT CLASSIFICATION'] || '';
    data.weatherConditions = sections['WEATHER/ENVIRONMENTAL CONDITIONS'] || '';
    data.individualsInvolved = sections['INDIVIDUALS INVOLVED'] || '';
    data.incidentNarrative = sections['INCIDENT NARRATIVE'] || '';
    data.officerActions = sections['OFFICER ACTIONS AND PROCEDURES'] || '';
    data.evidenceCollected = sections['EVIDENCE AND DOCUMENTATION'] || '';
    data.audioTranscript = sections['COMPLETE AUDIO TRANSCRIPT'] || '';
    
    console.log('✅ General report parsed with direct mapping');
}

function parseReports(sections, data, reportType) {
    switch (reportType) {
        case 'vehicle_accident':
            parseVehicleAccidentReport(sections, data);
            break;
        case 'crime':
            parseCrimeReport(sections, data);
            break;
        case 'lost_property':
            parseLostPropertyReport(sections, data);
            break;
        default:
            parseGeneralReport(sections, data);
    }
}

// Simple date cleaning
function cleanDate(dateStr) {
    if (!dateStr) return '';
    
    // Extract YYYY-MM-DD pattern
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) {
        return match[1];
    }
    
    // Try to parse other formats
    const cleaned = dateStr.trim();
    try {
        const date = new Date(cleaned);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        // Invalid date
    }
    
    return '';
}

// Simple time cleaning
function cleanTime(timeStr) {
    if (!timeStr) return '';
    
    // Extract HH:MM pattern
    const match = timeStr.match(/(\d{1,2}:\d{2})/);
    if (match) {
        const parts = match[1].split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1];
        return `${hours}:${minutes}`;
    }
    
    return '';
}


function parseVehicleAccidentReport(sections, data) {
    console.log('Parsing vehicle accident report...');
}

function parseCrimeReport(sections, data) {
    console.log('Parsing crime report...');
}

function parseLostPropertyReport(sections, data) {
    console.log('Parsing lost property report...');

}

// Get field definitions for a report type
export function getFieldDefinitions(reportType) {
    return REPORT_FIELDS[reportType] || REPORT_FIELDS.general;
}