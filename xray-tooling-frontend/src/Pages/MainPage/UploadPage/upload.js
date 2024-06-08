import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader, FileCard } from 'evergreen-ui'
import NavBar from '../../../Components/NavBar';
import ProgressBar from '../../../Components/ProgressBar';
import { useMyContext } from '../../../context';
import './upload.css';

const UploadPage = ({setStage, image, setImage}) => {

    const [fileName, setFileName] = useState(null);

    const handleSubmit = async () => {
        if (!image) {
            console.error('No file selected!');
            return;
        }

        const formData = new FormData();
        formData.append('file', image[0]);

        try {
            const response = await fetch('http://127.0.0.1:8000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('File uploaded:', data);
                setStage('results')
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

    const [fileRejection, setFileRejection] = React.useState()
    const handleChange = React.useCallback((files) => setImage([files[0]]))
    const handleRejected = React.useCallback((fileRejections) => setFileRejection(fileRejections))
    const handleRemove = React.useCallback(() => {
        setImage(null)
        setFileRejection(null)
    }, [])

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setImage(file);
        setFileName(file.name)
      };

    
    return (
        <div className="upload-page">
            <div className="title-container">
                <h1>1. Upload</h1>
            </div>
            <FileUploader
                className="file-upload"
                label="Upload File"
                description="You can upload 1 file. File can be up to 50 MB."
                maxSizeInBytes={50 * 1024 ** 2}
                maxFiles={1}
                onChange={(e) => handleChange(e)}
                onRejected={handleRejected}
                renderFile={(file) => {
                    const { name, size, type } = file
                    const { message } = fileRejection || {}
                    return (
                        <FileCard
                            key={name}
                            isInvalid={fileRejection != null}
                            name={name}
                            onRemove={handleRemove}
                            sizeInBytes={size}
                            type={type}
                            validationMessage={message}
                        />
                    )
                }}
                values={image}
            />
            <button className="submit" onClick={handleSubmit}>Submit</button>
        </div>
    );

    

/*
    return (
        <div>
            <h1 style={{ color: "black" }}>Upload Page</h1>
            <div className="parent">
                <div className="file-upload">
                    <img src={image} alt="upload" />
                    <h3> {fileName || "Click box to upload"}</h3>
                    <p>Maximun file size 10mb</p>
                    <input type="file" onChange={handleFileChange} />
                    {image && <button onClick={handleRemove}>Remove File</button>}
                </div>
            </div>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
    */
}

export default UploadPage;
