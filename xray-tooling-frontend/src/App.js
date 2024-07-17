import './App.css';
import React from 'react';
import Login from './Login/Login';
import HomePage from './Pages/HomePage/homePage';
import Main from './Pages/MainPage/Main';
import ChatScreen from './chatpage';
import SignUp from './SignUp'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ContextProvider } from './context';

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/" element={<HomePage key={location.key}/>}  />
      <Route path="/Main" element={<Main />} />
      <Route path="/RAG" element={<ChatScreen />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route path="/Login" element={<Login />} />
    </Routes>
  );
}

function App() {
  return (
    <ContextProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </ContextProvider>
  );
}

export default App;