import React, { useRef, useState, useEffect } from 'react';

const LiveStream = () => {
    const videoRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (isStreaming) {
            // Kameradan foydalanish uchun ruxsat so‘raymiz
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    // Videoni ulaymiz
                    videoRef.current.srcObject = stream;
                })
                .catch((error) => {
                    console.error('Stream olishda xato yuz berdi:', error);
                });
        } else {
            // Agar jonli efir tugagan bo'lsa, kamerani o'chiramiz
            if (videoRef.current && videoRef.current.srcObject) {
                let stream = videoRef.current.srcObject;
                let tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
    }, [isStreaming]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-700 to-indigo-900 text-white p-4">
            <div className="w-full md:w-3/4 lg:w-1/2">
                <div className="relative shadow-lg rounded-lg overflow-hidden bg-black border-4 border-blue-500">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 md:h-80 bg-black rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 py-2 bg-gradient-to-t from-black opacity-75 text-center text-sm md:text-lg">
                        {isStreaming ? 'Siz jonli efirdasiz!' : 'Jonli efir boshlashga tayyor'}
                    </div>
                </div>
                <button
                    onClick={() => setIsStreaming(!isStreaming)}
                    className={`mt-6 px-6 py-3 w-full md:w-auto md:px-12 text-lg font-semibold rounded-lg transition ${
                        isStreaming
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                    {isStreaming ? 'Efirdan chiqish' : 'Jonli efirni boshlash'}
                </button>
            </div>
        </div>
    );
};

export default LiveStream;
