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
    vehicle_accident: getDefaultPrompt(),
    crime: getDefaultPrompt(),
    lost_property: getDefaultPrompt()
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

module.exports = { generateReport };