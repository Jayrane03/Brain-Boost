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
import BASE_URL from "../../services"; // Make sure this is correctly set

const ChatRoom = ({ roomId, username }) => {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef();

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BASE_URL}/chat/${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        toast({
          title: "Load Error",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (roomId) fetchMessages();
  }, [roomId, toast]);

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

        const fileData = await res.json();
        fileUrl = fileData.fileUrl;
        fileType = fileData.fileType;
      }

      const res = await fetch(`${BASE_URL}/chat/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          text: messageText.trim(),
          fileUrl,
          fileType,
        }),
      });

      if (!res.ok) throw new Error("Message send failed");

      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);

      setMessageText("");
      setSelectedFile(null);
      fileInputRef.current.value = "";
    } catch (err) {
      toast({
        title: "Send Failed",
        description: err.message,
        status: "error",
        duration: 3000,
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
          style={{ maxWidth: "200px", borderRadius: "8px", marginTop: "8px" }}
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

    return null;
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
            key={msg._id || index}
            p={3}
            bg="gray.50"
            borderRadius="md"
            boxShadow="sm"
          >
            <HStack align="start">
              <Avatar name={msg.username} size="sm" />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold">
                  {msg.username}
                </Text>
                <Text fontSize="sm" wordBreak="break-word">
                  {msg.text}
                </Text>
                {renderFile(msg)}
                <Text fontSize="xs" color="gray.500">
                  {new Date(msg.date).toLocaleString()}
                </Text>
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
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <IconButton
            icon={<AttachmentIcon />}
            as="span"
            aria-label="Attach file"
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
