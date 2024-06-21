import React, { useState, useEffect } from "react";
import {
  Box,
  Image,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  useDisclosure,
} from "@chakra-ui/react";
import { useParams, Link } from "react-router-dom";
import BASE_URL from "../../services";

const courses = [
  {
    id: 1,
    title: "Javascript Course",
    price: 45000,
    description:
      "Learn the fundamentals of JavaScript, the most popular programming language for web development. This course covers variables, functions, loops, objects, and more. By the end of this course, you'll be able to build dynamic and interactive web applications.",
    image: "../../../Images/Course_Images/javascript.jpg",
  },
  {
    id: 2,
    title: "ReactJs Course",
    price: 40000,
    description:
      "Master React.js, the library for building user interfaces. This course includes topics like components, state management, hooks, and the React ecosystem. You'll also build real-world projects to understand how to create scalable and efficient web applications.",
    image: "../../../Images/Course_Images/react_2.jpg",
  },
  {
    id: 3,
    title: "UI UX Design",
    price: 25000,
    description:
      "Dive into UI/UX design and learn how to create user-centered designs. This course covers design principles, wireframing, prototyping, and user testing. You'll gain practical skills in design tools like Figma and Adobe XD, and learn how to craft delightful user experiences.",
    image: "../../../Images/Course_Images/ui_ux.jpg",
  },
  {
    id: 4,
    title: "Java Advanced",
    price: 35000,
    description:
      "Enhance your Java programming skills with advanced concepts. This course covers topics like multithreading, concurrency, data structures, algorithms, and design patterns. Perfect for developers looking to deepen their understanding of Java and improve their coding proficiency.",
    image: "../../../Images/Course_Images/java.jpg",
  },
  {
    id: 5,
    title: "Artificial Intelligence",
    price: 50000,
    description:
      "Explore the world of Artificial Intelligence and machine learning. This course includes topics like neural networks, natural language processing, and deep learning. You'll work on projects that involve building AI models and applying them to solve real-world problems.",
    image: "../../../Images/Course_Images/ai.jpg",
  },
  {
    id: 6,
    title: "Block Chain",
    price: 80000,
    description:
      "Understand the fundamentals of blockchain technology and its applications. This course covers distributed ledgers, smart contracts, and decentralized applications (dApps). You'll learn how blockchain is transforming industries and how to develop blockchain-based solutions.",
    image: "../../../Images/Course_Images/block.jpg",
  },
];

const CourseDetail = () => {
  const { id } = useParams();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const course = courses.find((course) => course.id === parseInt(id));
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!course) {
    return <h2>Course not found</h2>;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData({ ...data });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.alert(`Enrollment in ${course.title} successfully`);
    
    const formData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      courseName: course.title,
      coursePrice: course.price
    };
  
    try {
      const response = await fetch(`${BASE_URL}/get-enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit form data');
      }
  
      const result = await response.json();
      console.log('Form submission response:', result);
      window.location.href = "/home";
      setSuccess(`Data updated successfully!`);
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  };
  

  return (
    <Box p="20px" mt={"85px"} bg="#7eec6d" borderRadius="20px" width="60vw">
      <Button className="d-block m-auto" onClick={onOpen}>
        Enroll Now
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader className="text-center">Course Enrollment</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={"20px"}>
            <form
              onSubmit={handleSubmit}
            >
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  value={`${userData.firstName} ${userData.lastName}`}
                  onChange={handleChange}
                  name="name"
                  disabled
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  name="email"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    value={userData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    name="phone"
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Course</FormLabel>
                <Input
                  type="text"
                  value={course.title}
                  disabled
                  name="courseName"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Price</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    value={course.price}
                    disabled
                    name="coursePrice"
                  />
                </InputGroup>
              </FormControl>
              <ModalFooter>
                <Button className="contact-btn d-block m-auto" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Text
        className="course-detail-title"
        textAlign="center"
        fontWeight="semibold"
        fontSize="2xl"
        mb="20px"
        color="gray.800"
      >
        {course.title}
      </Text>
      <Box
        background={"white"}
        className="course-detail-container"
        width={"60vw"}
        textAlign="center"
        p="30px"
        ml={"-20px"}
      >
        <Image
          className="course-detail-image"
          src={course.image}
          alt={course.title}
          borderRadius="10px"
          width="500px"
          height="300px"
          objectFit="cover"
          mr="30px"
        />
        <Text fontSize="lg" lineHeight="1.5" color="black" mb="20px">
          {course.description}
        </Text>
      </Box>
      <Box mt="20px" textAlign="center">
        <Link to={`/home`}>
          <Button
            color="white"
            _hover={{ bg: "#124325" }}
            bg="#1c4815"
            size="md"
          >
            Back
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default CourseDetail;
