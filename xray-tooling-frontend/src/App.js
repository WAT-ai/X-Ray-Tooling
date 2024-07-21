import logo from './logo.svg';
import './App.css';
import React from 'react';
import Login from './Login/Login';
import HomePage from './Pages/HomePage/homePage';
import Main from './Pages/MainPage/Main';
import ChatScreen from './chatpage';
import SignUp from './SignUp'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContextProvider } from './context';
function App() {
  return (
    <ContextProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Stepone" element={<HomePage />} />
            <Route path="/Main" element={<Main />} />
            <Route path="/RAG" element={<ChatScreen />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/Login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </ContextProvider>
  );
}

export default App;
