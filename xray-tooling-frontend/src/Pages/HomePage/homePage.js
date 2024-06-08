import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Stack,
  Button,
  AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem
} from '@mui/material';
import Box from '@mui/material/Box';
import NavBar from '../../Components/NavBar';
import './homePage.css'

const HomePage = () => {
  const [image, setImage] = useState(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const fileInputRef = useRef(null);
  let navigate = useNavigate();

  let headers = new Headers();
  headers.append('Access-Control-Allow-Origin', 'http://127.0.0.1:8000/upload');
  headers.append('Access-Control-Allow-Credentials', 'true');
  headers.append('GET', 'POST', 'OPTIONS');

  const handleImageUpload = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
    setIsImageEnlarged(false);
  };

  const handleClick = () => {
    navigate('/Main');
  }

  const handleSubmit = async () => {
    if (!image) {
      console.error('No file selected!');
      return;
    }

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded:', data);
        // Handle success
      } else {
        console.error('Failed to upload file');
        // Handle failure
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error
    }
  };



  const handleResults = () => {
    handleSubmit();
    navigate('/Results', { state: { image } });
  };

  const handleRAG = () => {
    navigate('/RAG');
  };

  const toggleImageSize = () => {
    setIsImageEnlarged(!isImageEnlarged);
  };

  const imageStyle = {
    maxWidth: isImageEnlarged ? '100%' : '50%', // Adjust the percentage as needed
    height: 'auto',
  };


  const handleLogin = () => {
    navigate('/Login');
  };

  const handleChooseImageClick = () => {
    // Trigger click on file input
    fileInputRef.current.click();

  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <NavBar />
      <Box className="page-body" style={{ flex: '1 1 auto', overflow: 'auto', backgroundColor: '#e9ecef', height: '60%', position: 'relative' }}>
        <Typography sx={{ marginRight: '34vw', marginTop: "5vh", fontWeight: 'bold', fontSize: '3.2vw' }}>Your Personal <span style={{ color: '#2C71D9' }}>Fracture </span><br /> <span style={{ color: '#2C71D9' }}>Rehabilitation</span> Assistant</Typography>
        <Box sx={{ position: 'absolute', bottom: '10%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto' }}>
          <Button onClick={handleClick} sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: 'black', 
            width: '20vw', 
            height: '10vh', 
            color: 'white', 
            border: '10px solid rgba(255, 255, 255, 0.7)' 
          }}>
            Get Started
          </Button>       
        </Box>    
      </Box>
      <Box className="page-footer" style={{ flex: '1 1 auto', overflow: 'auto', backgroundColor: '#e9ecef' }}>
        <Grid container spacing={2} sx={{ marginTop: "20px", display: 'flex', alignItems: 'start' }}>
          <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '2.5vw', minHeight: '3em' }}>Our Features</Typography>
          </Grid>
          <Grid item xs={4} sx={{}}>
            <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <Typography sx={{ fontSize: '2.5vw', minHeight: '1.5em', color: '#2C71D9' }}>X-ray Analysis</Typography>
              <Typography sx={{ fontSize: '1.6vw' }}>Simply by uploading an X-ray image, XCare will determine whether there is a fracture, and identify the affected body part.</Typography>
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <Typography sx={{ fontSize: '2.5vw', minHeight: '1.5em', color: '#2C71D9' }}>Customized Recovery Assistance</Typography>
              <Typography sx={{ fontSize: '1.6vw' }}>Powered by Retreival Augmented Generation and Large Language Models, our chat and flows interface allow for interactive communication, providing rehabilitation advice tailored to your needs.</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default HomePage;
