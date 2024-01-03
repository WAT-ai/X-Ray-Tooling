import React, { useState } from 'react';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [data, setdata] = useState('');
  // Function to handle sending messages
  const sendMessage = async () => {
    // Logic to send messages to backend or service
    // For demo purposes, we'll just add the message to the state
    if (input.trim() !== '') {
      setMessages([...messages, { text: input, sender: 'user' }]);
      //setInput('');
    }
    console.log('input', input);
    // const formData = new FormData();
    // formData.append('text', input.trim());
    //console.log('formData', formData);
    try {
      const response = await fetch('http://127.0.0.1:8000/RAG', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set appropriate content type
        },
        body: JSON.stringify({ text: input.trim() }),
      });
      if(response.ok) {
        const data = await response.json();
        console.log('RAG run:', data);
        setdata(data);
      }
    }
    catch (error) {
      console.error('Error running RAG:', error);
      // Handle error
    }
    setInput('');
    
  };

  return (
    <div className="chat-screen">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={message.sender === 'user' ? 'message user' : 'message'}>
            {data.results}
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
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatScreen;
