require('module-alias/register');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Infrastructure
const InMemoryMeetingRepository = require('@infrastructure/persistence/InMemoryMeetingRepository');
const InMemoryUserRepository = require('@infrastructure/persistence/InMemoryUserRepository');
const AuthenticationProvider = require('@infrastructure/auth/AuthenticationProvider');
const WebSocketService = require('@infrastructure/websocket/WebSocketService');

// Application Services
const MeetingService = require('@application/services/MeetingService');
const AuthService = require('@application/services/AuthService');

// Interface Routes
const createMeetingRoutes = require('@interfaces/http/routes/meetingRoutes');
const createAuthRoutes = require('@interfaces/http/routes/authRoutes');
const { ensureAuth } = require('@infrastructure/auth/middleware/auth');

// Initialize Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize repositories
const meetingRepository = new InMemoryMeetingRepository();
const userRepository = new InMemoryUserRepository();

// Initialize services
const meetingService = new MeetingService(meetingRepository);
const authService = new AuthService(userRepository);

// Initialize authentication provider
const authProvider = new AuthenticationProvider(authService);
const { initialize, session: passportSession } = authProvider.getMiddleware();
app.use(initialize);
app.use(passportSession);

// Initialize WebSocket service
new WebSocketService(io, meetingService);

// Setup routes
app.use('/api', createMeetingRoutes(meetingService));
app.use('/auth', createAuthRoutes(authService, authProvider));

// Protected route example
app.get('/dashboard', ensureAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login page route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Signup page route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 