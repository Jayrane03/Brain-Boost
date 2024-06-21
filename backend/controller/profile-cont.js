const UserModel = require("../models/auth-model");
const multer = require("multer");
const path = require('path');
const fs = require('fs');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

exports.upload = upload;

// exports.getHome = async (req, res) => {
//   try {
//     // Fetch user data from the request (assuming user data is stored in req.user after authentication)
//     const user = req.user;

//     // Fetch additional data from your database or any other source as needed
//     // For example, you can fetch some additional information from the UserModel
//     const userData = await UserModel.findById(user.id); // Assuming you use MongoDB and Mongoose

//     // Construct the response object with the data you want to send to the client
//     const responseData = {
//       user: {
//         firstName: userData.firstName,
//         // Add any other user data you want to include
//       },
//       // Add any other data you want to include
//     };

//     // Send the response with the constructed data
//     res.status(200).json(responseData);
//   } catch (error) {
//     console.error('Error fetching home data:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

exports.createProfile = async (req, res) => {
  try {
    // Log the incoming request data for debugging
    // console.log('Received request body:', req.body);
    // console.log('Received file:', req.file);

    const { firstName, lastName, email, phone, skills, gender } = req.body;
    let profilePhotoPath = null;
    
    if (req.file) {
      profilePhotoPath = path.join('uploads', req.file.filename);
    }

    let existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      const newStudent = new UserModel({
        firstName,
        lastName,
        email,
        phone,
        gender,
        skills: JSON.parse(skills), // Convert skills back to an array
        profilePhoto: profilePhotoPath
      });
      // console.log(skills)
      const studentData = await newStudent.save();
      res.status(200).json({ status: 'OK', message: 'Profile created successfully', data: studentData });
    } else {
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.phone = phone;
      existingUser.skills = JSON.parse(skills); // Convert skills back to an array
      existingUser.gender = gender;
      if (req.file) existingUser.profilePhoto = profilePhotoPath;

      const updatedUser = await existingUser.save();
      res.status(200).json({ status: 'OK', message: 'Profile updated successfully', data: updatedUser });
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ status: 'FAILED', message: 'An error occurred while creating/updating profile' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log(user)
    res.json(user);
   
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, gender,phone, skills, password } = req.body;
    let profilePhotoPath = null;

    if (req.file) {
      profilePhotoPath = path.join('uploads', req.file.filename);
    }

    const updatedData = {
      firstName,
      lastName,
      email,
      phone,
      gender,
      skills,
      password,
    };

    if (profilePhotoPath) {
      updatedData.profilePhoto = profilePhotoPath;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updatedData, { new: true });
    res.status(200).json({ status: 'OK', message: 'Profile updated successfully', updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
  }
};

exports.enrollInCourse = async (req, res) => {
  console.log('Enrollment request received');
  try {
    const { firstName, lastName, email, phone, gender, courseName, coursePrice } = req.body;
    console.log('Received data:', req.body);

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "Error", message: "User not found" });
    }

    // Check if the user is already enrolled in the course
    const existingCourse = user.courses.find(course => course.courseName === courseName);
    if (existingCourse) {
      return res.status(400).json({ status: "Error", message: "User is already enrolled in this course" });
    }

    // Add the new course to the user's courses array
    user.courses.push({ courseName, coursePrice });
    await user.save();

    res.status(200).json({ status: 'OK', message: `User enrolled in the ${courseName} successfully`, user });
  } catch (error) {
    console.error("Error enrolling user in course:", error);
    res.status(500).json({ status: "Error", message: "Internal server error", error: error.message });
  }
};
exports.contactForm = async (req, res) => {
  try {
    // const userId = req.query.userId;/
    // const { email } = req.body;
    
    const { name, email, message} = req.body;
    console.log(req.body)
    const student = await UserModel.findOne({email});
    console.log(student)
    if (!student) {
    
      return res.status(404).json({ message: 'User not found' });
    }

    student.messages.push({ name, email, message }); 
    
   await student.save();
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

  