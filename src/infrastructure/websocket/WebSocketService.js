class WebSocketService {
    constructor(io, meetingService) {
        this.io = io;
        this.meetingService = meetingService;
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                this.meetingService.addParticipant(roomId, socket.id);
                socket.to(roomId).emit('user-connected', socket.id);
                
                socket.on('disconnect', () => {
                    this.meetingService.removeParticipant(roomId, socket.id);
                    socket.to(roomId).emit('user-disconnected', socket.id);
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