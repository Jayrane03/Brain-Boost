import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "../../Styles/editor_page.css";
import { initSocket } from "../../socket";
import {
  HStack,
  Stack,
  Text,
  Avatar,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
  Button,
} from "@chakra-ui/react";
import BASE_URL from "../../services";

const EditorPage = () => {
  const { roomId } = useParams(); // Extract roomId from URL
  const location = useLocation();
  const [users, setUsers] = useState([]); // Dynamic user list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const socketRef = useRef(null);
  const username = location.state?.username || "Guest"; // Extract username from state or use "Guest"

  // Initialize socket connection
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        socketRef.current = await initSocket();

        // Handle socket connection errors
        socketRef.current.on("connect_error", () => {
          setError("Failed to connect to the server. Please try again.");
        });

        socketRef.current.on("connect_failed", () => {
          setError("Failed to connect to the server. Please try again.");
        });

        // Emit join event with roomId and username
        socketRef.current.emit("joinRoom", { roomId, username });

        // Listen for updates when a user joins the room
        socketRef.current.on("updateUsers", (updatedUsers) => {
          setUsers(updatedUsers);
          setSuccess(`${username} joined the room successfully.`);
          setTimeout(() => setSuccess(null), 2000); // Clear success message after 2 seconds
        });

        // Listen for user disconnections
        socketRef.current.on("user-left", ({ clients, username: leftUser }) => {
          setUsers(clients);
          setSuccess(`${leftUser} left the room.`);
          setTimeout(() => setSuccess(null), 2000); // Clear success message after 2 seconds
        });

        setLoading(false);
      } catch (err) {
        console.error("Initialization Error:", err);
        setError("Something went wrong during initialization.");
        setTimeout(() => setError(null), 2000); // Clear error message after 2 seconds
        setLoading(false);
      }
    };

    init();

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, username]);

  // Optional: Also add a global useEffect for error/success
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const exitRoom = () => {
    window.location.href = "/room";
  };

  return (
    <div className="editor-page-container">
      {success && (
        <div className="success_alert">
          <Alert status="success" mb={4}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Box>
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setSuccess("")}
            />
          </Alert>
        </div>
      )}
      {/* Alerts for error and success */}
      {error && (
        <div className="success_alert">
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setError("")}
            />
          </Alert>
        </div>
      )}

      {/* Left Side: User Dashboard */}
      <div className="dashboard">
        <h2>Users in Room</h2>
        <div>
          {users.map((user) => (
            <Stack key={user.socketId} spacing={4} marginBottom={4}>
              <HStack spacing={4} align="center">
                <Avatar name={user.username} size="lg" />
                <Stack spacing={0}>
                  <Text fontWeight="medium">{user.username}</Text>
                </Stack>
              </HStack>
            </Stack>
          ))}
        </div>

        <div className="editor-buttons d-flex justify-content-center position-absolute bottom-0 w-75">
          <Button
            colorScheme="green"
            isLoading={loading}
            loadingText="Joining..."
            className="m-1"
            disabled
          >
            Join
          </Button>
          <Button colorScheme="red" className="m-1" onClick={exitRoom}>
            Exit Room
          </Button>
        </div>
      </div>

      {/* Right Side: Code Editor */}
      <div className="editor">
        <h2>Code Editor</h2>
        {/* Add your code editor component here */}
      </div>
    </div>
  );
};

export default EditorPage;
