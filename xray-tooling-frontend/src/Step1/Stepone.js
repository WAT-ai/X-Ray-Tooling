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
  const [selectedOption, setSelectedOption] = useState('');
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

  const handleRunPhaseOne = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/phase1', {
        method: 'GET',
        //headers: headers,
      });
      if(response.ok) {
        const data = await response.json();
        console.log('Phase 1 run:', data);
      }
    }
    catch (error) {
      console.error('Error running phase 1:', error);
      // Handle error
    }
  };  


  const handleRunPhaseTwo = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/phase2', {
        method: 'GET',
        //headers: headers,
      });
      if(response.ok) {
        const data = await response.json();
        console.log('Phase 2 run:', data);
      }
    }
    catch (error) {
      console.error('Error running phase 2:', error);
      // Handle error
    }
  }; 
  
  const handleResults = () => {
<<<<<<< Updated upstream
    
=======
    handleSubmit();
    navigate('/Results', { state: { image } });
>>>>>>> Stashed changes
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


  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
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
            {/* <Button edge='start' sx={{ '&:hover': { backgroundColor: 'white', marginTop:'10px' } }}> */}
                <Typography variant="h6" component="div" sx={{ color: 'black', marginTop:'5px', fontWeight:'bold' }}>
                <span style={{ color: '#4686ee' }}>X-Ray</span><span style={{ color: 'black' }}>Tooling</span>
                </Typography>
                <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button color="inherit" onClick={handleResults} sx={{ color: 'black', marginRight: '16px', }}>Results</Button>
                  <Button color="inherit" sx={{ color: 'black', marginLeft:'16px' }} onClick={handleRAG}>Rehabilitation</Button>
                </div>
                <Button color="inherit" onClick={handleLogin} sx={{ color: 'white', backgroundColor:'#4686ee', borderRadius:'20px', width: '100px','&:hover': { backgroundColor: 'grey'} }} >Log In</Button>
            {/* </Button> */}


            {/* <h1>Image Uploader</h1>
            <button onClick={handleSubmit}>Go to Results!</button>
            <button onClick={handleRunPhaseOne}>Run phase 1</button>
            <button onClick={handleRunPhaseTwo}>Run phase 2</button>
            <button onClick={handleRAG}>RAG</button> */}
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
        style={{ 
          position: 'fixed', 
          bottom: '10%',
          left: '50%', // Adjusted to center the bar
          transform: 'translateX(-50%)', // Adjusted to center the bar
          width: '50%', // Adjusted to take up 80% of the screen width
          padding: '30px', 
          backgroundColor: '#4686ee',
          borderRadius: '50px', // Adding rounded ends
          display: 'flex',
        }}
      >
        <label htmlFor="file-input" style={{fontFamily: 'Calibri',fontSize: '20px',display: 'inline-block', padding: '10px 10px', backgroundColor: '#4686ee', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
         Choose File
            <input
            id="file-input"
            type="file"
            accept="image/*" // You can specify the file types accepted here, e.g., "image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
            />
         </label>
        <Typography sx={{marginTop:'1%',marginLeft:'20%' ,color: '#ffffff', marginRight: '10px'}} > {selectedOption ? selectedOption : "Classification"}</Typography>
          <Select
            variant="standard"
            disableUnderline
            value={selectedOption}
            onChange={handleOptionChange}
            sx={{marginRight:'20%', color: '#ffffff', fontWeight:400}}
          >
            <MenuItem value="">Option 1</MenuItem>
            <MenuItem value="">Option 2</MenuItem>
            <MenuItem value="">Option 3</MenuItem>
          </Select>

          <Button variant="contained" onClick={handleResults} style={{ backgroundColor: '#ffffff', borderRadius: '20px', color:'#4686ee', marginleft:'50px', fontWeight:400 }}>Results</Button>

      </Paper>
        
        {/* <main>
          {image ? (
            <img src={URL.createObjectURL(image)} alt="Uploaded" style={imageStyle}/>
          ) : (
            <p>Please upload an image</p>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </main> */}
    </div>
  );
}

export default Stepone;
