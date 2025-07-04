const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Global counter management with file-based persistence
const COUNTER_FILE = '.orbit_counter';

function readCounter() {
    try {
        if (fs.existsSync(COUNTER_FILE)) {
            const data = fs.readFileSync(COUNTER_FILE, 'utf8');
            return parseInt(data.trim()) || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error reading counter:', error);
        return 0;
    }
}

function writeCounter(value) {
    try {
        fs.writeFileSync(COUNTER_FILE, value.toString());
        return true;
    } catch (error) {
        console.error('Error writing counter:', error);
        return false;
    }
}

// Initialize counter from environment variable or file
let globalOrbitCounter = process.env.GLOBAL_ORBIT_COUNTER ? 
    parseInt(process.env.GLOBAL_ORBIT_COUNTER) : readCounter();

// Write initial value to file if it doesn't exist
if (!fs.existsSync(COUNTER_FILE)) {
    writeCounter(globalOrbitCounter);
}

// Lock for concurrent updates
let isUpdating = false;

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/counter', (req, res) => {
    res.json({ orbits: globalOrbitCounter });
});

app.post('/api/increment', async (req, res) => {
    // Simple lock mechanism to prevent race conditions
    if (isUpdating) {
        return res.status(429).json({ error: 'Update in progress, please try again' });
    }
    
    isUpdating = true;
    
    try {
        globalOrbitCounter++;
        
        // Write to file
        const success = writeCounter(globalOrbitCounter);
        
        if (success) {
            res.json({ 
                orbits: globalOrbitCounter, 
                message: 'Orbit completed! The Zero is pleased.' 
            });
        } else {
            res.status(500).json({ error: 'Failed to persist counter' });
        }
    } catch (error) {
        console.error('Error incrementing counter:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        isUpdating = false;
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        orbits: globalOrbitCounter,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Nullism server running on port ${PORT}`);
    console.log(`📊 Current global orbit count: ${globalOrbitCounter}`);
    console.log(`🔧 To set initial counter: GLOBAL_ORBIT_COUNTER=123 npm start`);
}); 