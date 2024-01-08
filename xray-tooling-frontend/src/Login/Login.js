// import React, { createContext, useState, useContext  } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Link, useNavigate } from 'react-router-dom'
// import {
//     TextField,
//     Typography,
//     Button,
//     Alert,
//     AlertTitle,
//     Grid,
//     FormControlLabel,
//     ButtonBase,
//     AppBar, Toolbar, IconButton, Menu
//   } from '@mui/material';

// const Login = () => {
//     const [Email, setEmail] = useState('');
//     const [Password, setPassword] = useState('');
//     const [showAlert, setShowAlert] = useState(false);
//     const [AlertMessage, setAlertMessage] = useState('');

//     const handleEmailChange = (event) => {
//         setEmail(event.target.value);
//     };
//     const handlePasswordChange = (event) => {
//         setPassword(event.target.value);
//     };
//     let navigate = useNavigate(); 
//     const routeChange = () =>{ 
//         navigate('/');
//     }

//     return(
//         <div>


//         </div>
//     )


// };
// export default Login;
import React, { useState } from 'react';
import {
  TextField,
  Typography,
  Button,
  Grid,
  Alert,
  AlertTitle,
  AppBar,
  Toolbar,
} from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = () => {
    // Here you can implement your login logic.
    // For simplicity, we'll just show an alert.
    if (email && password) {
      setShowAlert(false); // Hide any previous alerts
      setAlertMessage('Login successful'); // Message for successful login
      setShowAlert(true);
    } else {
      setShowAlert(false); // Hide any previous alerts
      setAlertMessage('Please enter both email and password.'); // Error message
      setShowAlert(true);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
       <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Welcome to XRAY Tooling Project</Typography>
        </Toolbar>
      </AppBar>
      <Typography variant="h4">Login</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            type="password"
            label="Password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={handlePasswordChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login
          </Button>
        </Grid>
      </Grid>

      {showAlert && (
        <Alert severity="info">
          <AlertTitle>Info</AlertTitle>
          {alertMessage}
        </Alert>
      )}
    </div>
  );
};

export default Login;
