import React from 'react';
import '../../Styles/courses.css';
import '../../Styles/index.css'
import AboutImg from "/Images/stud.jpg"
import FeatureSection from './feature';

const About = () => {
  return (
   <>
    <section id='about'>
        <h1 id="abt-heading" className='heading_text fs-2'>About Us</h1>
      <div className="about-container">
        
        <div className="about-text">
          <h2>We Offer the  Coaching by Skilled Advisors</h2>
          <p>
            Brain Boost is dedicated to providing high-quality educational resources and courses to help individuals enhance their skills and knowledge in various fields. Our mission is to empower learners of all ages and backgrounds to achieve their academic and professional goals.
          </p>
          <p>
        <span className='span_green'>    With a team of experienced educators and industry professionals, we strive to deliver engaging and interactive learning experiences that cater to diverse learning styles. 
            </span>Whether you're a student looking to excel in school or a professional aiming to advance your career, Brain Boost has something for everyone.
          </p>
        </div>
        <div className="about-img">
          <img src={AboutImg} alt="Students studying" />
        </div>
      </div>
    </section>
    <FeatureSection></FeatureSection>
   </>
  );
};

export default About;
