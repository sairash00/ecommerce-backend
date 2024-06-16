const dotenv = require("dotenv")
// env config
dotenv.config()

const app = require('./app')
const connectDB = require('./src/database/index.js')



//connection database
connectDB()

//server
app.listen(process.env.PORT,()=>{
    console.log("server listening on port " + process.env.PORT)
})