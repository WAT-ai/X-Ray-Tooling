import React, { useState } from 'react';
import HeatIceIcon from './Icons/HeatIceIcon';
import ExpectationIcon from './Icons/ExpectationIcon';
import RestrictionIcon from './Icons/RestrictionIcon';
import BaseIcon from './Icons/BaseIcon';

const SideBar = ({flowResponse, requestStack, setRequestStack}) => {
    const [open, setOpen] = useState(false);

    const sideBarItems = [
        { symbol: <BaseIcon/>, text: 'Base', value:'base' },
        { symbol: <HeatIceIcon />, text: 'Heat and Ice', value: 'heat_ice' },
        { symbol: <ExpectationIcon/>, text: 'Expectation', value: 'expectation' },
        { symbol: <RestrictionIcon/>, text: 'Restriction', value:'restriction' },
    ]

    const handleItemClick = (item) => {
        setRequestStack(prevStack => [...prevStack, {request: {flow: item.value, requestType: 'flow'}, response: flowResponse[item.value].data}])
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
                        <div key={index} class={`p-4 hover:bg-blue-700 flex items-center cursor-pointer`} onClick={() => handleItemClick(item)}>                            <span class="mr-2" style={{ pointerEvents: 'auto' }}>{item.symbol}</span>
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