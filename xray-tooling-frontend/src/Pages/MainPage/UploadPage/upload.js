import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader, FileCard } from 'evergreen-ui'
import NavBar from '../../../Components/NavBar';
import ProgressBar from '../../../Components/ProgressBar';
import { useMyContext } from '../../../context';
import './upload.css';
import { Typography } from '@mui/material';
import uploadFile from '../../../Assets/Icons/uploadFile.svg'
import uploadedFile from '../../../Assets/Icons/uploadedFile.svg';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const UploadPage = ({ setStage, image, setImage }) => {

    const [fileName, setFileName] = useState("");

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

    const handleFileChange = (files) => {
        console.log(files[0])
        setImage([files[0]]);
        setFileName(files[0].name)
    };


    return (
        <div class="flex flex-col h-full">
            <div class="flex-col flex items-start w-10/12 my-4 mx-auto h-1/12">
                {/* <h1 class="text-4xl font-bold">1. Upload </h1> */}
                <h1 class="text-2xl"> Upload your X-ray here. Our tool will analyze it.</h1>
            </div>
            <div class="flex flex-col w-10/12 mx-auto h-full">
                <div class="flex items-center justify-center w-full h-5/6">
                    {image ?
                        <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-full border-2 bg-theme-blue border-theme-blue rounded-lg cursor-pointer bg-gray-50">

                            <div class="w-2/6">
                                <div class="flex flex-row items-start mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <h1 class="ml-2 text-gray-100">File Succesfully Uploaded</h1>
                                </div>
                                <div class="flex items-center bg-blue-400 rounded-lg justify-between">
                                    <img src={uploadedFile} />
                                    <div class="flex flex-col text-left w-8/12">
                                        <h1>{image[0].name}</h1>

                                    </div>
                                    <div class="flex justify-end items-center w-1/12 h-full mr-2">
                                        <div class="flex items-center justify-center w-6 h-6 rounded hover:bg-theme-blue-dark text-white">
                                            <DeleteForeverIcon sx={{ color: 'white' }} onClick={handleRemove}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>
                        :
                        <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-full border-2 bg-theme-blue hover:bg-theme-blue-hover border-theme-blue rounded-lg cursor-pointer bg-gray-50">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <img src={uploadFile} class="h-20 w-20" />

                                <p class="mb-2 text-sm text-gray-200"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                <p class="text-xs text-gray-300">SVG, PNG, JPG </p>
                            </div>
                            <input id="dropzone-file" type="file" class="hidden" onChange={(e) => handleFileChange(e.target.files)} />
                        </label>

                    }

                </div>
                <div class="w-full h-1/6 flex justify-end items-end">
                    {/* <button className="upload-submit" onClick={handleSubmit}>Submit</button> */}
                    <div onClick={handleSubmit} class="group flex w-48 mb-6 cursor-pointer items-center justify-center rounded-md bg-progress-green px-6 py-2 text-white hover:bg-hover-green">
                        <span class="group flex w-full items-center justify-center rounded py-1 text-center font-bold"> Continue </span>
                        <svg class="flex-0 ml-4 h-6 w-6 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div >
        </div >
    );

}

export default UploadPage;
