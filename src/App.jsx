import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LiveStream from './Live';
import Login from './Login';
import LiveStreamList from './Livelist';


const App = () => {
    return (
        <Router>
            <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/live" element={<LiveStreamList />} />
            <Route path="/live/stream" element={<LiveStream />} />
            </Routes>
        </Router>
    );
};

export default App;
