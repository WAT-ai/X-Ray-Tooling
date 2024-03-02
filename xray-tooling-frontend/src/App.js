import logo from './logo.svg';
import './App.css';
import React from 'react';
import Login from './Login/Login';
import Stepone from './Step1/Stepone';
import ChatScreen from './chatpage';
import SignUp from './SignUp'
import Results from './Results/Results'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Stepone />} />
            <Route path="/Stepone" element={<Stepone />} />
            <Route path="/RAG" element={<ChatScreen />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Results" element={<Results />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
