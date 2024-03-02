import React, { useState } from 'react';
import './chatpage.css';
import { useLocation } from 'react-router-dom';


const ChatScreen = () => {
  // Passing forward state from previous page
  const location = useLocation();
  const { phaseOneResult, phaseTwoResult } = location.state;
  
  const [activeFlow, setActiveFlow] = useState('Agent'); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [injury, setInjury] = useState(phaseOneResult);
  const [injuryLocation, setInjuryLocation] = useState(phaseTwoResult);
  const [flowMessage, setFlowMessage] = useState('')

  const [model, setModel] = useState('openai');

  const [data, setData] = useState('');


const sendQuery = async () => {
  if (input.trim() !== '') {
    const newMessage = { text: input, sender: 'user' };
    setMessages(messages => [...messages, newMessage]);
    setInput(''); 

    try {
      const response = await fetch('http://127.0.0.1:8000/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input.trim(), model: model }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('RAG run:', data);
        setData(data);
        const serverMessage = { text: data.response, sender: 'bot' };
        setMessages(messages => [...messages, serverMessage]); // Add new server message to the conversation
      }
    } catch (error) {
      console.error('Error running RAG:', error);
    }
  }
};


const sendFlowQuery = async (flow) => {
  if (injury.trim() == '' || injuryLocation.trim() == '') return;


  try {
    // set loading
    setFlowMessage("Loading...");
    const response = await fetch('http://127.0.0.1:8000/rag/flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ injury: injury, injury_location: injuryLocation, flow: flow, model: model }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log('RAG run:', data);
      setData(data);
      const serverMessage = { text: data.response.content, sender: 'bot' };
      setFlowMessage(serverMessage.text); // Add new server message to the conversation
    }
  } catch (error) {
    console.error('Error running RAG:', error);
  }
  
};

const sendFlowStream = async (flow) => {
  if (injury.trim() == '' || injuryLocation.trim() == '') return;
  try {
    // set loading
    setFlowMessage("Loading...");
    const response = await fetch('http://127.0.0.1:8000/rag/flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ injury: injury, injury_location: injuryLocation, flow: flow, model: model }),
    });

    const reader = response.body.getReader();
    const chunks = [];
    

  } catch (error) {
    console.error('Error running RAG:', error);
  }
  
};

  const renderActiveFlow = () => {
    switch (activeFlow) {
      case 'Agent':
          return (
            <div className="chat-screen">
              <div className="messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.sender}`}>
                    {message.text}
                  </div>
                ))}
              </div>
              <div className="input-area">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={sendQuery}>Send</button>
              </div>
            </div>
          );

      case 'Flows':
        return (
          <div className="chat-screen" style={{width:"70%"}}>
            <div className="input-area">
              <input
                type="text"
                placeholder="Injury"
                value={injury}
                onChange={(e) => setInjury(e.target.value)}
              />
            </div>
            <div className="input-area">
              <input
                type="text"
                placeholder="Injury Location"
                value={injuryLocation}
                onChange={(e) => setInjuryLocation(e.target.value)}
              />
            </div>
            <div className="input-area">
              <button onClick={() => sendFlowQuery("base")}>Base Flow</button>
              <button onClick={() => sendFlowQuery("restriction")}>Restriction Flow</button>
              <button onClick={() => sendFlowQuery("heat_ice")}>Heat & Ice Flow</button>
              <button onClick={() => sendFlowQuery("expectation")}>Expectation Flow</button>
            </div>
            <div className="messages" style={{width: "fit"}}>
              <p style={{color:"black", flex: 1, flexWrap: 'wrap'}}>{flowMessage}</p>
            </div>
        </div>
        );

      default:
        return <div>Select a flow</div>;
    }
  };

  return (
    <div>
      <div className="top-bar">
        <button onClick={() => setActiveFlow('Agent')}>General Chat Agent</button>
        <button onClick={() => setActiveFlow('Flows')}>Injury-specific Flows</button>
        {/* add more flows here */}
      </div>
      {renderActiveFlow()}
    </div>
  );
};

export default ChatScreen;
