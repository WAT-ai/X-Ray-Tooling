import './App.css';
import React from 'react';
import HomePage from './Pages/HomePage/homePage';
import Main from './Pages/MainPage/Main';
import ChatScreen from './chatpage';
import SignUp from './Pages/User/SignUp'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContextProvider } from './context';
function App() {
  return (
    <ContextProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/SignUp" element={<SignUp />} />
          </Routes>
        </div>
      </Router>
    </ContextProvider>
  );
}

export default App;
