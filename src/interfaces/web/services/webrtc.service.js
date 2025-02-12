class WebRTCService {
    constructor(socket) {
        this.socket = socket;
        this.peers = {};
        this.peerVideoElements = {};
        this.localStream = null;
        this.currentCamera = null;
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

        peerConnection.ontrack = event => {
            if (!this.peerVideoElements[userId]) {
                const videoElement = this.createVideoElement(event.streams[0], false);
                this.peerVideoElements[userId] = videoElement;
                document.getElementById('videoGrid').appendChild(videoElement);
            }
        };

        this.peers[userId] = peerConnection;
        return peerConnection;
    }

    createVideoElement(stream, isLocal) {
        const container = document.createElement('div');
        container.className = 'video-container';
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        if (isLocal) {
            video.muted = true;
            // Keep mirrored view for local video (selfie view)
            video.style.transform = 'scaleX(-1)';
        } else {
            // No mirroring for remote participants
            video.style.transform = 'scaleX(1)';
        }
        
        container.appendChild(video);
        return container;
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
        if (this.peers[senderId]) {
            await this.peers[senderId].setRemoteDescription(answer);
        }
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
        
        if (this.peerVideoElements[userId]) {
            const videoElement = this.peerVideoElements[userId];
            if (videoElement.parentNode) {
                videoElement.parentNode.removeChild(videoElement);
            }
            delete this.peerVideoElements[userId];
        }
    }

    async toggleVideo() {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            if (videoTrack.enabled) {
                // If video is currently enabled, stop it completely
                videoTrack.stop();
                videoTrack.enabled = false;
                return false;
            } else {
                // If video is currently disabled, start a new video track
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({
                        video: this.currentCamera ? { deviceId: { exact: this.currentCamera } } : true,
                        audio: false
                    });
                    
                    const newVideoTrack = newStream.getVideoTracks()[0];
                    const oldVideoTrack = this.localStream.getVideoTracks()[0];
                    
                    // Replace the video track in the local stream
                    this.localStream.removeTrack(oldVideoTrack);
                    this.localStream.addTrack(newVideoTrack);
                    
                    // Update the video track for all peer connections
                    Object.values(this.peers).forEach(peer => {
                        const senders = peer.getSenders();
                        const videoSender = senders.find(sender => sender.track?.kind === 'video');
                        if (videoSender) {
                            videoSender.replaceTrack(newVideoTrack);
                        }
                    });
                    
                    // Update local video element
                    const localVideo = document.querySelector('#videoGrid video');
                    if (localVideo) {
                        localVideo.srcObject = this.localStream;
                    }
                    
                    newVideoTrack.enabled = true;
                    return true;
                } catch (error) {
                    console.error('Error restarting video:', error);
                    return false;
                }
            }
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

    async getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error getting cameras:', error);
            return [];
        }
    }

    async switchCamera(deviceId) {
        try {
            // Stop all tracks in the current stream
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
            }

            // Get new stream with selected camera
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
                audio: true
            });

            // Update local video
            const localVideo = document.querySelector('#videoGrid video');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
            }

            // Update all peer connections with the new stream
            Object.values(this.peers).forEach(peer => {
                const senders = peer.getSenders();
                const videoSender = senders.find(sender => sender.track?.kind === 'video');
                if (videoSender) {
                    const videoTrack = this.localStream.getVideoTracks()[0];
                    videoSender.replaceTrack(videoTrack);
                }
            });

            this.currentCamera = deviceId;
            return true;
        } catch (error) {
            console.error('Error switching camera:', error);
            throw new Error('Failed to switch camera');
        }
    }
}

export default WebRTCService; 