import { useEffect, useRef, useState } from "react";
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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import ChatRoom from "../Editor/chatRoom";

const EditorPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const socketRef = useRef(null);

  // ✅ Extract user data from location.state
  const username = location.state?.username || "Guest";
  const email = location.state?.email || "guest@example.com";

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        socketRef.current = await initSocket(username);

        socketRef.current.on("connect_error", () => {
          setError("Failed to connect to the server. Please try again.");
        });

        socketRef.current.on("connect_failed", () => {
          setError("Failed to connect to the server. Please try again.");
        });

        // ✅ Emit joinRoom with email
        socketRef.current.emit("joinRoom", { roomId, username, email });

        socketRef.current.on("updateUsers", (updatedUsers) => {
          setUsers(updatedUsers);
          setSuccess(`${username} joined the room successfully.`);
          setTimeout(() => setSuccess(null), 2000);
        });

        socketRef.current.on("user-left", ({ clients, username: leftUser }) => {
          setUsers(clients);
          setSuccess(`${leftUser} left the room.`);
          setTimeout(() => setSuccess(null), 2000);
        });

        setLoading(false);
      } catch (err) {
        console.error("Initialization Error:", err);
        setError("Something went wrong during initialization.");
        setTimeout(() => setError(null), 2000);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, username, email]);

  const exitRoom = () => {
    window.location.href = "/room";
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setSuccess("Room Id copied successfully.");
    } catch (err) {
      console.error("Failed to copy Room ID:", err);
      setError("Error copying Room Id.");
    }
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

      <div className="dashboard">
        <h2>Users in Room</h2>
        <div>
       {users
  .filter((user) => user && typeof user === "object" && user.username)
  .map((user, index) => (
    <Stack key={user.socketId || index} spacing={4} marginBottom={4}>
      <HStack spacing={4} align="center">
        <Avatar name={user.username} size="md" />
        <Stack spacing={0}>
          <Text fontWeight="medium" fontSize="15px" marginTop={"20px"}>
            {user.username}
          </Text>
        </Stack>
      </HStack>
    </Stack>
))}


        </div>

        <div className="editor-buttons d-flex justify-content-center position-absolute bottom-0">
          <Button
            colorScheme="green"
            isLoading={loading}
            loadingText="Joining..."
            className="m-1"
            onClick={copyRoomId}
          >
            Copy Room Id
          </Button>
          <Button colorScheme="red" className="m-1" onClick={exitRoom}>
            Exit Room
          </Button>
        </div>
      </div>

      {/* Tabs for content */}
      <div className="tabs-container">
        <Tabs variant="teal">
          <TabList color={"white"}>
            <Tab>Members</Tab>
            <Tab>Chat</Tab>
          </TabList>
          <TabPanels>
            <TabPanel color={"white"}>
              <h2>Members</h2>
              <p>Manage your team members.</p>
            </TabPanel>

            <TabPanel>
              <h2 className="text-light">Chat</h2>
              <ChatRoom
                socketRef={socketRef}
                roomId={roomId}
                username={username}
                email={email}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default EditorPage;
