const mongoose = require("mongoose");
    
const connectDB =  async ()=>{
    mongoose.connect("mongodb+srv://jayurane32003:jayrane53@usercluster.kahmwjc.mongodb.net/Students?retryWrites=true&w=majority&appName=UserCluster").then(()=>{
        console.log("Db connected")
      }).catch((error)=>{
        console.log("Db connection failed")
        console.log(error)
        process.exit(0)
      })
}
module.exports =  connectDB;




