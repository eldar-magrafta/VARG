const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize database first
require('./utils/database');

const transcriptionRoutes = require('./routes/transcription');
const reportRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcription', transcriptionRoutes);
app.use('/api/reports', reportRoutes);

// Serve frontend only for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚔 Police Body Camera Server running on http://localhost:${PORT}`);
});