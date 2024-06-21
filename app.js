const express = require("express")
const productRoute = require("./src/routes/product.route.js")
const userRoute = require("./src/routes/user.route.js")
const orderRoute = require("./src/routes/order.route.js")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()

  app.use(
    express.json()
  );
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public")) 
  
  const corsOptions = {
    origin: '*', 
    credentials: true, 
  };
  
  app.use(cors(corsOptions))
  

//route setup
app.use("/api/v1",productRoute)
app.use("/api/v1/users",userRoute)
app.use("/api/v1/order",orderRoute)

module.exports = app