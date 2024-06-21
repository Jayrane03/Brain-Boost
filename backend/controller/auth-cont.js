const UserModel = require("../models/auth-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "Error", message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with name, email, and hashed password
    const newUser = new UserModel({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({
      userId: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    }, 'secret23', { expiresIn: '2h' });

    // Return user data along with the token
    res.status(201).json({
      status: "OK",
      message: "User registered successfully",
      user: { email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName },
      token
    });
  } catch (error) {
    console.error('Error during user registration:', error); // Log error details
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};



exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: "Error", message: "User not found" });
    }
     console.log(user)
    // Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ status: "Error", message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }, 'secret23', { expiresIn: '2h' });
  
    // Return user data along with the token
    res.json({
      status: "OK",
      user: { email: user.email, firstName: user.firstName, lastName: user.lastName },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};
exports.getHome = async (req, res) => {
  try {
    // Fetch user data from the request
    const {email} = req.body;
    // console.log('User from request:', req.body);

    // Fetch additional data from your database
    const userData = await UserModel.findOne(email);
    // console.log('User data from database:', userData.firstName);

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Construct the response object
    // const responseData = {
    //   user: {
    //     firstName: userData.firstName,
    //     // Add any other user data you want to include
    //   },
    //   // Add any other data you want to include
    // };

    // Send the response
    res.status(201).json({
      status: "OK",
      message: "User Login successfully",
      user: { email: userData.email, firstName: userData.firstName, lastName: userData.lastName },
      
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};