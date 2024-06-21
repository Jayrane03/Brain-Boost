import React, { useState, useEffect } from 'react';
import ContactImg from "/Images/contact_form.jpg";
import BASE_URL from '../../services';
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      // Handle missing token (e.g., redirect to login)
      window.location.href= "/"
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const result = await response.json();
      setSuccess(result.message);
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  return (
    <section id='contact'>
      <div className="contact-form-container">
        <h2 className='heading_text'>Contact Us</h2>
        <div className="cont-page">
          <div className="contact-image">
            <img src={ContactImg} alt="Contact Form" />
          </div>
          <form action='/message' method='POST' encType='multipart/form-data' className='cont-form' onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
