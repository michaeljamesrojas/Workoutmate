class WebRTCService {
    constructor(socket) {
        this.socket = socket;
        this.peers = {};
        this.localStream = null;
    }

    async setupMediaStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            return this.localStream;
        } catch (error) {
            throw new Error('Error accessing camera and microphone');
        }
    }

    createPeerConnection(userId) {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });

        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', event.candidate, userId);
            }
        };

        this.peers[userId] = peerConnection;
        return peerConnection;
    }

    async connectToNewUser(userId) {
        const peerConnection = this.createPeerConnection(userId);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        this.socket.emit('offer', offer, userId);
        return peerConnection;
    }

    async handleOffer(offer, senderId) {
        const peerConnection = this.createPeerConnection(senderId);
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        this.socket.emit('answer', answer, senderId);
        return peerConnection;
    }

    async handleAnswer(answer, senderId) {
        await this.peers[senderId].setRemoteDescription(answer);
    }

    async handleIceCandidate(candidate, senderId) {
        if (this.peers[senderId]) {
            await this.peers[senderId].addIceCandidate(candidate);
        }
    }

    closePeerConnection(userId) {
        if (this.peers[userId]) {
            this.peers[userId].close();
            delete this.peers[userId];
        }
    }

    toggleVideo() {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            return videoTrack.enabled;
        }
        return false;
    }

    toggleAudio() {
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            return audioTrack.enabled;
        }
        return false;
    }

    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        Object.keys(this.peers).forEach(userId => {
            this.closePeerConnection(userId);
        });
    }
}

export default WebRTCService; 