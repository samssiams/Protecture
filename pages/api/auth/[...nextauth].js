// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import routes from "@/routes";
import prisma from "../../../lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { username, password } = credentials;
        if (!username || !password) {
          throw new Error("Username and password are required.");
        }
        // Find the user (case-insensitive)
        const user = await prisma.user.findFirst({
          where: { username: { equals: username, mode: "insensitive" } },
          include: { profile: true },
        });
        if (!user || !user.password) {
          throw new Error("Invalid username or password.");
        }
        const currentTime = new Date();
        // For credential-based logins, throw an error if suspended
        if (user.suspendedUntil && user.suspendedUntil > currentTime) {
          throw new Error(
            `Your account is suspended until ${new Date(
              user.suspendedUntil
            ).toLocaleString()}.`
          );
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid username or password.");
        }
        const normalizedRole = user.role ? user.role.toLowerCase() : "user";
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
        token.role = user.role;
        token.profileImg = user.profileImg;
      }
      if (account?.provider === "google" && profile) {
        let userRecord = await prisma.user.findFirst({
          where: { email: profile.email },
        });
        if (!userRecord) {
          let username = profile.name || profile.email.split("@")[0];
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
              isUnique = true;
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
        const normalizedRole = userRecord.role
          ? userRecord.role.toLowerCase()
          : "user";
        token.id = userRecord.id;
        token.username = userRecord.username;
        token.email = userRecord.email;
        token.role = normalizedRole;
        token.profileImg =
          userRecord.profile?.profile_img || profile.picture || null;
      }
      return token;
    },

    async session({ session, token }) {
      if (!token || !token.id) return session;
      const userId =
        typeof token.id === "string" ? parseInt(token.id, 10) : token.id;
      if (!userId || isNaN(userId)) {
        console.error("Invalid token id:", token.id);
        return session;
      }
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        session.user = {
          id: token.id,
          username: token.username || token.email?.split("@")[0],
          email: token.email,
          role: token.role,
          profileImg: token.profileImg,
        };
      } catch (error) {
        console.error("Error fetching user in session callback:", error);
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
        return routes.admin.users;
      } else if (token?.role === "user") {
        return routes.pages.home;
      }
      return baseUrl;
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
