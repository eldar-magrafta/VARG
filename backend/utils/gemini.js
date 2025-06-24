const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Cache for loaded prompts (to avoid reading files repeatedly)
const promptCache = {};

async function loadPrompt(reportType) {
     console.log(`🔍11 Loading prompt template for report type: ${reportType}`);
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

async function generateReport(videoBuffer, mimeType, transcription, telemetryData, reportType) {
    try {
        console.log('🚀 generateReport method called...');

        const prompt = await buildPrompt(transcription, telemetryData, reportType);

        console.log('📋 Generated prompt for report:', prompt);

        const requestData = {
            contents: [{
                parts: [
                    {
                        inline_data: { // video
                            mime_type: mimeType,
                            data: videoBuffer.toString('base64')
                        }
                    },
                    { text: prompt } // The prompt text to guide the report generation
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
        console.log('✅ Gemini API response received:', extractReport(data));

        return extractReport(data);

    } catch (error) {
        console.error('❌ Gemini API error:', error);
        throw error;
    }
}

async function buildPrompt(transcription, telemetryData, reportType) {
    // Load the appropriate prompt template from file
    let prompt = await loadPrompt(reportType);

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