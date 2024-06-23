import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader, FileCard } from 'evergreen-ui'
import NavBar from '../../../Components/NavBar';
import ProgressBar from '../../../Components/ProgressBar';
import { useMyContext } from '../../../context';
import './upload.css';
import { Typography } from '@mui/material';

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
      <div class="flex flex-col h-full">
        <div class="flex-col flex items-start w-5/6 py-8 mt-8 mx-auto space-y-5" style={{ height: "10%" }}>
          <h1 class="text-4xl font-bold">1. Upload </h1>
          <h1 class="text-2xl"> Upload your X-ray here. Our tool will analyze it.</h1>
        </div>
        <div class="flex flex-col w-5/6 mx-auto h-full">
          <div class="h-5/6 pt-20">
            <div class="h-full">
                <div class="h-full flex flex-col">
                    <div class="">
                        <Typography variant="body">Upload File</Typography>
                        <Typography variant="subtitle2">You can upload 1 file. File can be up to 50 MB.</Typography>
                    </div>
                    <FileUploader
                        class=""
                        maxSizeInBytes={50 * 1024 ** 2}
                        maxFiles={1}
                        onChange={(e) => handleChange(e)}
                        onRejected={handleRejected}
                        renderFile={(file) => {
                            const { name, size, type } = file
                            const { message } = fileRejection || {}
                            return (
                                <FileCard
                                    className="file-card"
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
                </div>
                <button className="upload-submit" onClick={handleSubmit}>Submit</button>
            </div>

          </div>
        </div>
      </div>
    );

}

export default UploadPage;
