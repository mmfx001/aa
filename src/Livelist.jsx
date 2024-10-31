import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://livetest-jgle.onrender.com/live');

const LiveStreamList = ({ onStreamSelected }) => {
    const [liveStreams, setLiveStreams] = useState([]);

    useEffect(() => {
        // Jonli efirlar haqida yangilanishlarni olish
        socket.on('live-streams', (streams) => {
            setLiveStreams(streams);
        });

        // Foydalanuvchilar jonli efir boshlaganida
        socket.on('stream-started', (stream) => {
            setLiveStreams((prev) => [...prev, stream]);
        });

        // Foydalanuvchilar efirdan chiqishi haqida
        socket.on('stream-stopped', (roomId) => {
            setLiveStreams((prev) => prev.filter(stream => stream.roomId !== roomId));
        });

        return () => {
            socket.off('live-streams');
            socket.off('stream-started');
            socket.off('stream-stopped');
        };
    }, []);

    const joinStream = (stream) => {
        onStreamSelected(stream);
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold">Hozirda davom etayotgan jonli efirlar:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveStreams.map((stream) => (
                    <div key={stream.roomId} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold">{stream.videoTitle}</h2>
                        <button
                            onClick={() => joinStream(stream)}
                            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                        >
                            Jonli efirga qo'shilish
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveStreamList;
