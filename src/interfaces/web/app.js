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
            await this.webRTCService.connectToNewUser(userId);
        });

        this.socket.on('user-disconnected', (userId) => {
            this.webRTCService.closePeerConnection(userId);
        });

        this.socket.on('offer', async (offer, senderId) => {
            await this.webRTCService.handleOffer(offer, senderId);
        });

        this.socket.on('answer', async (answer, senderId) => {
            await this.webRTCService.handleAnswer(answer, senderId);
        });

        this.socket.on('ice-candidate', async (candidate, senderId) => {
            await this.webRTCService.handleIceCandidate(candidate, senderId);
        });
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
            const videoElement = this.webRTCService.createVideoElement(stream, true);
            document.getElementById('videoGrid').appendChild(videoElement);
            this.socket.emit('join-room', meetingId);
            this.showMeetingControls();
            await this.populateCameraList();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async populateCameraList() {
        const cameras = await this.webRTCService.getAvailableCameras();
        const cameraSelect = document.getElementById('cameraSelect');
        cameraSelect.innerHTML = '<option value="">Select Camera</option>';
        
        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.text = camera.label || `Camera ${cameraSelect.length}`;
            cameraSelect.appendChild(option);
        });

        if (cameras.length > 1) {
            cameraSelect.style.display = 'inline-block';
        }
    }

    async switchCamera(deviceId) {
        if (!deviceId) return;
        
        try {
            await this.webRTCService.switchCamera(deviceId);
            this.showMessage('Camera switched successfully', 'success');
        } catch (error) {
            this.showMessage('Failed to switch camera: ' + error.message, 'error');
        }
    }

    showMeetingControls() {
        document.getElementById('initialButtons').style.display = 'none';
        document.getElementById('joinSection').style.display = 'none';
        document.getElementById('meetingControls').style.display = 'block';
    }

    async toggleVideo() {
        const isEnabled = await this.webRTCService.toggleVideo();
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