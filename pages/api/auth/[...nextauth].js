// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import routes from "@/routes"; // Ensure this matches your project structure

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter your username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { username, password } = credentials;

        if (!username || !password) {
          throw new Error("Username and password are required.");
        }

        // Find the user (case-insensitive)
        const user = await prisma.user.findFirst({
          where: {
            username: {
              equals: username,
              mode: "insensitive",
            },
          },
          include: { profile: true },
        });

        if (!user) {
          throw new Error("Invalid username or password.");
        }

        if (!user.password) {
          throw new Error("Invalid username or password.");
        }

        // Check if the account is suspended
        const currentTime = new Date();
        if (user.suspendedUntil && user.suspendedUntil > currentTime) {
          throw new Error(
            `Your account is suspended until ${new Date(user.suspendedUntil).toLocaleString()}.`
          );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid username or password.");
        }

        // Normalize role to lowercase for consistency
        const normalizedRole = user.role ? user.role.toLowerCase() : "user";

        // Return user object with role
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: normalizedRole,
          profileImg: user.profile?.profile_img || null,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role; // Include role in token
        token.profileImg = user.profileImg;
      }

      if (account?.provider === "google" && profile) {
        let userRecord = await prisma.user.findFirst({
          where: { email: profile.email },
        });

        if (!userRecord) {
          let username = profile.name || profile.email.split("@")[0];

          // Ensure username uniqueness
          let isUnique = false;
          while (!isUnique) {
            try {
              userRecord = await prisma.user.create({
                data: {
                  username: username.toLowerCase(),
                  email: profile.email,
                  role: "user",
                  user_id: `user_${Date.now()}`,
                  profile: {
                    create: {
                      profile_img: profile.picture || null,
                      name: profile.name || null,
                    },
                  },
                },
              });
              isUnique = true; // Break loop if creation succeeds
            } catch (error) {
              if (
                error.code === "P2002" &&
                error.meta?.target?.includes("username")
              ) {
                username = `${username}_${Math.floor(Math.random() * 1000)}`;
              } else {
                throw error;
              }
            }
          }
        }

        const currentTime = new Date();
        if (userRecord.suspendedUntil && userRecord.suspendedUntil > currentTime) {
          throw new Error(
            `Your account is suspended until ${new Date(
              userRecord.suspendedUntil
            ).toLocaleString()}.`
          );
        }

        const normalizedRole = userRecord.role ? userRecord.role.toLowerCase() : "user";

        token.id = userRecord.id;
        token.username = userRecord.username;
        token.email = userRecord.email;
        token.role = normalizedRole; // Include normalized role from database
        token.profileImg =
          userRecord.profile?.profile_img || profile.picture || null;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        const user = await prisma.user.findUnique({
          where: { id: token.id },
        });

        if (user?.suspendedUntil && user.suspendedUntil > new Date()) {
          throw new Error(
            `Your account is suspended until ${new Date(
              user.suspendedUntil
            ).toLocaleString()}.`
          );
        }

        session.user = {
          id: token.id,
          username: token.username || token.email?.split("@")[0],
          email: token.email,
          role: token.role,
          profileImg: token.profileImg,
        };
      }
      return session;
    },

    async redirect({ url, baseUrl, token }) {
      if (token?.role === "admin") {
        return routes.admin.users; // Redirect to admin users page
      } else if (token?.role === "user") {
        return routes.pages.home; // Redirect to user home page
      }
      return baseUrl; // Fallback
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
