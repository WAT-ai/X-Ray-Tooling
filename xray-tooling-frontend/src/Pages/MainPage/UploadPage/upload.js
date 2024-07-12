import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader, FileCard } from 'evergreen-ui'
import NavBar from '../../../Components/NavBar';
import ProgressBar from '../../../Components/ProgressBar';
import { useMyContext } from '../../../context';
import './upload.css';
import { Typography } from '@mui/material';

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
                {/* <div class="h-5/6 pt-20">
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
                </div> */}
                <div class="flex items-center justify-center w-full h-5/6">
                    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        {image ?
                            <div>
                                <h1>{image[0].name} uploaded</h1>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            : <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                            </div>
                        }
                        <input id="dropzone-file" type="file" class="hidden" onChange={(e) => handleFileChange(e.target.files)} />
                    </label>
                </div>
                <div class="w-full h-1/6 flex justify-end items-end">
                    {/* <button className="upload-submit" onClick={handleSubmit}>Submit</button> */}
                    <div onClick={handleSubmit} class="group flex w-1/6 mb-6 cursor-pointer items-center justify-center rounded-md bg-progress-green px-6 py-2 text-white hover:bg-hover-green">
                        <span class="group flex w-full items-center justify-center rounded py-1 text-center font-bold"> Continue </span>
                        <svg class="flex-0 ml-4 h-6 w-6 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default UploadPage;
