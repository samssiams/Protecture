import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Initialize Prisma client
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
        try {
          // Find user by username
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user) {
            console.error("User not found");
            throw new Error("User not found.");
          }

          // Verify the password
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordCorrect) {
            console.error("Incorrect password");
            throw new Error("Incorrect password.");
          }

          // Log user details (for debugging)
          console.log("User authenticated successfully:", user);

          // Return user data to be used in the session
          return {
            id: user.id,
            username: user.username,
            email: user.email,
          };
        } catch (error) {
          console.error("Error during authorization:", error.message);
          throw new Error("An error occurred during authorization.");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log("Session callback - token:", token);

      // Ensure the session contains the necessary user data
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email, // Optional: Include email if needed
      };

      return session;
    },
    async jwt({ token, user }) {
      console.log("JWT callback - initial token:", token);
      console.log("JWT callback - user:", user);

      if (user) {
        // Add the user data to the token on login
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }

      console.log("JWT callback - updated token:", token);
      return token;
    },
  },
  pages: {
    signIn: "/auth/login", // Custom sign-in page path
    error: "/auth/error",  // Error page (optional)
  },
  session: {
    strategy: "jwt", // Use JWT strategy for session management
    maxAge: 24 * 60 * 60, // Session expires after 1 day (in seconds)
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure the secret is securely set
  debug: true, // Enable debugging for detailed logs (disable in production)
});
