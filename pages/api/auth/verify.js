import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("Received OTP verification request:", req.body);

  if (req.method === "POST") {
    const { email, otp, username, password, name } = req.body;

    // Validate input
    if (!email || !otp || !username || !password || !name) {
      console.error("Validation failed: Missing required fields.");
      return res.status(400).json({ error: "All fields are required for OTP verification." });
    }

    try {
      // Fetch stored OTP
      console.log("Fetching stored OTP for email:", email);
      const storedOtp = await prisma.otp.findFirst({
        where: { email },
        orderBy: { createdAt: "desc" }, // Get the most recent OTP
      });

      if (!storedOtp) {
        console.error("No OTP found for email:", email);
        return res.status(400).json({ error: "No OTP found for this email. Please request a new one." });
      }

      console.log("Stored OTP:", storedOtp.otp, "Provided OTP:", otp);

      if (storedOtp.otp !== otp) {
        console.error("Invalid OTP provided.");
        return res.status(400).json({ error: "Invalid OTP." });
      }

      if (new Date() > new Date(storedOtp.expiresAt)) {
        console.error("OTP has expired for email:", email);
        return res.status(400).json({ error: "OTP has expired. Please request a new one." });
      }

      console.log("OTP is valid. Proceeding with user creation.");

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Password hashed successfully.");

      // Create the user with a profile
      let isUnique = false;
      let finalUsername = username;

      while (!isUnique) {
        try {
          const newUser = await prisma.user.create({
            data: {
              user_id: uuidv4(), // Generate a unique user ID
              username: finalUsername,
              email,
              password: hashedPassword,
              name,
              role: "user", // Default role
              profile: {
                create: {
                  profile_img: null, // Default value for profile image
                  name: name, // Name as provided
                },
              },
            },
          });
          console.log("User and profile created successfully:", newUser);
          isUnique = true; // Break loop if creation succeeds
          // Clean up OTP records
          console.log("Deleting OTP records for email:", email);
          await prisma.otp.deleteMany({ where: { email } });

          console.log("OTP records deleted successfully.");
          return res.status(201).json({ message: "User created successfully.", user: newUser });
        } catch (error) {
          if (error.code === "P2002" && error.meta?.target?.includes("username")) {
            console.warn("Username conflict detected. Generating a new username.");
            finalUsername = `${username}_${Math.floor(Math.random() * 1000)}`;
          } else {
            console.error("Error during user creation:", error);
            return res.status(500).json({ error: "Internal server error during user creation." });
          }
        }
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      return res.status(500).json({ error: "Internal server error during OTP verification." });
    }
  } else {
    console.error("Invalid request method:", req.method);
    return res.status(405).json({ error: "Method not allowed." });
  }
}