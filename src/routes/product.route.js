const {
    getAllProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetail,
    } = require('../controller/product.controller.js')

    const express = require('express');
    const upload = require("../middleware/multer.middleware.js")
    const router = express.Router()

// routes setup



router.route('/getAllProduct').get(getAllProduct)
router.route("/createProduct").post(upload.fields([
    {
        name: "images",
        maxCount:  4
    }
]) ,createProduct)
router.route("/updateProduct/:id").put(updateProduct)
router.route("/deleteProduct").post(deleteProduct)
router.route("/getProductDetail/:id").get(getProductDetail)

module.exports = router;