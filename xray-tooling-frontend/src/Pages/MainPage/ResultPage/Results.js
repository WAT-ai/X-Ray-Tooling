import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Button,
  AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem, Container, Box, InputLabel, Grid, Stack
} from '@mui/material';

import classIdToBodyPart from './BodyPartMapping.json';
import './Results.css';

const ResultPage = ({ image, imageURL, setStage, phaseOneResult, setPhaseOneResult, phaseTwoResult, setPhaseTwoResult }) => {

  const [imgUrl, setUrl] = useState(null);

  const handleRunPhaseOne = async () => {
    if (phaseOneResult) return;
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
    if (phaseTwoResult) return;
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

  const handleBack = () => {
    setStage('upload')
  }

  const handlePhaseOneSelectChange = (event) => {
    setPhaseOneResult(event.target.value);
  };

  const handlePhaseTwoSelectChange = (event) => {
    setPhaseTwoResult(event.target.value);
  };

  return (
    <div class="flex flex-col items-start w-5/6 mx-auto h-full">
      <div class="flex flex-row h-5/6 space-x-2">
        <div class="w-7/12 flex flex-grow flex-col">
          <div class="flex flex-col items-start h-1/2 w-full border-solid border-2 border-blue-500 rounded-lg p-8">
            <h1 class="text-3xl font-bold text-left">
              Fracture Classification:
              <Select
                sx={{ marginLeft: '1.25rem;', border: 'none', color: 'rgb(37 99 235)', fontWeight: 'bold', fontSize: '1.875rem;' }}
                displayEmpty
                value={phaseOneResult ? phaseOneResult : ''}
                onChange={handlePhaseOneSelectChange}
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
              {/* <span class="ml-5 text-blue-600">
                  {phaseOneResult ? phaseOneResult : 'Loading...'}
                </span> */}
            </h1>
            <h1 class="text-2xl pt-3 pb-3 text-left">If fractures are present, we suggest consulting your doctor or engaging our AI chatbot to inquire about the optimal steps to take.</h1>

          </div>
          <div class="h-4"></div> {/* Spacer div dont delete */}

          <div class="flex flex-col items-start h-1/2 w-full border-solid border-2 border-blue-500 rounded-lg p-8">
            <h1 class="text-3xl font-bold text-left">
              Fracture Location:
              <Select
                displayEmpty
                value={phaseTwoResult ? phaseTwoResult : ''}
                onChange={handlePhaseTwoSelectChange}
                sx={{ marginLeft: '1.25rem;', border: 'none', color: 'rgb(37 99 235)', fontWeight: 'bold', fontSize: '1.875rem;' }}
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
              {/* <span class="ml-5 text-blue-600">
                  {phaseTwoResult ? phaseTwoResult : 'Loading...'}
                </span> */}
            </h1>
            <h1 class="text-2xl pt-3 pb-5 text-left">Specific bone fractures most likely require unique rehabilitation plans.</h1>


          </div>
        </div>
        <div class="w-5/12">
          <img src={imageURL} className="results-image" />
        </div>
      </div>
      <div class="w-full h-1/6 flex justify-between items-end">
        {/* <button className="upload-submit" onClick={handleSubmit}>Submit</button> */}
        <div onClick={handleBack} class="group flex w-26 mb-6 cursor-pointer items-center justify-center rounded-md bg-progress-green px-6 py-2 text-white hover:bg-hover-green">
          <span class="group flex w-full items-center justify-center rounded py-1 text-center font-bold"> Back </span>
          <svg class="flex-0 ml-4 h-6 w-6 transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <div onClick={handleSubmit} class="group flex w-48 mb-6 cursor-pointer items-center justify-center rounded-md bg-progress-green px-6 py-2 text-white hover:bg-hover-green">
          <span class="group flex w-full items-center justify-center rounded py-1 text-center font-bold"> Continue </span>
          <svg class="flex-0 ml-4 h-6 w-6 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
