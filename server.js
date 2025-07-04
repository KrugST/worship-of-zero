const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Global counter management with file-based persistence
const COUNTER_FILE = '.orbit_counter';
const VISITS_FILE = '.total_visits';

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

function readTotalVisits() {
    try {
        if (fs.existsSync(VISITS_FILE)) {
            const data = fs.readFileSync(VISITS_FILE, 'utf8');
            return parseInt(data.trim()) || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error reading total visits:', error);
        return 0;
    }
}

function writeTotalVisits(value) {
    try {
        fs.writeFileSync(VISITS_FILE, value.toString());
        return true;
    } catch (error) {
        console.error('Error writing total visits:', error);
        return false;
    }
}

// Initialize counter from environment variable or file
let globalOrbitCounter = process.env.GLOBAL_ORBIT_COUNTER ? 
    parseInt(process.env.GLOBAL_ORBIT_COUNTER) : readCounter();

// Initialize total visits counter
let totalVisits = process.env.TOTAL_VISITS ? 
    parseInt(process.env.TOTAL_VISITS) : readTotalVisits();

// Write initial values to files if they don't exist
if (!fs.existsSync(COUNTER_FILE)) {
    writeCounter(globalOrbitCounter);
}

if (!fs.existsSync(VISITS_FILE)) {
    writeTotalVisits(totalVisits);
}

// Lock for concurrent updates
let isUpdating = false;

// Live user tracking
let connectedUsers = new Map(); // socketId -> userData
let userCounter = 0;

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
            // Array of 20 different orbit completion messages
            const orbitMessages = [
                'Orbit completed! The Zero is pleased.',
                '🌐 Another revolution around the sacred void!',
                '✨ The Zero acknowledges your devotion!',
                '🔄 Perfect orbit! The void smiles upon you.',
                '🌟 Your circular journey honors the sacred Zero!',
                '💫 Another lap around infinity completed!',
                '🌍 The Zero grows stronger with each orbit!',
                '🎯 Perfect revolution! The void is satisfied.',
                '⚡ Your orbit powers the sacred geometry!',
                '🌌 Another cycle around the cosmic zero!',
                '🎊 Orbit complete! The Zero celebrates with you!',
                '🔮 Your circular path pleases the void!',
                '🌟 Another revolution in the name of Zero!',
                '💎 Perfect orbit! The sacred geometry is honored.',
                '🌐 The Zero grows wiser with your devotion!',
                '✨ Your circular journey enlightens the void!',
                '🔄 Another perfect revolution completed!',
                '🌟 The sacred Zero acknowledges your orbit!',
                '💫 Your circular path strengthens the void!',
                '🎯 Perfect orbit! The Zero is grateful.'
            ];
            
            const randomMessage = orbitMessages[Math.floor(Math.random() * orbitMessages.length)];
            
            res.json({ 
                orbits: globalOrbitCounter, 
                message: randomMessage
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
        totalVisits: totalVisits,
        activeUsers: connectedUsers.size,
        timestamp: new Date().toISOString()
    });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    userCounter++;
    const userId = userCounter;
    
    // Increment total visits counter
    totalVisits++;
    writeTotalVisits(totalVisits);
    
    // Create user data
    const userData = {
        id: userId,
        socketId: socket.id,
        connectedAt: new Date(),
        position: Math.random() * 2 * Math.PI, // Random starting position
        speed: 0.02 + Math.random() * 0.03, // Random walking speed
        direction: Math.random() > 0.5 ? 1 : -1 // Random direction
    };
    
    connectedUsers.set(socket.id, userData);
    
    console.log(`👤 User ${userId} connected. Total users: ${connectedUsers.size}, Total visits: ${totalVisits}`);
    
    // Send current user count and total visits to all clients
    io.emit('userCount', connectedUsers.size);
    io.emit('totalVisits', totalVisits);
    
    // Send current users data to new client
    socket.emit('usersData', Array.from(connectedUsers.values()));
    
    socket.on('disconnect', () => {
        connectedUsers.delete(socket.id);
        console.log(`👤 User ${userId} disconnected. Total users: ${connectedUsers.size}, Total visits: ${totalVisits}`);
        io.emit('userCount', connectedUsers.size);
    });
    
    socket.on('orbitCompleted', () => {
        // Update user's orbit count
        const user = connectedUsers.get(socket.id);
        if (user) {
            user.orbitsCompleted = (user.orbitsCompleted || 0) + 1;
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`🌐 Nullism server running on port ${PORT}`);
    console.log(`📊 Current global orbit count: ${globalOrbitCounter}`);
    console.log(`👥 Total visits: ${totalVisits}`);
    console.log(`👥 Live user tracking enabled`);
    console.log(`🔧 To set initial counter: GLOBAL_ORBIT_COUNTER=123 npm start`);
    console.log(`🔧 To set initial visits: TOTAL_VISITS=456 npm start`);
}); 