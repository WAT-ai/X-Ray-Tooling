import React, { useRef, useState } from 'react';
import UploadPage from './UploadPage/upload';
import ResultPage from './ResultPage/Results';
import ConsultationPage from './ConsultationPage/consultation';
import NavBar from '../../Components/NavBar';
import ProgressBar from '../../Components/ProgressBar';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './Main.css';


const Main = () => {
    const [stage, setStage] = useState('upload');
    const [image, setImage] = useState(null);

    const uploadRef = useRef(null);
    const resultsRef = useRef(null);
    const consultationRef = useRef(null);
    const nodeRef = stage === "upload" ? uploadRef : stage === "results" ? resultsRef : consultationRef;

    const RenderStage = () => {
        return (
            <SwitchTransition>
                <CSSTransition
                    key={stage}
                    timeout={350}
                    nodeRef={nodeRef}
                    classNames='fade'
                    addEndListener={(done) => {
                        nodeRef.current.addEventListener("transitionend", done, false);
                      }}
                >
                    <div ref={nodeRef} class="h-full">
                        {stage === 'upload' && <UploadPage setStage={setStage} image={image} setImage={setImage} />}
                        {stage === 'results' && <ResultPage setStage={setStage} image={image} />}
                        {stage === 'consultation' && <ConsultationPage setStage={setStage} image={image} />}
                    </div>
                </CSSTransition>
            </SwitchTransition>
        );
    };

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <ProgressBar stage={stage} />
            <RenderStage />
        </div>
    );
};

export default Main;
