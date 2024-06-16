import React, {useEffect, useState, useRef} from 'react';
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
            } else {
                console.log('ran')
                //flows
            }
            hasSentQuery.current = true;
        }

    }, [])

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
        <div>
            <p>{response}</p>
        </div>
    );
};

export default RagPage;
