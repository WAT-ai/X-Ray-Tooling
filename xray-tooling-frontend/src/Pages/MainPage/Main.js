import React, { useRef, useState, useEffect } from 'react';
import UploadPage from './UploadPage/upload';
import ResultPage from './ResultPage/Results';
import ConsultationPage from './ConsultationPage/consultation';
import RagPage from './RagPage/Rag';
import NavBar from '../../Components/NavBar';
import ProgressBar from '../../Components/ProgressBar';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './Main.css';


const Main = () => {
    const [stage, setStage] = useState('upload');
    const [image, setImage] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const [phaseOneResult, setPhaseOneResult] = useState(null);
    const [phaseTwoResult, setPhaseTwoResult] = useState(null);
    const [request, setRequest] = useState(null);

    const uploadRef = useRef(null);
    const resultsRef = useRef(null);
    const consultationRef = useRef(null);
    const nodeRef = stage === "upload" ? uploadRef : stage === "results" ? resultsRef : consultationRef;

    useEffect(() => {
        if (image) {
            console.log(image);
            const url = URL.createObjectURL(image[0]);
            setImageURL(url)
        }
    }, [image])

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
                        {stage === 'results' && <ResultPage setStage={setStage} image={image} imageURL={imageURL} setPhaseOneResult={setPhaseOneResult} phaseOneResult={phaseOneResult} setPhaseTwoResult={setPhaseTwoResult} phaseTwoResult={phaseTwoResult} />}
                        {/* {stage === 'consultation' && <ConsultationPage setStage={setStage} image={image} setRequest={setRequest} phaseOneResult={phaseOneResult} phaseTwoResult={phaseTwoResult}/>} */}
                        {stage === 'consultation' && <RagPage setStage={setStage} request={request} injury={phaseOneResult} injuryLocation={phaseTwoResult} />}
                    </div>
                </CSSTransition>
            </SwitchTransition>
        );
    };

    return (
        <div class="h-screen w-full flex flex-col">
            <NavBar /> 
            <ProgressBar stage={stage} />
            <div class="flex-grow overflow-visible">
                <RenderStage />
            </div>
        </div>
    );
};

export default Main;
