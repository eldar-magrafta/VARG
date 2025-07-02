// Backend API URL
const API_BASE = 'http://localhost:3001';

// Check backend API status
async function checkBackendStatus() {
    try {
        const response = await fetch(${API_BASE}/);
        const data = await response.json();
        
        // Update status indicator
        const statusElement = document.getElementById('status');
        statusElement.textContent = 'Online';
        statusElement.className = 'status-value online';
        
        // Update API status info
        document.getElementById('api-status').innerHTML = 
            <h4>✅ Backend Connected</h4>
            <p><strong>Service:</strong> </p>
            <p><strong>Status:</strong> </p>
            <p><strong>Database:</strong> </p>
            <p><strong>Available Endpoints:</strong></p>
            <ul>
                <li>Authentication: </li>
                <li>Transcription: </li>
                <li>Reports: </li>
            </ul>
        ;
        
    } catch (error) {
        console.error('Backend connection failed:', error);
        
        // Update status indicator
        const statusElement = document.getElementById('status');
        statusElement.textContent = 'Offline';
        statusElement.className = 'status-value offline';
        
        // Update API status info
        document.getElementById('api-status').innerHTML = 
            <h4>❌ Backend Disconnected</h4>
            <p>Cannot connect to Police Body Camera API server.</p>
            <p>Please ensure the backend server is running on port 3001.</p>
        ;
    }
}

// Test individual services
async function checkService(service) {
    try {
        const response = await fetch(${API_BASE}/api//test);
        
        if (response.ok) {
            const data = await response.json();
            alert(✅  Service Status: Working!\n\nResponse: );
        } else {
            alert(❌  Service Error\n\nStatus Code: \nPlease check the backend logs.);
        }
        
    } catch (error) {
        alert(❌ Cannot Connect to  Service\n\nError: \n\nPlease ensure the backend server is running.);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚓 Police Body Camera System - Frontend Loaded');
    checkBackendStatus();
    
    // Check status every 30 seconds
    setInterval(checkBackendStatus, 30000);
});

// Add some interactivity
console.log('🚓 Police Body Camera System');
console.log('Frontend successfully loaded');
console.log('Backend API:', API_BASE);
