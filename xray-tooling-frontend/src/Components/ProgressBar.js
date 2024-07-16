import React from 'react';
import './ProgressBar.css';
import DoneIcon from '@mui/icons-material/Done';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

import FileUploadIcon from '@mui/icons-material/FileUpload';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import Typography from '@mui/material/Typography';




const ProgressBar = ({ stage }) => {


    const steps = [{ step: 'upload', text: 'Upload X-ray' }, { step: 'results', text: 'View Results' }, { step: 'consultation', text: 'Consultation' }];
    const activeStepIndex = steps.findIndex(step => step.step === stage);

    ColorlibStepIcon.propTypes = {
        /**
         * Whether this step is active.
         * @default false
         */
        active: PropTypes.bool,
        className: PropTypes.string,
        /**
         * Mark the step as completed. Is passed to child components.
         * @default false
         */
        completed: PropTypes.bool,
        /**
         * The label displayed in the step icon.
         */
        icon: PropTypes.node,
    };

    const QontoStepIconRoot = styled('div')(({ theme, ownerState }) => ({
        color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
        ...(ownerState.active && {
            color: '#784af4',
        }),
        '& .QontoStepIcon-completedIcon': {
            color: '#784af4',
            zIndex: 1,
            fontSize: 18,
        },
        '& .QontoStepIcon-circle': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        },
    }));

    function QontoStepIcon(props) {
        const { active, completed, className } = props;

        return (
            <QontoStepIconRoot ownerState={{ active }} className={className}>
                {completed ? (
                    <Check className="QontoStepIcon-completedIcon" />
                ) : (
                    <div className="QontoStepIcon-circle" />
                )}
            </QontoStepIconRoot>
        );
    }

    QontoStepIcon.propTypes = {
        /**
         * Whether this step is active.
         * @default false
         */
        active: PropTypes.bool,
        className: PropTypes.string,
        /**
         * Mark the step as completed. Is passed to child components.
         * @default false
         */
        completed: PropTypes.bool,
    };

    const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
        [`&.${stepConnectorClasses.alternativeLabel}`]: {
            top: 22,
        },
        [`&.${stepConnectorClasses.active}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundImage:
                    'linear-gradient( 95deg,rgb(75, 181, 67) 0%,rgb(87, 233, 64) 100%)',
            },
        },
        [`&.${stepConnectorClasses.completed}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundImage:
                    'linear-gradient( 95deg,rgb(75, 181, 67) 0%,rgb(87, 233, 64) 100%)',
            },
        },
        [`& .${stepConnectorClasses.line}`]: {
            height: 3,
            border: 0,
            backgroundColor:
                theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
            borderRadius: 1,
        },
    }));

    const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 50,
        height: 50,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        ...(ownerState.active && {
            backgroundColor:
                'rgb(75, 181, 67)',
            boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        }),
        ...(ownerState.completed && {
            backgroundColor:
                'rgb(75, 181, 67)',
        }),
    }));

    function ColorlibStepIcon(props) {
        const { active, completed, className } = props;

        const icons = {
            1: <FileUploadIcon />,
            2: <TroubleshootIcon />,
            3: <PsychologyAltIcon />,
        };

        return (
            <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
                {icons[String(props.icon)]}
            </ColorlibStepIconRoot>
        );
    }

    return (
        // <div className="stepper-wrapper">
        //     <div className={`stepper-item ${stage === 'upload' ? 'active' : (stage !== 'upload' ? 'completed' : '')}`}>
        //         {stage === 'upload' && <div className="arrow"><ArrowDropDownIcon /></div>}
        //         <div className="step-counter">
        //             {(stage === 'upload' || stage !== 'upload') && <DoneIcon sx={{ color: 'white' }} />}
        //         </div>
        //         <div className="step-name">Upload</div>
        //     </div>
        //     <div className={`stepper-item ${stage === 'results' ? 'active' : (stage === 'consultation' || stage === "RAG" ? 'completed' : '')}`}>
        //         {stage === 'results' && <div className="arrow"><ArrowDropDownIcon /></div>}
        //         <div className="step-counter">
        //             {(stage === 'results' || stage === 'consultation' || stage === 'RAG') && <DoneIcon sx={{ color: 'white' }} />}
        //         </div>
        //         <div className="step-name">Results</div>
        //     </div>
        //     <div className={`stepper-item ${stage === 'consultation' || stage === "RAG" ? 'active' : ''}`}>
        //         {stage === 'consultation' || stage === 'RAG' && <div className="arrow"><ArrowDropDownIcon /></div>}
        //         <div className="step-counter">
        //             {stage === 'consultation' || stage === 'RAG' && <DoneIcon sx={{ color: 'white' }} />}
        //         </div>
        //         <div className="step-name">Consultation</div>
        //     </div>
        // </div>
        <div class="w-full my-4 h-[98px]">
            <Stepper alternativeLabel activeStep={activeStepIndex} connector={<ColorlibConnector />}>
                {steps.map((label) => (
                    <Step key={label.step}>
                        <StepLabel StepIconComponent={ColorlibStepIcon}>
                            <Typography variant="h6">{label.text}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </div>

    );
};

export default ProgressBar;