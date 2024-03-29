import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Box,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
} from "@mui/material";
import "./chatpage.css";

const ChatScreen = () => {
  // Passing forward state from previous page
  const location = useLocation();
  const { phaseOneResult, phaseTwoResult } = location.state;

  const [activeFlow, setActiveFlow] = useState("Agent");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [injury, setInjury] = useState(phaseOneResult);
  const [injuryLocation, setInjuryLocation] = useState(phaseTwoResult);
  const [flowData, setFlowData] = useState({
    base: "",
    restriction: "",
    heat_ice: "",
    expectation: "",
  });
  const [flowMessage, setFlowMessage] = useState("");

  const [model, setModel] = useState("openai");

  const [data, setData] = useState("");

  let navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  const [chatDocs, setChatDocs] = useState([]);
  const [flowDocs, setFlowDocs] = useState({
    base: [],
    restriction: [],
    heat_ice: [],
    expectation: [],
  });

  const [activeDocs, setActiveDocs] = useState([]);

  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    console.log("ChatDocs: ", chatDocs);
  }, [chatDocs]);

  React.useEffect(() => {
    console.log("FlowDocs: ", flowDocs);
  }, [flowDocs]);

  // React.useEffect(() => {
  //   console.log("isSaved: ", isSaved);
  //   if (injury.trim() === "" || injuryLocation.trim() === "") return;
  //   const flowTypes = ["base", "restriction", "heat_ice", "expectation"];
  //   flowTypes.forEach((flowType) => {
  //     sendFlowQuery(flowType);
  //   });
  // }, [isSaved]);

  // render flows beforehand
  useEffect(() => {
    if (injury.trim() === '' || injuryLocation.trim() === '') return;
    const flowTypes = ['base', 'restriction', 'heat_ice', 'expectation'];
    // testing
  

    console.log("isSaved: ", isSaved);

    sendFlows(flowTypes);

    // flowTypes.forEach((flowType) => {
    //   sendFlowQuery(flowType);
    // });

  }, [isSaved]);


  //branch test
  const sendQuery = async () => {
    if (input.trim() !== "") {
      const newMessage = { text: input, sender: "user" };
      setMessages((messages) => [...messages, newMessage]);
      setInput("");

      try {
        const response = await fetch("http://127.0.0.1:8000/rag/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: input.trim(), model: model }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log("RAG run:", data);
          setData(data);
          const serverMessage = { text: data.response[0], sender: "bot" };
          setChatDocs(data.response[1].map((doc) => doc.page_content));
          setMessages((messages) => [...messages, serverMessage]); // Add new server message to the conversation
          console.log(messages);
        }
      } catch (error) {
        console.error("Error running RAG:", error);
      }
    }
  };

  const handleSave = (event) => {
    setFlowDocs({ base: [], restriction: [], heat_ice: [], expectation: [] });
    setActiveDocs([]);
    setFlowData({
      base: "",
      restriction: "",
      heat_ice: "",
      expectation: "",
    });
    setIsSaved(!isSaved);
  };

  const renderBaseDocs = (chatDocs) => {
    // Check if chatDocs is empty and return a message or null to avoid rendering empty container
    if (!chatDocs.length) {
      return (
        <>
          <Typography sx={{ color: "black", fontSize: "20apx" }}>
            {" "}
            No Relevant Documents Found
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography sx={{ color: "black", fontSize: "20apx" }}>
          Relevant Documents
        </Typography>
        {chatDocs.map((doc, index) => (
          <div key={index} className={`message flow`}>
            {doc}
          </div>
        ))}
      </>
    );
  };

  const sendFlowQuery = async (flow) => {
    if (injury.trim() == "" || injuryLocation.trim() == "") return;

    try {
      // set loading
      setFlowMessage("Loading...");
      const response = await fetch("http://127.0.0.1:8000/rag/flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          injury: injury,
          injury_location: injuryLocation,
          flow: flow,
          model: model,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("RAG run:", data);
        setData(data);
        console.log(flow);
        setFlowData((prevFlowData) => ({
          ...prevFlowData,
          [flow]: data.response[0].content,
        }));
        setFlowDocs((prevFlowDocs) => ({
          ...prevFlowDocs,
          [flow]: data.response[1].map((doc) => doc.page_content),
        }));
        console.log(flowData);
      }
    } catch (error) {
      console.error("Error running RAG:", error);
    }
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


  const renderFlowDocs = (flowDocs) => {
    // Check if flowDocs is empty and return a message or null to avoid rendering empty container
    if (!flowDocs.length) {
      return (
        <>
          <Typography sx={{ color: "black", fontSize: "20apx" }}>
            {" "}
            No Relevant Documents Found
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography sx={{ color: "black", fontSize: "20apx" }}>
          Relevant Documents
        </Typography>
        {flowDocs.map((doc, index) => (
          <div key={index} className={`message flow`}>
            {doc}
          </div>
        ))}
      </>
    );
  };

  const renderActiveFlow = () => {
    switch (activeFlow) {
      case "Agent":
        return (
          // give it a heading that says "Chatbot"
          (
            <Card
              sx={{
                boxShadow: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                mt: 4,
              }}
            >
              <CardContent sx={{ width: "60%" }}>
                <Typography
                  variant="h5"
                  sx={{ boxShadow: "none", fontWeight: "Bold", mb: 2 }}
                >
                  Chatbot
                </Typography>
              </CardContent>
            </Card>
          ),
          (
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
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendQuery();
                    }
                  }}
                />
                <button onClick={sendQuery}>Send</button>
              </div>
            </div>
          )
        );

      case "Flows":
        return (
          <div className="chat-screen">
            <Card
              sx={{
                boxShadow: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                mt: 4,
              }}
            >
              <CardContent sx={{ width: "60%" }}>
                <Typography
                  variant="h5"
                  sx={{ boxShadow: "none", fontWeight: "Bold", mb: 2 }}
                >
                  Injury Flows
                </Typography>
                <Box
                  sx={{ borderRadius: "8px", border: "2px solid #ccc", p: 3 }}
                >
                  <FormControl
                    component="fieldset"
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <TextField
                      label="Injury"
                      variant="outlined"
                      value={injury}
                      onChange={(e) => setInjury(e.target.value)}
                      margin="normal"
                      fullWidth
                    />
                    <TextField
                      label="Injury Location"
                      variant="outlined"
                      value={injuryLocation}
                      onChange={(e) => setInjuryLocation(e.target.value)}
                      margin="normal"
                      fullWidth
                    />
                    <Button onClick={handleSave}>Save</Button>
                    <RadioGroup
                      value={selectedOption}
                      onChange={handleSelectChange}
                      sx={{ mt: 2 }}
                    >
                      <FormControlLabel
                        value="base"
                        control={<Radio sx={{ color: "black" }} />}
                        label={
                          <Typography
                            variant="body1"
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{ fontSize: "1.0em", fontWeight: "bold" }}
                            >
                              Base
                            </span>
                            <span style={{ fontSize: "0.8em", color: "grey" }}>
                              Great for general diagnosis on the injury
                            </span>
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="restriction"
                        control={<Radio sx={{ color: "black" }} />}
                        label={
                          <Typography
                            variant="body1"
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{ fontSize: "1.0em", fontWeight: "bold" }}
                            >
                              Restriction
                            </span>
                            <span style={{ fontSize: "0.8em", color: "grey" }}>
                              Describes things to avoid depending on the injury
                            </span>
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="heat_ice"
                        control={<Radio sx={{ color: "black" }} />}
                        label={
                          <Typography
                            variant="body1"
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{ fontSize: "1.0em", fontWeight: "bold" }}
                            >
                              Heat & Ice
                            </span>
                            <span style={{ fontSize: "0.8em", color: "grey" }}>
                              Provides information best practices for heating
                              and icing
                            </span>
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="expectation"
                        control={<Radio sx={{ color: "black" }} />}
                        label={
                          <Typography
                            variant="body1"
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{ fontSize: "1.0em", fontWeight: "bold" }}
                            >
                              Expectation
                            </span>
                            <span style={{ fontSize: "0.8em", color: "grey" }}>
                              Reports on the typical time of recovery as well as
                              surgery expectations
                            </span>
                          </Typography>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                  {/* <Button variant="contained" onClick={renderFlowMessage}>Get Response</Button> */}
                </Box>
              </CardContent>
            </Card>
            <div className="messages">
              <div className={`message flow`}>{flowMessage}</div>
              {activeFlow === "Flows"
                ? renderFlowDocs(activeDocs)
                : renderBaseDocs(chatDocs)}
            </div>
          </div>
        );

      default:
        return <div>Select a flow</div>;
    }
  };

  const handleRAG = () => {
    navigate("/RAG");
  };

  const handleLogin = () => {
    navigate("/Login");
  };

  const handleSelectChange = (event) => {
    const newSelectedOption = event.target.value;
    setSelectedOption(newSelectedOption);
    setFlowMessage(flowData[newSelectedOption]);
    setActiveDocs(flowDocs[newSelectedOption]);
    console.log(flowMessage);
  };

  const handleResults = () => {
    navigate("/Results");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      {/* <div className="top-bar">
        <button onClick={() => setActiveFlow('Agent')}>General Chat Agent</button>
        <button onClick={() => setActiveFlow('Flows')}>Injury-specific Flows</button>
        {/* add more flows here */}
      {/* </div>
      {renderActiveFlow()} */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "white",
          height: "65px",
          width: "100%",
          borderBottom: "none",
          boxShadow: "none",
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "none",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ color: "black", marginTop: "5px", fontWeight: "bold" }}
          >
          <span style={{ color: '#4686ee', fontSize: 28 }}>X</span>
          <span style={{ color: 'black', fontSize:28 }}>Care</span>
          </Typography>
          <div
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              color="inherit"
              sx={{ color: "black", marginRight: "16px" }}
              onClick={handleResults}
            >
              Results
            </Button>
            <Button
              color="inherit"
              sx={{ color: "black", marginLeft: "16px" }}
              onClick={handleRAG}
            >
              Rehabilitation
            </Button>
          </div>
          <Button
            color="inherit"
            onClick={handleLogin}
            sx={{
              color: "white",
              backgroundColor: "#4686ee",
              borderRadius: "20px",
              width: "100px",
              "&:hover": { backgroundColor: "grey" },
            }}
          >
            Log In
          </Button>
        </Toolbar>
      </AppBar>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "2%" }}
      >
        <Button variant="contained" onClick={() => setActiveFlow("Agent")}>
          General Chat Agent
        </Button>
        <Button variant="contained" onClick={() => setActiveFlow("Flows")}>
          Other Flows
        </Button>
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "2%" }}
      >
        {renderActiveFlow()}
      </div>
    </div>
  );
};
export default ChatScreen;
