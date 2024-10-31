import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import LiveStream from './Live';
import LiveStreamList from './Livelist';
import Login from './Login';



const App = () => {
  return (
    <Router>
      <Main />
    </Router>
  );
};
const Main = () => {

  return (
    <div>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/live" element={<LiveStream />} />

        </Routes>
      </div>
  
  );
};

export default App;