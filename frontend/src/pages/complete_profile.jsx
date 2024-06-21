import React, { useState, useEffect } from 'react';
import '../Styles/complete_profile.css';
import { Radio, RadioGroup, HStack, Alert, AlertIcon, AlertTitle, AlertDescription, Box, CloseButton } from '@chakra-ui/react';

function Profile() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skills: [],
    gender: '',
    profilePhoto: null,
  });
  const [newSkill, setNewSkill] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken'); // Use 'authToken' as set during login
      if (!token) {
        window.location.href = '/';
        return;
      }
      try {
        const response = await fetch('http://localhost:5001/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        const skills = parseSkills(data.skills);
        setUserData({ ...data, skills });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const parseSkills = (skills) => {
    try {
      // Check if the skills are already an array
      if (Array.isArray(skills)) {
        return skills;
      }
      // Check if the skills is a stringified JSON array
      if (typeof skills === 'string' && skills.startsWith('[') && skills.endsWith(']')) {
        return JSON.parse(skills);
      }
      // Handle comma-separated string
      if (typeof skills === 'string') {
        return skills.split(',').map(skill => skill.trim());
      }
      return [];
    } catch (error) {
      console.error("Error parsing skills:", error);
      return [];
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUserData({
      ...userData,
      profilePhoto: file
    });
  };

  const handleSkillChange = (e) => {
    setNewSkill(e.target.value);
  };

  const addSkill = () => {
    if (newSkill.trim() !== '') {
      setUserData({
        ...userData,
        skills: [...userData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setUserData({
      ...userData,
      skills: userData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('email', userData.email);
    formData.append('phone', userData.phone);
    formData.append('skills', JSON.stringify(userData.skills)); // Convert skills to JSON string
    formData.append('gender', userData.gender); // Add gender to form data
    formData.append('profilePhoto', userData.profilePhoto);

    try {
      const response = await fetch('http://localhost:5001/profile', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to submit form data');
      }

      const result = await response.json();
      console.log('Gender state:', userData.gender);

      console.log('Form submission response:', result);
      window.location.href = "/home";
      setSuccess(`Data updated successfully!`);
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  };

  return (
    <div className="profile-cont">
      <h2>Profile</h2>
      <form onSubmit={handleSubmit} action="/profile" method="post" encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={userData.firstName}
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
            value={userData.lastName}
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
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="skills">Skills:</label>
          <div className="skills-input">
            <input
              type="text"
              id="skills"
              value={newSkill}
              onChange={handleSkillChange}
            />
            <button type="button" onClick={addSkill}>Add Skill</button>
          </div>
          <ul className="skills-list">
            {userData.skills.map((skill, index) => (
              <li key={index}>
                {skill.toUpperCase()}
                <button type="button" onClick={() => removeSkill(skill)}>X</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender:</label>
          <RadioGroup onChange={(value) => setUserData({ ...userData, gender: value })} value={userData.gender}>
            <HStack direction='row'>
              <Radio value='Male'>Male</Radio>
              <Radio value='Female'>Female</Radio>
              <Radio value='Other'>Other</Radio>
            </HStack>
          </RadioGroup>
        </div>
        <div className="form-group">
          <label htmlFor="profilePhoto">Upload Profile Photo:</label>
          <input
            type="file"
            id="profilePhoto"
            name="profilePhoto"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Profile;
