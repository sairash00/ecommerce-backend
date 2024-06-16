const mongoose = require("mongoose");

const connectDB = ()=>{
    mongoose
  .connect(process.env.DB_URL)
  .then((data) => {
    console.log(`mongoDB connection successful with ${data.connection.host}`);
  })
  .catch((error) => {
    console.log(`failed connecting to mongoDb : ${error}`);
  });

}

module.exports = connectDB