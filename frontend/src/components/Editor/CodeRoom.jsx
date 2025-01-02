import React, { useState } from 'react';
import '../../Styles/pages.css';
import '../../Styles/room.css';
import { Navbar } from "react-bootstrap";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton
} from '@chakra-ui/react';
import CustomNav from '../Header/nav';

const CodeRoom = () => {
  const [formData, setFormData] = useState({
    roomId: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate validation and submission logic
    if (!formData.roomId || !formData.username) {
      setError('Room ID and Username are required.');
      setLoading(false);
      return;
    }

    // Simulating success
    setTimeout(() => {
      setSuccess(`You have joined Room ID: ${formData.roomId}`);
      setError('');
      setLoading(false);
    }, 1000);
  };

  return (


   <div className="code_room  w-100 h-100 ">
    <CustomNav></CustomNav>
     <div className="d-flex  bg-white  justify-content-center align-items-center w-100">
     <div  id="room_form" className='rounded'>
<Navbar.Brand className="nav-brand" href="#home">
            <img
              src="../../../Images/logo.png"
              alt="Logo"
              className="d-inline-block align-top"
            />
            Brain
            <span
              style={{ color: "#7eec6d", margin: "0 2.3px", fontSize: "23px" }}
            >
              BOOST
            </span>
          </Navbar.Brand>
    <span className="text-white fw-bold mt-3 mb-3 ">JOIN THE ROOM </span>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setError('')} />
        </Alert>
      )}

      {success && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setSuccess('')} />
        </Alert>
      )}

      <form onSubmit={handleJoin}>
        <div className="form-group">
          <label htmlFor="roomId" className='text-white'>Room ID:</label>
          <input
            type="text"
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username" className='text-white'>Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Joining...' : 'Join'}
          <a href="/editor_page"></a>
        </button>
      </form>
    </div>
     </div>
   </div>
  );
};

export default CodeRoom;
