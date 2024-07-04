import React from 'react';
import searchIcon from '../Assets/Icons/SearchIcon.svg';
import cancelIcon from '../Assets/Icons/xIcon.svg';
import pinIcon from '../Assets/Icons/PinIcon.svg';

const Request = ({ requestObj, removeRequest, index }) => {


  let message;
  if (requestObj.flow === "base") {
    message = "General diagnosis of injury";
  }if(requestObj.flow === "heat_ice"){
    message = "Best practices for heating and icing"
  }if(requestObj.flow === "restriction"){
    message = "What to avoid with your injury"
  }if(requestObj.flow === "expectation"){
    message = "What to expect with your injury"
  }

  return (
    <div class="flex justify-between bg-response-grey w-full h-[80px] rounded-3xl border-[2px] border-green-600">
      <div class="flex items-center space-x-4">
        <div class="w-1/12 min-w-[80px] flex justify-center items-center pl-5">
          <img src={searchIcon} alt="searchIcon" />
        </div>
        <div class="flex justify-center items-center">
          <h1 class="text-2xl">{message}</h1>
        </div>
      </div>
      <div class="mr-4 mt-2">
        <button class=" hover:bg-gray-300 transition-colors duration-200 rounded" onClick={() => removeRequest(index)}>
          <img class="h-[28px] w-[28px]" src={cancelIcon} />
        </button>
      </div>
    </div>
  );
};

export default Request;
