import React, { useState } from 'react';
import UploadPage from './UploadPage/upload';
import ResultPage from './ResultPage/Results';
//import ConsultationPage from './ConsultationPage';
import NavBar from '../../Components/NavBar';
import ProgressBar from '../../Components/ProgressBar';

const Main = () => {
  const [stage, setStage] = useState('upload');
  const [image, setImage] = useState(null);

  const RenderStage = () => {
    switch (stage) {
      case 'upload':
        return <UploadPage setStage={setStage} image={image} setImage={setImage}/>;
      case 'results':
        return <ResultPage setStage={setStage} image={image}/>;
      //case 'consultation':
       // return <ConsultationPage />;
      default:
        return null;
    }
  };

  return (
    <div style={{height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column'}}>
        <NavBar />
        <ProgressBar stage={stage}/>
        <div style={{flexGrow: 1}}>
            <RenderStage />
        </div>
    </div>
  );
};

export default Main;
