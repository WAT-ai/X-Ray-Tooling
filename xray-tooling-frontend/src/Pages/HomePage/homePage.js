import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Typewriter from 'typewriter-effect';
import SearchSharpIcon from '@mui/icons-material/SearchSharp';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import {
  Typography,
  Grid,
  Stack,
  Button,
  AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem
} from '@mui/material';
import DoctorImage from '../../Assets/DoctorImage.svg';
import photoCollage from '../../Assets/photoCollage.svg'
import diagnosisDemo from '../../Assets/diagnosisDemo.svg'
import consultDemo from '../../Assets/consultDemo.svg'
import Footer from '../../Components/Footer';
import NavBar from '../../Components/NavBar';

const HomePage = () => {
  const [image, setImage] = useState(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const fileInputRef = useRef(null);
  let navigate = useNavigate();

  let headers = new Headers();
  headers.append('Access-Control-Allow-Origin', 'http://127.0.0.1:8000/upload');
  headers.append('Access-Control-Allow-Credentials', 'true');
  headers.append('GET', 'POST', 'OPTIONS');


  const handleLogin = () => {
    navigate('/Login');
  };

  const handleBeginFlow = () => {
    navigate('/Main');
  }

  return (
    <div class="flex flex-col h-auto w-screen">
      <NavBar />
      <div class="flex flex-col h-screen bg-theme-blue shadow-xl shadow-dark-blue">
        <div class="flex w-full">
          <div class="h-full w-7/12 flex flex-col">
            <div class=" w-5/6 flex flex-col mx-auto mt-20">
              <h1 class="text-left text-7xl font-bold text-white">Real time X-ray diagnosis and consultation</h1>
              <h1 class="text-left text-7xl font-bold bg-clip-text" style={{ color: '#D1F5EE' }}>
                —without the hassle
              </h1>
            </div>
            <div class="h-1/2 flex justify-start text-bold flex-col mt-20">
              <div class="text-2xl w-5/6 h-[50px] mx-auto px-10 rounded-3xl bg-white flex items-center justify-between shadow-xl shadow-dark-blue text-black" >
                <Typewriter
                  options={{
                    strings: ['Can I go into work monday?', 'How often should I ice my knee?', 'Is icing or heating better for my leg?'],
                    autoStart: true,
                    loop: true,
                    delay: 50
                  }}
                  onInit={(typewriter) => {
                    typewriter
                      .pauseFor(2000)
                      .typeString()
                      .pauseFor(2000)
                      .deleteAll()
                      .start()

                  }}
                />
                <SearchSharpIcon sx={{ fontSize: 'larger' }} />
              </div>
            </div>
          </div>

          <div class="w-5/12  h-full flex items-start justify-center">
            <img class="w-5/6 mt-20" src={DoctorImage} alt="Doctor" />
          </div>
        </div>
        <div class="w-full h-2/3 flex justify-center items-center">
          <button onClick={handleBeginFlow} class="w-1/3 h-[80px] relative inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-theme-blue transition-all duration-150 ease-in-out rounded-2xl hover:pl-10 hover:pr-6 bg-gray-50 group">
            <span class="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-black group-hover:h-full"></span>
            <span class="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
              <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
            <span class="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
            <span class="relative w-full text-2xl text-left transition-colors duration-200 ease-in-out group-hover:text-white">Begin Consultation</span>
          </button>
        </div>
      </div>
      <div class="w-full h-auto grid grid-cols-1 md:grid-cols-2 items-start">
        <div class="w-full flex justify-end items-center my-20">
          <div class=" h-2/3 w-3/4 mr-20">
            <div class="flex flex-col">
              <div class="flex flex-row items-center">
                <div class="w-28 h-28 bg-blue-500 rounded-full flex justify-center items-center">
                  <FileUploadOutlinedIcon sx={{ fontSize: '80px', color: 'white' }} />
                </div>
                <h1 class="pl-5 text-5xl font-bold text-black">Upload</h1>
              </div>
              <div class="w-full mt-5 ml-5 text-left text-4xl">
                Simply by uploading your X-ray image, our tool will automatically detect detect the location of the xray, with <span class="text-theme-blue">support for over 20 body parts.</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center items-center my-20">
          <img class="h-2/3 px-10" src={photoCollage} />
        </div>
      </div>
      <div class="w-full h-auto grid grid-cols-3 md:grid-cols-6 items-start">
        <div class="h-full flex justify-end col-span-2 md:col-span-4">
          <img class="px-10" src={diagnosisDemo} />
        </div>
        <div class="col-span-1 md:col-span-2 flex justify-end items-center my-20">
          <div class="h-2/3 mr-20">
            <div class="flex flex-col">
              <div class="flex flex-row items-center">
                <div class="w-28 h-28 bg-blue-500 rounded-full flex justify-center items-center">
                  <TroubleshootIcon sx={{ fontSize: '80px', color: 'white' }} />
                </div>
                <h1 class="pl-5 text-5xl font-bold text-black">Diagnosis</h1>
              </div>
              <div class="w-full mt-5 ml-5 text-left text-4xl">
              Get live diagnosis of your x-ray images in <span class="text-theme-blue">minutes</span>            </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full h-auto grid grid-cols-1 md:grid-cols-2 items-start">
        <div class="w-full flex justify-end items-center my-20">
          <div class=" h-2/3 w-3/4 mr-20">
            <div class="flex flex-col">
              <div class="flex flex-row items-center">
                <div class="w-28 h-28 bg-blue-500 rounded-full flex justify-center items-center">
                  <QuestionAnswerIcon sx={{ fontSize: '80px', color: 'white' }} />
                </div>
                <h1 class="pl-5 text-5xl font-bold text-black">Consult</h1>
              </div>
              <div class="w-full mt-5 ml-5 text-left text-4xl">
              Ask questions directly related to your injury with <span class="text-theme-blue">real time answers </span>              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center items-center my-20">
          <img class="h-2/3 px-10" src={consultDemo} />
        </div>
      </div>

      <div class="w-full h-auto flex flex-col space-y-4 items-center my-20">
        <div class="w-2/3">
          <p class="pl-5 text-5xl font text-black mb-10">Leverage state-of-the-art AI tools to start your rehabilitation <span class="font-bold">today!</span></p>
          <div class="flex space-x-4 items-center justify-center">
            <input class="w-2/3 border-2 border-gray-300 rounded-2xl p-2" type="email" placeholder="Enter your email" />
            <button class="w-1/6 bg-blue-500 text-white rounded-2xl p-2 ">Submit</button>
          </div>
        </div>
      </div>

      <Footer />




    </div>
  );
}

export default HomePage;