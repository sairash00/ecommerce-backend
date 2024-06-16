const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required: [true, "please enter product name"],
        trim: true
    },
    description:{
        type: String,
        required: [true, "please enter product description"]
    },
    price:{
        type: Number,
        required: [true, "please enter product price"],
        maxLength:[8,"Price cannot exceed 8 characters"]
    },
    images:{
        type: [String]
    },
    category:{
        type:String,
        required: [true, "please enter product category"]
    },
   
},
{
    timestamps: true,
}
)

module.exports =  mongoose.model('Product', productSchema)