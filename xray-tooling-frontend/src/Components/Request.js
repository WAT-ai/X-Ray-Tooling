import React from 'react';
import searchIcon from '../Assets/Icons/SearchIcon.svg';
import cancelIcon from '../Assets/Icons/xIcon.svg';
import pinIcon from '../Assets/Icons/PinIcon.svg';

const Request = ({ requestObj, removeRequest, index }) => {

  console.log(requestObj)

  let message;
  if (requestObj.flow === "base") {
    message = "General diagnosis of injury";
  } if (requestObj.flow === "heat_ice") {
    message = "Best practices for heating and icing"
  } if (requestObj.flow === "restriction") {
    message = "What to avoid with your injury"
  } if (requestObj.flow === "expectation") {
    message = "What to expect with your injury"
  }

  if (requestObj.requestType == "query") {
    message = requestObj.query
  }

  return (
    <div class="rounded-3xl">
      <label for="search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
      <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg class="w-5 h-5 text-white dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input
          value={message}
          readOnly
          disabled
          type="text" id="search" class="pl-12 block w-full p-4 ps-10 text-lg text-black border border-green-500 rounded-lg bg-gray-50" />
        <button class="absolute end-2.5 top-1/2 transform -translate-y-1/2" onClick={() => removeRequest(index)}>
          <img src={cancelIcon} />
        </button>
      </div>
    </div>
  );
};

export default Request;
