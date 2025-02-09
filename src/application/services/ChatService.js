const Chat = require('../../domain/aggregates/Chat');
const { v4: uuidv4 } = require('uuid');

class ChatService {
    constructor(chatRepository, meetingService) {
        this.chatRepository = chatRepository;
        this.meetingService = meetingService;
        // In-memory storage for chat messages
        this.chatRooms = new Map();
    }

    async initializeChat(roomId) {
        if (!this.chatRooms.has(roomId)) {
            this.chatRooms.set(roomId, []);
        }
    }

    async sendMessage(roomId, senderId, content) {
        const message = {
            id: Date.now().toString(),
            roomId,
            senderId,
            content,
            timestamp: new Date(),
            toJSON() {
                return {
                    id: this.id,
                    senderId: this.senderId,
                    content: this.content,
                    timestamp: this.timestamp
                };
            }
        };

        const room = this.chatRooms.get(roomId) || [];
        room.push(message);
        this.chatRooms.set(roomId, room);

        return message;
    }

    async getMessages(roomId, limit = 50, before = new Date()) {
        const room = this.chatRooms.get(roomId) || [];
        return room
            .filter(msg => msg.timestamp < before)
            .slice(-limit)
            .reverse();
    }

    async getMessage(messageId) {
        const message = await this.chatRepository.getMessage(messageId);
        if (!message) {
            throw new Error('Message not found');
        }
        return message;
    }
}

module.exports = ChatService; 