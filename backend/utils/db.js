const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI ||"mongodb+srv://jayurane32003:brainboost@boostbrain1.ml5q5sx.mongodb.net/?retryWrites=true&w=majority&appName=BoostBrain1"
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(uri, {
  
    });
    console.log('Db connected');
  } catch (error) {
    console.error('Db connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
