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

        // Check if user is suspended
        const currentTime = new Date();
        if (user.suspendedUntil && user.suspendedUntil > currentTime) {
          throw new Error(
            `Your account is suspended until ${new Date(
              user.suspendedUntil
            ).toLocaleString()}.`
          );
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Incorrect password.");
        }

        console.log("Role during authorization:", user.role); // Log role
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role, // Include role
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
        const user = await prisma.user.findUnique({
          where: { id: token.id },
        });

        if (user?.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
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
          role: token.role, // Include role in session
          profileImg: token.profileImg,
        };

        console.log("Role in session:", session.user.role); // Log role
      }
      return session;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role; // Include role in token
        token.profileImg = user.profileImg;

        console.log("Role in JWT callback:", token.role); // Log role
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

        token.id = userRecord.id;
        token.username = userRecord.username;
        token.email = userRecord.email;
        token.role = userRecord.role; // Include role from database
        token.profileImg =
          userRecord.profile?.profile_img || profile.picture || null;

        console.log("Role in Google JWT:", token.role); // Log role
      }

      return token;
    },

    async redirect({ url, baseUrl, token }) {
      console.log("Role from token:", token?.role);
      if (token?.role === "admin") {
        return routes.admin.users; // Ensure this uses your routes correctly
      } else if (token?.role === "user") {
        return routes.pages.home; // User is redirected here
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
