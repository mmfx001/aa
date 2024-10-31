import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "./Login"
import LiveStreamList from "./Livelist"
import LiveStream from "./Live"

const App = () => {
    const [currentStream, setCurrentStream] = useState(null);

    const handleStreamSelected = (stream) => {
        setCurrentStream(stream);
    };

    const handleStreamStarted = (stream) => {
        // Qo'shilgan stream ro'yxatga qo'shiladi
        setCurrentStream(stream);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/live" element={
                    <div>
                        <LiveStreamList onStreamSelected={handleStreamSelected} />
                        <LiveStream onStreamStarted={handleStreamStarted} />
                    </div>
                } />
            </Routes>
        </Router>
    );
};


export default App;
