import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LiveStream from './Live';
import LiveStreamList from './Livelist';
import Login from './Login';


const App = () => {
    return (
        <Router>
            <Routes>
            <Route path="/" element={<Login />} />

                <Route path="/live/join/:roomId" element={<LiveStream />} />
                <Route path="/live" element={<LiveStreamList />} />
            </Routes>
        </Router>
    );
};

export default App;
