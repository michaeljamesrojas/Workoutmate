class Message {
    constructor(id, meetingId, senderId, content, timestamp = new Date()) {
        this.id = id;
        this.meetingId = meetingId;
        this.senderId = senderId;
        this.content = content;
        this.timestamp = timestamp;
    }

    getId() {
        return this.id;
    }

    getMeetingId() {
        return this.meetingId;
    }

    getSenderId() {
        return this.senderId;
    }

    getContent() {
        return this.content;
    }

    getTimestamp() {
        return this.timestamp;
    }

    toJSON() {
        return {
            id: this.id,
            meetingId: this.meetingId,
            senderId: this.senderId,
            content: this.content,
            timestamp: this.timestamp
        };
    }
}

module.exports = Message; 