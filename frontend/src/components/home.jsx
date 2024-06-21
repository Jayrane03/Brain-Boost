import React, { useEffect, useState } from 'react';
import CustomNav from './Header/nav';
import { Button } from 'react-bootstrap';
import Typed from 'typed.js';
import Course from "../components/Course/course";
import Footer from './Footer/footer';
import About from './Course/about';
import box1Img from '/Images/box_1.png';
import box2Img from '/Images/box_2.png';
import BASE_URL from '../services';
import stdImg from '/Images/std.png';

const Home = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken'); // Use 'authToken' as set during login
      if (!token) {
        window.location.href = '/';
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/home`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          const firstName = data.user.firstName;
          setUserName(firstName);
        } else {
          console.error('Error fetching user data:', data.message);
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/';
      }
    };

    fetchUserData();

    const strings = ["Your Learning Companion", "Welcome to LearnHub!", "Explore our courses and resources"];
    const typingEffect = new Typed(".multitext", {
      strings: strings,
      typeSpeed: 100,
      backSpeed: 80,
      backDelay: 1500,
      loop: true
    });

    return () => {
      typingEffect.destroy();
    };
  }, []);

  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <CustomNav />
      <section>
        <div className="section-home">
          <div className="info_contain">
            <h3>Brain<span style={{ color: "#7eec6d", margin: "0 2.3px", fontSize: "28px" }}>BOOST</span>:</h3>
            <h1><span className='multitext'></span></h1>
            <p>
              Welcome to BrainBoost, <span style={{ color: "#7eec6d", fontSize: "22px" }}>{userName.toUpperCase()}!</span> Where learning meets convenience! <span className='span_green'>Whether you're a student, educator, or lifelong learner, we have something for everyone.</span> Explore our diverse range of courses and resources designed to empower you on your learning journey.
            </p>
            <Button variant="none" onClick={scrollToCourses} className='contact-btn w-25 mb-2 p-2' style={{ cursor: 'pointer' }}>COURSES</Button>
          </div>
          <div className="image-container">
            <div className="box_1">
              <img src={box1Img} className='box_img' alt="Courses" />
              <span>
                10+
                Courses
              </span>
            </div>
            <div className="box_1" id='box_1'>
              <img src={box2Img} className='box_img' alt="Students" />
              <span>
                1000+
                Students
              </span>
            </div>
            <img src={stdImg} alt="Student" className="glowing-bottom" />
            <div className="background-shape"></div>
          </div>
        </div>
        <About />
        <div className="course-section" id="courses">
          <Course />
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Home;
