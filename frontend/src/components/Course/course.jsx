import React , {useEffect} from 'react';
import { Link } from 'react-router-dom';
import ContactForm from './contact';
import "../../Styles/courses.css"

const courses = [
  {
    id: 1,
    title: "Javascript Course",
    price:   45000,
    description:
      "Learn the fundamentals of JavaScript, the most popular programming language for web development. This course covers variables, functions, loops, objects, and more.",
    image: "../../../Images/Course_Images/javascript.jpg",
  },
  {
    id: 2,
    title: "ReactJs Course",
    price:   40000,
    description:
      "Master React.js, the library for building user interfaces. This course includes topics like components, state management, hooks, and the React ecosystem.",
    image: "../../../Images/Course_Images/react_2.jpg",
  },
  {
    id: 3,
    title: "UI UX Design",
    price:   25000,
    description:
      "Dive into UI/UX design and learn how to create user-centered designs. This course covers design principles, wireframing, prototyping, and user testing.",
    image: "../../../Images/Course_Images/ui_ux.jpg",
  },
  {
    id: 4,
    title: "Java Advanced",
    price:   35000,
    description:
      "Enhance your Java programming skills with advanced concepts. This course covers topics like multithreading, concurrency, data structures, algorithms, and design patterns.",
    image: "../../../Images/Course_Images/java.jpg",
  },
  {
    id: 5,
    title: "Artificial Intelligence",
    price:   50000,
    description:
      "Explore the world of Artificial Intelligence and machine learning. This course includes topics like neural networks, natural language processing, and deep learning.",
    image: "../../../Images/Course_Images/ai.jpg",
  },
  {
    id: 6,
    title: "Block Chain",
    price:   80000,
    description:
      "Understand the fundamentals of blockchain technology and its applications. This course covers distributed ledgers, smart contracts, and decentralized applications (dApps).",
    image: "../../../Images/Course_Images/block.jpg",
  },
];

// Function to chunk the array into groups of size 'size'
const chunkArray = (arr, size) => {
  const chunkedArr = [];
  for (let i = 0; i < arr.length; i += size) {
    chunkedArr.push(arr.slice(i, i + size));
  }
  return chunkedArr;
};

// Chunking the courses array into groups of 3
const courseChunks = chunkArray(courses, 3);

const Course = ({userId}) => {
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      // Handle missing token (e.g., redirect to login)
      window.location.href= "/"
    }
  }, []);
  return (
    <>
      <section className="course-section_new" id='course'>
        <h1 className='sec-tit_new heading_text fs-2'>Courses We Provide</h1>
        <div className="course-section_new">
          {courseChunks.map((chunk, index) => (
            <div className="course-container_new" key={index}>
              {chunk.map(course => (
                <div className="course-card_new" key={course.id} id={`course_${course.id}`}>
                  <div className="course_img">
                    <img src={course.image} alt="Course" />
                  </div>
                  <div className="course-details_new">
                    <h3>{course.title}</h3>
                    <p className='text-center'>{course.description}</p>
                    <Link to={`/course/${course.id}`}>
                      <button className='m-auto'>Enroll Now In  ₹{course.price}</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <ContactForm  userId={userId}/>
    </>
  );
}

export default Course;
