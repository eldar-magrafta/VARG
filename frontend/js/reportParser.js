// reportParser.js - Complete field definitions for all report types

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
        eventNarrative: { label: 'Incident Narrative', type: 'textarea', required: true, rows: 8 },
        weatherConditions: { label: 'Weather/Environmental Conditions', type: 'text', required: true },
        vehiclesInvolved: { label: 'Vehicles Involved', type: 'textarea', required: true, rows: 6 },
        accidentSequence: { label: 'Accident Sequence', type: 'textarea', required: true, rows: 6 },
        injuriesAndMedical: { label: 'Injuries & Medical Response', type: 'textarea', required: false, rows: 4 },
        trafficViolations: { label: 'Traffic Violations', type: 'textarea', required: false, rows: 3 },
        witnessStatements: { label: 'Witness Statements', type: 'textarea', required: false, rows: 4 },
        evidenceAndMeasurements: { label: 'Evidence & Measurements', type: 'textarea', required: false, rows: 4 }
    },
    
    crime: {
        ...BASE_FIELDS,
        crimeClassification: { label: 'Crime Classification', type: 'text', required: true },
        caseNumber: { label: 'Case Number', type: 'text', required: false },
        crimeScene: { label: 'Crime Scene Description', type: 'textarea', required: true, rows: 4 },
        victimInformation: { label: 'Victim Information', type: 'textarea', required: false, rows: 4 },
        suspectInformation: { label: 'Suspect Information', type: 'textarea', required: false, rows: 4 },
        witnessInformation: { label: 'Witness Information', type: 'textarea', required: false, rows: 4 },
        evidenceCollection: { label: 'Evidence Collection', type: 'textarea', required: false, rows: 4 },
        chargesAndDisposition: { label: 'Charges & Disposition', type: 'textarea', required: false, rows: 3 },
        investigativeNotes: { label: 'Investigative Notes', type: 'textarea', required: false, rows: 4 }
    },
    
    lost_property: {
        ...BASE_FIELDS,
        propertyOwner: { label: 'Property Owner Information', type: 'textarea', required: true, rows: 3 },
        propertyDescription: { label: 'Property Description', type: 'textarea', required: true, rows: 4 },
        lossCircumstances: { label: 'Loss Circumstances', type: 'textarea', required: true, rows: 4 },
        searchEfforts: { label: 'Search Efforts', type: 'textarea', required: false, rows: 3 },
        propertyRecovery: { label: 'Property Recovery Status', type: 'textarea', required: false, rows: 3 },
        followUpActions: { label: 'Follow-up Actions', type: 'textarea', required: false, rows: 3 },
        propertyDocumentation: { label: 'Property Documentation', type: 'textarea', required: false, rows: 3 }
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
    console.log('Parsing general report sections:', sections);
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

// Parse vehicle accident reports
function parseVehicleAccidentReport(sections, data) {
    console.log('Parsing vehicle accident report sections:', sections);
    // Common fields
    data.reportHeader = sections['REPORT TYPE'] || 'Vehicle Accident Report';
    data.incidentDate = cleanDate(sections['INCIDENT DATE'] || 'N/A');
    data.incidentTime = cleanTime(sections['INCIDENT TIME'] || '');
    data.location = sections['LOCATION'] || '';
    data.reportingOfficer = sections['REPORTING OFFICER'] || '';
    data.badgeNumber = sections['BADGE NUMBER'] || '';
    data.weatherConditions = sections['WEATHER/ENVIRONMENTAL CONDITIONS'] || '';
    data.eventNarrative = sections['INCIDENT NARRATIVE'] || '';
    data.audioTranscript = sections['COMPLETE AUDIO TRANSCRIPT'] || '';
    
    // Vehicle accident specific fields
    data.vehiclesInvolved = sections['VEHICLES INVOLVED'] || sections['INDIVIDUALS INVOLVED'] || '';
    data.accidentSequence = sections['ACCIDENT SEQUENCE'] || sections['INCIDENT SEQUENCE'] || '';
    data.injuriesAndMedical = sections['INJURIES AND MEDICAL'] || sections['MEDICAL RESPONSE'] || '';
    data.trafficViolations = sections['TRAFFIC VIOLATIONS'] || sections['VIOLATIONS'] || '';
    data.witnessStatements = sections['WITNESS STATEMENTS'] || sections['WITNESSES'] || '';
    data.evidenceAndMeasurements = sections['EVIDENCE AND MEASUREMENTS'] || sections['EVIDENCE AND DOCUMENTATION'] || '';
    
    console.log('✅ Vehicle accident report parsed');
}

// Parse crime reports
function parseCrimeReport(sections, data) {
    console.log('Parsing crime report sections:', sections);
    // Common fields
    data.reportHeader = sections['REPORT TYPE'] || 'Crime Report';
    data.incidentDate = cleanDate(sections['INCIDENT DATE'] || 'N/A');
    data.incidentTime = cleanTime(sections['INCIDENT TIME'] || '');
    data.location = sections['LOCATION'] || '';
    data.reportingOfficer = sections['REPORTING OFFICER'] || '';
    data.badgeNumber = sections['BADGE NUMBER'] || '';
    data.incidentNarrative = sections['INCIDENT NARRATIVE'] || '';
    data.audioTranscript = sections['COMPLETE AUDIO TRANSCRIPT'] || '';
    
    // Crime specific fields
    data.crimeClassification = sections['CRIME CLASSIFICATION'] || sections['INCIDENT CLASSIFICATION'] || '';
    data.caseNumber = sections['CASE NUMBER'] || '';
    data.crimeScene = sections['CRIME SCENE'] || sections['CRIME SCENE DESCRIPTION'] || '';
    data.victimInformation = sections['VICTIM INFORMATION'] || sections['VICTIMS'] || '';
    data.suspectInformation = sections['SUSPECT INFORMATION'] || sections['SUSPECTS'] || '';
    data.witnessInformation = sections['WITNESS INFORMATION'] || sections['WITNESSES'] || '';
    data.evidenceCollection = sections['EVIDENCE COLLECTION'] || sections['EVIDENCE AND DOCUMENTATION'] || '';
    data.chargesAndDisposition = sections['CHARGES AND DISPOSITION'] || sections['CHARGES'] || '';
    data.investigativeNotes = sections['INVESTIGATIVE NOTES'] || sections['INVESTIGATION NOTES'] || '';
    
    console.log('✅ Crime report parsed');
}

// Parse lost property reports
function parseLostPropertyReport(sections, data) {
    console.log('Parsing lost property report sections:', sections);
    // Common fields
    data.reportHeader = sections['REPORT TYPE'] || 'Lost Property Report';
    data.incidentDate = cleanDate(sections['INCIDENT DATE'] || 'N/A');
    data.incidentTime = cleanTime(sections['INCIDENT TIME'] || '');
    data.location = sections['LOCATION'] || '';
    data.reportingOfficer = sections['REPORTING OFFICER'] || '';
    data.badgeNumber = sections['BADGE NUMBER'] || '';
    data.incidentNarrative = sections['INCIDENT NARRATIVE'] || '';
    data.audioTranscript = sections['COMPLETE AUDIO TRANSCRIPT'] || '';
    
    // Lost property specific fields
    data.propertyOwner = sections['PROPERTY OWNER'] || sections['PROPERTY OWNER INFORMATION'] || '';
    data.propertyDescription = sections['PROPERTY DESCRIPTION'] || sections['LOST PROPERTY DESCRIPTION'] || '';
    data.lossCircumstances = sections['LOSS CIRCUMSTANCES'] || sections['CIRCUMSTANCES'] || '';
    data.searchEfforts = sections['SEARCH EFFORTS'] || sections['RECOVERY EFFORTS'] || '';
    data.propertyRecovery = sections['PROPERTY RECOVERY'] || sections['RECOVERY STATUS'] || '';
    data.followUpActions = sections['FOLLOW-UP ACTIONS'] || sections['FOLLOW UP'] || '';
    data.propertyDocumentation = sections['PROPERTY DOCUMENTATION'] || sections['EVIDENCE AND DOCUMENTATION'] || '';
    
    console.log('✅ Lost property report parsed');
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

// Get field definitions for a report type
export function getFieldDefinitions(reportType) {
    return REPORT_FIELDS[reportType] || REPORT_FIELDS.general;
}