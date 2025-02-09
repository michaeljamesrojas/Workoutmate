const ChatRepository = require('../../domain/repositories/ChatRepository');
const Chat = require('../../domain/aggregates/Chat');

class InMemoryChatRepository extends ChatRepository {
    constructor() {
        super();
        this.chats = new Map();
        this.messages = new Map();
    }

    async createChat(meetingId) {
        if (this.chats.has(meetingId)) {
            throw new Error('Chat already exists for this meeting');
        }
        const chat = new Chat(meetingId);
        this.chats.set(meetingId, chat);
        this.messages.set(meetingId, []);
        return chat;
    }

    async getChat(meetingId) {
        return this.chats.get(meetingId);
    }

    async saveMessage(message) {
        const meetingMessages = this.messages.get(message.getMeetingId()) || [];
        meetingMessages.push(message);
        this.messages.set(message.getMeetingId(), meetingMessages);
        return message;
    }

    async getMessages(meetingId, limit = 50, before = new Date()) {
        const meetingMessages = this.messages.get(meetingId) || [];
        return meetingMessages
            .filter(message => message.getTimestamp() < before)
            .sort((a, b) => b.getTimestamp() - a.getTimestamp())
            .slice(0, limit);
    }

    async getMessage(messageId) {
        for (const messages of this.messages.values()) {
            const message = messages.find(m => m.getId() === messageId);
            if (message) return message;
        }
        return null;
    }
}

module.exports = InMemoryChatRepository; 