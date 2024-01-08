import { AppBar } from '@mui/material';
import React, { useState } from 'react';

const Stepone = () => {
  const [image, setImage] = useState(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  const handleImageUpload = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
    setIsImageEnlarged(false);
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
          <button>Go to Results!</button>
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
