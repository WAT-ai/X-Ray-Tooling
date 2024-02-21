import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Button,
  AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem, Container, Box
} from '@mui/material';

const Results = () => {
  const [phaseOneResult, setPhaseOneResult] = useState(null);
  const [phaseTwoResult, setPhaseTwoResult] = useState(null);
  const [selectedPhaseOneResult, setSelectedPhaseOneResult] = useState('');
  const [selectedPhaseTwoResult, setSelectedPhaseTwoResult] = useState('');

  let navigate = useNavigate();
  const location = useLocation();
  
  const { image } = location.state;
  
    const handleRunPhaseOne = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/phase1', {
        method: 'GET',
      });
      if(response.ok) {
        const data = await response.json();
        console.log('Phase 1 run:', data);
        setPhaseOneResult(data);
      }
    }
    catch (error) {
      console.error('Error running phase 1:', error);
    }

  };  


  const handleRunPhaseTwo = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/phase2', {
        method: 'GET',
      });
      if(response.ok) {
        const data = await response.json();
        console.log('Phase 2 run:', data);
        setPhaseTwoResult(data);
      }
    }
    catch (error) {
      console.error('Error running phase 2:', error);
    }
  }; 

  useEffect(() => {
    handleRunPhaseOne();
    handleRunPhaseTwo();
  }, []);

  const handleRAG = () => {
    navigate('/RAG');
  };

  const handleLogin = () => {
    navigate('/Login');
  }

  const handlePhaseOneSelectChange = (event) => {
    setPhaseOneResult(event.target.value);
  };

  const handlePhaseTwoSelectChange = (event) => {
    setPhaseTwoResult(event.target.value);
  };
  
  console.log(image);
  const url = URL.createObjectURL(image);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw'}}>
      <AppBar position="static" sx={{ backgroundColor: 'white', height: '65px', width: '100%', borderBottom: 'none', boxShadow: 'none' }}>
          <Toolbar variant="dense" sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: 'none' }}>
                <Typography variant="h6" component="div" sx={{ color: 'black', marginTop:'5px', fontWeight:'bold' }}>
                <span style={{ color: '#4686ee' }}>X-Ray</span><span style={{ color: 'black' }}>Tooling</span>
                </Typography>
                <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button color="inherit" sx={{ color: 'black', marginRight: '16px', }}>Results</Button>
                  <Button color="inherit" sx={{ color: 'black', marginLeft:'16px' }} onClick={handleRAG}>Rehabilitation</Button>
                </div>
                <Button color="inherit" onClick={handleLogin} sx={{ color: 'white', backgroundColor:'#4686ee', borderRadius:'20px', width: '100px','&:hover': { backgroundColor: 'grey'} }} >Log In</Button>
          </Toolbar>
        </AppBar>
        <Typography variant="h3" sx={{boxShadow:'none', fontWeight:'Bold'}}>Results</Typography>
        <Card sx={{boxShadow:'none', display:'flex', alignContent:'horizontal', justifyContent:'space-between'}}>
          <CardContent sx={{width:'60%'}}>
            <Box sx={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '20px',borderRadius: '10px' }}> 
              <Typography variant='h4' sx={{ textAlign: 'left' , marginBottom:'5px'}}>
                <span style={{ color: '#4686ee' }}>Fracture Classification:</span> <span style={{ color: 'black' }}>{phaseOneResult}</span>
              </Typography>
              <Typography variant='h5' sx={{ color: 'grey', textAlign: 'left' }}>
                If fractures are present, we suggest consulting with your doctor or engaging with our <span sx={{ color: '#4686ee' }}>AI chatbot</span> to inquire about the optimal steps to take.
              </Typography>
              <Select sx={{ minWidth: '100px', marginLeft: '10px' }} onChange={handlePhaseOneSelectChange} >
                  <MenuItem value="Override A">Override A</MenuItem>
                  <MenuItem value="Override B">Override B</MenuItem>
              </Select>
            </Box>

            <Box sx={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '20px',borderRadius: '10px', marginTop:'2%' }}> 
              
              <Typography variant='h4' sx={{ textAlign: 'left' , marginBottom:'5px'}}>
                <span style={{ color: '#4686ee' }}>Body Part Classification:</span> <span style={{ color: 'black' }}>{phaseTwoResult}</span>
              </Typography>
              <Typography variant='h5' sx={{color:'grey', textAlign:'left'}}>Specific bone fractures most likely require unique rehabilitation plans.</Typography>
              <Select sx={{ minWidth: '100px', marginLeft: '10px' }} onChange={handlePhaseTwoSelectChange} >
                  <MenuItem value="Override A">Override A</MenuItem>
                  <MenuItem value="Override B">Override B</MenuItem>
              </Select>
              
            </Box>
            
          </CardContent>
          <img src={url} style={{ maxWidth: '50%', height: 'auto',  borderRadius: '50px 50px 50px 50px' }} />
        </Card>
        <Button
            variant="contained"
            color="primary"
            sx={{
              width: '165px',
              borderRadius: '20px',
              backgroundColor: '#89cff0', // Light blue background
              color: '#000080', // Dark blue text
              marginLeft: '2%',
              marginBottom: '20px',
              marginTop: '5px'
            }}
            onClick={handleRAG}
          >
            AI Chatbot
          </Button>
    </div>
  );
};

export default Results;
