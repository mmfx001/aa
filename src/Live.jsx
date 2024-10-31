import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import LiveStreamList from './Livelist';

const socket = io('https://insta-2-e60y.onrender.com', {
    transports: ['websocket', 'polling'],
});

const LiveStream = () => {
    const videoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const [isStreaming, setIsStreaming] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [peerConnections, setPeerConnections] = useState({});

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket.IO connected:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket.IO connection error:', err);
        });

        return () => {
            socket.disconnect(); // Komponent chiqarilganda ulanishni uzing
        };
    }, []);

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = stream;

            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const liveInfo = {
                email: loggedInUser.email,
                username: loggedInUser.username || 'No name',
                startTime: new Date().toISOString(),
                videoTitle: 'Jonli Efir',
                status: 'started',
                roomId: 'roomId', // Room ID ni kerakli joyga almashtiring
            };

            await fetch('https://insta-2-e60y.onrender.com/live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(liveInfo),
            });

            socket.emit('join-room', liveInfo.roomId, socket.id, liveInfo);

            socket.on('user-connected', (userId) => {
                const peerConnection = createPeerConnection(userId, stream);
                setPeerConnections((prev) => ({ ...prev, [userId]: peerConnection }));
            });

            socket.on('receive-signal', async (data) => {
                const { from, signal } = data;
                if (peerConnections[from]) {
                    await peerConnections[from].setRemoteDescription(new RTCSessionDescription(signal));
                } else {
                    const peerConnection = createPeerConnection(from);
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    socket.emit('send-signal', { to: from, signal: peerConnection.localDescription });
                }
            });

            setIsStreaming(true);
        } catch (error) {
            console.error("Stream boshlashda xatolik yuz berdi:", error);
        }
    };

    const stopStream = async () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        setIsStreaming(false);
        setRemoteStreams([]);

        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        await fetch('https://insta-2-e60y.onrender.com/live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: loggedInUser.email,
                status: 'stopped',
                roomId: 'roomId', // Room ID ni kerakli joyga almashtiring
                endTime: new Date().toISOString(),
            }),
        });

        Object.values(peerConnections).forEach((peerConnection) => peerConnection.close());
        setPeerConnections({});
    };

    const createPeerConnection = (userId, stream) => {
        const peerConnection = new RTCPeerConnection();
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('send-signal', { to: userId, signal: event.candidate });
            }
        };
        peerConnection.ontrack = (event) => {
            setRemoteStreams((prevStreams) => {
                const updatedStreams = [...prevStreams, event.streams[0]];
                remoteVideoRefs.current[userId] = remoteVideoRefs.current[userId] || React.createRef();
                return updatedStreams;
            });
            remoteVideoRefs.current[userId].current.srcObject = event.streams[0];
        };

        // Add local tracks to the peer connection
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        return peerConnection;
    };

    useEffect(() => {
        return () => {
            if (isStreaming) stopStream();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
           <LiveStreamList/>
            <div className="w-full md:w-3/4 lg:w-1/2">
                <div className="relative shadow-lg rounded-lg overflow-hidden bg-black border border-gray-600">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 md:h-80 bg-black rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 py-2 bg-gradient-to-t from-black opacity-75 text-center text-sm md:text-lg">
                        {isStreaming ? 'Jonli efirdasiz!' : 'Jonli efir boshlashga tayyor'}
                    </div>
                </div>
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={startStream}
                        disabled={isStreaming}
                        className={`px-6 py-3 text-lg font-semibold rounded-lg transition ${isStreaming ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        Jonli efirni boshlash
                    </button>
                    <button
                        onClick={stopStream}
                        disabled={!isStreaming}
                        className={`px-6 py-3 text-lg font-semibold rounded-lg transition ${!isStreaming ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                    >
                        Efirdan chiqish
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {remoteStreams.map((stream, index) => (
                        <video
                            key={index}
                            ref={(ref) => (remoteVideoRefs.current[index] = ref)}
                            autoPlay
                            playsInline
                            className="w-full h-32 bg-black rounded-md border border-gray-700"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveStream;
