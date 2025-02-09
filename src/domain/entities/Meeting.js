class Meeting {
    constructor(id, createdAt = new Date()) {
        this.id = id;
        this.createdAt = createdAt;
        this.participants = new Set();
    }

    addParticipant(participantId) {
        this.participants.add(participantId);
    }

    removeParticipant(participantId) {
        this.participants.delete(participantId);
    }

    hasParticipant(participantId) {
        return this.participants.has(participantId);
    }

    getParticipants() {
        return Array.from(this.participants);
    }
}

module.exports = Meeting; 