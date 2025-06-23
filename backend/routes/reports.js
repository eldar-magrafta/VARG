const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { generateReport } = require('../utils/gemini');
const { reportQueries } = require('../utils/database');

const router = express.Router();
const upload = multer({ 
    limits: { fileSize: 20 * 1024 * 1024 },
    storage: multer.memoryStorage()
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

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

// Save report to database
router.post('/save', authenticateToken, (req, res) => {
    try {
        const { reportContent } = req.body;
        const userId = req.user.userId;

        if (!reportContent) {
            return res.status(400).json({ error: 'Report content is required' });
        }

        reportQueries.create(userId, reportContent, function(err) {
            if (err) {
                console.error('Error saving report:', err);
                return res.status(500).json({ error: 'Failed to save report' });
            }

            console.log('✅ Report saved for user:', req.user.username);
            res.json({ 
                success: true, 
                message: 'Report saved successfully',
                reportId: this.lastID
            });
        });

    } catch (error) {
        console.error('Save report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all reports for user
router.get('/history', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;

        reportQueries.findByUserId(userId, (err, reports) => {
            if (err) {
                console.error('Error fetching reports:', err);
                return res.status(500).json({ error: 'Failed to fetch reports' });
            }

            console.log(`✅ Retrieved ${reports.length} reports for user:`, req.user.username);
            res.json({ 
                success: true, 
                reports: reports || []
            });
        });

    } catch (error) {
        console.error('Fetch reports error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;