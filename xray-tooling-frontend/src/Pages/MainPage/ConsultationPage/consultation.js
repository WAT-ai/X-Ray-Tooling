import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardActionArea, CardContent, TextField } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import './consultation.css'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


const ConsultationPage = ({ setStage, setRequest, phaseOneResult, phaseTwoResult }) => {

    const [message, setMessage] = useState()

    const handleSubmit = (requestType) => {
        // Add your logic here for handling the submit event
        console.log(requestType);
        setStage('RAG')
        if (requestType.request === 'query') {
            setRequest({ requestType: 'query', message: message })
        } else {
            setRequest({ requestType: 'flow', flow: requestType.flow })
        }

    }


    return (
        <div class="h-full flex flex-col">
            <div class="flex-none flex items-end w-5/6 mx-auto" style={{ height: "10%" }}>
                <h1 class="text-3xl font-bold">3. Consultation</h1>
            </div>
            <div class="flex-grow flex flex-col items-start pt-4 px-4 w-4/6 mx-auto">
                <h5 class="text-gray-500">Choose 1 of the following consultation plans</h5>
                <Grid container spacing={2} className="h-4/6">
                    <Grid item xs={6}>
                        <Card className="h-full">
                            <CardActionArea className='h-full'>
                                <CardContent onClick={() => handleSubmit({ request: 'flow', flow: 'base' })}>
                                    <div class="flex">
                                        <div class="w-1/6 h-full flex items-center justify-center">
                                            <MonitorHeartIcon />
                                        </div>
                                        <div class="w-5/6 flex flex-col justify-center text-left">
                                            <p class="text-xl font-bold">Base</p>
                                            <p class="text-md text-gray-600">Great for general diagnosis on the injury</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card className="h-full">
                            <CardActionArea>
                                <CardContent onClick={() => handleSubmit({ request: 'flow', flow: 'heat_ice' })}>
                                    <div class="flex">
                                        <div class="w-1/6 h-full flex items-center justify-center">
                                            <MonitorHeartIcon />
                                        </div>
                                        <div class="w-5/6 flex flex-col justify-center text-left">
                                            <p class="text-xl font-bold">Heat And Ice</p>
                                            <p class="text-md text-gray-600">Outlines best practices for heating and icing</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card className="h-full">
                            <CardActionArea>
                                <CardContent onClick={() => handleSubmit({ request: 'flow', flow: 'restriction' })}>
                                    <div class="flex">
                                        <div class="w-1/6 h-full flex items-center justify-center">
                                            <MonitorHeartIcon />
                                        </div>
                                        <div class="w-5/6 flex flex-col justify-center text-left">
                                            <p class="text-xl font-bold">Restriction</p>
                                            <p class="text-md text-gray-600">What to avoid with your injury</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card className="h-full">
                            <CardActionArea>
                                <CardContent onClick={() => handleSubmit({ request: 'flow', flow: 'expectation' })}>
                                    <div class="flex">
                                        <div class="w-1/6 h-full flex items-center justify-center">
                                            <MonitorHeartIcon />
                                        </div>
                                        <div class="w-5/6 flex flex-col justify-center text-left">
                                            <p class="text-xl font-bold">Expectation</p>
                                            <p class="text-md text-gray-600">Recovery time and surgery expectations</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className="h-full">
                            <div className="flex border rounded-lg p-4 h-full">
                                <div className="w-1/6 flex items-center">
                                    <p style={{ textAlign: "left" }}>Have a question? Ask it here...</p>
                                </div>
                                <div className="w-5/6">
                                    <textarea onChange={(e) => setMessage(e.target.value)} className="w-full h-full resize-none bg-gray-100 rounded-lg" style={{ padding: '8px' }} />
                                </div>
                            </div>
                        </Card>
                    </Grid>
                    <Grid item xs={12} className="text-left flex items-start justify-start items-center space-x-5">
                        <button id="results-submit" onClick={() => handleSubmit({ request: 'query' })}>Submit</button>
                        <div className="text-left flex items-start justify-start items-center">
                            <p>Press Enter</p>
                            <ArrowForwardIosIcon />
                        </div>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default ConsultationPage;
