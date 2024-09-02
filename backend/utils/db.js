// require("dotenv")  // Add this line

const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://jayurane32003:jayrane53@usercluster.kahmwjc.mongodb.net/Students?retryWrites=true&w=majority&appName=UserCluster", {
    });
    console.log("Db connected");
  } catch (error) {
    console.log("Db connection failed");
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
