import React from 'react';
import './ProgressBar.css';
import DoneIcon from '@mui/icons-material/Done';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const ProgressBar = ({stage}) => {
    return (
        <div className="stepper-wrapper">
            <div className={`stepper-item ${stage === 'upload' ? 'active' : ''}`}>
                {stage === 'upload' && <div className="arrow"><ArrowDropDownIcon/></div>}
                <div className="step-counter"><DoneIcon sx={{ color: 'white' }} /></div>
                <div className="step-name">Upload</div>
            </div>
            <div className={`stepper-item ${stage === 'results' ? 'active' : ''}`}>
                {stage === 'results' && <div className="arrow"><ArrowDropDownIcon/></div>}
                <div className="step-counter"></div>
                <div className="step-name">Results</div>
            </div>
            <div className={`stepper-item ${stage === 'consultation' ? 'active' : ''}`}>
                {stage === 'consultation' && <div className="arrow"><ArrowDropDownIcon/></div>}
                <div className="step-counter"></div>
                <div className="step-name">Consultation</div>
            </div>
        </div>
    );
};

export default ProgressBar;
