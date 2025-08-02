import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import '../Styles/pages.css';
import signUpImg from "/Images/reg.png";
import BASE_URL from '../services';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton
} from '@chakra-ui/react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // 2. Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save the token to localStorage
        localStorage.setItem('authToken', data.token);
        setSuccess("Registration Successful! Redirecting...");

        // 3. Use setTimeout for a better user experience
        setTimeout(() => {
          navigate('/profile'); // Redirect after 2 seconds
        }, 2000);

      } else {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please check your connection and try again.');
      setLoading(false);
    }
    // No finally block needed here, as loading is handled in success/error paths
  };

  return (
    <div className="register">
      <div className="register-form-container">
        <div className="image">
          <img className="formImg" src={signUpImg} alt="Background" />
        </div>
        <div className="form-container">
          <h2>Register</h2>
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
                {/* 4. Correctly use formData to display the name */}
                <AlertTitle>Welcome, {formData.firstName}!</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Box>
            </Alert>
          )}
          <form onSubmit={registerUser}>
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
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
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
            <a href="/">Already have an account</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;