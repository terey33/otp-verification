require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const otpStorage = {}; // Stores OTPs and attempts

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = crypto.randomInt(100000, 999999).toString();
  otpStorage[email] = { otp, expiryTime: Date.now() + 65000, attempts: 3 };

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP Code",
    html: `
           <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; width: fit-content;">
           <h2 style="color: #333; text-align: center;">Your OTP Code</h2>
           <p style="font-size: 14px; color: #555;">Use the OTP below to verify your identity. This OTP will expire in <strong>1 minute</strong>.</p>
           <h1 style="font-size: 24px; color: #d9534f; text-align: center;">${otp}</h1>
           </div>
       `,
  };

  try {
    await transporter.sendMail(mailOptions);
    setTimeout(() => delete otpStorage[email], 65000);
    res.json({ message: "OTP sent!", expiryTime: otpStorage[email].expiryTime });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!otpStorage[email]) return res.status(400).json({ message: "OTP expired or not found. Request a new OTP." });

  if (otpStorage[email].attempts === 0) {
    return res.status(400).json({ message: "Too many failed attempts. Request a new OTP." });
  }

  if (otpStorage[email].otp === otp) {
    delete otpStorage[email];
    return res.json({ message: "OTP verified successfully!" });
  } 
  
  otpStorage[email].attempts--;
  res.status(400).json({ message: "Invalid OTP", attemptsLeft: otpStorage[email].attempts });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
