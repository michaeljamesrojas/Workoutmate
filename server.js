const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Store meetings in memory (in a real app, this would be a database)
const meetings = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id);
        
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', socket.id);
        });

        // Handle WebRTC signaling
        socket.on('offer', (offer, recipientId) => {
            socket.to(recipientId).emit('offer', offer, socket.id);
        });

        socket.on('answer', (answer, recipientId) => {
            socket.to(recipientId).emit('answer', answer, socket.id);
        });

        socket.on('ice-candidate', (candidate, recipientId) => {
            socket.to(recipientId).emit('ice-candidate', candidate, socket.id);
        });
    });
});

// Create meeting endpoint
app.post('/api/meetings', (req, res) => {
    const meetingId = uuidv4();
    meetings.set(meetingId, {
        id: meetingId,
        createdAt: new Date()
    });
    res.json({ meetingId });
});

// Join meeting endpoint
app.get('/api/meetings/:id', (req, res) => {
    const meeting = meetings.get(req.params.id);
    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 