const express = require('express');
const multer = require('multer');
const { transcribeVideo } = require('../utils/assemblyai');

const router = express.Router();
const upload = multer({ 
    limits: { fileSize: 20 * 1024 * 1024 },
    storage: multer.memoryStorage()
});

router.post('/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        console.log('🎤 Starting transcription for:', req.file.originalname);
        
        const transcription = await transcribeVideo(req.file.buffer);
        
        res.json({ 
            success: true, 
            transcription,
            message: 'Transcription completed successfully'
        });

    } catch (error) {
        console.error('❌ Transcription error:', error);
        res.status(500).json({ 
            error: 'Transcription failed', 
            details: error.message 
        });
    }
});

module.exports = router;