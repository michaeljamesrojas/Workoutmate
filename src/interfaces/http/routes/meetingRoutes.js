const express = require('express');

function createMeetingRoutes(meetingService) {
    const router = express.Router();

    router.post('/meetings', async (req, res) => {
        try {
            const meeting = await meetingService.createMeeting();
            res.json({ meetingId: meeting.id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/meetings/:id', async (req, res) => {
        try {
            const meeting = await meetingService.getMeeting(req.params.id);
            if (!meeting) {
                return res.status(404).json({ error: 'Meeting not found' });
            }
            res.json(meeting);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}

module.exports = createMeetingRoutes; 