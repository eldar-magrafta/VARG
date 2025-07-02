const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { generateReport } = require('../utils/gemini');
const { reportQueries } = require('../utils/database');
const {
  createPdfStream,
  drawLogo,
  renderSectionHeader,
  renderField
} = require('../utils/pdfHelpers');
const { getSectionName } = require('../utils/translate');

const router = express.Router();
const upload = multer({ 
    limits: { fileSize: 20 * 1024 * 1024 },
    storage: multer.memoryStorage()
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

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

        console.log('📋 Raw request body keys:', Object.keys(req.body));
        console.log('📋 Raw reportCriteria:', reportCriteria);

        let parsedCriteria = null;
        let reportType = 'general'; // Default fallback

        try {
            if (reportCriteria) {
                if (typeof reportCriteria === 'string') {
                    parsedCriteria = JSON.parse(reportCriteria);
                } else {
                    parsedCriteria = reportCriteria;
                }
                
                // Extract the report type
                if (parsedCriteria && parsedCriteria.reportType) {
                    reportType = parsedCriteria.reportType;
                }
            }
        } catch (parseError) {
            console.error('❌ Error parsing reportCriteria:', parseError);
            console.log('📋 Using default report type: general');
        }

        console.log('📋 Final extracted report type:', reportType);
        console.log('📋 Generating report with criteria:', parsedCriteria);
        
        // Parse other data
        let parsedTranscription = null;
        let parsedTelemetryData = null;

        try {
            if (transcription) {
                parsedTranscription = typeof transcription === 'string' ? JSON.parse(transcription) : transcription;
            }
        } catch (err) {
            console.log('📝 Transcription is already a string, using as-is');
            parsedTranscription = transcription;
        }

        try {
            if (telemetryData) {
                parsedTelemetryData = typeof telemetryData === 'string' ? JSON.parse(telemetryData) : telemetryData;
            }
        } catch (err) {
            console.log('📊 Error parsing telemetry data:', err.message);
        }

        console.log('🔄 Calling generateReport with:');
        console.log(`   📄 Report Type: ${reportType}`);
        console.log(`   🎤 Has Transcription: ${!!parsedTranscription}`);
        console.log(`   📊 Has Telemetry: ${!!parsedTelemetryData}`);
        
        const report = await generateReport(
            req.file.buffer, 
            req.file.mimetype,
            parsedTranscription,
            parsedTelemetryData,
            reportType 
        );
        
        res.json({ 
            success: true, 
            report,
            reportType: reportType,
            message: `${reportType} report generated successfully`
        });

        console.log(`✅ ${reportType} report generated successfully!`);

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

// Update existing report
router.put('/update/:reportId', authenticateToken, (req, res) => {
    try {
        const { reportContent } = req.body;
        const reportId = req.params.reportId;
        const userId = req.user.userId;

        if (!reportContent) {
            return res.status(400).json({ error: 'Report content is required' });
        }

        if (!reportId) {
            return res.status(400).json({ error: 'Report ID is required' });
        }

        // First, verify that this report belongs to the current user
        reportQueries.findById(reportId, (err, existingReport) => {
            if (err) {
                console.error('Error finding report:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!existingReport) {
                return res.status(404).json({ error: 'Report not found' });
            }

            if (existingReport.user_id !== userId) {
                return res.status(403).json({ error: 'Access denied: You can only update your own reports' });
            }

            // Now update the report
            reportQueries.update(reportId, reportContent, function(err) {
                if (err) {
                    console.error('Error updating report:', err);
                    return res.status(500).json({ error: 'Failed to update report' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Report not found or no changes made' });
                }

                console.log(`✅ Report ${reportId} updated by user:`, req.user.username);
                res.json({ 
                    success: true, 
                    message: 'Report updated successfully',
                    reportId: reportId,
                    changesCount: this.changes
                });
            });
        });

    } catch (error) {
        console.error('Update report error:', error);
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

router.post('/downloadPDF', authenticateToken, (req, res) => {
  try {
    const { formData } = req.body;
    const doc = createPdfStream(res);

    console.log(formData);

    drawLogo(doc);

    const pageWidth = doc.page.width;
    const margin = 50;
    const rectHeight = 25;

    for (const [title, text] of Object.entries(formData)) {
      const section = getSectionName(title);

      if (section !== null) {
        renderSectionHeader(doc, section, pageWidth, margin, rectHeight);
      }

      if (title === 'reportHeader') {
        doc.font('Times-Bold')
          .fontSize(20)
          .text(text, { align: 'center' });
      } else {
        renderField(doc, title, text);
      }
    }

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;