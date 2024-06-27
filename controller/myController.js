
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
      const filter = { _id: userId, 'bookings.booking_id': bookingId };
      const update = { $set: { otp: null, 'bookings.$.verify': ture } };
  
      const result = await UserModel.updateOne(filter, update);
  
      if (result.nModified === 1) {
        // Update was successful
        console.log('User and order verification updated:', userId, bookingId);
        return true;
      } else {
        console.log('User or booking not found');
        return false;
      }
    } catch (error) {
      console.error('Error updating user and order verification:', error);
      throw error; // Handle the error as needed
    }
  };
  
  
  
  
  // async function updateUserStatus(userId) {
  //   try {
  //     const user = await UserModel.findOneAndUpdate(
  //       { _id: userId },
  //       { otp: null, verify: false },
  //       { new: true } // This option returns the updated document
  //     );
  
  //     if (!user) {
  //       console.error('User not found');
  //       return null; // You can return a specific value or throw an error here
  //     }
  
  //     // User document has been updated with otp=null and verify=false
  //     console.log('User verification updated:', user);
  //     return user;
  //   } catch (error) {
  //     console.error('Error updating user verification:', error);
  //     throw error; // Handle the error as needed
  //   }
  // }
  
  
  //@desc Get All orders
  //@route Get /api/user
  //@access public
  
  const getOrders = asyncHandler(async (req, res) => {
  
    const userId=req.params.id;
  
    let user = await UserModel.findById(userId);
  
    if(user)
    {
      console.log(user.bookings);
      res.status(200).json({message:user.bookings})
  
    }
    else{
      console.log("User Doesn't Exist");
      res.status(403).json({message:"User Doesn't Exist"});
    }
    
  });
  
  
  
  const deleteOrder = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { otp, booking_id } = req.body;
    const orderid = userId + booking_id;
  
    try {
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
        const orderDeletionResult = await OrderModel.deleteOne({ orderid: userId + booking_id });
        if (orderDeletionResult.deletedCount === 1) {
  
          const userOrdereDeletion=await UserModel.updateOne({ _id: userId },
            { $pull: { bookings: { booking_id: bookingId } }} );
          console.log('Order deleted successfully.');
        
        } else {
  
          console.log('Order not found.');
        
        }
  
        if(await updateUserAndOrderVerification(userId,booking_id))
        {
  
        res.status(201).json({ message: "Order created successfully", newOrder });
  
        }
        else{
  
        console.log("Unable to Upadte otp to null and booking to true");
        res.status(304).json({message:"Unable to Create New Order in user Order"});
  
        }
        
      } catch (error) {
        console.log("Error:",error);
        res.status(304).json({message:"Unable to Create New Order in user Order"});
      }
  
      
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  
  
  
  
  // First Time API hit after getting { location, date, hour, phone } from User and send OTP 
  
  const newOrder = asyncHandler(async (req, res) => {
    try {
      // Generate OTP and booking timestamp
      const OTP = generateOTP();
      const BOOKING = Date.now();
  
      const userId = req.params.id;
      const { location, date, hour, phone } = req.body;
  
      // Check if the user exists
      let user = await UserModel.findById(userId);
  
      if (user) {
        // User exists, add the booking to the existing user
        const newBooking = new BookingModel({
          booking_id: BOOKING,
          otp: OTP, // why storing OTP in the database? Necessary..It would be disposed just after 5 minutes maybe or 1 minutes.. so we don't need to store it in db.. or we can have a auto disposer for otp field afte the expired time it should be removed from the db..
          location: location,
          date: new Date(date),
          verify:false,
          hour: hour,
          picked: false,
          vendor: null,
          vendor_id: null,
        });
  
        // Push the new booking to the user's bookings array
        user.bookings.push(newBooking);
  
        // Send OTP confirmation email
        const subject = "OTP Confirmation Required for Your Waste2Wealth Order";
        const text = `Dear,
  
  We hope this message finds you well. To confirm your recent order and ensure its security, we kindly request your assistance in verifying your transaction. Please enter the OTP (One-Time Password) below to complete the order confirmation process:
  
  OTP: ${OTP}
  
  This additional security step is in place to protect your account and order information. If you encounter any issues or have any questions, please don't hesitate to contact our support team at Support@Waste2Wealth.in.
  
  Thank you for choosing Waste2Wealth for your sustainable solutions.
  
  Best regards,
  
  The Waste2Wealth Team
  
          `;
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
  
        // Save the user with the new booking
        user = await user.save();
  
        console.log("Booking added to existing user:", user);
        res.status(201).json({ user_id: userId, booking_id: BOOKING });
      } else {
        // User doesn't exist, create a new user and add the booking
        const newUser = new UserModel({
          _id: userId,
          phone: phone, 
          otp: OTP,
          bookings: [
            {
              booking_id: BOOKING,
              otp: OTP, // same logic as above
              location: location,
              date: new Date(date),
              hour: hour,
              verify:false,
              picked: false,
              vendor: null,
              vendor_id: null,
            },
          ],
        });
  
        user = await newUser.save();
  
        console.log("New user created and booking added:", user);
        res.status(201).json({ message: "New user created and booking added" });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // const newOrder=asyncHandler(async(req,res)=>{
  //   const OTP = generateOTP();
  //   const BOOKING=Date.now();
  //   const userId=req.params.id;
  //   const {location,date,hour,phone}=req.body;
  
  //   // New booking details
  //   const newBooking = new BookingModel({
  //     booking_id: BOOKING,
  //     otp: OTP,
  //     location: location,
  //     date: Date(date),
  //     hour: hour,
  //     picked: false,
  //     vendor: null,
  //     vendor_id: null
  //   });
  
  //   // Check if the user exists
  //   await UserModel.findById(userId, async (err, user) => {
  //     if (err) {
  //       console.error('Error finding user:', err);
  //       res.status(404).json({message:"Error finding user"});
  //     }
  
  //     if (user) {
  //         // User exists, add the booking to the existing user
  //         const subject="OTP Confirmation Required for Your Waste2Wealth Order";
  //         const text =`Dear,
  
  //         We hope this message finds you well. To confirm your recent order and ensure its security, we kindly request your assistance in verifying your transaction. Please enter the OTP (One-Time Password) below to complete the order confirmation process: \n
  
  //         OTP: ${OTP} \n
  
  //         This additional security step is in place to protect your account and order information. If you encounter any issues or have any questions, please don't hesitate to contact our support team at Support@Waste2Wealth.in.\n
  
  //         Thank you for choosing Waste2Wealth for your sustainable solutions.\n
  
  //         Best regards,\n
  
  //         The Waste2Wealth Team\n
  
  //                       `;
  //         sendMail(userId,subject,text);
  //         user.bookings.push(newBooking);
  //         try {
  //           await user.save();
  //           console.log('Booking added to existing user:', user);
  //           res.status(201).json({"user_id":userId,"booking_id":BOOKING});
  //         } catch (error) {
  //           console.error('Error adding booking to existing user:', error);
  //           res.status(400).json({message:"Error adding booking to existing user:"});
  //         }
  
  //     } else {
  //       // User doesn't exist, create a new user and add the booking
  //       const newUser = new UserModel({
  //         _id: userId,  // Use the provided user ID or a unique identifier
  //         phone: phone,  // Provide a phone number for the new user
  //         verify:false,
  //         otp:OTP, // Provide a verification status for the new user
  //         bookings: [newBooking]  // Add the new booking to the bookings array
  //       });
  
  //       try {
  //         const savedUser = await newUser.save();
  //         console.log('New user created and booking added:', savedUser);
  //         res.status(201).json({message:"New user created and booking added"})
  //       } catch (error) {
  //         console.error('Error creating new user and adding booking:', error);
  //         res.status(400).json({message:"Error creating new user and adding booking:"})
  //       }
  //     }
  //   });
  
  // });
  
  var x;
  
  // Second Time API hit to Verify OTP
  
  
  const saveOrder = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { otp, booking_id } = req.body;
    const orderid = userId + booking_id;
  
    try {
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
  
      if (user.otp !== otp) {
        console.log("OTP Doesn't Match");
        return res.status(400).json({ message: "OTP does not match" });
      }
      
      try {
        const newOrder = await OrderModel.create({
          userId,
          orderid,
          booking_id,
          phone: user.phone,
          location: bookingFound.location,
          date: bookingFound.date,
          hour: bookingFound.hour,
        });
  
        if(await updateUserAndOrderVerification(userId,booking_id))
        {
  
          const subject = `Confirmation of Your Order (Order ID: ${booking_id})`;
        const text = `Dear,
        
        We are excited to inform you that your order with Order ID ${booking_id} has been successfully confirmed. We appreciate your commitment to sustainability and thank you for choosing Waste2Wealth for your eco-friendly needs.
        
        To ensure a seamless experience, we will share the vendor's details with you as soon as we receive confirmation from the vendor. Rest assured, we are actively working to expedite this process and will provide you with the necessary information as soon as possible.
        
        In the meantime, should you have any questions or require assistance, please feel free to reach out to our dedicated support team at [Support Email or Phone Number]. Your satisfaction is our top priority, and we are here to assist you every step of the way.
        
        Thank you for your order and your contribution to making the world a greener place.
        
        Best regards,
        
        The Waste2Wealth Team`;
        sendMail(userId, subject, text);
        res.status(201).json({ message: "Order created successfully", newOrder });
  
        }
        else{
  
        console.log("Unable to Upadte otp to null and booking to true");
        res.status(304).json({message:"Unable to Create New Order in user Order"});
  
        }
        
      } catch (error) {
        console.log("Error:",error);
        res.status(304).json({message:"Unable to Create New Order in user Order"});
      }
  
      
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // const saveOrder=asyncHandler(async(req,res)=>{
  
  //   const userId=req.params.id;
  //   const {otp,booking_id}=req.body;
  //   const orderid=userId+booking_id;
  //   UserModel.findOne(
  //     { _id: userId, 'bookings.booking_id': booking_id},
  //     { 'bookings.$': 1 }, // Projects only the matched booking from the array
  //     (err, user) => {
  //       if (err) {
  //         console.error('Error finding user:', err);
  //       } else if (user) {
  //         if (user.bookings.length > 0) {
  //           const bookingFound = user.bookings[0];
  //           if(bookingFound.otp== otp){
  //             const newOrder= await OrderModel.create({
  //               userId,
  //               orderid,
  //               booking_id,
  //               user.phone,
  //               bookingFound.location,
  //               bookingFound.date,
  //               bookingFound.hour
  
  //             });
  
  //           }
  //         } else {
  //           console.log('Booking not found.');
  //         }
  //       } else {
  //         console.log('User not found.');
  //       }
  //     }
  //   );
  
  // });
  
