import React, { useEffect, useState, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import SideBar from '../../../Components/SideBar';
import Stack from '@mui/material/Stack';
import RequestResponse from '../../../Components/RequestResponse';
import QueryRequest from '../../../Components/QueryRequest'
import HeatIceIcon from '../../../Assets/Icons/HeatIceIcon.svg';
import ExpectationIcon from '../../../Assets/Icons/ExpectationIcon.svg';
import RestrictionIcon from '../../../Assets/Icons/RestrictionIcon.svg';
import BaseIcon from '../../../Assets/Icons/BaseIcon.svg';


const RagPage = ({ setStage, injury, injuryLocation }) => {

    const [requestStack, setRequestStack] = useState([]);
    const [flowResponse, setFlowResponse] = useState({
        'base': { data: '', docs: [], status: '' },
        'heat_ice': { data: '', docs: [], status: '' },
        'expectation': { data: '', docs: [], status: '' },
        'restriction': { data: '', docs: [], status: '' },
    });
    const hasSentQuery = useRef(false);
    const model = 'openai'

    useEffect(() => {
        if (!hasSentQuery.current) {
            sendAllFlowQuery();
            hasSentQuery.current = true;
        }
    }, [])

    const sendAllFlowQuery = async () => {
        sendRagQuery('expectation')
        sendRagQuery('base')
        sendRagQuery('heat_ice')
        sendRagQuery('restriction')
    }

    const sendRagQuery = async (flow) => {
        if (injury.trim() == "" || injuryLocation.trim() == "") return;

        const ctrl = new AbortController();
        console.log(flow)

        try {
            await fetchEventSource(`http://127.0.0.1:8000/rag/flow/stream/${flow}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream'
                },
                signal: ctrl.signal,
                openWhenHidden: true,
                body: JSON.stringify({
                    injury: injury,
                    injury_location: injuryLocation,
                    flow: flow,
                    model: model,
                }),
                onopen: async (res) => {
                    const contentType = res.headers.get('content-type');

                    if (!!contentType && contentType.indexOf('application/json') >= 0) {
                        throw await res.json();
                    }
                    setFlowResponse(prevResponse => ({
                        ...prevResponse,
                        [flow]: {
                            ...prevResponse[flow],
                            status: 'open'
                        }
                    }));
                },
                onclose: async (res) => {
                    console.log('finished here')
                    setFlowResponse(prevResponse => ({
                        ...prevResponse,
                        [flow]: {
                            ...prevResponse[flow],
                            status: 'completed'
                        }
                    }));
                },
                onerror: (e) => {
                    if (!!e) {
                        console.log('Fetch onerror', e);
                    }
                    throw e;
                },
                onmessage: async (ev) => {
                    const data = ev.data;

                    //in future must change this to add anything with doc-content to a docs section of flow Response
                    if (data.startsWith('doc-content:')) {
                        setFlowResponse(prevResponse => {
                            const currentFlow = prevResponse[flow] || {};
                            const currentDocs = Array.isArray(currentFlow.docs) ? currentFlow.docs : [];
                            return {
                                ...prevResponse,
                                [flow]: {
                                    ...prevResponse[flow],
                                    docs: [...currentDocs, data.replace('doc-content:', '')],
                                    status: 'open'
                                }
                            };
                        });
                        return;
                    }

                    try {
                        setFlowResponse(prevResponse => ({
                            ...prevResponse,
                            [flow]: {
                                ...prevResponse[flow],
                                data: prevResponse[flow]?.data ? prevResponse[flow].data + ' ' + data : data,
                                status: 'open'
                            }
                        }));
                    } catch (e) {
                        console.log('Fetch onmessage error', e);
                    }
                },
            })
        } catch (e) {
            console.log('Error', e);
        }
    };

    const sendQuery = async (input) => {
        if (input.trim() !== "") {

            const newMessage = { text: input, sender: "user" };
            const ctrl = new AbortController();
            setRequestStack(prevStack => [{ request: { query: input, requestType: 'query' }, response: { data: '', docs: [] } }, ...prevStack]);
            try {
                await fetchEventSource('http://127.0.0.1:8000/rag/query/stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/event-stream'
                    },
                    signal: ctrl.signal,
                    openWhenHidden: true,
                    body: JSON.stringify({
                        text: input.trim(),
                        injury: injury,
                        injury_location: injuryLocation,
                        model: model,
                    }),
                    onopen: async (res) => {
                        const contentType = res.headers.get('content-type');

                        if (!!contentType && contentType.indexOf('application/json') >= 0) {
                            throw await res.json();
                        }
                    },
                    onerror: (e) => {
                        if (!!e) {
                            console.log('Fetch onerror', e);
                        }
                        throw e;
                    },
                    onmessage: async (ev) => {
                        const data = ev.data;
                        if (!data) {
                            return;
                        }
                        if (data.startsWith('doc-content:')) {
                            setRequestStack(prevStack => {
                                return prevStack.map((item) => {
                                    if (item.request.query !== input) {
                                        return item;
                                    }
                                
                                    const updatedResponse = {
                                        ...item.response,
                                        docs: [...item.response.docs, data.replace('doc-content:', '')]
                                    };
                                
                                    return {
                                        ...item,
                                        response: updatedResponse
                                    };
                                });
                            });
                            return;
                        }
                        try {
                            const d = data;
                            setRequestStack(prevStack => {
                                return prevStack.map((item) => {
                                    if (item.request.query !== input) {
                                        return item;
                                    }
                                
                                    const updatedResponse = {
                                        ...item.response,
                                        data: item.response.data + ' ' + data
                                    };
                                
                                    return {
                                        ...item,
                                        response: updatedResponse
                                    };
                                });
                            });
                        } catch (e) {
                            console.log('Fetch onmessage error', e);
                        }
                    },

                })
            } catch (e) {
                console.log('Error', e);
            }
        };
    }

    const removeRequestFromStack = (indexToRemove) => {
        setRequestStack(prevStack => prevStack.filter((_, index) => index !== indexToRemove));

    }

    const sideBarItems = [
        { symbol: BaseIcon, text: 'Base', value: 'base', text: 'General diagnosis of injury' },
        { symbol: HeatIceIcon, text: 'Heat and Ice', value: 'heat_ice', text: 'Best practices for heating and icing' },
        { symbol: ExpectationIcon, text: 'Expectation', value: 'expectation', text: "What to expect with your injury" },
        { symbol: RestrictionIcon, text: 'Restriction', value: 'restriction', text: "What to avoid with your injury" },
    ]

    const handleFlowClick = (item) => {
        setRequestStack(prevStack => {
            const itemIndex = prevStack.findIndex(stackItem => stackItem.request.flow === item.value);

            if (itemIndex !== -1) {
                prevStack.splice(itemIndex, 1);
            }

            return [
                { request: { flow: item.value, requestType: 'flow' }, status: flowResponse[item.value].status },
                ...prevStack
            ];
        });
    }

    const handleBack = () => {
        setStage('results')
    }

    return (
        <div class="h-full flex flex-row justify-center mt-5">
            <div>
                <div onClick={handleBack} class="group flex w-26 mb-6 cursor-pointer items-center justify-center rounded-md bg-progress-green px-6 py-2 text-white hover:bg-hover-green">
                    <span class="group flex w-full items-center justify-center rounded py-1 text-center font-bold"> Back </span>
                    <svg class="flex-0 ml-4 h-6 w-6 transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </div>
            <div class="w-4/6 h-fit flex justify-center overflow-visible">

                <Stack spacing={4} class="w-5/6">

                    <QueryRequest sendQuery={sendQuery} />
                    <div class="grid grid-cols-2 gap-2 w-full mt-2 mb-10">
                        {sideBarItems.map((item, index) => (
                            <div key={index} class="relative h-[62px] flex items-center  block w-full ps-10 text-lg text-white border border-gray-600 rounded-lg bg-gray-600	 hover:bg-gray-700 hover:border-blue-500 select-none cursor-pointer" onClick={() => handleFlowClick(item)}>
                                <div class="absolute start-0 ps-3 flex items-center ">
                                    <img src={item.symbol} />
                                </div>
                                <h1 class="text-left ml-3 text-gray-100">{item.text}</h1>
                            </div>
                        ))}
                    </div>
                    {requestStack.map((queryObject, index) => (
                        <div>
                            <RequestResponse queryObject={queryObject} flowResponse={flowResponse} removeRequest={removeRequestFromStack} index={index} />
                        </div>
                    ))}


                </Stack>
            </div>



        </div>
    );
};


export default RagPage;
