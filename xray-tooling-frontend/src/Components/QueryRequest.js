import React, { useState } from 'react';
import searchIcon from '../Assets/Icons/SearchIcon.svg';
import cancelIcon from '../Assets/Icons/xIcon.svg';
import pinIcon from '../Assets/Icons/PinIcon.svg';

const QueryRequest = ({ sendQuery }) => {
    const [query, setQuery] = useState('');

    const handleSearchClick = () => {
        sendQuery(query);
        setQuery("");
    };



    return (
        <div class="rounded-3xl">
            <label for="search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg class="w-5 h-5 text-white dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <input placeholder="Have a specific question..."
                    value={query}
                    onChange={e => setQuery(e.target.value)} type="text" id="search" class="pl-12 block w-full p-4 ps-10 text-lg text-gray-100 border border-gray-600 rounded-lg bg-gray-600 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-700" required />
                <button onClick={handleSearchClick} type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
            </div>
        </div>

    );
};

export default QueryRequest;
