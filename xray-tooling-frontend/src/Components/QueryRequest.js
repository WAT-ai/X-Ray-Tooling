import React from 'react';
import searchIcon from '../Assets/Icons/SearchIcon.svg';
import cancelIcon from '../Assets/Icons/xIcon.svg';
import pinIcon from '../Assets/Icons/PinIcon.svg';

const QueryRequest = () => {


    return (
        <div class="flex justify-between bg-response-grey w-full h-[80px] rounded-3xl border-[2px]">
            <div class="flex justify-center items-center ml-8">
                <input class="text-2xl border rounded p-2" type="text" placeholder="Have a specific question..." />
            </div>

            <div class="w-1/12 min-w-[80px] flex justify-center items-center pl-5">
                <img src={searchIcon} alt="searchIcon" />
            </div>

        </div>
    );
};

export default QueryRequest;
