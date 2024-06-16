
const jwt = require("jsonwebtoken")
const User = require("../model/user.model.js")
const Order = require("../model/order.model.js")
const mongoose = require("mongoose")
const Product = require("../model/product.model.js")

exports.addOrder = async(req,res) => {
    try {
    
        const token = req.cookies?.accessToken
        if(!token){
            return res.status(401).json({
                success:false,
                loggedIn: false,
                message: "Unauthorized Access, no Token found"
            })
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedToken.id).select(" orders ")
    
    
        if(!user) {
            return res.status(401).json({
                success: false,
                loggedIn: false,
                message: "Unauthorized Access, Invalid token"
            })
        }
    
        const product = req.body
    
        if(!product || !Array.isArray(product)){
            return res.status(400).json({
                success: false,
                message: "Invalid Request, Inappropriate Method"
            })
        }
    
        for(each of product){
            if(!each.id || !mongoose.Types.ObjectId.isValid(each.id)){
                return(
                    res.status(400).json({
                        success: false,
                        message: "Invalid Request, Invalid Product Id"
                    })
                )
            }
        }
    
        const productIds = product.map( product => product.id)
    
        const foundProducts = await Product.find({"_id" : {$in: productIds}})
    
        if(!foundProducts || !foundProducts.length === productIds.length){
            return res.status(400).json({
                success: false,
                message: "Some Products Were not Found"
            })
        }
        
        const newOrder = await Order.create({
            orderedBy : user._id,
            ordered : productIds
        })
        

        if(!newOrder){
            return res.status(500).json({
                success: false,
                message: "Order request Failed"
            })
        }
        // const itemNumber = productIds.length
    
        // user.orders.push(productIds)
        // user.ordered.items.push(itemNumber)
        // await user.save()
    
        return res.status(200).json({
            success: true,
            message: "Order was Succesful"
        })
    
    
} catch (error) {
    res.status(500).json({
        success: false,
        message: error.message
    })
}
}

exports.getOrder = async(req,res) => {
    try {
        const token = req.cookies?.accessToken
        if(!token){
            return res.status(401).json({
                success:false,
                loggedIn: false,
                message: "Unauthorized Access, no Token found"
            })
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const order = await Order.find({"orderedBy" : decodedToken.id}).select("ordered").populate({
            path : "ordered",
            select: "name price category"
        })

    
        if(!order) {
            return res.status(401).json({
                success: false,
                loggedIn: false,
                message: "Unauthorized Access, Invalid token"
            })
        }

        
        return res.status(200).json({
            success: true,
            message:"Orders fetched successfully",
            order
        })
    
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "something went wrong",
            error: error.message
        })
    }
}

exports.getAllOrders = async(req,res) => {

    const token = req.cookies?.accessToken

    if(!token){
        return res.status(401).json({
            success:false,
            loggedIn: false,
            message: "Unauthorized Access, no Token found"
        })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decodedToken.id).select("admin")

    if(!user || !user.admin){
        return res.status(401).json({
            success: false,
            loggedIn: false,
            message: "Unauthorized Access, Invalid token"
        })
    }

    const orders = await Order.find({pending:true}).select("orderedBy ordered pending").populate({
        path:"orderedBy",
        select:"username address email phoneNumber   "
    }).populate({
        path: "ordered",
        select: "name description price category"
    })

    if(!orders){
        return res.json({
            message: "No Orders Found"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        orders
    })

}

exports.deliveredOrder = async (req,res) => {
    try {
        const token = req.cookies?.accessToken
        if(!token){
            return res.status(401).json({
                success:false,
                loggedIn: false,
                message: "Unauthorized Access, no Token found"
            })
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedToken.id).select("admin")
        if(!user || !user.admin){
            return res.status(401).json({
                success: false,
                loggedIn: false,
                message: "Unauthorized Access, Invalid token"
            })
        }
    
        const id = req.body.id
        if(!id){
            return res.status(400).json({
                success: false,
                message: "Invalid Request"
            })
        }
    
        const order = await Order.findByIdAndUpdate({"_id": id}, {pending: false})
    
        if(!order){
            return res.status(500).json({
                success: false,
                message: "Order not found"
            })
        }
    
        await order.deleteOne();
    
        return res.status(200).json({
            success: true,
            message: "Order Delivered and Deleted"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message: "Error while deleting order",
            error: error.message
        })
    }

}

exports.addToCart = async (req,res) => {
   try {
     const token = req.cookies?.accessToken
     if(!token){
         return res.status(401).json({
             success:false,
             loggedIn: false,
             message: "Unauthorized Access, no Token found"
         })
     }
 
     const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
     const user = await User.findById(decodedToken.id).select("cart")
 
     if(!user) {
         return res.status(401).json({
             success: false,
             loggedIn: false,
             message: "Unauthorized Access, Invalid token"
         })
     }
 
     const productId = req.body.id
     if(!productId){
         return res.status(400).json({
             success: false,
             message: "Invalid Request"
         })
     }
 
     const product = await Product.findById(productId)
     if(!product){
         return res.status(400).json({
             success: false,
             message: "Product not found"
         })
     }
 
     user.cart.push(productId);
     await user.save()
 
     return res.status(200).json({
         success: true,
         message: "Product added to cart"
     })
   } catch (error) {
        return res.status(500).json({
            success: false,
            message : "error adding product to cart",
            error: error.message
        })
   }
    
}

exports.getCartDetails = async(req,res) => {
try {
    
        const token = req.cookies?.accessToken
    
        if(!token){
            return res.status(401).json({
                success:false,
                message: "Unauthorized Access, Token not found"
            })
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedToken.id).select("cart").populate({
            path: "cart",
            select: "name description price category"
        })
    
        if(!user) {
            return res.status(401).json({
                success: false,
                loggedIn: false,
                message: "Unauthorized Access, Invalid token"
            })
        }
    
        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            user
        })  
} catch (error) {
    res.status(500).json({
        success: false,
        message: "error fetching cart details",
        error: error.message
    })
}
}

exports.cancelOrder = async(req,res) => {
    try {
        const token = req.cookies?.accessToken
    
        if(!token){
            return res.status(401).json({
                success:false,
                loggedIn: false,
                message: "Unauthorized Access, no Token found"
            })
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedToken.id).select("username")
    
        if(!user) {
            return res.status(401).json({
                success: false,
                loggedIn: false,
                message: "Unauthorized Access, Invalid token"
            })
        }
    
        const id = req.body.id
        if(!id){
            return res.status(400).json({
                success: false,
                message: "Invalid Request"
            })
        }
    
        const order = await Order.findById(id).deleteOne()
    
        if(!order){
            return res.status(500).json({
                success: false,
                message: "Order not found"
            })
        }
    
        return res.status(200).json({
            success: true,  
            message: "Order Cancelled",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while cancelling order",
            error: error.message
        })
    }
}

exports.deleteCart = async(req,res) => {
    const token = req.cookies?.accessToken
    
    if(!token){
        return res.status(401).json({
            success:false,
            loggedIn: false,
            message: "Unauthorized Access, no Token found"
        })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decodedToken.id).select("username")

    if(!user) {
        return res.status(401).json({
            success: false,
            loggedIn: false,
            message: "Unauthorized Access, Invalid token"
        })
    }

    const id = req.body.id
    if(!id){
        return res.status(400).json({
            success: false,
            message: "Invalid Request"
        })
    }

    const cart = await User.updateOne(
        { _id: user._id },
        { $pull: { cart : id } }
      );

    if(!cart){
        return res.status(500).json({
            success: false,
            message: "Product not found"
        })
    }

    return res.status(200).json({
        success: true,  
        message: "Removed from cart",
    })  

}
