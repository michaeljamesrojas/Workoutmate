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
const ChatService = require('@application/services/ChatService');

// Interface Routes
const createMeetingRoutes = require('@interfaces/http/routes/meetingRoutes');
const createAuthRoutes = require('@interfaces/http/routes/authRoutes');
const { ensureAuth } = require('@infrastructure/auth/middleware/auth');

// Initialize Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Basic middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
const chatService = new ChatService();

// Initialize authentication provider
const authProvider = new AuthenticationProvider(authService);
const { initialize, session: passportSession } = authProvider.getMiddleware();
app.use(initialize);
app.use(passportSession);

// Initialize WebSocket service
new WebSocketService(io, meetingService, chatService);

// Serve public assets (images, css, etc.)
app.use('/assets', express.static(path.join(__dirname, 'public')));

// Serve auth-specific static assets (available to all)
app.use('/static/auth', express.static(path.join(__dirname, 'interfaces/web/auth')));

// Auth routes (must be before protected routes)
app.use('/auth', createAuthRoutes(authService, authProvider));

// Protected API routes
app.use('/api', ensureAuth, createMeetingRoutes(meetingService));

// Protected routes
app.get('/dashboard', ensureAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'interfaces/web/dashboard/pages/index.html'));
});

app.get('/meeting/:id', ensureAuth, async (req, res) => {
    try {
        const meeting = await meetingService.getMeeting(req.params.id);
        if (!meeting) {
            res.redirect('/dashboard?error=meeting-not-found');
            return;
        }
        res.sendFile(path.join(__dirname, 'interfaces/web/dashboard/pages/index.html'));
    } catch (error) {
        res.redirect('/dashboard?error=invalid-meeting');
    }
});

// Public routes
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'interfaces/web/auth/pages/login.html'));
    }
});

app.get('/signup', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'interfaces/web/auth/pages/signup.html'));
    }
});

// Protected interface assets (js, services, etc.)
app.use('/static', ensureAuth, express.static(path.join(__dirname, 'interfaces/web')));

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 