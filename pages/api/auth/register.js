import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to Generate a Random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
  console.log("Received request for OTP generation:", req.body);

  if (req.method === "POST") {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      console.error("Validation failed: Missing required fields.");
      return res.status(400).json({ error: "All fields are required for OTP generation." });
    }

    try {
      console.log("Checking if user already exists with email:", email);
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        console.error("User already exists with email:", email);
        return res.status(400).json({ error: "User with this email already exists." });
      }

      const otpCode = generateOTP();
      console.log("Generated OTP:", otpCode);

      console.log("Sending OTP email to:", email);
      await transporter.sendMail({
        from: `"Protecture" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code for Protecture",
        text: `Your OTP code is: ${otpCode}. It will expire in 5 minutes.`,
      });

      console.log("Saving OTP to database.");
      await prisma.otp.create({
        data: {
          email,
          otp: otpCode,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      });

      console.log("OTP successfully sent and saved.");
      return res.status(200).json({ message: "OTP sent to email." });
    } catch (error) {
      console.error("Error during OTP generation:", error);
      return res.status(500).json({ error: "Internal server error during OTP generation." });
    }
  } else {
    console.error("Invalid request method:", req.method);
    return res.status(405).json({ error: "Method not allowed." });
  }
}
