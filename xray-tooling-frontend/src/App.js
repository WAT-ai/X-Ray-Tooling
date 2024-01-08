import logo from './logo.svg';
import './App.css';
import React from 'react';
import Login from './Login/Login';
import Stepone from './Step1/Stepone';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Stepone />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
