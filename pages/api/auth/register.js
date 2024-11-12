import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, email, password, name } = req.body;

    if (!password) {
      console.error("Password is missing in the request body");
      return res.status(400).json({ error: "Password is required" });
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Password hashed successfully");

      // Start transaction to create user and associated user profile
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'user', // Default role
          user_id: `user_${Date.now()}`,
        },
      });

      await prisma.userProfile.create({
        data: {
          userId: newUser.id,
          name: name,
        },
      });

      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error('Error during user creation:', error);
      res.status(500).json({ error: 'User creation failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
