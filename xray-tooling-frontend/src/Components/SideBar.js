import React, { useState } from 'react';

const SideBar = ({currentRequest, setCurrentRequest}) => {
    const [open, setOpen] = useState(false);

    const sideBarItems = [
        { symbol: '🏠', text: 'Base', value:'base' },
        { symbol: '🏠', text: 'Heat and Ice', value: 'heat_ice' },
        { symbol: '🏠', text: 'Expectation', value: 'expectation' },
        { symbol: '🏠', text: 'Restriction', value:'restriction' },
    ]

    const handleItemClick = (item) => {
        setCurrentRequest({flow: item.value})
    }

    return (
        <div
            class={`h-full bg-blue-500 transition-all duration-500 ease-in-out ${open ? 'w-5/6' : 'w-2/6'}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {open ? (
                <div>
                    {sideBarItems.map((item, index) => (
                        <div key={index} class="p-4 hover:bg-blue-700 flex items-center" onClick={() => handleItemClick(item)}>
                            <span class="mr-2" style={{ pointerEvents: 'auto' }}>{item.symbol}</span>
                            <span class="animate-slide-in">{item.text}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    {sideBarItems.map((item, index) => (
                        <div key={index} class="p-4 hover:bg-blue-700 flex items-center">
                            <span class="mr-2">{item.symbol}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SideBar;