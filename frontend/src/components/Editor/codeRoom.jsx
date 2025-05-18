import { useEffect, useState } from "react";
import "../../Styles/pages.css";
import "../../Styles/room.css";
import { Navbar } from "react-bootstrap";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
} from "@chakra-ui/react";
import CustomNav from "../Header/nav";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../services";// Replace with your API base URL

const CodeRoom = () => {
  const [formData, setFormData] = useState({
    roomId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const navigate = useNavigate();

  const username = `${userData.firstName} ${userData.lastName}`.trim();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found. Redirecting to login.');
        window.location.href = '/';
        return;
      }
  
      try {
        const response = await fetch(`${BASE_URL}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const user = await response.json();
          console.log('User data fetched:', user);
          setUserData({
            firstName: user.firstName || 'User',
            lastName: user.lastName || '',
            email: user.email || '',
          });
        } else if (response.status === 401) {
          console.error('Unauthorized. Redirecting to login.');
          localStorage.removeItem('authToken');
          window.location.href = '/';
        } else {
          console.error('Error fetching user data:', response.statusText);
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/';
      }
    };
  
    fetchUserData();
  }, []);
  
  const generateRoomId = (e) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, roomId: uuidv4() }));
  };

  const handleJoin = (e) => {
  e.preventDefault();

  if (!formData.roomId) {
    setError("Room ID is required.");
    return;
  }

  setLoading(true);

  // Simulate join action
  setTimeout(() => {
    setSuccess(`You have joined the room with ID: ${formData.roomId}`);
    setError("");
    setLoading(false);

    navigate(`/editor_page/${formData.roomId}`, {
      state: {
        username,
        roomId: formData.roomId,
        senderEmail: userData.email,
        recipientEmail: "admin@brainboost.com", // Optional: Make this dynamic
      },
    });
  }, 1000);
};

  return (
    <div className="code_room w-100 h-100">
      <CustomNav />
      <div className="d-flex bg-white justify-content-center align-items-center w-100">
        <div id="room_form" className="rounded p-4">
          <Navbar.Brand className="nav-brand" href="#home">
            <img
              src="../../../Images/logo.png"
              alt="Logo"
              className="d-inline-block align-top"
            />
            Brain
            <span style={{ color: "#7eec6d", margin: "0 2.3px", fontSize: "23px" }}>
              BOOST
            </span>
          </Navbar.Brand>

          <h3 className="text-white fw-bold mt-3 mb-3">JOIN THE ROOM</h3>

          {error && (
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
          )}

          {success && (
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
          )}

          <form onSubmit={handleJoin}>
            <div className="form-group mb-3">
              <label htmlFor="roomId" className="text-white">
                Room ID:
              </label>
              <input
                type="text"
                id="roomId"
                name="roomId"
                value={formData.roomId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, roomId: e.target.value }))
                }
                className="form-control w-100 text-center"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="username" className="text-white">
                Username:
              </label>
              <input
                type="text"
                id="username"
                value={username}
                className="form-control w-100 text-center"
                disabled
              />
            </div>

            <div className="room_btn d-flex justify-content-between">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Joining..." : "Join"}
              </button>
              <button
                className="btn btn-primary"
                onClick={generateRoomId}
                type="button"
              >
                Generate Room ID
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CodeRoom;
