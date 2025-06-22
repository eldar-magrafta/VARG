// reportParser.js - Parse Gemini responses into structured form data

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
        weatherConditions: { label: 'Weather/Environmental Conditions', type: 'text', required: false }
    },
    
    vehicle_accident: {
        ...BASE_FIELDS,
        weatherConditions: { label: 'Weather & Road Conditions', type: 'text', required: true },
        vehiclesInvolved: { label: 'Vehicles Involved', type: 'textarea', required: true, rows: 8 },
        accidentSequence: { label: 'Accident Sequence/Reconstruction', type: 'textarea', required: true, rows: 6 },
        injuriesAndMedical: { label: 'Injuries & Medical Response', type: 'textarea', required: true, rows: 4 },
        trafficViolations: { label: 'Traffic Violations & Citations', type: 'textarea', required: false, rows: 4 },
        witnessStatements: { label: 'Witness Information', type: 'textarea', required: false, rows: 4 },
        evidenceAndMeasurements: { label: 'Evidence & Measurements', type: 'textarea', required: false, rows: 4 }
    },
    
    crime: {
        ...BASE_FIELDS,
        crimeClassification: { label: 'Crime Classification', type: 'text', required: true },
        caseNumber: { label: 'Case Number', type: 'text', required: false },
        crimeScene: { label: 'Crime Scene Description', type: 'textarea', required: true, rows: 6 },
        victimInformation: { label: 'Victim Information', type: 'textarea', required: true, rows: 6 },
        suspectInformation: { label: 'Suspect Information', type: 'textarea', required: true, rows: 6 },
        witnessInformation: { label: 'Witness Information', type: 'textarea', required: false, rows: 4 },
        evidenceCollection: { label: 'Evidence Collection', type: 'textarea', required: true, rows: 6 },
        chargesAndDisposition: { label: 'Charges & Disposition', type: 'textarea', required: false, rows: 4 },
        investigativeNotes: { label: 'Investigation Notes', type: 'textarea', required: false, rows: 4 }
    },
    
    lost_property: {
        ...BASE_FIELDS,
        propertyOwner: { label: 'Property Owner Information', type: 'textarea', required: true, rows: 4 },
        propertyDescription: { label: 'Lost Property Description', type: 'textarea', required: true, rows: 6 },
        lossCircumstances: { label: 'Circumstances of Loss', type: 'textarea', required: true, rows: 6 },
        searchEfforts: { label: 'Search Efforts Conducted', type: 'textarea', required: true, rows: 4 },
        propertyRecovery: { label: 'Recovery Procedures', type: 'textarea', required: false, rows: 4 },
        followUpActions: { label: 'Follow-up Actions', type: 'textarea', required: false, rows: 4 },
        propertyDocumentation: { label: 'Property Documentation', type: 'textarea', required: false, rows: 4 }
    }
};

// Parse Gemini response text into structured data
export function parseGeminiResponse(responseText, reportType) {
    console.log(`📋 Parsing ${reportType} report response...`);
    
    const sections = extractSections(responseText);
    const fields = REPORT_FIELDS[reportType] || REPORT_FIELDS.general;
    const parsedData = {};
    
    // Initialize all fields with empty values
    Object.keys(fields).forEach(fieldKey => {
        parsedData[fieldKey] = '';
    });
    
    // Map sections to fields based on report type
    switch (reportType) {
        case 'general':
            parseGeneralReport(sections, parsedData);
            break;
        case 'vehicle_accident':
            parseVehicleAccidentReport(sections, parsedData);
            break;
        case 'crime':
            parseCrimeReport(sections, parsedData);
            break;
        case 'lost_property':
            parseLostPropertyReport(sections, parsedData);
            break;
        default:
            parseGeneralReport(sections, parsedData);
    }
    
    console.log(`✅ Parsed ${Object.keys(parsedData).length} fields for ${reportType} report`);
    return parsedData;
}

// Extract sections from Gemini response text
function extractSections(responseText) {
    const sections = {};
    
    // Split by bold headers (**SECTION NAME:**)
    const sectionPattern = /\*\*(.*?)\*\*\s*:?\s*([\s\S]*?)(?=\*\*|$)/g;
    let match;
    
    while ((match = sectionPattern.exec(responseText)) !== null) {
        const sectionName = match[1].trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
        const sectionContent = match[2].trim();
        sections[sectionName] = sectionContent;
    }
    
    // Also try to extract the report header
    const headerMatch = responseText.match(/\*\*(.*?REPORT)\*\*/i);
    if (headerMatch) {
        sections.report_header = headerMatch[1];
    }
    
    return sections;
}

// Parse general incident report
function parseGeneralReport(sections, data) {
    data.reportHeader = sections.incident_report || sections.report_header || 'General Incident Report';
    data.incidentType = sections.incident_details || extractFirstLine(sections.incident_details);
    data.individualsInvolved = sections.individuals_involved || '';
    data.incidentNarrative = sections.incident_narrative || '';
    data.officerActions = sections.officer_actions_and_procedures || sections.officer_actions || '';
    data.evidenceCollected = sections.documentation || sections.evidence || '';
    data.audioTranscript = sections.complete_audio_transcript || sections.audio_transcript || '';
    
    // Extract common details
    extractCommonDetails(sections, data);
}

// Parse vehicle accident report
function parseVehicleAccidentReport(sections, data) {
    data.reportHeader = sections.vehicle_accident_report || sections.report_header || 'Vehicle Accident Report';
    data.weatherConditions = sections.accident_details || sections.vehicle_accident_details || '';
    data.vehiclesInvolved = sections.vehicles_involved || '';
    data.accidentSequence = sections.accident_sequence || sections.accident_reconstruction || '';
    data.injuriesAndMedical = sections.injuries_and_medical_response || '';
    data.trafficViolations = sections.traffic_enforcement_actions || sections.traffic_violations_and_citations || '';
    data.witnessStatements = sections.witness_statements || sections.witness_information || '';
    data.evidenceAndMeasurements = sections.evidence_and_measurements || '';
    data.audioTranscript = sections.complete_audio_transcript || sections.audio_transcript || '';
    
    extractCommonDetails(sections, data);
}

// Parse crime report
function parseCrimeReport(sections, data) {
    data.reportHeader = sections.crime_report || sections.report_header || 'Crime Report';
    data.crimeClassification = sections.crime_classification || sections.crime_incident_details || '';
    data.caseNumber = extractCaseNumber(sections.crime_classification);
    data.crimeScene = sections.crime_scene_description || sections.crime_scene_analysis || '';
    data.victimInformation = sections.victim_information || '';
    data.suspectInformation = sections.suspect_information || '';
    data.witnessInformation = sections.witness_information || '';
    data.evidenceCollection = sections.evidence_collection || '';
    data.chargesAndDisposition = sections.charges_and_disposition || '';
    data.investigativeNotes = sections.criminal_investigation_notes || sections.investigative_actions || '';
    data.audioTranscript = sections.complete_audio_transcript || sections.audio_transcript || '';
    
    extractCommonDetails(sections, data);
}

// Parse lost property report
function parseLostPropertyReport(sections, data) {
    data.reportHeader = sections.lost_property_report || sections.report_header || 'Lost Property Report';
    data.propertyOwner = sections.property_owner_information || sections.reporting_party_information || '';
    data.propertyDescription = sections.lost_property_description || sections.property_details || '';
    data.lossCircumstances = sections.circumstances_of_loss || sections.loss_circumstances || '';
    data.searchEfforts = sections.search_efforts || '';
    data.propertyRecovery = sections.property_recovery_procedures || sections.found_property_protocols || '';
    data.followUpActions = sections.follow_up_actions || '';
    data.propertyDocumentation = sections.property_documentation || '';
    data.audioTranscript = sections.complete_audio_transcript || sections.audio_transcript || '';
    
    extractCommonDetails(sections, data);
}

// Extract common details like date, time, location, officer info
function extractCommonDetails(sections, data) {
    // Try to extract from incident details section
    const incidentDetails = sections.incident_details || sections.accident_details || 
                           sections.crime_incident_details || sections.lost_property_incident_details || '';
    
    // Extract date (look for date patterns)
    const dateMatch = incidentDetails.match(/date[:\s]*([^\n,]+)/i);
    if (dateMatch) {
        data.incidentDate = parseDate(dateMatch[1]);
    }
    
    // Extract time
    const timeMatch = incidentDetails.match(/time[:\s]*([^\n,]+)/i);
    if (timeMatch) {
        data.incidentTime = parseTime(timeMatch[1]);
    }
    
    // Extract location
    const locationMatch = incidentDetails.match(/location[:\s]*([^\n]+)/i);
    if (locationMatch) {
        data.location = locationMatch[1].trim();
    }
    
    // Extract officer information
    const officerMatch = incidentDetails.match(/officer[s]?[:\s]*([^\n,]+)/i);
    if (officerMatch) {
        data.reportingOfficer = officerMatch[1].trim();
    }
    
    // Extract badge number
    const badgeMatch = incidentDetails.match(/badge[:\s]*([^\n,]+)/i);
    if (badgeMatch) {
        data.badgeNumber = badgeMatch[1].trim();
    }
}

// Helper functions
function extractFirstLine(text) {
    if (!text) return '';
    return text.split('\n')[0].replace(/^[-\s]*/, '').trim();
}

function extractCaseNumber(text) {
    if (!text) return '';
    const match = text.match(/case\s+number[:\s]*([^\n,]+)/i);
    return match ? match[1].trim() : '';
}

function parseDate(dateStr) {
    if (!dateStr) return '';
    // Try to extract date in various formats
    const cleaned = dateStr.replace(/[^\d\/\-\.]/g, '');
    // Return in YYYY-MM-DD format for HTML input
    try {
        const date = new Date(cleaned);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        // Return as-is if parsing fails
    }
    return cleaned;
}

function parseTime(timeStr) {
    if (!timeStr) return '';
    // Extract time in HH:MM format
    const match = timeStr.match(/(\d{1,2}):?(\d{2})/);
    if (match) {
        const hours = match[1].padStart(2, '0');
        const minutes = match[2];
        return `${hours}:${minutes}`;
    }
    return timeStr.trim();
}

// Get field definitions for a report type
export function getFieldDefinitions(reportType) {
    return REPORT_FIELDS[reportType] || REPORT_FIELDS.general;
}