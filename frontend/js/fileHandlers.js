// fileHandlers.js - File Operations with Simplified Report Criteria Support
import { CONSTANTS } from './config.js';

export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data URL prefix to get just the base64 data
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// Helper function to read file as text
export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Enable/disable button based on file selection only (no API key inputs needed)
export function checkInputs() {
    const fileInput = document.getElementById('videoFile');
    const transcribeBtn = document.getElementById('transcribeBtn');
    const reportBtn = document.getElementById('reportBtn');
    const fileInfo = document.getElementById('fileInfo');
    const videoPlayerSection = document.getElementById('videoPlayerSection');
    const videoPlayer = document.getElementById('videoPlayer');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileInfo.innerHTML = `Selected: ${file.name} (${sizeMB} MB)`;
        
        // Show video player with the uploaded file
        const videoURL = URL.createObjectURL(file);
        videoPlayer.src = videoURL;
        videoPlayerSection.style.display = 'block';
        
        if (file.size > CONSTANTS.MAX_FILE_SIZE_MB * 1024 * 1024) {
            fileInfo.innerHTML += '<br><span style="color: red;">⚠️ File too large! Please select a file under 20MB.</span>';
            transcribeBtn.disabled = true;
            reportBtn.disabled = true;
            return;
        }
    } else {
        fileInfo.innerHTML = '';
        // Hide video player when no file is selected
        videoPlayerSection.style.display = 'none';
        videoPlayer.src = '';
    }

    // Enable buttons if file is present (API keys are hardcoded)
    transcribeBtn.disabled = !(fileInput.files.length > 0);
    reportBtn.disabled = !(fileInput.files.length > 0);
}

// Handle any criteria dropdown changes (report type, time of day, or priority)
export function handleCriteriaChange() {
    updateCriteriaStatus();
    logCriteriaChanges();
}

// Update the criteria status message with all selected values
function updateCriteriaStatus() {
    const criteriaInfo = document.getElementById('criteriaInfo');
    
    const reportTypeText = getSelectedReportTypeText();
    const timeOfDayText = getSelectedTimeOfDayText();
    const priorityText = getSelectedPriorityText();
    
    // Create a comprehensive status message
    if (criteriaInfo) {
        criteriaInfo.innerHTML = `✅ ${reportTypeText} | ${timeOfDayText} | ${priorityText}`;
    }
}

// Log criteria changes for debugging
function logCriteriaChanges() {
    const reportType = getSelectedReportType();
    const timeOfDay = getSelectedTimeOfDay();
    const priority = getSelectedPriority();
    
    console.log('📋 Criteria updated:', {
        reportType: reportType,
        timeOfDay: timeOfDay,
        priority: priority
    });
}

// ============================================
// REPORT TYPE FUNCTIONS
// ============================================

// Get the currently selected report type value
export function getSelectedReportType() {
    const reportTypeSelect = document.getElementById('reportType');
    return reportTypeSelect.value;
}

// Get the report type display name
export function getSelectedReportTypeText() {
    const reportTypeSelect = document.getElementById('reportType');
    return reportTypeSelect.options[reportTypeSelect.selectedIndex].text;
}

// ============================================
// TIME OF DAY FUNCTIONS
// ============================================

// Get the currently selected time of day value
export function getSelectedTimeOfDay() {
    const timeOfDaySelect = document.getElementById('timeOfDay');
    return timeOfDaySelect.value;
}

// Get the time of day display name
export function getSelectedTimeOfDayText() {
    const timeOfDaySelect = document.getElementById('timeOfDay');
    return timeOfDaySelect.options[timeOfDaySelect.selectedIndex].text;
}

// ============================================
// INCIDENT PRIORITY FUNCTIONS
// ============================================

// Get the currently selected incident priority value
export function getSelectedPriority() {
    const prioritySelect = document.getElementById('incidentPriority');
    return prioritySelect.value;
}

// Get the incident priority display name
export function getSelectedPriorityText() {
    const prioritySelect = document.getElementById('incidentPriority');
    return prioritySelect.options[prioritySelect.selectedIndex].text;
}

// ============================================
// SIMPLIFIED: GET ALL CRITERIA (OPTION 1)
// ============================================

// SIMPLIFIED VERSION - Only send values, no duplication
export function getAllSelectedCriteria() {
    return {
        reportType: getSelectedReportType(),     // Just "crime"
        timeOfDay: getSelectedTimeOfDay(),       // Just "night_shift"
        priority: getSelectedPriority()          // Just "code3"
    };
}

// Helper function to get display text for logging/UI (not sent to backend)
export function getCriteriaDisplayInfo() {
    return {
        reportType: {
            value: getSelectedReportType(),
            text: getSelectedReportTypeText()
        },
        timeOfDay: {
            value: getSelectedTimeOfDay(),
            text: getSelectedTimeOfDayText()
        },
        priority: {
            value: getSelectedPriority(),
            text: getSelectedPriorityText()
        }
    };
}

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

// Initialize all criteria functionality
export function initializeReportType() {
    const reportTypeSelect = document.getElementById('reportType');
    const timeOfDaySelect = document.getElementById('timeOfDay');
    const prioritySelect = document.getElementById('incidentPriority');
    
    // Set up event listeners for all dropdowns
    if (reportTypeSelect) reportTypeSelect.addEventListener('change', handleCriteriaChange);
    if (timeOfDaySelect) timeOfDaySelect.addEventListener('change', handleCriteriaChange);
    if (prioritySelect) prioritySelect.addEventListener('change', handleCriteriaChange);
    
    // Set initial status message
    updateCriteriaStatus();
    
    console.log('📋 All report criteria functionality initialized');
    
    // Log initial values
    console.log('📋 Initial criteria values:', getAllSelectedCriteria());
}