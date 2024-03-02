import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem
} from '@mui/material';
const Stepone = () => {
  const [image, setImage] = useState(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const fileInputRef = useRef(null);

  let headers = new Headers();
  headers.append('Access-Control-Allow-Origin', 'http://127.0.0.1:8000/upload');
  headers.append('Access-Control-Allow-Credentials', 'true');
  headers.append('GET', 'POST', 'OPTIONS');
  let navigate = useNavigate();
  const handleImageUpload = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
    setIsImageEnlarged(false);
  };
  
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw'}}>
        <AppBar position="static" sx={{ backgroundColor: 'white', height: '65px', width: '100%', borderBottom: 'none', boxShadow: 'none' }}>
          <Toolbar variant="dense" sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: 'none' }}>
                <Typography variant="h6" component="div" sx={{ color: 'black', marginTop:'5px', fontWeight:'bold' }}>
                <span style={{ color: '#4686ee' }}>X-Ray</span><span style={{ color: 'black' }}>Tooling</span>
                </Typography>
                <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button color="inherit" onClick={handleResults} sx={{ color: 'black', marginRight: '16px', }}>Results</Button>
                  <Button color="inherit" sx={{ color: 'black', marginLeft:'16px' }} onClick={handleRAG}>Rehabilitation</Button>
                </div>
                <Button color="inherit" onClick={handleLogin} sx={{ color: 'white', backgroundColor:'#4686ee', borderRadius:'20px', width: '100px','&:hover': { backgroundColor: 'grey'} }} >Log In</Button>
          </Toolbar>
        </AppBar>
        <Card sx={{boxShadow: 'none', display: 'flex'}}>
          <CardContent sx={{width:'60%'}}>
            <Typography variant="h2" sx={{ fontWeight: '500' }}>
            Your Personal <span style={{ color: '#4686ee' }}>Fracture</span> <span style={{ color: '#4686ee' }}>Rehabilitation</span> Assistant.
            </Typography>
            <Typography variant="h5" sx={{marginTop:'50px', color:'grey'}}>
              Simply by uploading an X-ray image, X-Ray Tooling will determine whether the image contains a fracture and identify the affected body part. Powered by a RAG model, our messaging system allows for interactive communication, providing rehabilitation advice tailored to your needs.
            </Typography>
          </CardContent>
          <img src="https://firebasestorage.googleapis.com/v0/b/xray-tooling.appspot.com/o/images%2Fstock-photo-portrait-of-young-black-female-medical-intern-holding-blue-clipboard.jpeg?alt=media&token=76625332-e7c7-475c-8a93-8d6ab05df8cb" style={{ maxWidth: '50%', height: 'auto',  borderRadius: '50px 0 0 50px' }} />
        </Card>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '30%', 
          padding: '30px',
          backgroundColor: '#4686ee',
          borderRadius: '50px',
          display: 'flex',
          justifyContent: 'space-between', 
          alignItems: 'center', 
          color: 'white',
        }}
      >
        <Button
          variant="contained"
          component="label" 
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            color: '#4686ee',
            fontWeight: 400,
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
            textTransform: 'none', 
          }}
        >
          Choose File
          <input
            id="file-input"
            type="file"
            accept="image/*"
            hidden 
            onChange={handleImageUpload}
            ref={fileInputRef}
          />
        </Button>

        <Button
          variant="contained"
          onClick={handleResults}
          disabled={!image} 
          sx={{
            backgroundColor: image ? '#ffffff' : 'action.disabledBackground', 
            color: image ? '#4686ee' : 'action.disabled', 
            borderRadius: '20px',
            fontWeight: 400,
            textTransform: 'none',
            ':hover': {
              bgcolor: image ? '#e0e0e0' : 'action.disabledBackground',
              color: image ? '#4686ee' : 'action.disabled', 
              textDecoration: image ? 'none' : 'none',
              transform: image ? 'scale(1.02)' : 'none',
            },
          }}
        >
          Results
        </Button>
      </Paper>
    </div>
  );
}

export default Stepone;
