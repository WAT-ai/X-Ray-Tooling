import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Button,
  AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem, Container, Box, InputLabel
} from '@mui/material';

import classIdToBodyPart from './BodyPartMapping.json';

const Results = () => {
  const [phaseOneResult, setPhaseOneResult] = useState(null);
  const [phaseTwoResult, setPhaseTwoResult] = useState(null);

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
        if (data["class_id"] === 1) {
          data["class_id"] = "Fractured"
        } else {
          data["class_id"] = "Not fractured"
        }
        setPhaseOneResult(data["class_id"]);
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
      if (response.ok) {
        let data = await response.json();
        console.log('Phase 2 run:', data);
        if (data["class_id"] !== undefined) { 
          const bodyPart = classIdToBodyPart[data["class_id"]];
          if (bodyPart) { 
            data["class_id"] = bodyPart; 
          } else {
            console.error('Invalid class_id received:', data["class_id"]);
          }
        }
        setPhaseTwoResult(data["class_id"]);
      }
    } catch (error) {
      console.error('Error running phase 2:', error);
    }
  };

  useEffect(() => {
    handleRunPhaseOne();
    handleRunPhaseTwo();
  }, []);

  const handleRAG = () => {
    navigate('/RAG', { state: { phaseOneResult, phaseTwoResult } });
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
        <Card sx={{boxShadow:'none', display:'flex', flexDirection: 'row', justifyContent:'space-between'}}>
          <CardContent sx={{width:'60%'}}>
            <Box sx={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '20px',borderRadius: '10px' }}> 
              <Typography variant='h4' sx={{ textAlign: 'left' , marginBottom:'5px'}}>
                <span style={{ color: '#4686ee' }}>Fracture Classification:</span> <span style={{ color: 'black' }}>{phaseOneResult ? phaseOneResult : 'Loading...'}</span>
              </Typography>
              <Typography variant='h5' sx={{ color: 'grey', textAlign: 'left' }}>
                If fractures are present, we suggest consulting with your doctor or engaging with our <span sx={{ color: '#4686ee' }}>AI chatbot</span> to inquire about the optimal steps to take.
              </Typography>
              <Select
                displayEmpty
                value={phaseOneResult ? phaseOneResult : ''}
                onChange={handlePhaseOneSelectChange}
                sx={{ minWidth: '100px', marginLeft: '10px' }}
                renderValue={(selected) => {
                    if (selected === '') {
                        return <em>Override</em>;
                    }
                    return selected;
                }}
                >
                  <MenuItem value="Fractured">Fractured</MenuItem>
                  <MenuItem value="Not Fractured">Not Fractured</MenuItem>
              </Select>
            </Box>

            <Box sx={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', padding: '20px',borderRadius: '10px', marginTop:'2%' }}> 

              <Typography variant='h4' sx={{ textAlign: 'left' , marginBottom:'5px'}}>
                <span style={{ color: '#4686ee' }}>Body Part Classification:</span> <span style={{ color: 'black' }}>{phaseTwoResult ? phaseTwoResult : 'Loading...'}</span>
              </Typography>
              <Typography variant='h5' sx={{color:'grey', textAlign:'left'}}>Specific bone fractures most likely require unique rehabilitation plans.</Typography>
                <Select 
                    displayEmpty
                    value={phaseTwoResult ? phaseTwoResult : ''}
                    onChange={handlePhaseTwoSelectChange}
                    sx={{ minWidth: '100px', marginLeft: '10px' }}
                    renderValue={(selected) => {
                        if (selected === '') {
                            return <em>Override</em>;
                        }
                        return selected;
                    }}
                    >
                  {Object.entries(classIdToBodyPart).map(([id, bodyPart]) => (
                    <MenuItem key={id} value={bodyPart}>{bodyPart}</MenuItem>
                    ))}
              </Select>

            </Box>

          </CardContent>
          <img src={url} style={{ maxWidth: '50%',maxHeight: '500px', width: 'auto', height: 'auto', objectFit: 'cover', borderRadius: '50px', marginRight: '100px' }} />
        </Card>
        <Button
            variant="contained"
            color="primary"
            disabled={!phaseOneResult || !phaseTwoResult}
            sx={{
              width: '240px',
              height: '80px',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '20px',
              backgroundColor: '#89cff0', 
              color: '#000080', 
              marginLeft: '2%',
              marginBottom: '20px',
              marginTop: '5px',
            }}
            onClick={handleRAG}
          >
            Go to AI Chatbot
          </Button>
    </div>
  );
};

export default Results;
