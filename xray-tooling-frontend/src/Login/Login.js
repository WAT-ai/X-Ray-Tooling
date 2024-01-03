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
import { auth } from "../firebase";
import {signInWithEmailAndPassword} from "firebase/auth"
import { Route, useNavigate } from 'react-router-dom';

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
  let navigate = useNavigate();

  const handleLogin = () => {
    
    signInWithEmailAndPassword(auth,email,password) //sends email and password to firebase to be created
        .then((userCredential) => {
            // Signed in
            // var user = userCredential.user;
            // setShowAlert(false)
            // setUserid(user.uid)
            console.log('Authenticated');
            navigate('/Stepone');
        })
        .catch((error) => {
            var errorCode = String(error.code);
            console.log(error.message)
            // setShowAlert(true)
            // setAlertMessage(error.message)
            console.error('Firebase Error: ', error);
        });
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
       <AppBar position="static" style={{ background: 'Yellow' }}>
        <Toolbar>
          <Typography style={{ color: 'Black' }} variant="h6">Welcome to XRAY Tooling Project</Typography>
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
