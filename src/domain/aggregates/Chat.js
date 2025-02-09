const Message = require('../entities/Message');

class Chat {
    constructor(meetingId) {
        this.meetingId = meetingId;
        this.messages = [];
    }

    addMessage(messageId, senderId, content) {
        const message = new Message(messageId, this.meetingId, senderId, content);
        this.messages.push(message);
        return message;
    }

    getMessages(limit = 50, before = new Date()) {
        return this.messages
            .filter(message => message.getTimestamp() < before)
            .sort((a, b) => b.getTimestamp() - a.getTimestamp())
            .slice(0, limit);
    }

    getMessageById(messageId) {
        return this.messages.find(message => message.getId() === messageId);
    }

    getMeetingId() {
        return this.meetingId;
    }

    toJSON() {
        return {
            meetingId: this.meetingId,
            messages: this.messages.map(message => message.toJSON())
        };
    }
}

module.exports = Chat; 