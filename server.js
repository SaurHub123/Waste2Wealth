const connectDB = require("./config/dbConnection");
const dotenv = require("dotenv").config();
const express = require("express");
const SendMail = require("./controller/sendMail");
const errorHandler=require("./middleWare/errorHandler");

// SendMail("Saurabhkumar26121999@gmail.com","OTP Verification 2451","Hello User Your OTP is 2451 please enter OTP to verify it's You. \n Please Don't Share OTP With Anyone. Waste2Wealth Never Ask you For OTP.");


// Use bodyparser for request
// use morgan for logging
// use authentication middleware for protected routes


connectDB();

console.log("Hello ");
const app = express();

const port = process.env.PORT || 5003;



app.use(express.json());
app.use("/api/user",require("./routes/userRouter"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Im inside  port at ${port}`);
});
console.log(port);
