const express = require("express");
const router = express.Router()

const {
    addOrder,
    getOrder,
    getAllOrders,
    deliveredOrder,
    addToCart,
    getCartDetails,
    cancelOrder,
    deleteCart

} = require("../controller/order.controller.js")

// routes

router.route("/addOrder").post(addOrder)
router.route("/getOrder").get(getOrder)
router.route("/getAllOrders").get(getAllOrders)
router.route("/deliveredOrder").post(deliveredOrder)
router.route("/addToCart").post(addToCart)
router.route("/getCartDetails").get(getCartDetails)
router.route("/cancelOrder").post(cancelOrder)
router.route("/deleteCart").post(deleteCart)


module.exports = router