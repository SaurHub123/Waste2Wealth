const asyncHandler = require("express-async-handler");
const sendMail = require("./sendMail");
const crypto = require("crypto");
const { UserModel, BookingModel, OrderModel, FormModel } = require("../models/userModel");

function generateOTP() {
  const length = 6;
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
};

async function updateUserAndOrderVerification(userId, bookingId) {
  try {
    const filter = { _id: userId, "bookings.booking_id": bookingId };
    const update = { $set: { otp: null, "bookings.$.verify": true } };

    const result = await UserModel.updateOne(filter, update);

    console.log("Result :", result);

    if (result.matchedCount == 1) {
      // Update was successful
      console.log("User and order verification updated:", userId, bookingId);
      return true;
    } else {
      console.log("User or booking not found");
      return false;
    }
  } catch (error) {
    console.error("Error updating user and order verification:", error);
    throw error; // Handle the error as needed
  }
};



const sendOTPConfirmationEmail = async (userId,OTP) => {
      const subject = "OTP Confirmation Required for Your Waste2Wealth Order";
      const text = `Dear,
  
      We hope this message finds you well. To confirm your recent order and ensure its security, we kindly request your assistance in verifying your transaction. Please enter the OTP (One-Time Password) below to complete the order confirmation process:
      
      OTP: ${OTP}
      
      This additional security step is in place to protect your account and order information. If you encounter any issues or have any questions, please don't hesitate to contact our support team at Support@Waste2Wealth.in.
      
      Thank you for choosing Waste2Wealth for your sustainable solutions.
      
      Best regards,
      
      The Waste2Wealth Team
      
              `; // Email text
  const WalmartText = `'<!DOCTYPE html>\r\n' +
    '<html>\r\n' +
    '<head>\r\n' +
    '    <style>\r\n' +
    '        body {\r\n' +
    '            font-family: Arial, sans-serif;\r\n' +
    '            line-height: 1.6;\r\n' +
    '            margin: 0;\r\n' +
    '            padding: 0;\r\n' +
    '            background-color: #f9f9f9;\r\n' +
    '        }\r\n' +
    '        .container {\r\n' +
    '            width: 100%;\r\n' +
    '            max-width: 800px;\r\n' +
    '            margin: 20px auto;\r\n' +
    '            padding: 20px;\r\n' +
    '            background-color: #ffffff;\r\n' +
    '            border: 1px solid #dddddd;\r\n' +
    '            border-radius: 8px;\r\n' +
    '            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\r\n' +
    '        }\r\n' +
    '        h2 {\r\n' +
    '            color: #333333;\r\n' +
    '        }\r\n' +
    '        p {\r\n' +
    '            color: #555555;\r\n' +
    '        }\r\n' +
    '        table {\r\n' +
    '            font-family: Arial, sans-serif;\r\n' +
    '            border-collapse: collapse;\r\n' +
    '            width: 100%;\r\n' +
    '            margin-top: 20px;\r\n' +
    '            margin-bottom: 20px;\r\n' +
    '        }\r\n' +
    '        th, td {\r\n' +
    '            border: 1px solid #dddddd;\r\n' +
    '            text-align: left;\r\n' +
    '            padding: 8px;\r\n' +
    '        }\r\n' +
    '        tr:nth-child(even) {\r\n' +
    '            background-color: #f2f2f2;\r\n' +
    '        }\r\n' +
    '        .status-pass {\r\n' +
    '            color: white;\r\n' +
    '            background-color: green;\r\n' +
    '            text-align: center;\r\n' +
    '            padding: 5px;\r\n' +
    '            border-radius: 3px;\r\n' +
    '        }\r\n' +
    '        .status-fail {\r\n' +
    '            color: white;\r\n' +
    '            background-color: red;\r\n' +
    '            text-align: center;\r\n' +
    '            padding: 5px;\r\n' +
    '            border-radius: 3px;\r\n' +
    '        }\r\n' +
    '    </style>\r\n' +
    '</head>\r\n' +
    '<body>\r\n' +
    '    <div class="container">\r\n' +
    '        <h2>Test Case Results</h2>\r\n' +
    '        <p>\r\n' +
    '            In the dynamic world of gen AI, one-size-fits-all approaches are inadequate. As businesses strive to harness the power of AI, having a spectrum of model choices at your disposal is necessary for innovation, competitive advance, time to market, and more.\r\n' +
    '        </p>\r\n' +
    '\r\n' +
    '        <table>\r\n' +
    '            <tr>\r\n' +
    '                <th>Test Case</th>\r\n' +
    '                <th>Start Time</th>\r\n' +
    '                <th>End Time</th>\r\n' +
    '                <th>Status</th>\r\n' +
    '                <th>Test Case ID</th>\r\n' +
    '            </tr>\r\n' +
    '            \r\n' +
    '                <tr>\r\n' +
    '                    <td>Register user via UI</td>\r\n' +
    '                    <td>2024-06-01 10:00</td>\r\n' +
    '                    <td>2024-06-01 10:30</td>\r\n' +
    '                    <td class="status-pass">PASS</td>\r\n' +
    '                    <td>SAMSQA-9103</td>\r\n' +
    '                </tr>\r\n' +
    '            \r\n' +
    '                <tr>\r\n' +
    '                    <td>Merge cart as anonymous user</td>\r\n' +
    '                    <td>2024-06-01 11:00</td>\r\n' +
    '                    <td>2024-06-01 11:30</td>\r\n' +
    '                    <td class="status-fail">FAIL</td>\r\n' +
    '                    <td>SAMSQA-9104</td>\r\n' +
    '                </tr>\r\n' +
    '            \r\n' +
    '                <tr>\r\n' +
    '                    <td>Register user via UI</td>\r\n' +
    '                    <td>2024-06-01 10:00</td>\r\n' +
    '                    <td>2024-06-01 10:30</td>\r\n' +
    '                    <td class="status-pass">PASS</td>\r\n' +
    '                    <td>SAMSQA-9103</td>\r\n' +
    '                </tr>\r\n' +
    '            \r\n' +
    '                <tr>\r\n' +
    '                    <td>Merge cart as anonymous user</td>\r\n' +
    '                    <td>2024-06-01 11:00</td>\r\n' +
    '                    <td>2024-06-01 11:30</td>\r\n' +
    '                    <td class="status-fail">FAIL</td>\r\n' +
    '                    <td>SAMSQA-9104</td>\r\n' +
    '                </tr>\r\n' +
    '            \r\n' +
    '                <tr>\r\n' +
    '                    <td>Register user via UI</td>\r\n' +
    '                    <td>2024-06-01 10:00</td>\r\n' +
    '                    <td>2024-06-01 10:30</td>\r\n' +
    '                    <td class="status-pass">PASS</td>\r\n' +
    '                    <td>SAMSQA-9103</td>\r\n' +
    '                </tr>\r\n' +
    '            \r\n' +
    '                <tr>\r\n' +
    '                    <td>Merge cart as anonymous user</td>\r\n' +
    '                    <td>2024-06-01 11:00</td>\r\n' +
    '                    <td>2024-06-01 11:30</td>\r\n' +
    '                    <td class="status-fail">FAIL</td>\r\n' +
    '                    <td>SAMSQA-9104</td>\r\n' +
    '                </tr>\r\n' +
    '            \r\n' +
    '        </table>\r\n' +
    '\r\n' +
    '        <p>\r\n' +
    '            As graduation season winds down, another cohort of Gen Zers enters a labor market that is being transformed by AI. A global study conducted by IBM found that executives estimate implementing AI will require 40% of their workforce to reskill over the next three years, with the bulk of this falling on entry-level employees.\r\n' +
    '        </p>\r\n' +
    '    </div>\r\n' +
    '</body>\r\n' +
    '</html>\r\n'`;

      await sendMail(userId, subject, WalmartText);
    };


const verifyUser = asyncHandler(
      async (req,res)=>{
        const email = req.params.id;
        const Otp = crypto.randomInt(100000,999999);
        const subject = "OTP Verification for Campus-Swap";
        const text = `
        Dear,

We hope this message finds you well. To confirm your recent order and ensure its security, we kindly request your assistance in verifying your transaction. Please enter the OTP (One-Time Password) below to complete the order confirmation process:

OTP: ${Otp}

This additional security step is in place to protect your account and order information. If you encounter any issues or have any questions, please don't hesitate to contact our support team at Support@Waste2Wealth.in.

Thank you for choosing Campus-Swap for your sustainable solutions.

Best regards,

The Campus-Swap Team
Powered By Waste2Wealth`;

try {

  await sendMail(email,subject,text);
  res.status(200).json({
    message:"OTP Send Successfullt",
    OTP:Otp,

  })
  
} catch (error) {

    console.log(error);
    res.status(500).json({
      message:"Internal Server Error",
    })
    
  }

   });


const newOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const { location, date, hour, phone, landmark, name } = req.body;

    console.log("Data",location, date, hour, phone, landmark, name);

    // Check if the user exists
    let user = await UserModel.findById(userId);

    // Generate OTP and booking timestamp
    const OTP = generateOTP();
    const BOOKING = Date.now();

    // Function to send an OTP confirmation email
    
    if (user) {
      // User exists, add the booking to the existing user
      const newBooking = {
        booking_id: BOOKING,
        otp: OTP,
        name,
        landmark,
        phone,
        location,
        date: new Date(date),
        verify: false,
        hour,
        picked: false,
        vendor: null,
        vendor_id: null,
        
      };

      console.log(user.bookings.push(newBooking));
  
      const result = await UserModel.updateOne({ _id: userId}, { $set: { otp: OTP} });

      // Send OTP confirmation email
      await sendOTPConfirmationEmail(userId,OTP);

      // Save the user with the new booking
      user = await user.save();
      console.log("Booking added to existing user:", user);
      res.status(201).json({ user_id: userId, booking_id: BOOKING });
    } else {
      // User doesn't exist, create a new user and add the booking
      const newUser = new UserModel({
        _id: userId,
        phone,
        otp: OTP,
        bookings: [
          {
            booking_id: BOOKING,
            otp: OTP,
            name,
            landmark,
            phone,
            location,
            date: new Date(date),
            verify: false,
            hour,
            picked: false,
            vendor: null,
            vendor_id: null,
          },
        ],
      });

      user = await newUser.save();
      console.log("New user created and booking added:", user);
      res.status(201).json({ message: "New user created and booking added", user_id: userId, booking_id: BOOKING  });
      // Send OTP confirmation email
      await sendOTPConfirmationEmail(userId,OTP);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const saveOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const { otp, booking_id } = req.body;
    const orderid = userId + booking_id;

    const user = await UserModel.findOne({
      _id: userId,
      "bookings.booking_id": booking_id,
    });

    if (!user) {
      console.log("User Not Found");
      return res.status(404).json({ message: "User not found" });
    }

    const bookingFound = user.bookings.find(
      (booking) => booking.booking_id == booking_id
    );

    console.log(bookingFound);

    if (!bookingFound) {
      console.log("Booking Not Found");
      return res.status(404).json({ message: "Booking not found" });
    }

    if (user.otp != otp) {
      console.log("OTP Doesn't Match");
      return res.status(400).json({ message: "OTP does not match" });
    }

    // Create the new order
    // const newOrderData = ;

    try {
      const newOrder = await OrderModel.create({
        user_id: userId,
        _id: orderid,
        booking_id,
        phone: user.phone,
        landmark:  bookingFound.landmark,
        location: bookingFound.location,
        date: bookingFound.date,
        hour: bookingFound.hour,
      });
      const stat = await updateUserAndOrderVerification(userId, booking_id);
      if (stat) {
        const subject = `Confirmation of Your Order (Order ID: ${booking_id})`;
        const text = `Dear,
        
        We are excited to inform you that your order with Order ID ${booking_id} has been successfully confirmed. We appreciate your commitment to sustainability and thank you for choosing Waste2Wealth for your eco-friendly needs.
        
        To ensure a seamless experience, we will share the vendor's details with you as soon as we receive confirmation from the vendor. Rest assured, we are actively working to expedite this process and will provide you with the necessary information as soon as possible.
        
        In the meantime, should you have any questions or require assistance, please feel free to reach out to our dedicated support team at [Support Email or Phone Number]. Your satisfaction is our top priority, and we are here to assist you every step of the way.
        
        Thank you for your order and your contribution to making the world a greener place.
        
        Best regards,
        
        The Waste2Wealth Team`; // Email text

        await sendMail(userId, subject, text);
        res
          .status(201)
          .json({ message: "Order created successfully", newOrder });
      } else {
        console.log("Unable to Update OTP to null and booking to true");
        res
          .status(304)
          .json({ message: "Unable to Create New Order in user Order" });
      }
    } catch (error) {
      console.log("Error:", error);
      res
        .status(304)
        .json({ message: "error While Creating New Order in user Order" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getOrderOtp=asyncHandler(async(req,res)=>{
  try {
     const userId = req.params.id;

    const user = await UserModel.findById(userId);
    if (user) { //User Found 
      const OTP=generateOTP();
      const result = await UserModel.updateOne({_id:userId},{$set:{otp:OTP}});
      console.log("Result of updateOne",result);
      if(result.matchedCount==1)
      {
        sendOTPConfirmationEmail(userId,OTP);
        res.status(200).json({message:`OTP Sent Succesfully to user ${userId}`});
      }
      else{
        res.status(400).json({message:`OTP Can't Sent Succesfully to user ${userId}`}); 
      }
    } else {
      console.log("User Doesn't Exist");
      res.status(404).json({ message: "User Doesn't Exist" });
    }
    
  } catch (error) {
    console.log("Error:",error);
    res.status(500).json({message:"Internal Sevrer error"})
    
  }

});

const getOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const {otp}=req.body;

    const user = await UserModel.findById(userId);

    if (user) { //User Found 
      console.log(user.bookings);
      console.log("user.otp=",user.otp);
      console.log("otp=",otp);
      if(user.otp==otp){
        console.log("Bookings :",user.bookings);
        
        const result = await UserModel.updateOne({_id:userId},{$set:{otp:null}});
        // if(result.matchedCount==1)
        
        res.status(200).json({ data: user.bookings });
         
      }
      else{
        console.log("OTP Doesn't Match");
      res.status(404).json({ message: "OTP Doesn't Match" });

      }
      res.status(200).json({ message: user.bookings });
    } else {
      console.log("User Doesn't Exist");
      res.status(404).json({ message: "User Doesn't Exist" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const booking_id = req.params.booking_id;
    const orderid = userId + booking_id;
    console.log("UserId",userId,"bookingId",booking_id,"orderId",orderid);

    const user = await UserModel.findOne({
      _id: userId,
      "bookings.booking_id": booking_id,
    });

    if (!user) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (user.otp !== null) {
      return res.status(403).json({ message: "OTP not verified" });
    }

    const bookingFound = user.bookings.find(
      (booking) => booking.booking_id == booking_id
    );

    if (!bookingFound) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const orderDeletionResult = await OrderModel.deleteOne({ _id:orderid });
    console.log("OrderDelettion",orderDeletionResult);

    if (orderDeletionResult.deletedCount === 1) {
      const userOrderDeletion = await UserModel.updateOne(
        { _id: userId },
        { $pull: { bookings: { booking_id: booking_id } } }
      );

      if (userOrderDeletion.matchedCount === 1) {
        return res.status(200).json({ message: "Order deleted successfully from User and Order" });
      } else {
        return res.status(403).json({ message: "Unable to delete from user order From User and Order" });
      }
    } else {
      const userOrderDeletion = await UserModel.updateOne(
        { _id: userId },
        { $pull: { bookings: { booking_id: booking_id } } }
      );

      if (userOrderDeletion.matchedCount === 1) {
        return res.status(200).json({ message: "Order deleted successfully from User" });
      } else {
        return res.status(403).json({ message: "Unable to delete from user order From User" });
      }
      // return res.status(404).json({ message: "Order not found in orders collection" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const contactUs = asyncHandler(async(req,res)=>{

  const email = req.params.id;
  const {phone,name,message}=req.body;

  try {

    const form = await FormModel.create({
      _id:email,
      phone:phone,
      name:name,
      message:message
    });

    console.log("form ",form);
    res.status(201).json({message:"Response Saved Successfully "})
    
  } catch (error) {
    console.log("Errro:",error);
    res.status(500).json({message:"Response Not saved Successfully "})
    
  }

});

module.exports = { newOrder, saveOrder, getOrders, deleteOrder,getOrderOtp, contactUs, verifyUser };
