const { v4: uuidv4 } = require('uuid');
const Meeting = require('../../domain/entities/Meeting');

class MeetingService {
    constructor(meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    createMeeting() {
        const meeting = new Meeting(uuidv4());
        return this.meetingRepository.create(meeting);
    }

    getMeeting(id) {
        return this.meetingRepository.findById(id);
    }

    addParticipant(meetingId, participantId) {
        const meeting = this.meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        meeting.addParticipant(participantId);
        return this.meetingRepository.update(meeting);
    }

    removeParticipant(meetingId, participantId) {
        const meeting = this.meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        meeting.removeParticipant(participantId);
        return this.meetingRepository.update(meeting);
    }
}

module.exports = MeetingService; 