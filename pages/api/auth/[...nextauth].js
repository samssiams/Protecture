import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Find user by username
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        // If no user is found, throw an error
        if (!user) {
          throw new Error("User not found.");
        }

        // Check if the password is correct
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Incorrect password.");
        }

        // Return essential user data for session and token storage
        return {
          id: user.id,
          username: user.username,
          email: user.email, // Include email if available
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Set the session user object to include necessary fields
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email, // Include email if needed
      };
      return session;
    },
    async jwt({ token, user }) {
      // If user exists, populate token with user info
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email; // Include email if needed
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/login', // Redirect for sign-in page
  },
  session: {
    strategy: "jwt", // Use JWT strategy for session
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure the secret is set in your environment
});