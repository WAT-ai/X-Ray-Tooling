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


const RagPage = ({ request, injury, injuryLocation }) => {

    const [requestStack, setRequestStack] = useState([]);
    const [flowResponse, setFlowResponse] = useState({
        'base': { data: '', docs: '', status: '' },
        'heat_ice': { data: '', docs: '', status: '' },
        'expectation': { data: '', docs: '', status: '' },
        'restriction': { data: '', docs: '', status: '' },
    });
    const [queryResponse, setQueryResponse] = useState('');
    const hasSentQuery = useRef(false);
    const model = 'openai'

    useEffect(() => {
        if (!hasSentQuery.current) {
            if (request.requestType === 'query') {
                sendQuery(request.message)
            }
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
                    if (!data || data.startsWith('doc-content:')) {
                        return;
                    }
                    try {
                        setFlowResponse(prevResponse => ({
                            ...prevResponse,
                            [flow]: {
                                data: prevResponse[flow]?.data ? prevResponse[flow].data + ' ' + data : data,
                                status: 'open'
                            }
                        }));
                        if (flow === request.flow) {
                            setRequestStack(prevStack => {
                                if (prevStack.length === 0) {
                                    // If the stack is empty, add a new object
                                    return [{ request: { flow: flow, requestType: request.requestType }, response: data, status: 'open' }];
                                } else {
                                    // If the stack is not empty, update the data of the first object
                                    return prevStack.map((item, index) =>
                                        index === 0 ? { ...item, response: item.response + ' ' + data, status: 'open' } : item
                                    );
                                }
                            });
                        }
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
            setRequestStack(prevStack => [...prevStack, { request: { query: input, requestType: 'query' }, response: '' }]);

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
                        try {
                            const d = data;
                            setQueryResponse(prevResponse => prevResponse + ' ' + d)
                            setRequestStack(prevStack => {
                                // Update the response of the last object
                                const lastObjectIndex = prevStack.length - 1;
                                return prevStack.map((item, i) =>
                                    i === lastObjectIndex ? { ...item, response: item.response + ' ' + data } : item
                                );
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

    const handleItemClick = (item) => {
        setRequestStack(prevStack => [
            { request: { flow: item.value, requestType: 'flow' }, response: flowResponse[item.value].data, status: flowResponse[item.value].status },
            ...prevStack
        ]);
    }

    return (
        <div class="h-full flex flex-row justify-center mt-5">
            {/* <div class='w-1/6 h-full'>
                <SideBar requestStack={requestStack} setRequestStack={setRequestStack} flowResponse={flowResponse} />
            </div> */}

            <div class="w-4/6 h-full flex justify-center">
                <Stack spacing={4} class="w-5/6">
                    <QueryRequest sendQuery={sendQuery} />
                    <div class="grid grid-cols-2 gap-2 w-full mt-2 mb-10">
                        {sideBarItems.map((item, index) => (
                            <div key={index} class="relative h-[62px] flex items-center  block w-full ps-10 text-lg text-white border border-gray-600 rounded-lg bg-gray-600	 hover:bg-gray-700 hover:border-blue-500 select-none" onClick={() => handleItemClick(item)}>
                                <div class="absolute start-0 ps-3 flex items-center ">
                                    <img src={item.symbol} />
                                </div>
                                <h1 class="text-left ml-3 text-gray-100">{item.text}</h1>
                            </div>
                        ))}
                    </div>
                    {requestStack.map((queryObject, index) => (
                        <div>
                            <RequestResponse queryObject={queryObject} removeRequest={removeRequestFromStack} index={index} />
                        </div>
                    ))}


                </Stack>
            </div>


        </div>
    );
};


export default RagPage;
