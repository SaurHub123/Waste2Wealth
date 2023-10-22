const express=require("express");

const router=express.Router();

const {newOrder,saveOrder,getOrders,deleteOrder}=require("../controller/userController");

router.route("/:id").post(newOrder);
router.route("/otp/:id").post(saveOrder);
router.route("/orders/:id").get(getOrders);
router.route("/orders/delete/:id").delete(deleteOrder);

module.exports=router;