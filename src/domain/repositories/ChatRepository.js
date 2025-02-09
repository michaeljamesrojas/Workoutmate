class ChatRepository {
    async createChat(meetingId) {
        throw new Error('Method not implemented');
    }

    async getChat(meetingId) {
        throw new Error('Method not implemented');
    }

    async saveMessage(message) {
        throw new Error('Method not implemented');
    }

    async getMessages(meetingId, limit = 50, before = new Date()) {
        throw new Error('Method not implemented');
    }

    async getMessage(messageId) {
        throw new Error('Method not implemented');
    }
}

module.exports = ChatRepository; 