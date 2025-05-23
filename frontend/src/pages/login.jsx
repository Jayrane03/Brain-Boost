import React, { useState, useEffect } from 'react';
import loginImg from '/Images/login.png';
import '../Styles/pages.css';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton
} from '@chakra-ui/react';
import BASE_URL from '../services';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });


  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.token) {
          localStorage.setItem('authToken', data.token); // Store token in localStorage
  
          // Fetch user data to get the first name and last login info
          const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
          const userDataResponse = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Include token in headers
            },
          });
  
          const userData = await userDataResponse.json();
          if (userDataResponse.ok) {
            console.log(userData);
  
            setUserData({
              firstName: userData.firstName || "User",
              lastName: userData.lastName || ""
            });
  
            // Show custom success message for first login or returning user
            if (data.user.isFirstTime) {
              setSuccess(`Welcome back, ${userData.firstName} ${userData.lastName}! Redirecting...`);
            } else {
              setSuccess(`Welcome , ${userData.firstName} ${userData.lastName}! Redirecting...`);
            }
  
            // Redirect after 2 seconds
            setTimeout(() => {
              window.location.href = '/home';
            }, 1500); // 2000ms = 2 seconds
          } else {
            console.error('Failed to fetch user data');
            setError('Failed to fetch user data');
          }
        } else {
          setError('Please check your email or password');
        }
      } else {
        setError(data.message || 'Please check your email or password');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login">
      <div className="login-form-container">
        <div className="image">
          <img className='formImg' src={loginImg} alt="Background" />
        </div>
        <div className="form-container">
          <h2>Login</h2>
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
                <AlertTitle>Welcome, {userData.firstName} {userData.lastName}!</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Box>
              <CloseButton position="absolute" right="8px" top="8px" onClick={() => setSuccess('')} />
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <a href="/register">Create a New Account</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
