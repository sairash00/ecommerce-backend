const Product = require("../model/product.model.js")
const User = require( "../model/user.model.js")
const jwt = require("jsonwebtoken")
const uploadOnCloudinary = require("../utils/cloudinary.js")

// create product route - admin

exports.createProduct = async (req,res) => {

    const token = req.cookies?.accessToken
    if(!token){
        return res.status(401).json({
            success:false,
            loggedIn: false,
            message: "Unauthorized Access, no Token found"
        })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById({_id : decodedToken.id}).select("admin")

    if(!user || !user.admin){
        return res.status(401).json({
            success : flase,
            message: "Unauthorized Access"
        })
    }
    const product = req.body
    const productImages = req.files?.images

    if(!product || !productImages){
        return res.status(400).json({
            succes: false,
            message: "Product details missing"
        })
    }

    const filepaths = productImages.map(images =>images.path)
    const result = await uploadOnCloudinary(filepaths)

    const details = {
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        images: result
    }

    const createdProduct = await Product.create(details)

    if(!createdProduct){
        res.status(500).json({
            success: false,
            message: "Something went wrong, Could not add Product"
        })
    }
    
 
   return res.status(200).json({
        success: true,
        createdProduct
    })

}

// get all product route

exports.getAllProduct =async (req,res) =>{
    const token = req.cookies?.accessToken

    if(!token){
        return res.status(401).json({
            success:false,
            message: "Unauthorized Request"
        })
    }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
    const user = await User.findById(decodedToken.id).select("admin")

    if(!user || !user.admin){
        return res.status(401).json({
            success: false,
            loggedIn: false,
            message: "Unauthorized Access, Invalid token"
        })
    }

    const products = await Product.find()

    if(!products){
        return res.status(500).json({
            success: false,
            message: "Error fetching products"
        })
    }

    res.status(200).json({
        success: true,
        products
    })
}

//update product info --admin

exports.updateProduct = async(req,res) => {

    const token = req.cookies?.accessToken

    if(!token){
        return res.status(401).json({
            success:false,
            message: "Unauthorized Request"
        })
    }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
    const user = await User.findById(decodedToken.id).select("admin")

    if(!user || !user.admin){
        return res.status(401).json({
            success: false,
            loggedIn: false,
            message: "Unauthorized Access, Invalid token"
        })
    }

    let product = await Product.findById(req.params.id)
    if(!product){
        return res.status(500).json({
            success: false,
            message: "Product not found",
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValiadators: true, 
        useFindAndModify: false 
    })

    if(!product){
        return res.status(500).json({
            success:false,
            message: "Error updating product"
        })
    }

    res.status(200).json({
        success: true,
        product
    })
}

// delete product --admin

exports.deleteProduct = async(req,res) => {

    
    const token = req.cookies?.accessToken

    if(!token){
        return res.status(401).json({
            success:false,
            message: "Unauthorized Request"
        })
    }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
    const user = await User.findById(decodedToken.id).select("admin")

    if(!user || !user.admin){
        return res.status(401).json({
            success: false,
            loggedIn: false,
            message: "Unauthorized Access, Invalid token"
        })
    }

    let product = await Product.findById(req.params.id)

    if(!product){
        return res.status(500).json({
            success: false,
            message: "Product not found",
        })
    }

   const deleted =  await product.deleteOne()

   if(!deleted){
    return res.status(500).json({
        success: false,
        message: "Error deleting product"
    })
   }

    res.status(200).json({
        success: true,
        message:"product deleted successfully",
        deleted
    })
    
}

// find product detail

exports.getProductDetail= async (req, res, next) => {


       
    const token = req.cookies?.accessToken

    if(!token){
        return res.status(401).json({
            success:false,
            message: "Unauthorized Request"
        })
    }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
    const user = await User.findById(decodedToken.id).select("admin")

    if(!user || !user.admin){
        return res.status(401).json({
            success: false,
            loggedIn: false,
            message: "Unauthorized Access, Invalid token"
        })
    }
    const product = await Product.findById(req.params.id)
    
    if(!product){
        return res.status(500).json({
            success: false,
            message:"product not found"
        })
    }
    res.status(200).json({
        success: true, 
        product
    })
}