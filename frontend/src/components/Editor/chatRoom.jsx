import React, { useEffect, useState } from "react";
import {
  HStack,
  VStack,
  Text,
  Avatar,
  Input,
  Button,
  Box,
} from "@chakra-ui/react";

const ChatRoom = ({ socketRef, roomId, username }) => {
  const [messages, setMessages] = useState([]); // Messages array
  const [message, setMessage] = useState(""); // Current message input

  // Fetch chat history and listen for new messages
  useEffect(() => {
    if (socketRef.current) {
      // Join the room on component mount or reconnect
      socketRef.current.emit("joinRoom", { roomId, username });
  
      // Listen for previous messages (chat history)
      socketRef.current.on("previousMessages", (chatHistory) => {
        console.log("Chat history received:", chatHistory);
        setMessages(chatHistory || []); // Update state with previous messages
      });
  
      // Listen for new messages
      socketRef.current.on("receiveMessage", (newMessage) => {
        console.log("Message received:", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]); // Add new message to the list
      });
  
      // Cleanup listeners on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.off("previousMessages");
          socketRef.current.off("receiveMessage");
        }
      };
    }
  }, [socketRef, roomId, username]);
  

  // Handle sending a message
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = { username, text: message }; // Create a message object

      // Emit the message to the server
      socketRef.current.emit("sendMessage", { roomId, message: newMessage });

      console.log("Message sent:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]); // Update the local messages array
      setMessage(""); // Clear the input field
    }
  };

  return (
    <Box
      className="chat-room"
      bg="gray.100"
      p={4}
      borderRadius="md"
      height="600px"
      overflowY="auto"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Chat Room
      </Text>

      {/* Chat Messages */}
      <VStack
        spacing={3}
        align="stretch"
        overflowY="auto"
        height="80%"
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="md"
        maxHeight="400px"
      >
      {messages.map((msg, index) => (
  <HStack key={`${msg.username}-${msg.text}-${index}`} spacing={3} align="start">
    <Avatar name={msg.username || "Unknown"} size="sm" />
    <VStack align="start" spacing={1}>
      <Text fontSize="sm" fontWeight="bold">
        {msg.username || "Anonymous"}
      </Text>
      <Text fontSize="sm">{msg.text || "nothing"}</Text>
    </VStack>
  </HStack>
))}

      </VStack>

      {/* Input and Send Button */}
      <HStack mt={4}>
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} // Send on Enter key
        />
        <Button colorScheme="green" onClick={sendMessage}>
          Send
        </Button>
      </HStack>
    </Box>
  );
};

export default ChatRoom;
