const User = require("../model/user.model.js")
const bcrypt  = require("bcrypt")
const jwt = require("jsonwebtoken")
const generateToken = require("../utils/generateAccessToken.js")

// register user
exports.registerUser = async (req,res) =>{
    console.log("working")
    const user = req.body;

    if(!user.username || !user.password || !user.email || !user.address) {
        return res.status(400).json({
        success: false,
        message: "User Details Required"
        })
    }

    console.log("working1")
    const email = user.email
    const foundUser = await User.findOne({email}) 


    if(foundUser){
        return res.status(400).json({
            success: false,
            message: " User Already Exists"
        })
    }

    console.log("working2")

    const hashedPassword = await bcrypt.hash(user.password,10)
    user.password = hashedPassword
    console.log("working3")
    const newUser = await User.create(user)

    console.log("Working 3")
    
    if(!newUser){
        return res.status(500).json({
            success: false,
            message: "User Registration Failed"
        })
    }

    const generatedToken = generateToken(newUser.email, newUser._id)

    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000 )
    }

    res.status(200)
    .cookie("accessToken", generatedToken , options)
    .json({
        success: true,
        message: "User Registered Successfully",
        newUser
    })

}

//login User
exports.loginUser = async(req,res)=>{

    const token = req.cookies.accessToken

    if(!token) {
        res.json({
            success: false,
            loggedIn: false,
            message: "No Token Available"
        })
    }
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decodedToken)

    const checkUser = await User.findById(decodedToken.id).select("email")

    if(checkUser){
        return res.status(200).json({
            success: true,
            loggedIn: true,
            message: "User logged in successfully"
        })
    }


    const user = req.body;

    if(!user.email || !user.password){
        return res.status(400).json({
            success: false,
            message: "User Details Required"
        })
    }

    const foundUser = await User.findOne({email : user.email}).select(
        "email password"
    )

    if(!foundUser){
        return res.status(400).json({
            success: false,
            message: "User not Found"
        })
    }

    const isMatch = await bcrypt.compare(user.password,foundUser.password)

    if(!isMatch){
        return res.status(400).json({
            success: false,
            message: "Incorrect Password"
        })
    }

    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000)
    }

    const generatedToken = generateToken(foundUser.email, foundUser._id)

    return res.status(200)
    .cookie("accessToken",generatedToken,options)
    .json({
        success:true,
        message: "User logged in Successfully",
    })

}

exports.logoutUser = async(req,res) => {

    const cookie = req.cookies?.accessToken

    if(!cookie) {
        return res.status(400).json({
            success: false,
            message: "Invalid Request"
        })
    }

    const token = jwt.verify(cookie,process.env.JWT_SECRET)

    const user = await User.findById({_id: token.id}).select(
        "email"
    )
    if(!user){
        return res.status(400).json({
            success: false,
            message: "Invalid Request"
        })
    }

    return res.status(200)
    .clearCookie("accessToken")
    .json({
        success: true,
        message: "User Logged Out Successfully"
    })

}

exports.deleteUser = async(req,res) => {
    const token = req.cookies?.accessToken

    if(!token) {
        return res.status(400).json({
            success: false,
            message: "Unauthorized Request"
        })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById({_id : decodedToken.id}).select(
        "password"
    )

    if(!user) {
        return res.status(400).json({
            success: false,
            message: "Unauthorized Request"
        })
    }

   const isMatch = await bcrypt.compare(req.body.password, user.password)

    if(!isMatch) {
        return res.status(400).json({
            success: false,
            message: "Incorrect Password"
        })
    }

    const deletedUser =  await user.deleteOne()

    if(!deletedUser) {
        return res.status(500).json({
            success: false,
            message: "User Deletion Failed"
        })
    }

    return res.status(200)
    .clearCookie("accessToken")
    .json({
        success: true, 
        message: "User Deleted Successfully",
        deletedUser
    })

}

exports.updateUser = async(req,res) => {
    const token = req.cookies?.accessToken
    if(!token) {
        return res.status(400).json({
            success: false,
            message: "Unauthorized Request"
        })
    }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
    
    const details = req.body

    const hashedPassword = await bcrypt.hash(details.password,10)
    details.password =  hashedPassword

    if(!details){
        return res.status(400).json({
            success: true,
            message: "Fields are empty"
        })
    }

    const user = await User.findByIdAndUpdate({_id: decodedToken.id}, details)

    if(!user){
        return res.status(500).json({
            success: false,
            message: "User Updation Failed"
        })
    }

    return res.status(200).json({
        success: true,
        message: "User updated successfully",
    })

}

exports.getAllUser = async(req,res) => {
    const token = req.cookies?.accessToken
    if(!token) {
        return res.status(401).json({
            success:false,
            message: "Unauthorized Request"
        })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById({_id: decodedToken.id}).select(
        "admin "
    )
    if(!user || user.admin === false) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized Request"
        })
    }

    const users = await User.find().select(
        "username email admin ordered"
    )

    if(!users) {
        return res.status(500).json({
            success: false,
            message: "User Retrieval Failed"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Users Successfully Retireved",
        users
    })

}

exports.getUserInfo = async(req,res) => {
    const token = req.cookies?.accessToken
    if(!token) {
        return res.status(401).json({
            success:false,
            message: "Unauthorized Request"
        })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById({_id: decodedToken.id}).select(
        "admin "
    )
    if(!user || user.admin === false) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized Request"
        })
    }

    const userId = req.params.id

    if(!userId || userId.length > 24 || userId.length < 24 ) {
        return res.status(400).json({
            success: false,
            message: "User Id Required"
        })
    }

    const userInfo = await User.findById({_id: userId}).select(
        "email username ordered admin address"
    )

    if(!userInfo) {
        return res.status(400).json({
            success: false,
            message: "User not Found"
        })
    }
    return res.status(200).json({
        success: true,
        message: "User found successfully",
        userInfo
    })
}

exports.makeAdmin = async(req,res) => {

    const token = req.cookies?.accessToken
    if(!token) {
        return res.status(401).json({
            success:false,
            message: "Unauthorized Request"
        })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById({_id: decodedToken.id}).select(
        "admin "
    )
    if(!user || user.admin === false) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized Request"
        })
    }

    const userId = req.params.id

    if(!userId || userId.length > 24 || userId.length < 24 ) {
        return res.status(400).json({
            success: false,
            message: "User Id Required"
        })
    }

    update = {
        admin: true
    }

    const userInfo = await User.findByIdAndUpdate(userId,update).select(
        "username email"
    )

    if(!userInfo) {
        return res.status(400).json({
            success: false,
            message: "User not Found"
        })
    }
    return res.status(200).json({
        success: true,
        message: "User made admin successfully",
        userInfo
    })

}
exports.removeAdmin = async(req,res) => {

    const token = req.cookies?.accessToken
    if(!token) {
        return res.status(401).json({
            success:false,
            message: "Unauthorized Request"
        })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById({_id: decodedToken.id}).select(
        "admin "
    )
    if(!user || user.admin === false) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized Request"
        })
    }

    const userId = req.params.id

    if(!userId || userId.length > 24 || userId.length < 24 ) {
        return res.status(400).json({
            success: false,
            message: "User Id Required"
        })
    }

    update = {
        admin: false
    }

    const userInfo = await User.findByIdAndUpdate(userId,update).select(
        "username email"
    )

    if(!userInfo) {
        return res.status(400).json({
            success: false,
            message: "User not Found"
        })
    }
    return res.status(200).json({
        success: true,
        message: "User demoted successfully",
        userInfo
    })

}