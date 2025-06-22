// reportGenerator.js - AI Report Generation (Backend Integration - Simplified)
import { API_ENDPOINTS } from './config.js';
import { getEnhancedTelemetryData } from './state.js';
import { checkInputs, getAllSelectedCriteria, getCriteriaDisplayInfo } from './fileHandlers.js';
import { showGeminiReport, showError } from './uiHelpers.js';

export async function generateReport() {
    const fileInput = document.getElementById('videoFile');

    if (!fileInput.files[0]) {
        showError('Please select a video file.');
        return;
    }

    const file = fileInput.files[0];
    
    showLoadingState();

    try {
        console.log('📋 Starting backend report generation...');
        
        // Get simplified criteria (just values)
        const allCriteria = getAllSelectedCriteria();
        
        // Get display info for logging and UI messages
        const displayInfo = getCriteriaDisplayInfo();
        
        console.log('📋 Report Criteria Selected:');
        console.log(`   📄 Report Type: ${allCriteria.reportType} (${displayInfo.reportType.text})`);
        console.log(`   🕐 Time of Day: ${allCriteria.timeOfDay} (${displayInfo.timeOfDay.text})`);
        console.log(`   🚨 Priority: ${allCriteria.priority} (${displayInfo.priority.text})`);
        
        updateLoadingMessage(`Generating ${displayInfo.reportType.text.toLowerCase()} with backend AI...`);
        
        //const existingTranscription = getExistingTranscription();
        const telemetryData = getEnhancedTelemetryData();
        
        const formData = new FormData();
        formData.append('video', file);
        // if (existingTranscription) {
        //     formData.append('transcription', JSON.stringify(existingTranscription));
        // }
        if (telemetryData) {
            formData.append('telemetryData', JSON.stringify(telemetryData));
        }
        formData.append('reportCriteria', JSON.stringify(allCriteria));

        const response = await fetch(API_ENDPOINTS.REPORTS, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Report generation failed');
        }

        const data = await response.json();
        
        showGeminiReport(
            data.report, 
            //existingTranscription !== null, 
            telemetryData !== null,
            displayInfo.reportType.text
        );
        
        console.log(`✅ ${displayInfo.reportType.text} generated successfully with backend AI!`);

    } catch (error) {
        console.error('❌ Report generation error:', error);
        showError(`Report Error: ${error.message}`);
    } finally {
        hideLoadingState();
    }
}

function showLoadingState() {
    const loadingDiv = document.getElementById('loading');
    const resultSection = document.getElementById('resultSection');
    
    loadingDiv.style.display = 'block';
    resultSection.style.display = 'none';
    document.getElementById('reportBtn').disabled = true;
}

function hideLoadingState() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('reportBtn').disabled = false;
    checkInputs();
}

function updateLoadingMessage(message) {
    const loadingElement = document.querySelector('#loading p');
    if (loadingElement) {
        loadingElement.textContent = message;
    }
}

function getExistingTranscription() {
    const transcriptionDiv = document.getElementById('transcription');
    
    if (transcriptionDiv && 
        transcriptionDiv.textContent.trim() && 
        !transcriptionDiv.textContent.includes('Error')) {
        
        console.log('📝 Using existing transcription for enhanced report');
        return transcriptionDiv.textContent.trim();
    }
    
    return null;
}