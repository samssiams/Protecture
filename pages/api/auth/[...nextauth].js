import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password.");
        }

        const user = await prisma.user.findFirst({
          where: { username: credentials.username },
          include: { profile: true },
        });

        if (!user) {
          throw new Error("User not found.");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
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
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          username: token.username || token.email?.split("@")[0],
          email: token.email,
          profileImg: token.profileImg,
        };
      }
      return session;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
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
                  username,
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
              if (error.code === "P2002" && error.meta?.target?.includes("username")) {
                // Handle unique constraint error by modifying username
                username = `${username}_${Math.floor(Math.random() * 1000)}`;
              } else {
                throw error; // Re-throw if not a unique constraint error
              }
            }
          }
        }

        token.id = userRecord.id;
        token.username = userRecord.username;
        token.email = userRecord.email;
        token.profileImg =
          userRecord.profile?.profile_img || profile.picture || null;
      }

      return token;
    },

    async signIn({ account, profile }) {
      if (account.provider === "google" && profile) {
        try {
          const userExists = await prisma.user.findFirst({
            where: { email: profile.email },
          });

          if (!userExists) {
            let username = profile.name || profile.email.split("@")[0];

            // Ensure username uniqueness
            let isUnique = false;
            while (!isUnique) {
              try {
                await prisma.user.create({
                  data: {
                    username,
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
                if (error.code === "P2002" && error.meta?.target?.includes("username")) {
                  // Handle unique constraint error by modifying username
                  username = `${username}_${Math.floor(Math.random() * 1000)}`;
                } else {
                  throw error; // Re-throw if not a unique constraint error
                }
              }
            }
          }
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false; // Deny sign-in on error
        }
      }
      return true; // Allow sign-in
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
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
