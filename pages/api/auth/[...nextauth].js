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
      authorize: async (credentials) => {
        // Validate credentials input
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password.");
        }

        // Fetch user from database
        const user = await prisma.user.findFirst({
          where: { username: credentials.username },
          include: {
            profile: true, // Fetch related profile information
          },
        });

        if (!user) {
          throw new Error("User not found.");
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) {
          throw new Error("Incorrect password.");
        }

        // Return user object to be encoded in the session and JWT
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          profileImg: user.profile?.profile_img || null, // Include profile image
        };
      },
    }),
  ],

  // Use JWT for sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT options
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  callbacks: {
    // Attach user data to the session object
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          username: token.username,
          email: token.email,
          profileImg: token.profileImg, // Include profile image in session
        };
      }
      return session;
    },

    // Attach user data to the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.profileImg = user.profileImg; // Include profile image in JWT
      }
      return token;
    },
  },

  pages: {
    signIn: "/auth/login", // Redirect here for login
    error: "/auth/error", // Redirect here for errors
  },

  // Use secure secret for signing and encryption
  secret: process.env.NEXTAUTH_SECRET,

  // Debugging for development; disable in production
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
