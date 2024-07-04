import React, { useState } from 'react';
import HeatIceIcon from '../Assets/Icons/HeatIceIcon.svg';
import ExpectationIcon from '../Assets/Icons/ExpectationIcon.svg';
import RestrictionIcon from '../Assets/Icons/RestrictionIcon.svg';
import BaseIcon from '../Assets/Icons/BaseIcon.svg';

const SideBar = ({flowResponse, requestStack, setRequestStack}) => {
    const [open, setOpen] = useState(false);

    const sideBarItems = [
        { symbol: <img src={BaseIcon} />, text: 'Base', value:'base' },
        { symbol: <img src={HeatIceIcon} />, text: 'Heat and Ice', value: 'heat_ice' },
        { symbol: <img src={ExpectationIcon} />, text: 'Expectation', value: 'expectation' },
        { symbol: <img src={RestrictionIcon} />, text: 'Restriction', value:'restriction' },
    ]

    const handleItemClick = (item) => {
        setRequestStack(prevStack => [...prevStack, {request: {flow: item.value, requestType: 'flow'}, response: flowResponse[item.value].data, status: flowResponse[item.value].status}])
    }

    return (
        <div
            class={`h-full bg-blue-500 transition-all duration-500 ease-in-out ${open ? 'w-5/6' : 'w-2/6'}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {open ? (
                <div class="">
                    {sideBarItems.map((item, index) => (
                        <div key={index} class={`p-4 hover:bg-blue-700 flex items-center cursor-pointer`} onClick={() => handleItemClick(item)}><span class="mr-2" style={{ pointerEvents: 'auto' }}>{item.symbol}</span>
                            <span class="animate-slide-in whitespace-nowrap overflow-hidden text-left">{item.text}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div class="">
                    {sideBarItems.map((item, index) => (
                        <div key={index} class={`p-4 hover:bg-blue-700 flex items-center`}>
                            <span class="mr-2">{item.symbol}</span>
                            
                        </div>
                    ))}
                </div>
                
            )}
        </div>
    );
};

export default SideBar;