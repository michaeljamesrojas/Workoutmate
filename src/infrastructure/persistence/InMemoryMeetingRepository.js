const IMeetingRepository = require('../../domain/repositories/IMeetingRepository');

class InMemoryMeetingRepository extends IMeetingRepository {
    constructor() {
        super();
        this.meetings = new Map();
    }

    create(meeting) {
        this.meetings.set(meeting.id, meeting);
        return meeting;
    }

    findById(id) {
        return this.meetings.get(id) || null;
    }

    update(meeting) {
        if (!this.meetings.has(meeting.id)) {
            throw new Error('Meeting not found');
        }
        this.meetings.set(meeting.id, meeting);
        return meeting;
    }

    delete(id) {
        this.meetings.delete(id);
    }
}

module.exports = InMemoryMeetingRepository; 