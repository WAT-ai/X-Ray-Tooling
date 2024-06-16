import React, {useEffect, useState, useRef} from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const RagPage = ({ request, injury, injuryLocation }) => {

    //Check if request is for flow, or query
    const [response, setResponse] = useState('')
    const hasSentQuery = useRef(false);
    const [flowData, setFlowData] = useState({
        base: "",
        restriction: "",
        heat_ice: "",
        expectation: "",
    });
    const [flowDocs, setFlowDocs] = useState({
        base: [],
        restriction: [],
        heat_ice: [],
        expectation: [],
      });
    const [flowMessage, setFlowMessage] = useState("");
    const [data, setData] = useState("");
    const model = 'openai'

      


    //If it is query, get the query message, and send sendQuery request as soon as rendered
    useEffect(() => {
        if (!hasSentQuery.current) {
            if (request.requestType === 'query') {
                sendFlows(request.message)
            } else {
                sendQuery(request.message)
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


  const sendFlows = async (flows) => {
    if (injury.trim() == '' || injuryLocation.trim() == '') return;

    try {
      // set loading
      setFlowMessage("Loading...");
      const response = await fetch('http://127.0.0.1:8000/rag/flow/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ injury: injury, injury_location: injuryLocation, flows: flows, model: model }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('RAG run:', data);
        setData(data);
        
        console.log(data.responses.length);
        var fData = {};
        var fDocs = {};


      
        for (let i = 0; i < data.responses.length; i++){
          fData[data.responses[i][0]] = data.responses[i][1][0].content;
          fDocs[data.responses[i][0]] = data.responses[i][1][1].map((doc) => doc.page_content);

        }
        

        setFlowData(fData);
        setFlowDocs(fDocs);

        console.log("FData: ",fData);
        console.log("FDocs: ",fDocs);


      }
    } catch (error) {
      console.error('Error running RAG:', error);
    }
    
  };




    return (
        <div>
            <p>{response}</p>
        </div>
    );
};

export default RagPage;
