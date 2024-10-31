import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:5000/live'); // Signaling server manzili

const LiveStream = () => {
    const videoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const [isStreaming, setIsStreaming] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [peerConnections, setPeerConnections] = useState({});
    const { roomId } = useParams(); // roomId ni olish

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = stream;

            // Foydalanuvchi ma'lumotlarini olish
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const liveInfo = {
                email: loggedInUser.email,
                username: loggedInUser.username || 'No name',
                startTime: new Date().toISOString(),
                videoTitle: 'Jonli Efir',
                status: 'started',
                roomId: roomId,
            };

            // Jonli efirga ma'lumotlarni yuborish
            await fetch('http://localhost:5000/live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(liveInfo),
            });

            // Jonli efirga qo'shilish
            socket.emit('join-room', liveInfo.roomId, socket.id, liveInfo);

            socket.on('user-connected', (userId) => {
                const peerConnection = createPeerConnection(userId);
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
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

        // Efirni to'xtatish haqidagi ma’lumotlarni serverga yuborish
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        await fetch('http://localhost:5000/live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: loggedInUser.email,
                status: 'stopped',
                roomId: roomId,
                endTime: new Date().toISOString(),
            }),
        });

        Object.values(peerConnections).forEach((peerConnection) => peerConnection.close());
        setPeerConnections({});
    };

    const createPeerConnection = (userId) => {
        const peerConnection = new RTCPeerConnection();
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('send-signal', { to: userId, signal: event.candidate });
            }
        };
        peerConnection.ontrack = (event) => {
            setRemoteStreams((prevStreams) => [...prevStreams, event.streams[0]]);
            remoteVideoRefs.current[userId].srcObject = event.streams[0];
        };
        return peerConnection;
    };

    useEffect(() => {
        return () => {
            if (isStreaming) stopStream();
        };
    }, [isStreaming]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
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
                        className={`px-6 py-3 text-lg font-semibold rounded-lg transition ${isStreaming ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        Jonli efirni boshlash
                    </button>
                    <button
                        onClick={stopStream}
                        disabled={!isStreaming}
                        className={`px-6 py-3 text-lg font-semibold rounded-lg transition ${!isStreaming ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'}`}
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
