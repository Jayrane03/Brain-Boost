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

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ status: "Error", message: "Invalid password" });
    }

    // Update lastLogin field to the current time
    user.lastLogin = new Date(); // Set the current date and time
    await user.save(); // Save the updated user document

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

;exports.getHome = async (req, res) => {
  try {
    // Extract email from the authenticated user's data (e.g., req.user)
    const { email } = req.user;

    // Ensure the email is present
    if (!email) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // Fetch the user's data from the database
    const userData = await UserModel.findOne({ email }).select('-password');

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the response with the user's name
    res.status(200).json({
      status: 'OK',
      message: 'User data fetched successfully',
      user: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
