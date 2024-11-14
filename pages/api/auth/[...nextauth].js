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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Find user by username
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          if (!user) {
            console.error("User not found");
            throw new Error("User not found.");
          }

          // Verify password
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) {
            console.error("Incorrect password");
            throw new Error("Incorrect password.");
          }

          // Return user data if login is successful
          return {
            id: user.id,
            username: user.username,
            email: user.email, // Include email if needed
          };
        } catch (error) {
          console.error("Error during authorization", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      console.log("JWT token", token);

      // Add user data to the session
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email, // Include email if needed
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Populate token with user info on login
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure the secret is set in the environment variables
  debug: true, // Enable debugging for more detailed logs
});
