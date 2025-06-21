const express = require('express');
const multer = require('multer');
const { generateReport } = require('../utils/gemini');

const router = express.Router();
const upload = multer({ 
    limits: { fileSize: 20 * 1024 * 1024 },
    storage: multer.memoryStorage()
});

router.post('/generate', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const { transcription, telemetryData, reportCriteria } = req.body;
        
        console.log('📋 Generating report with criteria:', reportCriteria);
        
        const report = await generateReport(
            req.file.buffer, 
            req.file.mimetype,
            transcription ? JSON.parse(transcription) : null,
            telemetryData ? JSON.parse(telemetryData) : null,
            reportCriteria ? JSON.parse(reportCriteria) : null
        );
        
        res.json({ 
            success: true, 
            report,
            message: 'Report generated successfully'
        });

    } catch (error) {
        console.error('❌ Report generation error:', error);
        res.status(500).json({ 
            error: 'Report generation failed', 
            details: error.message 
        });
    }
});

module.exports = router;