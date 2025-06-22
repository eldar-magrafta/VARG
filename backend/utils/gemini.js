const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

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

// Cache for loaded prompts (to avoid reading files repeatedly)
const promptCache = {};

async function loadPrompt(reportType) {
    // Check if prompt is already cached
    if (promptCache[reportType]) {
        return promptCache[reportType];
    }

    try {
        const promptsDir = path.join(__dirname, '../prompts');
        const promptFile = path.join(promptsDir, `${reportType}.txt`);
        
        // Read the prompt file
        const promptContent = await fs.readFile(promptFile, 'utf8');
        
        // Cache the prompt for future use
        promptCache[reportType] = promptContent;
        
        console.log(`📋 Loaded prompt template: ${reportType}`);
        return promptContent;
        
    } catch (error) {
        console.error(`❌ Error loading prompt file for ${reportType}:`, error);
        
        // Fallback to general prompt if specific prompt fails to load
        if (reportType !== 'general') {
            console.log(`🔄 Falling back to general prompt for ${reportType}`);
            return await loadPrompt('general');
        }
        
        // If even general prompt fails, throw error
        throw new Error(`Failed to load prompt template: ${error.message}`);
    }
}

async function generateReport(videoBuffer, mimeType, transcription, telemetryData, criteria) {
    try {
        console.log('🚀 Starting Gemini API call...');
        
        const base64Data = videoBuffer.toString('base64');
        const prompt = await buildPrompt(transcription, telemetryData, criteria);
        
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

async function buildPrompt(transcription, telemetryData, criteria) {
    const reportType = criteria && criteria.reportType ? criteria.reportType : 'general';
    
    // Load the appropriate prompt template from file
    let prompt = await loadPrompt(reportType);
    
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

module.exports = { generateReport };