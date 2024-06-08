import React, { createContext, useState, useContext } from 'react';


const MyContext = createContext();

export function ContextProvider({ children }) {
  const [currentStep, setCurrentStep] = useState('upload');


  const value = {
    currentStep,
    setCurrentStep
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}


export function useMyContext() {
  const context = useContext(MyContext);
  return context;
}