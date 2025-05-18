import { useEffect, useRef, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Avatar,
  Text,
  IconButton,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";
import { v4 as uuidv4 } from "uuid";
import BASE_URL from "../../services";

const ChatRoom = ({ socketRef, roomId, username, email }) => {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef();

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BASE_URL}/chat/${roomId}`);
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch (err) {
        toast({
          title: "Error loading chat history",
          description: err.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };

    if (roomId) fetchHistory();
  }, [roomId]);

  // Socket join and listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !roomId || !username || !email) return;

    socket.emit("joinRoom", { roomId, username, email });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("clearMessages", () => {
      setMessages([]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("clearMessages");
    };
  }, [roomId, username, email, socketRef]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !selectedFile) return;

    let fileUrl = null;
    let fileType = null;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch(`${BASE_URL}/file_upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("File upload failed");

        const uploaded = await res.json();
        fileUrl = uploaded.fileUrl;
        fileType = uploaded.fileType;
      }

      const newMessage = {
        id: uuidv4(),
        username,
        text: messageText.trim(),
        fileUrl,
        fileType,
        date: new Date().toISOString(),
      };

      // Only emit — do not locally update messages, server will emit back
      socketRef.current.emit("sendMessage", { roomId, message: newMessage });

      setMessageText("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast({
        title: "Failed to send message",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const renderFile = (msg) => {
    if (!msg.fileUrl) return null;

    if (msg.fileType?.startsWith("image/")) {
      return (
        <img
          src={msg.fileUrl}
          alt="uploaded"
          style={{ maxWidth: "200px", borderRadius: "8px" }}
        />
      );
    }

    if (msg.fileType === "application/pdf") {
      return (
        <a href={msg.fileUrl} target="_blank" rel="noreferrer">
          <Button size="sm" colorScheme="blue" mt={1}>
            View PDF
          </Button>
        </a>
      );
    }

    return (
      <a href={msg.fileUrl} download>
        <Button size="sm" colorScheme="gray" mt={1}>
          Download File
        </Button>
      </a>
    );
  };

  return (
    <Box bg="gray.100" p={4} borderRadius="lg" h="100%" maxH="100vh">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Chat Room: {roomId}
      </Text>

      <VStack
        spacing={3}
        align="stretch"
        bg="white"
        p={4}
        borderRadius="md"
        overflowY="auto"
        maxH="70vh"
      >
        {messages.map((msg, index) => (
          <Box
            key={msg._id || msg.id || index}
            p={3}
            bg="gray.50"
            borderRadius="md"
            boxShadow="sm"
          >
            <HStack align="start">
              <Avatar name={msg.username} size="sm" />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="bold">
                  {msg.username}
                </Text>
                {msg.text && (
                  <Text fontSize="sm">{msg.text}</Text>
                )}
                {renderFile(msg)}
                {msg.date && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {new Date(msg.date).toLocaleString()}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      <Divider my={4} />

      <HStack>
        <Input
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <input
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          id="file-upload"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <IconButton
            icon={<AttachmentIcon />}
            as="span"
            variant="outline"
            colorScheme={selectedFile ? "green" : "gray"}
          />
        </label>
        <Button colorScheme="green" onClick={sendMessage}>
          Send
        </Button>
      </HStack>
    </Box>
  );
};

export default ChatRoom;
