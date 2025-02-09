import WebRTCService from './services/webrtc.service.js';
import MeetingService from './services/meeting.service.js';

class App {
    constructor() {
        this.socket = io('/');
        this.webRTCService = new WebRTCService(this.socket);
        this.meetingService = new MeetingService();
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.socket.on('user-connected', async (userId) => {
            const peerConnection = await this.webRTCService.connectToNewUser(userId);
            peerConnection.ontrack = event => {
                const videoElement = this.createVideoElement(event.streams[0], false);
                document.getElementById('videoGrid').appendChild(videoElement);
            };
        });

        this.socket.on('user-disconnected', (userId) => {
            this.webRTCService.closePeerConnection(userId);
        });

        this.socket.on('offer', async (offer, senderId) => {
            const peerConnection = await this.webRTCService.handleOffer(offer, senderId);
            peerConnection.ontrack = event => {
                const videoElement = this.createVideoElement(event.streams[0], false);
                document.getElementById('videoGrid').appendChild(videoElement);
            };
        });

        this.socket.on('answer', async (answer, senderId) => {
            await this.webRTCService.handleAnswer(answer, senderId);
        });

        this.socket.on('ice-candidate', async (candidate, senderId) => {
            await this.webRTCService.handleIceCandidate(candidate, senderId);
        });
    }

    createVideoElement(stream, isLocal) {
        const container = document.createElement('div');
        container.className = 'video-container';
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        if (isLocal) {
            video.muted = true;
        }
        
        container.appendChild(video);
        return container;
    }

    async createMeeting() {
        try {
            const meetingId = await this.meetingService.createMeeting();
            await this.setupMediaAndJoinMeeting(meetingId);
            this.showMessage(`Meeting created! Your meeting code is: ${meetingId}`, 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    showJoinSection() {
        document.getElementById('joinSection').style.display = 'block';
    }

    async joinMeeting() {
        const meetingCode = document.getElementById('meetingCode').value.trim();
        if (!meetingCode) {
            this.showMessage('Please enter a meeting code', 'error');
            return;
        }

        try {
            await this.meetingService.joinMeeting(meetingCode);
            await this.setupMediaAndJoinMeeting(meetingCode);
            this.showMessage(`Successfully joined meeting ${meetingCode}`, 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async setupMediaAndJoinMeeting(meetingId) {
        try {
            const stream = await this.webRTCService.setupMediaStream();
            const videoElement = this.createVideoElement(stream, true);
            document.getElementById('videoGrid').appendChild(videoElement);
            this.socket.emit('join-room', meetingId);
            this.showMeetingControls();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    showMeetingControls() {
        document.getElementById('initialButtons').style.display = 'none';
        document.getElementById('joinSection').style.display = 'none';
        document.getElementById('meetingControls').style.display = 'block';
    }

    toggleVideo() {
        const isEnabled = this.webRTCService.toggleVideo();
        document.getElementById('videoBtn').textContent = isEnabled ? 'Turn Off Video' : 'Turn On Video';
    }

    toggleAudio() {
        const isEnabled = this.webRTCService.toggleAudio();
        document.getElementById('audioBtn').textContent = isEnabled ? 'Mute Audio' : 'Unmute Audio';
    }

    leaveMeeting() {
        this.webRTCService.cleanup();
        this.socket.disconnect();
        window.location.reload();
    }

    showMessage(text, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 