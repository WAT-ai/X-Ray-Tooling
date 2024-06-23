import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Button,
  AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem, Container, Box, InputLabel, Grid, Stack
} from '@mui/material';

import classIdToBodyPart from './BodyPartMapping.json';
import './Results.css';

const ResultPage = ({ image, setStage, phaseOneResult, setPhaseOneResult, phaseTwoResult, setPhaseTwoResult }) => {


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
    <div class="flex flex-col h-full">
      <div class="flex-none flex items-end w-5/6 py-8 mt-8 mx-auto" style={{ height: "10%" }}>
        <h1 class="text-4xl font-bold">2. Diagnosis </h1>
      </div>
      <div class="flex flex-col items-start w-5/6 mx-auto h-full">
        <div class="flex flex-row h-5/6 space-x-5">
          
          <div class="w-7/12 flex flex-grow flex-col space-y-5">
            <div class="flex flex-col items-start h-1/2 w-full border-solid border-2 border-blue-500 rounded-lg p-8">
              <h1 class="text-3xl font-bold text-left"> Fracture Classification: {phaseOneResult ? phaseOneResult : 'Loading...'} </h1>
              <h1 class="text-2xl pt-3 pb-3 text-left">If fractures are present, we suggest consulting your doctor or engaging our AI chatbot to inquire about the optimal steps to take.</h1>
                <Select
                  displayEmpty
                  value={phaseOneResult ? phaseOneResult : ''}
                  onChange={handlePhaseOneSelectChange}
                  sx={{ minWidth: '100px', marginLeft: '0px' }}
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
            </div>
            <div class="flex flex-col items-start h-1/2 w-full border-solid border-2 border-blue-500 rounded-lg p-8">
              <h1 class="text-3xl font-bold text-left">Body Part Classification: {phaseTwoResult ? phaseTwoResult : 'Loading...'}</h1>
              <h1 class="text-2xl pt-3 pb-5 text-left">Specific bone fractures most likely require unique rehabilitation plans.</h1>

              
              <Select
                displayEmpty
                value={phaseTwoResult ? phaseTwoResult : ''}
                onChange={handlePhaseTwoSelectChange}
                sx={{ minWidth: '100px', marginLeft: '0px' }}
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
            </div>
          </div>
          
          <div class="w-5/12"> 
            <img src={url} className="results-image" />
          </div>

        </div>
      </div>
    </div>

  );
};

export default ResultPage;
