class MeetingService {
    async createMeeting() {
        try {
            const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error creating meeting');
            }
            return data.meetingId;
        } catch (error) {
            throw new Error('Failed to create meeting: ' + error.message);
        }
    }

    async joinMeeting(meetingId) {
        try {
            const response = await fetch(`/api/meetings/${meetingId}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error joining meeting');
            }
            return data;
        } catch (error) {
            throw new Error('Failed to join meeting: ' + error.message);
        }
    }
}

export default MeetingService; 