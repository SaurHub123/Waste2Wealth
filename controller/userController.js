const asyncHandler = require("express-async-handler");
const sendMail = require("./sendMail");
const { UserModel, BookingModel, OrderModel } = require("../models/userModel");

function generateOTP() {
  const length = 6;
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
}

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
}

const newOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const { location, date, hour, phone } = req.body;

    // Check if the user exists
    let user = await UserModel.findById(userId);

    // Generate OTP and booking timestamp
    const OTP = generateOTP();
    const BOOKING = Date.now();

    // Function to send an OTP confirmation email
    const sendOTPConfirmationEmail = async () => {
      const subject = "OTP Confirmation Required for Your Waste2Wealth Order";
      const text = `Dear,
  
      We hope this message finds you well. To confirm your recent order and ensure its security, we kindly request your assistance in verifying your transaction. Please enter the OTP (One-Time Password) below to complete the order confirmation process:
      
      OTP: ${OTP}
      
      This additional security step is in place to protect your account and order information. If you encounter any issues or have any questions, please don't hesitate to contact our support team at Support@Waste2Wealth.in.
      
      Thank you for choosing Waste2Wealth for your sustainable solutions.
      
      Best regards,
      
      The Waste2Wealth Team
      
              `; // Email text

      await sendMail(userId, subject, text);
    };

    if (user) {
      // User exists, add the booking to the existing user
      const newBooking = {
        booking_id: BOOKING,
        otp: OTP,
        location,
        date: new Date(date),
        verify: false,
        hour,
        picked: false,
        vendor: null,
        vendor_id: null,
        
      };

      console.log(user.bookings.push(newBooking));
      // const filter = ;
      // const update = ;
  
      const result = await UserModel.updateOne({ _id: userId}, { $set: { otp: OTP} });

      // Send OTP confirmation email
      await sendOTPConfirmationEmail();

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
            location,
            date: new Date(date),
            hour,
            verify: false,
            picked: false,
            vendor: null,
            vendor_id: null,
          },
        ],
      });

      user = await newUser.save();
      console.log("New user created and booking added:", user);
      res.status(201).json({ message: "New user created and booking added" });
      // Send OTP confirmation email
      await sendOTPConfirmationEmail();
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

const getOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findById(userId);

    if (user) {
      console.log(user.bookings);
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
      (booking) => booking.booking_id === booking_id
    );

    if (!bookingFound) {
      console.log("Booking Not Found");
      return res.status(404).json({ message: "Booking not found" });
    }

    try {
      const orderDeletionResult = await OrderModel.deleteOne({ orderid });

      if (orderDeletionResult.deletedCount === 1) {
        const userOrderDeletion = await UserModel.updateOne(
          { _id: userId },
          { $pull: { bookings: { booking_id: booking_id } } }
        );

        if (userOrderDeletion.nModified === 1) {
          console.log("Order deleted successfully.");
        } else {
          console.log("Order not found in user bookings.");
        }

        if (await updateUserAndOrderVerification(userId, booking_id)) {
          res.status(204).json({ message: "Order deleted successfully" });
        } else {
          console.log("Unable to update OTP to null and booking to true");
          res
            .status(304)
            .json({ message: "Unable to update order verification" });
        }
      } else {
        console.log("Order not found in orders collection.");
        res
          .status(404)
          .json({ message: "Order not found in orders collection" });
      }
    } catch (error) {
      console.log("Error:", error);
      res.status(304).json({ message: "Unable to update order verification" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = { newOrder, saveOrder, getOrders, deleteOrder };
