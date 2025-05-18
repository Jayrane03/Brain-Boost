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
} from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";
import { v4 as uuidv4 } from "uuid";
import BASE_URL from "../../services";

const ChatRoom = ({ socketRef, roomId, username }) => {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !roomId || !username) return;

    socket.emit("joinRoom", { roomId, username });

    socket.on("previousMessages", (chatHistory) => {
      if (Array.isArray(chatHistory)) {
        setMessages(chatHistory);
      } else {
        setMessages([]);
        console.error("Invalid chat history received:", chatHistory);
      }
    });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
    };
  }, [roomId, username, socketRef]);

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
        roomId,
        from: [username],
        message: messageText.trim(),
        fileUrl,
        fileType,
        date: new Date(),
      };

      socketRef.current.emit("sendMessage", { roomId, message: newMessage });

      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
      setSelectedFile(null);
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
          <Button size="sm" colorScheme="blue" p={4}>
            View PDF
          </Button>
        </a>
      );
    }

    return null;
  };

  return (
    <Box bg="gray.50" p={4} borderRadius="lg" h="100%" maxH="100vh">
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
        {Array.isArray(messages) &&
          messages.map((msg) => (
            <HStack key={msg._id || msg.id} align="start">
              <Avatar name={msg.from?.[0]} size="sm" />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold">
                  {msg.from?.[0]}
                </Text>
                {typeof msg.message === "string" && (
                  <Text fontSize="sm">{msg.message}</Text>
                )}
                {renderFile(msg)}
              </VStack>
            </HStack>
          ))}
        <div ref={messagesEndRef} />
      </VStack>

      <HStack mt={4}>
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
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <IconButton icon={<AttachmentIcon />} as="span" />
        </label>
        <Button colorScheme="green" onClick={sendMessage}>
          Send
        </Button>
      </HStack>
    </Box>
  );
};

export default ChatRoom;
