const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({

    username:{
        type:String,
        required: [true, "Username is Required"],
        unique: true
    },
    email:{
        type:String,
        required:[true, "Email is Required"],
        unique: true
    },
    password:{
        type:String,
        required:[true, "Password is Required"]
    },
    cart:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    address:{
        type: String,
        required: true
    },
    admin:{
        type: Boolean,
        default:false
    }

},{
    timestamps: true
})


module.exports = mongoose.model("User",userSchema)