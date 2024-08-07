const express=require("express");

const router=express.Router();

const {newOrder,saveOrder,getOrders,deleteOrder,getOrderOtp, contactUs, verifyUser}=require("../controller/userController");

router.route("/:id").post(newOrder);
router.route("/otp/:id").post(saveOrder);
router.route("/orders/:id").post(getOrders);  
router.route("/delete/:id/:booking_id").delete(deleteOrder);
router.route("/order/otp/:id").post(getOrderOtp);
router.route("/contactUs/:id").post(contactUs);
router.route("/verifyUser/:id").get(verifyUser);

module.exports=router;
