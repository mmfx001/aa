import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const socket = io('https://livetest-jgle.onrender.com/live'); // Signaling server manzili

const LiveStream = () => {
    const videoRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const { roomId } = useParams(); // roomId ni olish

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = stream;

            // Jonli efirga ma'lumotlarni yuborish
            socket.emit('start-stream', { roomId, stream });

            setIsStreaming(true);
        } catch (error) {
            console.error("Stream boshlashda xatolik yuz berdi:", error);
        }
    };

    const stopStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        setIsStreaming(false);
        socket.emit('stop-stream', { roomId });
    };

    useEffect(() => {
        socket.on('stream-started', (stream) => {
            videoRef.current.srcObject = stream;
            setIsStreaming(true);
        });

        socket.on('stream-stopped', () => {
            setIsStreaming(false);
            videoRef.current.srcObject = null;
        });

        return () => {
            socket.off('stream-started');
            socket.off('stream-stopped');
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Jonli Efir</h1>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 bg-black rounded-lg"
            />
            <div className="flex gap-4 mt-4">
                <button
                    onClick={startStream}
                    disabled={isStreaming}
                    className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md`}
                >
                    Jonli efirni boshlash
                </button>
                <button
                    onClick={stopStream}
                    disabled={!isStreaming}
                    className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md`}
                >
                    Efirdan chiqish
                </button>
            </div>
        </div>
    );
};

export default LiveStream;
