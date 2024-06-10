import React from 'react';
import './consultation.css';
import { Grid } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';


const ConsultationPage = () => {
    return (
        <div className="consult-page">
            <div className="consult-title-container">
                <h1 style={{ textAlign: 'left', margin: '5px' }}>3. Consultation</h1>  
                              
            </div>
            <div className="consult-parent" >
                <h5 style={{ textAlign: 'left', margin: '10px', fontWeight: 'normal' }}>Choose 1 of the following consultation plans</h5>
                <div className="consult-selection-container">
                    <Grid container spacing={1} sx={{ height: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <div className='select-item' style={{ flex: '1' }}>
                                <div className='select-item-icon'>
                                    <MonitorHeartIcon sx={{ fontSize: 60 }} />
                                </div>
                                <div>
                                    <h1 style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                        Base
                                    </h1>
                                    <h4 style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                        Great for general diagnosis on the injury
                                    </h4>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <div className='select-item' style={{ flex: '1' }}>
                                <div className='select-item-icon'>
                                    <MonitorHeartIcon sx={{ fontSize: 60 }} />
                                </div>
                                <div>
                                    <h1 style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                    Restriction
                                    </h1>
                                    <h4 style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                    What to avoid with your injury
                                    </h4>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <div className='select-item' style={{ flex: '1' }}>
                                <div className='select-item-icon'>
                                    <MonitorHeartIcon sx={{ fontSize: 60 }} />
                                </div>
                                <div>
                                    <h1 style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                        Heat And Ice
                                    </h1>
                                    <h4 style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                        Outlines best practices for heating and icing
                                    </h4>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column'}}>
                            <span className='select-item' style={{ flex: '1'}}>
                                <div className='select-item-icon'>
                                    <MonitorHeartIcon sx={{ fontSize: 60 }} />
                                </div>
                                <div>
                                    <h1 style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                        Expectation
                                    </h1>
                                    <h4 style={{ textAlign: 'left', fontWeight: 'normal' }}>
                                        Recovery time and surgery expectations
                                    </h4>
                                </div>
                            </span>
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', height: '100px' }}>
                            <div className='text-box-item' style={{ flex: '1' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', height: '100%', alignItems: 'center' }}>
                                    <div style={{ flex: '0 0 20%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                        <p style={{ margin: '0' }}>Have a specific question? Ask it here...</p>
                                    </div>
                                    <div style={{ flex: '0 0 80%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                        <textarea style={{ 
                                            width: '95%', 
                                            height: '80%', 
                                            resize: 'none', 
                                            backgroundColor: 'rgb(217, 217, 217, 0.5)', 
                                            border: '5px rgb(217, 217, 217, 0.5)', 
                                            borderRadius: '10px', 
                                            boxSizing: 'border-box',
                                            fontSize: '1.2em' 
                                        }} autoFocus />                                    </div>
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                </div>
                <button className="consult-submit">Submit</button>
            </div>


        </div>
    );
};

export default ConsultationPage;
