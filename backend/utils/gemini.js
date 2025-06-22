const fetch = require('node-fetch');

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Mapping values to display names for prompts
const CRITERIA_MAPPINGS = {
    reportType: {
        'general': 'General Incident Report',
        'vehicle_accident': 'Vehicle Accident Report', 
        'crime': 'Crime Report',
        'lost_property': 'Lost Property Report'
    },
    timeOfDay: {
        'day_shift': 'Day Shift (6AM-2PM)',
        'evening_shift': 'Evening Shift (2PM-10PM)',
        'night_shift': 'Night Shift (10PM-6AM)'
    },
    priority: {
        'routine': 'Routine',
        'priority': 'Priority',
        'emergency': 'Emergency',
        'code3': 'Code 3'
    }
};

const prompts = {
    general: getDefaultPrompt(),
    vehicle_accident: getVehicleAccidentPrompt(),
    crime: getCrimePrompt(),
    lost_property: getLostPropertyPrompt()
};

async function generateReport(videoBuffer, mimeType, transcription, telemetryData, criteria) {
    try {
        console.log('🚀 Starting Gemini API call...');
        
        const base64Data = videoBuffer.toString('base64');
        const prompt = buildPrompt(transcription, telemetryData, criteria);
        
        const requestData = {
            contents: [{
                parts: [
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    },
                    { text: prompt }
                ]
            }]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error && errorData.error.message ? errorData.error.message : `API Error: ${response.status}`);
        }

        const data = await response.json();
        return extractReport(data);

    } catch (error) {
        console.error('❌ Gemini API error:', error);
        throw error;
    }
}

function buildPrompt(transcription, telemetryData, criteria) {
    const reportType = criteria && criteria.reportType ? criteria.reportType : 'general';
    let prompt = prompts[reportType] || prompts.general;
    
    if (criteria) {
        prompt += '\n\nREPORT CRITERIA:\n';
        
        // Map values to display text using our mappings
        const reportTypeText = CRITERIA_MAPPINGS.reportType[criteria.reportType] || criteria.reportType;
        const timeOfDayText = CRITERIA_MAPPINGS.timeOfDay[criteria.timeOfDay] || criteria.timeOfDay;
        const priorityText = CRITERIA_MAPPINGS.priority[criteria.priority] || criteria.priority;
        
        prompt += `Report Type: ${reportTypeText}\n`;
        prompt += `Time of Day: ${timeOfDayText}\n`;
        prompt += `Incident Priority: ${priorityText}\n`;
    }
    
    if (telemetryData) {
        prompt += '\n\nTELEMETRY DATA:\n' + JSON.stringify(telemetryData, null, 2);
    }
    
    if (transcription) {
        prompt += '\n\nAUDIO TRANSCRIPTION:\n' + transcription;
    }
    
    return prompt;
}

function extractReport(data) {
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
    }
    throw new Error('No police report generated. Please try again.');
}

function getDefaultPrompt() {
    return `Begin immediately with "**INCIDENT REPORT**" - no introduction, explanation, or acknowledgment. You are generating an official police incident report for law enforcement documentation.

Analyze this body camera footage, audio transcription, and telemetry data to create a comprehensive professional incident report following standard police documentation protocols:

**INCIDENT DETAILS:**
- Date, time, location of incident
- Type of call/incident classification  
- Officers present and roles
- Badge numbers and unit identifiers
- Weather and environmental conditions

**INDIVIDUALS INVOLVED:**
Provide detailed physical descriptions using standard law enforcement identification protocols for each person involved.

**INCIDENT NARRATIVE:**
Write a concise, professional summary of the sequence of events in paragraph form. Focus on ACTIONS and BEHAVIORS, not dialogue.

**OFFICER ACTIONS AND PROCEDURES:**
- Commands given and suspect compliance
- Use of force (if any) and justification
- Miranda rights administration (if applicable)
- Evidence preservation measures

**COMPLETE AUDIO TRANSCRIPT:**
Create a detailed, chronological transcript of ALL spoken dialogue with consistent timestamp formatting [HH:MM:SS].

Provide only factual, objective reporting using professional law enforcement terminology.`;
}

function getVehicleAccidentPrompt() {
    return `Begin immediately with "**VEHICLE ACCIDENT REPORT**" - no introduction, explanation, or acknowledgment. You are generating an official police vehicle accident report for law enforcement and insurance documentation.

Analyze this body camera footage, audio transcription, and telemetry data to create a comprehensive vehicle accident report following standard traffic collision investigation protocols:

**ACCIDENT DETAILS:**
- Date, time, exact location (street address, intersection, mile marker)
- Weather conditions and visibility
- Road surface conditions (dry, wet, icy, debris)
- Traffic control devices present (signals, signs, markings)
- Posted speed limit and estimated speeds of vehicles

**VEHICLES INVOLVED:**
For each vehicle provide:
- Year, make, model, color, license plate, VIN (if available)
- Driver information (name, age, license number, address)
- Passenger details and seating positions
- Vehicle damage description and location
- Estimated damage cost category

**ACCIDENT SEQUENCE:**
Detailed narrative of the collision sequence including:
- Pre-impact actions of all drivers
- Point of impact and angle of collision
- Post-impact vehicle movements and final resting positions
- Any secondary collisions

**INJURIES AND MEDICAL RESPONSE:**
- Description of all injuries sustained
- Medical units dispatched and response times
- Hospitals transported to
- Fatalities (if any)

**TRAFFIC ENFORCEMENT ACTIONS:**
- Citations issued and violations
- Field sobriety tests conducted
- Impairment indicators observed
- Traffic control measures implemented

**EVIDENCE AND MEASUREMENTS:**
- Skid marks, debris patterns, and measurements
- Photographs taken and evidence collected
- Witness statements and contact information

**COMPLETE AUDIO TRANSCRIPT:**
Create a detailed, chronological transcript of ALL spoken dialogue with consistent timestamp formatting [HH:MM:SS].

Use standard traffic accident investigation terminology and maintain objectivity throughout.`;
}

function getCrimePrompt() {
    return `Begin immediately with "**CRIME REPORT**" - no introduction, explanation, or acknowledgment. You are generating an official police crime report for law enforcement investigation and prosecution documentation.

Analyze this body camera footage, audio transcription, and telemetry data to create a comprehensive crime report following standard criminal investigation protocols:

**CRIME CLASSIFICATION:**
- Primary offense and penal code section
- Secondary/related charges
- Felony or misdemeanor classification
- Case number and report number

**INCIDENT DETAILS:**
- Date, time, location of crime occurrence
- Date, time reported to police
- Responding officers and detective assignment
- Crime scene security and perimeter establishment

**VICTIM INFORMATION:**
For each victim provide:
- Personal details (name, age, address, contact)
- Relationship to suspect (if any)
- Injuries sustained and medical treatment
- Property loss/damage and estimated values
- Victim statement and demeanor

**SUSPECT INFORMATION:**
For each suspect provide:
- Physical description using standard identifiers
- Clothing and distinctive features
- Known aliases and criminal history (if available)
- Method of identification (witness ID, surveillance, etc.)
- Current location/custody status

**WITNESS INFORMATION:**
- Contact details and relationship to incident
- Quality of observation (distance, lighting, impairment)
- Statement reliability assessment

**CRIME SCENE ANALYSIS:**
- Scene description and physical layout
- Evidence observed and collected
- Photography and measurement documentation
- Forensic processing requirements

**INVESTIGATIVE ACTIONS:**
- Miranda rights administration
- Search warrants executed
- Arrests made and charges filed
- Follow-up investigation requirements

**MODUS OPERANDI:**
- Method of entry (if applicable)
- Weapons or tools used
- Suspect behavior patterns
- Similar crime connections

**COMPLETE AUDIO TRANSCRIPT:**
Create a detailed, chronological transcript of ALL spoken dialogue with consistent timestamp formatting [HH:MM:SS].

Maintain chain of custody documentation standards and use proper criminal investigation terminology.`;
}

function getLostPropertyPrompt() {
    return `Begin immediately with "**LOST PROPERTY REPORT**" - no introduction, explanation, or acknowledgment. You are generating an official police lost property report for documentation and recovery purposes.

Analyze this body camera footage, audio transcription, and telemetry data to create a comprehensive lost property report following standard property documentation protocols:

**PROPERTY DETAILS:**
- Detailed description of lost items
- Brand names, model numbers, serial numbers
- Approximate value and purchase information
- Distinctive markings, engravings, or damage
- Photographs or documentation provided

**LOSS CIRCUMSTANCES:**
- Date, time, and location where property was last seen
- Date, time, and location where loss was discovered
- Activities preceding the loss
- Weather and environmental conditions
- Possible witnesses to the loss

**REPORTING PARTY INFORMATION:**
- Owner details (name, address, contact information)
- Relationship to property (owner, guardian, representative)
- Identification verification
- Insurance information (if applicable)

**SEARCH EFFORTS:**
- Areas already searched by reporting party
- Timeline of search activities
- Persons contacted during search
- Business establishments checked

**PROPERTY CLASSIFICATION:**
- Personal effects, electronics, jewelry, documents
- Monetary value category
- Recovery priority level
- Special significance or sentimental value

**POTENTIAL RECOVERY LOCATIONS:**
- Lost and found departments contacted
- Pawn shops and second-hand stores to monitor
- Online marketplace monitoring requirements
- Transportation authorities notified

**PREVENTION RECOMMENDATIONS:**
- Security suggestions provided to reporting party
- Property identification improvement recommendations
- Insurance claim guidance

**FOLLOW-UP PROCEDURES:**
- Case assignment and tracking number
- Recovery notification procedures
- Property return requirements and verification
- Case closure criteria

**COMPLETE AUDIO TRANSCRIPT:**
Create a detailed, chronological transcript of ALL spoken dialogue with consistent timestamp formatting [HH:MM:SS].

Focus on accurate property identification details and maintain thorough documentation for potential recovery efforts.`;
}

module.exports = { generateReport };