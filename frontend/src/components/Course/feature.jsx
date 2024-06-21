import React from 'react';

// Feature component representing a single feature
const Feature = ({ icon, title, description }) => {
  return (
    <div className="feature">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

// FeatureSection component representing the section containing multiple features
const FeatureSection = () => {
  return (
    
    <section className="feature-section" id='features'>
         <h2 className='heading_text fs-2'>Features</h2>
       
      <div className="feat-container">
        
        <div className="features">
          <Feature
            icon={<i className="fas fa-chalkboard-teacher"></i>}
            title="Personalized Learning"
            description="Adaptive learning technology tailors the curriculum to each student's strengths and weaknesses."
          />
          <Feature
            icon={<i className="fas fa-users"></i>}
            title="Collaborative Learning"
            description="Engage with peers through group projects, discussion forums, and peer-to-peer tutoring."
          />
          <Feature
            icon={<i className="fas fa-laptop-code"></i>}
            title="Interactive Content"
            description="Interactive lessons, quizzes, simulations, and virtual labs provide hands-on learning experiences."
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
