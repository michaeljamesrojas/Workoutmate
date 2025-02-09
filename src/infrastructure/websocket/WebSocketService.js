class WebSocketService {
    constructor(io, meetingService, chatService) {
        this.io = io;
        this.meetingService = meetingService;
        this.chatService = chatService;
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                this.meetingService.addParticipant(roomId, socket.id);
                socket.to(roomId).emit('user-connected', socket.id);
                
                // Initialize chat for the meeting
                this.chatService.initializeChat(roomId).catch(console.error);

                socket.on('disconnect', () => {
                    this.meetingService.removeParticipant(roomId, socket.id);
                    socket.to(roomId).emit('user-disconnected', socket.id);
                });

                // Chat events
                socket.on('chat-message', async (content) => {
                    try {
                        const message = await this.chatService.sendMessage(roomId, socket.id, content);
                        this.io.to(roomId).emit('chat-message', message.toJSON());
                    } catch (error) {
                        socket.emit('chat-error', error.message);
                    }
                });

                socket.on('get-chat-history', async (before) => {
                    try {
                        const messages = await this.chatService.getMessages(roomId, 50, new Date(before));
                        socket.emit('chat-history', messages.map(m => m.toJSON()));
                    } catch (error) {
                        socket.emit('chat-error', error.message);
                    }
                });

                // WebRTC signaling
                socket.on('offer', (offer, recipientId) => {
                    socket.to(recipientId).emit('offer', offer, socket.id);
                });

                socket.on('answer', (answer, recipientId) => {
                    socket.to(recipientId).emit('answer', answer, socket.id);
                });

                socket.on('ice-candidate', (candidate, recipientId) => {
                    socket.to(recipientId).emit('ice-candidate', candidate, socket.id);
                });
            });
        });
    }
}

module.exports = WebSocketService; 