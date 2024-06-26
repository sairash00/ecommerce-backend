const User = require("../model/user.model.js")
const bcrypt  = require("bcrypt")
const jwt = require("jsonwebtoken")
const generateToken = require("../utils/generateAccessToken.js")

// register user
exports.registerUser = async (req,res) =>{
   try {
     const user = req.body;
 
     if(!user.username || !user.password || !user.email || !user.address) {
         return res.status(400).json({
         success: false,
         loggedIn: false,
         message: "User Details Required"
         })
     }
 
     const {email, username} = user
     const foundUser = await User.findOne({
        $or: [
            {email: email},
            {username: username}
        ]
     }) 
 
 
     if(foundUser){
         return res.status(200).json({
             success: false,
             loggedIn:false,
             message: " User Already Exists"
         })
     }
 
 
     const hashedPassword = await bcrypt.hash(user.password,10)
     user.password = hashedPassword
     const newUser = await User.create(user)
 
     
     if(!newUser){
         return res.status(500).json({
            loggedIn:false,
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
         loggedIn: true,
         message: "User Registered Successfully",
         newUser
     })
   } catch (error) {
     res.status(500).json({
        loggedIn: false,
        success: false,
        message: error
     })
   }

}

//login User
exports.loginUser = async(req,res)=>{

    const user = req.body;

    if(!user.email || !user.password){
        return res.status(400).json({
            success: false,
            loggedIn: false,
            message: "User Details Required"
        })
    }

    const foundUser = await User.findOne({email : user.email}).select(
        "email password"
    )
    if(!foundUser){
        return res.status(400).json({
            loggedIn:false,
            success: false,
            message: "User not Found"
        })
    }

    const isMatch = await bcrypt.compare(user.password,foundUser.password)
    console.log(isMatch)

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
        loggedIn: true,
        success:true,
        message: "User logged in Successfully",
    })

}

exports.logoutUser = async(req,res) => {

    const cookie = req.cookies?.accessToken

    if(!cookie) {
        return res.status(400).json({
            success: false,
            loggedIn: false,
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
            loggedIn: false,
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
            loggedIn:false,
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
            loggedIn: false,
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
            loggedIn:false,
            message: "Unauthorized Request"
        })
    }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
    
    const {details} = req.body

    if(!details){
        return res.status(400).json({
            success: true,
            message: "Fields are empty"
        })
    }

    const hashedPassword = await bcrypt.hash(details.password,10)
    details.password =  hashedPassword


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
        "username email address admin createdAt"
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
   try {
     const token = req.cookies?.accessToken
     if(!token) {
         return res.status(401).json({
             success:false,
             loggedIn:false,
             message: "Unauthorized Request"
         })
     }
 
     const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
     
     const user = await User.findById({_id: decodedToken.id}).select(
         "-password -cart"
     )
     if(!user) {
         return res.status(401).json({
             success: false,
             loggedIn:false,
             message: "Unauthorized Request"
         })
     }
 
     return res.status(200).json({
         success: true,
         message: "User found successfully",
         user
     })
   } catch (error) {
        res.status(500).json({
            success: false,
            message: "error while fetching user data"
        })
   }
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

    const userId = req.body.id

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