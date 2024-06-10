import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Button,
  AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem, Container, Box, InputLabel, Grid, Stack
} from '@mui/material';

import classIdToBodyPart from './BodyPartMapping.json';
import './Results.css';

const ResultPage = ({ image, setStage }) => {
  const [phaseOneResult, setPhaseOneResult] = useState(null);
  const [phaseTwoResult, setPhaseTwoResult] = useState(null);

  const handleRunPhaseOne = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/phase1', {
        method: 'GET',
      });
      if (response.ok) {
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

  const handleSubmit = () => {
    setStage('consultation')
  }

  const handleRAG = () => {
    //navigate('/RAG', { state: { phaseOneResult, phaseTwoResult } });
  };

  const handleLogin = () => {
    //navigate('/Login');
  }

  const handlePhaseOneSelectChange = (event) => {
    setPhaseOneResult(event.target.value);
  };

  const handlePhaseTwoSelectChange = (event) => {
    setPhaseTwoResult(event.target.value);
  };

  console.log(image);
  const url = URL.createObjectURL(image[0]);

  return (
    <div className="results-page">
      <div className="results-title-container">
        <h1>2. Results</h1>
      </div>
      <div className='results-parent'>
        <div className="results-content-container">
          <div className="box-frame-container">
            <Box className="box-frame-1" sx={{ flex: 1 }}>
              <Typography variant='h4' sx={{ textAlign: 'left', marginBottom: '5px' }}>
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
            <Box className="box-frame-2" sx={{ flex: 1 }}>
              <Typography variant='h4' sx={{ textAlign: 'left', marginBottom: '5px' }}>
                <span style={{ color: '#4686ee' }}>Body Part Classification:</span> <span style={{ color: 'black' }}>{phaseTwoResult ? phaseTwoResult : 'Loading...'}</span>
              </Typography>
              <Typography variant='h5' sx={{ color: 'grey', textAlign: 'left' }}>Specific bone fractures most likely require unique rehabilitation plans.</Typography>
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
          </div>
          <img src={url} className="results-image" />
        </div>
        <button className="results-submit" onClick={handleSubmit}>Submit</button>
      </div>

    </div>
  );
};

export default ResultPage;
