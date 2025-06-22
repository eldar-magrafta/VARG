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

        console.log("req.file:", req.file);
        console.log("req.file.buffer:", req.file.buffer);
        console.log("req.file.mimetype:", req.file.mimetype);
        console.log("transcription:", transcription ? JSON.parse(transcription) : null);
        console.log("telemetryData:", telemetryData ? JSON.parse(telemetryData) : null);
        console.log("reportCriteria:", reportCriteria ? JSON.parse(reportCriteria) : null);

        
        const report = await generateReport(
            req.file.buffer, 
            req.file.mimetype,
            transcription ? JSON.parse(transcription) : null,
            telemetryData ? JSON.parse(telemetryData) : null,
            reportCriteria?.reportType || 'general'
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