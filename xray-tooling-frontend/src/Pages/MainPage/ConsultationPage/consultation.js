import React from 'react';
import { Grid } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';


const ConsultationPage = () => {
    return (
        <div class="h-full flex flex-col">
            <div class="flex-none h-1/6 bg-gray-200 flex items-center justify-center">
                <h1>3. Consultation</h1>        
            </div>
            <div class="flex-grow bg-gray-100 flex flex-col items-center justify-center">
                <h5>Choose 1 of the following consultation plans</h5>
                <button>Submit</button>
            </div>
        </div>
    );
};

export default ConsultationPage;
