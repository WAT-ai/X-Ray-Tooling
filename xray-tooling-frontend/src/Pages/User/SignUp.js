import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Logo from '../../Assets/Logo.svg'
import resultsIcon from '../../Assets/Icons/resultsSignUpIcon.svg'
import medicalDocument from '../../Assets/Icons/medicalDocumentSignUpIcon.svg'
import uploadXray from '../../Assets/Icons/uploadFileSignUpIcon.svg'
import chatIcon from '../../Assets/Icons/chatSignUpIcon.svg'
import { initializeApp } from 'firebase/app';
import { ref, set, get, child } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';
import { database } from '../../firebase'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';




const SignUp = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('')
    const [openDialog, setOpenDialog] = useState(false);
    const [alreadySignedUp, setalreadySignedUp] = useState(false)
    const [signUpSuccess, setSuccess] = useState(false)

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        writeUserData(name, email);
    };



    async function writeUserData(name, email) {
        const dbRef = ref(database);
        const emailIndexRef = child(dbRef, 'emailIndex/' + encodeEmail(email));
        const snapshot = await get(emailIndexRef);

        if (snapshot.exists()) {
            console.log('Email already exists.');
            setalreadySignedUp(true);
            return false;
        } else {
            const userId = uuidv4();
            const userRef = child(dbRef, 'waitList/' + userId);

            await set(userRef, {
                name: name,
                email: email
            });

            await set(emailIndexRef, userId);
            console.log('User added successfully.');
            setOpenDialog(true)
            setEmail('');
            setName('');
            return true;
        }
    }

    function encodeEmail(email) {
        return email.replace('.', '%2E');
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <div class="min-h-screen w-screen flex flex-col lg:flex-row relative">
            <div class="bg-blue-200 w-full lg:max-w-md xl:max-w-screen-sm px-10 py-20 lg:py-32 flex justify-center items-center">

                <div class="h-3/4">
                    <h1 class="text-left text-4xl font-bold">What you will get</h1>
                    <h1 class="text-left text-lg mt-4">A range of features to make your life easier</h1>
                    <div class="my-10">
                        <Stack spacing={4}>
                            <div className="flex items-start">
                                <img className="h-8 w-8" src={uploadXray} />
                                <h1 className="text-left font-bold text-xl ml-4">Upload your custom xrays</h1>
                            </div>
                            <div className="flex items-start">
                                <img className="h-8 w-8" src={medicalDocument} />
                                <h1 className="text-left font-bold text-xl ml-4">information from over 40,000 published medical documents</h1>
                            </div>
                            <div className="flex items-start">
                                <img className="h-8 w-8" src={resultsIcon} />
                                <h1 className="text-left font-bold text-xl ml-4">Real time xray fracture analysis</h1>
                            </div>
                            <div className="flex items-start">
                                <img className="h-8 w-8" src={chatIcon} />
                                <h1 className="text-left font-bold text-xl ml-4">Unlimited custom queries to ask relevant to your injury</h1>
                            </div>
                        </Stack>
                    </div>
                </div>
            </div>
            <div class="flex-1 flex flex-col overflow-auto px-10 lg:px-20 justify-center items-center relative mb-40 sm:mb-20">
                <div class="h-1/4 w-full flex justify-start items-center my-10">
                    <img src={Logo} />
                </div>
                <div class="h-3/4 w-full">
                    <h1 class="text-left text-4xl font-bold">Sign up for our launch</h1>
                    <h1 class="text-left text-lg mt-4">For first in line access to a leading edge medical service coming soon!</h1>
                    <h1 class="text-left text-lg">We will reach out when product fully supported.</h1>
                    <div class="my-10">
                        <Stack spacing={2}>
                            <div>
                                <h1 class="text-left font-bold">Email</h1>
                                <input value={email} onChange={(e) => handleEmailChange(e)} class='w-full h-[40px] border border-black rounded-lg pl-5' type="text" id="email" name="email" />
                            </div>
                            <div>
                                <h1 class="text-left font-bold">Name</h1>
                                <input value={name} onChange={(e) => handleNameChange(e)} class="w-full h-[40px] border border-black rounded-lg pl-5" type="text" id="name" name="name" />
                            </div>
                        </Stack>

                    </div>
                    {alreadySignedUp && <p class=" text-left text-red-500 mb-4">User already signed up.</p>}
                    <button onClick={handleSubmit} type="button" class={`w-full px-6 py-3.5 text-base font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg text-center`}>Sign Up For Waitlist</button>
                </div>
            </div>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                class="rounded-lg"
            >
                <div class="h-[450px] w-[400px] flex flex-col items-center rounded-lg">
                    <div class="w-full font-bold mt-20 ">
                        <DialogTitle class="text-center text-lg text-green-600" id="alert-dialog-title">{"Thanks! Your account has been succesfully added to the wait list"}</DialogTitle>
                    </div>
                    <DialogContent>
                        <DialogContentText class="text-center text-black" id="alert-dialog-description">
                            We will email you when our product goes live. We are working hard on delivering as soon as possible. Please check your inbox for future updates.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <button onClick={handleCloseDialog} type="button" class={`w-full px-6 py-3.5 mb-20 text-base font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg text-center`}>Ok</button>
                    </DialogActions>
                </div>
            </Dialog>

        </div>
    );
};

export default SignUp;
