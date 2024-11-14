// pages/api/auth/[...nextauth].js
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
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user) {
          throw new Error("User not found.");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email, // Include email if available
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Ensure that session.user includes all necessary fields
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email, // Include email if needed
      };
      return session;
    },
    async jwt({ token, user }) {
      // Store user info in token on login
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email; // Include email if needed
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
  secret: process.env.NEXTAUTH_SECRET,
});
