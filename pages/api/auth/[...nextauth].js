import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Log the received credentials for debugging purposes
          console.log("Received credentials:", credentials);

          // Find user by username
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          // Log the retrieved user data
          console.log("User found:", user);

          // If no user is found, return null (NextAuth will handle the error)
          if (!user) {
            console.error("User not found.");
            return null;
          }

          // Check if the password is correct
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          console.log("Password match:", isPasswordCorrect);

          // If the password is incorrect, return null
          if (!isPasswordCorrect) {
            console.error("Incorrect password.");
            return null;
          }

          // Return essential user data for session and token storage
          return {
            id: user.id,
            username: user.username,
            email: user.email, // Include email if available
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Log the token and session data for debugging purposes
      console.log("Session callback - token:", token);

      // Set the session user object to include necessary fields
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email, // Include email if needed
      };
      console.log("Session data set:", session);
      return session;
    },
    async jwt({ token, user }) {
      // Log the initial token and user data
      console.log("JWT callback - initial token:", token);
      console.log("JWT callback - user:", user);

      // If user exists, populate token with user info
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email; // Include email if needed
      }

      console.log("JWT callback - updated token:", token);
      return token;
    },
  },
  pages: {
    signIn: '/auth/login', // Redirect for sign-in page
    error: '/auth/error',  // Redirect for any authentication error
  },
  session: {
    strategy: "jwt", // Use JWT strategy for session
    maxAge: 24 * 60 * 60, // 1 day session expiry
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure the secret is set in your environment
  debug: true, // Enable debug mode for detailed logs (useful for Vercel logs)
};

export default NextAuth(authOptions);
