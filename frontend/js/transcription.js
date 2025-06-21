// transcription.js - Audio Transcription (Backend Integration)
import { API_ENDPOINTS } from './config.js';
import { showTranscription, showTranscriptionError } from './uiHelpers.js';
import { checkInputs } from './fileHandlers.js';

export async function transcribeVideo() {
    const fileInput = document.getElementById('videoFile');
    const loadingDiv = document.getElementById('loading');
    const transcriptionSection = document.getElementById('transcriptionSection');

    if (!fileInput.files[0]) {
        showError('Please select a video file.');
        return;
    }

    const videoFile = fileInput.files[0];
    
    loadingDiv.style.display = 'block';
    transcriptionSection.style.display = 'none';
    document.getElementById('transcribeBtn').disabled = true;

    try {
        console.log('🎤 Starting backend transcription...');
        
        const loadingElement = document.querySelector('#loading p');
        if (loadingElement) {
            loadingElement.textContent = 'Uploading video to server for transcription...';
        }
        
        const formData = new FormData();
        formData.append('video', videoFile);

        const response = await fetch(API_ENDPOINTS.TRANSCRIPTION, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Transcription failed');
        }

        const data = await response.json();
        showTranscription(data.transcription);
        
        console.log('✅ Backend transcription completed successfully!');

    } catch (error) {
        console.error('❌ Transcription error:', error);
        showTranscriptionError(error.message);
    } finally {
        loadingDiv.style.display = 'none';
        document.getElementById('transcribeBtn').disabled = false;
        checkInputs();
    }
}

function showError(message) {
    const resultSection = document.getElementById('resultSection');
    const summaryDiv = document.getElementById('summary');
    
    summaryDiv.innerHTML = `<div class="error">${message}</div>`;
    resultSection.style.display = 'block';
}