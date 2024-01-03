import { AppBar } from '@mui/material';
import React, { useState } from 'react';
import { auth, storage } from "../firebase";
import { ref, uploadBytes, deleteObject, listAll, getDownloadURL } from "firebase/storage";
import { Route, useNavigate } from 'react-router-dom';
const Stepone = () => {
  const [image, setImage] = useState(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  let headers = new Headers();
  headers.append('Access-Control-Allow-Origin', 'http://127.0.0.1:8000/upload');
  headers.append('Access-Control-Allow-Credentials', 'true');
  headers.append('GET', 'POST', 'OPTIONS');
  let navigate = useNavigate();
  const handleImageUpload = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
    setIsImageEnlarged(false);
    // const storageRef = ref(storage, `images/${selectedImage.name}`);
    // uploadBytes(storageRef, selectedImage)
    //   .then((snapshot) => {
    //     console.log('Uploaded a blob or file!');
    //     // Get the download URL within the promise chain
    //     return getDownloadURL(snapshot.ref);
    //   })
    //   .then((downloadURL) => {
    //     console.log('File available at', downloadURL);
    //     const data = { url: downloadURL};
    //     localStorage.setItem('userData', JSON.stringify(data));
    //     navigate('/Steptwo');
    //     // Handle the download URL or perform actions here
    //   })
    //   .catch((error) => {
    //     // Handle any errors during upload or download
    //     console.error('Error uploading file:', error);
    //   });
  };
  
  const handleSubmit = async () => {
    if (!image) {
      console.error('No file selected!');
      return;
    }

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded:', data);
        // Handle success
      } else {
        console.error('Failed to upload file');
        // Handle failure
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error
    }
  };

  const handleRunPhaseOne = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/phase1', {
        method: 'GET',
        //headers: headers,
      });
      if(response.ok) {
        const data = await response.json();
        console.log('Phase 1 run:', data);
      }
    }
    catch (error) {
      console.error('Error running phase 1:', error);
      // Handle error
    }
  };  


  const handleRunPhaseTwo = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/phase2', {
        method: 'GET',
        //headers: headers,
      });
      if(response.ok) {
        const data = await response.json();
        console.log('Phase 2 run:', data);
      }
    }
    catch (error) {
      console.error('Error running phase 2:', error);
      // Handle error
    }
  };  

  const handleRAG = () => {
    navigate('/RAG');
  };

  const toggleImageSize = () => {
    setIsImageEnlarged(!isImageEnlarged);
  };

  const imageStyle = {
    maxWidth: isImageEnlarged ? '100%' : '50%', // Adjust the percentage as needed
    height: 'auto',
  };

  return (
    <div className="Stepone">
      <header className="Stepone-header">
        <AppBar>
          <h1>Image Uploader</h1>
          <button onClick={handleSubmit}>Go to Results!</button>
          <button onClick={handleRunPhaseOne}>Run phase 1</button>
          <button onClick={handleRunPhaseTwo}>Run phase 2</button>
          <button onClick={handleRAG}>RAG</button>
        </AppBar>
        <main>
          {image ? (
            <img src={URL.createObjectURL(image)} alt="Uploaded" style={imageStyle}/>
          ) : (
            <p>Please upload an image</p>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </main>
      </header>
    </div>
  );
}

export default Stepone;
