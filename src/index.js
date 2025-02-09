const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const InMemoryMeetingRepository = require('./infrastructure/persistence/InMemoryMeetingRepository');
const MeetingService = require('./application/services/MeetingService');
const WebSocketService = require('./infrastructure/websocket/WebSocketService');
const createMeetingRoutes = require('./interfaces/http/routes/meetingRoutes');

// Initialize Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'interfaces/web')));

// Initialize services
const meetingRepository = new InMemoryMeetingRepository();
const meetingService = new MeetingService(meetingRepository);
new WebSocketService(io, meetingService);

// Setup routes
app.use('/api', createMeetingRoutes(meetingService));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'interfaces/web/index.html'));
});

// Start server
const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 