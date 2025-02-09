const Chat = require('../../domain/aggregates/Chat');
const { v4: uuidv4 } = require('uuid');

class ChatService {
    constructor(chatRepository, meetingService) {
        this.chatRepository = chatRepository;
        this.meetingService = meetingService;
    }

    async initializeChat(meetingId) {
        const meeting = await this.meetingService.getMeeting(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        
        const chat = new Chat(meetingId);
        await this.chatRepository.createChat(meetingId);
        return chat;
    }

    async sendMessage(meetingId, senderId, content) {
        const chat = await this.chatRepository.getChat(meetingId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        const meeting = await this.meetingService.getMeeting(meetingId);
        if (!meeting.hasParticipant(senderId)) {
            throw new Error('User is not a participant in this meeting');
        }

        const message = chat.addMessage(uuidv4(), senderId, content);
        await this.chatRepository.saveMessage(message);
        return message;
    }

    async getMessages(meetingId, limit = 50, before = new Date()) {
        const chat = await this.chatRepository.getChat(meetingId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        return await this.chatRepository.getMessages(meetingId, limit, before);
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