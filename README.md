# VARG - Video Analysis Report Generator

🚔 **Police Body Camera Report Generator** - AI-powered system for generating professional incident reports from body camera footage using Google Gemini 2.0 Flash AI.

## Features

- 📹 **Video Analysis**: Upload and analyze body camera footage (MP4, WebM, MOV)
- 🎤 **Audio Transcription**: Automatic speech-to-text processing with AssemblyAI
- 📋 **AI Report Generation**: Professional police reports generated with Google Gemini 2.0 Flash
- 🔧 **Customizable Criteria**: Report type, time of day, and priority settings
- 📊 **Telemetry Integration**: Support for GPS and additional data sources
- 🗺️ **Interactive Maps**: Location visualization with OpenStreetMap
- ⚡ **Real-time Development**: Auto-restart with nodemon for rapid development


## Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **Google Gemini API Key** ([Get it here](https://aistudio.google.com/app/apikey))
- **AssemblyAI API Key** ([Get it here](https://www.assemblyai.com/))

### Quick Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/VARG.git
cd VARG
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
```bash
# Create .env file in backend directory
# Add your API keys:
GEMINI_API_KEY=your_gemini_api_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3001
```

## Project Structure

```
VARG/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── package.json           # Backend dependencies
│   ├── routes/
│   │   ├── reports.js         # AI report generation endpoints
│   │   └── transcription.js   # Audio transcription endpoints
│   └── utils/
│       ├── gemini.js          # Google Gemini AI integration
│       └── assemblyai.js      # AssemblyAI transcription
├── frontend/
│   ├── index.html             # Main application UI
│   ├── styles.css             # Application styling
│   └── js/
│       ├── main.js            # Application initialization
│       ├── config.js          # API endpoints configuration
│       ├── fileHandlers.js    # File upload and processing
│       ├── reportGenerator.js # AI report generation
│       ├── transcription.js   # Audio transcription handling
│       ├── telemetryProcessor.js # GPS and metadata processing
│       ├── mapController.js   # Interactive map functionality
│       ├── geocoding.js       # Address/coordinate conversion
│       ├── state.js           # Application state management
│       └── uiHelpers.js       # UI utility functions
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

## API Endpoints

### Reports
- `POST /api/reports/generate` - Generate AI police report from video

### Transcription
- `POST /api/transcription/process` - Process audio transcription

## Configuration

### Environment Variables (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
PORT=3001
```

### Supported File Types
- **Video**: MP4, WebM, MOV
- **Max File Size**: 20MB
- **Audio**: Extracted automatically from video

## Development

### Start Development Server
```bash
cd backend
npm run dev
```

### Scripts
```bash
npm start        # Production server
npm run dev      # Development with nodemon
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
