// reportGenerator.js - AI Report Generation (Backend Integration - Simplified)
import { API_ENDPOINTS } from './config.js';
import { getEnhancedTelemetryData } from './state.js';
import { checkInputs, getReportSettings, getReportDisplayInfo } from './fileHandlers.js';
import {
    showGeminiReport,
    showError,
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showDetailedError
} from './uiHelpers.js';

// Main report generation function
export async function generateReport() {
    const fileInput = document.getElementById('videoFile');

    // Validate file selection
    if (!fileInput.files[0]) {
        showError('Please select a video file.');
        showErrorNotification('No video file selected');
        return;
    }

    const file = fileInput.files[0];

    // Validate file size and type
    const validationResult = validateVideoFile(file);
    if (!validationResult.isValid) {
        showError(validationResult.error);
        showErrorNotification(`${validationResult.error}`);
        return;
    }

    // Show initial loading state
    showLoadingState();
    showGenerationStartNotification();

    try {
        console.log('📋 Starting backend report generation...');

        // Get report settings and display info
        const reportSettings = getReportSettings();
        const displayInfo = getReportDisplayInfo();

        // Log report settings for debugging
        logReportSettings(reportSettings, displayInfo);

        // Update loading message with report type
        updateLoadingMessage(`Generating ${displayInfo.reportType.text.toLowerCase()} with AI...`);

        // Get existing transcription and telemetry data
        const existingTranscription = getExistingTranscription();
        const telemetryData = getEnhancedTelemetryData();

        // Log data sources
        logDataSources(existingTranscription, telemetryData);

        // Prepare form data for backend
        const formData = buildFormData(file, existingTranscription, telemetryData, reportSettings);

        // Make API call to backend
        const response = await makeReportApiCall(formData);

        // Validate response
        if (!response.ok) {
            throw await handleApiError(response);
        }

        // Process successful response
        const data = await response.json();

        // Validate response data
        if (!data.report) {
            throw new Error('No report content received from AI');
        }

        displayEnhancedReport(data, existingTranscription, telemetryData, reportSettings, displayInfo);
        showSuccessNotification(`Report Generated Successfully!`);
        console.log(`✅ ${displayInfo.reportType.text} generated successfully with backend AI!`);

    } catch (error) {
        console.error('❌ Report generation error:', error);
        handleReportError(error);
    } finally {
        hideLoadingState();
    }
}

// Validate video file before processing
function validateVideoFile(file) {
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `File too large. Maximum size is 20MB, but file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `Unsupported file type: ${file.type}. Please use MP4, WebM, MOV, or AVI files.`
        };
    }

    return { isValid: true };
}

// Log report settings for debugging and audit trail
function logReportSettings(reportSettings, displayInfo) {
    console.log('📋 Report Generation Settings:');
    console.log(`   📄 Report Type: ${reportSettings.reportType} (${displayInfo.reportType.text})`);
}

// Log available data sources
function logDataSources(transcription, telemetry) {
    console.log('📊 Data Sources Available:');
    console.log(`   🎤 Audio Transcription: ${transcription ? '✅ Available' : '❌ Not available'}`);
    console.log(`   📡 Telemetry Data: ${telemetry ? '✅ Available' : '❌ Not available'}`);

    if (telemetry?.gpsData) {
        console.log(`   📍 GPS Points: ${telemetry.gpsData.totalGpsUpdates || 0}`);
    }
}

// Build FormData for API request
function buildFormData(file, transcription, telemetryData, reportSettings) {
    const formData = new FormData();

    // Add video file
    formData.append('video', file);

    // Add transcription if available
    if (transcription) {
        formData.append('transcription', JSON.stringify(transcription));
        console.log('📝 Including existing transcription in report generation');
    }

    // Add telemetry data if available
    if (telemetryData) {
        formData.append('telemetryData', JSON.stringify(telemetryData));
        console.log('📊 Including telemetry data in report generation');
    }

    // Add report settings
    formData.append('reportSettings', JSON.stringify(reportSettings));

    return formData;
}

// Make API call to backend with enhanced error handling
async function makeReportApiCall(formData) {
    try {
        const response = await fetch(API_ENDPOINTS.REPORTS, {
            method: 'POST',
            body: formData
        });

        return response;
    } catch (networkError) {
        throw new Error(`Network error: ${networkError.message}. Please check your internet connection.`);
    }
}

// Handle API errors with detailed messaging
async function handleApiError(response) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    let errorDetails = null;
    let suggestedActions = [];

    try {
        const errorData = await response.json();
        errorDetails = errorData.details || errorData.error || 'Unknown error';

        // Provide specific error handling based on status code
        switch (response.status) {
            case 400:
                errorMessage = 'Invalid request data';
                suggestedActions = [
                    'Check if video file is properly selected',
                    'Verify file format is supported (MP4, WebM, MOV, AVI)',
                    'Ensure file size is under 20MB'
                ];
                break;
            case 401:
                errorMessage = 'Authentication failed';
                suggestedActions = [
                    'Check if API keys are properly configured',
                    'Contact system administrator'
                ];
                break;
            case 413:
                errorMessage = 'File too large';
                suggestedActions = [
                    'Reduce video file size',
                    'Use a shorter video clip',
                    'Compress the video file'
                ];
                break;
            case 429:
                errorMessage = 'Too many requests';
                suggestedActions = [
                    'Wait a few minutes before trying again',
                    'Contact system administrator if issue persists'
                ];
                break;
            case 500:
                errorMessage = 'Server error during processing';
                suggestedActions = [
                    'Try again in a few minutes',
                    'Check if the video file is corrupted',
                    'Contact technical support if problem continues'
                ];
                break;
            default:
                suggestedActions = [
                    'Try refreshing the page and attempting again',
                    'Check your internet connection',
                    'Contact technical support if issue persists'
                ];
        }

    } catch (parseError) {
        errorDetails = `Could not parse error response: ${parseError.message}`;
    }

    // Show detailed error to user
    showDetailedError(errorMessage, errorDetails, suggestedActions);

    return new Error(`${errorMessage}: ${errorDetails}`);
}

// Display the enhanced report with form
function displayEnhancedReport(data, transcription, telemetry, reportSettings, displayInfo) {
    try {
        showGeminiReport(
            data.report,
            transcription !== null,
            telemetry !== null,
            reportSettings.reportType  // Pass the report type for form building
        );

        // Log successful display
        console.log('📋 Enhanced report form displayed successfully');
        console.log(`   📊 Report Type: ${displayInfo.reportType.text}`);
        console.log(`   📝 Transcription: ${transcription ? 'Included' : 'Not included'}`);
        console.log(`   📡 Telemetry: ${telemetry ? 'Included' : 'Not included'}`);

    } catch (displayError) {
        console.error('❌ Error displaying enhanced report:', displayError);

        // Fallback to basic display
        showWarningNotification('⚠️ Using basic display mode due to form error');
    }
}

// Fallback basic report display

// Handle report generation errors
function handleReportError(error) {
    const errorMessage = error.message || 'Unknown error occurred during report generation';

    // Determine error type and provide appropriate feedback
    if (errorMessage.includes('Network error')) {
        showDetailedError(
            'Network Connection Error',
            errorMessage,
            [
                'Check your internet connection',
                'Try again in a few moments',
                'Contact IT support if connection issues persist'
            ]
        );
        showErrorNotification('Network error - Check connection');
    } else if (errorMessage.includes('File too large')) {
        showDetailedError(
            'File Size Error',
            errorMessage,
            [
                'Reduce video file size to under 20MB',
                'Use video compression software',
                'Upload a shorter video clip'
            ]
        );
        showErrorNotification('File too large - Max 20MB');
    } else if (errorMessage.includes('API Error: 413')) {
        showDetailedError(
            'Upload Size Limit Exceeded',
            'The video file is too large for the server to process',
            [
                'Compress the video file',
                'Use a shorter video segment',
                'Contact administrator about size limits'
            ]
        );
        showErrorNotification('File exceeds server limits');
    } else {
        showError(`Report Error: ${errorMessage}`);
        showErrorNotification('Report generation failed');
    }
}

// Show loading state
function showLoadingState() {
    const loadingDiv = document.getElementById('loading');
    const resultSection = document.getElementById('resultSection');

    loadingDiv.style.display = 'block';
    resultSection.style.display = 'none';
    document.getElementById('reportBtn').disabled = true;
}

// Hide loading state and restore UI
function hideLoadingState() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
    document.getElementById('reportBtn').disabled = false;
    checkInputs(); // Re-validate form state
}

// Update loading message
function updateLoadingMessage(message) {
    const loadingElement = document.querySelector('#loading p');
    if (loadingElement) {
        loadingElement.textContent = message;
    }
}

// Show notification when generation starts
function showGenerationStartNotification() {
    const reportSettings = getReportSettings();
    const displayInfo = getReportDisplayInfo();

    showNotification(`🚀 Starting ${displayInfo.reportType.text} generation...`, 'info', 2000);
}

// Get existing transcription from UI
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