import { CONSTANTS } from './config.js';

// Helper function to read file as text
export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Function to handle preview layout updates for side-by-side display
export function updatePreviewLayout() {
    const videoSection = document.getElementById('videoPlayerSection');
    const telemetrySection = document.getElementById('telemetryPreviewSection');
    const previewContainer = document.querySelector('.preview-container');

    if (!videoSection || !telemetrySection || !previewContainer) return;

    const videoVisible = videoSection.style.display !== 'none';
    const telemetryVisible = telemetrySection.style.display !== 'none';

    // Remove existing full-width classes
    videoSection.classList.remove('video-full-width');
    telemetrySection.classList.remove('telemetry-full-width');
    previewContainer.classList.remove('all-hidden');

    if (!videoVisible && !telemetryVisible) {
        previewContainer.classList.add('all-hidden');
        return;
    } else {
        previewContainer.style.display = 'grid';
    }

    if (videoVisible && !telemetryVisible) {
        videoSection.classList.add('video-full-width');
    } else if (!videoVisible && telemetryVisible) {
        telemetrySection.classList.add('telemetry-full-width');
    }

    console.log('📱 Preview layout updated:', {
        videoVisible,
        telemetryVisible,
        layout: videoVisible && telemetryVisible ? 'side-by-side' :
            videoVisible ? 'video-full' :
                telemetryVisible ? 'telemetry-full' : 'hidden'
    });
}

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
            fileInfo.innerHTML += '<div class="error-message">File too large! Please select a file under 20MB.</div>';
            transcribeBtn.disabled = true;
            reportBtn.disabled = true;
            updatePreviewLayout(); // Update layout after changes
            return;
        } else {
            fileInfo.innerHTML += '<div class="success-message">Video file loaded successfully</div>';
        }
    } else {
        fileInfo.innerHTML = '';
        // Hide video player when no file is selected
        videoPlayerSection.style.display = 'none';
        videoPlayer.src = '';
    }

    // Enable buttons if file is present (API keys are hardcoded)
    //transcribeBtn.disabled = !(fileInput.files.length > 0);
    reportBtn.disabled = !(fileInput.files.length > 0);

    // Update layout after any changes
    updatePreviewLayout();
}


export function getSelectedReportType() {
    const reportTypeSelect = document.getElementById('reportType');
    return reportTypeSelect ? reportTypeSelect.value : 'general'; // Default to general report
}

// Get the report type display name
export function getSelectedReportTypeText() {
    const reportTypeSelect = document.getElementById('reportType');
    return reportTypeSelect ?
        reportTypeSelect.options[reportTypeSelect.selectedIndex].text :
        'General Incident Report'; // Default display text
}

export function getReportSettings() {
    return {
        reportType: getSelectedReportType()
    };
}

// Helper function to get display text for logging/UI
export function getReportDisplayInfo() {
    return {
        reportType: {
            value: getSelectedReportType(),
            text: getSelectedReportTypeText()
        }
    };
}