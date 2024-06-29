import React, { useEffect, useState, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import SideBar from '../../../Components/SideBar';
import Stack from '@mui/material/Stack';
import Response from '../../../Components/Response';


const RagPage = ({ request, injury, injuryLocation }) => {

    const [requestStack, setRequestStack] = useState([]);    
    const [flowResponse, setFlowResponse] = useState({
        'base': { data: '', docs: '' },
        'heat_ice': { data: '', docs: '' },
        'expectation': { data: '', docs: '' },
        'restriction': { data: '', docs: '' },
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
                                data: prevResponse[flow]?.data ? prevResponse[flow].data + ' ' + data : data
                            }
                        }));
                        if (flow === request.flow) {
                            setRequestStack(prevStack => {
                                if (prevStack.length === 0) {
                                    // If the stack is empty, add a new object
                                    return [{request: {flow: flow, requestType: request.requestType}, response: data}];
                                } else {
                                    // If the stack is not empty, update the data of the first object
                                    return prevStack.map((item, index) => 
                                        index === 0 ? {...item, response: item.response + ' ' + data} : item
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

    return (
        <div class="h-full flex flex-row  justify-start">
            <div class='w-1/6 h-full'>
                <SideBar requestStack={requestStack} setRequestStack={setRequestStack} flowResponse={flowResponse}/>
            </div>

            <Stack spacing={2}>
                {requestStack.map((requestObject, index) => (
                    <Response key={index} requestObject={requestObject} />
                ))}
            </Stack>
        </div>
    );
};


export default RagPage;
