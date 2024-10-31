import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://livetest-jgle.onrender.com/live');

const LiveStreamList = () => {
    const [liveStreams, setLiveStreams] = useState([]);
    const [currentStream, setCurrentStream] = useState(null);

    useEffect(() => {
        const fetchLiveStreams = async () => {
            try {
                const response = await fetch('https://livetest-jgle.onrender.com/live');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setLiveStreams(data);
            } catch (error) {
                console.error('Error fetching live streams:', error);
            }
        };

        fetchLiveStreams();

        socket.on('live-streams', (streams) => {
            setLiveStreams(streams);
        });

        socket.on('stream-started', (stream) => {
            setLiveStreams((prev) => [...prev, stream]);
        });

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
        setCurrentStream(stream);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Jonli Efirlar</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
            {currentStream && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold">Jonli Efir: {currentStream.videoTitle}</h2>
                    <video
                        autoPlay
                        playsInline
                        className="w-full h-64 bg-black rounded-lg"
                        src={currentStream.stream}
                    />
                </div>
            )}
        </div>
    );
};

export default LiveStreamList;
