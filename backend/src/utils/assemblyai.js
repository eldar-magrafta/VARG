const fetch = require('node-fetch');

const API_KEY = process.env.ASSEMBLY_AI_API_KEY;
const UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

async function transcribeVideo(videoBuffer) {
    try {
        console.log('📹 Uploading video to AssemblyAI...');
        const uploadResponse = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: { 'authorization': API_KEY },
            body: videoBuffer
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const uploadData = await uploadResponse.json();
        const uploadUrl = uploadData.upload_url;
        console.log('✅ Video uploaded successfully');

        const transcriptResponse = await fetch(TRANSCRIPT_URL, {
            method: 'POST',
            headers: {
                'authorization': API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                audio_url: uploadUrl,
                speaker_labels: true,
                punctuate: true,
                format_text: true,
                disfluencies: false,
                filter_profanity: false
            })
        });

        const transcriptData = await transcriptResponse.json();
        const transcriptId = transcriptData.id;
        console.log('📝 Transcription job started:', transcriptId);

        return await pollTranscription(transcriptId);

    } catch (error) {
        console.error('❌ AssemblyAI error:', error);
        throw error;
    }
}

async function pollTranscription(transcriptId) {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const response = await fetch(`${TRANSCRIPT_URL}/${transcriptId}`, {
            headers: { 'authorization': API_KEY }
        });

        const data = await response.json();
        console.log(`Transcription status (${attempts + 1}/${maxAttempts}):`, data.status);

        if (data.status === 'completed') {
            return formatTranscription(data);
        } else if (data.status === 'error') {
            throw new Error(data.error || 'Transcription failed');
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Transcription timed out');
}

function formatTranscription(transcriptData) {
    if (transcriptData.utterances && transcriptData.utterances.length > 0) {
        return transcriptData.utterances.map(utterance => {
            const startTime = millisecondsToTime(utterance.start);
            return `[${startTime}] Speaker ${utterance.speaker}: "${utterance.text}"`;
        }).join('\n\n');
    }
    return transcriptData.text || "No speech detected in the video.";
}

function millisecondsToTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = { transcribeVideo }; 
