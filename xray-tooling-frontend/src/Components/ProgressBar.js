import React from 'react';
import './ProgressBar.css';
import DoneIcon from '@mui/icons-material/Done';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const ProgressBar = ({stage}) => {
    return (
        <div className="stepper-wrapper">
            <div className={`stepper-item ${stage === 'upload' ? 'active' : (stage !== 'upload' ? 'completed' : '')}`}>
                {stage === 'upload' && <div className="arrow"><ArrowDropDownIcon/></div>}
                <div className="step-counter">
                    {(stage === 'upload' || stage !== 'upload') && <DoneIcon sx={{ color: 'white' }} />}
                </div>
                <div className="step-name">Upload</div>
            </div>
            <div className={`stepper-item ${stage === 'results' ? 'active' : (stage === 'consultation' ? 'completed' : '')}`}>
                {stage === 'results' && <div className="arrow"><ArrowDropDownIcon/></div>}
                <div className="step-counter">
                    {(stage === 'results' || stage === 'consultation') && <DoneIcon sx={{ color: 'white' }} />}
                </div>
                <div className="step-name">Results</div>
            </div>
            <div className={`stepper-item ${stage === 'consultation' ? 'active' : ''}`}>
                {stage === 'consultation' && <div className="arrow"><ArrowDropDownIcon/></div>}
                <div className="step-counter">
                    {stage === 'consultation' && <DoneIcon sx={{ color: 'white' }} />}
                </div>
                <div className="step-name">Consultation</div>
            </div>
        </div>
    );
};

export default ProgressBar;