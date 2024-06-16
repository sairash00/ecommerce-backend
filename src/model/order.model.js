const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    
    orderedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    ordered:[{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    pending:{
        type: Boolean,
        default : true
    }
},{
    timestamps: true
}
)

module.exports = mongoose.model("Order",orderSchema)