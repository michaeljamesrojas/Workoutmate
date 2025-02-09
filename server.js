const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Store meetings in memory (in a real app, this would be a database)
const meetings = new Map();

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 