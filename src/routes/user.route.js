
const {
    registerUser,
    loginUser,
    logoutUser,
    deleteUser,
    updateUser,
    getAllUser,
    getUserInfo,
    makeAdmin,
    removeAdmin
    
} = require("../controller/user.controller.js")

const express = require('express');
const router = express.Router()



// routes 

router.route("/registerUser").post(registerUser)
router.route("/loginUser").post(loginUser)
router.route("/logoutUser").post(logoutUser)
router.route("/deleteUser").post(deleteUser)
router.route("/updateUser").post(updateUser)
router.route("/getAllUser").get(getAllUser)
router.route("/getUserInfo").get(getUserInfo)
router.route("/makeAdmin").post(makeAdmin)
router.route("/removeAdmin/:id").post(removeAdmin)

module.exports  = router