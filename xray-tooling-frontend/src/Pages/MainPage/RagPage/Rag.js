import React, { useEffect, useState, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const RagPage = ({ request, injury, injuryLocation }) => {

    //Check if request is for flow, or query
    const [response, setResponse] = useState('')
    const hasSentQuery = useRef(false);
    const model = 'openai'




    //If it is query, get the query message, and send sendQuery request as soon as rendered
    useEffect(() => {
        if (!hasSentQuery.current) {
            if (request.requestType === 'query') {
                sendQuery(request.message)
            } else if (request.requestType === 'flow') {
                sendRagQuery(request.flow)
            }
            hasSentQuery.current = true;
        }

    }, [])

    const sendRagQuery = async (flow) => {
        if (injury.trim() == "" || injuryLocation.trim() == "") return;

        const ctrl = new AbortController();

        try {
            await fetchEventSource('http://127.0.0.1:8000/rag/flow/stream', {
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
                        // do something with this error
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
                        console.log(d)
                        setResponse(prevResponse => prevResponse + ' ' + d)
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
                            console.log(d)
                            setResponse(prevResponse => prevResponse + ' ' + d)
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
        <div class="h-full flex flex-col items-center">
            <div class=" w-4/6 bg-gray-200 text-left p-4">
                <p>{response}</p>
            </div>
            
        </div>
    );
};


export default RagPage;
