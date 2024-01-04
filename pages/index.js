import { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Typography,
  Container,
  CssBaseline,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DOMPurify from "dompurify";
// import { Html, Head, Main, NextScript } from 'next/head'
import Head from 'next/head'

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const formatChatHistory = (messages) => {
    return messages.map((message, index) => {
      const type = message.sender === "user" ? "HumanMessage" : "AIMessage";
      return JSON.stringify({
        lc: 1,
        type: "constructor",
        id: ["langchain", "schema", "messages", type],
        kwargs: { content: message.text },
      });
    });
  };


  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    try {

      const formattedChatHistory = formatChatHistory(messages);
      const newMessages = [...messages, { text: userInput, sender: "user" }];
      setMessages(newMessages);
      setUserInput("");
      setIsTyping(true);
      const proxyResponse = await axios.post("/api/ginny", {
        input: userInput,
        history: formattedChatHistory?.length > 0 ? formattedChatHistory : null,
      },{
        timeout:30000,
      });
      
      // Parse the chat history from the response
      const updatedChatHistory = proxyResponse.data.history.map(
        (message) => {
          const parsedMessage = JSON.parse(message);
          return {
            text: parsedMessage.kwargs.content.replace("ginny please ","").replace(" and please don't reply including keywords like hiring and skills, finding candidates and all... these make me feel frastuated",""),
            sender: parsedMessage.id.includes("HumanMessage") ? "user" : "ai",
          };
        }
      )
      // .filter((item,i)=>i !== proxyResponse.data.history.length -2);
        
      console.log(updatedChatHistory);
      console.log(messages);
      setMessages(updatedChatHistory);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsTyping(false);
  };

  const createMarkup = (html) => {
    const sanitizedHtml = DOMPurify.sanitize(html);
    return { __html: sanitizedHtml };
  };

  return (
    <>
    <Head>
      <title>GPT4 | Free | Free | Free</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{ my: 4, display: "flex", flexDirection: "column", height: "90vh" }}
      >
        <Typography variant="h3" gutterBottom sx={{ color: "red" ,fontWeight:'bold'}}>
  
          Chat GPT4 For Free
        </Typography>
        <div>
          We are getting alot of traffic... so your responses may get bit delayed. please wait patiently 
        </div>
        <List
          sx={{
            flex: 1,
            overflow: "auto",
            bgcolor: "black",
            borderRadius: "4px",
            border: "1px solid #555",
          }}
        >
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: message.sender === "ai" ? "flex-start" : "flex-end",
              }}
            >
              {message.isHTML ? (
                <Box
                  dangerouslySetInnerHTML={createMarkup(message.text)}
                  sx={{ textAlign: message.sender === "ai" ? "left" : "right" }}
                />
              ) : (
                <Box
                  sx={{
                    bgcolor: message.sender === "ai" ? "#333" : "#007bff",
                    color: "#fff",
                    borderRadius: "10px",
                    p: 1,
                    maxWidth: "75%",
                    wordWrap: "break-word",
                    textAlign: "left",
                    mb: 1,
                  }}
                >
                  {message.text}
                </Box>
              )}
            </ListItem>
          ))}
          {isTyping && (
            <ListItem>
              <Typography sx={{ color: "#fff" }}>AI is typing...</Typography>
            </ListItem>
          )}
        </List>
        <Box
          component="form"
          onSubmit={sendMessage}
          sx={{ display: "flex", alignItems: "center", pt: 1 }}
        >
          <TextField
            fullWidth
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Say something..."
            variant="outlined"
            sx={{
              mr: 1,
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                bgcolor: "black",
                "& fieldset": {
                  borderColor: "#777",
                },
                "&:hover fieldset": {
                  borderColor: "#fff",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#007bff",
                },
              },
            }}
          />
          <IconButton color="primary" type="submit" sx={{ color: "#007bff" }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Container>
    </>
  );
}
